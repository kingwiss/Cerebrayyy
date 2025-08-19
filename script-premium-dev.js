// PREMIUM DEVELOPMENT VERSION - ALL PREMIUM FEATURES ENABLED
// This is a modified version of script.js with premium features unlocked for testing

class BoredomBusterApp {
    constructor() {
        console.log('🌟 PREMIUM DEV MODE - Constructor started...');
        this.cardsContainer = document.getElementById('cardsContainer');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.gameModal = document.getElementById('gameModal');
        this.gameContent = document.getElementById('gameContent');
        this.closeModal = document.getElementById('closeModal');
        
        console.log('DOM elements found:', {
            cardsContainer: !!this.cardsContainer,
            refreshBtn: !!this.refreshBtn,
            gameModal: !!this.gameModal,
            gameContent: !!this.gameContent,
            closeModal: !!this.closeModal
        });
        
        if (!this.cardsContainer) {
            console.error('❌ cardsContainer not found! This will prevent cards from showing.');
            console.error('❌ Available elements with ID cardsContainer:', document.querySelectorAll('#cardsContainer'));
            console.error('❌ Available elements with class cards-container:', document.querySelectorAll('.cards-container'));
        }
        
        // Additional debug logging for modal elements
        if (!this.gameModal) {
            console.error('❌ gameModal not found! Checking document...');
            console.error('❌ gameModal by ID:', document.getElementById('gameModal'));
            console.error('❌ gameModal by querySelector:', document.querySelector('#gameModal'));
        }
        if (!this.gameContent) {
            console.error('❌ gameContent not found! Checking document...');
            console.error('❌ gameContent by ID:', document.getElementById('gameContent'));
            console.error('❌ gameContent by querySelector:', document.querySelector('#gameContent'));
        }
        
        this.currentCards = [];
        this.swipedCardsHistory = []; // Track swiped cards for back button functionality
        
        this.usedContent = new Set(); // Track used facts, riddles, and math problems
        this.contentPools = {}; // Track content pools for each category
        this.sessionStartTime = Date.now(); // Track session start for time-based variation
        this.contentGenerators = this.initializeContentGenerators();
        
        // 🎯 Initialize Daily Content Backend System
        this.dailyContentBackend = null;
        this.dailyCards = [];
        this.currentDailyCardIndex = 0;
        
        // 🌟 PREMIUM DEV MODE - Force premium features
        this.userTierManager = null;
        this.premiumContentBackend = null;
        this.premiumCards = [];
        this.currentPremiumCardIndex = 0;
        this.isPremiumMode = true; // FORCE PREMIUM MODE FOR DEVELOPMENT
        
        // Set premium localStorage for compatibility
        localStorage.setItem('premiumMode', 'true');
        localStorage.setItem('premiumData', JSON.stringify({
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            subscriptionId: 'dev-premium-access'
        }));
        
        console.log('🌟 PREMIUM DEV MODE ACTIVATED - All premium features unlocked!');
        
        // Initialize tier manager and backends asynchronously
        this.initializeTierManager();
        
        // ElevenLabs TTS configuration
        this.elevenLabsApiKey = 'sk_35e98a8d5bfb8244fec7489f5a1228b082a8096cf0566940';
        this.elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';
        this.currentAudio = null;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to true
        this.currentSpeakingCard = null;
        this.selectedVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella - natural female voice
        this.isLoading = false;
        this.audioCache = new Map(); // Cache for generated audio URLs
        this.preloadQueue = new Set(); // Track cards being preloaded
        this.preloadedCards = new Set(); // Track cards that have been preloaded
        this.cachedVoices = null; // Cache browser voices for faster access
        this.bestVoice = null; // Cache the best selected voice
        this.hasShownApiKeyWarning = false; // Track if we've shown the API key warning

        // Initialize audio context for sound effects
        this.audioContext = null;
        this.soundEnabled = true; // Enable sound effects by default
        
        // Enhanced Music System
        this.musicEnabled = false;
        this.musicPlaying = false;
        this.currentMusic = null;
        this.currentTrackIndex = 0;
        
        // Speech synthesis initialization state
        this.speechInitialized = false;
        this.speechReady = false;
        this.pendingCards = new Set(); // Cards waiting for speech to be ready
        
        // Appwrite Authentication
        this.appwriteProjectId = '68930d9a002e313013dc';
        this.appwriteEndpoint = 'https://nyc.cloud.appwrite.io/v1';
        this.currentUser = null;
        this.isSignedIn = false;
        
        // Initialize Appwrite
        this.initializeAppwrite();
        
        // User interaction tracking
        this.userHasInteracted = false;
        
        // PREMIUM DEV MODE - Override all premium checks
        this.overridePremiumChecks();
    }
    
