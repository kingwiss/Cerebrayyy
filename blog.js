// Blog page functionality with commenting system

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

// Comment helper functions
const commentHelper = {
    // Check if user can delete a comment (simplified - no auth required)
    canDeleteComment: function(comment) {
        // For now, allow deletion of any comment since auth is removed
        return true;
    }
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
        // Allow deletion of any comment since auth is removed
        return true;
    },
    
    // Add a new comment (no authentication required)
    addComment: async function(postId) {
        const textarea = document.getElementById(`comment-input-${postId}`);
        const content = textarea.value.trim();
        
        if (!content) {
            this.showNotification('Please enter a comment before posting.', 'error');
            return;
        }
        
        // Get current user from auth system
        let author = 'Anonymous';
        let userId = 'anonymous_' + Date.now();
        let isAuthenticated = false;
        
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            const user = window.authSystem.getCurrentUser();
            if (user) {
                author = user.username;
                userId = user.id;
                isAuthenticated = true;
            }
        }
        
        const commentData = {
            content: content,
            author: author,
            userId: userId,
            isAuthenticated: isAuthenticated
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



// ===== REMOVED AUTHENTICATION FUNCTIONS =====
// Authentication system has been completely removed

// UI update function removed - no authentication UI to manage

// Authentication setup functions removed

// Auth synchronization functions removed

// Authentication listener functions removed

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
    
    // Setup contact form
    setupBlogContactForm();
    
    // Initialize comment system
    commentUI.init();
    
    // Force immediate comment display
    setTimeout(() => {
        console.log('🔧 Loading comments for all posts...');
        const commentsLists = document.querySelectorAll('[id^="comments-list-"]');
        commentsLists.forEach(commentsList => {
            const postId = commentsList.id.replace('comments-list-', '');
            console.log(`🔄 Loading comments for post ${postId}`);
            commentUI.loadComments(postId);
        });
    }, 500);
    
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