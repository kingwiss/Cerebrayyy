/**
 * User Tier Management System
 * Manages user subscription status and daily content allocation
 * Ensures proper card distribution based on user tier (Basic vs Premium)
 */

class UserTierManager {
    constructor() {
        this.userId = this.getUserId();
        this.today = this.getTodayString();
        this.storageKey = 'boredom_buster_tier_';
        
        // Initialize user tier data
        this.userTierData = this.loadUserTierData();
        
        // Initialize content backends
        this.dailyContentBackend = null;
        this.premiumContentBackend = null;
        
        console.log('🎯 User Tier Manager initialized for user:', this.userId);
        console.log('👑 Current tier:', this.getCurrentTier());
        console.log('📅 Today:', this.today);
    }

    // Get or create unique user ID
    getUserId() {
        let userId = localStorage.getItem('boredom_buster_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('boredom_buster_user_id', userId);
        }
        return userId;
    }

    // Get today's date string
    getTodayString() {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    // Load or initialize user tier data
    loadUserTierData() {
        const stored = localStorage.getItem(this.storageKey + 'data');
        if (stored) {
            const data = JSON.parse(stored);
            // Ensure all required fields exist
            return {
                userId: data.userId || this.userId,
                tier: data.tier || 'basic',
                subscriptionStatus: data.subscriptionStatus || 'inactive',
                subscriptionStartDate: data.subscriptionStartDate || null,
                subscriptionEndDate: data.subscriptionEndDate || null,
                dailyCardLimits: data.dailyCardLimits || {
                    basic: 40,
                    premium: 100
                },
                dailyUsage: data.dailyUsage || {},
                paymentHistory: data.paymentHistory || [],
                trialUsed: data.trialUsed || false,
                joinDate: data.joinDate || new Date().toISOString(),
                lastActiveDate: this.today
            };
        }

        // Create new user tier data
        return {
            userId: this.userId,
            tier: 'basic',
            subscriptionStatus: 'inactive',
            subscriptionStartDate: null,
            subscriptionEndDate: null,
            dailyCardLimits: {
                basic: 40,
                premium: 100
            },
            dailyUsage: {},
            paymentHistory: [],
            trialUsed: false,
            joinDate: new Date().toISOString(),
            lastActiveDate: this.today
        };
    }

    // Save user tier data
    saveUserTierData() {
        this.userTierData.lastActiveDate = this.today;
        localStorage.setItem(this.storageKey + 'data', JSON.stringify(this.userTierData));
    }

    // Get current user tier
    getCurrentTier() {
        // Check if subscription is still active
        if (this.userTierData.tier === 'premium' && this.userTierData.subscriptionEndDate) {
            const endDate = new Date(this.userTierData.subscriptionEndDate);
            const today = new Date();
            
            if (today > endDate) {
                // Subscription expired, downgrade to basic
                this.downgradeTier();
                return 'basic';
            }
        }
        
        return this.userTierData.tier;
    }

    // Check if user is premium
    isPremiumUser() {
        return this.getCurrentTier() === 'premium';
    }

    // Get daily card limit for current tier
    getDailyCardLimit() {
        const tier = this.getCurrentTier();
        return this.userTierData.dailyCardLimits[tier];
    }

    // Get today's card usage
    getTodayUsage() {
        if (!this.userTierData.dailyUsage[this.today]) {
            this.userTierData.dailyUsage[this.today] = {
                cardsGenerated: 0,
                cardsViewed: 0,
                gamesPlayed: 0,
                lastReset: this.today
            };
        }
        return this.userTierData.dailyUsage[this.today];
    }

    // Check if user can get more cards today
    canGetMoreCards() {
        const usage = this.getTodayUsage();
        const limit = this.getDailyCardLimit();
        return usage.cardsGenerated < limit;
    }

    // Get remaining cards for today
    getRemainingCards() {
        const usage = this.getTodayUsage();
        const limit = this.getDailyCardLimit();
        return Math.max(0, limit - usage.cardsGenerated);
    }

    // Initialize content backends based on tier
    async initializeContentBackends() {
        try {
            // Always initialize daily content backend
            if (!this.dailyContentBackend) {
                this.dailyContentBackend = new DailyContentBackend();
            }

            // Initialize premium backend only for premium users
            if (this.isPremiumUser() && !this.premiumContentBackend) {
                this.premiumContentBackend = new PremiumContentBackend();
            }

            console.log('✅ Content backends initialized for tier:', this.getCurrentTier());
        } catch (error) {
            console.error('❌ Failed to initialize content backends:', error);
        }
    }

    // Get today's cards based on user tier
    async getTodaysCards() {
        await this.initializeContentBackends();
        
        const tier = this.getCurrentTier();
        const usage = this.getTodayUsage();
        const limit = this.getDailyCardLimit();

        console.log(`📊 Getting cards for ${tier} user (${usage.cardsGenerated}/${limit} used)`);

        if (tier === 'premium' && this.premiumContentBackend) {
            // Premium users get 100 cards from premium backend
            const cards = this.premiumContentBackend.getTodaysCards();
            this.updateCardUsage(cards.length);
            return cards;
        } else {
            // Basic users get 40 cards from daily backend
            const cards = this.dailyContentBackend.getTodaysCards();
            this.updateCardUsage(cards.length);
            return cards;
        }
    }

    // Update card usage tracking
    updateCardUsage(cardsCount) {
        const usage = this.getTodayUsage();
        usage.cardsGenerated = cardsCount;
        this.saveUserTierData();
    }

    // Mark card as viewed
    markCardAsViewed(cardId) {
        const usage = this.getTodayUsage();
        usage.cardsViewed++;
        
        // Also mark in appropriate backend
        const tier = this.getCurrentTier();
        if (tier === 'premium' && this.premiumContentBackend) {
            this.premiumContentBackend.markCardAsViewed(cardId);
        } else if (this.dailyContentBackend) {
            this.dailyContentBackend.markCardAsViewed(cardId);
        }
        
        this.saveUserTierData();
    }

    // Upgrade user to premium
    upgradeToPremium(subscriptionData) {
        this.userTierData.tier = 'premium';
        this.userTierData.subscriptionStatus = 'active';
        this.userTierData.subscriptionStartDate = subscriptionData.startDate || new Date().toISOString();
        this.userTierData.subscriptionEndDate = subscriptionData.endDate;
        
        // Add payment record
        this.userTierData.paymentHistory.push({
            date: new Date().toISOString(),
            amount: subscriptionData.amount,
            type: 'subscription',
            status: 'completed',
            transactionId: subscriptionData.transactionId
        });

        this.saveUserTierData();
        
        // Initialize premium backend
        this.initializeContentBackends();
        
        console.log('🌟 User upgraded to premium tier');
        return true;
    }

    // Downgrade user to basic
    downgradeTier() {
        this.userTierData.tier = 'basic';
        this.userTierData.subscriptionStatus = 'inactive';
        this.userTierData.subscriptionEndDate = null;
        
        // Clear premium backend
        this.premiumContentBackend = null;
        
        this.saveUserTierData();
        
        console.log('📉 User downgraded to basic tier');
        return true;
    }

    // Start free trial (if not used)
    startFreeTrial(trialDays = 7) {
        if (this.userTierData.trialUsed) {
            return { success: false, message: 'Free trial already used' };
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + trialDays);

        this.userTierData.tier = 'premium';
        this.userTierData.subscriptionStatus = 'trial';
        this.userTierData.subscriptionStartDate = startDate.toISOString();
        this.userTierData.subscriptionEndDate = endDate.toISOString();
        this.userTierData.trialUsed = true;

        this.saveUserTierData();
        this.initializeContentBackends();

        console.log(`🎁 Free trial started for ${trialDays} days`);
        return { 
            success: true, 
            message: `Free trial activated for ${trialDays} days`,
            endDate: endDate.toISOString()
        };
    }

    // Get user statistics
    getUserStats() {
        const tier = this.getCurrentTier();
        const usage = this.getTodayUsage();
        const limit = this.getDailyCardLimit();
        
        return {
            userId: this.userId,
            tier: tier,
            subscriptionStatus: this.userTierData.subscriptionStatus,
            joinDate: this.userTierData.joinDate,
            dailyLimit: limit,
            todayUsage: usage,
            remainingCards: this.getRemainingCards(),
            subscriptionEndDate: this.userTierData.subscriptionEndDate,
            trialUsed: this.userTierData.trialUsed,
            paymentHistory: this.userTierData.paymentHistory,
            features: this.getTierFeatures()
        };
    }

    // Get features for current tier
    getTierFeatures() {
        const tier = this.getCurrentTier();
        
        if (tier === 'premium') {
            return {
                dailyCards: 100,
                newContentRatio: '90%',
                games: 'All premium games (Sudoku, Tetris, Pac-Man, Chess, etc.)',
                categories: 'All categories including premium exclusive',
                audioFeatures: 'Premium voice synthesis',
                support: 'Priority support'
            };
        } else {
            return {
                dailyCards: 40,
                newContentRatio: '80%',
                games: 'Basic games (Tic-Tac-Toe, Connect 4, Chess puzzles)',
                categories: 'Standard categories',
                audioFeatures: 'Basic text-to-speech',
                support: 'Community support'
            };
        }
    }

    // Simulate payment processing (for testing)
    simulatePayment(amount, plan = 'monthly') {
        const transactionId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Calculate subscription end date
        const startDate = new Date();
        const endDate = new Date();
        
        if (plan === 'monthly') {
            endDate.setMonth(startDate.getMonth() + 1);
        } else if (plan === 'yearly') {
            endDate.setFullYear(startDate.getFullYear() + 1);
        }

        const subscriptionData = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            amount: amount,
            transactionId: transactionId
        };

        return this.upgradeToPremium(subscriptionData);
    }

