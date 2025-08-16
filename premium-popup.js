/**
 * Premium Popup System
 * Handles premium plan comparison and payment processing
 */

class PremiumPopup {
    constructor() {
        this.isOpen = false;
        this.paymentProcessor = new PaymentProcessor();
        this.init();
    }

    init() {
        this.createPopupHTML();
        // Event listeners will be attached when popup is opened
    }

    createPopupHTML() {
        const popupHTML = `
            <div id="premiumPopupOverlay" class="premium-popup-overlay">
                <div class="premium-popup">
                    <button class="premium-popup-close" id="premiumPopupClose">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="premium-popup-header">
                        <i class="fas fa-gamepad gamepad-icon"></i>
                        <h2><i class="fas fa-gamepad"></i> Cerebray Premium</h2>
                        <p>Unlock unlimited brain training potential</p>
                    </div>
                    
                    <div class="premium-comparison">
                        <div class="plan-column basic">
                            <div class="plan-title">Basic</div>
                            <div class="plan-price">Free</div>
                            <div class="plan-period">Forever</div>
                            
                            <ul class="plan-features">
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    5 daily brain challenges
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    Basic games (Tic-Tac-Toe, Connect 4)
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    Fun facts & riddles
                                </li>
                                <li class="unavailable">
                                    <i class="fas fa-times"></i>
                                    Premium games library
                                </li>
                                <li class="unavailable">
                                    <i class="fas fa-times"></i>
                                    Unlimited daily challenges
                                </li>
                                <li class="unavailable">
                                    <i class="fas fa-times"></i>
                                    Advanced brain training
                                </li>
                                <li class="unavailable">
                                    <i class="fas fa-times"></i>
                                    Ad-free experience
                                </li>
                            </ul>
                            
                            <div class="plan-cta">
                                <button class="plan-btn basic-btn" onclick="premiumPopup.close()">
                                    Continue with Basic
                                </button>
                            </div>
                        </div>
                        
                        <div class="plan-column premium">
                            <div class="plan-title">Premium</div>
                            <div class="plan-price">$4.99</div>
                            <div class="plan-period">per month</div>
                            
                            <ul class="plan-features">
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    Unlimited daily challenges
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    15+ premium games
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    Advanced brain training
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    Sudoku, Crossword, Tetris & more
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    Ad-free experience
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    Priority customer support
                                </li>
                                <li class="available">
                                    <i class="fas fa-check"></i>
                                    New content weekly
                                </li>
                            </ul>
                            
                            <div class="plan-cta">
                                <button class="plan-btn premium-btn" onclick="premiumPopup.startPayment()">
                                    Upgrade to Premium
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="premium-benefits">
                        <h3>Why Choose Premium?</h3>
                        <div class="benefits-grid">
                            <div class="benefit-item">
                                <i class="fas fa-brain"></i>
                                <h4>Enhanced Cognition</h4>
                                <p>Advanced exercises designed by neuroscientists</p>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-gamepad"></i>
                                <h4>Premium Games</h4>
                                <p>Classic games like Tetris, Pac-Man, and Sudoku</p>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-infinity"></i>
                                <h4>Unlimited Access</h4>
                                <p>No daily limits - train your brain anytime</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-processing" id="paymentProcessing">
                        <div class="spinner"></div>
                        <h3>Processing your payment...</h3>
                        <p>Please wait while we set up your premium account.</p>
                    </div>
                </div>
            </div>
        `;

        // Add to body if not already present
        if (!document.getElementById('premiumPopupOverlay')) {
            document.body.insertAdjacentHTML('beforeend', popupHTML);
        }
    }

