// Blog page functionality with completely rebuilt commenting system

// Global variables for blog functionality
let blogAppwrite = {
    client: null,
    account: null,
    currentUser: null,
    isSignedIn: false
};

// Initialize Appwrite for blog page
function initializeBlogAppwrite() {
    try {
        blogAppwrite.client = new Appwrite.Client()
            .setEndpoint('https://nyc.cloud.appwrite.io/v1')
            .setProject('68930d9a002e313013dc');
        
        blogAppwrite.account = new Appwrite.Account(blogAppwrite.client);
        
        console.log('Blog Appwrite initialized successfully');
        
        // Check for existing authentication
        checkBlogAuth();
        
        // Start periodic auth sync
        startAuthStateSync();
        
        // Setup localStorage listener for cross-page auth sync
        setupStorageListener();
        
    } catch (error) {
        console.error('Error initializing Blog Appwrite:', error);
        setupOfflineMode();
    }
}

// ===== COMPLETELY REBUILT COMMENTING SYSTEM =====

// Comment storage and management
const commentStorage = {
    // Get all comments for a post
    getComments: function(postId) {
        const key = `blog_comments_${postId}`;
        try {
            const comments = localStorage.getItem(key);
            return comments ? JSON.parse(comments) : [];
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    },
    
    // Save comments for a post
    saveComments: function(postId, comments) {
        const key = `blog_comments_${postId}`;
        try {
            localStorage.setItem(key, JSON.stringify(comments));
            return true;
        } catch (error) {
            console.error('Error saving comments:', error);
            return false;
        }
    },
    
    // Add a new comment
    addComment: function(postId, commentData) {
        const comments = this.getComments(postId);
        const newComment = {
            id: Date.now().toString(),
            content: commentData.content,
            author: commentData.author,
            userId: commentData.userId,
            timestamp: new Date().toISOString(),
            isAuthenticated: commentData.isAuthenticated
        };
        
        comments.unshift(newComment); // Add to beginning
        return this.saveComments(postId, comments) ? newComment : null;
    },
    
    // Delete a comment
    deleteComment: function(postId, commentId) {
        const comments = this.getComments(postId);
        const filteredComments = comments.filter(comment => comment.id !== commentId);
        return this.saveComments(postId, filteredComments);
    }
};

// Authentication helper functions
const authHelper = {
    // Get current user info with proper priority
    getCurrentUser: async function() {
        console.log('Getting current user info...');
        
        // First, try to get fresh session from Appwrite
        try {
            const user = await blogAppwrite.account.get();
            console.log('Found active Appwrite session:', user);
            
            // Update global state
            blogAppwrite.currentUser = {
                id: user.$id,
                name: user.name,
                email: user.email,
                imageUrl: user.prefs?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4ecdc4&color=fff`
            };
            blogAppwrite.isSignedIn = true;
            
            // Save to localStorage for consistency
            const authState = {
                currentUser: blogAppwrite.currentUser,
                isSignedIn: true,
                timestamp: Date.now()
            };
            localStorage.setItem('appwrite_auth_state', JSON.stringify(authState));
            
            return {
                isAuthenticated: true,
                user: blogAppwrite.currentUser
            };
            
        } catch (error) {
            console.log('No active Appwrite session, checking localStorage...');
            
            // Fallback to localStorage
            try {
                const storedAuth = localStorage.getItem('appwrite_auth_state');
                if (storedAuth) {
                    const authData = JSON.parse(storedAuth);
                    if (authData.isSignedIn && authData.currentUser) {
                        console.log('Using stored auth data:', authData.currentUser);
                        
                        // Update global state
                        blogAppwrite.currentUser = authData.currentUser;
                        blogAppwrite.isSignedIn = true;
                        
                        return {
                            isAuthenticated: true,
                            user: authData.currentUser
                        };
                    }
                }
            } catch (storageError) {
                console.error('Error reading stored auth:', storageError);
                localStorage.removeItem('appwrite_auth_state');
            }
        }
        
        // No authentication found
        console.log('No authentication found');
        blogAppwrite.currentUser = null;
        blogAppwrite.isSignedIn = false;
        
        return {
            isAuthenticated: false,
            user: null
        };
    },
    

};

// Comment UI functions
const commentUI = {
    // Initialize comment system
    init: function() {
        console.log('🔧 Initializing comment system...');
        
        // Add sample comments only if none exist
        this.addSampleCommentsIfNeeded();
        
        // Check if we're on an article page (has comments-list elements)
        const commentsLists = document.querySelectorAll('[id^="comments-list-"]');
        
        if (commentsLists.length > 0) {
            console.log('📄 Article page detected, loading existing comments...');
            
            // Load comments for each post on the page
            commentsLists.forEach(commentsList => {
                const postId = commentsList.id.replace('comments-list-', '');
                console.log(`📝 Loading comments for post ${postId}`);
                this.loadComments(postId);
            });
        } else {
            console.log('📋 Blog page detected, comments will load on demand');
        }
    },
    
    // FORCE sample comments to be visible (for immediate testing)
    forceSampleComments: function() {
        console.log('🚨 FORCING sample comments to be added...');
        
        // Clear existing comments and add fresh ones
        localStorage.removeItem('blog_comments_1');
        localStorage.removeItem('blog_comments_2');
        localStorage.removeItem('blog_comments_3');
        
        // Add sample comments for post 1
        const post1Samples = [
            {
                content: "These are fantastic ideas! I especially love the VR gaming suggestion. Can't wait to try some of these activities.",
                author: "Sarah Johnson",
                userId: "sample_user_1",
                isAuthenticated: true,
                timestamp: Date.now() - 3600000 // 1 hour ago
            },
            {
                content: "The indoor gardening tip is perfect timing! I've been wanting to start growing herbs in my apartment.",
                author: "Mike Chen",
                userId: "sample_user_2", 
                isAuthenticated: false,
                timestamp: Date.now() - 7200000 // 2 hours ago
            },
            {
                content: "Great article! The escape room challenge sounds like so much fun. Going to try this with my family this weekend.",
                author: "Anonymous Reader",
                userId: "sample_user_3",
                isAuthenticated: false,
                timestamp: Date.now() - 10800000 // 3 hours ago
            }
        ];
        
        post1Samples.forEach(comment => {
            commentStorage.addComment('1', comment);
        });
        
        console.log('✅ FORCED sample comments added for post 1');
    },
    
    // Add sample comments for demonstration (only if no comments exist)
    addSampleCommentsIfNeeded: function() {
        console.log('📝 Checking for existing comments and adding samples if needed...');
        
        // Add sample comments for post 1 if none exist
        const post1Comments = commentStorage.getComments('1');
        if (post1Comments.length === 0) {
            console.log('Adding sample comments for post 1...');
            const post1Samples = [
                {
                    content: "These are fantastic ideas! I especially love the VR gaming suggestion. Can't wait to try some of these activities.",
                    author: "Sarah Johnson",
                    userId: "sample_user_1",
                    isAuthenticated: true
                },
                {
                    content: "The indoor gardening tip is perfect timing! I've been wanting to start growing herbs in my apartment.",
                    author: "Mike Chen",
                    userId: "sample_user_2", 
                    isAuthenticated: false
                },
                {
                    content: "Great article! The escape room challenge sounds like so much fun. Going to try this with my family this weekend.",
                    author: "Anonymous Reader",
                    userId: "sample_user_3",
                    isAuthenticated: false
                },
                {
                    content: "I tried the cooking challenge last week and it was amazing! Made some delicious pasta from scratch.",
                    author: "Chef Maria",
                    userId: "sample_user_4",
                    isAuthenticated: true
                },
                {
                    content: "The digital art suggestion opened up a whole new hobby for me. Thanks for the inspiration!",
                    author: "ArtLover99",
                    userId: "sample_user_5",
                    isAuthenticated: false
                }
            ];
            
            post1Samples.forEach(comment => {
                commentStorage.addComment('1', comment);
            });
        }
        
        // Add sample comments for post 2 if none exist
        const post2Comments = commentStorage.getComments('2');
        if (post2Comments.length === 0) {
            console.log('Adding sample comments for post 2...');
            const post2Samples = [
                {
                    content: "This productivity guide is exactly what I needed! The time-blocking technique has already improved my workflow.",
                    author: "ProductivityGuru",
                    userId: "sample_user_6",
                    isAuthenticated: true
                },
                {
                    content: "The Pomodoro technique mentioned here changed my life. I'm getting so much more done now!",
                    author: "FocusedWorker",
                    userId: "sample_user_7",
                    isAuthenticated: false
                }
            ];
            
            post2Samples.forEach(comment => {
                commentStorage.addComment('2', comment);
            });
        }
        
        // Add sample comments for post 3 if none exist
        const post3Comments = commentStorage.getComments('3');
        if (post3Comments.length === 0) {
            console.log('Adding sample comments for post 3...');
            const post3Samples = [
                {
                    content: "These wellness tips are so practical! I've started implementing the morning routine and feel much better.",
                    author: "WellnessSeeker",
                    userId: "sample_user_8",
                    isAuthenticated: true
                },
                {
                    content: "The meditation advice really resonates with me. Thank you for sharing these insights!",
                    author: "ZenMaster",
                    userId: "sample_user_9",
                    isAuthenticated: false
                }
            ];
            
            post3Samples.forEach(comment => {
                commentStorage.addComment('3', comment);
            });
        }
        
        console.log('✅ Sample comments setup complete');
    },
    
    // Toggle comments section visibility
    toggleComments: function(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        const toggleBtn = document.querySelector(`[onclick="toggleComments(${postId})"]`);
        
        if (commentsSection.style.display === 'none' || !commentsSection.style.display) {
            commentsSection.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-comments"></i> Hide Comments';
            this.loadComments(postId);
        } else {
            commentsSection.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-comments"></i> Show Comments';
        }
    },
    
    // Load and display comments
    loadComments: function(postId) {
        const commentsList = document.getElementById(`comments-list-${postId}`);
        if (!commentsList) {
            console.warn(`Comments list element not found for post ${postId}`);
            return;
        }
        
        const comments = commentStorage.getComments(postId);
        console.log(`📋 Loading ${comments.length} comments for post ${postId}`);
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        // Clear any existing content and render all comments
        commentsList.innerHTML = '';
        const commentsHTML = comments.map(comment => this.renderComment(comment, postId)).join('');
        commentsList.innerHTML = commentsHTML;
        
        console.log(`✅ Successfully loaded ${comments.length} comments for post ${postId}`);
    },
    
    // Render a single comment
    renderComment: function(comment, postId) {
        const timeAgo = this.getTimeAgo(comment.timestamp);
        const canDelete = this.canDeleteComment(comment);
        
        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author authenticated">
                        <i class="fas fa-user-check"></i> 
                        ${comment.author}
                    </span>
                    <span class="comment-time">${timeAgo}</span>
                    ${canDelete ? `<button class="delete-comment-btn" onclick="commentUI.deleteComment('${postId}', '${comment.id}')" title="Delete comment">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
            </div>
        `;
    },
    
    // Check if current user can delete a comment
    canDeleteComment: function(comment) {
        if (!blogAppwrite.isSignedIn || !blogAppwrite.currentUser) {
            return false;
        }
        return comment.userId === blogAppwrite.currentUser.id;
    },
    
    // Add a new comment (requires authentication)
    addComment: async function(postId) {
        // Check if user is authenticated
        const authInfo = await authHelper.getCurrentUser();
        
        if (!authInfo.isAuthenticated) {
            this.showNotification('Please sign in to post a comment.', 'error');
            return;
        }
        
        const textarea = document.getElementById(`comment-input-${postId}`);
        const content = textarea.value.trim();
        
        if (!content) {
            this.showNotification('Please enter a comment before posting.', 'error');
            return;
        }
        
        const commentData = {
            content: content,
            author: authInfo.user.name,
            userId: authInfo.user.id,
            isAuthenticated: true
        };
        
        console.log('Adding comment with data:', commentData);
        
        const newComment = commentStorage.addComment(postId, commentData);
        
        if (newComment) {
            textarea.value = '';
            this.loadComments(postId);
            this.showNotification('Comment posted successfully!', 'success');
        } else {
            this.showNotification('Failed to post comment. Please try again.', 'error');
        }
    },
    
    // Delete a comment
    deleteComment: function(postId, commentId) {
        if (confirm('Are you sure you want to delete this comment?')) {
            if (commentStorage.deleteComment(postId, commentId)) {
                this.loadComments(postId);
                this.showNotification('Comment deleted successfully.', 'success');
            } else {
                this.showNotification('Failed to delete comment.', 'error');
            }
        }
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },
    
    // Escape HTML to prevent XSS
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Get time ago string
    getTimeAgo: function(timestamp) {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffMs = now - commentTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return commentTime.toLocaleDateString();
    }
};

// Global functions for HTML onclick handlers
function toggleComments(postId) {
    commentUI.toggleComments(postId);
}

function addComment(postId) {
    commentUI.addComment(postId);
}



// ===== AUTHENTICATION FUNCTIONS =====

async function checkBlogAuth() {
    console.log('Checking blog authentication...');
    
    try {
        // First check localStorage for shared auth state
        const authState = localStorage.getItem('appwrite_auth_state');
        console.log('Auth state from localStorage:', authState);
        
        if (authState) {
            const { currentUser, isSignedIn, timestamp } = JSON.parse(authState);
            
            // Check if the stored state is not too old (24 hours)
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                console.log('Using cached auth state:', { currentUser, isSignedIn });
                blogAppwrite.currentUser = currentUser;
                blogAppwrite.isSignedIn = isSignedIn;
                updateBlogUI();
                return;
            } else {
                console.log('Cached auth state is too old, clearing...');
                localStorage.removeItem('appwrite_auth_state');
            }
        }
        
        // If no valid localStorage state, check with Appwrite
        console.log('Checking with Appwrite server...');
        const user = await blogAppwrite.account.get();
        console.log('Appwrite user data:', user);
        
        blogAppwrite.currentUser = {
            id: user.$id,
            name: user.name,
            email: user.email,
            imageUrl: user.prefs?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4ecdc4&color=fff`
        };
        blogAppwrite.isSignedIn = true;
        
        // Update localStorage with fresh data
        localStorage.setItem('appwrite_auth_state', JSON.stringify({
            currentUser: blogAppwrite.currentUser,
            isSignedIn: blogAppwrite.isSignedIn,
            timestamp: Date.now()
        }));
        
        console.log('Blog user authenticated:', blogAppwrite.currentUser);
    } catch (error) {
        console.log('Blog user not authenticated:', error.message);
        blogAppwrite.currentUser = null;
        blogAppwrite.isSignedIn = false;
        
        // Clear any stale localStorage data
        localStorage.removeItem('appwrite_auth_state');
        // NOTE: No longer calling setupBlogSignInButton() since buttons use openAuthModal()
    }
    
    console.log('Final auth state:', {
        isSignedIn: blogAppwrite.isSignedIn,
        currentUser: blogAppwrite.currentUser
    });
    
    updateBlogUI();
}

function handleBlogSignInSuccess(user) {
    blogAppwrite.currentUser = {
        id: user.$id || user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.prefs?.avatar || user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4ecdc4&color=fff`
    };
    blogAppwrite.isSignedIn = true;
    
    // Save authentication state to localStorage for sharing with main page
    localStorage.setItem('appwrite_auth_state', JSON.stringify({
        currentUser: blogAppwrite.currentUser,
        isSignedIn: blogAppwrite.isSignedIn,
        timestamp: Date.now()
    }));
    
    console.log('✅ User signed in to blog:', blogAppwrite.currentUser);
    updateBlogUI();
}

async function signOutBlog() {
    try {
        await blogAppwrite.account.deleteSession('current');
        blogAppwrite.currentUser = null;
        blogAppwrite.isSignedIn = false;
        
        // Clear authentication state from localStorage
        localStorage.removeItem('appwrite_auth_state');
        
        console.log('✅ User signed out successfully');
        updateBlogUI();
    } catch (error) {
        console.error('❌ Error signing out:', error);
        
        // Even if server sign-out fails, clear local state
        blogAppwrite.currentUser = null;
        blogAppwrite.isSignedIn = false;
        localStorage.removeItem('appwrite_auth_state');
        updateBlogUI();
    }
}

function updateBlogUI() {
    // Handle different page types with different element IDs
    const signInBtnContainer = document.getElementById('mainSignInBtn'); // blog.html, index.html
    const appwriteSignInBtn = document.getElementById('appwriteSignInBtn'); // blog.html, index.html
    const postSignInBtn = document.getElementById('signInBtn'); // post-*.html
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    // Comment form elements
    const authRequired = document.getElementById('authRequired');
    const commentForm = document.getElementById('commentForm');

    console.log('🔄 Updating blog UI:', {
        isSignedIn: blogAppwrite.isSignedIn,
        currentUser: blogAppwrite.currentUser,
        signInBtnContainer: !!signInBtnContainer,
        appwriteSignInBtn: !!appwriteSignInBtn,
        postSignInBtn: !!postSignInBtn,
        userProfile: !!userProfile,
        authRequired: !!authRequired,
        commentForm: !!commentForm
    });

    if (blogAppwrite.isSignedIn && blogAppwrite.currentUser) {
        console.log('✅ User is signed in, showing profile');
        
        // Hide all sign-in buttons
        if (signInBtnContainer) signInBtnContainer.style.display = 'none';
        if (appwriteSignInBtn) appwriteSignInBtn.style.display = 'none';
        if (postSignInBtn) postSignInBtn.style.display = 'none';
        
        // Show user profile
        if (userProfile) {
            userProfile.style.display = 'flex';
            if (userAvatar) userAvatar.src = blogAppwrite.currentUser.imageUrl;
            if (userName) userName.textContent = blogAppwrite.currentUser.name;
        }
        
        // Show comment form, hide auth required message
        if (commentForm) commentForm.style.display = 'block';
        if (authRequired) authRequired.style.display = 'none';
    } else {
        console.log('❌ User not signed in, showing sign-in buttons');
        
        // Show appropriate sign-in buttons based on page type
        if (signInBtnContainer) signInBtnContainer.style.display = 'flex';
        if (appwriteSignInBtn) appwriteSignInBtn.style.display = 'flex';
        if (postSignInBtn) postSignInBtn.style.display = 'flex';
        
        // Hide user profile
        if (userProfile) userProfile.style.display = 'none';
        
        // Hide comment form, show auth required message
        if (commentForm) commentForm.style.display = 'none';
        if (authRequired) authRequired.style.display = 'block';
    }
}

function setupBlogSignInButton() {
    // Handle different page types
    const googleSignInBtn = document.getElementById('mainSignInBtn'); // blog.html, index.html
    const appwriteSignInBtn = document.getElementById('appwriteSignInBtn'); // blog.html, index.html
    const postSignInBtn = document.getElementById('signInBtn'); // post-*.html
    const signOutBtn = document.getElementById('signOutBtn');
    
    console.log('🔧 Setting up sign-in buttons:', {
        mainSignInBtn: !!googleSignInBtn,
        appwriteSignInBtn: !!appwriteSignInBtn,
        postSignInBtn: !!postSignInBtn,
        signOutBtn: !!signOutBtn
    });
    
    // NOTE: Sign-in buttons now use openAuthModal() instead of direct Google sign-in
    // The onclick handlers are set directly in HTML: onclick="openAuthModal('login')"
    // This allows the authentication modal to handle all sign-in methods
    
    // Sign out button (available on all pages)
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOutBlog);
        console.log('✅ Sign-out button event listener added');
    }
    
    console.log('✅ Sign-in buttons configured to use authentication modal');
}

// Note: Google sign-in is now handled through the auth modal popup system
// The signInWithGoogleBlog function has been removed to prevent conflicts

function setupOfflineMode() {
    console.log('Setting up offline mode');
    blogAppwrite.isSignedIn = false;
    blogAppwrite.currentUser = null;
}

// Auth state synchronization
function startAuthStateSync() {
    setInterval(async () => {
        if (!blogAppwrite.isSignedIn) {
            await authHelper.getCurrentUser();
        }
    }, 5000);
}

function setupStorageListener() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'appwrite_auth_state') {
            console.log('🔄 Auth state changed in localStorage from another tab/page');
            
            if (e.newValue) {
                try {
                    const authData = JSON.parse(e.newValue);
                    if (authData.isSignedIn && authData.currentUser) {
                        console.log('✅ Syncing new auth state:', authData.currentUser);
                        blogAppwrite.currentUser = authData.currentUser;
                        blogAppwrite.isSignedIn = true;
                        updateBlogUI();
                    }
                } catch (error) {
                    console.error('❌ Error parsing auth sync data:', error);
                }
            } else {
                console.log('❌ User signed out in another tab/page');
                blogAppwrite.currentUser = null;
                blogAppwrite.isSignedIn = false;
                updateBlogUI();
            }
        }
    });
}

// ===== OTHER BLOG FUNCTIONALITY =====

// Post expansion/collapse
function expandPost(postId) {
    const preview = document.querySelector(`[data-post-id="${postId}"] .post-preview`);
    const fullContent = document.getElementById(`full-content-${postId}`);
    
    if (preview && fullContent) {
        preview.style.display = 'none';
        fullContent.style.display = 'block';
    }
}

function collapsePost(postId) {
    const preview = document.querySelector(`[data-post-id="${postId}"] .post-preview`);
    const fullContent = document.getElementById(`full-content-${postId}`);
    
    if (preview && fullContent) {
        preview.style.display = 'block';
        fullContent.style.display = 'none';
    }
}

// Contact form functionality
function setupBlogContactForm() {
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeContactBtn = document.getElementById('closeContactModal');
    const cancelContactBtn = document.getElementById('cancelContactBtn');

    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            contactModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeContactBtn) {
        closeContactBtn.addEventListener('click', () => {
            contactModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (cancelContactBtn) {
        cancelContactBtn.addEventListener('click', () => {
            contactModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (contactModal) {
        contactModal.addEventListener('click', function(e) {
            if (e.target === contactModal) {
                contactModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Blog page DOM loaded, initializing...');
    
    // Initialize Appwrite
    await initializeBlogAppwrite();
    
    // Setup contact form
    setupBlogContactForm();
    
    // Setup storage listener for cross-tab auth sync
    setupStorageListener();
    
    // Check authentication status immediately
    await checkBlogAuth();
    
    // Initialize comment system
    commentUI.init();
    
    // FORCE IMMEDIATE COMMENT DISPLAY - Add this as backup
    setTimeout(() => {
        console.log('🔧 FORCE LOADING COMMENTS...');
        const commentsLists = document.querySelectorAll('[id^="comments-list-"]');
        commentsLists.forEach(commentsList => {
            const postId = commentsList.id.replace('comments-list-', '');
            console.log(`🔄 Force loading comments for post ${postId}`);
            commentUI.loadComments(postId);
        });
    }, 500);
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') || window.location.hash.includes('success')) {
        console.log('🔄 OAuth callback detected');
        setTimeout(async () => {
            try {
                const user = await blogAppwrite.account.get();
                handleBlogSignInSuccess(user);
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.log('❌ No active session found after OAuth callback');
            }
        }, 1000);
    }
    
    console.log('✅ Blog initialization complete');
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .comment {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .comment-author {
            font-weight: 600;
            color: #495057;
        }
        .comment-author.authenticated {
            color: #28a745;
        }
        .comment-author.anonymous {
            color: #6c757d;
        }
        .comment-time {
            font-size: 0.85em;
            color: #6c757d;
        }
        .comment-content {
            color: #212529;
            line-height: 1.5;
        }
        .delete-comment-btn {
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .delete-comment-btn:hover {
            background-color: #f8d7da;
        }
        .no-comments {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 20px;
        }
    `;
    document.head.appendChild(style);
});