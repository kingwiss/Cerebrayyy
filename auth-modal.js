// Enhanced Authentication Modal System
class AuthModal {
    constructor() {
        this.modal = null;
        this.currentTab = 'login';
        this.isLoading = false;
        this.appwrite = {
            client: null,
            account: null
        };
        
        this.init();
    }

    init() {
        this.initializeAppwrite();
        this.createModal();
        this.setupEventListeners();
    }

    initializeAppwrite() {
        try {
            this.appwrite.client = new Appwrite.Client()
                .setEndpoint('https://nyc.cloud.appwrite.io/v1')
                .setProject('68930d9a002e313013dc');
            
            this.appwrite.account = new Appwrite.Account(this.appwrite.client);
            console.log('✅ Appwrite initialized for auth modal');
        } catch (error) {
            console.error('❌ Failed to initialize Appwrite:', error);
        }
    }

    createModal() {
        const modalHTML = `
            <div id="authModal" class="auth-modal">
                <div class="auth-modal-content">
                    <span class="auth-close" id="authModalClose">&times;</span>
                    
                    <div class="auth-modal-header">
                        <h2 id="authModalTitle">Welcome Back!</h2>
                        <p id="authModalSubtitle">Sign in to your account to continue</p>
                    </div>
                    
                    <div class="auth-modal-body">
                        <!-- Tab Navigation -->
                        <div class="auth-tabs">
                            <button class="auth-tab active" data-tab="login">Sign In</button>
                            <button class="auth-tab" data-tab="signup">Sign Up</button>
                        </div>

                        <!-- Message Area -->
                        <div id="authMessage" class="auth-message" style="display: none;"></div>

                        <!-- Login Form -->
                        <form id="loginForm" class="auth-form active">
                            <div class="form-group">
                                <label for="loginEmail">Email Address</label>
                                <input type="email" id="loginEmail" name="email" placeholder="Enter your email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="loginPassword">Password</label>
                                <div class="password-field">
                                    <input type="password" id="loginPassword" name="password" placeholder="Enter your password" required>
                                    <button type="button" class="password-toggle" data-target="loginPassword">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <button type="submit" class="auth-btn auth-btn-primary" id="loginBtn">
                                <i class="fas fa-sign-in-alt"></i>
                                Sign In
                            </button>

                            <div class="forgot-password">
                                <a href="#" id="forgotPasswordLink">Forgot your password?</a>
                            </div>
                        </form>

                        <!-- Signup Form -->
                        <form id="signupForm" class="auth-form">
                            <div class="form-group">
                                <label for="signupName">Full Name</label>
                                <input type="text" id="signupName" name="name" placeholder="Enter your full name" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="signupEmail">Email Address</label>
                                <input type="email" id="signupEmail" name="email" placeholder="Enter your email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="signupPassword">Password</label>
                                <div class="password-field">
                                    <input type="password" id="signupPassword" name="password" placeholder="Create a password (min. 8 characters)" required minlength="8">
                                    <button type="button" class="password-toggle" data-target="signupPassword">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password</label>
                                <div class="password-field">
                                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required>
                                    <button type="button" class="password-toggle" data-target="confirmPassword">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <button type="submit" class="auth-btn auth-btn-primary" id="signupBtn">
                                <i class="fas fa-user-plus"></i>
                                Create Account
                            </button>
                        </form>

                        <!-- Password Reset Form -->
                        <form id="resetForm" class="auth-form">
                            <div class="form-group">
                                <label for="resetEmail">Email Address</label>
                                <input type="email" id="resetEmail" name="email" placeholder="Enter your email address" required>
                            </div>

                            <button type="submit" class="auth-btn auth-btn-primary" id="resetBtn">
                                <i class="fas fa-paper-plane"></i>
                                Send Reset Email
                            </button>

                            <div class="forgot-password">
                                <a href="#" id="backToLoginLink">Back to Sign In</a>
                            </div>
                        </form>

                        <!-- Divider -->
                        <div class="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <!-- Google Sign In -->
                        <button type="button" class="auth-btn auth-btn-google" id="googleSignInBtn">
                            <i class="fab fa-google"></i>
                            Continue with Google
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('authModal');
    }

    setupEventListeners() {
        // Close modal
        document.getElementById('authModalClose').addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => this.togglePassword(toggle));
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('resetForm').addEventListener('submit', (e) => this.handlePasswordReset(e));

        // Navigation links
        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPasswordReset();
        });

        document.getElementById('backToLoginLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('login');
        });

        // Google Sign In
        const googleSignInBtn = document.getElementById('googleSignInBtn');
        console.log('🔧 Setting up Google sign-in event listener on element:', googleSignInBtn);
        console.log('🔧 Element parent:', googleSignInBtn?.parentElement);
        console.log('🔧 Element innerHTML:', googleSignInBtn?.innerHTML);
        
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', () => this.handleGoogleSignIn());
            console.log('✅ Google sign-in event listener attached');
        } else {
            console.error('❌ googleSignInBtn element not found');
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.close();
            }
        });
    }

    open(tab = 'login') {
        this.modal.style.display = 'block';
        this.switchTab(tab);
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('.auth-form.active input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.clearMessages();
        this.resetForms();
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update forms
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        // Update header
        const title = document.getElementById('authModalTitle');
        const subtitle = document.getElementById('authModalSubtitle');
        
        switch(tab) {
            case 'login':
                document.getElementById('loginForm').classList.add('active');
                title.textContent = 'Welcome Back!';
                subtitle.textContent = 'Sign in to your account to continue';
                break;
            case 'signup':
                document.getElementById('signupForm').classList.add('active');
                title.textContent = 'Create Account';
                subtitle.textContent = 'Join us and start your journey';
                break;
        }
        
        this.clearMessages();
    }

    showPasswordReset() {
        // Hide tabs and show reset form
        document.querySelector('.auth-tabs').style.display = 'none';
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById('resetForm').classList.add('active');
        
        // Update header
        document.getElementById('authModalTitle').textContent = 'Reset Password';
        document.getElementById('authModalSubtitle').textContent = 'Enter your email to receive reset instructions';
        
        this.clearMessages();
    }

    togglePassword(button) {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        this.setLoading(true, 'loginBtn');
        this.clearMessages();
        
        try {
            // Create email session
            const session = await this.appwrite.account.createEmailSession(email, password);
            console.log('✅ Login successful:', session);
            
            // Get user info
            const user = await this.appwrite.account.get();
            
            // Handle successful login
            this.handleAuthSuccess(user);
            this.showMessage('Successfully signed in!', 'success');
            
            setTimeout(() => {
                this.close();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoading(false, 'loginBtn');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 8) {
            this.showMessage('Password must be at least 8 characters long', 'error');
            return;
        }
        
        this.setLoading(true, 'signupBtn');
        this.clearMessages();
        
        try {
            // Create account
            const userId = 'unique()';
            const account = await this.appwrite.account.create(userId, email, password, name);
            console.log('✅ Account created:', account);
            
            // Automatically sign in after signup
            const session = await this.appwrite.account.createEmailSession(email, password);
            console.log('✅ Auto-login successful:', session);
            
            // Get user info
            const user = await this.appwrite.account.get();
            
            // Handle successful signup
            this.handleAuthSuccess(user);
            this.showMessage('Account created successfully! Welcome!', 'success');
            
            setTimeout(() => {
                this.close();
            }, 1500);
            
        } catch (error) {
            console.error('❌ Signup error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoading(false, 'signupBtn');
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email) {
            this.showMessage('Please enter your email address', 'error');
            return;
        }
        
        this.setLoading(true, 'resetBtn');
        this.clearMessages();
        
        try {
            // Create password recovery
            const resetUrl = `${window.location.origin}/reset-password.html`;
            console.log('🔄 Sending password reset email to:', email);
            console.log('🔄 Reset URL:', resetUrl);
            
            const result = await this.appwrite.account.createRecovery(email, resetUrl);
            console.log('✅ Password reset request successful:', result);
            
            this.showMessage('Password reset email sent! Check your inbox and spam folder.', 'success');
            
            setTimeout(() => {
                this.switchTab('login');
                document.querySelector('.auth-tabs').style.display = 'flex';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Password reset error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response
            });
            
            // Check for specific email configuration errors
            if (error.code === 'general_smtp_disabled' || error.message?.includes('SMTP')) {
                this.showMessage('Email service not configured. Please contact support.', 'error');
            } else {
                this.showMessage(this.getErrorMessage(error), 'error');
            }
        } finally {
            this.setLoading(false, 'resetBtn');
        }
    }

    async handleGoogleSignIn() {
        if (this.isLoading) return;
        
        console.log('🔄 Google sign-in button clicked!');
        console.log('🔄 Called from:', new Error().stack);
        
        // Check if Appwrite is properly initialized
        if (!this.appwrite.account) {
            console.error('❌ Appwrite account not initialized');
            this.showMessage('Authentication service not available. Please refresh the page.', 'error');
            return;
        }
        
        this.setLoading(true, 'googleSignInBtn');
        
        try {
            console.log('🔄 Starting Google OAuth popup...');
            
            // Show loading message
            this.showMessage('Opening Google sign-in...', 'info');
            
            // Create a popup window for Google OAuth
            const popup = window.open('', 'googleSignIn', 'width=500,height=600,scrollbars=yes,resizable=yes');
            
            if (!popup) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            // Get OAuth URL from Appwrite
            const currentUrl = window.location.href.split('?')[0];
            const oauthUrl = `${this.appwrite.client.config.endpoint}/account/sessions/oauth2/google?project=${this.appwrite.client.config.project}&success=${encodeURIComponent(currentUrl)}&failure=${encodeURIComponent(currentUrl)}`;
            
            console.log('📍 OAuth URL:', oauthUrl);
            
            // Navigate popup to OAuth URL
            popup.location.href = oauthUrl;
            
            // Monitor popup for completion
            const checkClosed = setInterval(async () => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    console.log('🔄 Popup closed, checking authentication...');
                    
                    try {
                        // Check if user is now authenticated
                        const user = await this.appwrite.account.get();
                        console.log('✅ Google sign-in successful:', user);
                        
                        // Handle successful authentication
                        this.handleAuthSuccess(user);
                        this.showMessage('Successfully signed in with Google!', 'success');
                        
                        setTimeout(() => {
                            this.close();
                        }, 1000);
                        
                    } catch (error) {
                        console.log('ℹ️ User not authenticated after popup closed');
                        this.showMessage('Google sign-in was cancelled or failed.', 'error');
                    } finally {
                        this.setLoading(false, 'googleSignInBtn');
                    }
                }
            }, 1000);
            
            // Timeout after 5 minutes
            setTimeout(() => {
                if (!popup.closed) {
                    popup.close();
                    clearInterval(checkClosed);
                    this.showMessage('Google sign-in timed out. Please try again.', 'error');
                    this.setLoading(false, 'googleSignInBtn');
                }
            }, 300000);
            
        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response
            });
            
            this.showMessage(error.message || 'Failed to sign in with Google. Please try again.', 'error');
            this.setLoading(false, 'googleSignInBtn');
        }
    }

    handleAuthSuccess(user) {
        // Update global auth state
        if (typeof blogAppwrite !== 'undefined') {
            blogAppwrite.currentUser = {
                id: user.$id,
                name: user.name,
                email: user.email,
                imageUrl: user.prefs?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4ecdc4&color=fff`
            };
            blogAppwrite.isSignedIn = true;
            