    // Reset daily usage (called at midnight)
    resetDailyUsage() {
        const today = this.getTodayString();
        if (this.userTierData.dailyUsage[today]) {
            this.userTierData.dailyUsage[today] = {
                cardsGenerated: 0,
                cardsViewed: 0,
                gamesPlayed: 0,
                lastReset: today
            };
            this.saveUserTierData();
            console.log('🔄 Daily usage reset for', today);
        }
    }

    // Check and handle subscription expiration
    checkSubscriptionStatus() {
        if (this.userTierData.subscriptionEndDate) {
            const endDate = new Date(this.userTierData.subscriptionEndDate);
            const today = new Date();
            
            if (today > endDate && this.userTierData.tier === 'premium') {
                console.log('⏰ Subscription expired, downgrading user');
                this.downgradeTier();
                return { expired: true, tier: 'basic' };
            }
        }
        
        return { expired: false, tier: this.getCurrentTier() };
    }

    // Get subscription info
    getSubscriptionInfo() {
        if (this.userTierData.tier === 'basic') {
            return {
                tier: 'basic',
                status: 'inactive',
                message: 'Upgrade to Premium for 100 daily cards and exclusive games!'
            };
        }

        const endDate = this.userTierData.subscriptionEndDate ? new Date(this.userTierData.subscriptionEndDate) : null;
        const today = new Date();
        
        if (endDate) {
            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            
            return {
                tier: 'premium',
                status: this.userTierData.subscriptionStatus,
                endDate: this.userTierData.subscriptionEndDate,
                daysRemaining: Math.max(0, daysRemaining),
                message: daysRemaining > 0 ? 
                    `Premium active - ${daysRemaining} days remaining` : 
                    'Subscription expired'
            };
        }

        return {
            tier: 'premium',
            status: 'active',
            message: 'Premium subscription active'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserTierManager;
}