    // PREMIUM DEV MODE - Override all premium check functions
    overridePremiumChecks() {
        console.log('🌟 Overriding premium checks for development mode');
        
        // Override isPremium functions globally
        window.isPremium = () => true;
        window.canAccessPremiumContent = () => true;
        window.hasReachedDailyLimit = () => false;
        
        // Create a mock premium tier manager
        this.mockPremiumTierManager();
    }
    
    mockPremiumTierManager() {
        // Create a mock tier manager that always returns premium status
        const mockTierManager = {
            isPremium: () => true,
            isPremiumUser: () => true,
            getCurrentTier: () => 'premium',
            getDailyCardLimit: () => 1000, // Very high limit
            getCardsUsedToday: () => 0,
            hasReachedDailyLimit: () => false,
            canAccessPremiumContent: () => true,
            getRemainingCards: () => 1000,
            getSubscriptionStatus: () => ({
                status: 'premium',
                message: 'Premium Development Mode - Unlimited Access'
            }),
            incrementCardUsage: () => {}, // No-op
            checkDailyReset: () => {}, // No-op
            saveUserData: () => {} // No-op
        };
        
        // Set as global and instance property (avoid const reassignment)
        if (typeof window.userTierManager === 'undefined') {
            window.userTierManager = mockTierManager;
        }
        this.userTierManager = mockTierManager;
        
        console.log('🌟 Mock premium tier manager created');
    }
    
    // Continue with the rest of the original script.js methods...
    // For brevity, I'll include key methods that need premium overrides
    
    async initializeTierManager() {
        console.log('🌟 PREMIUM DEV - Initializing tier manager with premium access');
        
        try {
            // Force premium tier manager and override all premium checks
            this.mockPremiumTierManager();
            this.overridePremiumChecks();
            
            // Initialize premium content backend
            if (typeof PremiumContentBackend !== 'undefined') {
                try {
                    this.premiumContentBackend = new PremiumContentBackend();
                    console.log('🌟 Premium content backend initialized');
                } catch (e) {
                    console.log('⚠️ Premium content backend not available, using mock');
                    this.premiumContentBackend = null;
                }
            }
            
            // Initialize daily content backend
            if (typeof DailyContentBackend !== 'undefined') {
                try {
                    this.dailyContentBackend = new DailyContentBackend();
                    console.log('📅 Daily content backend initialized');
                } catch (e) {
                    console.log('⚠️ Daily content backend not available, using mock');
                    this.dailyContentBackend = null;
                }
            }
            
            // Load premium cards immediately
            await this.loadPremiumCards();
            
        } catch (error) {
            console.error('Error initializing tier manager:', error);
            // Continue with mock data
            this.loadMockPremiumCards();
        }
    }
    
    async loadPremiumCards() {
        console.log('🌟 PREMIUM DEV - Loading premium cards');
        
        if (this.premiumContentBackend) {
            try {
                this.premiumCards = await this.premiumContentBackend.generatePremiumCards(20);
                console.log('🌟 Premium cards loaded:', this.premiumCards.length);
            } catch (error) {
                console.error('Error loading premium cards:', error);
                this.loadMockPremiumCards();
            }
        } else {
            this.loadMockPremiumCards();
        }
    }
    
