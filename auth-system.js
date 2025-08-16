// Authentication System Frontend
class AuthSystem {
    constructor() {
        this.apiUrl = 'http://localhost:8000/api';
        this.token = localStorage.getItem('authToken');
        this.user = null;
        this.init();
    }

    async init() {
        this.createAuthModal();
        this.setupEventListeners();
        await this.checkAuthState();
    }

    createAuthModal() {
        const modalHTML = `
            <div id="authOverlay" class="auth-overlay">
                <div class="auth-modal">
                    <button class="auth-modal-close" id="authModalClose">&times;</button>
                    <h2>Welcome</h2>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="signin">Sign In</button>
                        <button class="auth-tab" data-tab="signup">Sign Up</button>
                    </div>
                    
                    <div class="auth-error" id="authError"></div>
                    <div class="auth-success" id="authSuccess"></div>
                    <div class="auth-loading" id="authLoading">
                        <div class="auth-spinner"></div>
                        Processing...
                    </div>
                    
                    <!-- Sign In Form -->
                    <form class="auth-form active" id="signinForm">
                        <div class="auth-form-group">
                            <label for="signinEmail">Email</label>
                            <input type="email" id="signinEmail" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="signinPassword">Password</label>
                            <input type="password" id="signinPassword" required>
                        </div>
                        <button type="submit" class="auth-submit-btn">Sign In</button>
                        <div class="auth-forgot-password">
                            <a href="#" id="forgotPasswordLink">Forgot your password?</a>
                        </div>
                    </form>
                    
                    <!-- Forgot Password Form -->
                    <form class="auth-form" id="forgotPasswordForm">
                        <div class="auth-form-group">
                            <label for="forgotEmail">Email</label>
                            <input type="email" id="forgotEmail" required placeholder="Enter your email address">
                        </div>
                        <button type="submit" class="auth-submit-btn">Send Reset Link</button>
                        <div class="auth-back-link">
                            <a href="#" id="backToSigninLink">← Back to Sign In</a>
                        </div>
                    </form>
                    
                    <!-- Sign Up Form -->
                    <form class="auth-form" id="signupForm">
                        <div class="auth-form-group">
                            <label for="signupUsername">Username</label>
                            <input type="text" id="signupUsername" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="signupEmail">Email</label>
                            <input type="email" id="signupEmail" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="signupPassword">Password</label>
                            <input type="password" id="signupPassword" required minlength="6">
                        </div>
                        <div class="auth-form-group">
                            <label for="signupPasswordConfirm">Confirm Password</label>
                            <input type="password" id="signupPasswordConfirm" required minlength="6">
                        </div>
                        <button type="submit" class="auth-submit-btn">Sign Up</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        // Modal controls
        const overlay = document.getElementById('authOverlay');
        const closeBtn = document.getElementById('authModalClose');
        const signinBtn = document.getElementById('signinBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (signinBtn) {
            signinBtn.addEventListener('click', () => this.showModal());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        closeBtn.addEventListener('click', () => this.hideModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hideModal();
        });
        
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Form submissions
        document.getElementById('signinForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignIn();
        });
        
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignUp();
        });
        
        document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
        
        // Forgot password links
        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPasswordForm();
        });
        
        document.getElementById('backToSigninLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignInForm();
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
        });
    }

    showModal() {
        document.getElementById('authOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        document.getElementById('authOverlay').classList.remove('active');
        document.body.style.overflow = '';
        this.clearMessages();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
        
        this.clearMessages();
    }

    async handleSignIn() {
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
        
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                this.showSuccess('Sign in successful!');
                setTimeout(() => {
                    this.hideModal();
                    this.updateAuthUI();
                }, 1500);
            } else {
                this.showError(data.error || 'Sign in failed');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async handleSignUp() {
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            this.showError('Passwords do not match');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                this.showSuccess('Account created successfully!');
                setTimeout(() => {
                    this.hideModal();
                    this.updateAuthUI();
                }, 1500);
            } else {
                this.showError(data.error || 'Sign up failed');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async checkAuthState() {
        if (!this.token) {
            this.updateAuthUI();
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/verify-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.logout();
        }
        
        this.updateAuthUI();
    }

    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.apiUrl}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        this.updateAuthUI();
    }

    showForgotPasswordForm() {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show forgot password form
        document.getElementById('forgotPasswordForm').classList.add('active');
        
        // Update modal title
        document.querySelector('.auth-modal h2').textContent = 'Reset Password';
        
        // Hide tabs
        document.querySelector('.auth-tabs').style.display = 'none';
        
        this.clearMessages();
    }

    showSignInForm() {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show sign in form
        document.getElementById('signinForm').classList.add('active');
        
        // Update modal title
        document.querySelector('.auth-modal h2').textContent = 'Welcome';
        
        // Show tabs
        document.querySelector('.auth-tabs').style.display = 'flex';
        
        // Reset tab states
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === 'signin');
        });
        
        this.clearMessages();
    }

    async handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value;
        
        if (!email) {
            this.showError('Please enter your email address');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiUrl}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess('Password reset link sent! Check your email.');
                // Clear the form
                document.getElementById('forgotEmail').value = '';
            } else {
                this.showError(data.error || 'Failed to send reset link');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    updateAuthUI() {
        const signinBtn = document.getElementById('signinBtn');
        const userInfo = document.getElementById('userInfo');
        const usernameDisplay = document.getElementById('usernameDisplay');
        
        if (this.user) {
            // User is signed in
            if (signinBtn) signinBtn.style.display = 'none';
            if (userInfo) {
                userInfo.classList.add('show');
                if (usernameDisplay) {
                    usernameDisplay.textContent = this.user.username;
                }
            }
        } else {
            // User is not signed in
            if (signinBtn) signinBtn.style.display = 'inline-block';
            if (userInfo) userInfo.classList.remove('show');
        }
    }

    showError(message) {
        const errorEl = document.getElementById('authError');
        errorEl.textContent = message;
        errorEl.classList.add('show');
        setTimeout(() => errorEl.classList.remove('show'), 5000);
    }

    showSuccess(message) {
        const successEl = document.getElementById('authSuccess');
        successEl.textContent = message;
        successEl.classList.add('show');
        setTimeout(() => successEl.classList.remove('show'), 5000);
    }

    showLoading() {
        document.getElementById('authLoading').classList.add('show');
    }

    hideLoading() {
        document.getElementById('authLoading').classList.remove('show');
    }

    clearMessages() {
        document.getElementById('authError').classList.remove('show');
        document.getElementById('authSuccess').classList.remove('show');
        this.hideLoading();
    }

    // Public methods for other parts of the app
    isAuthenticated() {
        return !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }
}

// Initialize authentication system when DOM is loaded
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
    window.authSystem = authSystem; // Make globally accessible
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}