            // Save to localStorage
            localStorage.setItem('appwrite_auth_state', JSON.stringify({
                currentUser: blogAppwrite.currentUser,
                isSignedIn: blogAppwrite.isSignedIn,
                timestamp: Date.now()
            }));
            
            // Update UI
            if (typeof updateBlogUI === 'function') {
                updateBlogUI();
            }
        }
        
        // Update main app auth state if available
        if (typeof app !== 'undefined' && app.handleSignInSuccess) {
            app.handleSignInSuccess(user);
        }
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user, isSignedIn: true }
        }));
    }

    setLoading(loading, buttonId) {
        this.isLoading = loading;
        const button = document.getElementById(buttonId);
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.clearMessages();
            }, 3000);
        }
    }

    clearMessages() {
        const messageEl = document.getElementById('authMessage');
        messageEl.style.display = 'none';
        messageEl.textContent = '';
    }

    resetForms() {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.reset();
        });
        
        // Reset password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            const targetId = toggle.dataset.target;
            const input = document.getElementById(targetId);
            const icon = toggle.querySelector('i');
            
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        });
        
        // Reset tabs display
        document.querySelector('.auth-tabs').style.display = 'flex';
    }

    getErrorMessage(error) {
        const errorMessages = {
            'user_invalid_credentials': 'Invalid email or password. Please try again.',
            'user_already_exists': 'An account with this email already exists.',
            'user_not_found': 'No account found with this email address.',
            'password_recently_used': 'This password was recently used. Please choose a different one.',
            'password_personal_data': 'Password cannot contain personal information.',
            'general_argument_invalid': 'Please check your input and try again.',
            'general_rate_limit_exceeded': 'Too many attempts. Please wait a moment and try again.'
        };
        
        const errorCode = error.code || error.type;
        return errorMessages[errorCode] || error.message || 'An unexpected error occurred. Please try again.';
    }
}

// Initialize auth modal when DOM is loaded
let authModal;

document.addEventListener('DOMContentLoaded', () => {
    authModal = new AuthModal();
});

// Global function to open auth modal
function openAuthModal(tab = 'login') {
    console.log('🔄 openAuthModal called with tab:', tab);
    console.log('🔄 authModal instance:', authModal);
    
    if (authModal) {
        console.log('✅ Opening auth modal...');
        authModal.open(tab);
    } else {
        console.error('❌ authModal not initialized');
    }
}