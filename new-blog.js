// Enhanced Blog data with all 5 SEO-optimized posts
const blogPosts = [
    {
        id: 1,
        title: "10 Mind-Blowing Indoor Activities to Beat Boredom in 2025",
        author: "Cerebray",
        date: "January 15, 2025",
        readTime: "5 min read",
        preview: "Feeling stuck indoors? Don't let boredom take over! In 2025, there are countless creative ways to transform your indoor time into exciting adventures. Whether you're dealing with bad weather, limited mobility, or simply prefer the comfort of home, these activities will keep you engaged and entertained.",
        tags: ["Indoor Activities", "2025 Trends", "Entertainment"],
        slug: "post-1.html"
    },
    {
        id: 2,
        title: "The Psychology of Fun: Why Games Are Essential for Mental Health",
        author: "Cerebray",
        date: "January 12, 2025",
        readTime: "7 min read",
        preview: "In our fast-paced world of 2025, mental health has become more important than ever. Research shows that engaging in fun activities and games isn't just entertainment—it's essential for psychological well-being and cognitive function.",
        tags: ["Mental Health", "Psychology", "Gaming Benefits"],
        slug: "post-2.html"
    },
    {
        id: 3,
        title: "Digital Detox Games: Offline Activities for the Modern World",
        author: "Cerebray",
        date: "January 10, 2025",
        readTime: "6 min read",
        preview: "While technology offers amazing entertainment options, sometimes the best cure for boredom is stepping away from screens entirely. Digital detox activities can refresh your mind, improve focus, and reconnect you with the physical world.",
        tags: ["Digital Detox", "Offline Activities", "Mindfulness"],
        slug: "post-3.html"
    },
    {
        id: 4,
        title: "Family Fun in 2025: Multi-Generational Activities Everyone Will Love",
        author: "Cerebray",
        date: "January 8, 2025",
        readTime: "8 min read",
        preview: "Finding activities that engage family members across different generations can be challenging. In 2025, successful family entertainment bridges age gaps while creating lasting memories and strengthening bonds.",
        tags: ["Family Activities", "Multi-Generational", "Bonding"],
        slug: "post-4.html"
    },
    {
        id: 5,
        title: "The Future of Entertainment: AI-Powered Personalized Fun",
        author: "Cerebray",
        date: "January 5, 2025",
        readTime: "9 min read",
        preview: "As we advance through 2025, artificial intelligence is revolutionizing how we discover and engage with entertainment. AI-powered systems can now predict our preferences, suggest activities, and even create personalized content in real-time.",
        tags: ["AI Technology", "Future Trends", "Personalization"],
        slug: "post-5.html"
    }
];

