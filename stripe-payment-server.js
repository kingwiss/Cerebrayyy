const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', customerEmail } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents (e.g., 499 for $4.99)
            currency: currency,
            metadata: {
                customerEmail: customerEmail || 'unknown',
                product: 'Cerebray Premium Subscription'
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({
            error: error.message
        });
    }
});

// Confirm payment endpoint
app.post('/confirm-payment', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Payment successful - here you would typically:
            // 1. Update user's subscription status in your database
            // 2. Send confirmation email
            // 3. Grant premium access
            
            res.send({
                success: true,
                message: 'Payment successful! Premium access granted.',
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount
                }
            });
        } else {
            res.send({
                success: false,
                message: 'Payment not completed',
                status: paymentIntent.status
            });
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).send({
            error: error.message
        });
    }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // You'll need to set this webhook secret in production
        // event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        event = JSON.parse(req.body);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Handle successful payment
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            // Handle failed payment
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.send({ status: 'OK', message: 'Stripe payment server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Stripe payment server running on port ${PORT}`);
    console.log(`💳 Ready to process payments for Cerebray Premium`);
});

module.exports = app;