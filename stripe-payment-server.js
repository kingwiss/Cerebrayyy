const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.STRIPE_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create subscription endpoint
app.post('/create-subscription', async (req, res) => {
    try {
        const { customerEmail, priceId = 'price_1RbY8NG32OfZ6BeqvQJGxKzP' } = req.body;

        console.log(`Creating subscription for ${customerEmail}`);

        // Create or retrieve customer
        let customer;
        if (customerEmail) {
            const existingCustomers = await stripe.customers.list({
                email: customerEmail,
                limit: 1
            });

            if (existingCustomers.data.length > 0) {
                customer = existingCustomers.data[0];
                console.log('Found existing customer:', customer.id);
            } else {
                customer = await stripe.customers.create({
                    email: customerEmail,
                    metadata: {
                        product: 'Cerebray Premium'
                    }
                });
                console.log('Created new customer:', customer.id);
            }
        } else {
            return res.status(400).send({ error: 'Customer email is required' });
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                price: priceId, // Monthly recurring price
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                product: 'Cerebray Premium',
                email: customerEmail
            }
        });

        console.log('Subscription created:', subscription.id);

        res.send({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            customerId: customer.id
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).send({
            error: error.message
        });
    }
});

// Confirm subscription endpoint
app.post('/confirm-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        // Retrieve the subscription to check its status
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice.payment_intent', 'customer']
        });
        
        if (subscription.status === 'active') {
            // Subscription is active - premium access granted
            console.log('Subscription confirmed successfully:', subscriptionId);
            
            res.send({
                success: true,
                message: 'Subscription successful! Premium access granted.',
                subscription: {
                    id: subscription.id,
                    status: subscription.status,
                    current_period_start: subscription.current_period_start,
                    current_period_end: subscription.current_period_end,
                    customer_email: subscription.customer.email
                }
            });
        } else if (subscription.status === 'incomplete') {
            // Subscription requires payment confirmation
            res.send({
                success: false,
                message: 'Subscription requires payment confirmation',
                status: subscription.status,
                requires_action: true,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret
            });
        } else {
            res.send({
                success: false,
                message: 'Subscription not completed',
                status: subscription.status
            });
        }
    } catch (error) {
        console.error('Error confirming subscription:', error);
        res.status(500).send({
            error: error.message
        });
    }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // In production, uncomment this line and set STRIPE_WEBHOOK_SECRET
        // event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        event = JSON.parse(req.body);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🔔 Received webhook: ${event.type}`);

    // Handle the event
    try {
        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                const customerEmail = event.data.object.customer_email;
                if (customerEmail) {
                    try {
                        await fetch('http://localhost:8000/api/user/upgrade', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: customerEmail })
                        });
                        console.log(`Upgraded user ${customerEmail} to premium.`);
                    } catch (error) {
                        console.error(`Failed to upgrade user ${customerEmail}:`, error);
                    }
                }
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
    } catch (error) {
        console.error(`❌ Error handling webhook ${event.type}:`, error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }

    res.json({received: true});
});

// Webhook handler functions
async function handleSubscriptionCreated(subscription) {
    console.log('✅ Subscription created:', subscription.id);
    
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    // Store subscription data for premium access
    const subscriptionData = {
        subscriptionId: subscription.id,
        customerId: customer.id,
        customerEmail: customer.email,
        status: subscription.status,
        startDate: new Date(subscription.current_period_start * 1000).toISOString(),
        endDate: new Date(subscription.current_period_end * 1000).toISOString(),
        plan: 'monthly',
        amount: 4.99
    };
    
    console.log('📝 Subscription data stored:', subscriptionData);
}

async function handleSubscriptionUpdated(subscription) {
    console.log('🔄 Subscription updated:', subscription.id);
    
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    if (subscription.status === 'active') {
        console.log('✅ Subscription reactivated for:', customer.email);
        // Premium access should be granted
    } else if (subscription.status === 'past_due') {
        console.log('⚠️ Subscription past due for:', customer.email);
        // Consider grace period or immediate revocation
    } else if (subscription.status === 'canceled') {
        console.log('❌ Subscription canceled for:', customer.email);
        // Revoke premium access
    }
}

async function handleSubscriptionDeleted(subscription) {
    console.log('🗑️ Subscription deleted:', subscription.id);
    
    const customer = await stripe.customers.retrieve(subscription.customer);
    console.log('❌ Premium access revoked for:', customer.email);
    
    // In a real application, you would update your database here
    // to revoke premium access for this customer
}

async function handlePaymentSucceeded(invoice) {
    console.log('💰 Payment succeeded for invoice:', invoice.id);
    
    if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        console.log('✅ Recurring payment successful for:', customer.email);
        console.log('📅 Next billing date:', new Date(subscription.current_period_end * 1000).toISOString());
        
        // Ensure premium access is active
    }
}

async function handlePaymentFailed(invoice) {
    console.log('❌ Payment failed for invoice:', invoice.id);
    
    if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        console.log('⚠️ Payment failed for:', customer.email);
        console.log('📊 Subscription status:', subscription.status);
        
        // Handle failed payment - might need to revoke access or send notification
    }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
    console.log('✅ Payment intent succeeded:', paymentIntent.id);
    
    // This handles one-time payments or initial subscription payments
    if (paymentIntent.customer) {
        const customer = await stripe.customers.retrieve(paymentIntent.customer);
        console.log('💳 Payment successful for:', customer.email);
    }
}

async function handlePaymentIntentFailed(paymentIntent) {
    console.log('❌ Payment intent failed:', paymentIntent.id);
    
    if (paymentIntent.customer) {
        const customer = await stripe.customers.retrieve(paymentIntent.customer);
        console.log('💔 Payment failed for:', customer.email);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.send({ status: 'OK', message: 'Stripe payment server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Stripe payment server running on port ${PORT}`);
    console.log(`💳 Ready to process payments for Cerebray Premium`);
});

module.exports = app;