// Enhanced Comment System with improved functionality
class EnhancedCommentSystem {
    constructor() {
        this.comments = this.loadComments();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.updateCommentCounts();
        this.initContactModal();
        
        // Check for contact success message
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('contact') === 'success') {
            this.showNotification('Thank you! Your message has been sent successfully.');
        }
    }

    loadComments() {
        const stored = localStorage.getItem('blog_comments');
        return stored ? JSON.parse(stored) : {};
    }

    saveComments() {
        localStorage.setItem('blog_comments', JSON.stringify(this.comments));
        this.updateCommentCounts();
    }

    getCurrentUser() {
        let user = localStorage.getItem('comment_user');
        if (!user) {
            user = 'Anonymous User';
            localStorage.setItem('comment_user', user);
        }
        return user;
    }

    setCurrentUser(name) {
        this.currentUser = name;
        localStorage.setItem('comment_user', name);
    }

    updateCommentCounts() {
        blogPosts.forEach(post => {
            const postComments = this.comments[post.id] || [];
            const totalComments = this.countTotalComments(postComments);
            const countElement = document.getElementById(`comment-count-${post.id}`);
            if (countElement) {
                countElement.textContent = totalComments;
            }
        });
    }

    countTotalComments(comments) {
        let total = comments.length;
        comments.forEach(comment => {
            total += comment.replies ? comment.replies.length : 0;
        });
        return total;
    }

    addComment(postId, content, parentId = null) {
        if (!content || !content.trim()) {
            this.showNotification('Please enter a comment before posting.', 'error');
            return;
        }

        if (!this.comments[postId]) {
            this.comments[postId] = [];
        }

        const comment = {
            id: Date.now(),
            content: content.trim(),
            author: this.currentUser,
            timestamp: new Date().toISOString(),
            parentId: parentId,
            replies: []
        };

        if (parentId) {
            const parentComment = this.findComment(postId, parentId);
            if (parentComment) {
                parentComment.replies.push(comment);
            }
        } else {
            this.comments[postId].push(comment);
        }

        this.saveComments();
        this.showNotification('Comment posted successfully!');
        return comment;
    }

    findComment(postId, commentId) {
        if (!this.comments[postId]) return null;
        
        for (let comment of this.comments[postId]) {
            if (comment.id === commentId) return comment;
            
            for (let reply of comment.replies) {
                if (reply.id === commentId) return reply;
            }
        }
        return null;
    }

    deleteComment(postId, commentId) {
        if (!this.comments[postId]) return false;

        for (let i = 0; i < this.comments[postId].length; i++) {
            if (this.comments[postId][i].id === commentId) {
                this.comments[postId].splice(i, 1);
                this.saveComments();
                return true;
            }
            
            const replies = this.comments[postId][i].replies;
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

    getComments(postId) {
        return this.comments[postId] || [];
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

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    initContactModal() {
        const contactBtn = document.getElementById('contactBtn');
        const contactModal = document.getElementById('contactModal');
        const closeContactBtn = document.getElementById('closeContactBtn');
        const cancelContactBtn = document.getElementById('cancelContactBtn');

        if (contactBtn && contactModal) {
            contactBtn.addEventListener('click', () => {
                contactModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });

            const closeModal = () => {
                contactModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            };

            if (closeContactBtn) closeContactBtn.addEventListener('click', closeModal);
            if (cancelContactBtn) cancelContactBtn.addEventListener('click', closeModal);

            contactModal.addEventListener('click', (e) => {
                if (e.target === contactModal) closeModal();
            });
        }
    }
}

// Initialize enhanced comment system
const commentSystem = new EnhancedCommentSystem();

// Render blog posts with enhanced functionality
function renderBlogPosts() {
    const blogGrid = document.getElementById('blogGrid');
    
    blogGrid.innerHTML = blogPosts.map(post => `
        <article class="blog-card" data-post-id="${post.id}">
            <div class="blog-card-header">
                <h2 class="blog-title">${post.title}</h2>
                <div class="blog-meta">
                    <span class="author"><i class="fas fa-user"></i> ${post.author}</span>
                    <span class="date"><i class="fas fa-calendar"></i> ${post.date}</span>
                    <span class="read-time"><i class="fas fa-clock"></i> ${post.readTime}</span>
                </div>
            </div>
            
            <div class="blog-preview">
                <p>${post.preview}</p>
            </div>
            
            <div class="blog-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <div class="blog-actions">
                <a href="${post.slug}" class="read-more-btn">
                    <i class="fas fa-book-open"></i> Read Full Article
                </a>
                <button class="comments-btn" onclick="toggleComments(${post.id})">
                    <i class="fas fa-comments"></i> Comments (<span id="comment-count-${post.id}">0</span>)
                </button>
            </div>
            
            <div class="comments-preview" id="comments-preview-${post.id}" style="display: none;">
                <div class="comments-header">
                    <h3><i class="fas fa-comments"></i> Comments</h3>
                    <button onclick="changeDisplayName()" class="change-name-btn">
                        <i class="fas fa-edit"></i> Change Name
                    </button>
                </div>
                
                <div class="add-comment">
                    <div class="comment-user-info">
                        <i class="fas fa-user"></i>
                        <span>Commenting as: <strong class="current-user-name">${commentSystem.currentUser}</strong></span>
                    </div>
                    <textarea id="comment-input-${post.id}" placeholder="Share your thoughts about this article..." rows="3"></textarea>
                    <button onclick="postComment(${post.id})" class="post-comment-btn">
                        <i class="fas fa-paper-plane"></i> Post Comment
                    </button>
                </div>
                
                <div class="comments-list" id="comments-list-${post.id}">
                    <!-- Comments will be rendered here -->
                </div>
            </div>
        </article>
    `).join('');
    
    // Update comment counts and render existing comments
    commentSystem.updateCommentCounts();
    blogPosts.forEach(post => {
        renderCommentsForPost(post.id);
    });
}

// Toggle comments visibility
function toggleComments(postId) {
    const commentsPreview = document.getElementById(`comments-preview-${postId}`);
    if (commentsPreview.style.display === 'none') {
        commentsPreview.style.display = 'block';
        renderCommentsForPost(postId);
    } else {
        commentsPreview.style.display = 'none';
    }
}

// Post a new comment
function postComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    
    if (!content) {
        commentSystem.showNotification('Please enter a comment before posting.', 'error');
        return;
    }
    
    commentSystem.addComment(postId, content);
    input.value = '';
    renderCommentsForPost(postId);
}

// Render comments for a specific post
function renderCommentsForPost(postId) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    const comments = commentSystem.getComments(postId);
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => renderComment(comment, postId)).join('');
}

