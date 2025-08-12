// Article Comments System - Shared JavaScript for all article pages
class ArticleCommentSystem {
    constructor(postId) {
        this.postId = postId;
        this.comments = this.loadComments();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.updateUserDisplay();
        this.renderComments();
        this.initContactModal();
        this.setupAuthStateListener();
        
        // Check for contact success message
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('contact') === 'success') {
            this.showNotification('Thank you! Your message has been sent successfully.');
        }
    }

    setupAuthStateListener() {
        // Listen for authentication state changes from other tabs/pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'appwrite_auth_state') {
                console.log('Auth state changed, updating user display');
                this.currentUser = this.getCurrentUser();
                this.updateUserDisplay();
                this.renderComments(); // Re-render to update comment ownership
            }
        });
    }

    loadComments() {
        const key = `blog_comments_${this.postId}`;
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    }

    saveComments() {
        const key = `blog_comments_${this.postId}`;
        try {
            localStorage.setItem(key, JSON.stringify(this.comments));
            return true;
        } catch (error) {
            console.error('Error saving comments:', error);
            return false;
        }
    }

    getCurrentUser() {
        // Check if user is authenticated via Appwrite
        const authData = localStorage.getItem('appwrite_auth_state');
        if (authData) {
            try {
                const auth = JSON.parse(authData);
                if (auth.isSignedIn && auth.currentUser && auth.currentUser.name) {
                    return auth.currentUser.name;
                }
            } catch (e) {
                console.log('Error parsing auth data:', e);
            }
        }
        
        // If not authenticated, always return Anonymous
        return 'Anonymous';
    }

    setCurrentUser(username) {
        // This method is no longer used since we determine user automatically
        // Keep for backward compatibility but don't do anything
        return;
    }

    updateUserDisplay() {
        const userNameElement = document.getElementById('currentUserName');
        const changeNameBtn = document.querySelector('.change-name-btn');
        const userInfo = document.querySelector('.user-info');
        const currentUser = this.getCurrentUser();
        const isAuthenticated = this.isUserAuthenticated();
        
        if (userNameElement) {
            userNameElement.textContent = currentUser;
        }
        
        // Always hide change name button since it's automatic now
        if (changeNameBtn) {
            changeNameBtn.style.display = 'none';
        }
        
        // Show/hide sign-in button based on auth status
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.style.display = isAuthenticated ? 'none' : 'inline-block';
        }
        
        // Update the user info text to be clearer
        if (userInfo) {
            const span = userInfo.querySelector('span');
            if (span) {
                if (isAuthenticated) {
                    span.innerHTML = `<i class="fas fa-user-check"></i> Signed in as: <strong id="currentUserName">${currentUser}</strong>`;
                } else {
                    span.innerHTML = `<i class="fas fa-user"></i> Commenting as: <strong id="currentUserName">${currentUser}</strong>`;
                }
            }
        }
    }

    isUserAuthenticated() {
        const authState = localStorage.getItem('appwrite_auth_state');
        if (authState) {
            try {
                const authData = JSON.parse(authState);
                return authData.isSignedIn && authData.currentUser;
            } catch (error) {
                console.error('Error parsing auth state:', error);
            }
        }
        return false;
    }

    addComment(content, parentId = null) {
        if (!content || !content.trim()) {
            this.showNotification('Please enter a comment before posting.', 'error');
            return;
        }

        const comment = {
            id: Date.now().toString(),
            content: content.trim(),
            author: this.currentUser,
            userId: this.isUserAuthenticated() ? 'authenticated_user' : 'anonymous_user',
            timestamp: new Date().toISOString(),
            parentId: parentId,
            replies: [],
            isAuthenticated: this.isUserAuthenticated()
        };

        if (parentId) {
            const parentComment = this.findComment(parentId);
            if (parentComment) {
                parentComment.replies.push(comment);
            }
        } else {
            this.comments.push(comment);
        }

        this.saveComments();
        this.renderComments();
        this.showNotification('Comment posted successfully!');
        return comment;
    }

    findComment(commentId) {
        for (let comment of this.comments) {
            if (comment.id === commentId) return comment;
            
            for (let reply of comment.replies) {
                if (reply.id === commentId) return reply;
            }
        }
        return null;
    }

    deleteComment(commentId) {
        for (let i = 0; i < this.comments.length; i++) {
            if (this.comments[i].id === commentId) {
                this.comments.splice(i, 1);
                this.saveComments();
                return true;
            }
            
            const replies = this.comments[i].replies;
            for (let j = 0; j < replies.length; j++) {
                if (replies[j].id === commentId) {
                    replies.splice(j, 1);
                    this.saveComments();
                    return true;
                }
            }
        }
        return false;
    }

    renderComments() {
        const commentsList = document.getElementById('commentsList');
        
        if (this.comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }
        
        commentsList.innerHTML = this.comments.map(comment => this.renderComment(comment)).join('');
    }

    renderComment(comment) {
        const canDelete = comment.author === this.currentUser;
        const isAuthenticated = comment.isAuthenticated || false;
        
        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author ${isAuthenticated ? 'authenticated' : 'anonymous'}">
                        <i class="fas fa-user-circle"></i>
                        <strong>${this.escapeHtml(comment.author)}</strong>
                        ${isAuthenticated ? '<i class="fas fa-check-circle auth-verified" title="Verified User"></i>' : ''}
                    </div>
                    <div class="comment-meta">
                        <span class="comment-time">${this.formatTimeAgo(comment.timestamp)}</span>
                        ${canDelete ? `<button onclick="commentSystem.confirmDeleteComment(${comment.id})" class="delete-btn" title="Delete comment">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                
                <div class="comment-content">
                    ${this.escapeHtml(comment.content).replace(/\n/g, '<br>')}
                </div>
                
                <div class="comment-actions">
                    ${this.isUserAuthenticated() ? `
                        <button onclick="commentSystem.showReplyForm(${comment.id})" class="reply-btn">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                    ` : `
                        <button onclick="openAuthModal('login')" class="reply-btn auth-required">
                            <i class="fas fa-sign-in-alt"></i> Sign in to Reply
                        </button>
                    `}
                </div>
                
                <div id="reply-form-${comment.id}" class="reply-form" style="display: none;">
                    <div class="reply-user-info">
                        <i class="fas fa-user"></i>
                        <span>Replying as: <strong>${this.currentUser}</strong></span>
                    </div>
                    <textarea id="reply-input-${comment.id}" placeholder="Write your reply..." rows="2"></textarea>
                    <div class="reply-actions">
                        <button onclick="commentSystem.postReply(${comment.id})" class="post-reply-btn">
                            <i class="fas fa-paper-plane"></i> Post Reply
                        </button>
                        <button onclick="commentSystem.hideReplyForm(${comment.id})" class="cancel-reply-btn">Cancel</button>
                    </div>
                </div>
                
                ${comment.replies.length > 0 ? `
                    <div class="replies">
                        ${comment.replies.map(reply => this.renderReply(reply)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderReply(reply) {
        const canDelete = reply.author === this.currentUser;
        const isAuthenticated = reply.isAuthenticated || false;
        
        return `
            <div class="reply" data-comment-id="${reply.id}">
                <div class="comment-header">
                    <div class="comment-author ${isAuthenticated ? 'authenticated' : 'anonymous'}">
                        <i class="fas fa-user-circle"></i>
                        <strong>${this.escapeHtml(reply.author)}</strong>
                        ${isAuthenticated ? '<i class="fas fa-check-circle auth-verified" title="Verified User"></i>' : ''}
                    </div>
                    <div class="comment-meta">
                        <span class="comment-time">${this.formatTimeAgo(reply.timestamp)}</span>
                        ${canDelete ? `<button onclick="commentSystem.confirmDeleteComment(${reply.id})" class="delete-btn" title="Delete reply">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                
                <div class="comment-content">
                    ${this.escapeHtml(reply.content).replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    }

    showReplyForm(commentId) {
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        replyForm.style.display = 'block';
        document.getElementById(`reply-input-${commentId}`).focus();
    }

    hideReplyForm(commentId) {
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        replyForm.style.display = 'none';
        document.getElementById(`reply-input-${commentId}`).value = '';
    }

    postReply(parentId) {
        const input = document.getElementById(`reply-input-${parentId}`);
        const content = input.value.trim();
        
        if (content) {
            this.addComment(content, parentId);
            this.hideReplyForm(parentId);
        }
    }

    confirmDeleteComment(commentId) {
        if (confirm('Are you sure you want to delete this comment?')) {
            if (this.deleteComment(commentId)) {
                this.renderComments();
                this.showNotification('Comment deleted successfully!');
            }
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffMs = now - commentTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initContactModal() {
        const contactBtn = document.getElementById('contactBtn');
        const contactModal = document.getElementById('contactModal');
        const closeContactBtn = document.getElementById('closeContactBtn');
        const cancelContactBtn = document.getElementById('cancelContactBtn');
        
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                contactModal.style.display = 'flex';
            });
        }
        
        if (closeContactBtn) {
            closeContactBtn.addEventListener('click', () => {
                contactModal.style.display = 'none';
            });
        }
        
        if (cancelContactBtn) {
            cancelContactBtn.addEventListener('click', () => {
                contactModal.style.display = 'none';
            });
        }
        
        if (contactModal) {
            contactModal.addEventListener('click', (e) => {
                if (e.target === contactModal) {
                    contactModal.style.display = 'none';
                }
            });
        }
    }
}

// Global functions
let commentSystem;

function addComment() {
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    
    if (content) {
        commentSystem.addComment(content);
        input.value = '';
    }
}



function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // postId should be defined in each article page before this script is loaded
    if (typeof postId !== 'undefined') {
        commentSystem = new ArticleCommentSystem(postId);
    }
});