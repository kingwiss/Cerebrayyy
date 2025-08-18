// Authentication System Frontend
import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class AuthSystem {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = null;
        this.init();
        this.initializeAuthListener();
    }

    // Initialize Firebase auth state listener
    initializeAuthListener() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.user = {
                    uid: user.uid,
                    email: user.email,
                    username: user.displayName || user.email.split('@')[0]
                };
                console.log('User signed in:', user.email);
            } else {
                this.user = null;
                console.log('User signed out');
            }
            this.updateAuthUI();
        });
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
        
        console.log('Setting up event listeners...');
        console.log('signinBtn found:', !!signinBtn);
        console.log('logoutBtn found:', !!logoutBtn);
        
        if (signinBtn) {
            signinBtn.addEventListener('click', () => {
                console.log('Sign in button clicked!');
                this.showModal();
            });
            console.log('Sign in event listener attached');
        } else {
            console.error('signinBtn not found!');
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            this.showSuccess('Sign in successful!');
            setTimeout(() => {
                this.hideModal();
            }, 1500);
        } catch (error) {
            console.error('Sign in error:', error);
            let errorMessage = 'Sign in failed';
            
            // Provide user-friendly error messages
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showError(errorMessage);
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Note: Firebase doesn't store username by default
            // You can update the user profile if needed
            // await updateProfile(user, { displayName: username });
            
            this.showSuccess('Account created successfully!');
            setTimeout(() => {
                this.hideModal();
            }, 1500);
        } catch (error) {
            console.error('Sign up error:', error);
            let errorMessage = 'Sign up failed';
            
            // Provide user-friendly error messages
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showError(errorMessage);
        } finally {
            this.hideLoading();
        }
    }

    async checkAuthState() {
        // Firebase handles auth state automatically through onAuthStateChanged
        // This method is kept for compatibility but Firebase manages the state
        this.updateAuthUI();
    }

    async logout() {
        try {
            await signOut(auth);
            // The auth state listener will automatically update user state
            this.token = null;
            localStorage.removeItem('authToken');
        } catch (error) {
            console.error('Logout error:', error);
        }
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
    console.log('DOM loaded, initializing AuthSystem...');
    try {
        authSystem = new AuthSystem();
        window.authSystem = authSystem; // Make globally accessible
        console.log('AuthSystem initialized successfully');
    } catch (error) {
        console.error('Error initializing AuthSystem:', error);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}