    attachEventListeners() {
        // Remove any existing listeners first
        this.removeEventListeners();
        
        // Close button
        const closeBtn = document.getElementById('premiumPopupClose');
        if (closeBtn) {
            this.closeBtnHandler = () => this.close();
            closeBtn.addEventListener('click', this.closeBtnHandler);
        }

        // Overlay click to close
        const overlay = document.getElementById('premiumPopupOverlay');
        if (overlay) {
            this.overlayClickHandler = (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            };
            overlay.addEventListener('click', this.overlayClickHandler);
        }

        // Escape key to close
        this.escapeKeyHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this.escapeKeyHandler);
    }

    removeEventListeners() {
        // Remove close button listener
        const closeBtn = document.getElementById('premiumPopupClose');
        if (closeBtn && this.closeBtnHandler) {
            closeBtn.removeEventListener('click', this.closeBtnHandler);
        }

        // Remove overlay listener
        const overlay = document.getElementById('premiumPopupOverlay');
        if (overlay && this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
        }

        // Remove escape key listener
        if (this.escapeKeyHandler) {
            document.removeEventListener('keydown', this.escapeKeyHandler);
        }
    }

    open() {
        const overlay = document.getElementById('premiumPopupOverlay');
        if (overlay) {
            overlay.classList.add('active');
            this.isOpen = true;
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Attach event listeners now that the popup is in the DOM
            this.attachEventListeners();
            
            // Track popup open event
            this.trackEvent('premium_popup_opened');
        }
    }

    close() {
        const overlay = document.getElementById('premiumPopupOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.isOpen = false;
            document.body.style.overflow = ''; // Restore scrolling
            
            // Clean up event listeners
            this.removeEventListeners();
            
            // Hide payment processing if visible
            const paymentProcessing = document.getElementById('paymentProcessing');
            if (paymentProcessing) {
                paymentProcessing.classList.remove('active');
            }
            
            // Track popup close event
            this.trackEvent('premium_popup_closed');
        }
    }

    async startPayment() {
        try {
            // Track payment initiation
            this.trackEvent('premium_payment_initiated');
            
            // Redirect to real Stripe payment page
            console.log('🚀 Redirecting to Stripe payment page...');
            window.location.href = 'payment.html';
            
        } catch (error) {
            console.error('Payment redirect error:', error);
            this.handleFailedPayment('Failed to redirect to payment page');
        }
    }

    async handleSuccessfulPayment(paymentResult) {
        try {
            // Upgrade user to premium
            if (window.app && window.app.tierManager) {
                await window.app.tierManager.upgradeToPremium({
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    amount: 4.99,
                    transactionId: paymentResult.transactionId
                });
                
                // Update app premium mode
                window.app.isPremiumMode = true;
                localStorage.setItem('premiumMode', 'true');
                
                // Update UI
                await window.app.updatePremiumUI();
                await window.app.generateCards();
            }

            // Track successful payment
            this.trackEvent('premium_payment_success', {
                amount: 4.99,
                transactionId: paymentResult.transactionId
            });

            // Show success message
            this.showSuccessMessage();
            
            // Close popup after delay
            setTimeout(() => {
                this.close();
            }, 3000);

        } catch (error) {
            console.error('Error handling successful payment:', error);
            this.handleFailedPayment('Failed to activate premium features');
        }
    }

    handleFailedPayment(errorMessage) {
        // Hide payment processing
        const paymentProcessing = document.getElementById('paymentProcessing');
        if (paymentProcessing) {
            paymentProcessing.classList.remove('active');
        }

        // Track failed payment
        this.trackEvent('premium_payment_failed', {
            error: errorMessage
        });

        // Show error message
        this.showErrorMessage(errorMessage);
    }

    showSuccessMessage() {
        const paymentProcessing = document.getElementById('paymentProcessing');
        if (paymentProcessing) {
            paymentProcessing.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-check-circle" style="font-size: 3em; color: #28a745; margin-bottom: 20px;"></i>
                    <h3 style="color: #28a745;">Welcome to Premium! 🎉</h3>
                    <p>Your premium features are now active. Enjoy unlimited brain training!</p>
                </div>
            `;
        }
    }

    showErrorMessage(errorMessage) {
        const paymentProcessing = document.getElementById('paymentProcessing');
        if (paymentProcessing) {
            paymentProcessing.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3em; color: #dc3545; margin-bottom: 20px;"></i>
                    <h3 style="color: #dc3545;">Payment Failed</h3>
                    <p>${errorMessage}</p>
                    <button class="plan-btn premium-btn" onclick="premiumPopup.startPayment()" style="margin-top: 15px;">
                        Try Again
                    </button>
                </div>
            `;
            paymentProcessing.classList.add('active');
        }
    }

    trackEvent(eventName, data = {}) {
        // Analytics tracking (replace with your analytics service)
        console.log('📊 Premium Event:', eventName, data);
        
        // Example: Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'premium',
                ...data
            });
        }
    }
}

/**
 * Payment Processor
 * Handles payment gateway integration
 */
class PaymentProcessor {
    constructor() {
        this.apiEndpoint = '/api/payments'; // Replace with your payment API
    }

    async processPayment(paymentData) {
        // Simulate payment processing for demo
        // Replace this with real payment gateway integration (Stripe, PayPal, etc.)
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 90% success rate for demo
                const success = Math.random() > 0.1;
                
                if (success) {
                    resolve({
                        success: true,
                        transactionId: 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        amount: paymentData.amount,
                        currency: paymentData.currency,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Payment declined. Please try a different payment method.'
                    });
                }
            }, 2000); // Simulate 2 second processing time
        });
    }

    // Real payment gateway integration example (Stripe)
    async processStripePayment(paymentData) {
        try {
            const response = await fetch(this.apiEndpoint + '/stripe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            throw new Error('Payment processing failed: ' + error.message);
        }
    }

    // PayPal integration example
    async processPayPalPayment(paymentData) {
        try {
            const response = await fetch(this.apiEndpoint + '/paypal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            throw new Error('PayPal processing failed: ' + error.message);
        }
    }
}

// Initialize premium popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.premiumPopup = new PremiumPopup();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PremiumPopup, PaymentProcessor };
}