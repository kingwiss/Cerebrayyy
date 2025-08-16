/**
 * UserTierManager - Manages user subscription tiers and premium access
 * Handles free/premium tier management, payment processing integration,
 * and content access control for the Cerebray platform.
 */

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class UserTierManager {
    constructor() {
        this.userId = null;
        this.currentTier = 'basic';
        this.dailyCardLimit = 40; // Basic tier limit
        this.cardsUsedToday = 0;
        this.totalCardsGenerated = 0;
        this.daysActive = 1;
        this.premiumStartDate = null;
        this.premiumEndDate = null;
        this.subscriptionId = null;
        this.subscriptionStatus = null;
        this.lastResetDate = new Date().toDateString();
        this.authInitialized = false;
        
        // Initialize Firebase auth listener
        this.initializeAuth();
    }
    
    async initializeAuth() {
        return new Promise((resolve) => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in
                    this.userId = user.uid;
                    this.loadUserData();
                    this.checkDailyReset();
                    this.checkPremiumStatus();
                } else {
                    // User is signed out - use anonymous session
                    this.userId = this.generateAnonymousId();
                    this.currentTier = 'basic';
                    this.loadUserData();
                    this.checkDailyReset();
                    this.checkPremiumStatus();
                }
                this.authInitialized = true;
                resolve();
            });
        });
    }

    generateAnonymousId() {
        let anonymousId = localStorage.getItem('anonymousUserId');
        if (!anonymousId) {
            anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('anonymousUserId', anonymousId);
        }
        return anonymousId;
    }
    
    async waitForAuth() {
        while (!this.authInitialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    loadUserData() {
        if (!this.userId) return;
        
        try {
            const userKey = `cerebray_user_tier_data_${this.userId}`;
            const savedData = localStorage.getItem(userKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.userId = data.userId || this.userId;
                this.currentTier = data.currentTier || 'basic';
                this.cardsUsedToday = data.cardsUsedToday || 0;
                this.totalCardsGenerated = data.totalCardsGenerated || 0;
                this.daysActive = data.daysActive || 1;
                this.premiumStartDate = data.premiumStartDate;
                this.premiumEndDate = data.premiumEndDate;
                this.subscriptionId = data.subscriptionId;
                this.subscriptionStatus = data.subscriptionStatus;
                this.lastResetDate = data.lastResetDate || new Date().toDateString();
            }
            
            // Update daily card limit based on tier
            this.updateDailyCardLimit();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    saveUserData() {
        if (!this.userId) return;
        
        try {
            const userKey = `cerebray_user_tier_data_${this.userId}`;
            const data = {
                userId: this.userId,
                currentTier: this.currentTier,
                cardsUsedToday: this.cardsUsedToday,
                totalCardsGenerated: this.totalCardsGenerated,
                daysActive: this.daysActive,
                premiumStartDate: this.premiumStartDate,
                premiumEndDate: this.premiumEndDate,
                subscriptionId: this.subscriptionId,
                subscriptionStatus: this.subscriptionStatus,
                lastResetDate: this.lastResetDate
            };
            localStorage.setItem(userKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            this.resetDailyUsage();
            this.daysActive++;
            this.lastResetDate = today;
            this.saveUserData();
        }
    }

    checkPremiumStatus() {
        try {
            const premiumMode = localStorage.getItem('premiumMode');
            const premiumData = localStorage.getItem('premiumData');
            
            if (premiumMode === 'true' && premiumData) {
                const data = JSON.parse(premiumData);
                
                // Check if subscription is still valid
                const endDate = new Date(data.endDate);
                const now = new Date();
                
                if (now <= endDate && data.status === 'active') {
                    this.currentTier = 'premium';
                    this.premiumStartDate = data.startDate;
                    this.premiumEndDate = data.endDate;
                    this.subscriptionId = data.subscriptionId;
                    this.subscriptionStatus = data.status;
                    this.updateDailyCardLimit();
                    this.saveUserData();
                } else {
                    // Subscription expired, clean up
                    this.downgradeTier();
                    localStorage.removeItem('premiumMode');
                    localStorage.removeItem('premiumData');
                }
            }
        } catch (error) {
            console.error('Error checking premium status:', error);
        }
    }

    updateDailyCardLimit() {
        if (this.isPremium()) {
            this.dailyCardLimit = 100; // Premium tier limit
        } else {
            this.dailyCardLimit = 40;  // Basic tier limit
        }
    }

    isPremium() {
        if (!this.premiumEndDate) return false;
        
        const now = new Date();
        const endDate = new Date(this.premiumEndDate);
        
        if (now > endDate) {
            // Premium expired, downgrade to basic
            this.downgradeTier();
            return false;
        }
        
        return this.currentTier === 'premium';
    }

    isPremiumUser() {
        return this.isPremium();
    }

    getCurrentTier() {
        return this.currentTier;
    }

    getDailyCardLimit() {
        return this.dailyCardLimit;
    }

    getCardsUsedToday() {
        return this.cardsUsedToday;
    }

    hasReachedDailyLimit() {
        return this.cardsUsedToday >= this.dailyCardLimit;
    }

    trackCardUsage(count = 1) {
        if (this.hasReachedDailyLimit()) {
            throw new Error('Daily card limit reached');
        }
        
        this.cardsUsedToday += count;
        this.totalCardsGenerated += count;
        this.saveUserData();
        
        return {
            cardsUsed: this.cardsUsedToday,
            remainingCards: this.dailyCardLimit - this.cardsUsedToday,
            dailyLimit: this.dailyCardLimit
        };
    }

    resetDailyUsage() {
        this.cardsUsedToday = 0;
        this.saveUserData();
    }

    async upgradeToPremium(subscriptionData = null) {
        try {
            // Ensure auth is initialized
            await this.waitForAuth();
            
            // Only allow premium upgrade for authenticated users
            if (!auth.currentUser) {
                console.error('Cannot upgrade to premium: User not authenticated');
                throw new Error('User must be authenticated to upgrade to premium');
            }
            
            this.currentTier = 'premium';
            
            if (subscriptionData) {
                this.premiumStartDate = subscriptionData.startDate;
                this.premiumEndDate = subscriptionData.endDate;
                this.subscriptionId = subscriptionData.subscriptionId;
                this.subscriptionStatus = subscriptionData.status || 'active';
            } else {
                // Default to 1 month subscription
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(startDate.getMonth() + 1);
                
                this.premiumStartDate = startDate.toISOString();
                this.premiumEndDate = endDate.toISOString();
                this.subscriptionStatus = 'active';
            }
            
            this.updateDailyCardLimit();
            this.saveUserData();
            
            // Dispatch event for UI updates
            window.dispatchEvent(new CustomEvent('tierChanged', {
                detail: {
                    tier: 'premium',
                    limit: this.dailyCardLimit,
                    isPremium: true,
                    userId: this.userId
                }
            }));
            
            console.log(`User ${this.userId} upgraded to premium tier`);
            
            return {
                success: true,
                subscriptionId: this.subscriptionId,
                expiresAt: this.premiumEndDate
            };
        } catch (error) {
            console.error('Error upgrading to premium:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    downgradeTier() {
        this.currentTier = 'basic';
        this.premiumStartDate = null;
        this.premiumEndDate = null;
        this.subscriptionId = null;
        this.subscriptionStatus = null;
        this.updateDailyCardLimit();
        this.saveUserData();
    }

    getUserStats() {
        return {
            userId: this.userId,
            currentTier: this.currentTier,
            isPremium: this.isPremium(),
            dailyCardLimit: this.dailyCardLimit,
            cardsUsedToday: this.cardsUsedToday,
            totalCardsGenerated: this.totalCardsGenerated,
            daysActive: this.daysActive,
            premiumStartDate: this.premiumStartDate,
            premiumEndDate: this.premiumEndDate,
            subscriptionId: this.subscriptionId,
            subscriptionStatus: this.subscriptionStatus
        };
    }

    async initializeContentBackends() {
        // Initialize content backend systems if they exist
        try {
            if (typeof DailyContentBackend !== 'undefined') {
                this.dailyContentBackend = new DailyContentBackend();
            }
            if (typeof PremiumContentBackend !== 'undefined') {
                this.premiumContentBackend = new PremiumContentBackend();
            }
            console.log('Content backends initialized successfully');
        } catch (error) {
            console.warn('Some content backends not available:', error.message);
        }
    }

    async getTodaysCards() {
        // Use appropriate content backend based on user tier
        if (this.isPremium() && this.premiumContentBackend) {
            // Premium users get 100 cards from premium backend
            console.log('🌟 Loading premium cards for premium user');
            return this.premiumContentBackend.getTodaysPremiumCards();
        } else if (this.dailyContentBackend) {
            // Basic users get 40 cards from daily backend
            console.log('📋 Loading daily cards for basic user');
            return this.dailyContentBackend.getTodaysCards();
        } else {
            // Fallback to sample cards if backends not available
            console.warn('⚠️ Content backends not available, using fallback cards');
            const cards = [];
            const cardCount = this.dailyCardLimit;
            
            for (let i = 0; i < cardCount; i++) {
                cards.push({
                    id: `card_${i + 1}`,
                    type: this.isPremium() ? 'premium' : 'basic',
                    content: `Sample card ${i + 1} for ${this.currentTier} tier`,
                    category: 'general',
                    difficulty: this.isPremium() ? 'advanced' : 'basic'
                });
            }
            
            return cards;
        }
    }

    canAccessPremiumContent() {
        return this.isPremium();
    }

    getRemainingCards() {
        return Math.max(0, this.dailyCardLimit - this.cardsUsedToday);
    }

    getSubscriptionStatus() {
        if (!this.isPremium()) {
            return {
                status: 'basic',
                message: 'Basic tier - 40 cards per day'
            };
        }
        
        const daysRemaining = Math.ceil(
            (new Date(this.premiumEndDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        return {
            status: 'premium',
            message: `Premium tier - ${daysRemaining} days remaining`,
            expiresAt: this.premiumEndDate
        };
    }

    checkSubscriptionStatus() {
        if (!this.premiumEndDate) {
            return {
                expired: false,
                status: 'basic',
                tier: 'basic'
            };
        }
        
        const now = new Date();
        const endDate = new Date(this.premiumEndDate);
        const expired = now > endDate;
        
        if (expired && this.currentTier === 'premium') {
            // Auto-downgrade if expired
            this.downgradeTier();
        }
        
        return {
            expired: expired,
            status: expired ? 'expired' : 'active',
            tier: this.currentTier,
            expiresAt: this.premiumEndDate,
            daysRemaining: expired ? 0 : Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
        };
    }
}

// Initialize the user tier manager when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    window.userTierManager = new UserTierManager();
    
    // Wait for Firebase auth to initialize
    await window.userTierManager.waitForAuth();
    
    console.log('User Tier Manager initialized with Firebase auth');
});

// Make UserTierManager globally available
if (typeof window !== 'undefined') {
    window.UserTierManager = UserTierManager;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserTierManager;
}

// Export for module usage
export default UserTierManager;