    loadMockPremiumCards() {
        console.log('🌟 PREMIUM DEV - Loading mock premium cards');
        this.premiumCards = [
            {
                type: 'Game',
                title: '🌟 Premium Sudoku Master',
                description: 'Advanced Sudoku puzzles with premium hints and solutions',
                action: 'play',
                gameType: 'sudoku',
                category: 'Premium Puzzle'
            },
            {
                type: 'Game',
                title: '🌟 Premium Tetris Deluxe',
                description: 'Classic Tetris with premium power-ups and themes',
                action: 'play',
                gameType: 'tetris',
                category: 'Premium Arcade'
            },
            {
                type: 'Game',
                title: '🌟 Premium Chess Master',
                description: 'Advanced chess with AI analysis and premium tutorials',
                action: 'play',
                gameType: 'chess',
                category: 'Premium Strategy'
            },
            {
                type: 'Content',
                title: '🌟 Premium Brain Training',
                description: 'Exclusive cognitive exercises for premium members',
                action: 'explore',
                category: 'Premium Learning'
            },
            {
                type: 'Content',
                title: '🌟 Premium Trivia Challenge',
                description: 'Advanced trivia questions with detailed explanations',
                action: 'start',
                category: 'Premium Knowledge'
            }
        ];
        console.log('🌟 Mock premium cards loaded:', this.premiumCards.length);
    }
    
    // Override card generation to include premium content
    async generateCards() {
        console.log('🌟 PREMIUM DEV - Generating cards with premium content');
        
        const cards = [];
        
        // Always include premium cards in dev mode
        if (this.premiumCards && this.premiumCards.length > 0) {
            cards.push(...this.premiumCards.slice(0, 10));
        }
        
        // Add regular cards
        const regularCards = await this.generateRegularCards();
        cards.push(...regularCards);
        
        return cards;
    }
    
    async generateRegularCards() {
        // This would contain the original card generation logic
        // For now, return some basic cards
        return [
            {
                type: 'Game',
                title: 'Premium Sudoku',
                description: 'Advanced Sudoku puzzles for premium users',
                action: 'play',
                gameType: 'sudoku',
                category: 'Premium Puzzle'
            },
            {
                type: 'Game',
                title: 'Premium Tetris',
                description: 'Classic Tetris with premium features',
                action: 'play',
                gameType: 'tetris',
                category: 'Premium Arcade'
            }
        ];
    }
    
    // Add initialization method
    async init() {
        console.log('🌟 PREMIUM DEV - Initializing app with premium features');
        
        // Initialize all systems
        await this.initializeTierManager();
        
        // Generate and display cards
        const cards = await this.generateCards();
        this.displayCards(cards);
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('🌟 PREMIUM DEV MODE - App initialized successfully!');
    }
    
    displayCards(cards) {
        if (!this.cardsContainer) {
            console.error('Cards container not found');
            return;
        }
        
        this.cardsContainer.innerHTML = '';
        
        cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.cardsContainer.appendChild(cardElement);
        });
        
        console.log(`🌟 Displayed ${cards.length} cards (including premium content)`);
    }
    
    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card premium-card'; // Mark as premium card
        cardDiv.innerHTML = `
            <div class="card-header">
                <h3>${card.title}</h3>
                <span class="premium-badge">🌟 PREMIUM</span>
            </div>
            <div class="card-content">
                <p>${card.description}</p>
            </div>
            <div class="card-actions">
                <button class="card-btn premium-btn" onclick="app.handleCardAction('${card.action}', ${index})">
                    ${card.action === 'play' ? 'Play Now' : 'Try It'}
                </button>
            </div>
        `;
        
        return cardDiv;
    }
    
    handleCardAction(action, cardIndex) {
        console.log(`🌟 PREMIUM DEV - Handling card action: ${action}`);
        
        if (action === 'play') {
            // Handle game play
            this.playGame(cardIndex);
        }
    }
    
    playGame(cardIndex) {
        console.log(`🌟 PREMIUM DEV - Playing game at index: ${cardIndex}`);
        alert('🌟 Premium game would start here! All premium features are unlocked in dev mode.');
    }
    
    setupEventListeners() {
        // Set up basic event listeners
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.init(); // Reload cards
            });
        }
    }
    
    // Add any other essential methods from the original script.js
    initializeContentGenerators() {
        return {}; // Placeholder
    }
    
    initializeAppwrite() {
        console.log('🌟 PREMIUM DEV - Appwrite initialization (mock)');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 PREMIUM DEV MODE - DOM loaded, initializing app...');
    window.app = new BoredomBusterApp();
    window.app.init();
});

// Export for global access
window.BoredomBusterApp = BoredomBusterApp;

console.log('🌟 PREMIUM DEVELOPMENT SCRIPT LOADED - All premium features unlocked!');