// Render individual comment
function renderComment(comment, postId) {
    const canDelete = comment.author === commentSystem.currentUser;
    
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <i class="fas fa-user-circle"></i>
                    <strong>${escapeHtml(comment.author)}</strong>
                </div>
                <div class="comment-meta">
                    <span class="comment-time">${commentSystem.formatTimeAgo(comment.timestamp)}</span>
                    ${canDelete ? `<button onclick="confirmDeleteComment(${postId}, ${comment.id})" class="delete-btn" title="Delete comment">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </div>
            
            <div class="comment-content">
                ${escapeHtml(comment.content).replace(/\n/g, '<br>')}
            </div>
            
            <div class="comment-actions">
                <button onclick="showReplyForm(${postId}, ${comment.id})" class="reply-btn">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
            
            <div id="reply-form-${comment.id}" class="reply-form" style="display: none;">
                <div class="reply-user-info">
                    <i class="fas fa-user"></i>
                    <span>Replying as: <strong>${commentSystem.currentUser}</strong></span>
                </div>
                <textarea id="reply-input-${comment.id}" placeholder="Write your reply..." rows="2"></textarea>
                <div class="reply-actions">
                    <button onclick="postReply(${postId}, ${comment.id})" class="post-reply-btn">
                        <i class="fas fa-paper-plane"></i> Post Reply
                    </button>
                    <button onclick="hideReplyForm(${comment.id})" class="cancel-reply-btn">Cancel</button>
                </div>
            </div>
            
            ${comment.replies && comment.replies.length > 0 ? `
                <div class="replies">
                    ${comment.replies.map(reply => renderReply(reply, postId)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Render reply
function renderReply(reply, postId) {
    const canDelete = reply.author === commentSystem.currentUser;
    
    return `
        <div class="reply" data-comment-id="${reply.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <i class="fas fa-user-circle"></i>
                    <strong>${escapeHtml(reply.author)}</strong>
                </div>
                <div class="comment-meta">
                    <span class="comment-time">${commentSystem.formatTimeAgo(reply.timestamp)}</span>
                    ${canDelete ? `<button onclick="confirmDeleteComment(${postId}, ${reply.id})" class="delete-btn" title="Delete reply">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </div>
            
            <div class="comment-content">
                ${escapeHtml(reply.content).replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
}

// Show reply form
function showReplyForm(postId, commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    replyForm.style.display = 'block';
    document.getElementById(`reply-input-${commentId}`).focus();
}

// Hide reply form
function hideReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    replyForm.style.display = 'none';
    document.getElementById(`reply-input-${commentId}`).value = '';
}

// Post reply
function postReply(postId, parentId) {
    const input = document.getElementById(`reply-input-${parentId}`);
    const content = input.value.trim();
    
    if (!content) {
        commentSystem.showNotification('Please enter a reply before posting.', 'error');
        return;
    }
    
    commentSystem.addComment(postId, content, parentId);
    input.value = '';
    hideReplyForm(parentId);
    renderCommentsForPost(postId);
}

// Confirm delete comment
function confirmDeleteComment(postId, commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        commentSystem.deleteComment(postId, commentId);
        renderCommentsForPost(postId);
        commentSystem.showNotification('Comment deleted successfully!');
    }
}

// Change display name
function changeDisplayName() {
    const newName = prompt('Enter your display name:', commentSystem.currentUser);
    if (newName && newName.trim()) {
        commentSystem.setCurrentUser(newName.trim());
        // Update all current user name displays
        document.querySelectorAll('.current-user-name').forEach(el => {
            el.textContent = newName.trim();
        });
        commentSystem.showNotification('Display name updated!');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the blog when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    renderBlogPosts();
});