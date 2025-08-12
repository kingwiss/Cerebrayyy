/**
 * Stripe Payment Integration for Cerebray Premium
 */

// Initialize Stripe with your publishable key
const stripe = Stripe('pk_live_51RbXymG32OfZ6BeqReYzIqhjytur4Ia8lwQypqB5jE8IXSmEHg9NCmNlXi7jECSAqiCHZSsAgkA14K27w9Rms0k1004uJJJ2ng');

class StripePaymentHandler {
    constructor() {
        this.elements = null;
        this.card = null;
        this.clientSecret = null;
        this.paymentIntentId = null;
        this.isProcessing = false;
    }

    async initializePayment(amount = 499, customerEmail = '') {
        try {
            // Create payment intent on the server
            const response = await fetch('http://localhost:3001/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount, // $4.99 in cents
                    currency: 'usd',
                    customerEmail: customerEmail
                }),
            });

            const { clientSecret, paymentIntentId } = await response.json();
            this.clientSecret = clientSecret;
            this.paymentIntentId = paymentIntentId;

            return { success: true, clientSecret, paymentIntentId };
        } catch (error) {
            console.error('Error initializing payment:', error);
            return { success: false, error: error.message };
        }
    }

    createPaymentForm() {
        const paymentFormHTML = `
            <div class="stripe-payment-container">
                <div class="payment-header">
                    <button type="button" class="payment-close-btn" onclick="closeStripePayment()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3><i class="fas fa-credit-card"></i> Complete Your Premium Upgrade</h3>
                    <p>Secure payment powered by Stripe</p>
                </div>
                
                <div class="payment-details">
                    <div class="price-summary">
                        <div class="price-item">
                            <span>Cerebray Premium (Monthly)</span>
                            <span class="price">$4.99</span>
                        </div>
                        <div class="price-total">
                            <span>Total</span>
                            <span class="total-price">$4.99</span>
                        </div>
                    </div>
                </div>

                <form id="payment-form" class="payment-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="your@email.com" required>
                    </div>

                    <div class="form-group">
                        <label for="card-element">Card Information</label>
                        <div id="card-element" class="stripe-card-element">
                            <!-- Stripe Elements will create form elements here -->
                        </div>
                        <div id="card-errors" class="card-errors" role="alert"></div>
                    </div>

                    <button type="submit" id="submit-payment" class="payment-submit-btn">
                        <span class="btn-text">
                            <i class="fas fa-lock"></i> Pay $4.99 Securely
                        </span>
                        <span class="btn-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i> Processing...
                        </span>
                    </button>
                </form>

                <div class="payment-security">
                    <div class="security-badges">
                        <i class="fas fa-shield-alt"></i>
                        <span>256-bit SSL encryption</span>
                    </div>
                    <div class="security-badges">
                        <i class="fab fa-cc-stripe"></i>
                        <span>Powered by Stripe</span>
                    </div>
                </div>

                <div class="payment-footer">
                    <p><small>Your payment is secure and encrypted. You can cancel anytime.</small></p>
                </div>
            </div>
        `;

        return paymentFormHTML;
    }

    async setupStripeElements() {
        if (!this.clientSecret) {
            throw new Error('Payment not initialized. Call initializePayment() first.');
        }

        // Create Stripe Elements
        this.elements = stripe.elements({
            clientSecret: this.clientSecret,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#6366f1',
                    colorBackground: '#ffffff',
                    colorText: '#30313d',
                    colorDanger: '#df1b41',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                }
            }
        });

        // Create card element
        this.card = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });

        // Mount the card element
        this.card.mount('#card-element');

        // Handle real-time validation errors from the card Element
        this.card.on('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }

    async processPayment(email) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showProcessingState();

        try {
            const {error, paymentIntent} = await stripe.confirmCardPayment(this.clientSecret, {
                payment_method: {
                    card: this.card,
                    billing_details: {
                        email: email,
                    },
                }
            });

            if (error) {
                this.showError(error.message);
                return { success: false, error: error.message };
            } else {
                // Payment succeeded
                console.log('Payment succeeded:', paymentIntent);
                
                // Confirm payment on server
                const confirmResponse = await fetch('http://localhost:3001/confirm-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id
                    }),
                });

                const confirmResult = await confirmResponse.json();
                
                if (confirmResult.success) {
                    // Payment successful - upgrade user to premium
                    this.upgradeUserToPremium(paymentIntent, email);
                    this.showSuccess();
                    return { success: true, paymentIntent };
                } else {
                    this.showError('Payment verification failed');
                    return { success: false, error: 'Payment verification failed' };
                }
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showError('An unexpected error occurred');
            return { success: false, error: error.message };
        } finally {
            this.isProcessing = false;
            this.hideProcessingState();
        }
    }

    showProcessingState() {
        const submitBtn = document.getElementById('submit-payment');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-flex';
    }

    hideProcessingState() {
        const submitBtn = document.getElementById('submit-payment');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        
        submitBtn.disabled = false;
        btnText.style.display = 'inline-flex';
        btnSpinner.style.display = 'none';
    }

    showError(message) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = message;
        errorElement.style.color = '#df1b41';
    }

    upgradeUserToPremium(paymentIntent, email) {
        try {
            // Initialize user tier manager if not already done
            if (!window.userTierManager) {
                window.userTierManager = new UserTierManager();
            }

            // Calculate subscription end date (monthly subscription)
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(startDate.getMonth() + 1);

            // Upgrade user to premium
            const subscriptionData = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                amount: paymentIntent.amount, // Amount in cents
                transactionId: paymentIntent.id,
                customerEmail: email,
                plan: 'monthly'
            };

            const upgradeSuccess = window.userTierManager.upgradeToPremium(subscriptionData);
            
            if (upgradeSuccess) {
                console.log('🌟 User successfully upgraded to Premium!');
                
                // Store premium status in localStorage for immediate access
                localStorage.setItem('cerebray_premium_status', 'active');
                localStorage.setItem('cerebray_premium_start', startDate.toISOString());
                localStorage.setItem('cerebray_premium_end', endDate.toISOString());
                
                // Trigger premium features activation
                this.activatePremiumFeatures();
            }
        } catch (error) {
            console.error('Error upgrading user to premium:', error);
        }
    }

    activatePremiumFeatures() {
        // Dispatch custom event to notify the app of premium upgrade
        const premiumEvent = new CustomEvent('premiumUpgraded', {
            detail: {
                tier: 'premium',
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(premiumEvent);
        
        // Update UI elements that show premium status
        const premiumButtons = document.querySelectorAll('.premium-toggle, #premiumToggleBtn');
        premiumButtons.forEach(btn => {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-crown" style="color: gold;"></i> Premium';
                btn.style.background = 'linear-gradient(135deg, #ffd700, #ffed4e)';
                btn.style.color = '#333';
            }
        });
    }

    showSuccess() {
        // Replace payment form with success message
        const container = document.querySelector('.stripe-payment-container');
        container.innerHTML = `
            <div class="payment-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Payment Successful!</h3>
                <p>Welcome to Cerebray Premium! Your account has been upgraded.</p>
                <div class="success-features">
                    <div class="feature-item">
                        <i class="fas fa-check"></i> Unlimited daily challenges
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check"></i> 15+ premium games
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check"></i> Ad-free experience
                    </div>
                </div>
                <button class="success-btn" onclick="closePremiumPopup()">
                    <i class="fas fa-gamepad"></i> Start Using Premium
                </button>
            </div>
        `;
        
        // Auto-close after 3 seconds and refresh the page to show premium features
        setTimeout(() => {
            if (window.premiumPopup) {
                window.premiumPopup.close();
            }
            // Refresh the page to activate premium features
            window.location.reload();
        }, 3000);
    }
}

// Global payment handler instance
window.stripePaymentHandler = new StripePaymentHandler();

// Make StripePaymentHandler available globally
window.StripePaymentHandler = StripePaymentHandler;

// Global function to close Stripe payment form
function closeStripePayment() {
    // Restore the original premium popup content
    if (window.premiumPopup) {
        window.premiumPopup.restoreOriginalContent();
    }
    
    // Reset any payment handler state if needed
    if (window.stripePaymentHandler) {
        window.stripePaymentHandler.isProcessing = false;
    }
}

// Initialize payment when needed
async function initializeStripePayment(email = '') {
    try {
        const result = await window.stripePaymentHandler.initializePayment(499, email);
        if (result.success) {
            console.log('✅ Payment initialized successfully');
            return true;
        } else {
            console.error('❌ Payment initialization failed:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Payment initialization error:', error);
        return false;
    }
}