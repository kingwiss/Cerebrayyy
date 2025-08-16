/**
 * Stripe Payment Processing - Complete Implementation
 * Handles individual card elements and payment processing
 */

class StripePaymentProcessor {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.cardNumber = null;
        this.initializeStripe();
    }

    async initializeStripe() {
        try {
            const response = await fetch('/api/stripe-config');
            const config = await response.json();
            this.stripe = Stripe(config.publishableKey);
        } catch (error) {
            console.error('Failed to load Stripe configuration:', error);
            // Fallback to hardcoded key if server is unavailable
            this.stripe = Stripe('pk_live_51RbXymG32OfZ6BeqvQJGxKzP4uJJJ2ng');
        }
        this.cardExpiry = null;
        this.cardCvc = null;
        this.clientSecret = null;
        this.isProcessing = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🔄 Initializing Stripe payment processor...');
            
            // Wait for Stripe to be initialized
            await this.waitForStripe();
            
            // Setup Stripe Elements
            this.setupElements();
            
            // Setup form submission
            this.setupFormSubmission();
            
            // Get user email from URL params if available
            this.populateEmailFromURL();
            
            console.log('✅ Stripe payment processor initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing payment processor:', error);
            this.showError('Failed to initialize payment system. Please refresh the page.');
        }
    }

    async waitForStripe() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!this.stripe && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!this.stripe) {
            throw new Error('Stripe failed to initialize');
        }
    }
    
    setupElements() {
        // Create Elements instance with custom styling
        this.elements = this.stripe.elements({
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#667eea',
                    colorBackground: '#ffffff',
                    colorText: '#333333',
                    colorDanger: '#dc3545',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                    focusBoxShadow: '0px 0px 0px 2px rgba(102, 126, 234, 0.2)',
                }
            }
        });
        
        // Create individual card elements
        this.cardNumber = this.elements.create('cardNumber', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#333',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#dc3545',
                },
            },
            placeholder: '1234 1234 1234 1234'
        });
        
        this.cardExpiry = this.elements.create('cardExpiry', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#333',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#dc3545',
                },
            },
            placeholder: 'MM / YY'
        });
        
        this.cardCvc = this.elements.create('cardCvc', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#333',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#dc3545',
                },
            },
            placeholder: '123'
        });
        
        // Mount elements to DOM
        this.cardNumber.mount('#card-number');
        this.cardExpiry.mount('#card-expiry');
        this.cardCvc.mount('#card-cvc');
        
        // Setup error handling for each element
        this.cardNumber.on('change', (event) => {
            this.handleElementChange(event, 'card-number-errors');
        });
        
        this.cardExpiry.on('change', (event) => {
            this.handleElementChange(event, 'card-expiry-errors');
        });
        
        this.cardCvc.on('change', (event) => {
            this.handleElementChange(event, 'card-cvc-errors');
        });
        
        console.log('✅ Stripe Elements created and mounted');
    }
    
    handleElementChange(event, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        if (event.error) {
            errorElement.textContent = event.error.message;
        } else {
            errorElement.textContent = '';
        }
    }
    
    populateEmailFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        if (email) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = email;
            }
        }
    }
    
    setupFormSubmission() {
        const form = document.getElementById('payment-form');
        if (!form) {
            console.error('❌ Payment form not found');
            return;
        }
        
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            if (this.isProcessing) {
                console.log('⏳ Payment already in progress');
                return;
            }
            
            await this.processPayment();
        });
    }
    
    async processPayment() {
        try {
            this.isProcessing = true;
            this.showProcessingState();
            this.clearMessages();
            
            // Validate form data
            const formData = this.validateForm();
            if (!formData) {
                return;
            }
            
            console.log('🔄 Creating subscription...');
            
            // Create subscription
            const subscription = await this.createSubscription(formData);
            if (!subscription) {
                return;
            }
            
            console.log('🔄 Confirming subscription payment...');
            
            // Confirm payment with card
            const result = await this.stripe.confirmCardPayment(subscription.clientSecret, {
                payment_method: {
                    card: this.cardNumber,
                    billing_details: {
                        name: formData.email,
                        email: formData.email,
                        address: {
                            postal_code: formData.postalCode
                        }
                    },
                }
            });
            
            if (result.error) {
                console.error('❌ Subscription payment failed:', result.error);
                this.showError(result.error.message);
            } else {
                console.log('✅ Subscription payment succeeded:', result.paymentIntent);
                await this.handleSubscriptionSuccess(subscription.subscriptionId, formData.email);
            }
            
        } catch (error) {
            console.error('❌ Payment processing error:', error);
            this.showError('Payment processing failed. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideProcessingState();
        }
    }
    
    validateForm() {
        const email = document.getElementById('email')?.value?.trim();
        const postalCode = document.getElementById('postal-code')?.value?.trim();
        
        if (!email) {
            this.showError('Please enter your email address.');
            document.getElementById('email')?.focus();
            return null;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address.');
            document.getElementById('email')?.focus();
            return null;
        }
        
        if (!postalCode) {
            this.showError('Please enter your postal code.');
            document.getElementById('postal-code')?.focus();
            return null;
        }
        
        return { email, postalCode };
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async createSubscription(formData) {
        try {
            const response = await fetch('http://localhost:3001/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerEmail: formData.email,
                    priceId: 'price_1RbY8NG32OfZ6BeqvQJGxKzP' // Monthly recurring price ID
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.clientSecret) {
                throw new Error('No client secret received from server');
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Error creating subscription:', error);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                this.showError('Unable to connect to payment server. Please check if the server is running.');
            } else {
                this.showError('Subscription initialization failed. Please try again.');
            }
            
            return null;
        }
    }
    
    async handleSubscriptionSuccess(subscriptionId, email) {
        try {
            // Confirm subscription status with server
            const response = await fetch('http://localhost:3001/confirm-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscriptionId: subscriptionId
                }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store premium access in localStorage
                this.upgradeUserToPremium(email, subscriptionId, result.subscription);
                
                // Show success message
                this.showSuccess();
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                this.showError('Subscription confirmation failed. Please contact support.');
            }
        } catch (error) {
            console.error('❌ Error confirming subscription:', error);
            this.showError('Subscription confirmation failed. Please contact support.');
        }
    }
    
    upgradeUserToPremium(email, subscriptionId, subscriptionData) {
        try {
            const premiumData = {
                status: 'active',
                email: email,
                subscriptionId: subscriptionId,
                startDate: new Date(subscriptionData.current_period_start * 1000).toISOString(),
                endDate: new Date(subscriptionData.current_period_end * 1000).toISOString(),
                plan: 'monthly',
                amount: 4.99,
                recurring: true
            };
            
            // Store in localStorage
            localStorage.setItem('premiumMode', 'true');
            localStorage.setItem('premiumData', JSON.stringify(premiumData));
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('premiumActivated', {
                detail: premiumData
            }));
            
            console.log('✅ User upgraded to premium subscription:', premiumData);
            
        } catch (error) {
            console.error('❌ Error upgrading user to premium:', error);
        }
    }
    
    showProcessingState() {
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            submitButton.textContent = 'Processing...';
        }
    }
    
    hideProcessingState() {
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.innerHTML = '<span class="lock-icon">🔒</span>PAY $4.99 SECURELY';
        }
    }
    
    showError(message) {
        const errorElement = document.getElementById('payment-errors');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // Hide success message if shown
        const successElement = document.getElementById('payment-success');
        if (successElement) {
            successElement.style.display = 'none';
        }
    }
    
    showSuccess() {
        const successElement = document.getElementById('payment-success');
        if (successElement) {
            successElement.innerHTML = '✅ Payment successful! Welcome to Cerebray Premium. Redirecting...';
            successElement.classList.add('show');
            successElement.style.display = 'block';
        }
        
        // Hide error message if shown
        const errorElement = document.getElementById('payment-errors');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    clearMessages() {
        const errorElement = document.getElementById('payment-errors');
        const successElement = document.getElementById('payment-success');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (successElement) {
            successElement.textContent = '';
            successElement.style.display = 'none';
        }
    }
}

// Initialize payment processor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with payment form elements
    const paymentForm = document.getElementById('payment-form');
    const cardNumberElement = document.getElementById('card-number');
    
    if (paymentForm && cardNumberElement) {
        console.log('🚀 Initializing Stripe Payment System...');
        new StripePaymentProcessor();
    } else {
        console.log('ℹ️ Stripe payment elements not found - skipping initialization');
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StripePaymentProcessor;
}