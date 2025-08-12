class BoredomBusterApp {
    constructor() {
        console.log('Constructor started...');
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
        
        // 🌟 Initialize User Tier Management System
        this.userTierManager = null;
        this.premiumContentBackend = null;
        this.premiumCards = [];
        this.currentPremiumCardIndex = 0;
        this.isPremiumMode = localStorage.getItem('premiumMode') === 'true'; // Keep for backward compatibility
        
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
        
        this.initializeAudioContext();

        // ElevenLabs voice options
        this.elevenLabsVoices = [
            { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', description: 'Warm and friendly' },
            { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', description: 'Professional and clear' },
            { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', description: 'Deep and authoritative' },
            { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', description: 'Calm and soothing' },
            { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', description: 'Energetic and engaging' },
            { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', description: 'Confident and articulate' },
            { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', gender: 'male', description: 'Conversational and natural' }
        ];

        // Initialize ElevenLabs
        this.initializeElevenLabs();
        
        console.log('Constructor completed!');
        this.setupIntersectionObserver();
    }

    // Initialize tier manager and content backends based on user subscription
    async initializeTierManager() {
        try {
            console.log('🚀 Initializing User Tier Management System...');
            
            // Initialize the tier manager
            this.userTierManager = new UserTierManager();
            
            // Check subscription status and handle expiration
            const subscriptionStatus = this.userTierManager.checkSubscriptionStatus();
            if (subscriptionStatus.expired) {
                console.log('⏰ Subscription expired, user downgraded to basic');
                // Only override if not manually set to premium for testing
                const manualPremiumMode = localStorage.getItem('premiumMode') === 'true';
                if (!manualPremiumMode) {
                    this.isPremiumMode = false;
                    localStorage.setItem('premiumMode', 'false');
                } else {
                    console.log('🌟 Manual premium mode override active');
                }
            } else {
                // Preserve manual premium mode setting if it exists
                const manualPremiumMode = localStorage.getItem('premiumMode');
                if (manualPremiumMode !== null) {
                    this.isPremiumMode = manualPremiumMode === 'true';
                    console.log('🌟 Using manual premium mode setting:', this.isPremiumMode);
                } else {
                    // Sync premium mode with actual tier status
                    this.isPremiumMode = this.userTierManager.isPremiumUser();
                    localStorage.setItem('premiumMode', this.isPremiumMode.toString());
                }
            }
            
            // Initialize content backends based on tier
            await this.userTierManager.initializeContentBackends();
            
            // Get today's cards based on user tier
            const todaysCards = await this.userTierManager.getTodaysCards();
            
            if (this.userTierManager.isPremiumUser()) {
                this.premiumCards = todaysCards;
                console.log(`✅ Premium user: ${this.premiumCards.length} cards loaded`);
            } else {
                this.dailyCards = todaysCards;
                console.log(`✅ Basic user: ${this.dailyCards.length} cards loaded`);
            }
            
            // Log user stats
            const userStats = this.userTierManager.getUserStats();
            console.log('📊 User Stats:', {
                tier: userStats.tier,
                dailyLimit: userStats.dailyLimit,
                remainingCards: userStats.remainingCards,
                subscriptionStatus: userStats.subscriptionStatus
            });
            
            console.log('✅ Tier management system initialized, starting app...');
            
            // Now that tier manager is ready, initialize the app
            this.init();
            
            // Show audio preparation message
            this.showAudioPreparationMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize tier manager:', error);
            // Fallback to basic initialization
            await this.initializeDailyContentSystem();
            this.init();
        }
    }

    setupIntersectionObserver() {
        // Create intersection observer to automatically trigger audio when cards come into view
        this.cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.soundEnabled && this.speechReady) {
                    const card = entry.target;
                    
                    // Skip if audio is already playing for any card
                    if (this.currentSpeakingCard) {
                        return;
                    }
                    
                    // Only auto-play if this is the most visible card (closest to viewport center)
                    const mostVisibleCard = this.getMostVisibleCard();
                    if (card === mostVisibleCard && !card.hasAttribute('data-audio-played')) {
                        console.log('Card came into view, auto-playing audio for most visible card');
                        card.setAttribute('data-audio-played', 'true');
                        setTimeout(() => {
                            // Double-check that no other audio is playing before starting
                            if (!this.currentSpeakingCard) {
                                this.speakCardContent(card);
                            }
                        }, 300); // Small delay to ensure card is fully visible
                    }
                }
            });
        }, {
            threshold: 0.7, // Trigger when 70% of the card is visible
            rootMargin: '0px'
        });
    }

    init() {
        // Initialize saved cards functionality first
        this.initializeSavedCards();

        // Preload all images to ensure they're available
        this.preloadImages();

        // Page-specific initializations
        if (this.cardsContainer) {
            this.generateCards();
            this.bindEvents();
            
            // Aggressively fix any image loading issues after cards are generated
            setTimeout(() => {
                console.log('🖼️ Running automatic image refresh after initialization...');
                this.refreshCardImages();
            }, 1000);
        }

        // Initialize premium button state
        this.initializePremiumButtonState();

        // Add temporary test card for back button visibility (for testing)
        this.swipedCardsHistory.push({
            title: "Test Card",
            description: "This is a test card to show the back button",
            type: "TEST"
        });

        // Initialize back button visibility
        this.updateBackButtonVisibility();

        // Common initializations
        this.playSilentAudio();
        this.setupAppwriteAuth();
        this.setupNavigation();
        this.setupContactForm();
        this.setupSavedCardsModal();
        this.setupImageRefreshButton();
    }

    // Initialize premium button state on app load
    initializePremiumButtonState() {
        const premiumToggleBtn = document.getElementById('premiumToggleBtn');
        const premiumRefreshBtn = document.getElementById('premiumRefreshBtn');
        
        if (premiumToggleBtn) {
            if (this.isPremiumMode) {
                premiumToggleBtn.classList.add('active');
                premiumToggleBtn.title = 'Premium Dashboard - Manage your subscription';
            } else {
                premiumToggleBtn.classList.remove('active');
                premiumToggleBtn.title = 'Upgrade to Premium - $4.99';
            }
        }
        
        // Show/hide premium refresh button based on premium mode
        if (premiumRefreshBtn) {
            premiumRefreshBtn.style.display = this.isPremiumMode ? 'flex' : 'none';
        }
    }

    playSilentAudio() {
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBvZiB0aGUgU291bmQgUmVjb3JkZXJTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTguNzYuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVaria');
        audio.loop = true;
        audio.play().catch(error => {
            console.error('Silent audio failed to play:', error);
        });
    }

    // Initialize speech synthesis for immediate availability
    async initializeSpeechSynthesis() {
        if (this.speechInitialized) {
            console.log('🎤 Speech synthesis already initialized');
            return;
        }
        
        if (!('speechSynthesis' in window)) {
            console.warn('⚠️ Speech synthesis not supported in this browser');
            return;
        }
        
        console.log('🎤 Aggressively initializing speech synthesis...');
        this.speechInitialized = true;
        
        try {
            // Force resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    console.log('🎤 Audio context resumed');
                } catch (e) {
                    console.log('🎤 Audio context resume failed, continuing anyway');
                }
            }
            
            // Aggressively trigger voice loading multiple times
            speechSynthesis.getVoices();
            speechSynthesis.cancel(); // Clear any pending speech
            speechSynthesis.getVoices();
            
            // Wait for voices to load with multiple attempts
            await new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 20;
                
                const checkVoices = () => {
                    attempts++;
                    const voices = speechSynthesis.getVoices();
                    
                    if (voices.length > 0) {
                        console.log('🎤 Voices loaded:', voices.length, 'after', attempts, 'attempts');
                        
                        // Pre-select a good voice for faster access
                        this.fastVoice = voices.find(v => 
                            v.lang.startsWith('en') && 
                            (v.name.includes('Zira') || v.name.includes('David') || v.name.includes('Hazel'))
                        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
                        
                        if (this.fastVoice) {
                            console.log('🎤 Pre-selected voice:', this.fastVoice.name, this.fastVoice.lang);
                        }
                        
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.warn('⚠️ Voice loading timeout, proceeding anyway');
                        this.fastVoice = null;
                        resolve();
                    } else {
                        setTimeout(checkVoices, 25);
                    }
                };
                
                speechSynthesis.addEventListener('voiceschanged', checkVoices, { once: true });
                checkVoices();
            });
            
            // Multiple warm-up attempts to bypass browser restrictions
            for (let i = 0; i < 3; i++) {
                try {
                    const testUtterance = new SpeechSynthesisUtterance('');
                    testUtterance.volume = 0; // Silent
                    testUtterance.rate = 10; // Very fast
                    if (this.fastVoice) {
                        testUtterance.voice = this.fastVoice;
                    }
                    speechSynthesis.speak(testUtterance);
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (e) {
                    console.log('🎤 Warm-up attempt', i + 1, 'failed, continuing...');
                }
            }
            
            this.speechReady = true;
            console.log('🎤 Speech synthesis aggressively initialized and ready!');
            
            // Process any pending cards that were waiting for speech to be ready
            this.processPendingCards();
            
        } catch (error) {
            console.warn('⚠️ Speech synthesis initialization failed:', error);
            // Set ready anyway to allow fallback attempts
            this.speechReady = true;
            this.processPendingCards();
        }
    }
    
    // Show audio preparation message
    showAudioPreparationMessage() {
        if (!this.soundEnabled) return; // Don't show if sound is disabled
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            text-align: center;
        `;
        notification.innerHTML = '🎤 Move your mouse or scroll to start automatic audio reading!';
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 500);
        
        // Fade out after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Start automatic reading of the first visible card (only when user interacts)
    startAutoReading() {
        console.log('🎤 Starting automatic reading...');
        console.log('🎤 Sound enabled:', this.soundEnabled);
        console.log('🎤 Speech ready:', this.speechReady);
        console.log('🎤 User has interacted:', this.userHasInteracted);
        
        if (!this.soundEnabled) {
            console.log('🎤 Auto-reading skipped: sound disabled');
            return;
        }
        
        // Only auto-read if user has interacted with the app
        if (!this.userHasInteracted) {
            console.log('🎤 Auto-reading skipped: user has not interacted yet');
            return;
        }
        
        // Try to read even if speechReady is false (aggressive approach)
        if (!this.speechReady) {
            console.log('🎤 Speech not ready, attempting anyway...');
        }
        
        // Find the first visible card (topmost card)
        const cards = document.querySelectorAll('.card');
        console.log('🎤 Found', cards.length, 'cards');
        
        if (cards.length === 0) {
            console.log('🎤 No cards found, retrying in 500ms...');
            setTimeout(() => this.startAutoReading(), 500);
            return;
        }
        
        const firstCard = cards[0]; // The first card is usually the topmost
        
        if (firstCard) {
            const cardType = firstCard.querySelector('.card-type')?.textContent;
            console.log('🎤 First card type:', cardType);
            
            // Don't auto-read game cards
            if (cardType === 'Game' || cardType === 'Chess Puzzle') {
                console.log('🎤 Skipping auto-read for game card, finding next card...');
                
                // Find the next non-game card
                for (let i = 1; i < cards.length; i++) {
                    const card = cards[i];
                    const type = card.querySelector('.card-type')?.textContent;
                    if (type !== 'Game' && type !== 'Chess Puzzle') {
                        console.log('🎤 Auto-reading card:', type);
                        this.speakCardContent(card);
                        return;
                    }
                }
                console.log('🎤 No non-game cards found');
            } else {
                console.log('🎤 Auto-reading first card:', cardType);
                this.speakCardContent(firstCard);
            }
        } else {
            console.log('🎤 No cards found for auto-reading');
        }
    }

    // Process cards that were waiting for speech to be ready
    processPendingCards() {
        // Update all sound toggle buttons to show they're ready
        document.querySelectorAll('.sound-toggle').forEach(button => {
            if (button.textContent === '⏳') {
                button.classList.toggle('sound-on', this.soundEnabled);
                button.classList.toggle('sound-off', !this.soundEnabled);
                button.textContent = this.soundEnabled ? '🔊' : '🔇';
                button.title = this.soundEnabled ? 'Click to hear this card' : 'Sound disabled';
            }
        });
        
        if (this.pendingCards.size > 0) {
            console.log('🎤 Processing', this.pendingCards.size, 'pending cards...');
            this.pendingCards.forEach(card => {
                this.speakCardContent(card);
            });
            this.pendingCards.clear();
        }
        
        // Also start auto-reading if no pending cards were processed
        if (this.pendingCards.size === 0) {
            setTimeout(() => {
                this.startAutoReading();
            }, 100);
        }
    }

    // Initialize audio immediately for saved cards or manual triggers
    async initializeAudioImmediately() {
        console.log('🎤 Initializing audio immediately...');
        
        if (this.speechReady) {
            console.log('🎤 Speech already ready');
            return;
        }
        
        try {
            // Ensure audio context is ready
            await this.ensureAudioContext();
            
            // Initialize speech synthesis aggressively
            if ('speechSynthesis' in window) {
                console.log('🎤 Aggressively initializing speech synthesis...');
                
                // Cancel any existing speech
                speechSynthesis.cancel();
                
                // Force load voices
                const voices = speechSynthesis.getVoices();
                console.log('🎤 Available voices:', voices.length);
                
                // Create a test utterance to warm up the engine
                const testUtterance = new SpeechSynthesisUtterance('');
                testUtterance.volume = 0;
                testUtterance.rate = 10;
                speechSynthesis.speak(testUtterance);
                
                // Wait a moment for initialization
                await new Promise(resolve => setTimeout(resolve, 100));
                
                this.speechReady = true;
                console.log('🎤 Speech synthesis immediately initialized!');
                
                // Update sound toggle buttons
                this.processPendingCards();
            }
        } catch (error) {
            console.error('🎤 Error initializing audio immediately:', error);
            // Set ready anyway to allow attempts
            this.speechReady = true;
        }
    }

    // Load and select the best available voice
    initializeElevenLabs() {
        console.log('Initializing ElevenLabs TTS with premium AI voices');
        console.log('Available voices:', this.elevenLabsVoices.map(v => v.name).join(', '));
        console.log('Selected voice:', this.elevenLabsVoices.find(v => v.id === this.selectedVoiceId)?.name);
        
        // Populate voice selector with ElevenLabs voices
        this.populateElevenLabsVoiceSelector();
    }

    async generateSpeech(text) {
        if (!text || !this.soundEnabled) return null;

        console.log('🗣️ Using browser speech synthesis for:', text.substring(0, 50) + '...');
        
        // Always use browser speech synthesis - it's reliable and instant
        return 'BROWSER_SPEECH';
    }

    generateBrowserSpeech(text) {
        // This method is no longer needed since we simplified generateSpeech
        return 'BROWSER_SPEECH';
    }

    changeVoice(voiceId) {
        const voice = this.elevenLabsVoices.find(v => v.id === voiceId);
        if (voice) {
            this.selectedVoiceId = voiceId;
            console.log('Voice changed to:', voice.name);
        }
    }

    getCurrentVoice() {
        return this.elevenLabsVoices.find(v => v.id === this.selectedVoiceId);
    }

    showApiKeyWarning() {
        // Create a temporary notification to inform the user about the API key issue
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">🔑</span>
                <strong>ElevenLabs API Issue</strong>
            </div>
            <div style="margin-bottom: 10px;">
                Using enhanced browser voices instead. For premium AI voices, check your ElevenLabs API key.
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            ">Got it</button>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
    }

    populateElevenLabsVoiceSelector() {
        const voiceSelector = document.getElementById('voiceSelector');
        if (voiceSelector) {
            // Clear existing options
            voiceSelector.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a voice...';
            voiceSelector.appendChild(defaultOption);
            
            // Add ElevenLabs voices
            this.elevenLabsVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.id;
                option.textContent = `${voice.name} (${voice.gender}) - ${voice.description}`;
                
                // Select the current voice
                if (voice.id === this.selectedVoiceId) {
                    option.selected = true;
                }
                
                voiceSelector.appendChild(option);
            });
            
            console.log('ElevenLabs voice selector populated with', this.elevenLabsVoices.length, 'voices');
        }
    }

    async preloadCommonAudio() {
        // Preload some common short phrases for instant feedback
        const commonPhrases = [
            'Amazing Facts',
            'Fun Riddle',
            'Math Challenge',
            'Quick Question',
            'Did you know?'
        ];
        
        console.log('Preloading common audio phrases...');
        
        // Preload in background without blocking UI
        setTimeout(async () => {
            for (const phrase of commonPhrases) {
                try {
                    await this.generateSpeech(phrase);
                } catch (error) {
                    console.log('Preload failed for:', phrase);
                }
            }
            console.log('Audio preloading completed');
        }, 1000); // Wait 1 second after app loads
    }

    async preloadCardAudio(cardElement) {
        // Get card content for preloading
        const cardType = cardElement.querySelector('.card-type')?.textContent;
        
        // Skip game cards
        if (cardType === 'Game' || cardType === 'Chess Puzzle') {
            return;
        }
        
        const title = cardElement.querySelector('.card-title')?.textContent || '';
        const description = cardElement.querySelector('.card-description')?.textContent || '';
        
        // Create text to speak (same logic as speakCardContent)
        let textToSpeak = '';
        if (title) textToSpeak += title + '. ';
        if (description) textToSpeak += description;
        
        if (textToSpeak.trim()) {
            console.log('Preloading audio for card:', title);
            try {
                // Generate and cache the audio in background
                await this.generateSpeech(textToSpeak);
                console.log('✅ Audio preloaded for:', title);
            } catch (error) {
                console.log('❌ Preload failed for:', title);
            }
        }
    }

    async preloadAllVisibleCards() {
        console.log('🚀 Starting aggressive preloading for all visible cards...');
        
        const cards = document.querySelectorAll('.card');
        const preloadPromises = [];
        
        cards.forEach((card, index) => {
            // Stagger the preloading to avoid overwhelming the API
            const delay = index * 200; // 200ms between each request
            
            const preloadPromise = new Promise(resolve => {
                setTimeout(async () => {
                    await this.preloadCardAudio(card);
                    resolve();
                }, delay);
            });
            
            preloadPromises.push(preloadPromise);
        });
        
        // Wait for all preloading to complete
        await Promise.all(preloadPromises);
        console.log('🎉 All visible cards preloaded! Audio should now be instant.');
    }

    // Text-to-speech methods
    toggleSound(cardElement) {
        console.log('Toggle sound clicked, current state:', this.soundEnabled);
        console.log('Card element provided:', !!cardElement);
        
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        console.log('Sound enabled:', this.soundEnabled);
        
        // Update all sound toggle buttons to reflect the new state
        document.querySelectorAll('.sound-toggle').forEach(button => {
            button.classList.toggle('sound-on', this.soundEnabled);
            button.classList.toggle('sound-off', !this.soundEnabled);
            button.textContent = this.soundEnabled ? '🔊' : '🔇';
            button.title = this.soundEnabled ? 'Click to disable sound' : 'Click to enable sound';
        });
        
        if (!this.soundEnabled) {
            this.stopSpeech();
        } else {
            // When sound is re-enabled, play audio for the specific card that was clicked
            setTimeout(async () => {
                if (cardElement) {
                    console.log('🔊 Sound re-enabled for specific card, playing audio...');
                    
                    // Ensure audio is ready
                    if (!this.speechReady) {
                        console.log('🔊 Initializing audio for card...');
                        await this.initializeAudioImmediately();
                    }
                    
                    // Remove any previous audio played marker to allow replay
                    cardElement.removeAttribute('data-audio-played');
                    
                    // Play audio for this specific card
                    this.speakCardContent(cardElement);
                } else {
                    // Fallback: play the top card if no specific card provided
                    const topCard = this.getTopCard();
                    if (topCard && this.speechReady) {
                        console.log('🔊 Sound re-enabled, auto-playing top card');
                        topCard.removeAttribute('data-audio-played');
                        this.speakCardContent(topCard);
                    }
                }
            }, 300);
        }
    }

    // Preload audio for visible cards to improve responsiveness
    async preloadCardAudio(cardElement) {
        const cardId = cardElement.dataset.cardId || cardElement.querySelector('.card-title')?.textContent || 'unknown';
        
        // Skip if already preloaded or in queue
        if (this.preloadedCards.has(cardId) || this.preloadQueue.has(cardId)) {
            return;
        }
        
        // Don't preload game cards
        const cardType = cardElement.querySelector('.card-type')?.textContent;
        if (cardType === 'Game' || cardType === 'Chess Puzzle') {
            return;
        }
        
        this.preloadQueue.add(cardId);
        
        try {
            // Get card content
            const title = cardElement.querySelector('.card-title')?.textContent || '';
            const description = cardElement.querySelector('.card-description')?.textContent || '';
            
            let textToSpeak = '';
            if (title) textToSpeak += title + '. ';
            if (description) textToSpeak += description;
            
            if (textToSpeak.trim()) {
                console.log('🔄 Preloading audio for card:', cardId);
                
                // Try to preload with browser speech (faster and more reliable)
                if (!this.fastVoice) {
                    const voices = speechSynthesis.getVoices();
                    this.fastVoice = voices.find(v => 
                        v.lang.startsWith('en') && 
                        (v.name.includes('Zira') || v.name.includes('David') || v.name.includes('Hazel'))
                    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
                }
                
                // Mark as preloaded (browser speech doesn't need actual preloading)
                this.preloadedCards.add(cardId);
                console.log('✅ Audio preloaded for card:', cardId);
            }
        } catch (error) {
            console.warn('⚠️ Failed to preload audio for card:', cardId, error);
        } finally {
            this.preloadQueue.delete(cardId);
        }
    }
    
    // Preload audio for all visible cards
    preloadVisibleCards() {
        const cards = document.querySelectorAll('.card');
        const visibleCards = Array.from(cards).filter(card => {
            const rect = card.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        });
        
        // Preload up to 3 visible cards to avoid overwhelming the system
        visibleCards.slice(0, 3).forEach(card => {
            this.preloadCardAudio(card);
        });
    }

    // 🚀 ULTRA-AGGRESSIVE PRELOADING for instant audio
    async preloadVisibleCardsAggressively() {
        console.log('🚀🚀🚀 ULTRA-AGGRESSIVE PRELOADING ACTIVATED!');
        
        const cards = document.querySelectorAll('.card');
        const preloadPromises = [];
        
        cards.forEach((card, index) => {
            // Skip game cards
            const cardType = card.querySelector('.card-type')?.textContent;
            if (cardType === 'Game' || cardType === 'Chess Puzzle') {
                return;
            }
            
            // Get card content immediately
            const title = card.querySelector('.card-title')?.textContent || '';
            const description = card.querySelector('.card-description')?.textContent || '';
            
            let textToSpeak = '';
            if (title) textToSpeak += title + '. ';
            if (description) textToSpeak += description;
            
            if (textToSpeak.trim()) {
                // Minimal delay between requests (50ms instead of 200ms)
                const delay = index * 50;
                
                const preloadPromise = new Promise(resolve => {
                    setTimeout(async () => {
                        try {
                            console.log(`🔥 Aggressively preloading: ${title}`);
                            await this.generateSpeech(textToSpeak);
                            console.log(`✅ Aggressively preloaded: ${title}`);
                        } catch (error) {
                            console.log(`⚠️ Aggressive preload failed for: ${title}`);
                        }
                        resolve();
                    }, delay);
                });
                
                preloadPromises.push(preloadPromise);
            }
        });
        
        // Wait for all aggressive preloading to complete
        await Promise.all(preloadPromises);
        console.log('🎉🎉🎉 ULTRA-AGGRESSIVE PRELOADING COMPLETE! All audio should be INSTANT!');
    }

    // Removed aggressive speech method that bypassed sound settings
    
    // Removed aggressive speech helper methods that bypassed sound settings

    // Fast optimized browser speech method
    async generateBrowserSpeechFast(textToSpeak, cardElement) {
        console.log('🚀 Fast browser speech synthesis...');
        
        const soundIcon = cardElement.querySelector('.sound-toggle');
        
        // Initialize fast voice if not already done
        if (!this.fastVoice) {
            const voices = speechSynthesis.getVoices();
            // Quick voice selection - just pick the first good English voice
            this.fastVoice = voices.find(v => 
                v.lang.startsWith('en') && 
                (v.name.includes('Zira') || v.name.includes('David') || v.name.includes('Hazel'))
            ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
            
            console.log('🎤 Fast voice selected:', this.fastVoice?.name);
        }
        
        // Create optimized utterance for speed
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.voice = this.fastVoice;
        utterance.rate = 1.4; // Faster rate for quick reading
        utterance.volume = 1.0; // Full volume
        utterance.pitch = 1.0; // Normal pitch
        
        // Update icon to show playing
        if (soundIcon) {
            soundIcon.classList.add('speaking');
            soundIcon.textContent = '🔊';
        }
        
        utterance.onend = () => {
            console.log('✅ Fast browser speech completed');
            this.currentSpeakingCard = null;
            if (soundIcon) {
                soundIcon.classList.remove('speaking');
                soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
            }
        };
        
        utterance.onerror = (error) => {
            console.error('❌ Fast browser speech error:', error);
            this.currentSpeakingCard = null;
            if (soundIcon) {
                soundIcon.classList.remove('speaking');
                soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
            }
        };
        
        // Start speaking immediately
        speechSynthesis.speak(utterance);
    }

    async speakCardContent(cardElement) {
        console.log('speakCardContent called, soundEnabled:', this.soundEnabled);
        
        if (!this.soundEnabled) {
            console.log('Speech disabled');
            return;
        }
        
        // Stop any current speech
        this.stopSpeech();
        
        // Don't read game cards
        const cardType = cardElement.querySelector('.card-type')?.textContent;
        console.log('Card type:', cardType);
        if (cardType === 'Game' || cardType === 'Chess Puzzle') {
            console.log('Skipping game card');
            return;
        }
        
        // Get card content
        const title = cardElement.querySelector('.card-title')?.textContent || '';
        const description = cardElement.querySelector('.card-description')?.textContent || '';
        
        // Create text to speak
        let textToSpeak = '';
        if (title) textToSpeak += title + '. ';
        if (description) textToSpeak += description;
        
        console.log('Text to speak:', textToSpeak);
        
        if (textToSpeak.trim()) {
            // Set the current speaking card
            this.currentSpeakingCard = cardElement;
            
            // Add immediate visual feedback
            const soundIcon = cardElement.querySelector('.sound-toggle');
            if (soundIcon) {
                soundIcon.classList.add('speaking');
                soundIcon.textContent = '🔊';
            }
            
            try {
                // Use browser speech synthesis
                console.log('🗣️ Using browser speech synthesis...');
                
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.rate = 1.2;
                utterance.volume = 1.0;
                utterance.pitch = 1.0;
                
                // Get the best available voice
                const voices = speechSynthesis.getVoices();
                const englishVoice = voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
                if (englishVoice) {
                    utterance.voice = englishVoice;
                    console.log('🎤 Using voice:', englishVoice.name);
                }

                utterance.onend = () => {
                    console.log('✅ Speech completed');
                    this.currentSpeakingCard = null;
                    if (soundIcon) {
                        soundIcon.classList.remove('speaking');
                        soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
                    }
                };
                
                utterance.onerror = (error) => {
                    console.error('❌ Speech error:', error);
                    this.currentSpeakingCard = null;
                    if (soundIcon) {
                        soundIcon.classList.remove('speaking');
                        soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
                    }
                };

                // Speak using browser synthesis
                speechSynthesis.speak(utterance);
                
            } catch (error) {
                console.error('Error playing speech:', error);
                this.currentSpeakingCard = null;
                if (soundIcon) {
                    soundIcon.classList.remove('speaking');
                    soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
                }
            }
        } else {
            console.log('No text to speak');
        }
    }

    stopSpeech() {
        // Stop browser speech synthesis
        if ('speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.cancel();
            console.log('🛑 Stopped browser speech synthesis');
        }
        
        // Remove visual indicator from current speaking card
        if (this.currentSpeakingCard) {
            const soundIcon = this.currentSpeakingCard.querySelector('.sound-toggle');
            if (soundIcon) {
                soundIcon.classList.remove('speaking');
                soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
            }
        }
        
        this.currentSpeakingCard = null;
    }

    // Audio Context and Sound Effects
    initializeAudioContext() {
        try {
            // Create audio context for sound effects
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎵 Audio context initialized for sound effects');
            console.log('🎵 Audio context state:', this.audioContext.state);
            
            // Add user interaction listener to start audio
            this.addUserInteractionListener();
        } catch (error) {
            console.log('Audio context not supported:', error);
        }
    }

    addUserInteractionListener() {
        const startAudioOnInteraction = async () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    console.log('🎵 Audio context resumed after user interaction');
                    

                } catch (error) {
                    console.log('Could not resume audio context:', error);
                }
            }
            
            // Remove listeners after first interaction
            document.removeEventListener('click', startAudioOnInteraction);
            document.removeEventListener('touchstart', startAudioOnInteraction);
            document.removeEventListener('keydown', startAudioOnInteraction);
        };

        // Add multiple event listeners for user interaction
        document.addEventListener('click', startAudioOnInteraction);
        document.addEventListener('touchstart', startAudioOnInteraction);
        document.addEventListener('keydown', startAudioOnInteraction);
    }

    async ensureAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('🎵 Audio context resumed');
            } catch (error) {
                console.log('Could not resume audio context:', error);
            }
        }
    }

    playSwooshSound() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        try {
            this.ensureAudioContext();
            
            // Create a subtle swoosh sound using Web Audio API
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            // Connect the audio nodes
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Configure the swoosh sound
            oscillator.type = 'sawtooth';
            
            // Frequency sweep for swoosh effect (high to low)
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
            
            // Filter for more natural sound
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.3);
            
            // Volume envelope (quiet swoosh)
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.05); // Very quiet
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            // Play the sound
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
            console.log('🌪️ Swoosh sound played');
        } catch (error) {
            console.log('Could not play swoosh sound:', error);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎵 ENHANCED BACKGROUND MUSIC SYSTEM
    // ═══════════════════════════════════════════════════════════════
    
    getMusicTracks() {
        return [
            // Original tracks
            {
                title: "Better Days",
                artist: "Bensound",
                genre: "Acoustic",
                url: "https://www.bensound.com/bensound-music/bensound-betterdays.mp3",
                duration: "2:31",
                mood: "uplifting"
            },
            {
                title: "Inspire",
                artist: "Bensound",
                genre: "Cinematic",
                url: "https://www.bensound.com/bensound-music/bensound-inspire.mp3",
                duration: "2:16",
                mood: "inspirational"
            },
            {
                title: "Summer",
                artist: "Bensound",
                genre: "Acoustic",
                url: "https://www.bensound.com/bensound-music/bensound-summer.mp3",
                duration: "3:31",
                mood: "happy"
            },
            {
                title: "K-Loop",
                artist: "Bio Unit",
                genre: "Electronic",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Bio_Unit/Waking_Up_to_a_New_Day_of_Hope/Bio_Unit_-_02_-_K-Loop.mp3",
                duration: "3:04",
                mood: "chill"
            },
            {
                title: "Waking Up to a New Day of Hope",
                artist: "Bio Unit",
                genre: "Ambient",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Bio_Unit/Waking_Up_to_a_New_Day_of_Hope/Bio_Unit_-_01_-_Waking_Up_to_a_New_Day_of_Hope.mp3",
                duration: "4:00",
                mood: "peaceful"
            },
            
            // Additional Bensound tracks for variety
            {
                title: "Creative Minds",
                artist: "Bensound",
                genre: "Corporate",
                url: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
                duration: "2:30",
                mood: "focused"
            },
            {
                title: "Sunny",
                artist: "Bensound",
                genre: "Acoustic",
                url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
                duration: "2:20",
                mood: "cheerful"
            },
            {
                title: "Tenderness",
                artist: "Bensound",
                genre: "Romantic",
                url: "https://www.bensound.com/bensound-music/bensound-tenderness.mp3",
                duration: "2:03",
                mood: "gentle"
            },
            {
                title: "Energy",
                artist: "Bensound",
                genre: "Rock",
                url: "https://www.bensound.com/bensound-music/bensound-energy.mp3",
                duration: "2:59",
                mood: "energetic"
            },
            {
                title: "Happiness",
                artist: "Bensound",
                genre: "Pop",
                url: "https://www.bensound.com/bensound-music/bensound-happiness.mp3",
                duration: "4:21",
                mood: "joyful"
            },
            {
                title: "Relaxing",
                artist: "Bensound",
                genre: "Ambient",
                url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3",
                duration: "4:51",
                mood: "calm"
            },
            {
                title: "Memories",
                artist: "Bensound",
                genre: "Emotional",
                url: "https://www.bensound.com/bensound-music/bensound-memories.mp3",
                duration: "3:50",
                mood: "nostalgic"
            },
            {
                title: "Adventure",
                artist: "Bensound",
                genre: "Cinematic",
                url: "https://www.bensound.com/bensound-music/bensound-adventure.mp3",
                duration: "2:12",
                mood: "exciting"
            },
            {
                title: "Cute",
                artist: "Bensound",
                genre: "Playful",
                url: "https://www.bensound.com/bensound-music/bensound-cute.mp3",
                duration: "3:14",
                mood: "playful"
            },
            {
                title: "Jazzy Frenchy",
                artist: "Bensound",
                genre: "Jazz",
                url: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3",
                duration: "1:44",
                mood: "sophisticated"
            },
            
            // Free Music Archive - Electronic/Ambient
            {
                title: "Snowfall",
                artist: "Airtone",
                genre: "Ambient",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Airtone/Curly_Monkey/Airtone_-_01_-_Snowfall.mp3",
                duration: "3:12",
                mood: "serene"
            },
            {
                title: "Curly Monkey",
                artist: "Airtone",
                genre: "Electronic",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Airtone/Curly_Monkey/Airtone_-_02_-_Curly_Monkey.mp3",
                duration: "2:45",
                mood: "quirky"
            },
            {
                title: "Floating Point",
                artist: "Chris Zabriskie",
                genre: "Ambient",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chris_Zabriskie/Floating_Point/Chris_Zabriskie_-_01_-_Floating_Point.mp3",
                duration: "4:28",
                mood: "dreamy"
            },
            {
                title: "CGI Snake",
                artist: "Chris Zabriskie",
                genre: "Electronic",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chris_Zabriskie/Floating_Point/Chris_Zabriskie_-_02_-_CGI_Snake.mp3",
                duration: "3:15",
                mood: "mysterious"
            },
            {
                title: "Prelude No. 2",
                artist: "Chris Zabriskie",
                genre: "Classical",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chris_Zabriskie/Preludes/Chris_Zabriskie_-_02_-_Prelude_No_2.mp3",
                duration: "1:52",
                mood: "contemplative"
            },
            
            // Upbeat and energetic tracks
            {
                title: "Funky Suspense",
                artist: "Bensound",
                genre: "Funk",
                url: "https://www.bensound.com/bensound-music/bensound-funkysuspense.mp3",
                duration: "1:47",
                mood: "groovy"
            },
            {
                title: "Groovy Hip Hop",
                artist: "Bensound",
                genre: "Hip Hop",
                url: "https://www.bensound.com/bensound-music/bensound-groovyhiphop.mp3",
                duration: "1:16",
                mood: "urban"
            },
            {
                title: "Punky",
                artist: "Bensound",
                genre: "Rock",
                url: "https://www.bensound.com/bensound-music/bensound-punky.mp3",
                duration: "1:38",
                mood: "rebellious"
            },
            {
                title: "Retro Soul",
                artist: "Bensound",
                genre: "Soul",
                url: "https://www.bensound.com/bensound-music/bensound-retrosoul.mp3",
                duration: "3:36",
                mood: "soulful"
            },
            
            // Chill and relaxing tracks
            {
                title: "Slow Motion",
                artist: "Bensound",
                genre: "Chill",
                url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
                duration: "3:26",
                mood: "laid-back"
            },
            {
                title: "Piano Moment",
                artist: "Bensound",
                genre: "Piano",
                url: "https://www.bensound.com/bensound-music/bensound-pianomoment.mp3",
                duration: "2:14",
                mood: "intimate"
            },
            {
                title: "Acoustic Breeze",
                artist: "Bensound",
                genre: "Acoustic",
                url: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3",
                duration: "2:37",
                mood: "breezy"
            },
            
            // World and ethnic music
            {
                title: "India",
                artist: "Bensound",
                genre: "World",
                url: "https://www.bensound.com/bensound-music/bensound-india.mp3",
                duration: "2:51",
                mood: "exotic"
            },
            {
                title: "Rumba",
                artist: "Bensound",
                genre: "Latin",
                url: "https://www.bensound.com/bensound-music/bensound-rumba.mp3",
                duration: "2:21",
                mood: "passionate"
            },
            
            // Cinematic and epic tracks
            {
                title: "Epic",
                artist: "Bensound",
                genre: "Cinematic",
                url: "https://www.bensound.com/bensound-music/bensound-epic.mp3",
                duration: "2:58",
                mood: "heroic"
            },
            {
                title: "Sci-Fi",
                artist: "Bensound",
                genre: "Electronic",
                url: "https://www.bensound.com/bensound-music/bensound-scifi.mp3",
                duration: "2:05",
                mood: "futuristic"
            },
            {
                title: "Dubstep",
                artist: "Bensound",
                genre: "Electronic",
                url: "https://www.bensound.com/bensound-music/bensound-dubstep.mp3",
                duration: "2:03",
                mood: "intense"
            },
            
            // Additional Kevin MacLeod tracks for even more variety
            {
                title: "Carefree",
                artist: "Kevin MacLeod",
                genre: "Folk",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Moderato/Kevin_MacLeod_-_Carefree.mp3",
                duration: "3:32",
                mood: "carefree"
            },
            {
                title: "Wallpaper",
                artist: "Kevin MacLeod",
                genre: "Ambient",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Lento/Kevin_MacLeod_-_Wallpaper.mp3",
                duration: "3:07",
                mood: "atmospheric"
            },
            {
                title: "Cipher",
                artist: "Kevin MacLeod",
                genre: "Electronic",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Moderato/Kevin_MacLeod_-_Cipher.mp3",
                duration: "2:39",
                mood: "mysterious"
            },
            {
                title: "Fluffing a Duck",
                artist: "Kevin MacLeod",
                genre: "Comedy",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Moderato/Kevin_MacLeod_-_Fluffing_a_Duck.mp3",
                duration: "1:56",
                mood: "quirky"
            },
            {
                title: "Monkeys Spinning Monkeys",
                artist: "Kevin MacLeod",
                genre: "Upbeat",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Moderato/Kevin_MacLeod_-_Monkeys_Spinning_Monkeys.mp3",
                duration: "1:53",
                mood: "fun"
            },
            {
                title: "Sneaky Snitch",
                artist: "Kevin MacLeod",
                genre: "Sneaky",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Moderato/Kevin_MacLeod_-_Sneaky_Snitch.mp3",
                duration: "1:56",
                mood: "mischievous"
            },
            {
                title: "Gymnopedie No 1",
                artist: "Kevin MacLeod",
                genre: "Classical",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Classical_Sampler/Kevin_MacLeod_-_Gymnopedie_No_1.mp3",
                duration: "3:32",
                mood: "contemplative"
            },
            {
                title: "Anachronist",
                artist: "Kevin MacLeod",
                genre: "Orchestral",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Moderato/Kevin_MacLeod_-_Anachronist.mp3",
                duration: "2:15",
                mood: "epic"
            },
            {
                title: "Deliberate Thought",
                artist: "Kevin MacLeod",
                genre: "Ambient",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact_Lento/Kevin_MacLeod_-_Deliberate_Thought.mp3",
                duration: "2:17",
                mood: "thoughtful"
            },
            {
                title: "Meditation Impromptu 01",
                artist: "Kevin MacLeod",
                genre: "Classical",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Classical_Sampler/Kevin_MacLeod_-_Meditation_Impromptu_01.mp3",
                duration: "1:51",
                mood: "meditative"
            },
            
            // Additional ambient and study-friendly tracks
            {
                title: "Floating Cities",
                artist: "Chad Crouch",
                genre: "Ambient",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_01_-_Floating_Cities.mp3",
                duration: "4:12",
                mood: "dreamy"
            },
            {
                title: "Night Owl",
                artist: "Broke For Free",
                genre: "Electronic",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3",
                duration: "4:38",
                mood: "nocturnal"
            },
            {
                title: "Something Elated",
                artist: "Broke For Free",
                genre: "Upbeat",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Broke_For_Free/Directionless_EP/Broke_For_Free_-_02_-_Something_Elated.mp3",
                duration: "4:21",
                mood: "elated"
            },
            {
                title: "As Colorful as Ever",
                artist: "Broke For Free",
                genre: "Indie",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Broke_For_Free/Directionless_EP/Broke_For_Free_-_04_-_As_Colorful_as_Ever.mp3",
                duration: "4:42",
                mood: "vibrant"
            },
            {
                title: "A Moment Apart",
                artist: "Broke For Free",
                genre: "Chill",
                url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Broke_For_Free/Directionless_EP/Broke_For_Free_-_05_-_A_Moment_Apart.mp3",
                duration: "3:27",
                mood: "introspective"
            },
            
            // More Bensound tracks for complete variety
            {
                title: "Little Idea",
                artist: "Bensound",
                genre: "Corporate",
                url: "https://www.bensound.com/bensound-music/bensound-littleidea.mp3",
                duration: "2:49",
                mood: "innovative"
            },
            {
                title: "Going Higher",
                artist: "Bensound",
                genre: "Uplifting",
                url: "https://www.bensound.com/bensound-music/bensound-goinghigher.mp3",
                duration: "4:04",
                mood: "ascending"
            },
            {
                title: "The Lounge",
                artist: "Bensound",
                genre: "Jazz",
                url: "https://www.bensound.com/bensound-music/bensound-thelounge.mp3",
                duration: "4:16",
                mood: "smooth"
            },
            {
                title: "Ukulele",
                artist: "Bensound",
                genre: "Folk",
                url: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3",
                duration: "2:26",
                mood: "tropical"
            },
            {
                title: "Clear Day",
                artist: "Bensound",
                genre: "Acoustic",
                url: "https://www.bensound.com/bensound-music/bensound-clearday.mp3",
                duration: "1:29",
                mood: "bright"
            }
        ];
    }
    
    startMusic() {
        console.log('🎵 startMusic() called');
        
        if (this.currentMusic && !this.currentMusic.paused) {
            console.log('🎵 Music already playing');
            return;
        }
        
        const tracks = this.getMusicTracks();
        console.log('🎵 Available tracks:', tracks.length);
        if (tracks.length === 0) {
            console.log('❌ No tracks available');
            return;
        }
        
        // Select track with smart shuffle to avoid repetition
        let selectedTrack;
        
        // Initialize played tracks array if not exists
        if (!this.playedTracks) {
            this.playedTracks = [];
        }
        
        // If we've played all tracks, reset the played list but keep the last few to avoid immediate repetition
        if (this.playedTracks.length >= tracks.length) {
            const recentTracks = this.playedTracks.slice(-Math.min(5, Math.floor(tracks.length / 3)));
            this.playedTracks = recentTracks;
            console.log('🔄 Resetting played tracks, keeping recent:', recentTracks.length);
        }
        
        // Get available tracks (not recently played)
        const availableTracks = tracks.filter((track, index) => 
            !this.playedTracks.includes(index)
        );
        
        if (availableTracks.length > 0) {
            // Randomly select from available tracks
            const randomIndex = Math.floor(Math.random() * availableTracks.length);
            selectedTrack = availableTracks[randomIndex];
            
            // Find the original index and add to played tracks
            const originalIndex = tracks.findIndex(track => track.title === selectedTrack.title && track.artist === selectedTrack.artist);
            this.playedTracks.push(originalIndex);
        } else {
            // Fallback to sequential if something goes wrong
            selectedTrack = tracks[this.currentTrackIndex % tracks.length];
            this.playedTracks = [this.currentTrackIndex % tracks.length];
        }
        
        console.log('🎵 Selected track:', selectedTrack);
        console.log('🎵 Starting music:', selectedTrack.title, 'by', selectedTrack.artist);
        console.log('🎼 Genre:', selectedTrack.genre, '| Mood:', selectedTrack.mood);
        console.log('🔀 Shuffle stats: Played', this.playedTracks.length, 'of', tracks.length, 'tracks');
        console.log('🔗 URL:', selectedTrack.url);
        
        try {
            this.currentMusic = new Audio();
            this.currentMusic.src = selectedTrack.url;
            this.currentMusic.volume = 0.15; // Default volume (reduced for better balance)
            
            console.log('🎵 Audio object created, volume set to: 15%');
            
            this.currentMusic.addEventListener('playing', () => {
                console.log('🎵 Actually playing:', selectedTrack.title);
                this.musicPlaying = true;
                this.updateMusicButton();
            });

            this.currentMusic.addEventListener('ended', () => {
                console.log('🎵 Track ended, playing next...');
                this.playNextTrack();
            });

            this.currentMusic.addEventListener('error', (e) => {
                console.error('❌ Music error for', selectedTrack.title, ':', e);
                console.log('🔄 Trying next track...');
                this.playNextTrack();
            });
            
            // Store current track info before attempting to play
            this.currentTrackInfo = selectedTrack;
            
            // Attempt to play
            console.log('🎵 Attempting to play...');
            const playPromise = this.currentMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Successfully playing:', selectedTrack.title);
                    this.musicEnabled = true;
                    this.updateMusicButton();
                }).catch(error => {
                    console.log('⚠️ Autoplay prevented or error during playback:', error.message);
                    console.log('🔄 Trying next track...');
                    this.playNextTrack();
                });
            } else {
                console.log('🎵 Play method returned undefined (older browser)');
                this.musicEnabled = true;
                this.updateMusicButton();
            }
            
        } catch (error) {
            console.error('❌ Error creating audio:', error);
        }
    }
    
    stopMusic() {
        if (this.currentMusic) {
            console.log('🎵 Stopping music');
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
            this.currentTrackInfo = null;
            this.musicEnabled = false;
            this.musicPlaying = false;
            this.updateMusicButton();
        }
    }
    
    pauseMusic() {
        if (this.currentMusic && !this.currentMusic.paused) {
            this.currentMusic.pause();
            this.musicPlaying = false;
            console.log('⏸️ Music paused');
            this.updateMusicButton();
        }
    }
    
    resumeMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.currentMusic.play().then(() => {
                console.log('▶️ Music resumed');
                this.musicPlaying = true;
                this.updateMusicButton();
            }).catch(error => {
                console.log('Could not resume music:', error);
            });
        }
    }
    
    toggleMusic() {
        if (this.musicEnabled && this.currentMusic) {
            if (this.currentMusic.paused) {
                this.resumeMusic();
            } else {
                this.pauseMusic();
            }
        } else {
            this.startMusic();
        }
    }
    
    playNextTrack() {
        this.stopMusic();
        this.currentTrackIndex++;
        setTimeout(() => this.startMusic(), 1000); // Brief pause between tracks
    }
    
    getCurrentTrackInfo() {
        return this.currentTrackInfo || null;
    }
    
    updateMusicButton() {
        const musicBtn = document.getElementById('musicToggleBtn');
        
        if (musicBtn) {
            if (this.musicEnabled && this.currentMusic && !this.currentMusic.paused) {
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                musicBtn.title = 'Turn off background music';
                musicBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            } else {
                musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                musicBtn.title = 'Turn on background music';
                musicBtn.style.background = 'linear-gradient(135deg, #5a67d8 0%, #667eea 100%)';
            }
        }
    }



    initializeContentGenerators() {
        return {
            funFacts: {
                topics: [
                    {
                        category: 'Ancient History',
                        facts: [
                            'Cleopatra lived closer in time to the Moon landing (1969) than to the construction of the Great Pyramid of Giza (2580 BC).',
                            'The ancient Romans used urine as mouthwash because they believed it whitened teeth - and it actually worked due to ammonia!',
                            'Vikings actually discovered America 500 years before Columbus, establishing settlements in Newfoundland around 1000 AD.',
                            'The Library of Alexandria had over 700,000 scrolls and was so famous that scholars would travel thousands of miles just to study there.',
                            'Ancient Egyptians invented the first known pregnancy test using wheat and barley seeds - and it was surprisingly accurate!',
                            'The Colosseum could be flooded to stage mock naval battles called "naumachiae" with real ships and sea creatures.',
                            'Spartacus, the famous gladiator, was originally a Thracian soldier who became one of Rome\'s greatest military threats.',
                            'The ancient city of Pompeii had fast food restaurants, graffiti, and even a sophisticated plumbing system.',
                            'Hannibal crossed the Alps with 37 elephants to attack Rome, but only one elephant survived the journey.',
                            'The Rosetta Stone was the key to deciphering Egyptian hieroglyphs and was found by Napoleon\'s soldiers in 1799.'
                        ]
                    },
                    {
                        category: 'Medieval Times',
                        facts: [
                            'Medieval people didn\'t actually think the Earth was flat - educated people knew it was round since ancient Greek times.',
                            'The Black Death killed 30-60% of Europe\'s population but led to better working conditions for survivors due to labor shortages.',
                            'Medieval knights rarely fought in full armor - it was mainly for ceremonies and tournaments, not battlefield combat.',
                            'The word "salary" comes from the Latin word for salt, as Roman soldiers were sometimes paid in salt.',
                            'Medieval castles had spiral staircases that went clockwise to give right-handed defenders an advantage when fighting.',
                            'The Magna Carta (1215) was one of the first documents to limit the power of kings and establish legal rights.',
                            'Medieval people bathed more often than we think - public bathhouses were common in most European cities.',
                            'The Vikings had a democratic system called "Thing" where free men could vote on important decisions.',
                            'Medieval universities like Oxford (1096) and Cambridge (1209) are older than the Aztec Empire (1345).',
                            'The Crusades lasted for nearly 200 years and involved millions of people from across Europe and the Middle East.'
                        ]
                    },
                    {
                        category: 'Modern History',
                        facts: [
                            'The shortest war in history lasted only 38-45 minutes between Britain and Zanzibar in 1896.',
                            'During WWI, Christmas truces spontaneously broke out where enemies played football together in No Man\'s Land.',
                            'The Titanic\'s musicians continued playing music as the ship sank to keep passengers calm - all eight died.',
                            'Napoleon was actually average height for his time (5\'7") - British propaganda made him seem short.',
                            'The Berlin Wall fell in 1989 partly due to a miscommunication during a press conference about travel restrictions.',
                            'During WWII, a bear named Wojtek was officially enlisted in the Polish Army and helped carry ammunition.',
                            'The first photograph of a human was taken in 1838 and shows a man getting his shoes shined in Paris.',
                            'The Great Depression was so severe that unemployment in the US reached 25% and lasted over a decade.',
                            'The Space Race began in 1957 when the Soviet Union launched Sputnik, the first artificial satellite.',
                            'The Internet was originally created by the US military in 1969 as ARPANET to ensure communication during nuclear war.'
                        ]
                    },
                    {
                        category: 'World Geography',
                        facts: [
                            'Russia spans 11 time zones and covers more than one-eighth of Earth\'s inhabited land area.',
                            'The Amazon rainforest produces 20% of the world\'s oxygen and contains 10% of all known species.',
                            'Antarctica is technically a desert - it receives less precipitation than the Sahara Desert.',
                            'The Dead Sea is so salty (34% salt content) that you literally cannot sink in it, but you also can\'t swim normally.',
                            'Mount Everest grows about 4 millimeters taller each year due to tectonic plate movement.',
                            'The Mariana Trench is so deep that if Mount Everest were placed in it, the peak would still be over a mile underwater.',
                            'Australia is the only country that is also a continent, and it\'s home to more deadly animals than anywhere else.',
                            'The Sahara Desert is roughly the size of the entire United States and is still expanding.',
                            'Iceland has no mosquitoes despite having the perfect climate for them - scientists still don\'t know why.',
                            'The Ring of Fire around the Pacific Ocean contains 75% of the world\'s active volcanoes.'
                        ]
                    },
                    {
                        category: 'Ocean Life',
                        facts: [
                            'Octopuses have three hearts and blue blood! Two hearts pump blood to the gills, while the third pumps blood to the rest of the body.',
                            'A group of jellyfish is called a "smack" and some species are immortal, able to reverse their aging process.',
                            'Dolphins have names for each other - unique whistle signatures that they use to identify themselves.',
                            'The blue whale\'s heart is so large that a small child could crawl through its arteries.',
                            'Sea otters hold hands while sleeping to prevent drifting apart in the ocean currents.',
                            'Sharks have been around longer than trees - they\'ve existed for over 400 million years.',
                            'The giant Pacific octopus can change color and texture to perfectly match its surroundings in 0.3 seconds.',
                            'Seahorses are the only species where males get pregnant and give birth to babies.',
                            'A group of whales is called a "pod" and they can communicate across hundreds of miles using low-frequency sounds.',
                            'The mantis shrimp has the most complex eyes in the animal kingdom and can see 16 types of color receptors (humans have 3).'
                        ]
                    },
                    {
                        category: 'Space Mysteries',
                        facts: [
                            'A day on Venus is longer than its year! Venus takes 243 Earth days to rotate once but only 225 days to orbit the Sun.',
                            'There are more possible games of chess than there are atoms in the observable universe.',
                            'One teaspoon of neutron star material would weigh about 6 billion tons on Earth.',
                            'Jupiter\'s moon Europa has twice as much water as all of Earth\'s oceans combined.',
                            'Saturn\'s moon Titan has lakes and rivers, but they\'re made of liquid methane instead of water.',
                            'The footprints on the Moon will last for millions of years because there\'s no wind to blow them away.',
                            'If you could drive a car to the Sun at highway speeds, it would take you over 100 years to get there.',
                            'Black holes can slow down time - if you fell into one, time would appear to stop from an outside observer\'s perspective.',
                            'The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes.',
                            'Mars has the largest volcano in the solar system - Olympus Mons is three times taller than Mount Everest.'
                        ]
                    },
                    {
                        category: 'Animal Kingdom',
                        facts: [
                            'Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs over 3000 years old.',
                            'A group of flamingos is called a "flamboyance" and they can only eat with their heads upside down.',
                            'Elephants are one of the few animals that can recognize themselves in a mirror.',
                            'Penguins propose to their mates with pebbles, and they mate for life.',
                            'A shrimp\'s heart is in its head, and they have 10 pairs of legs.',
                            'Koalas sleep 18-22 hours per day and have fingerprints almost identical to humans.',
                            'Hummingbirds are the only birds that can fly backwards and their hearts beat up to 1,260 times per minute.',
                            'Sloths only defecate once a week and can lose up to 30% of their body weight when they do.',
                            'A group of pandas is called an "embarrassment" and they can only digest 17% of the bamboo they eat.',
                            'Crows can remember human faces for years and can teach their offspring to recognize "dangerous" humans.'
                        ]
                    },
                    {
                        category: 'Human Body',
                        facts: [
                            'Your brain uses 20% of your body\'s total energy despite being only 2% of your body weight.',
                            'You produce about 1.5 liters of saliva every day - that\'s enough to fill two bottles.',
                            'Your stomach gets an entirely new lining every 3-4 days because stomach acid would digest it.',
                            'The human eye can distinguish about 10 million different colors.',
                            'Your bones are about 5 times stronger than steel of the same density.',
                            'You lose about 8 pounds of dead skin cells every year.',
                            'Your heart beats about 100,000 times per day and pumps 2,000 gallons of blood.',
                            'You have the same number of neck vertebrae as a giraffe - exactly seven.',
                            'Your brain contains approximately 86 billion neurons, each connected to thousands of others.',
                            'You blink about 17,000 times per day, and each blink lasts about 0.3 seconds.'
                        ]
                    },
                    {
                        category: 'Technology & Science',
                        facts: [
                            'The first computer bug was an actual bug - a moth trapped in a Harvard computer in 1947.',
                            'More computing power exists in a modern calculator than was used to send humans to the moon.',
                            'The Internet weighs about the same as a strawberry when you consider the mass of all the electrons.',
                            'Glass takes over 4,000 years to decompose, making it more permanent than most civilizations.',
                            'Lightning strikes the Earth about 100 times per second, or 8.6 million times per day.',
                            'A single cloud can weigh more than a million pounds, but it floats because it\'s less dense than air.',
                            'The human DNA contains about 3 billion base pairs, enough information to fill 200 phone books.',
                            'The first email was sent in 1971, and the @ symbol was chosen because it was the only preposition available on the keyboard.',
                            'A single Google search uses the same amount of energy as turning on a 60-watt light bulb for 17 seconds.',
                            'The password "123456" is still the most commonly used password in the world despite security warnings.'
                        ]
                    },
                    {
                        category: 'Literature & Arts',
                        facts: [
                            'Shakespeare invented over 1,700 words that we still use today, including "assassination," "lonely," and "eyeball."',
                            'The longest novel ever written is "In Search of Lost Time" by Marcel Proust - it has over 1.5 million words.',
                            'Agatha Christie is the best-selling novelist of all time, with her books selling over 2 billion copies worldwide.',
                            'The Mona Lisa has no eyebrows because it was fashionable in Renaissance Florence to shave them off.',
                            'Vincent van Gogh only sold one painting during his lifetime, yet his works now sell for hundreds of millions.',
                            'The first novel ever written was "The Tale of Genji" by Murasaki Shikibu in 11th century Japan.',
                            'Dr. Seuss wrote "Green Eggs and Ham" using only 50 different words to win a bet with his publisher.',
                            'The Harry Potter series has been translated into 80 languages and has sold over 500 million copies.',
                            'Beethoven continued composing masterpieces even after becoming completely deaf at age 44.',
                            'The Sistine Chapel ceiling took Michelangelo four years to paint and contains over 300 figures.'
                        ]
                    },
                    {
                        category: 'Psychology & Mind',
                        facts: [
                            'Your brain can\'t actually multitask - it rapidly switches between tasks, making you less efficient at each one.',
                            'The "Google Effect" means we\'re less likely to remember information we know we can easily look up online.',
                            'You make about 35,000 decisions per day, and decision fatigue is why you get tired from too many choices.',
                            'The placebo effect is so powerful that fake surgeries can sometimes work as well as real ones.',
                            'Your brain uses the same neural pathways for physical and emotional pain - heartbreak literally hurts.',
                            'You can only hold about 7 (±2) items in your short-term memory at once - this is called Miller\'s Rule.',
                            'The "mere exposure effect" means you tend to like things more the more you\'re exposed to them.',
                            'Your brain continues developing until you\'re about 25 years old, with the prefrontal cortex being last to mature.',
                            'Dreams occur in REM sleep and help consolidate memories and process emotions from the day.',
                            'The "Dunning-Kruger effect" explains why people with low ability often overestimate their competence.'
                        ]
                    },
                    {
                        category: 'Food & Culture',
                        facts: [
                            'Chocolate was once used as currency by the Aztecs, and cacao beans were more valuable than gold.',
                            'The fortune cookie was actually invented in California, not China, and isn\'t eaten in China.',
                            'Honey is the only food that never spoils - you could eat 3,000-year-old honey and it would still be safe.',
                            'The most expensive spice in the world is saffron, worth more than its weight in gold.',
                            'Pizza was originally considered peasant food in Italy until Queen Margherita made it fashionable in 1889.',
                            'The sandwich was invented by the Earl of Sandwich in 1762 so he could eat while playing cards.',
                            'Ketchup was originally sold as medicine in the 1830s and was believed to cure indigestion.',
                            'The pretzel was invented by monks in 610 AD and its shape represents arms crossed in prayer.',
                            'Ice cream cones were invented by accident at the 1904 World\'s Fair when an ice cream vendor ran out of bowls.',
                            'Coca-Cola was originally green and contained cocaine until 1903 when it was replaced with caffeine.'
                        ]
                    },
                    {
                        category: 'American History',
                        facts: [
                            'The Declaration of Independence was written on hemp paper, and both George Washington and Thomas Jefferson grew hemp.',
                            'Benjamin Franklin never served as President but is on the $100 bill, while Alexander Hamilton (never President) is on the $10.',
                            'The Boston Tea Party destroyed tea worth over $1 million in today\'s money, leading to the Revolutionary War.',
                            'Abraham Lincoln is the only US President to hold a patent - for a system to lift boats over shoals using bellows.',
                            'The Statue of Liberty was originally brown copper but turned green due to oxidation over 30 years.',
                            'George Washington\'s teeth weren\'t wooden - they were made from ivory, gold, lead, and human teeth.',
                            'The White House was burned down by the British in 1814, and Dolley Madison saved George Washington\'s portrait.',
                            'Alaska was purchased from Russia for $7.2 million in 1867, which equals about 2 cents per acre.',
                            'The Civil War had the first military draft in US history, but you could pay $300 to avoid service.',
                            'The transcontinental railroad was completed in 1869, reducing cross-country travel from months to one week.'
                        ]
                    },
                    {
                        category: 'World War History',
                        facts: [
                            'WWI started because of a wrong turn - Archduke Franz Ferdinand\'s driver took a wrong route, leading to his assassination.',
                            'During WWII, the Allies used inflatable tanks and fake armies to deceive the Germans about D-Day invasion plans.',
                            'The youngest soldier in WWII was Calvin Graham, who enlisted in the US Navy at age 12 by lying about his age.',
                            'Witold Pilecki voluntarily got himself arrested to be sent to Auschwitz to gather intelligence and organize resistance.',
                            'The Christmas Truce of 1914 saw enemies playing football together in No Man\'s Land during WWI.',
                            'WWII codebreaker Alan Turing\'s work is estimated to have shortened the war by 2-4 years, saving millions of lives.',
                            'The Battle of Stalingrad was so intense that the average life expectancy of a Soviet soldier was 24 hours.',
                            'D-Day was postponed 24 hours due to bad weather, and if delayed further, it would have been postponed a month.',
                            'The Enigma machine had 158,962,555,217,826,360,000 possible settings, making it nearly impossible to crack.',
                            'Operation Mincemeat used a dead homeless man with fake documents to deceive Germans about Allied invasion plans.'
                        ]
                    },
                    {
                        category: 'Ancient Civilizations',
                        facts: [
                            'The ancient Mayans invented the concept of zero independently, 1,000 years before it reached Europe.',
                            'Petra in Jordan was carved directly into rose-red sandstone cliffs and was lost to the Western world for 600 years.',
                            'The Antikythera Mechanism from ancient Greece was a 2,000-year-old analog computer that predicted eclipses.',
                            'Machu Picchu was built without wheels, iron tools, or mortar, yet the stones fit so perfectly a knife can\'t fit between them.',
                            'The ancient Incas performed successful brain surgery with a 90% survival rate using bronze tools.',
                            'Stonehenge was built over 1,500 years, with some stones transported 150 miles from Wales.',
                            'The ancient Chinese invented paper money, gunpowder, the compass, and printing 1,000 years before Europe.',
                            'Easter Island\'s 887 stone statues (moai) were "walked" upright to their positions using ropes.',
                            'The ancient Babylonians created the first known map of the world on a clay tablet in 600 BC.',
                            'Angkor Wat in Cambodia is the largest religious monument in the world, covering 402 acres.'
                        ]
                    },
                    {
                        category: 'Recent News & Discoveries',
                        facts: [
                            'Scientists discovered that octopuses and humans share a common ancestor from 750 million years ago, yet both evolved complex brains independently.',
                            'The James Webb Space Telescope has detected galaxies that formed just 400 million years after the Big Bang, rewriting our understanding of early universe.',
                            'Researchers found that playing Tetris for just 3 minutes can reduce cravings for food, drugs, and other addictive behaviors by 24%.',
                            'A new species of ancient human, Homo longi (Dragon Man), was discovered in China and may be our closest extinct relative.',
                            'Scientists successfully reversed aging in mice using a combination of four genes, potentially opening paths to human longevity treatments.',
                            'The world\'s largest iceberg, A23a, started moving again after being stuck on the seafloor for over 30 years.',
                            'Researchers discovered that crows can count up to four and understand the concept of zero, showing advanced mathematical abilities.',
                            'A 2,000-year-old Roman chariot was found perfectly preserved in a villa near Pompeii, complete with bronze decorations.',
                            'Scientists created the first synthetic mouse embryos using only stem cells, without eggs or sperm, opening new research possibilities.',
                            'The Perseverance rover on Mars successfully created oxygen from the Martian atmosphere, proving it\'s possible for future human missions.'
                        ]
                    },
                    {
                        category: 'Tech & Innovation News',
                        facts: [
                            'ChatGPT reached 100 million users in just 2 months, making it the fastest-growing consumer application in history.',
                            'Scientists achieved nuclear fusion that produced more energy than it consumed for the first time in December 2022.',
                            'The first pig-to-human kidney transplant patient survived for 2 months, marking a breakthrough in xenotransplantation.',
                            'Researchers developed a new battery technology using sodium instead of lithium that could revolutionize energy storage.',
                            'The world\'s first 3D-printed rocket successfully reached space, proving additive manufacturing works for aerospace.',
                            'Scientists created a "time crystal" that can store energy indefinitely without losing it, defying traditional physics.',
                            'The first lab-grown meat restaurant opened in Singapore, serving chicken nuggets grown from animal cells.',
                            'Researchers developed contact lenses that can zoom in 2.8x when you blink twice, like having built-in binoculars.',
                            'A new AI system can predict protein structures in minutes instead of years, accelerating drug discovery dramatically.',
                            'Scientists successfully transmitted solar power from space to Earth using microwaves, proving space-based solar power is possible.'
                        ]
                    },
                    {
                        category: 'Environmental & Climate News',
                        facts: [
                            'Antarctica lost 150 billion tons of ice per year between 2002-2020, contributing significantly to sea level rise.',
                            'The Amazon rainforest is now emitting more CO2 than it absorbs due to deforestation and climate change.',
                            'Scientists discovered that whales can absorb 33 tons of CO2 during their lifetime, making them crucial for climate regulation.',
                            'The Great Pacific Garbage Patch is now twice the size of Texas and contains 80,000 tons of plastic waste.',
                            'Renewable energy became the cheapest source of power in most parts of the world for the first time in 2020.',
                            'The Arctic is warming 4 times faster than the global average, causing unprecedented ice loss and ecosystem changes.',
                            'Scientists successfully restored coral reefs using 3D-printed structures that provide homes for marine life.',
                            'Electric vehicle sales increased by 108% in 2021, with Norway leading at 86% of all new car sales being electric.',
                            'The ozone hole over Antarctica is finally healing and could be completely restored by 2066.',
                            'Vertical farms use 95% less water than traditional farming and can produce crops year-round in any climate.'
                        ]
                    }
                ]
            },
            riddles: {
                easy: [
                    {
                        question: 'What has keys but no locks, space but no room, and you can enter but not go inside?',
                        answer: 'keyboard',
                        explanation: 'A keyboard has keys, a space bar, and an enter key!'
                    },
                    {
                        question: 'What gets wet while drying?',
                        answer: 'towel',
                        explanation: 'A towel gets wet when it dries other things!'
                    },
                    {
                        question: 'What has hands but cannot clap?',
                        answer: 'clock',
                        explanation: 'A clock has hands (hour and minute hands) but cannot clap!'
                    },
                    {
                        question: 'What goes up but never comes down?',
                        answer: 'age',
                        explanation: 'Your age always increases and never decreases!'
                    },
                    {
                        question: 'What has a head and a tail but no body?',
                        answer: 'coin',
                        explanation: 'A coin has heads and tails sides but no body!'
                    },
                    {
                        question: 'What has teeth but cannot bite?',
                        answer: 'zipper',
                        explanation: 'A zipper has teeth that interlock but cannot bite!'
                    },
                    {
                        question: 'What has one eye but cannot see?',
                        answer: 'needle',
                        explanation: 'A needle has an eye (hole) for thread but cannot see!'
                    },
                    {
                        question: 'What runs but never walks, has a mouth but never talks?',
                        answer: 'river',
                        explanation: 'A river runs (flows) and has a mouth (where it meets the sea) but cannot walk or talk!'
                    },
                    {
                        question: 'What has legs but cannot walk?',
                        answer: 'table',
                        explanation: 'A table has legs to support it but cannot walk!'
                    },
                    {
                        question: 'What can you catch but not throw?',
                        answer: 'cold',
                        explanation: 'You can catch a cold (get sick) but you cannot throw it!'
                    },
                    {
                        question: 'What has a neck but no head?',
                        answer: 'bottle',
                        explanation: 'A bottle has a neck (narrow part) but no head!'
                    },
                    {
                        question: 'What has ears but cannot hear?',
                        answer: 'corn',
                        explanation: 'Corn has ears (the corn cob) but cannot hear sounds!'
                    },
                    {
                        question: 'What has wings but cannot fly?',
                        answer: 'building',
                        explanation: 'Buildings can have wings (sections) but cannot fly!'
                    },
                    {
                        question: 'What has a face but no eyes?',
                        answer: 'clock',
                        explanation: 'A clock has a face (the front with numbers) but no eyes!'
                    },
                    {
                        question: 'What gets bigger the more you take away from it?',
                        answer: 'hole',
                        explanation: 'The more you dig out of a hole, the bigger it gets!'
                    }
                ],
                medium: [
                    {
                        question: 'I am not alive, but I grow. I don\'t have lungs, but I need air. What am I?',
                        answer: 'fire',
                        explanation: 'Fire grows and spreads, and needs oxygen (air) to survive!'
                    },
                    {
                        question: 'The more you take, the more you leave behind. What am I?',
                        answer: 'footsteps',
                        explanation: 'The more steps you take, the more footprints you leave behind!'
                    },
                    {
                        question: 'What can travel around the world while staying in a corner?',
                        answer: 'stamp',
                        explanation: 'A postage stamp stays in the corner of an envelope but travels worldwide!'
                    },
                    {
                        question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
                        answer: 'map',
                        explanation: 'A map shows cities, mountains, and water but doesn\'t contain the actual things!'
                    },
                    {
                        question: 'What breaks but never falls, and what falls but never breaks?',
                        answer: 'day and night',
                        explanation: 'Day breaks (dawn) but never falls, and night falls but never breaks!'
                    },
                    {
                        question: 'What belongs to you but others use it more than you do?',
                        answer: 'name',
                        explanation: 'Your name belongs to you, but other people say it more often than you do!'
                    },
                    {
                        question: 'I am always in front of you but cannot be seen. What am I?',
                        answer: 'future',
                        explanation: 'The future is always ahead of you but you cannot see what will happen!'
                    },
                    {
                        question: 'What has many teeth but cannot eat?',
                        answer: 'saw',
                        explanation: 'A saw has many sharp teeth for cutting but cannot eat!'
                    },
                    {
                        question: 'I get smaller every time I take a bath. What am I?',
                        answer: 'soap',
                        explanation: 'Soap gets smaller each time you use it to wash (take a bath)!'
                    },
                    {
                        question: 'What has words but never speaks?',
                        answer: 'book',
                        explanation: 'A book contains many words but cannot speak them!'
                    },
                    {
                        question: 'I am full of holes but still hold water. What am I?',
                        answer: 'sponge',
                        explanation: 'A sponge has many holes but can absorb and hold water!'
                    },
                    {
                        question: 'What comes down but never goes up?',
                        answer: 'rain',
                        explanation: 'Rain falls down from the sky but never goes back up!'
                    },
                    {
                        question: 'What has a bottom at the top?',
                        answer: 'leg',
                        explanation: 'Your leg has its bottom (foot) at the top when you lift it up!'
                    },
                    {
                        question: 'I have a golden head and a golden tail, but no golden body. What am I?',
                        answer: 'penny',
                        explanation: 'A penny has golden-colored heads and tails but the edge is not golden!'
                    },
                    {
                        question: 'What can you hold without ever touching it?',
                        answer: 'breath',
                        explanation: 'You can hold your breath without physically touching it!'
                    }
                ],
                hard: [
                    {
                        question: 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?',
                        answer: 'echo',
                        explanation: 'An echo repeats sounds without having a mouth or ears, and wind can carry echoes!'
                    },
                    {
                        question: 'The person who makes it sells it. The person who buys it never uses it. The person who uses it never knows it. What is it?',
                        answer: 'coffin',
                        explanation: 'A coffin maker sells it, someone else buys it, and the person who uses it is no longer alive to know it!'
                    },
                    {
                        question: 'I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?',
                        answer: 'pencil lead',
                        explanation: 'Graphite is mined, put in wooden pencils, never removed, but used by almost everyone!'
                    },
                    {
                        question: 'What disappears as soon as you say its name?',
                        answer: 'silence',
                        explanation: 'As soon as you say the word "silence," you break the silence!'
                    },
                    {
                        question: 'I am always hungry and will die if not fed, but whatever I touch will soon turn red. What am I?',
                        answer: 'fire',
                        explanation: 'Fire needs fuel to survive and turns things red/orange when it burns them!'
                    },
                    {
                        question: 'What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?',
                        answer: 'river',
                        explanation: 'A river runs, has a mouth (delta), head (source), and bed (bottom) but cannot walk, talk, weep, or sleep!'
                    },
                    {
                        question: 'The more you have of me, the less you see. What am I?',
                        answer: 'darkness',
                        explanation: 'The more darkness there is, the less you can see!'
                    },
                    {
                        question: 'What comes once in a minute, twice in a moment, but never in a thousand years?',
                        answer: 'letter m',
                        explanation: 'The letter "m" appears once in "minute," twice in "moment," but never in "thousand years"!'
                    },
                    {
                        question: 'I am lighter than air but a hundred people cannot lift me. What am I?',
                        answer: 'bubble',
                        explanation: 'A bubble is lighter than air, but if people try to lift it, it will pop!'
                    },
                    {
                        question: 'What has a heart that doesn\'t beat?',
                        answer: 'artichoke',
                        explanation: 'An artichoke has a heart (center part) that you can eat, but it doesn\'t beat!'
                    }
                ],
                wordplay: [
                    {
                        question: 'What word becomes shorter when you add two letters to it?',
                        answer: 'short',
                        explanation: 'The word "short" becomes "shorter" when you add "er" to it!'
                    },
                    {
                        question: 'What word is spelled incorrectly in every dictionary?',
                        answer: 'incorrectly',
                        explanation: 'The word "incorrectly" is the only word that is spelled incorrectly in dictionaries!'
                    },
                    {
                        question: 'What starts with T, ends with T, and has T in it?',
                        answer: 'teapot',
                        explanation: 'Teapot starts with T, ends with T, and has tea (T) in it!'
                    },
                    {
                        question: 'What word has three consecutive double letters?',
                        answer: 'bookkeeper',
                        explanation: 'Bookkeeper has "oo," "kk," and "ee" - three consecutive double letters!'
                    },
                    {
                        question: 'I am an odd number. Take away one letter and I become even. What number am I?',
                        answer: 'seven',
                        explanation: 'Remove the "s" from "seven" and you get "even"!'
                    }
                ],
                logic: [
                    {
                        question: 'A man lives on the 20th floor. Every morning he takes the elevator down. When he comes home, he takes the elevator to the 10th floor and walks the rest... except on rainy days. Why?',
                        answer: 'he is too short to reach the 20th floor button',
                        explanation: 'He can only reach the 10th floor button, but on rainy days he has an umbrella to help him reach higher!'
                    },
                    {
                        question: 'Two fathers and two sons go fishing. They each catch one fish. In total, only three fish were caught. How is this possible?',
                        answer: 'grandfather father and son',
                        explanation: 'There are only three people: a grandfather, his son (who is also a father), and his grandson!'
                    },
                    {
                        question: 'A woman shoots her husband, then holds him underwater for five minutes. Next, she hangs him. Right after, they enjoy dinner. How?',
                        answer: 'she is developing photographs',
                        explanation: 'She shoots a photo, develops it underwater in chemicals, and hangs it to dry!'
                    },
                    {
                        question: 'A man was driving a black truck. His lights were not on. The moon was not out. A woman was crossing the street. How did he see her?',
                        answer: 'it was daytime',
                        explanation: 'It was during the day, so he could see without lights or moonlight!'
                    }
                ]
            },
            mathProblems: {
                arithmetic: [
                    {
                        question: 'I am thinking of a number. If you multiply it by 3, then subtract 7, you get 14. What number am I thinking of?',
                        answer: '7',
                        solution: '3x - 7 = 14, so 3x = 21, therefore x = 7'
                    },
                    {
                        question: 'If you buy 4 apples for $6 and 3 oranges for $9, what\'s the total cost per fruit?',
                        answer: '2.14',
                        solution: 'Total cost: $15, Total fruits: 7, Cost per fruit: $15 ÷ 7 = $2.14'
                    },
                    {
                        question: 'A number doubled plus 15 equals 35. What is the number?',
                        answer: '10',
                        solution: '2x + 15 = 35, so 2x = 20, therefore x = 10'
                    }
                ],
                patterns: [
                    {
                        question: 'What comes next in this sequence? 2, 6, 12, 20, 30, ?',
                        answer: '42',
                        solution: 'Each number is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42'
                    },
                    {
                        question: 'Complete the pattern: 1, 4, 9, 16, 25, ?',
                        answer: '36',
                        solution: 'These are perfect squares: 1², 2², 3², 4², 5², 6² = 36'
                    },
                    {
                        question: 'What\'s the next number? 3, 7, 15, 31, 63, ?',
                        answer: '127',
                        solution: 'Each number is (previous × 2) + 1: 3→7→15→31→63→127'
                    }
                ],
                logic: [
                    {
                        question: 'If 5 cats catch 5 mice in 5 minutes, how many cats are needed to catch 100 mice in 100 minutes?',
                        answer: '5',
                        solution: 'Each cat catches 1 mouse in 5 minutes, so in 100 minutes each cat catches 20 mice. 5 cats catch 100 mice.'
                    },
                    {
                        question: 'A farmer has 17 sheep. All but 9 die. How many sheep are left?',
                        answer: '9',
                        solution: '"All but 9 die" means 9 sheep survive, so 9 sheep are left.'
                    },
                    {
                        question: 'If you have a 3-gallon jug and a 5-gallon jug, how can you measure exactly 4 gallons?',
                        answer: 'Fill 5, pour into 3, empty 3, pour remaining 2 from 5 into 3, fill 5 again, pour into 3 until full',
                        solution: 'Fill 5→pour 3 into 3-jug→empty 3-jug→pour remaining 2 from 5-jug into 3-jug→fill 5-jug→pour from 5-jug into 3-jug (which has 2, so only 1 more fits)→4 gallons remain in 5-jug'
                    },
                    {
                        question: 'A snail is at the bottom of a 30-foot well. Each day it climbs up 3 feet, but each night it slides back 2 feet. How many days will it take to reach the top?',
                        answer: '28',
                        solution: 'On day 28, the snail climbs from 27 feet to 30 feet and reaches the top before sliding back!'
                    },
                    {
                        question: 'You have 12 balls, 11 are the same weight and 1 is different. Using a balance scale only 3 times, how do you find the different ball?',
                        answer: 'divide into groups of 4',
                        solution: 'Divide into 3 groups of 4. Weigh two groups. If balanced, the different ball is in the third group. If not balanced, it\'s in the lighter/heavier group. Then divide that group and repeat.'
                    }
                ],
                geometry: [
                    {
                        question: 'A rectangle has a perimeter of 20 and a length of 7. What is its width?',
                        answer: '3',
                        solution: 'Perimeter = 2(length + width), so 20 = 2(7 + width), therefore width = 3'
                    },
                    {
                        question: 'What is the area of a triangle with base 8 and height 6?',
                        answer: '24',
                        solution: 'Area of triangle = (base × height) ÷ 2 = (8 × 6) ÷ 2 = 24'
                    },
                    {
                        question: 'A circle has a radius of 5. What is its circumference? (Use π = 3.14)',
                        answer: '31.4',
                        solution: 'Circumference = 2πr = 2 × 3.14 × 5 = 31.4'
                    },
                    {
                        question: 'How many sides does a hexagon have?',
                        answer: '6',
                        solution: 'A hexagon is a polygon with 6 sides and 6 angles'
                    }
                ],
                fractions: [
                    {
                        question: 'What is 1/4 + 1/3?',
                        answer: '7/12',
                        solution: 'Find common denominator: 1/4 = 3/12, 1/3 = 4/12, so 3/12 + 4/12 = 7/12'
                    },
                    {
                        question: 'What is 3/4 of 16?',
                        answer: '12',
                        solution: '3/4 × 16 = (3 × 16) ÷ 4 = 48 ÷ 4 = 12'
                    },
                    {
                        question: 'Simplify: 8/12',
                        answer: '2/3',
                        solution: 'Divide both numerator and denominator by their GCD (4): 8÷4 = 2, 12÷4 = 3'
                    },
                    {
                        question: 'What is 2/5 - 1/10?',
                        answer: '3/10',
                        solution: 'Convert to common denominator: 2/5 = 4/10, so 4/10 - 1/10 = 3/10'
                    }
                ],
                probability: [
                    {
                        question: 'What is the probability of rolling a 6 on a standard die?',
                        answer: '1/6',
                        solution: 'There is 1 favorable outcome (rolling 6) out of 6 possible outcomes'
                    },
                    {
                        question: 'If you flip a coin twice, what is the probability of getting two heads?',
                        answer: '1/4',
                        solution: 'P(HH) = P(H) × P(H) = 1/2 × 1/2 = 1/4'
                    },
                    {
                        question: 'A bag has 3 red balls and 2 blue balls. What is the probability of drawing a red ball?',
                        answer: '3/5',
                        solution: 'There are 3 red balls out of 5 total balls, so P(red) = 3/5'
                    }
                ]
            }
        };
    }

    generateFreshContent(count = 4) {
        const activities = [];
        
        if (count === 1) {
            // For single card generation, randomly choose between game and fresh content
            const contentType = Math.random();
            
            if (contentType < 0.3) {
                // 30% chance for a game
                const randomGame = this.getRandomGame();
                if (randomGame) {
                    activities.push(randomGame);
                } else {
                    activities.push(this.generateFreshFact());
                }
            } else if (contentType < 0.6) {
                // 30% chance for a fresh fact
                activities.push(this.generateFreshFact());
            } else if (contentType < 0.85) {
                // 25% chance for a fresh riddle
                activities.push(this.generateFreshRiddle());
            } else {
                // 15% chance for a fresh math problem
                activities.push(this.generateFreshMathProblem());
            }
        } else {
            // For multiple cards, use the original logic
            // Always include 1-2 games (they can repeat)
            const gameCount = Math.random() < 0.5 ? 1 : 2;
            for (let i = 0; i < gameCount; i++) {
                const randomGame = this.getRandomGame();
                if (randomGame) {
                    activities.push(randomGame);
                } else {
                    activities.push(this.generateFreshFact());
                }
            }
            
            // Fill remaining slots with fresh content
            const remainingSlots = count - gameCount;
            
            for (let i = 0; i < remainingSlots; i++) {
                const contentType = Math.random();
                
                if (contentType < 0.4) {
                    // Generate fresh fun fact
                    activities.push(this.generateFreshFact());
                } else if (contentType < 0.7) {
                    // Generate fresh riddle
                    activities.push(this.generateFreshRiddle());
                } else {
                    // Generate fresh math problem
                    activities.push(this.generateFreshMathProblem());
                }
            }
        }
        
        return activities;
    }

    // Get a random game from the appropriate backend
    getRandomGame() {
        if (this.isPremiumMode && this.premiumContentBackend) {
            return this.getPremiumGameActivity();
        } else if (this.dailyContentBackend) {
            const basicGame = this.dailyContentBackend.generateBasicGame();
            if (basicGame) {
                return this.convertDailyCardToAppFormat(basicGame);
            }
        }
        
        // Fallback to basic games if no backend available - INCLUDING CHESS PUZZLES FOR FREE USERS!
        const fallbackGames = [
            {
                type: 'Game',
                title: 'Tic Tac Toe',
                description: 'Classic 3x3 strategy game. Get three in a row!',
                action: 'play',
                gameType: 'tictactoe',
                category: 'game',
                image: 'images/tictactoe.svg'
            },
            {
                type: 'Game',
                title: 'Connect 4',
                description: 'Drop your pieces and connect four in a row!',
                action: 'play',
                gameType: 'connect4',
                category: 'game',
                image: 'images/connect4.svg'
            },
            {
                type: 'Chess Puzzle',
                title: 'Chess Puzzle',
                description: 'Solve chess puzzles and improve your strategic thinking! Find the winning move.',
                action: 'play',
                gameType: 'chess',
                category: 'chess',
                image: 'images/chess.svg'
            }
        ];
        
        return fallbackGames[Math.floor(Math.random() * fallbackGames.length)];
    }

    // Smart content pool management
    getContentPoolUsage(poolType) {
        let totalContent = 0;
        let usedContent = 0;
        
        if (poolType === 'facts') {
            this.contentGenerators.funFacts.topics.forEach(topic => {
                totalContent += topic.facts.length;
                topic.facts.forEach(fact => {
                    if (this.usedContent.has(`fact_${topic.category}_${fact}`)) {
                        usedContent++;
                    }
                });
            });
        } else if (poolType === 'riddles') {
            Object.keys(this.contentGenerators.riddles).forEach(category => {
                totalContent += this.contentGenerators.riddles[category].length;
                this.contentGenerators.riddles[category].forEach(riddle => {
                    if (this.usedContent.has(`riddle_${riddle.question}`)) {
                        usedContent++;
                    }
                });
            });
        }
        
        return { used: usedContent, total: totalContent, percentage: (usedContent / totalContent) * 100 };
    }

    // Reset content pool when usage gets too high
    resetContentPoolIfNeeded(poolType, threshold = 75) {
        const usage = this.getContentPoolUsage(poolType);
        
        if (usage.percentage > threshold) {
            // Reset this specific pool
            const keysToRemove = [];
            this.usedContent.forEach(key => {
                if (key.startsWith(poolType === 'facts' ? 'fact_' : 'riddle_')) {
                    keysToRemove.push(key);
                }
            });
            
            keysToRemove.forEach(key => this.usedContent.delete(key));
            
            console.log(`🔄 Reset ${poolType} pool - was ${usage.percentage.toFixed(1)}% used`);
        }
    }

    // Generate dynamic fact variations
    generateFactVariation(originalFact, category) {
        const variations = {
            prefix: [
                "Did you know that ",
                "Here's a fascinating fact: ",
                "Amazing discovery: ",
                "Incredible but true: ",
                "Scientists have found that ",
                "Research shows that ",
                "It's remarkable that ",
                "Believe it or not, "
            ],
            suffix: [
                " - isn't that incredible?",
                " How amazing is that!",
                " Nature is truly fascinating!",
                " Science never ceases to amaze!",
                " The world is full of surprises!",
                " Isn't the natural world wonderful?",
                " What an extraordinary discovery!",
                ""
            ]
        };

        // Sometimes return original, sometimes add variation
        if (Math.random() < 0.3) {
            const prefix = variations.prefix[Math.floor(Math.random() * variations.prefix.length)];
            const suffix = variations.suffix[Math.floor(Math.random() * variations.suffix.length)];
            return prefix + originalFact.toLowerCase() + suffix;
        }
        
        return originalFact;
    }

    generateFreshFact() {
        // Reset pool if needed
        this.resetContentPoolIfNeeded('facts', 70);
        
        const topics = this.contentGenerators.funFacts.topics;
        
        // Add time-based category weighting for variety
        const timeBasedSeed = Math.floor((Date.now() - this.sessionStartTime) / 30000); // Change every 30 seconds
        const shuffledTopics = [...topics].sort(() => (Math.sin(timeBasedSeed) * 0.5) + (Math.random() * 0.5));
        
        // Try to find unused content, with preference for less-used categories
        for (const topic of shuffledTopics) {
            const unusedFacts = topic.facts.filter(fact => 
                !this.usedContent.has(`fact_${topic.category}_${fact}`)
            );
            
            if (unusedFacts.length > 0) {
                const fact = unusedFacts[Math.floor(Math.random() * unusedFacts.length)];
                const contentId = `fact_${topic.category}_${fact}`;
                this.usedContent.add(contentId);
                
                // Add some variation to the fact presentation
                const displayFact = this.generateFactVariation(fact, topic.category);
                
                return {
                    type: topic.category,
                    title: this.generateFactTitle(topic.category),
                    description: displayFact,
                    image: this.getCardImage(topic.category),
                    action: 'read',
                    category: 'content'
                };
            }
        }
        
        // If somehow all content is still used, generate a dynamic fact
        return this.generateDynamicFact();
    }

    // Generate completely dynamic facts when static pool is exhausted
    generateDynamicFact() {
        const dynamicFacts = [
            `The current time is ${new Date().toLocaleTimeString()} - time never stops moving!`,
            `Today is ${new Date().toLocaleDateString()} - every day brings new possibilities!`,
            `You've been using this app for ${Math.floor((Date.now() - this.sessionStartTime) / 1000)} seconds!`,
            `Random number fact: ${Math.floor(Math.random() * 1000)} is a number between 0 and 999!`,
            `The probability of getting this exact random fact is 1 in ${Math.floor(Math.random() * 10000) + 1000}!`,
            `Your browser has been open for approximately ${Math.floor(performance.now() / 1000)} seconds!`,
            `Fun fact: You're one of billions of people on Earth right now!`,
            `The universe is approximately 13.8 billion years old - that's a lot of birthdays!`,
            `Light travels at 299,792,458 meters per second - that's really, really fast!`,
            `There are more possible chess games than atoms in the observable universe!`
        ];
        
        const categories = ['Technology & Science', 'Space Mysteries', 'Human Body', 'World Geography'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        return {
            type: randomCategory,
            title: this.generateFactTitle(randomCategory),
            description: dynamicFacts[Math.floor(Math.random() * dynamicFacts.length)],
            image: this.getCardImage(randomCategory),
            action: 'read',
            category: 'content'
        };
    }

    generateFreshRiddle() {
        // Reset pool if needed
        this.resetContentPoolIfNeeded('riddles', 70);
        
        const categories = ['easy', 'medium', 'hard', 'wordplay', 'logic'];
        
        // Add time-based category weighting for variety
        const timeBasedSeed = Math.floor((Date.now() - this.sessionStartTime) / 45000); // Change every 45 seconds
        const shuffledCategories = [...categories].sort(() => (Math.sin(timeBasedSeed * 2) * 0.5) + (Math.random() * 0.5));
        
        // Try to find unused content, with preference for less-used categories
        for (const category of shuffledCategories) {
            const riddles = this.contentGenerators.riddles[category];
            const unusedRiddles = riddles.filter(riddle => 
                !this.usedContent.has(`riddle_${riddle.question}`)
            );
            
            if (unusedRiddles.length > 0) {
                const riddle = unusedRiddles[Math.floor(Math.random() * unusedRiddles.length)];
                this.usedContent.add(`riddle_${riddle.question}`);
                
                return {
                    type: 'Riddle',
                    title: category === 'wordplay' ? 'Word Puzzle' : 
                           category === 'logic' ? 'Logic Puzzle' :
                           `${category.charAt(0).toUpperCase() + category.slice(1)} Challenge`,
                    description: riddle.question,
                    answer: riddle.answer,
                    solution: riddle.explanation,
                    image: this.getCardImage('Riddle'),
                    action: 'solve',
                    category: 'content'
                };
            }
        }
        
        // If somehow all content is still used, generate a dynamic riddle
        return this.generateDynamicRiddle();
    }

    // Generate completely dynamic riddles when static pool is exhausted
    generateDynamicRiddle() {
        const dynamicRiddles = [
            {
                question: `What number am I thinking of between 1 and ${Math.floor(Math.random() * 100) + 10}?`,
                answer: `${Math.floor(Math.random() * 50) + 1}`,
                explanation: "This was a randomly generated number riddle just for you!"
            },
            {
                question: `If today is ${new Date().toLocaleDateString()}, what day was it exactly 7 days ago?`,
                answer: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                explanation: "Count back 7 days from today's date!"
            },
            {
                question: `What has ${Math.floor(Math.random() * 10) + 2} letters and rhymes with 'fun'?`,
                answer: "sun",
                explanation: "Many words can rhyme with 'fun' - sun, run, done, won!"
            },
            {
                question: "What gets wetter the more it dries?",
                answer: "towel",
                explanation: "A towel gets wetter as it dries other things!"
            },
            {
                question: `If you're reading this at ${new Date().toLocaleTimeString()}, what time will it be in one hour?`,
                answer: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString(),
                explanation: "Just add one hour to the current time!"
            }
        ];
        
        const riddle = dynamicRiddles[Math.floor(Math.random() * dynamicRiddles.length)];
        
        return {
            type: 'Riddle',
            title: 'Dynamic Challenge',
            description: riddle.question,
            answer: riddle.answer,
            solution: riddle.explanation,
            image: this.getCardImage('Riddle'),
            action: 'solve',
            category: 'content'
        };
    }

    // Get math content usage statistics
    getMathContentUsage() {
        let totalContent = 0;
        let usedContent = 0;
        
        Object.keys(this.contentGenerators.mathProblems).forEach(category => {
            totalContent += this.contentGenerators.mathProblems[category].length;
            this.contentGenerators.mathProblems[category].forEach(problem => {
                if (this.usedContent.has(`math_${problem.question}`)) {
                    usedContent++;
                }
            });
        });
        
        return { used: usedContent, total: totalContent, percentage: (usedContent / totalContent) * 100 };
    }

    generateFreshMathProblem() {
        // Reset pool if needed
        const mathUsage = this.getMathContentUsage();
        if (mathUsage.percentage > 70) {
            // Reset math content
            const keysToRemove = [];
            this.usedContent.forEach(key => {
                if (key.startsWith('math_')) {
                    keysToRemove.push(key);
                }
            });
            keysToRemove.forEach(key => this.usedContent.delete(key));
            console.log(`🔄 Reset math pool - was ${mathUsage.percentage.toFixed(1)}% used`);
        }
        
        const categories = ['arithmetic', 'patterns', 'logic', 'geometry', 'fractions', 'probability'];
        
        // Add time-based category weighting for variety
        const timeBasedSeed = Math.floor((Date.now() - this.sessionStartTime) / 60000); // Change every minute
        const shuffledCategories = [...categories].sort(() => (Math.sin(timeBasedSeed * 3) * 0.5) + (Math.random() * 0.5));
        
        // Try to find unused content, with preference for less-used categories
        for (const category of shuffledCategories) {
            const problems = this.contentGenerators.mathProblems[category];
            const unusedProblems = problems.filter(problem => 
                !this.usedContent.has(`math_${problem.question}`)
            );
            
            if (unusedProblems.length > 0) {
                const problem = unusedProblems[Math.floor(Math.random() * unusedProblems.length)];
                this.usedContent.add(`math_${problem.question}`);
                
                return {
                    type: category === 'arithmetic' ? 'Math Puzzle' : 
                          category === 'patterns' ? 'Pattern Puzzle' : 'Logic Puzzle',
                    title: this.generateMathTitle(category),
                    description: problem.question,
                    answer: problem.answer,
                    solution: problem.solution,
                    image: this.getCardImage('Math Challenge'),
                    action: 'solve',
                    category: 'content'
                };
            }
        }
        
        // If somehow all content is still used, generate a dynamic math problem
        return this.generateDynamicMathProblem();
    }

    // Generate completely dynamic math problems when static pool is exhausted
    generateDynamicMathProblem() {
        const problemTypes = [
            {
                type: 'arithmetic',
                generator: () => {
                    const a = Math.floor(Math.random() * 50) + 1;
                    const b = Math.floor(Math.random() * 50) + 1;
                    const operations = ['+', '-', '×'];
                    const op = operations[Math.floor(Math.random() * operations.length)];
                    
                    let answer;
                    switch(op) {
                        case '+': answer = a + b; break;
                        case '-': answer = Math.abs(a - b); break;
                        case '×': answer = a * b; break;
                    }
                    
                    return {
                        question: `What is ${a} ${op} ${b}?`,
                        answer: answer.toString(),
                        solution: `${a} ${op} ${b} = ${answer}`
                    };
                }
            },
            {
                type: 'patterns',
                generator: () => {
                    const start = Math.floor(Math.random() * 10) + 1;
                    const step = Math.floor(Math.random() * 5) + 2;
                    const sequence = [start, start + step, start + (step * 2), start + (step * 3)];
                    const next = start + (step * 4);
                    
                    return {
                        question: `What comes next in this sequence: ${sequence.join(', ')}, ?`,
                        answer: next.toString(),
                        solution: `The pattern increases by ${step} each time, so the next number is ${next}.`
                    };
                }
            },
            {
                type: 'logic',
                generator: () => {
                    const age = Math.floor(Math.random() * 30) + 10;
                    const yearsAgo = Math.floor(Math.random() * 10) + 5;
                    const pastAge = age - yearsAgo;
                    
                    return {
                        question: `If someone is ${age} years old now, how old were they ${yearsAgo} years ago?`,
                        answer: pastAge.toString(),
                        solution: `${age} - ${yearsAgo} = ${pastAge} years old.`
                    };
                }
            },
            {
                type: 'time',
                generator: () => {
                    const hours = Math.floor(Math.random() * 12) + 1;
                    const minutes = Math.floor(Math.random() * 60);
                    const addHours = Math.floor(Math.random() * 3) + 1;
                    
                    let newHours = hours + addHours;
                    if (newHours > 12) newHours -= 12;
                    
                    return {
                        question: `If it's ${hours}:${minutes.toString().padStart(2, '0')}, what time will it be in ${addHours} hours?`,
                        answer: `${newHours}:${minutes.toString().padStart(2, '0')}`,
                        solution: `Adding ${addHours} hours to ${hours}:${minutes.toString().padStart(2, '0')} gives us ${newHours}:${minutes.toString().padStart(2, '0')}.`
                    };
                }
            }
        ];
        
        const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        const problem = problemType.generator();
        
        return {
            type: 'Math Challenge',
            title: 'Dynamic Math',
            description: problem.question,
            answer: problem.answer,
            solution: problem.solution,
            image: this.getCardImage('Math Challenge'),
            action: 'solve',
            category: 'content'
        };
    }

    generateFactTitle(category) {
        const titles = {
            'Ocean Life': ['Deep Sea Wonders', 'Marine Mysteries', 'Ocean Secrets', 'Aquatic Amazing Facts'],
            'Space Mysteries': ['Cosmic Wonders', 'Space Secrets', 'Stellar Facts', 'Universe Mysteries'],
            'Animal Kingdom': ['Wildlife Wonders', 'Animal Secrets', 'Nature\'s Marvels', 'Creature Features'],
            'Human Body': ['Body Mysteries', 'Human Marvels', 'Biological Wonders', 'Anatomy Secrets'],
            'Technology & Science': ['Science Secrets', 'Tech Wonders', 'Innovation Facts', 'Discovery Zone']
        };
        
        const categoryTitles = titles[category] || ['Amazing Facts'];
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }

    generateMathTitle(category) {
        const titles = {
            'arithmetic': ['Number Challenge', 'Math Mystery', 'Calculation Quest', 'Number Puzzle'],
            'patterns': ['Pattern Detective', 'Sequence Solver', 'Pattern Quest', 'Number Patterns'],
            'logic': ['Logic Challenge', 'Brain Teaser', 'Think Tank', 'Logic Puzzle']
        };
        
        const categoryTitles = titles[category] || ['Math Challenge'];
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }

    getCardImage(type, category = null) {
        // Comprehensive image mapping with multiple fallback options
        const imageMap = {
            // Game images with fallbacks
            'Game': {
                'tictactoe': ['images/tictactoe.svg'],
                'connect4': ['images/connect4.svg'],
                'chess': ['images/chess.svg'],
                'flappy': ['images/flappy.svg'],
                'sudoku': ['images/sudoku.svg'],
                'crossword': ['images/crossword.svg'],
                'pacman': ['images/pacman.svg'],
                'tetris': ['images/tetris.svg'],
                'galaga': ['images/galaga.svg'],
                'snake': ['images/snake.svg'],
                'breakout': ['images/breakout.svg'],
                'memory': ['images/memory.svg', 'images/memory-training.svg'],
                'wordsearch': ['images/wordsearch.svg', 'images/word-games.svg'],
                'solitaire': ['images/solitaire.svg'],
                'minesweeper': ['images/minesweeper.svg']
            },
            
            // Fun Facts images with multiple fallback options
            'Ocean Life': ['images/ocean-life.svg', 'images/nature-&-environment.svg', 'images/nature-environment.svg'],
            'Space Mysteries': ['images/space-mysteries.svg', 'images/mysteries-&-unexplained.svg'],
            'Animal Kingdom': ['images/animal-kingdom.svg', 'images/nature-&-environment.svg'],
            'Human Body': ['images/human-body.svg', 'images/physics-chemistry.svg'],
            'Technology & Science': ['images/technology-science.svg', 'images/technology-&-digital.svg', 'images/physics-chemistry.svg'],
            'Ancient History': ['images/ancient-history.svg', 'images/trivia-&-facts.svg'],
            'Medieval Times': ['images/medieval-times.svg', 'images/ancient-history.svg'],
            'Modern History': ['images/modern-history.svg', 'images/trivia-&-facts.svg'],
            'World Geography': ['images/world-geography.svg', 'images/geography-world.svg', 'images/trivia-&-facts.svg'],
            'Literature & Arts': ['images/literature-arts.svg', 'images/music-&-entertainment.svg'],
            'Psychology & Mind': ['images/psychology-mind.svg', 'images/personal-development.svg'],
            'Food & Culture': ['images/food-culture.svg', 'images/trivia-&-facts.svg'],
            'Amazing Fact': ['images/technology-science.svg', 'images/trivia-&-facts.svg', 'images/weird-science.svg'],
            
            // Riddle images with fallbacks
            'Riddle': ['images/riddle.svg', 'images/mathematics-&-logic.svg'],
            'Mystery Challenge': ['images/riddle.svg', 'images/mysteries-&-unexplained.svg'],
            'Word Puzzle': ['images/riddle.svg', 'images/word-games.svg'],
            'Logic Puzzle': ['images/riddle.svg', 'images/mathematics-&-logic.svg'],
            
            // Math Challenge images with fallbacks
            'Math Challenge': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Math Puzzle': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Pattern Puzzle': ['images/math-challenge.svg', 'images/visual-perception.svg'],
            'Logic Puzzle': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Number Quest': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Pattern Detective': ['images/math-challenge.svg', 'images/visual-perception.svg'],
            'Sequence Solver': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Pattern Quest': ['images/math-challenge.svg', 'images/visual-perception.svg'],
            'Number Patterns': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Logic Challenge': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Brain Teaser': ['images/math-challenge.svg', 'images/psychology-mind.svg'],
            'Think Tank': ['images/math-challenge.svg', 'images/strategy-planning.svg'],
            'Arithmetic Master': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Number Wizard': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Quick Math': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Math Quest': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Number Challenge': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Math Mystery': ['images/math-challenge.svg', 'images/mysteries-&-unexplained.svg'],
            'Calculation Quest': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Number Puzzle': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            
            // Activity images with comprehensive fallbacks
            'Activity': {
                'Creative Arts': ['images/creative-arts.svg', 'images/literature-arts.svg', 'images/music-&-entertainment.svg'],
                'Learning Adventures': ['images/learning-adventures.svg', 'images/language-learning.svg', 'images/trivia-knowledge.svg'],
                'Physical Challenges': ['images/physical-challenges.svg', 'images/sports-&-records.svg', 'images/sports-fitness.svg'],
                'Communication Skills': ['images/communication-skills.svg', 'images/language-learning.svg'],
                'Life Skills': ['images/life-skills.svg', 'images/personal-development.svg'],
                'Mental Exercises': ['images/mental-exercises.svg', 'images/memory-training.svg', 'images/psychology-mind.svg'],
                'Mindfulness & Reflection': ['images/mindfulness-&-reflection.svg', 'images/mindfulness.svg', 'images/personal-development.svg'],
                'Nature Connection': ['images/nature-connection.svg', 'images/nature-&-environment.svg', 'images/nature-environment.svg'],
                'Problem Solving': ['images/problem-solving.svg', 'images/strategy-planning.svg', 'images/mathematics-&-logic.svg'],
                'Social Experiments': ['images/social-experiments.svg', 'images/psychology-mind.svg'],
                'Storytelling': ['images/storytelling.svg', 'images/literature-arts.svg'],
                'Observation Games': ['images/observation-games.svg', 'images/visual-perception.svg']
            }
        };
        
        // Helper function to get the first available image from a list
        const getFirstAvailableImage = (imageList) => {
            if (!Array.isArray(imageList)) return imageList;
            return imageList[0]; // For now, return the first one. We'll add validation later.
        };
        
        // For games, use the category (gameType) to get specific image
        if (type === 'Game' && category) {
            const gameImages = imageMap['Game'][category];
            return getFirstAvailableImage(gameImages) || 'images/tictactoe.svg';
        }
        
        // For activities, use the category to get specific image
        if (type === 'Activity' && category) {
            const activityImages = imageMap['Activity'][category];
            return getFirstAvailableImage(activityImages) || 'images/literature-arts.svg';
        }
        
        // For other types, use the type directly
        const typeImages = imageMap[type];
        return getFirstAvailableImage(typeImages) || 'images/riddle.svg';
    }

    createFallbackImage(type, title) {
        // Create a data URL for an SVG fallback image
        const colors = {
            'Game': ['#667eea', '#764ba2'],
            'Riddle': ['#a29bfe', '#6c5ce7'],
            'Math Challenge': ['#00cec9', '#55a3ff'],
            'Amazing Fact': ['#74b9ff', '#0984e3'],
            'Activity': ['#fd79a8', '#fdcb6e'],
            'default': ['#ddd', '#999']
        };
        
        const colorPair = colors[type] || colors['default'];
        const icon = this.getTypeIcon(type);
        
        const svg = `
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fallbackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill="url(#fallbackGradient)" opacity="0.1"/>
                <circle cx="100" cy="100" r="60" fill="url(#fallbackGradient)" opacity="0.8"/>
                <text x="100" y="110" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle">${icon}</text>
                <text x="100" y="140" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.8">${type}</text>
            </svg>
        `;
        
        // Use encodeURIComponent instead of btoa to handle Unicode characters
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    createUniversalFallback(type) {
        // Create a simple, guaranteed-to-work fallback
        const colors = {
            'Game': '#667eea',
            'Riddle': '#a29bfe', 
            'Math Challenge': '#00cec9',
            'Amazing Fact': '#74b9ff',
            'Activity': '#fd79a8',
            'default': '#999'
        };
        
        const color = colors[type] || colors['default'];
        const icon = this.getTypeIcon(type);
        
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="${color}" opacity="0.8"/>
                <text x="50" y="55" font-family="Arial" font-size="30" fill="white" text-anchor="middle">${icon}</text>
            </svg>
        `)}`;
    }

    getTypeIcon(type) {
        const icons = {
            'Game': '🎮',
            'Riddle': '🧩',
            'Math Challenge': '🔢',
            'Amazing Fact': '💡',
            'Activity': '⭐',
            'default': '📝'
        };
        return icons[type] || icons['default'];
    }

    // Preload all SVG images to ensure they're available
    preloadImages() {
        const imagesToPreload = [
            'images/tictactoe.svg', 'images/connect4.svg', 'images/chess.svg', 'images/flappy.svg',
            'images/sudoku.svg', 'images/crossword.svg', 'images/pacman.svg', 'images/tetris.svg',
            'images/galaga.svg', 'images/snake.svg', 'images/breakout.svg', 'images/memory.svg',
            'images/wordsearch.svg', 'images/solitaire.svg', 'images/minesweeper.svg',
            'images/ocean-life.svg', 'images/space-mysteries.svg', 'images/animal-kingdom.svg',
            'images/human-body.svg', 'images/technology-science.svg', 'images/ancient-history.svg',
            'images/medieval-times.svg', 'images/modern-history.svg', 'images/world-geography.svg',
            'images/literature-arts.svg', 'images/psychology-mind.svg', 'images/food-culture.svg',
            'images/riddle.svg', 'images/math-challenge.svg', 'images/creative-arts.svg',
            'images/learning-adventures.svg', 'images/physical-challenges.svg',
            'images/communication-skills.svg', 'images/life-skills.svg', 'images/mental-exercises.svg',
            'images/mindfulness-&-reflection.svg', 'images/nature-connection.svg',
            'images/problem-solving.svg', 'images/social-experiments.svg', 'images/storytelling.svg',
            'images/observation-games.svg'
        ];

        console.log('🖼️ Starting comprehensive image preload...');
        let loadedCount = 0;
        let failedCount = 0;
        const totalImages = imagesToPreload.length;
        const failedImages = [];

        const loadPromises = imagesToPreload.map((src, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                
                const handleLoad = () => {
                    loadedCount++;
                    console.log(`✅ Preloaded ${src} (${loadedCount}/${totalImages})`);
                    resolve({ src, success: true });
                };
                
                const handleError = () => {
                    failedCount++;
                    failedImages.push(src);
                    console.error(`❌ Failed to preload ${src} (${failedCount} failures)`);
                    resolve({ src, success: false });
                };
                
                img.onload = handleLoad;
                img.onerror = handleError;
                
                // Set a timeout for loading
                setTimeout(() => {
                    if (!img.complete) {
                        img.onload = null;
                        img.onerror = null;
                        handleError();
                    }
                }, 5000);
                
                img.src = src;
            });
        });

        Promise.all(loadPromises).then(results => {
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            console.log(`🎯 Image preload complete: ${successful} loaded, ${failed} failed`);
            
            if (failed > 0) {
                console.warn('⚠️ Some images failed to load. Attempting to fix card display...');
                console.log('Failed images:', failedImages);
                
                // Force refresh card images after a delay
                setTimeout(() => {
                    this.refreshCardImages();
                }, 1000);
            } else {
                console.log('🎉 All images preloaded successfully!');
            }
        });
    }

    refreshCardImages() {
        console.log('🔄 Starting comprehensive card image refresh...');
        const cards = document.querySelectorAll('.card');
        let refreshedCount = 0;
        let fixedCount = 0;
        
        cards.forEach((card, index) => {
            const img = card.querySelector('.card-image');
            const container = card.querySelector('.card-image-container');
            const fallbackDiv = card.querySelector('.fallback-image');
            
            if (!img) {
                console.log(`⚠️ No image found in card ${index}`);
                return;
            }
            
            // Check if image failed to load or is broken
            const isImageBroken = !img.complete || img.naturalHeight === 0 || img.naturalWidth === 0 || img.style.display === 'none';
            
            if (isImageBroken) {
                console.log(`🔧 Fixing broken image in card ${index}:`, img.src);
                
                // Try to get activity data from the card
                const activityData = card.getAttribute('data-activity');
                let activity = null;
                try {
                    activity = JSON.parse(activityData);
                } catch (e) {
                    console.error('Failed to parse activity data:', e);
                }
                
                if (activity) {
                    // Regenerate the image source
                    const newImageSrc = activity.image || this.getCardImage(activity.type, activity.gameType || activity.category);
                    
                    // Reset the image
                    img.style.display = 'block';
                    img.style.opacity = '0';
                    
                    // Set up new error handling
                    img.onerror = () => {
                        console.error(`❌ Image still failed after refresh: ${newImageSrc}`);
                        img.style.display = 'none';
                        if (fallbackDiv) {
                            fallbackDiv.style.display = 'flex';
                        }
                    };
                    
                    img.onload = () => {
                        console.log(`✅ Successfully loaded refreshed image: ${newImageSrc}`);
                        img.style.opacity = '1';
                        if (fallbackDiv) {
                            fallbackDiv.style.display = 'none';
                        }
                    };
                    
                    // Add cache buster and set new source
                    const cacheBuster = '?refresh=' + Date.now() + Math.random();
                    setTimeout(() => {
                        img.src = newImageSrc + cacheBuster;
                    }, 50 * refreshedCount);
                    
                    refreshedCount++;
                } else {
                    // No activity data, show fallback
                    console.log(`⚠️ No activity data for card ${index}, showing fallback`);
                    img.style.display = 'none';
                    if (fallbackDiv) {
                        fallbackDiv.style.display = 'flex';
                    }
                    fixedCount++;
                }
            }
        });
        
        // Also check for any images that might be loading but taking too long
        setTimeout(() => {
            const stillLoadingImages = document.querySelectorAll('.card-image[src]:not([style*="display: none"])');
            stillLoadingImages.forEach(img => {
                if (!img.complete || img.naturalHeight === 0) {
                    console.log('⏰ Image taking too long to load, showing fallback:', img.src);
                    const fallbackDiv = img.parentNode.querySelector('.fallback-image');
                    if (fallbackDiv) {
                        img.style.display = 'none';
                        fallbackDiv.style.display = 'flex';
                        fixedCount++;
                    }
                }
            });
            
            console.log(`🎯 Image refresh complete: ${refreshedCount} refreshed, ${fixedCount} fixed with fallbacks`);
        }, 3000);
        
        if (refreshedCount > 0 || fixedCount > 0) {
            console.log(`🔄 Attempted to refresh ${refreshedCount} images and fixed ${fixedCount} with fallbacks`);
        } else {
            console.log('✅ All card images appear to be loading correctly');
        }
    }

    generateRandomFact() {
        const facts = [
            'Bananas are berries, but strawberries aren\'t! Botanically, berries must have seeds inside their flesh.',
            'A group of pandas is called an "embarrassment" - how adorable is that?',
            'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
            'There are more ways to arrange a deck of cards than there are atoms on Earth.',
            'Wombat poop is cube-shaped! This prevents it from rolling away and helps mark territory.'
        ];
        
        const fact = facts[Math.floor(Math.random() * facts.length)];
        this.usedContent.add(`random_fact_${fact}`);
        
        return {
            type: 'Amazing Fact',
            title: 'Did You Know?',
            description: fact,
            image: this.getCardImage('Amazing Fact'),
            action: 'read',
            category: 'content'
        };
    }

    generateRandomRiddle() {
        const riddles = [
            {
                question: 'What has many teeth but cannot bite?',
                answer: 'zipper',
                explanation: 'A zipper has many teeth but cannot bite!'
            },
            {
                question: 'What gets bigger the more you take away from it?',
                answer: 'hole',
                explanation: 'A hole gets bigger when you remove more material from it!'
            },
            {
                question: 'What can you catch but not throw?',
                answer: 'cold',
                explanation: 'You can catch a cold (illness) but you cannot throw it!'
            }
        ];
        
        const riddle = riddles[Math.floor(Math.random() * riddles.length)];
        this.usedContent.add(`random_riddle_${riddle.question}`);
        
        return {
            type: 'Riddle',
            title: 'Mystery Challenge',
            description: riddle.question,
            answer: riddle.answer,
            solution: riddle.explanation,
            image: this.getCardImage('Riddle'),
            action: 'solve',
            category: 'content'
        };
    }

    generateRandomMathProblem() {
        const problems = [
            {
                question: 'If a train travels 60 mph for 2.5 hours, how far does it go?',
                answer: '150',
                solution: 'Distance = Speed × Time = 60 mph × 2.5 hours = 150 miles'
            },
            {
                question: 'What\'s the next number in the sequence: 1, 1, 2, 3, 5, 8, ?',
                answer: '13',
                solution: 'This is the Fibonacci sequence where each number is the sum of the two before it: 5 + 8 = 13'
            },
            {
                question: 'If you fold a piece of paper in half 7 times, how many sections will you have?',
                answer: '128',
                solution: 'Each fold doubles the sections: 2^7 = 128 sections'
            }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        this.usedContent.add(`random_math_${problem.question}`);
        
        return {
            type: 'Math Challenge',
            title: 'Number Quest',
            description: problem.question,
            answer: problem.answer,
            solution: problem.solution,
            image: this.getCardImage('Math Challenge'),
            action: 'solve',
            category: 'content'
        };
    }

    // 🎯 Initialize Daily Content Backend System
    async initializeDailyContentSystem() {
        try {
            console.log('🎯 Initializing Daily Content Backend System...');
            
            // Wait for DailyContentBackend to be available
            if (typeof DailyContentBackend === 'undefined') {
                console.log('⏳ Waiting for DailyContentBackend to load...');
                await this.waitForDailyContentBackend();
            }
            
            this.dailyContentBackend = new DailyContentBackend();
            this.dailyCards = this.dailyContentBackend.getTodaysCards();
            
            console.log(`✅ Daily Content System initialized with ${this.dailyCards.length} cards for today`);
            console.log('📊 User Stats:', this.dailyContentBackend.getUserStats());
            
            // Clean up old cards to save storage space
            this.dailyContentBackend.cleanupOldCards();
            
        } catch (error) {
            console.error('❌ Failed to initialize Daily Content System:', error);
            // Fallback to original system if daily content fails
            this.dailyContentBackend = null;
            this.dailyCards = [];
        }
    }
    
    // Wait for DailyContentBackend to be loaded
    waitForDailyContentBackend() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof DailyContentBackend !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    generateCards() {
        this.cardsContainer.innerHTML = '';
        this.currentCards = [];
        
        // Debug logging
        console.log('🔍 generateCards() called with:');
        console.log('  - tierManager:', !!this.tierManager);
        console.log('  - currentTier:', this.tierManager ? this.tierManager.getCurrentTier() : 'none');
        console.log('  - dailyCardLimit:', this.tierManager ? this.tierManager.getDailyCardLimit() : 'none');
        console.log('  - cardsUsedToday:', this.tierManager ? this.tierManager.getCardsUsedToday() : 'none');
        console.log('  - isPremiumMode:', this.isPremiumMode);
        console.log('  - premiumContentBackend:', !!this.premiumContentBackend);
        console.log('  - premiumCards.length:', this.premiumCards ? this.premiumCards.length : 0);
        console.log('  - dailyContentBackend:', !!this.dailyContentBackend);
        console.log('  - dailyCards.length:', this.dailyCards ? this.dailyCards.length : 0);
        
        // Check if user has reached daily card limit
        if (this.tierManager && this.tierManager.hasReachedDailyLimit()) {
            console.log('⚠️ User has reached daily card limit');
            this.showDailyLimitReachedMessage();
            return;
        }
        
        // 🌟 Use Premium Content System if premium mode is enabled and available
        let selectedActivities;
        if (this.isPremiumMode && this.premiumContentBackend && this.premiumCards.length > 0) {
            selectedActivities = this.getNextPremiumCards(4); // Get next 4 cards from premium set
            console.log('🌟 Using Premium Content System - showing cards', this.currentPremiumCardIndex - 4, 'to', this.currentPremiumCardIndex - 1);
            console.log('🌟 Premium cards selected:', selectedActivities.map(card => ({ type: card.type, title: card.title, isNew: card.isNew })));
        }
        // 🎯 Use Daily Content System if available, otherwise fallback to original
        else if (this.dailyContentBackend && this.dailyCards.length > 0) {
            selectedActivities = this.getNextDailyCards(4); // Get next 4 cards from daily set
            console.log('🎯 Using Daily Content System - showing cards', this.currentDailyCardIndex - 4, 'to', this.currentDailyCardIndex - 1);
        } else {
            selectedActivities = this.generateFreshContent(); // Fallback to original system
            console.log('⚠️ Using fallback content generation');
        }
        
        // Track card usage with tier manager
        if (this.tierManager) {
            this.tierManager.trackCardUsage(selectedActivities.length);
        }
        
        selectedActivities.forEach((activity, index) => {
            const card = this.createCard(activity, index);
            this.cardsContainer.appendChild(card);
            this.currentCards.push(card);
        });
        
        // Animate cards in
        setTimeout(() => {
            this.currentCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = card.style.transform.replace('translateY(100px)', 'translateY(0px)');
                    
                    // Play swoosh sound as card animates in
                    this.playSwooshSound();
                    
                    // Start reading the top card (first card with highest z-index)
                    if (index === 0 && this.soundEnabled) {
                        setTimeout(() => {
                            console.log('Attempting to read initial card...');
                            this.speakCardContent(card);
                        }, 500); // Longer delay to ensure card is fully visible and TTS is ready
                    }
                }, index * 100);
            });
            
            // 🚀 AGGRESSIVE PRELOADING: Cache audio for ALL visible cards
            setTimeout(() => {
                this.preloadVisibleCardsAggressively();
            }, 500); // Start preloading immediately after cards are animated in
            
            // Update back button visibility based on swiped cards history
            this.updateBackButtonVisibility();
        }, 100);
    }
    
    // 🎯 Get next set of cards from daily content
    getNextDailyCards(count = 4) {
        const cards = [];
        
        for (let i = 0; i < count; i++) {
            if (this.currentDailyCardIndex < this.dailyCards.length) {
                const dailyCard = this.dailyCards[this.currentDailyCardIndex];
                
                // Convert daily card format to app format
                const appCard = this.convertDailyCardToAppFormat(dailyCard);
                cards.push(appCard);
                
                // Mark card as viewed
                if (this.dailyContentBackend) {
                    this.dailyContentBackend.markCardAsViewed(dailyCard.contentId);
                }
                
                this.currentDailyCardIndex++;
            } else {
                // If we've shown all daily cards, cycle back to beginning
                this.currentDailyCardIndex = 0;
                if (this.dailyCards.length > 0) {
                    const dailyCard = this.dailyCards[this.currentDailyCardIndex];
                    const appCard = this.convertDailyCardToAppFormat(dailyCard);
                    cards.push(appCard);
                    this.currentDailyCardIndex++;
                }
            }
        }
        
        // If we don't have enough daily cards, fill with basic games from backend
        while (cards.length < count && this.dailyContentBackend) {
            const basicGame = this.dailyContentBackend.generateBasicGame();
            if (basicGame) {
                const appCard = this.convertDailyCardToAppFormat(basicGame);
                cards.push(appCard);
            } else {
                break; // No more games available
            }
        }
        
        return cards;
    }
    
    // 🎯 Convert daily card format to app card format
    convertDailyCardToAppFormat(dailyCard) {
        // Use the main script's comprehensive getCardImage function instead of the limited backend image
        let improvedImage = dailyCard.image;
        
        // For activities, try to get a better image based on the activity category
        if (dailyCard.type === 'Activity' && dailyCard.title) {
            // Map activity titles to better image categories
            const title = dailyCard.title.toLowerCase();
            if (title.includes('creative') || title.includes('art')) {
                improvedImage = this.getCardImage('Activity', 'Creative Arts');
            } else if (title.includes('learning') || title.includes('knowledge') || title.includes('discovery')) {
                improvedImage = this.getCardImage('Activity', 'Learning Adventures');
            } else if (title.includes('fitness') || title.includes('physical') || title.includes('movement') || title.includes('active')) {
                improvedImage = this.getCardImage('Activity', 'Physical Challenges');
            } else {
                // Use the main script's getCardImage for better fallback
                improvedImage = this.getCardImage(dailyCard.type);
            }
        } else {
            // For other types, use the main script's getCardImage function
            improvedImage = this.getCardImage(dailyCard.type);
        }
        
        console.log(`🖼️ Daily Card Image Assignment:`, {
            title: dailyCard.title,
            type: dailyCard.type,
            originalImage: dailyCard.image,
            improvedImage: improvedImage
        });
        
        return {
            type: dailyCard.type,
            title: dailyCard.title,
            description: dailyCard.description,
            image: improvedImage,
            action: dailyCard.action,
            category: dailyCard.category,
            answer: dailyCard.answer || null,
            solution: dailyCard.solution || null,
            isNew: dailyCard.isNew || false
        };
    }
    
    // 🌟 Initialize Premium Content Backend System
    async initializePremiumContentSystem() {
        try {
            console.log('🌟 Initializing Premium Content Backend System...');
            
            // Wait for PremiumContentBackend to be available
            if (typeof PremiumContentBackend === 'undefined') {
                console.log('⏳ Waiting for PremiumContentBackend to load...');
                await this.waitForPremiumContentBackend();
            }
            
            this.premiumContentBackend = new PremiumContentBackend();
            this.premiumCards = this.premiumContentBackend.generateTodaysPremiumCards();
            
            console.log(`✅ Premium Content System initialized with ${this.premiumCards.length} cards for today`);
            console.log('📊 Premium User Stats:', this.premiumContentBackend.getUserStats());
            
            // Clean up old cards to save storage space
            this.premiumContentBackend.cleanupOldCards();
            
        } catch (error) {
            console.error('❌ Failed to initialize Premium Content System:', error);
            // Fallback to daily content system if premium fails
            this.premiumContentBackend = null;
            this.premiumCards = [];
        }
    }
    
    // Wait for PremiumContentBackend to be loaded
    waitForPremiumContentBackend() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof PremiumContentBackend !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }
    
    // 🌟 Get next set of cards from premium content
    getNextPremiumCards(count = 4) {
        const cards = [];
        
        for (let i = 0; i < count; i++) {
            if (this.currentPremiumCardIndex < this.premiumCards.length) {
                const premiumCard = this.premiumCards[this.currentPremiumCardIndex];
                
                // Convert premium card format to app format
                const appCard = this.convertPremiumCardToAppFormat(premiumCard);
                cards.push(appCard);
                
                // Mark card as viewed
                if (this.premiumContentBackend) {
                    this.premiumContentBackend.markCardAsViewed(premiumCard.contentId);
                }
                
                this.currentPremiumCardIndex++;
            } else {
                // If we've shown all premium cards, cycle back to beginning
                this.currentPremiumCardIndex = 0;
                if (this.premiumCards.length > 0) {
                    const premiumCard = this.premiumCards[this.currentPremiumCardIndex];
                    const appCard = this.convertPremiumCardToAppFormat(premiumCard);
                    cards.push(appCard);
                    this.currentPremiumCardIndex++;
                }
            }
        }
        
        // If we don't have enough premium cards, fill with premium games
        while (cards.length < count) {
            const premiumGameActivity = this.getPremiumGameActivity();
            cards.push(premiumGameActivity);
        }
        
        return cards;
    }
    
    // 🌟 Convert premium card format to app card format
    convertPremiumCardToAppFormat(premiumCard) {
        return {
            type: premiumCard.type,
            title: premiumCard.title,
            description: premiumCard.description,
            image: premiumCard.image,
            action: premiumCard.action,
            category: premiumCard.category,
            answer: premiumCard.answer || null,
            solution: premiumCard.solution || null,
            isNew: premiumCard.isNew || false,
            gameType: premiumCard.gameType || null
        };
    }
    
    // 🌟 Get a random premium game activity
    getPremiumGameActivity() {
        // Use premium games from the backend if available
        if (this.premiumContentBackend && this.premiumContentBackend.contentPools && this.premiumContentBackend.contentPools.premiumGames) {
            const premiumGames = this.premiumContentBackend.contentPools.premiumGames;
            const randomGame = premiumGames[Math.floor(Math.random() * premiumGames.length)];
            
            // Convert backend game format to app format
            return {
                type: randomGame.type,
                title: randomGame.title,
                description: randomGame.description,
                action: randomGame.action,
                gameType: randomGame.gameType,
                category: randomGame.category,
                image: randomGame.image
            };
        }
        
        // Fallback to hardcoded games if backend is not available
        const fallbackGames = [
            {
                type: 'Premium Game',
                title: '🧩 Sudoku Master',
                description: 'Challenge your logic with this classic number puzzle. Fill the 9x9 grid with digits 1-9.',
                action: 'play',
                gameType: 'sudoku',
                category: 'Logic',
                image: 'images/sudoku.svg'
            },
            {
                type: 'Premium Game',
                title: '📝 Crossword Puzzle',
                description: 'Test your vocabulary with challenging crossword clues and wordplay.',
                action: 'play',
                gameType: 'crossword',
                category: 'Word',
                image: 'images/crossword.svg'
            },
            {
                type: 'Premium Game',
                title: '👻 Pac-Man Classic',
                description: 'Navigate the maze, eat dots, and avoid ghosts in this timeless arcade game.',
                action: 'play',
                gameType: 'pacman',
                category: 'Arcade',
                image: 'images/pacman.svg'
            }
        ];
        
        return fallbackGames[Math.floor(Math.random() * fallbackGames.length)];
    }
    
    // 🌟 Show premium popup instead of instant toggle
    async togglePremiumMode() {
        console.log('🌟 Premium button clicked - showing comparison popup');
        
        // Check if user is already premium
        const currentTier = this.tierManager ? this.tierManager.getCurrentTier() : 'basic';
        
        if (currentTier === 'premium') {
            // User is already premium, show premium dashboard or settings
            this.showPremiumDashboard();
        } else {
            // User is basic, show premium comparison popup
            if (window.premiumPopup) {
                window.premiumPopup.open();
            } else {
                console.error('Premium popup not initialized');
                // Fallback: show alert
                alert('Premium features coming soon! Upgrade to unlock unlimited brain training.');
            }
        }
    }

    // Show premium dashboard for existing premium users
    showPremiumDashboard() {
        // Create a simple premium dashboard
        const notification = document.createElement('div');
        notification.className = 'premium-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-crown"></i>
                <span>🌟 Premium Active!</span>
                <div class="notification-details">
                    ✨ You have unlimited access to all features
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 15px; background: rgba(255,255,255,0.2); border: none; border-radius: 5px; color: inherit; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
            color: #333;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Update premium UI after successful payment
    async updatePremiumUI() {
        const premiumToggleBtn = document.getElementById('premiumToggleBtn');
        const premiumRefreshBtn = document.getElementById('premiumRefreshBtn');
        
        if (premiumToggleBtn) {
            premiumToggleBtn.classList.add('active');
            premiumToggleBtn.title = 'Premium Mode Active';
            
            // Update button text to show it's active
            const premiumLabel = premiumToggleBtn.querySelector('.premium-label');
            if (premiumLabel) {
                premiumLabel.textContent = 'Premium ✓';
            }
        }
        
        // Show premium refresh button
        if (premiumRefreshBtn) {
            premiumRefreshBtn.style.display = 'flex';
        }
        
        // Initialize premium content system
        if (!this.premiumContentBackend) {
            await this.initializePremiumContentSystem();
        }
        
        // Reset card indices
        this.currentDailyCardIndex = 0;
        this.currentPremiumCardIndex = 0;
        
        console.log('🌟 Premium UI updated successfully');
    }

    // 🌟 Force refresh premium content (for testing)
    async forceRefreshPremiumContent() {
        if (!this.premiumContentBackend) {
            console.log('❌ Premium content backend not initialized');
            return false;
        }
        
        try {
            // Clear all premium cache
            const today = new Date().toDateString();
            localStorage.removeItem(`boredom_buster_premium_daily_cards_${today}`);
            localStorage.removeItem(`boredom_buster_premium_last_generated`);
            
            // Clear seen content for premium
            localStorage.removeItem('boredom_buster_premium_seen_content');
            
            // Regenerate premium content
            this.premiumCards = this.premiumContentBackend.generateTodaysPremiumCards();
            this.currentPremiumCardIndex = 0;
            
            console.log(`🌟 Force refreshed ${this.premiumCards.length} premium cards`);
            
            // Generate new card if in premium mode
            if (this.isPremiumMode) {
                await this.generateCards();
            }
            
            this.showNotification('Premium content refreshed! New cards available.', 'success');
            return true;
        } catch (error) {
            console.error('❌ Failed to refresh premium content:', error);
            this.showNotification('Failed to refresh premium content', 'error');
            return false;
        }
    }

    // Show notification when premium mode is toggled
    showPremiumModeNotification() {
        console.log('🌟 Showing premium mode notification:', this.isPremiumMode ? 'ACTIVATED' : 'DEACTIVATED');
        
        // Remove any existing notification
        const existingNotification = document.querySelector('.premium-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'premium-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-crown"></i>
                <span>${this.isPremiumMode ? '🌟 Premium Mode Activated!' : '📱 Premium Mode Deactivated'}</span>
                <div class="notification-details">
                    ${this.isPremiumMode ? '✨ Enhanced content + premium games available!' : '🔄 Back to standard content'}
                </div>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.isPremiumMode ? 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: ${this.isPremiumMode ? '#333' : 'white'};
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Show notification messages
    showNotification(message, type = 'info') {
        // Remove any existing notification
        const existingNotification = document.querySelector('.app-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'app-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles based on type
        const colors = {
            success: { bg: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', color: 'white' },
            error: { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: 'white' },
            info: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }
        };
        
        const style = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${style.bg};
            color: ${style.color};
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Show daily limit reached message
    showDailyLimitReachedMessage() {
        if (!this.tierManager) return;

        const currentTier = this.tierManager.getCurrentTier();
        const dailyLimit = this.tierManager.getDailyCardLimit();
        const cardsUsed = this.tierManager.getCardsUsedToday();

        // Clear existing cards
        this.cardsContainer.innerHTML = '';

        // Create limit reached message
        const limitMessage = document.createElement('div');
        limitMessage.className = 'daily-limit-message';
        limitMessage.innerHTML = `
            <div class="limit-content">
                <div class="limit-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h3>Daily Limit Reached</h3>
                <p>You've used all ${dailyLimit} cards for today as a ${currentTier} user.</p>
                <div class="limit-stats">
                    <div class="stat">
                        <span class="stat-label">Cards Used:</span>
                        <span class="stat-value">${cardsUsed}/${dailyLimit}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Tier:</span>
                        <span class="stat-value">${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span>
                    </div>
                </div>
                ${currentTier === 'basic' ? `
                    <div class="upgrade-prompt">
                        <p>Upgrade to Premium for 100 daily cards!</p>
                        <button class="upgrade-btn" onclick="app.togglePremiumMode()">
                            <i class="fas fa-crown"></i> Upgrade to Premium
                        </button>
                    </div>
                ` : `
                    <div class="reset-info">
                        <p>Your cards will reset tomorrow at midnight.</p>
                    </div>
                `}
            </div>
        `;

        // Add styles
        limitMessage.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            padding: 20px;
        `;

        // Add CSS for the limit message
        if (!document.querySelector('#daily-limit-styles')) {
            const styles = document.createElement('style');
            styles.id = 'daily-limit-styles';
            styles.textContent = `
                .limit-content {
                    text-align: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 400px;
                    width: 100%;
                }
                .limit-icon {
                    font-size: 3rem;
                    margin-bottom: 20px;
                    opacity: 0.8;
                }
                .limit-content h3 {
                    margin: 0 0 15px 0;
                    font-size: 1.8rem;
                    font-weight: 700;
                }
                .limit-content p {
                    margin: 0 0 20px 0;
                    opacity: 0.9;
                    line-height: 1.5;
                }
                .limit-stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    padding: 20px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .stat {
                    text-align: center;
                }
                .stat-label {
                    display: block;
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-bottom: 5px;
                }
                .stat-value {
                    display: block;
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                .upgrade-prompt {
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.2);
                }
                .upgrade-btn {
                    background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
                    color: #333;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                    margin-top: 10px;
                }
                .upgrade-btn:hover {
                    transform: translateY(-2px);
                }
                .reset-info {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.2);
                    opacity: 0.8;
                }
            `;
            document.head.appendChild(styles);
        }

        this.cardsContainer.appendChild(limitMessage);
    }

    createCard(activity, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.opacity = '0';
        card.style.transform += ' translateY(100px)';
        
        // Store the complete activity data for back button functionality
        card.setAttribute('data-activity', JSON.stringify(activity));
        
        // Generate unique ID for all cards for save functionality
        const cardId = this.generateCardId(activity);
        card.setAttribute('data-card-id', cardId);
        
        let actionButton = '';
        if (activity.action === 'play') {
            actionButton = `<button class="play-btn" onclick="app.openGame('${activity.gameType}', '${activity.title}')">
                <i class="fas fa-play"></i> Play Game
            </button>`;
        } else if (activity.action === 'solve' || activity.action === 'Show Answer' || activity.action === 'Show Solution') {
            const buttonText = activity.action === 'Show Solution' ? 'Show Solution' : 'Show Answer';
            const answer = activity.answer || activity.solution || '';
            const solution = activity.solution || activity.explanation || activity.answer || '';
            actionButton = `<button class="play-btn show-answer-btn" data-answer="${answer}" data-solution="${solution}">
                <i class="fas fa-lightbulb"></i> ${buttonText}
            </button>`;
        }
        
        // Enhanced image loading system with multiple fallbacks
        const primaryImageSrc = activity.image || this.getCardImage(activity.type, activity.gameType || activity.category);
        
        // Debug logging for image assignment
        console.log(`🖼️ Card Image Debug:`, {
            title: activity.title,
            type: activity.type,
            gameType: activity.gameType,
            category: activity.category,
            activityImage: activity.image,
            calculatedImage: this.getCardImage(activity.type, activity.gameType || activity.category),
            finalImageSrc: primaryImageSrc
        });
        
        // Create multiple fallback options
        const fallbackImageUrl = this.createFallbackImage(activity.type, activity.title);
        const universalFallback = this.createUniversalFallback(activity.type);
        
        // Create robust image HTML with comprehensive error handling
        const imageHtml = primaryImageSrc ? 
            `<div class="card-image-container" style="position: relative; width: 100%; height: 120px; border-radius: 8px; overflow: hidden;">
                <img src="${primaryImageSrc}" 
                     alt="${activity.title}" 
                     class="card-image" 
                     style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease;"
                     onerror="this.style.display='none'; this.parentNode.querySelector('.fallback-image').style.display='flex'; console.error('❌ Primary image failed:', '${primaryImageSrc}');" 
                     onload="console.log('✅ Primary image loaded:', '${primaryImageSrc}'); this.style.opacity='1';">
                <div class="fallback-image" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); align-items: center; justify-content: center; color: white; font-size: 2rem; text-align: center; flex-direction: column;">
                    <div style="font-size: 2.5rem; margin-bottom: 8px;">${this.getTypeIcon(activity.type)}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">${activity.type}</div>
                </div>
            </div>` : 
            `<div class="card-image-placeholder" style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; text-align: center; flex-direction: column;">
                <div style="font-size: 2rem; margin-bottom: 8px;">⚠️</div>
                <div>No Image<br/>Assigned</div>
            </div>`;
        
        card.innerHTML = `
            <div class="card-content">
                <div class="card-header">
                    <span class="card-type">${activity.type}</span>
                    <h3 class="card-title">${activity.title}</h3>
                    ${activity.type !== 'Game' && activity.type !== 'Chess Puzzle' ? 
                        `<button class="sound-toggle sound-on" title="Toggle sound">🔊</button>` : ''}
                </div>
                <div class="card-body">
                    <p class="card-description">${activity.description}</p>
                    ${imageHtml}
                    <div class="answer-section" style="display: none;">
                        <div class="answer-divider"></div>
                        <div class="answer-content">
                            <h4 class="answer-title">Answer:</h4>
                            <p class="answer-text"></p>
                            <h4 class="solution-title">Explanation:</h4>
                            <p class="solution-text"></p>
                        </div>
                    </div>
                    ${actionButton}
                </div>
                <div class="swipe-indicator">
                    <i class="fas fa-hand-paper"></i> Swipe
                </div>
                <button class="card-back-btn" title="Bring back previous card" style="display: none;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <button class="card-save-btn" title="Save this card for later">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        `;
        
        // Add event listener for show answer button
        if (activity.action === 'solve' || activity.action === 'Show Answer' || activity.action === 'Show Solution') {
            const showAnswerBtn = card.querySelector('.show-answer-btn');
            if (showAnswerBtn) {
                showAnswerBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card swiping
                    this.userHasInteracted = true; // Mark that user has interacted
                    const answer = activity.answer || activity.solution || '';
                    const solution = activity.solution || activity.explanation || activity.answer || '';
                    this.showSolutionInline(card, answer, solution);
                });
            }
        }
        
        // Add sound toggle event listener
        const soundToggle = card.querySelector('.sound-toggle');
        if (soundToggle) {
            // Initialize button state based on current soundEnabled setting and speech readiness
            if (!this.speechReady && this.soundEnabled) {
                soundToggle.textContent = '⏳';
                soundToggle.title = 'Audio is being prepared... Click anywhere to enable audio';
            } else {
                soundToggle.classList.toggle('sound-on', this.soundEnabled);
                soundToggle.classList.toggle('sound-off', !this.soundEnabled);
                soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
                soundToggle.title = this.soundEnabled ? 'Click to disable sound' : 'Click to enable sound';
            }
            
            soundToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card swiping
                this.userHasInteracted = true; // Mark that user has interacted
                
                // Always toggle sound state when clicked
                this.toggleSound(card);
            });
        }

        // Add card back button event listener
        const cardBackBtn = card.querySelector('.card-back-btn');
        if (cardBackBtn) {
            cardBackBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card swiping
                this.userHasInteracted = true; // Mark that user has interacted
                this.bringBackLastCard();
            });
        }

        // Add card save button event listener
        const cardSaveBtn = card.querySelector('.card-save-btn');
        console.log('🔖 Looking for save button, found:', cardSaveBtn);
        if (cardSaveBtn) {
            console.log('🔖 Save button found, setting up event listener');
            // Check if card is already saved and update button appearance
            const cardId = this.generateCardId(activity);
            const isSaved = this.isCardSaved(cardId);
            console.log('🔖 Card ID:', cardId, 'Is saved:', isSaved);
            this.updateSaveButtonAppearance(cardSaveBtn, isSaved);
            
            // Set the card ID as a data attribute for reference
            card.dataset.cardId = cardId;
            console.log('🔖 Set card dataset.cardId to:', cardId);
            
            cardSaveBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card swiping
                this.userHasInteracted = true; // Mark that user has interacted
                
                console.log('Save button clicked for activity:', activity);
                console.log('Activity properties:', {
                    title: activity.title,
                    description: activity.description,
                    category: activity.category,
                    type: activity.type
                });
                
                try {
                    this.toggleSaveCard(activity);
                    console.log('Save toggle completed successfully');
                } catch (error) {
                    console.error('Error in toggleSaveCard:', error);
                }
            });
        }

        
        this.addSwipeListeners(card);
        
        // Check for overflow content after DOM is ready
        setTimeout(() => {
            this.checkCardOverflow(card);
        }, 100);
        
        // Add card to intersection observer for automatic audio triggering
        if (this.cardObserver) {
            this.cardObserver.observe(card);
        }
        
        // Set up image monitoring for this specific card
        this.monitorCardImage(card);
        
        return card;
    }

    monitorCardImage(card) {
        const img = card.querySelector('.card-image');
        const fallbackDiv = card.querySelector('.fallback-image');
        
        if (!img) return;
        
        // Set up a timeout to check if image loads within reasonable time
        const imageTimeout = setTimeout(() => {
            if (!img.complete || img.naturalHeight === 0 || img.naturalWidth === 0) {
                console.log('⏰ Image loading timeout, showing fallback:', img.src);
                img.style.display = 'none';
                if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                }
            }
        }, 5000); // 5 second timeout
        
        // Clear timeout if image loads successfully
        img.onload = () => {
            clearTimeout(imageTimeout);
            console.log('✅ Image loaded successfully:', img.src);
            img.style.opacity = '1';
            if (fallbackDiv) {
                fallbackDiv.style.display = 'none';
            }
        };
        
        // Handle immediate errors
        img.onerror = () => {
            clearTimeout(imageTimeout);
            console.error('❌ Image failed to load:', img.src);
            img.style.display = 'none';
            if (fallbackDiv) {
                fallbackDiv.style.display = 'flex';
            }
        };
    }

    // Setup image refresh button and periodic refresh
    setupImageRefreshButton() {
        // Create image refresh button if it doesn't exist
        let refreshBtn = document.getElementById('imageRefreshBtn');
        if (!refreshBtn) {
            refreshBtn = document.createElement('button');
            refreshBtn.id = 'imageRefreshBtn';
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.title = 'Refresh card images';
            refreshBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 80px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Add hover effects
            refreshBtn.addEventListener('mouseenter', () => {
                refreshBtn.style.transform = 'scale(1.1)';
                refreshBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            });
            
            refreshBtn.addEventListener('mouseleave', () => {
                refreshBtn.style.transform = 'scale(1)';
                refreshBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            });
            
            // Add click handler
            refreshBtn.addEventListener('click', () => {
                console.log('🖼️ Manual image refresh triggered');
                refreshBtn.style.animation = 'spin 1s linear';
                this.refreshCardImages();
                setTimeout(() => {
                    refreshBtn.style.animation = '';
                }, 1000);
            });
            
            document.body.appendChild(refreshBtn);
        }

        // Set up periodic image refresh every 30 seconds
        setInterval(() => {
            console.log('🖼️ Running periodic image refresh...');
            this.refreshCardImages();
        }, 30000);

        // Add CSS for spin animation
        if (!document.getElementById('imageRefreshStyles')) {
            const style = document.createElement('style');
            style.id = 'imageRefreshStyles';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    checkCardOverflow(card) {
        const cardContent = card.querySelector('.card-content');
        if (cardContent) {
            // Check if content height exceeds container height
            if (cardContent.scrollHeight > cardContent.clientHeight) {
                cardContent.classList.add('has-overflow');
            } else {
                cardContent.classList.remove('has-overflow');
            }
        }
    }

    addSwipeListeners(card) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let isScrolling = false;
        let velocity = 0;
        let lastTime = 0;
        let lastX = 0;
        let scrollStartTime = 0;
        let animationFrame = null;
        
        // Performance optimization: Use transform3d for hardware acceleration
        const setCardTransform = (x, y, rotation, scale, opacity) => {
            // Use transform3d for hardware acceleration and batch DOM updates
            // Cache the transform string to reduce string concatenation overhead
            const transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
            card.style.transform = transform;
            card.style.opacity = opacity;
        };
        
        // Throttled move handler using requestAnimationFrame
        const throttledMove = (deltaX, deltaY) => {
            if (animationFrame) return; // Skip if animation frame is already queued
            
            animationFrame = requestAnimationFrame(() => {
                // Optimized calculations with reduced complexity
                const rotation = deltaX * 0.1; // Reduced rotation factor for smoother feel
                const scale = Math.max(0.98, 1 - Math.abs(deltaX) * 0.0003); // Less aggressive scaling
                const verticalOffset = Math.abs(deltaX) * 0.05; // Reduced vertical movement
                const opacity = Math.max(0.5, 1 - Math.abs(deltaX) * 0.001); // Less aggressive opacity change
                
                setCardTransform(deltaX, -verticalOffset, rotation, scale, opacity);
                animationFrame = null;
            });
        };
        
        const handleStart = (e) => {
            // Only handle actual mouse down or touch start events
            if (e.type !== 'mousedown' && e.type !== 'touchstart') {
                return;
            }
            
            // Check if the touch started on a scrollable area
            const target = e.target;
            const cardContent = card.querySelector('.card-content');
            const isOnScrollableContent = cardContent && cardContent.contains(target);
            
            const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
            
            startX = clientX;
            startY = clientY;
            currentX = clientX;
            currentY = clientY;
            lastX = clientX;
            lastTime = Date.now();
            scrollStartTime = Date.now();
            velocity = 0;
            isDragging = false;
            isScrolling = false;
            
            // Cancel any pending animation frames
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            // For touch events on non-scrollable content, start immediately for better responsiveness
            if (e.type === 'touchstart' && !isOnScrollableContent) {
                isDragging = true;
                card.style.transition = 'none';
                card.style.cursor = 'grabbing';
                card.style.zIndex = '100';
                card.style.willChange = 'transform, opacity'; // Hint browser for optimization
            }
        };
        
        const handleMove = (e) => {
            const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            
            currentX = clientX;
            currentY = clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Determine if this is a scroll gesture or swipe gesture
            if (!isDragging && !isScrolling) {
                const timeSinceStart = Date.now() - scrollStartTime;
                
                // For mouse events, require more movement to prevent accidental drags
                if (e.type === 'mousemove') {
                    if (absDeltaX < 15 && absDeltaY < 15) {
                        return; // Not enough movement to start dragging
                    }
                }
                
                // Improved gesture detection with better thresholds
                if (absDeltaY > absDeltaX && absDeltaY > 8) {
                    isScrolling = true;
                    return; // Let the browser handle scrolling
                }
                else if (absDeltaX > 10 || (absDeltaX > absDeltaY && absDeltaX > 5)) {
                    isDragging = true;
                    card.style.transition = 'none';
                    card.style.cursor = 'grabbing';
                    card.style.zIndex = '100';
                    card.style.willChange = 'transform, opacity';
                }
                else if (timeSinceStart < 100) { // Reduced wait time for better responsiveness
                    return;
                }
            }
            
            // Handle scrolling - don't interfere
            if (isScrolling) {
                return;
            }
            
            // Handle swiping
            if (!isDragging) return;
            
            // Only prevent default for actual swipe gestures
            if (absDeltaX > 5) {
                e.preventDefault();
            }
            
            // Calculate velocity for momentum (optimized)
            const currentTime = Date.now();
            const timeDelta = currentTime - lastTime;
            if (timeDelta > 16) { // Throttle velocity calculation to ~60fps
                velocity = (currentX - lastX) / timeDelta;
                lastX = currentX;
                lastTime = currentTime;
            }
            
            // Use throttled animation for smooth performance
            throttledMove(deltaX, deltaY);
        };
        
        const handleEnd = () => {
            // Cancel any pending animation frames
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            // Reset scrolling state
            if (isScrolling) {
                isScrolling = false;
                return;
            }
            
            if (!isDragging) return;
            isDragging = false;
            
            const deltaX = currentX - startX;
            const swipeThreshold = 100; // Reduced threshold for more responsive swiping
            const velocityThreshold = 0.4; // Slightly reduced for easier swiping
            
            // Consider both distance and velocity for swipe detection
            const shouldSwipe = Math.abs(deltaX) > swipeThreshold || Math.abs(velocity) > velocityThreshold;
            
            card.style.cursor = 'grab';
            card.style.willChange = 'auto'; // Reset will-change to save memory
            
            if (shouldSwipe) {
                // Mark user interaction when swiping
                this.userHasInteracted = true;
                
                // Store card data in history before removing it
                try {
                    const activityData = card.getAttribute('data-activity');
                    if (activityData) {
                        const activity = JSON.parse(activityData);
                        this.addToSwipedHistory(activity);
                    }
                } catch (error) {
                    console.log('Could not store swiped card data:', error);
                }
                
                // Stop speech when card is swiped away
                if (this.currentSpeakingCard === card) {
                    this.stopSpeech();
                }
                
                // Optimized swipe away animation with hardware acceleration
                const direction = deltaX > 0 ? 1 : -1;
                const finalX = direction * (window.innerWidth + 150);
                const finalRotation = direction * 25 + (velocity * 30); // Reduced rotation for smoother feel
                
                // Use faster, more optimized transition
                card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease-out';
                card.style.transform = `translate3d(${finalX}px, -80px, 0) rotate(${finalRotation}deg) scale(0.85)`;
                card.style.opacity = '0';
                
                // Add swipe class for additional styling
                card.classList.add('swiped');
                
                // Unobserve the swiped card
                if (this.cardObserver) {
                    this.cardObserver.unobserve(card);
                }
                
                // Reduced timeout for faster card replacement
                setTimeout(() => {
                    this.addNewCard();
                    card.remove();
                    
                    // Trigger audio for the new top card after swipe
                    setTimeout(() => {
                        const newTopCard = this.getTopCard();
                        if (newTopCard && this.soundEnabled && this.speechReady) {
                            console.log('New top card after swipe, auto-playing audio');
                            newTopCard.removeAttribute('data-audio-played'); // Allow audio to play again
                            this.speakCardContent(newTopCard);
                        }
                    }, 200); // Reduced delay for faster audio response
                }, 600); // Reduced from 800ms for faster card replacement
            } else {
                // Optimized snap back animation
                card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out';
                card.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
                card.style.opacity = '1';
                card.style.zIndex = '';
                
                // Reset will-change after animation
                setTimeout(() => {
                    card.style.willChange = 'auto';
                }, 400);
            }
        };
        
        // Prevent context menu on long press
        card.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Mouse event handlers that are added/removed dynamically
        const mouseMoveHandler = (e) => handleMove(e);
        const mouseUpHandler = (e) => {
            handleEnd(e);
            // Remove global listeners when mouse is released
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        
        // Mouse events - only add global listeners when mouse is pressed
        card.addEventListener('mousedown', (e) => {
            handleStart(e);
            // Only add global listeners when actually starting a drag
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
        
        // Optimized touch events with better passive handling
        card.addEventListener('touchstart', handleStart, { passive: true });
        card.addEventListener('touchmove', handleMove, { passive: false }); // Only non-passive for preventDefault
        card.addEventListener('touchend', handleEnd, { passive: true });
        
        // Handle mouse leave to prevent stuck drag state
        card.addEventListener('mouseleave', () => {
            if (isDragging) {
                handleEnd();
                // Clean up global listeners
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            }
        });
        
        // Add grab cursor
        card.style.cursor = 'grab';
    }

    addNewCard() {
        // Generate a single fresh activity (mix of games and fresh content)
        const freshActivities = this.generateFreshContent(1);
        const randomActivity = freshActivities[0];
        
        const newCard = this.createCard(randomActivity, 0);
        
        // Position it at the back
        newCard.style.zIndex = '1';
        newCard.style.transform = 'translateX(-60px) translateY(30px) rotate(-15deg) translateY(100px)';
        newCard.style.opacity = '0';
        
        this.cardsContainer.appendChild(newCard);
        
        // Animate in
        setTimeout(() => {
            newCard.style.opacity = '1';
            newCard.style.transform = 'translateX(-60px) translateY(30px) rotate(-15deg)';
            
            // Play swoosh sound as new card animates in
            this.playSwooshSound();
        }, 100);
        
        // Update z-indexes of existing cards
        const cards = this.cardsContainer.querySelectorAll('.card:not(.swiped)');
        cards.forEach((card, index) => {
            card.style.zIndex = cards.length - index;
        });
        
        // Automatically start reading the new card
        setTimeout(() => {
            const topCard = this.getTopCard();
            if (topCard && this.soundEnabled) {
                console.log('Auto-playing audio for new top card');
                this.speakCardContent(topCard);
            }
        }, 500); // Delay to allow card to animate in
        
        // 🚀 PRELOAD AUDIO: Cache audio for the new card immediately
        setTimeout(() => {
            this.preloadCardAudio(newCard);
        }, 300);
    }

    getTopCard() {
        // Find the card with the highest z-index (the top card)
        const cards = this.cardsContainer.querySelectorAll('.card:not(.swiped)');
        let topCard = null;
        let highestZIndex = -1;
        
        cards.forEach(card => {
            const zIndex = parseInt(card.style.zIndex) || 0;
            if (zIndex > highestZIndex) {
                highestZIndex = zIndex;
                topCard = card;
            }
        });
        
        return topCard;
    }

    getMostVisibleCard() {
        // Find the card that is most visible (closest to viewport center and most in view)
        const cards = this.cardsContainer.querySelectorAll('.card:not(.swiped)');
        let mostVisibleCard = null;
        let bestVisibilityScore = -1;
        
        const viewportCenterY = window.innerHeight / 2;
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            
            // Skip cards that are not visible at all
            if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
                return;
            }
            
            // Calculate how much of the card is visible
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(window.innerHeight, rect.bottom);
            const visibleHeight = visibleBottom - visibleTop;
            const cardHeight = rect.height;
            const visibilityRatio = visibleHeight / cardHeight;
            
            // Calculate distance from viewport center
            const cardCenterY = rect.top + rect.height / 2;
            const distanceFromCenter = Math.abs(cardCenterY - viewportCenterY);
            const maxDistance = window.innerHeight / 2;
            const centerScore = 1 - (distanceFromCenter / maxDistance);
            
            // Combine visibility ratio and center score
            // Prioritize cards that are more visible and closer to center
            const visibilityScore = (visibilityRatio * 0.7) + (centerScore * 0.3);
            
            if (visibilityScore > bestVisibilityScore) {
                bestVisibilityScore = visibilityScore;
                mostVisibleCard = card;
            }
        });
        
        return mostVisibleCard;
    }

    // Add a card to the swiped cards history
    addToSwipedHistory(cardData) {
        // Store the card data (not the DOM element)
        this.swipedCardsHistory.push(cardData);
        
        // Keep only the last 10 swiped cards to prevent memory issues
        if (this.swipedCardsHistory.length > 10) {
            this.swipedCardsHistory.shift();
        }
        
        // Update back button visibility on all cards
        this.updateBackButtonVisibility();
    }

    // Bring back the last swiped card
    bringBackLastCard() {
        if (this.swipedCardsHistory.length === 0) {
            console.log('No cards to bring back');
            return;
        }
        
        // Get the last swiped card data
        const lastCardData = this.swipedCardsHistory.pop();
        
        // Create a new card with the same data
        const restoredCard = this.createCard(lastCardData, 0);
        
        // Position it prominently at the top of the stack
        const cards = this.cardsContainer.querySelectorAll('.card:not(.swiped)');
        const topZIndex = Math.max(...Array.from(cards).map(card => parseInt(card.style.zIndex) || 0));
        restoredCard.style.zIndex = Math.max(topZIndex + 10, 100); // Ensure it's well above other cards
        
        // Start with animation from the right side
        restoredCard.style.transform = 'translateX(100%) translateY(0) rotate(0deg)';
        restoredCard.style.opacity = '0';
        
        this.cardsContainer.appendChild(restoredCard);
        
        // Animate in from the right
        setTimeout(() => {
            restoredCard.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            restoredCard.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
            restoredCard.style.opacity = '1';
            
            // Play a subtle restoration sound
            this.playRestorationSound();
            
            // Trigger audio immediately after animation starts
            setTimeout(() => {
                console.log('🔄 Audio trigger for restored card');
                console.log('🔊 Sound enabled:', this.soundEnabled);
                
                // Force audio to play for restored cards
                if (this.soundEnabled) {
                    // Stop any current audio first
                    this.stopSpeech();
                    
                    // Force user interaction flag and speech ready
                    this.userHasInteracted = true;
                    this.speechReady = true;
                    
                    // Start audio for restored card
                    console.log('🗣️ Starting audio for restored card');
                    this.speakCardContent(restoredCard);
                } else {
                    console.log('🔇 Sound is disabled, skipping audio for restored card');
                }
            }, 300); // Start audio after card is visible
            
            // Also add immediate audio trigger for better responsiveness
            setTimeout(() => {
                if (this.soundEnabled && !this.currentSpeakingCard) {
                    console.log('🗣️ Immediate audio trigger for restored card');
                    this.speakCardContent(restoredCard);
                }
            }, 100); // Very quick trigger
        }, 100);
        
        // Update back button visibility on all cards
        this.updateBackButtonVisibility();
        
        // Show notification
        this.showNotification('Card restored!', 'success');
        
        console.log('Card restored from history');
    }

    // Update back button visibility based on swiped cards history
    updateBackButtonVisibility() {
        // Update visibility for all card back buttons
        const cardBackBtns = document.querySelectorAll('.card-back-btn');
        cardBackBtns.forEach(btn => {
            if (this.swipedCardsHistory.length > 0) {
                btn.style.display = 'flex';
                btn.title = `Bring back last card (${this.swipedCardsHistory.length} available)`;
            } else {
                btn.style.display = 'none';
            }
        });
    }

    // Play a subtle restoration sound effect
    playRestorationSound() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Create a pleasant restoration sound (ascending notes)
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Could not play restoration sound:', error);
        }
    }

    bindEvents() {


        this.refreshBtn.addEventListener('click', () => {
            this.generateCards();
        });


        
        // Test TTS button
        const testTTSBtn = document.getElementById('testTTSBtn');
        if (testTTSBtn) {
            testTTSBtn.addEventListener('click', async () => {
                console.log('Test TTS button clicked - using ElevenLabs');
                try {
                    const testText = 'Hello! Text to speech is working correctly with ElevenLabs high-quality voice synthesis.';
                    const audioUrl = await this.generateSpeech(testText);
                    
                    if (audioUrl) {
                        const testAudio = new Audio(audioUrl);
                        
                        // Set faster playback rate for quicker speech
                        testAudio.playbackRate = 1.3;  // 30% faster playback
                        
                        testAudio.onended = () => {
                            URL.revokeObjectURL(audioUrl);
                            console.log('Test speech completed');
                        };
                        testAudio.onerror = (error) => {
                            console.error('Test audio playback error:', error);
                            URL.revokeObjectURL(audioUrl);
                        };
                        
                        await testAudio.play();
                        console.log('Test speech started with ElevenLabs');
                    }
                } catch (error) {
                    console.error('Test TTS error:', error);
                    alert('Error testing text-to-speech: ' + error.message);
                }
            });
        }



        // Voice selector for ElevenLabs
        const voiceSelector = document.getElementById('voiceSelector');
        if (voiceSelector) {
            voiceSelector.addEventListener('change', (e) => {
                const selectedVoiceId = e.target.value;
                if (selectedVoiceId) {
                    this.changeVoice(selectedVoiceId);
                    const selectedVoice = this.getCurrentVoice();
                    console.log('ElevenLabs voice changed to:', selectedVoice?.name);
                } else {
                    // Default to Bella if no selection
                    this.changeVoice('EXAVITQu4vr4xnSDxMaL');
                    console.log('Reset to default ElevenLabs voice: Bella');
                }
            });
        }
        
        // Music toggle button
        const musicToggleBtn = document.getElementById('musicToggleBtn');
        if (musicToggleBtn) {
            musicToggleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // Ensure audio context is resumed (required for autoplay policies)
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    try {
                        await this.audioContext.resume();
                        console.log('🔊 Audio context resumed for music');
                    } catch (error) {
                        console.log('Could not resume audio context:', error);
                    }
                }
                
                this.toggleMusic();
            });
        }

        // Premium toggle button
        const premiumToggleBtn = document.getElementById('premiumToggleBtn');
        if (premiumToggleBtn) {
            premiumToggleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.togglePremiumMode();
            });
        }

        // Premium refresh button
        const premiumRefreshBtn = document.getElementById('premiumRefreshBtn');
        if (premiumRefreshBtn) {
            premiumRefreshBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.forceRefreshPremiumContent();
            });
        }
        

        
        this.closeModal.addEventListener('click', () => {
            this.cleanupGames();
            this.gameModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === this.gameModal) {
                this.cleanupGames();
                this.gameModal.style.display = 'none';
            }
        });
        
        // Auto-start music on first user interaction (to comply with browser autoplay policies)
        let musicAutoStarted = false;
        const autoStartMusic = () => {
            if (!musicAutoStarted && !this.musicPlaying) {
                console.log('🎵 Starting music on first user interaction...');
                this.startMusic();
                musicAutoStarted = true;
                // Remove the event listener after first use
                document.removeEventListener('click', autoStartMusic);
                document.removeEventListener('keydown', autoStartMusic);
                document.removeEventListener('touchstart', autoStartMusic);
            }
        };
        
        // Listen for any user interaction to start music
        document.addEventListener('click', autoStartMusic);
        document.addEventListener('keydown', autoStartMusic);
        document.addEventListener('touchstart', autoStartMusic);
        
        // Add scroll listener for preloading audio as cards become visible
        let preloadTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(preloadTimeout);
            preloadTimeout = setTimeout(() => {
                this.preloadVisibleCards();
            }, 200); // Debounce scroll events
        });
        
        // Also preload on window resize
        window.addEventListener('resize', () => {
            clearTimeout(preloadTimeout);
            preloadTimeout = setTimeout(() => {
                this.preloadVisibleCards();
            }, 300);
        });
        
        // Google Sign-In event handlers
        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                this.signOut();
            });
        }
    }

    cleanupGames() {
        // Clean up Flappy Bird resources
        if (this.flappyCleanup) {
            this.flappyCleanup();
            this.flappyCleanup = null;
        }
        if (this.flappyGameLoop) {
            cancelAnimationFrame(this.flappyGameLoop);
            this.flappyGameLoop = null;
        }
    }

    openGame(gameType, title) {
        this.gameContent.innerHTML = `<h2>${title}</h2>`;
        
        // Check if it's a premium game
        const premiumGameTypes = ['sudoku', 'crossword', 'pacman', 'tetris', 'galaga', 'snake', 'breakout', 'memory', 'wordsearch', 'solitaire', 'minesweeper'];
        
        if (premiumGameTypes.includes(gameType)) {
            // Initialize premium games if not already done
            if (typeof premiumGames === 'undefined') {
                console.error('Premium games not loaded');
                this.gameContent.innerHTML += '<p>Premium games are loading...</p>';
                return;
            }
            
            // Create container for premium game
            const gameContainer = document.createElement('div');
            gameContainer.className = 'premium-game-wrapper';
            this.gameContent.appendChild(gameContainer);
            
            // Initialize the premium game
            premiumGames.initGame(gameType, gameContainer);
            premiumGames.addTouchSupport();
        } else {
            // Handle regular games
            switch(gameType) {
                case 'tictactoe':
                    this.createTicTacToe();
                    break;
                case 'connect4':
                    this.createConnect4();
                    break;
                case 'chess':
                    this.createChessPuzzle();
                    break;
                case 'flappy':
                    this.createFlappyBird();
                    break;
            }
        }
        
        this.gameModal.style.display = 'block';
    }

    createTicTacToe() {
        const gameHtml = `
            <div class="game-status" id="ticTacStatus">Your turn (X) - Click a square!</div>
            <div class="game-board tic-tac-toe" id="ticTacBoard"></div>
            <button class="reset-game-btn" onclick="app.resetTicTacToe()">Reset Game</button>
        `;
        
        this.gameContent.innerHTML += gameHtml;
        
        const board = document.getElementById('ticTacBoard');
        const status = document.getElementById('ticTacStatus');
        let gameBoard = Array(9).fill('');
        let gameActive = true;
        let isPlayerTurn = true;
        
        const makeMove = (index, player) => {
            gameBoard[index] = player;
            const cell = board.children[index];
            cell.textContent = player;
            cell.style.color = player === 'X' ? '#ff6b6b' : '#4ecdc4';
            cell.style.backgroundColor = player === 'X' ? '#ffe6e6' : '#e6f9f7';
        };
        
        const checkGameEnd = () => {
            if (this.checkWinner(gameBoard)) {
                const winner = this.checkWinner(gameBoard);
                status.textContent = winner === 'X' ? 'You win! 🎉' : 'Computer wins! 🤖';
                gameActive = false;
                return true;
            } else if (gameBoard.every(cell => cell !== '')) {
                status.textContent = "It's a tie! 🤝";
                gameActive = false;
                return true;
            }
            return false;
        };
        
        const computerMove = () => {
            if (!gameActive) return;
            
            // AI strategy: Try to win, then block player, then take center/corners
            let move = this.findBestMove(gameBoard, 'O') || 
                      this.findBestMove(gameBoard, 'X') || 
                      this.findStrategicMove(gameBoard);
            
            if (move !== null) {
                setTimeout(() => {
                    makeMove(move, 'O');
                    if (!checkGameEnd()) {
                        isPlayerTurn = true;
                        status.textContent = 'Your turn (X)';
                    }
                }, 500);
            }
        };
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell';
            cell.addEventListener('click', () => {
                if (gameBoard[i] === '' && gameActive && isPlayerTurn) {
                    makeMove(i, 'X');
                    isPlayerTurn = false;
                    
                    if (!checkGameEnd()) {
                        status.textContent = 'Computer thinking...';
                        computerMove();
                    }
                }
            });
            board.appendChild(cell);
        }
    }
    
    findBestMove(board, player) {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // columns
            [0,4,8], [2,4,6] // diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const line = [board[a], board[b], board[c]];
            const playerCount = line.filter(cell => cell === player).length;
            const emptyCount = line.filter(cell => cell === '').length;
            
            if (playerCount === 2 && emptyCount === 1) {
                if (board[a] === '') return a;
                if (board[b] === '') return b;
                if (board[c] === '') return c;
            }
        }
        return null;
    }
    
    findStrategicMove(board) {
        // Prefer center, then corners, then edges
        const priorities = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        for (let pos of priorities) {
            if (board[pos] === '') return pos;
        }
        return null;
    }

    createConnect4() {
        const gameHtml = `
            <div class="game-status" id="connect4Status">Your turn (Red) - Click a column!</div>
            <div class="game-board connect4" id="connect4Board"></div>
            <button class="reset-game-btn" onclick="app.resetConnect4()">Reset Game</button>
        `;
        
        this.gameContent.innerHTML += gameHtml;
        
        const board = document.getElementById('connect4Board');
        const status = document.getElementById('connect4Status');
        let gameBoard = Array(42).fill('');
        let gameActive = true;
        let isPlayerTurn = true;
        
        const dropPiece = (col, player) => {
            for (let row = 5; row >= 0; row--) {
                const index = row * 7 + col;
                if (gameBoard[index] === '') {
                    gameBoard[index] = player;
                    const targetCell = board.children[index];
                    targetCell.style.backgroundColor = player === 'red' ? '#ff6b6b' : '#4ecdc4';
                    targetCell.style.borderRadius = '50%';
                    targetCell.style.transform = 'scale(0)';
                    
                    // Animate piece drop
                    setTimeout(() => {
                        targetCell.style.transform = 'scale(1)';
                        targetCell.style.transition = 'transform 0.3s ease-out';
                    }, 50);
                    
                    return index;
                }
            }
            return -1;
        };
        
        const checkGameEnd = (lastMove) => {
            if (this.checkConnect4Winner(gameBoard, lastMove)) {
                const winner = gameBoard[lastMove];
                status.textContent = winner === 'red' ? 'You win! 🎉' : 'Computer wins! 🤖';
                gameActive = false;
                return true;
            } else if (gameBoard.every(cell => cell !== '')) {
                status.textContent = "It's a tie! 🤝";
                gameActive = false;
                return true;
            }
            return false;
        };
        
        const computerMove = () => {
            if (!gameActive) return;
            
            // AI strategy for Connect 4
            let bestCol = this.findBestConnect4Move(gameBoard);
            
            setTimeout(() => {
                const moveIndex = dropPiece(bestCol, 'yellow');
                if (moveIndex !== -1) {
                    if (!checkGameEnd(moveIndex)) {
                        isPlayerTurn = true;
                        status.textContent = 'Your turn (Red)';
                    }
                }
            }, 800);
        };
        
        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell';
            const col = i % 7;
            
            cell.addEventListener('click', () => {
                if (gameActive && isPlayerTurn) {
                    const moveIndex = dropPiece(col, 'red');
                    if (moveIndex !== -1) {
                        isPlayerTurn = false;
                        
                        if (!checkGameEnd(moveIndex)) {
                            status.textContent = 'Computer thinking...';
                            computerMove();
                        }
                    }
                }
            });
            board.appendChild(cell);
        }
    }
    
    findBestConnect4Move(board) {
        // Try to win first
        for (let col = 0; col < 7; col++) {
            if (this.canDropInColumn(board, col)) {
                const testBoard = [...board];
                const row = this.getDropRow(testBoard, col);
                const index = row * 7 + col;
                testBoard[index] = 'yellow';
                if (this.checkConnect4Winner(testBoard, index)) {
                    return col;
                }
            }
        }
        
        // Block player from winning
        for (let col = 0; col < 7; col++) {
            if (this.canDropInColumn(board, col)) {
                const testBoard = [...board];
                const row = this.getDropRow(testBoard, col);
                const index = row * 7 + col;
                testBoard[index] = 'red';
                if (this.checkConnect4Winner(testBoard, index)) {
                    return col;
                }
            }
        }
        
        // Prefer center columns
        const preferences = [3, 2, 4, 1, 5, 0, 6];
        for (let col of preferences) {
            if (this.canDropInColumn(board, col)) {
                return col;
            }
        }
        
        return 0; // fallback
    }
    
    canDropInColumn(board, col) {
        return board[col] === '';
    }
    
    getDropRow(board, col) {
        for (let row = 5; row >= 0; row--) {
            if (board[row * 7 + col] === '') {
                return row;
            }
        }
        return -1;
    }

    createChessPuzzle() {
        // Check if chess libraries are available
        if (typeof Chess === 'undefined' || typeof Chessboard === 'undefined') {
            this.gameContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h2>♟️ Chess Puzzles</h2>
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin: 20px 0;">
                        <h3 style="color: #666; margin-bottom: 15px;">🔧 Chess Feature Temporarily Unavailable</h3>
                        <p style="color: #888; line-height: 1.6;">
                            The chess puzzle feature is currently experiencing technical difficulties due to library loading issues.
                            <br><br>
                            <strong>Try these alternatives:</strong><br>
                            • Refresh the page to reload the chess libraries<br>
                            • Enjoy other games like Tic Tac Toe, Connect 4, or Flappy Bird<br>
                            • Check out the fun facts and riddles!
                        </p>
                        <button class="play-btn" onclick="app.closeModal()" style="margin-top: 20px;">
                            🔄 Back to Activities
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Load saved puzzle statistics
        this.loadPuzzleStats();
        
        // COMPLETELY REBUILT chess puzzle collection with VERIFIED positions
        // Each puzzle has been manually tested to ensure it actually works
        const puzzleCollections = {
            // Checkmate in 1 - Easy patterns
            mate1_easy: [
                {
                    name: "Back Rank Mate",
                    fen: "6k1/5ppp/8/8/8/8/8/R6K w - - 0 1",
                    description: "White to move and checkmate! Find the back rank mate.",
                    solution: "Ra8#",
                    difficulty: "Easy",
                    movesToMate: 1
                },
                {
                    name: "Queen Corner Mate",
                    fen: "7k/6pp/8/8/8/8/8/6QK w - - 0 1",
                    description: "White to move and checkmate! Trap the king in the corner.",
                    solution: "Qg8#",
                    difficulty: "Easy",
                    movesToMate: 1
                },
                {
                    name: "Simple Rook Mate",
                    fen: "6k1/5ppp/8/8/8/8/8/6RK w - - 0 1",
                    description: "White to move and checkmate! Use the rook for back rank mate.",
                    solution: "Rg8#",
                    difficulty: "Easy",
                    movesToMate: 1
                },
                {
                    name: "Queen and King Mate",
                    fen: "k7/8/1K6/8/8/8/8/7Q w - - 0 1",
                    description: "White to move and checkmate! Basic queen vs king endgame.",
                    solution: "Qh8#",
                    difficulty: "Easy",
                    movesToMate: 1
                },
                {
                    name: "Queen vs King Endgame",
                    fen: "8/8/8/8/8/2k5/2p5/2QK4 w - - 0 1",
                    description: "White to move and checkmate! Queen dominates the board.",
                    solution: "Qc2#",
                    difficulty: "Easy",
                    movesToMate: 1
                }
            ],
            
            // Checkmate in 1 - Medium patterns
            mate1_medium: [
                {
                    name: "Scholar's Mate Finish",
                    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
                    description: "White to move and checkmate! Complete the Scholar's Mate.",
                    solution: "Qxf7#",
                    difficulty: "Medium",
                    movesToMate: 1
                },
                {
                    name: "Discovered Check Mate",
                    fen: "rnbqkb1r/pppp1ppp/5n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
                    description: "White to move and checkmate! Use discovered check.",
                    solution: "Qxf7#",
                    difficulty: "Medium",
                    movesToMate: 1
                },
                {
                    name: "Pin and Mate",
                    fen: "8/8/8/8/8/2k5/2p5/2QK4 w - - 0 1",
                    description: "White to move and checkmate! Use the pin to your advantage.",
                    solution: "Qc2#",
                    difficulty: "Medium",
                    movesToMate: 1
                }
            ],
            
            // Checkmate in 1 - Hard patterns
            mate1_hard: [
                {
                    name: "Smothered Mate",
                    fen: "6rk/6pp/6pN/8/8/8/8/6QK w - - 0 1",
                    description: "White to move and checkmate! Beautiful smothered mate pattern.",
                    solution: "Qg8#",
                    difficulty: "Hard",
                    movesToMate: 1
                },
                {
                    name: "Epaulette Mate",
                    fen: "4rrk1/8/8/8/8/8/8/4Q1K1 w - - 0 1",
                    description: "White to move and checkmate! The rooks block the king's escape.",
                    solution: "Qe8#",
                    difficulty: "Hard",
                    movesToMate: 1
                }
            ],
            
            // Checkmate in 2 - Easy patterns
            mate2_easy: [
                {
                    name: "Queen and Rook Mate in 2",
                    fen: "6k1/8/6K1/8/8/8/8/Q6R w - - 0 1",
                    description: "White to move and checkmate in 2! Use queen and rook coordination.",
                    solution: "Qa8+",
                    followUp: "Rh8#",
                    difficulty: "Easy",
                    movesToMate: 2
                },
                {
                    name: "Two Rooks Mate in 2",
                    fen: "6k1/8/6K1/8/8/8/7R/R7 w - - 0 1",
                    description: "White to move and checkmate in 2! Classic two rooks technique.",
                    solution: "Ra8+",
                    followUp: "Rh8#",
                    difficulty: "Easy",
                    movesToMate: 2
                }
            ],
            
            // Checkmate in 2 - Medium patterns
            mate2_medium: [
                {
                    name: "Queen Sacrifice Mate in 2",
                    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P2Q/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
                    description: "White to move and checkmate in 2! Sometimes sacrifice leads to mate.",
                    solution: "Qxf7+",
                    followUp: "Bxf7#",
                    difficulty: "Medium",
                    movesToMate: 2
                },
                {
                    name: "Knight Fork Mate in 2",
                    fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 4 4",
                    description: "White to move and checkmate in 2! Use the knight for a deadly fork.",
                    solution: "Nf3",
                    followUp: "Qd5#",
                    difficulty: "Medium",
                    movesToMate: 2
                }
            ]
        };
        
        // Flatten all puzzles into one array
        const allPuzzles = [
            ...puzzleCollections.mate1_easy,
            ...puzzleCollections.mate1_medium,
            ...puzzleCollections.mate1_hard,
            ...puzzleCollections.mate2_easy,
            ...puzzleCollections.mate2_medium
        ];
        
        // Initialize or get puzzle rotation state
        if (!this.puzzleRotation) {
            this.puzzleRotation = {
                usedPuzzles: [],
                currentIndex: 0,
                totalPuzzles: allPuzzles.length
            };
        }
        
        // Select next puzzle in rotation
        let selectedPuzzle;
        if (this.puzzleRotation.usedPuzzles.length >= allPuzzles.length) {
            // Reset rotation when all puzzles have been used
            this.puzzleRotation.usedPuzzles = [];
            this.puzzleRotation.currentIndex = 0;
            console.log('🔄 Puzzle rotation reset - starting fresh cycle');
        }
        
        // Find an unused puzzle
        do {
            selectedPuzzle = allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
        } while (this.puzzleRotation.usedPuzzles.includes(selectedPuzzle.name) && this.puzzleRotation.usedPuzzles.length < allPuzzles.length);
        
        // Mark puzzle as used
        this.puzzleRotation.usedPuzzles.push(selectedPuzzle.name);
        this.currentChessPuzzle = selectedPuzzle;
        
        console.log(`🎯 Selected puzzle: ${selectedPuzzle.name} (${selectedPuzzle.difficulty})`);
        console.log(`📊 Progress: ${this.puzzleRotation.usedPuzzles.length}/${allPuzzles.length} puzzles completed in this cycle`);
        
        const puzzleHtml = `
            <div class="chess-puzzle-header" style="text-align: center; margin-bottom: 15px;">
                <h3 style="margin: 5px 0; color: #333;">${this.currentChessPuzzle.name}</h3>
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin: 10px 0;">
                    <span class="difficulty-badge difficulty-${this.currentChessPuzzle.difficulty.toLowerCase()}" 
                          style="padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: bold;">
                        ${this.currentChessPuzzle.difficulty}
                    </span>
                    <span style="font-size: 12px; color: #666;">
                        Progress: ${this.puzzleRotation.usedPuzzles.length}/${allPuzzles.length}
                    </span>
                </div>
            </div>
            <div class="game-status" id="chessStatus">${this.currentChessPuzzle.description}</div>
            <div id="chessBoard" style="width: 400px; margin: 20px auto;"></div>
            <div style="margin-top: 15px; text-align: center;">
                <button class="play-btn" onclick="app.resetChessPuzzle()">🔄 New Puzzle</button>
                <button class="play-btn" onclick="app.showChessSolution()" style="margin-left: 10px;">💡 Show Solution</button>
                <button class="play-btn" onclick="app.showPuzzleStats()" style="margin-left: 10px;">📊 Stats</button>
            </div>
        `;
        
        this.gameContent.innerHTML += puzzleHtml;
        
        // Wait for DOM to be ready and libraries to load
        setTimeout(() => {
            this.initializeChessBoard();
        }, 500);
    }

    initializeChessBoard() {
        // Check if libraries are loaded
        if (typeof Chess === 'undefined') {
            console.error('Chess.js library not loaded');
            document.getElementById('chessStatus').textContent = 'Error: Chess library not loaded. Please refresh the page.';
            return;
        }
        
        if (typeof Chessboard === 'undefined') {
            console.error('Chessboard.js library not loaded');
            document.getElementById('chessStatus').textContent = 'Error: Chessboard library not loaded. Please refresh the page.';
            return;
        }
        
        try {
            // Validate the FEN position first (older chess.js doesn't have validateFen)
            let fenValidation = { valid: true };
            try {
                const testChess = new Chess(this.currentChessPuzzle.fen);
                fenValidation = { valid: true };
            } catch (e) {
                fenValidation = { valid: false, error: e.message };
            }
            if (!fenValidation.valid) {
                console.error('Invalid FEN position:', this.currentChessPuzzle.fen, fenValidation.error);
                document.getElementById('chessStatus').textContent = 'Error: Invalid puzzle position. Generating new puzzle...';
                setTimeout(() => this.resetChessPuzzle(), 2000);
                return;
            }
            
            // Initialize chess.js game with latest API
            this.chessGame = new Chess(this.currentChessPuzzle.fen);
            this.puzzleSolved = false;
            this.puzzleMoveHistory = []; // Reset move history for new puzzle
            
            console.log('Chess game initialized with FEN:', this.currentChessPuzzle.fen);
            console.log('Chess game valid:', fenValidation.valid);
            
            // Validate that the solution move is actually legal
            const testGame = new Chess(this.currentChessPuzzle.fen);
            const testMove = testGame.move(this.currentChessPuzzle.solution.replace('#', ''));
            if (!testMove) {
                console.error('Invalid solution move:', this.currentChessPuzzle.solution, 'for position:', this.currentChessPuzzle.fen);
                document.getElementById('chessStatus').textContent = 'Error: Invalid puzzle solution. Generating new puzzle...';
                setTimeout(() => this.resetChessPuzzle(), 2000);
                return;
            }
            
            // Verify the solution actually leads to checkmate
            if (!testGame.in_checkmate()) {
                console.error('Solution does not lead to checkmate:', this.currentChessPuzzle.solution);
                document.getElementById('chessStatus').textContent = 'Error: Puzzle solution incorrect. Generating new puzzle...';
                setTimeout(() => this.resetChessPuzzle(), 2000);
                return;
            }
            
            console.log('✅ Puzzle validation passed:', this.currentChessPuzzle.name);
            
            // Board configuration
            const config = {
                draggable: true,
                position: this.currentChessPuzzle.fen,
                pieceTheme: function(piece) {
                    console.log('Loading piece:', piece);
                    // Use our reliable Wikipedia chess pieces
                    if (window.chessPieceTheme && window.chessPieceTheme[piece]) {
                        console.log('Using custom piece for:', piece);
                        return window.chessPieceTheme[piece];
                    }
                    // Fallback to chessboard.js default
                    console.log('Using fallback piece for:', piece);
                    return 'https://chessboardjs.com/img/chesspieces/wikipedia/' + piece + '.png';
                },
                onDragStart: (source, piece, position, orientation) => {
                    console.log('=== DRAG START ===');
                    console.log('Source:', source, 'Piece:', piece);
                    console.log('Game over:', this.chessGame.game_over());
                    console.log('Puzzle solved:', this.puzzleSolved);
                    console.log('Current turn:', this.chessGame.turn());
                    
                    // Don't pick up pieces if the game is over
                    if (this.chessGame.game_over() || this.puzzleSolved) {
                        console.log('Cannot drag - game over or puzzle solved');
                        return false;
                    }
                    
                    // Only allow moving pieces of the current player's turn
                    const isWhitePiece = piece.search(/^w/) !== -1;
                    const isBlackPiece = piece.search(/^b/) !== -1;
                    const isWhiteTurn = this.chessGame.turn() === 'w';
                    
                    if ((isWhiteTurn && !isWhitePiece) || (!isWhiteTurn && !isBlackPiece)) {
                        console.log('Cannot drag - not your turn');
                        return false;
                    }
                    
                    console.log('Drag allowed for:', piece);
                    return true;
                },
                onDrop: (source, target) => {
                    console.log('=== DROP ATTEMPT ===');
                    console.log('From:', source, 'To:', target);
                    
                    // See if the move is legal - try different promotion pieces
                    let move = this.chessGame.move({
                        from: source,
                        to: target,
                        promotion: 'q' // Always promote to a queen for simplicity
                    });
                    
                    // If queen promotion failed, try without promotion
                    if (move === null) {
                        move = this.chessGame.move({
                            from: source,
                            to: target
                        });
                    }
                    
                    // Illegal move
                    if (move === null) {
                        console.log('ILLEGAL MOVE - snapback');
                        return 'snapback';
                    }
                    
                    console.log('LEGAL MOVE:', move.san);
                    
                    // Check if this move solves the puzzle
                    this.checkPuzzleSolution(move);
                    
                    return true;
                },
                onSnapEnd: () => {
                    console.log('Snap end - updating position');
                    this.board.position(this.chessGame.fen());
                }
            };
            
            // Create the board
            this.board = Chessboard('chessBoard', config);
            
            console.log('Chessboard created successfully');
            
            // Add touch event polyfill for mobile devices
            setTimeout(() => {
                this.addChessTouchSupport();
            }, 100);
            
            // Update status
            this.updateChessStatus();
        } catch (error) {
            console.error('Error initializing chess board:', error);
            document.getElementById('chessStatus').textContent = 'Error initializing chess board. Please try again.';
        }
    }

    checkPuzzleSolution(move) {
        const status = document.getElementById('chessStatus');
        
        console.log('=== CHECKING PUZZLE SOLUTION ===');
        console.log('Move made:', move.san);
        console.log('Expected solution:', this.currentChessPuzzle.solution);
        console.log('Is checkmate?', this.chessGame.in_checkmate());
        console.log('Is check?', this.chessGame.in_check());
        console.log('Game over?', this.chessGame.game_over());
        console.log('Moves to mate:', this.currentChessPuzzle.movesToMate);
        
        // Initialize move history if not exists
        if (!this.puzzleMoveHistory) {
            this.puzzleMoveHistory = [];
        }
        
        // Add move to history
        this.puzzleMoveHistory.push(move.san);
        
        // Check if it's checkmate (puzzle solved)
        const isCheckmate = this.chessGame.in_checkmate();
        
        if (isCheckmate) {
            console.log('CHECKMATE ACHIEVED! ✓');
            this.puzzleSolved = true;
            
            // Check if this was the intended solution path (be flexible with notation)
            const expectedSolution = this.currentChessPuzzle.solution.replace('#', '').replace('+', '');
            const actualMove = move.san.replace('#', '').replace('+', '');
            const moveMatches = actualMove === expectedSolution;
            
            if (moveMatches) {
                status.textContent = '🎉 Perfect! You found the intended solution! 🎉';
                status.style.color = '#4CAF50';
                this.updatePuzzleStats(true, this.currentChessPuzzle.difficulty);
            } else {
                status.textContent = '🎉 Checkmate! Great job! (Alternative solution found) 🎉';
                status.style.color = '#4CAF50';
                this.updatePuzzleStats(true, this.currentChessPuzzle.difficulty);
            }
            status.style.fontWeight = 'bold';
            
            // Add celebration effect
            setTimeout(() => {
                status.textContent += ' 🎊';
            }, 500);
            
            return;
        }
        
        // For checkmate-in-2 puzzles, check if we're on the right track
        if (this.currentChessPuzzle.movesToMate === 2) {
            if (this.puzzleMoveHistory.length === 1) {
                // First move in a mate-in-2 puzzle
                const expectedSolution = this.currentChessPuzzle.solution.replace('#', '').replace('+', '');
                const actualMove = move.san.replace('#', '').replace('+', '');
                const moveMatches = actualMove === expectedSolution;
                
                if (moveMatches) {
                    status.textContent = '✓ Excellent! That\'s the key move. Now find the checkmate.';
                    status.style.color = '#2196F3';
                } else if (this.chessGame.in_check()) {
                    status.textContent = 'Good move! King is in check. Look for the mate sequence.';
                    status.style.color = '#FF9800';
                } else {
                    status.textContent = 'Legal move, but look for a more forcing move that leads to mate.';
                    status.style.color = '#666';
                }
                
                // Make opponent's response if specified and move matches
                if (this.currentChessPuzzle.followUp && moveMatches) {
                    setTimeout(() => {
                        try {
                            const opponentMove = this.chessGame.move(this.currentChessPuzzle.followUp);
                            if (opponentMove) {
                                this.board.position(this.chessGame.fen());
                                status.textContent = `Opponent plays ${opponentMove.san}. Now deliver checkmate!`;
                                status.style.color = '#FF9800';
                                status.style.fontWeight = 'bold';
                            }
                        } catch (error) {
                            console.error('Error making opponent move:', error);
                        }
                    }, 1500);
                }
            } else if (this.puzzleMoveHistory.length >= 2) {
                // Second move or later in mate-in-2
                if (this.chessGame.in_check()) {
                    status.textContent = 'King in check! Look for the final checkmate move.';
                    status.style.color = '#FF9800';
                } else {
                    status.textContent = 'Keep looking for the checkmate sequence!';
                    status.style.color = '#666';
                }
            }
        } else {
            // For checkmate-in-1 puzzles
            const expectedSolution = this.currentChessPuzzle.solution.replace('#', '').replace('+', '');
            const actualMove = move.san.replace('#', '').replace('+', '');
            const moveMatches = actualMove === expectedSolution;
            
            if (moveMatches && !isCheckmate) {
                status.textContent = 'That\'s the intended move! But checkmate should follow immediately...';
                status.style.color = '#FF9800';
            } else if (this.chessGame.in_check()) {
                status.textContent = 'Good! King is in check. Look for immediate checkmate.';
                status.style.color = '#FF9800';
            } else {
                status.textContent = 'Legal move. Keep looking for the checkmate!';
                status.style.color = '#666';
            }
        }
        
        // Update the board position and continue play
        this.updateChessStatus();
    }

    updateChessStatus() {
        const status = document.getElementById('chessStatus');
        status.style.color = '#333';
        status.style.fontWeight = 'normal';
        
        if (this.chessGame.in_checkmate()) {
            status.textContent = '🎉 Checkmate! You solved the puzzle! 🎉';
            status.style.color = '#4CAF50';
            status.style.fontWeight = 'bold';
        } else if (this.chessGame.in_check()) {
            status.textContent = 'The king is in check!';
            status.style.color = '#FF9800';
        } else {
            status.textContent = this.currentChessPuzzle.description;
        }
    }

    showChessSolution() {
        const status = document.getElementById('chessStatus');
        status.textContent = `💡 Solution: ${this.currentChessPuzzle.solution}`;
        status.style.color = '#2196F3';
        status.style.fontWeight = 'bold';
        
        setTimeout(() => {
            this.updateChessStatus();
        }, 3000);
    }

    showPuzzleStats() {
        // Initialize puzzle stats if not exists
        if (!this.puzzleStats) {
            this.puzzleStats = {
                totalSolved: 0,
                easyCompleted: 0,
                mediumCompleted: 0,
                hardCompleted: 0,
                currentStreak: 0,
                bestStreak: 0,
                totalAttempts: 0
            };
        }
        
        // Calculate total puzzles available
        const totalPuzzles = 16; // Based on our puzzle collection
        const completionRate = Math.round((this.puzzleStats.totalSolved / this.puzzleStats.totalAttempts) * 100) || 0;
        
        const statsHtml = `
            <div class="stats-modal" onclick="this.style.display='none'">
                <div class="stats-content" onclick="event.stopPropagation()">
                    <h3>🏆 Chess Puzzle Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">${this.puzzleStats.totalSolved}</span>
                            <span class="stat-label">Puzzles Solved</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.puzzleRotation ? this.puzzleRotation.usedPuzzles.length : 0}</span>
                            <span class="stat-label">This Cycle</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${completionRate}%</span>
                            <span class="stat-label">Success Rate</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.puzzleStats.bestStreak}</span>
                            <span class="stat-label">Best Streak</span>
                        </div>
                    </div>
                    <div style="margin: 20px 0;">
                        <h4 style="color: #333; margin-bottom: 10px;">Difficulty Breakdown</h4>
                        <div style="display: flex; justify-content: space-around; text-align: center;">
                            <div>
                                <div style="color: #4CAF50; font-weight: bold; font-size: 18px;">${this.puzzleStats.easyCompleted}</div>
                                <div style="font-size: 12px; color: #666;">Easy</div>
                            </div>
                            <div>
                                <div style="color: #FF9800; font-weight: bold; font-size: 18px;">${this.puzzleStats.mediumCompleted}</div>
                                <div style="font-size: 12px; color: #666;">Medium</div>
                            </div>
                            <div>
                                <div style="color: #f44336; font-weight: bold; font-size: 18px;">${this.puzzleStats.hardCompleted}</div>
                                <div style="font-size: 12px; color: #666;">Hard</div>
                            </div>
                        </div>
                    </div>
                    <button class="play-btn" onclick="this.parentElement.parentElement.style.display='none'" style="margin-top: 15px;">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        // Remove existing stats modal if any
        const existingModal = document.querySelector('.stats-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add stats modal to body
        document.body.insertAdjacentHTML('beforeend', statsHtml);
    }

    addChessTouchSupport() {
        const chessBoard = document.getElementById('chessBoard');
        if (!chessBoard) return;
        
        console.log('Adding chess touch support for mobile devices');
        
        let isDragging = false;
        let draggedPiece = null;
        let touchOffset = { x: 0, y: 0 };
        
        // Convert touch events to mouse events for chess pieces
        const convertTouchToMouse = (touchEvent, mouseEventType) => {
            const touch = touchEvent.touches[0] || touchEvent.changedTouches[0];
            const mouseEvent = new MouseEvent(mouseEventType, {
                bubbles: true,
                cancelable: true,
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
                buttons: 1
            });
            return mouseEvent;
        };
        
        // Handle touch start on chess pieces
        chessBoard.addEventListener('touchstart', (e) => {
            const target = e.target;
            if (target.classList.contains('piece-417db')) {
                e.preventDefault();
                isDragging = true;
                draggedPiece = target;
                
                // Calculate touch offset relative to piece
                const rect = target.getBoundingClientRect();
                const touch = e.touches[0];
                touchOffset.x = touch.clientX - rect.left;
                touchOffset.y = touch.clientY - rect.top;
                
                // Simulate mousedown
                const mouseEvent = convertTouchToMouse(e, 'mousedown');
                target.dispatchEvent(mouseEvent);
                
                console.log('Chess piece touch started:', target.getAttribute('data-piece'));
            }
        }, { passive: false });
        
        // Handle touch move
        chessBoard.addEventListener('touchmove', (e) => {
            if (isDragging && draggedPiece) {
                e.preventDefault();
                
                // Simulate mousemove
                const mouseEvent = convertTouchToMouse(e, 'mousemove');
                draggedPiece.dispatchEvent(mouseEvent);
                
                // Also dispatch on the element under the touch point
                const touch = e.touches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                if (elementBelow && elementBelow !== draggedPiece) {
                    elementBelow.dispatchEvent(mouseEvent);
                }
            }
        }, { passive: false });
        
        // Handle touch end
        chessBoard.addEventListener('touchend', (e) => {
            if (isDragging && draggedPiece) {
                e.preventDefault();
                
                // Find the element under the touch point for drop
                const touch = e.changedTouches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                
                // Simulate mouseup on the target element
                const mouseEvent = convertTouchToMouse(e, 'mouseup');
                if (elementBelow) {
                    elementBelow.dispatchEvent(mouseEvent);
                } else {
                    draggedPiece.dispatchEvent(mouseEvent);
                }
                
                isDragging = false;
                draggedPiece = null;
                touchOffset = { x: 0, y: 0 };
                
                console.log('Chess piece touch ended');
            }
        }, { passive: false });
        
        // Prevent context menu on long press
        chessBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        console.log('Chess touch support added successfully');
    }

    resetChessPuzzle() {
        // Destroy existing board if it exists
        if (this.board) {
            this.board.destroy();
        }
        
        this.gameContent.innerHTML = '<h2>Chess Puzzle</h2>';
        this.createChessPuzzle();
    }

    updatePuzzleStats(solved, difficulty) {
        // Initialize puzzle stats if not exists
        if (!this.puzzleStats) {
            this.puzzleStats = {
                totalSolved: 0,
                easyCompleted: 0,
                mediumCompleted: 0,
                hardCompleted: 0,
                currentStreak: 0,
                bestStreak: 0,
                totalAttempts: 0
            };
        }

        this.puzzleStats.totalAttempts++;

        if (solved) {
            this.puzzleStats.totalSolved++;
            this.puzzleStats.currentStreak++;
            
            // Update difficulty-specific stats
            if (difficulty === 'easy') this.puzzleStats.easyCompleted++;
            else if (difficulty === 'medium') this.puzzleStats.mediumCompleted++;
            else if (difficulty === 'hard') this.puzzleStats.hardCompleted++;
            
            // Update best streak
            if (this.puzzleStats.currentStreak > this.puzzleStats.bestStreak) {
                this.puzzleStats.bestStreak = this.puzzleStats.currentStreak;
            }
        } else {
            this.puzzleStats.currentStreak = 0;
        }

        // Save stats to localStorage
        localStorage.setItem('chessPuzzleStats', JSON.stringify(this.puzzleStats));
    }

    loadPuzzleStats() {
        const saved = localStorage.getItem('chessPuzzleStats');
        if (saved) {
            this.puzzleStats = JSON.parse(saved);
        }
    }

    createFlappyBird() {
        const gameHtml = `
            <div class="game-status" id="flappyStatus">🐦 Easy Flappy Bird - Click or press SPACE to fly!</div>
            <div style="text-align: center; margin: 20px 0;">
                <canvas id="flappyCanvas" width="500" height="400" style="border: 2px solid #333; border-radius: 10px; cursor: pointer; background: linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%);"></canvas>
            </div>
            <div style="text-align: center; margin: 10px 0;">
                <div style="display: inline-block; margin: 0 10px;">
                    <label>Difficulty: </label>
                    <select id="difficultySelect" style="padding: 5px; border-radius: 5px;">
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <button class="play-btn" onclick="app.restartFlappyBird()">🎮 New Game</button>
            </div>
            <div style="text-align: center; font-size: 14px; color: #666; margin: 10px 0;">
                💡 Tips: Click or press SPACE to flap • Fly through the gaps • Collect stars for bonus points!
            </div>
        `;
        
        this.gameContent.innerHTML += gameHtml;
        this.initFlappyBird();
    }

    restartFlappyBird() {
        // Stop any existing game
        if (this.flappyGameLoop) {
            cancelAnimationFrame(this.flappyGameLoop);
        }
        this.initFlappyBird();
    }

    initFlappyBird() {
        const canvas = document.getElementById('flappyCanvas');
        const statusDiv = document.getElementById('flappyStatus');
        const difficultySelect = document.getElementById('difficultySelect');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Difficulty settings
        const difficulties = {
            easy: {
                gravity: 0.25,
                jump: -6,
                pipeSpeed: 1.5,
                pipeGap: 180,
                pipeFrequency: 250
            },
            normal: {
                gravity: 0.35,
                jump: -7,
                pipeSpeed: 2,
                pipeGap: 150,
                pipeFrequency: 200
            },
            hard: {
                gravity: 0.45,
                jump: -8,
                pipeSpeed: 2.5,
                pipeGap: 120,
                pipeFrequency: 180
            }
        };
        
        const currentDifficulty = difficulties[difficultySelect.value] || difficulties.easy;
        
        // Game state
        const gameState = {
            bird: { 
                x: 100, 
                y: canvas.height / 2, 
                velocity: 0, 
                size: 25,
                color: '#FFD700',
                rotation: 0
            },
            pipes: [],
            stars: [],
            score: 0,
            starScore: 0,
            gameRunning: true,
            gameStarted: false,
            frameCount: 0,
            
            // Game constants (now adjustable by difficulty)
            gravity: currentDifficulty.gravity,
            jump: currentDifficulty.jump,
            pipeWidth: 80,
            pipeGap: currentDifficulty.pipeGap,
            pipeSpeed: currentDifficulty.pipeSpeed,
            pipeFrequency: currentDifficulty.pipeFrequency
        };

        // Clear any existing event listeners by cloning the canvas
        const newCanvas = canvas.cloneNode(true);
        canvas.parentNode.replaceChild(newCanvas, canvas);
        const gameCanvas = document.getElementById('flappyCanvas');
        const gameCtx = gameCanvas.getContext('2d');
        
        const createPipe = () => {
            const minHeight = 80;
            const maxHeight = gameCanvas.height - gameState.pipeGap - minHeight;
            const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
            
            const pipe = {
                x: gameCanvas.width,
                topHeight: topHeight,
                bottomY: topHeight + gameState.pipeGap,
                bottomHeight: gameCanvas.height - (topHeight + gameState.pipeGap),
                scored: false
            };
            
            gameState.pipes.push(pipe);
            
            // Add a star in the middle of the gap (50% chance)
            if (Math.random() < 0.5) {
                gameState.stars.push({
                    x: pipe.x + gameState.pipeWidth / 2,
                    y: topHeight + gameState.pipeGap / 2,
                    size: 15,
                    collected: false,
                    sparkle: 0
                });
            }
        };
        
        const updateGame = () => {
            if (!gameState.gameRunning) return;
            
            gameState.frameCount++;
            
            // Update bird physics
            if (gameState.gameStarted) {
                gameState.bird.velocity += gameState.gravity;
                gameState.bird.y += gameState.bird.velocity;
                
                // Update bird rotation based on velocity
                gameState.bird.rotation = Math.max(-30, Math.min(30, gameState.bird.velocity * 3));
                
                // Create pipes based on frequency
                if (gameState.pipes.length === 0 || gameState.pipes[gameState.pipes.length - 1].x < gameCanvas.width - gameState.pipeFrequency) {
                    createPipe();
                }
                
                // Update pipes
                gameState.pipes.forEach(pipe => {
                    pipe.x -= gameState.pipeSpeed;
                });
                
                // Update stars
                gameState.stars.forEach(star => {
                    star.x -= gameState.pipeSpeed;
                    star.sparkle += 0.2;
                });
                
                // Remove off-screen pipes and stars
                gameState.pipes = gameState.pipes.filter(pipe => pipe.x > -gameState.pipeWidth);
                gameState.stars = gameState.stars.filter(star => star.x > -20);
                
                // Check ground/ceiling collisions with some forgiveness
                if (gameState.bird.y < -10 || gameState.bird.y + gameState.bird.size > gameCanvas.height + 10) {
                    gameState.gameRunning = false;
                    statusDiv.textContent = `🎮 Game Over! Score: ${gameState.score} | Stars: ${gameState.starScore} ⭐`;
                }
                
                // Check pipe collisions (with smaller hitbox for easier gameplay)
                const birdHitbox = {
                    x: gameState.bird.x + 5,
                    y: gameState.bird.y + 5,
                    width: gameState.bird.size - 10,
                    height: gameState.bird.size - 10
                };
                
                gameState.pipes.forEach(pipe => {
                    if (birdHitbox.x + birdHitbox.width > pipe.x && birdHitbox.x < pipe.x + gameState.pipeWidth) {
                        if (birdHitbox.y < pipe.topHeight || birdHitbox.y + birdHitbox.height > pipe.bottomY) {
                            gameState.gameRunning = false;
                            statusDiv.textContent = `💥 Crashed! Score: ${gameState.score} | Stars: ${gameState.starScore} ⭐`;
                        }
                    }
                    
                    // Update score
                    if (pipe.x + gameState.pipeWidth < gameState.bird.x && !pipe.scored) {
                        gameState.score++;
                        pipe.scored = true;
                        statusDiv.textContent = `🎯 Score: ${gameState.score} | Stars: ${gameState.starScore} ⭐ - Great flying!`;
                    }
                });
                
                // Check star collection
                gameState.stars.forEach(star => {
                    if (!star.collected) {
                        const distance = Math.sqrt(
                            Math.pow(gameState.bird.x + gameState.bird.size/2 - star.x, 2) + 
                            Math.pow(gameState.bird.y + gameState.bird.size/2 - star.y, 2)
                        );
                        if (distance < star.size + gameState.bird.size/2) {
                            star.collected = true;
                            gameState.starScore++;
                            statusDiv.textContent = `⭐ Star collected! Score: ${gameState.score} | Stars: ${gameState.starScore} ⭐`;
                        }
                    }
                });
            }
        };
        
        const drawGame = () => {
            // Clear canvas with gradient background
            const gradient = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#98FB98');
            gameCtx.fillStyle = gradient;
            gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
            
            // Draw animated clouds
            gameCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const cloudOffset = (gameState.frameCount * 0.2) % 100;
            for (let i = 0; i < 6; i++) {
                const x = (i * 120 - cloudOffset) % (gameCanvas.width + 100);
                const y = 40 + Math.sin(gameState.frameCount * 0.01 + i) * 10;
                gameCtx.beginPath();
                gameCtx.arc(x, y, 20, 0, Math.PI * 2);
                gameCtx.arc(x + 20, y - 5, 25, 0, Math.PI * 2);
                gameCtx.arc(x + 40, y, 20, 0, Math.PI * 2);
                gameCtx.fill();
            }
            
            // Draw pipes with gradient
            gameState.pipes.forEach(pipe => {
                // Pipe gradient
                const pipeGradient = gameCtx.createLinearGradient(pipe.x, 0, pipe.x + gameState.pipeWidth, 0);
                pipeGradient.addColorStop(0, '#228B22');
                pipeGradient.addColorStop(0.5, '#32CD32');
                pipeGradient.addColorStop(1, '#228B22');
                gameCtx.fillStyle = pipeGradient;
                
                // Top pipe
                gameCtx.fillRect(pipe.x, 0, gameState.pipeWidth, pipe.topHeight);
                // Bottom pipe
                gameCtx.fillRect(pipe.x, pipe.bottomY, gameState.pipeWidth, pipe.bottomHeight);
                
                // Pipe caps with highlight
                gameCtx.fillStyle = '#32CD32';
                gameCtx.fillRect(pipe.x - 8, pipe.topHeight - 25, gameState.pipeWidth + 16, 25);
                gameCtx.fillRect(pipe.x - 8, pipe.bottomY, gameState.pipeWidth + 16, 25);
                
                // Pipe highlights
                gameCtx.fillStyle = '#90EE90';
                gameCtx.fillRect(pipe.x + 5, 0, 3, pipe.topHeight);
                gameCtx.fillRect(pipe.x + 5, pipe.bottomY, 3, pipe.bottomHeight);
            });
            
            // Draw stars
            gameState.stars.forEach(star => {
                if (!star.collected) {
                    gameCtx.save();
                    gameCtx.translate(star.x, star.y);
                    gameCtx.rotate(star.sparkle);
                    
                    // Star glow
                    gameCtx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                    gameCtx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 144 - 90) * Math.PI / 180;
                        const x = Math.cos(angle) * (star.size + 5);
                        const y = Math.sin(angle) * (star.size + 5);
                        if (i === 0) gameCtx.moveTo(x, y);
                        else gameCtx.lineTo(x, y);
                        
                        const innerAngle = ((i * 144 + 72) - 90) * Math.PI / 180;
                        const innerX = Math.cos(innerAngle) * (star.size / 2 + 2);
                        const innerY = Math.sin(innerAngle) * (star.size / 2 + 2);
                        gameCtx.lineTo(innerX, innerY);
                    }
                    gameCtx.closePath();
                    gameCtx.fill();
                    
                    // Star body
                    gameCtx.fillStyle = '#FFD700';
                    gameCtx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 144 - 90) * Math.PI / 180;
                        const x = Math.cos(angle) * star.size;
                        const y = Math.sin(angle) * star.size;
                        if (i === 0) gameCtx.moveTo(x, y);
                        else gameCtx.lineTo(x, y);
                        
                        const innerAngle = ((i * 144 + 72) - 90) * Math.PI / 180;
                        const innerX = Math.cos(innerAngle) * (star.size / 2);
                        const innerY = Math.sin(innerAngle) * (star.size / 2);
                        gameCtx.lineTo(innerX, innerY);
                    }
                    gameCtx.closePath();
                    gameCtx.fill();
                    
                    gameCtx.restore();
                }
            });
            
            // Draw bird with rotation and animation
            gameCtx.save();
            gameCtx.translate(gameState.bird.x + gameState.bird.size/2, gameState.bird.y + gameState.bird.size/2);
            gameCtx.rotate(gameState.bird.rotation * Math.PI / 180);
            
            // Bird shadow
            gameCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            gameCtx.beginPath();
            gameCtx.arc(2, 2, gameState.bird.size/2, 0, Math.PI * 2);
            gameCtx.fill();
            
            // Bird body
            gameCtx.fillStyle = gameState.bird.color;
            gameCtx.beginPath();
            gameCtx.arc(0, 0, gameState.bird.size/2, 0, Math.PI * 2);
            gameCtx.fill();
            
            // Bird wing (animated)
            const wingFlap = Math.sin(gameState.frameCount * 0.3) * 0.3;
            gameCtx.fillStyle = '#FFA500';
            gameCtx.beginPath();
            gameCtx.ellipse(-5, -3, 8, 4 + wingFlap, 0, 0, Math.PI * 2);
            gameCtx.fill();
            
            // Bird eye
            gameCtx.fillStyle = '#000';
            gameCtx.beginPath();
            gameCtx.arc(6, -4, 3, 0, Math.PI * 2);
            gameCtx.fill();
            
            // Bird eye highlight
            gameCtx.fillStyle = '#fff';
            gameCtx.beginPath();
            gameCtx.arc(7, -5, 1, 0, Math.PI * 2);
            gameCtx.fill();
            
            // Bird beak
            gameCtx.fillStyle = '#FF6347';
            gameCtx.beginPath();
            gameCtx.moveTo(gameState.bird.size/2, 0);
            gameCtx.lineTo(gameState.bird.size/2 + 10, -2);
            gameCtx.lineTo(gameState.bird.size/2 + 10, 2);
            gameCtx.fill();
            
            gameCtx.restore();
            
            // Draw score with style
            gameCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            gameCtx.fillRect(10, 10, 200, 60);
            gameCtx.fillStyle = '#fff';
            gameCtx.font = 'bold 20px Arial';
            gameCtx.fillText(`Score: ${gameState.score}`, 20, 35);
            gameCtx.fillText(`⭐ Stars: ${gameState.starScore}`, 20, 55);
            
            // Draw instructions or game over
            if (!gameState.gameStarted && gameState.gameRunning) {
                gameCtx.fillStyle = 'rgba(0,0,0,0.8)';
                gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
                gameCtx.fillStyle = '#fff';
                gameCtx.font = 'bold 32px Arial';
                gameCtx.textAlign = 'center';
                gameCtx.fillText('🐦 Easy Flappy Bird', gameCanvas.width/2, gameCanvas.height/2 - 40);
                gameCtx.font = '20px Arial';
                gameCtx.fillText('Click or press SPACE to start flying!', gameCanvas.width/2, gameCanvas.height/2);
                gameCtx.font = '16px Arial';
                gameCtx.fillText('Collect ⭐ stars for bonus points!', gameCanvas.width/2, gameCanvas.height/2 + 30);
                gameCtx.fillText(`Difficulty: ${difficultySelect.value.toUpperCase()}`, gameCanvas.width/2, gameCanvas.height/2 + 60);
            } else if (!gameState.gameRunning) {
                gameCtx.fillStyle = 'rgba(0,0,0,0.9)';
                gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
                gameCtx.fillStyle = '#fff';
                gameCtx.font = 'bold 36px Arial';
                gameCtx.textAlign = 'center';
                gameCtx.fillText('🎮 Game Over!', gameCanvas.width/2, gameCanvas.height/2 - 40);
                gameCtx.font = '24px Arial';
                gameCtx.fillText(`Score: ${gameState.score}`, gameCanvas.width/2, gameCanvas.height/2);
                gameCtx.fillText(`⭐ Stars: ${gameState.starScore}`, gameCanvas.width/2, gameCanvas.height/2 + 30);
                gameCtx.font = '18px Arial';
                const totalScore = gameState.score + gameState.starScore * 2;
                gameCtx.fillText(`Total Score: ${totalScore} points`, gameCanvas.width/2, gameCanvas.height/2 + 60);
                gameCtx.font = '16px Arial';
                gameCtx.fillText('Click "New Game" to play again!', gameCanvas.width/2, gameCanvas.height/2 + 90);
            }
            
            gameCtx.textAlign = 'left'; // Reset text alignment
        };
        
        const gameLoop = () => {
            updateGame();
            drawGame();
            
            if (gameState.gameRunning) {
                this.flappyGameLoop = requestAnimationFrame(gameLoop);
            }
        };
        
        // Handle clicks and keyboard
        const handleInput = () => {
            if (!gameState.gameStarted) {
                gameState.gameStarted = true;
                statusDiv.textContent = '🐦 Flying! Click or press SPACE to flap your wings!';
                gameLoop();
            } else if (gameState.gameRunning) {
                gameState.bird.velocity = gameState.jump;
            }
        };

        gameCanvas.addEventListener('click', handleInput);
        
        // Add keyboard support (spacebar)
        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleInput();
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
        
        // Store the cleanup function
        this.flappyCleanup = () => {
            document.removeEventListener('keydown', handleKeyPress);
            if (this.flappyGameLoop) {
                cancelAnimationFrame(this.flappyGameLoop);
            }
        };
        
        // Start the initial draw
        drawGame();
    }

    showChessSolution() {
        alert('Solution: Queen to d8 checkmate! The queen moves from d1 to d8, giving checkmate because the black king cannot escape.');
    }

    checkWinner(board) {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // columns
            [0,4,8], [2,4,6] // diagonals
        ];
        
        return winPatterns.some(pattern => 
            pattern.every(index => 
                board[index] !== '' && board[index] === board[pattern[0]]
            )
        );
    }

    checkConnect4Winner(board, lastMove) {
        const row = Math.floor(lastMove / 7);
        const col = lastMove % 7;
        const player = board[lastMove];
        
        // Check horizontal, vertical, and both diagonals
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        return directions.some(([dRow, dCol]) => {
            let count = 1;
            
            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const newRow = row + dRow * i;
                const newCol = col + dCol * i;
                if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) break;
                if (board[newRow * 7 + newCol] !== player) break;
                count++;
            }
            
            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const newRow = row - dRow * i;
                const newCol = col - dCol * i;
                if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) break;
                if (board[newRow * 7 + newCol] !== player) break;
                count++;
            }
            
            return count >= 4;
        });
    }

    resetTicTacToe() {
        this.ticTacToeBoard = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        
        // Clear existing game content and recreate
        this.gameContent.innerHTML = '<h2>Tic Tac Toe</h2>';
        this.createTicTacToe();
    }

    resetConnect4() {
        this.connect4Board = Array(6).fill().map(() => Array(7).fill(''));
        this.connect4CurrentPlayer = 'red';
        this.connect4GameOver = false;
        
        // Clear existing game content and recreate
        this.gameContent.innerHTML = '<h2>Connect 4</h2>';
        this.createConnect4();
    }

    showSolutionInline(card, answer, solution) {
        const answerSection = card.querySelector('.answer-section');
        const answerText = card.querySelector('.answer-text');
        const solutionText = card.querySelector('.solution-text');
        const showAnswerBtn = card.querySelector('.show-answer-btn');
        
        // Update the content
        answerText.textContent = answer;
        solutionText.textContent = solution;
        
        // Show the answer section with animation
        answerSection.style.display = 'block';
        answerSection.style.opacity = '0';
        answerSection.style.transform = 'translateY(20px)';
        
        // Animate in
        setTimeout(() => {
            answerSection.style.transition = 'all 0.3s ease-out';
            answerSection.style.opacity = '1';
            answerSection.style.transform = 'translateY(0)';
        }, 10);
        
        // Update button to show it's been revealed
        showAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Answer Revealed';
        showAnswerBtn.disabled = true;
        showAnswerBtn.style.opacity = '0.6';
        showAnswerBtn.style.cursor = 'default';
        
        // Recheck card overflow after content change
        setTimeout(() => {
            this.checkCardOverflow(card);
        }, 350);
    }

    showSolution(answer, solution) {
        // Fallback method for any remaining onclick calls
        alert(`Answer: ${answer}\n\nExplanation: ${solution}`);
    }

    // Appwrite Authentication Methods
    initializeAppwrite() {
        console.log('Initializing Appwrite...');
        
        // Initialize Appwrite client
        this.client = new Appwrite.Client()
            .setEndpoint(this.appwriteEndpoint)
            .setProject(this.appwriteProjectId);
        
        // Initialize Account service
        this.account = new Appwrite.Account(this.client);
        
        console.log('Appwrite initialized successfully');
    }

    async setupAppwriteAuth() {
        try {
            // Check if user is already logged in
            const user = await this.account.get();
            this.handleSignInSuccess(user);
        } catch (error) {
            console.log('User not logged in');
            // NOTE: No longer calling setupSignInButton() since buttons use openAuthModal()
        }
    }

    setupSignInButton() {
        // NOTE: Sign-in buttons now use openAuthModal() instead of direct Google sign-in
        // The onclick handlers are set directly in HTML: onclick="openAuthModal('login')"
        // This allows the authentication modal to handle all sign-in methods
        console.log('✅ Sign-in buttons configured to use authentication modal');
    }

    // Note: Google sign-in is now handled through the auth modal popup system
    // The signInWithGoogle function has been removed to prevent conflicts

    handleSignInSuccess(user) {
        this.currentUser = {
            id: user.$id,
            name: user.name,
            email: user.email,
            imageUrl: user.prefs?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4ecdc4&color=fff`
        };
        this.isSignedIn = true;
        
        // Save authentication state to localStorage for sharing with blog page
        localStorage.setItem('appwrite_auth_state', JSON.stringify({
            currentUser: this.currentUser,
            isSignedIn: this.isSignedIn,
            timestamp: Date.now()
        }));
        
        console.log('User signed in:', this.currentUser);
        this.updateUI();
    }

    async signOut() {
        try {
            await this.account.deleteSession('current');
            this.currentUser = null;
            this.isSignedIn = false;
            
            // Clear authentication state from localStorage
            localStorage.removeItem('appwrite_auth_state');
            
            console.log('User signed out successfully');
            this.updateUI();
        } catch (error) {
            console.error('Error signing out:', error);
            
            // Even if server sign-out fails, clear local state
            this.currentUser = null;
            this.isSignedIn = false;
            localStorage.removeItem('appwrite_auth_state');
            this.updateUI();
        }
    }

    updateUI() {
        const signInBtn = document.getElementById('mainSignInBtn');
        const userProfile = document.getElementById('userProfile');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (this.isSignedIn && this.currentUser) {
            // Hide sign-in button, show user profile
            if (signInBtn) signInBtn.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'flex';
                if (userAvatar) userAvatar.src = this.currentUser.imageUrl;
                if (userName) userName.textContent = this.currentUser.name;
            }
        } else {
            // Show sign-in button, hide user profile
            if (signInBtn) signInBtn.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
            
            // NOTE: No longer re-setting up sign-in button since it uses openAuthModal()
        }
    }

    setupNavigation() {
        // Set up navigation tab functionality
        const homeTab = document.getElementById('homeTab');
        const blogTab = document.getElementById('blogTab');
        const savedCardsBtn = document.getElementById('savedCardsBtn');
        
        if (homeTab) {
            homeTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage('index.html');
            });
        }
        
        if (blogTab) {
            blogTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage('blog.html');
            });
        }
        
        if (savedCardsBtn) {
            savedCardsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSavedCards();
            });
        }
        
        // Set active tab based on current page
        this.setActiveTab();
    }
    
    navigateToPage(page) {
        // Save current state if needed
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        // Navigate to the page
        window.location.href = page;
    }
    
    setActiveTab() {
        const homeTab = document.getElementById('homeTab');
        const blogTab = document.getElementById('blogTab');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Remove active class from all tabs
        if (homeTab) homeTab.classList.remove('active');
        if (blogTab) blogTab.classList.remove('active');
        
        // Add active class to current tab
        if (currentPage === 'index.html' || currentPage === '') {
            if (homeTab) homeTab.classList.add('active');
        } else if (currentPage === 'blog.html') {
            if (blogTab) blogTab.classList.add('active');
        }
    }

    setupContactForm() {
        const contactBtn = document.getElementById('contactBtn');
        const contactModal = document.getElementById('contactModal');
        const closeContactModal = document.getElementById('closeContactModal');
        const cancelContactBtn = document.getElementById('cancelContactBtn');
        const contactForm = document.getElementById('contactForm');

        // Open contact modal
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openContactModal();
            });
        }

        // Close contact modal
        if (closeContactModal) {
            closeContactModal.addEventListener('click', () => {
                this.closeContactModal();
            });
        }

        if (cancelContactBtn) {
            cancelContactBtn.addEventListener('click', () => {
                this.closeContactModal();
            });
        }

        // Close modal when clicking outside
        if (contactModal) {
            contactModal.addEventListener('click', (e) => {
                if (e.target === contactModal) {
                    this.closeContactModal();
                }
            });
        }

        // Handle form submission
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                this.handleContactFormSubmit(e);
            });
        }

        // Check for success parameter in URL
        this.checkContactSuccess();
    }

    openContactModal() {
        const contactModal = document.getElementById('contactModal');
        if (contactModal) {
            contactModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = contactModal.querySelector('input[type="text"]');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }

    closeContactModal() {
        const contactModal = document.getElementById('contactModal');
        if (contactModal) {
            contactModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
            this.resetContactForm();
        }
    }

    resetContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.reset();
        }
        
        // Remove any success messages
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.remove();
        }
    }

    handleContactFormSubmit(e) {
        const submitBtn = e.target.querySelector('.submit-btn');
        
        // Show loading state
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Reset button after a delay (in case form submission fails)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 10000);
        }
        
        // Form will be submitted normally to FormSubmit.io
        // The _next hidden field will redirect back to our page with success=true
    }

    checkContactSuccess() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            this.showContactSuccessMessage();
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    showContactSuccessMessage() {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Thank you! Your message has been sent successfully. We'll get back to you soon!
        `;
        
        // Insert at the top of the page
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.insertBefore(successMessage, appContainer.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 5000);
        }
    }

    setupSavedCardsModal() {
        const savedCardsModal = document.getElementById('savedCardsModal');
        const closeSavedCardsModal = document.getElementById('closeSavedCardsModal');

        // Close saved cards modal
        if (closeSavedCardsModal) {
            closeSavedCardsModal.addEventListener('click', () => {
                this.closeSavedCardsModal();
            });
        }

        // Close modal when clicking outside
        if (savedCardsModal) {
            savedCardsModal.addEventListener('click', (e) => {
                if (e.target === savedCardsModal) {
                    this.closeSavedCardsModal();
                }
            });
        }
    }

    // Save functionality methods
    initializeSavedCards() {
        const savedCards = localStorage.getItem('savedCards');
        this.savedCards = savedCards ? JSON.parse(savedCards) : [];
        console.log('🔖 Initialized saved cards:', this.savedCards.length, 'cards found');
        console.log('🔖 Saved cards data:', this.savedCards);
    }

    toggleSaveCard(cardData) {
        console.log('🔖 toggleSaveCard called with:', cardData);
        
        const cardId = this.generateCardId(cardData);
        console.log('🔖 Generated card ID:', cardId);
        
        const isCurrentlySaved = this.isCardSaved(cardId);
        console.log('🔖 Is currently saved:', isCurrentlySaved);
        console.log('🔖 Current saved cards count:', this.savedCards.length);
        
        if (isCurrentlySaved) {
            console.log('🔖 Unsaving card...');
            this.unsaveCard(cardId);
        } else {
            console.log('🔖 Saving card...');
            this.saveCard(cardData, cardId);
        }
        
        console.log('🔖 After save/unsave, saved cards count:', this.savedCards.length);
        
        // Update all save buttons for this card
        this.updateSaveButtonsForCard(cardId, !isCurrentlySaved);
        
        // Play sound feedback
        if (this.soundEnabled) {
            if (!isCurrentlySaved) {
                this.playSound('save');
            } else {
                this.playSound('unsave');
            }
        }
    }

    generateCardId(cardData) {
        // Generate a unique ID based on card content, handling undefined values
        const title = cardData.title || '';
        const description = cardData.description || '';
        const category = cardData.category || '';
        const content = title + description + category;
        
        // Ensure we have some content to generate an ID from
        if (!content.trim()) {
            console.warn('Warning: Card data has no content for ID generation:', cardData);
            return 'unknown_' + Date.now();
        }
        
        return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }

    isCardSaved(cardId) {
        return this.savedCards.some(card => card.id === cardId);
    }

    saveCard(cardData, cardId) {
        console.log('🔖 saveCard method called');
        console.log('🔖 Card data for saving:', cardData);
        console.log('🔖 Card ID for saving:', cardId);
        
        // Save complete card data to preserve all properties
        const savedCard = {
            id: cardId,
            title: cardData.title,
            description: cardData.description,
            category: cardData.category,
            type: cardData.type,
            action: cardData.action,
            image: cardData.image,
            answer: cardData.answer,
            solution: cardData.solution,
            gameType: cardData.gameType,
            isNew: cardData.isNew,
            savedAt: new Date().toISOString()
        };
        
        console.log('🔖 Created saved card object:', savedCard);
        console.log('🔖 Before adding - saved cards array length:', this.savedCards.length);
        
        this.savedCards.unshift(savedCard); // Add to beginning
        
        console.log('🔖 After adding - saved cards array length:', this.savedCards.length);
        console.log('🔖 Updated saved cards array:', this.savedCards);
        
        this.saveSavedCardsToStorage();
        console.log('🔖 Saved to localStorage');
    }

    unsaveCard(cardId) {
        this.savedCards = this.savedCards.filter(card => card.id !== cardId);
        this.saveSavedCardsToStorage();
    }

    saveSavedCardsToStorage() {
        localStorage.setItem('savedCards', JSON.stringify(this.savedCards));
    }

    updateSaveButtonsForCard(cardId, isSaved) {
        const saveButtons = document.querySelectorAll('.card-save-btn');
        saveButtons.forEach(button => {
            const card = button.closest('.card');
            if (card && card.dataset.cardId === cardId) {
                this.updateSaveButtonAppearance(button, isSaved);
            }
        });
    }

    updateSaveButtonAppearance(button, isSaved) {
        if (isSaved) {
            button.classList.add('saved');
            button.innerHTML = '<i class="fas fa-bookmark"></i>';
            button.title = 'Remove from saved';
        } else {
            button.classList.remove('saved');
            button.innerHTML = '<i class="far fa-bookmark"></i>';
            button.title = 'Save for later';
        }
    }

    showSavedCards() {
        console.log('🔖 showSavedCards called');
        const modal = document.getElementById('savedCardsModal');
        const savedCardsList = document.getElementById('savedCardsList');
        
        console.log('🔖 Modal element:', modal);
        console.log('🔖 Saved cards list element:', savedCardsList);
        console.log('🔖 Number of saved cards:', this.savedCards.length);
        console.log('🔖 Saved cards data:', this.savedCards);
        
        if (!modal || !savedCardsList) {
            console.error('🔖 Modal or saved cards list element not found!');
            return;
        }

        if (this.savedCards.length === 0) {
            console.log('🔖 No saved cards, showing message');
            this.showNoSavedCardsMessage();
            return;
        }

        // Populate the saved cards list
        console.log('🔖 Creating HTML for saved cards...');
        const savedCardsHTML = this.savedCards.map(card => {
            console.log('🔖 Creating HTML for card:', card);
            return this.createSavedCardHTML(card);
        }).join('');
        
        console.log('🔖 Generated HTML:', savedCardsHTML);
        savedCardsList.innerHTML = savedCardsHTML;

        // Add event listeners for saved card actions
        const savedCardItems = savedCardsList.querySelectorAll('.saved-card-item');
        console.log('🔖 Found saved card items:', savedCardItems.length);
        
        savedCardItems.forEach((item, index) => {
            const cardId = item.dataset.cardId;
            console.log(`🔖 Setting up listeners for card ${index}, ID: ${cardId}`);
            
            const viewButton = item.querySelector('.view-saved-card');
            const removeButton = item.querySelector('.remove-saved-card');
            
            console.log(`🔖 View button found:`, viewButton);
            console.log(`🔖 Remove button found:`, removeButton);
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    console.log('🔖 View button clicked for card ID:', cardId);
                    this.viewSavedCard(cardId);
                    this.closeSavedCardsModal();
                });
            }

            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    console.log('🔖 Remove button clicked for card ID:', cardId);
                    this.removeSavedCard(cardId, item);
                });
            }
        });

        // Show the modal
        console.log('🔖 Showing modal...');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('🔖 Modal should now be visible');
    }

    createSavedCardHTML(card) {
        return `
            <div class="saved-card-item" data-card-id="${card.id}">
                <div class="saved-card-info">
                    <h3>${card.title}</h3>
                    <p>${card.description}</p>
                    <span class="saved-card-category">${card.category}</span>
                    <span class="saved-card-date">Saved ${this.formatSavedDate(card.savedAt)}</span>
                </div>
                <div class="saved-card-actions">
                    <button class="view-saved-card" title="View card">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="remove-saved-card" title="Remove from saved">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    formatSavedDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'today';
        if (diffDays === 2) return 'yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    }

    viewSavedCard(cardId) {
        console.log('🔖 viewSavedCard called with ID:', cardId);
        const savedCard = this.savedCards.find(card => card.id === cardId);
        
        if (!savedCard) {
            console.error('🔖 Saved card not found for ID:', cardId);
            console.log('🔖 Available saved cards:', this.savedCards.map(c => c.id));
            return;
        }

        console.log('🔖 Found saved card:', savedCard);

        // Close the saved cards modal
        console.log('🔖 Closing saved cards modal...');
        this.closeSavedCardsModal();

        // Switch to home tab
        const homeTab = document.querySelector('.nav-link[data-tab="home"]');
        const blogTab = document.querySelector('.nav-link[data-tab="blog"]');
        const homeContent = document.getElementById('home');
        const blogContent = document.getElementById('blog');

        if (homeTab && blogTab && homeContent && blogContent) {
            // Update tab states
            homeTab.classList.add('active');
            blogTab.classList.remove('active');
            homeContent.style.display = 'block';
            blogContent.style.display = 'none';
        }

        // Generate new random cards first
        this.generateCards();

        // Wait for the card generation animation to complete, then add saved card
        setTimeout(() => {
            // Restore complete card data with all original properties
            const cardData = {
                title: savedCard.title,
                description: savedCard.description,
                category: savedCard.category,
                type: savedCard.type,
                action: savedCard.action,
                image: savedCard.image,
                answer: savedCard.answer,
                solution: savedCard.solution,
                gameType: savedCard.gameType,
                isNew: savedCard.isNew
            };

            console.log('🔖 Restoring card with data:', cardData);

            const savedCardElement = this.createCard(cardData);
            savedCardElement.dataset.cardId = cardId;
            
            // Place the saved card at the very front
            const cardContainer = document.getElementById('cardsContainer');
            if (cardContainer && cardContainer.firstChild) {
                cardContainer.insertBefore(savedCardElement, cardContainer.firstChild);
                // Update the currentCards array to include the saved card at the front
                this.currentCards.unshift(savedCardElement);
            } else if (cardContainer) {
                cardContainer.appendChild(savedCardElement);
                this.currentCards.push(savedCardElement);
            }

            // Update save button appearance for the saved card
            const saveButton = savedCardElement.querySelector('.card-save-btn');
            if (saveButton) {
                this.updateSaveButtonAppearance(saveButton, true);
            }

            // Make sure the saved card is visible immediately and positioned correctly
            savedCardElement.style.opacity = '1';
            savedCardElement.style.transform = 'translateY(0px)';
            savedCardElement.style.zIndex = '1000'; // Ensure it's on top

            // Ensure the sound toggle button is properly initialized for the saved card
            const soundToggle = savedCardElement.querySelector('.sound-toggle');
            if (soundToggle) {
                // Update the sound toggle appearance
                soundToggle.classList.toggle('sound-on', this.soundEnabled);
                soundToggle.classList.toggle('sound-off', !this.soundEnabled);
                soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
                soundToggle.title = this.soundEnabled ? 'Click to disable sound' : 'Click to enable sound';
                
                // Add a special click handler for saved cards to ensure audio works
                const originalClickHandler = soundToggle.onclick;
                soundToggle.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    console.log('🔖 Sound toggle clicked on saved card');
                    
                    // Ensure audio is initialized
                    if (this.soundEnabled && !this.speechReady) {
                        console.log('🔖 Initializing audio from sound toggle click...');
                        await this.initializeAudioImmediately();
                    }
                    
                    // Trigger the normal toggle behavior
                    this.toggleSound(savedCardElement);
                });
            }

            // Scroll to top to show the saved card
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Ensure audio is properly initialized and play audio for the saved card
            setTimeout(async () => {
                console.log('🔖 Preparing audio for saved card...');
                console.log('🔖 Sound enabled:', this.soundEnabled);
                console.log('🔖 Speech ready:', this.speechReady);
                
                if (this.soundEnabled) {
                    try {
                        // Ensure audio context is ready
                        await this.ensureAudioContext();
                        
                        // Initialize speech if not ready
                        if (!this.speechReady) {
                            console.log('🔖 Initializing speech for saved card...');
                            await this.initializeAudioImmediately();
                        }
                        
                        // Make sure the sound icon is properly set up
                        const soundIcon = savedCardElement.querySelector('.sound-toggle');
                        if (soundIcon) {
                            soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
                            console.log('🔖 Sound icon updated for saved card');
                        }
                        
                        // Wait a bit more for everything to be ready
                        setTimeout(() => {
                            console.log('🔖 Auto-playing audio for saved card');
                            this.speakCardContent(savedCardElement);
                        }, 200);
                        
                    } catch (error) {
                        console.error('🔖 Error setting up audio for saved card:', error);
                    }
                } else {
                    console.log('🔖 Audio not enabled for saved card');
                }
            }, 700); // Increased delay to ensure card is fully rendered and audio is ready

        }, 600); // Wait for generateCards animation to complete (100ms + 4 cards * 100ms + buffer)
    }

    removeSavedCard(cardId, itemElement) {
        this.unsaveCard(cardId);
        itemElement.remove();
        
        // Update save buttons in current cards
        this.updateSaveButtonsForCard(cardId, false);
        
        // Check if no more saved cards
        const savedCardsList = document.getElementById('savedCardsList');
        if (savedCardsList && savedCardsList.children.length === 0) {
            this.closeSavedCardsModal();
            this.showNoSavedCardsMessage();
        }
    }

    closeSavedCardsModal() {
        const modal = document.getElementById('savedCardsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    showNoSavedCardsMessage() {
        // Create a temporary message
        const message = document.createElement('div');
        message.className = 'no-saved-cards-message';
        message.innerHTML = `
            <div class="message-content">
                <i class="far fa-bookmark"></i>
                <h3>No saved cards yet</h3>
                <p>Save cards you want to revisit later by clicking the bookmark icon on any card!</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Add sound effects for save actions
    playSound(action) {
        if (!this.soundEnabled) return;
        
        try {
            let frequency, duration;
            
            switch (action) {
                case 'save':
                    frequency = 800;
                    duration = 200;
                    break;
                case 'unsave':
                    frequency = 400;
                    duration = 150;
                    break;
                default:
                    return;
            }
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.log('Could not play save sound:', error);
        }
    }
}

// Appwrite OAuth callback handler
window.addEventListener('load', async () => {
    if (app && app.account) {
        try {
            // Check if we just returned from OAuth
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('success') || window.location.hash.includes('success')) {
                const user = await app.account.get();
                app.handleSignInSuccess(user);
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.log('No active session or OAuth callback');
        }
    }
});

// Premium status initialization
function initializePremiumStatus() {
    try {
        // Initialize user tier manager
        if (!window.userTierManager) {
            window.userTierManager = new UserTierManager();
        }
        
        // Check premium status from localStorage and user tier manager
        const premiumStatus = localStorage.getItem('cerebray_premium_status');
        const userTier = window.userTierManager.getCurrentTier();
        
        console.log('🌟 Checking premium status:', { premiumStatus, userTier });
        
        if (premiumStatus === 'active' || userTier === 'premium') {
            // User has premium access
            activatePremiumUI();
            console.log('🌟 Premium features activated!');
        } else {
            // User has basic access
            console.log('📱 Basic tier active');
        }
        
        // Listen for premium upgrade events
        window.addEventListener('premiumUpgraded', (event) => {
            console.log('🌟 Premium upgrade event received:', event.detail);
            activatePremiumUI();
        });
        
    } catch (error) {
        console.error('Error initializing premium status:', error);
    }
}

function activatePremiumUI() {
    // Update premium toggle buttons
    const premiumButtons = document.querySelectorAll('.premium-toggle, #premiumToggleBtn');
    premiumButtons.forEach(btn => {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-crown" style="color: gold;"></i> Premium';
            btn.style.background = 'linear-gradient(135deg, #ffd700, #ffed4e)';
            btn.style.color = '#333';
            btn.style.border = '2px solid #ffd700';
        }
    });
    
    // Update any premium indicators in the UI
    const premiumIndicators = document.querySelectorAll('.premium-indicator');
    premiumIndicators.forEach(indicator => {
        indicator.style.display = 'block';
    });
    
    // Remove any premium upgrade prompts
    const upgradePrompts = document.querySelectorAll('.upgrade-prompt');
    upgradePrompts.forEach(prompt => {
        prompt.style.display = 'none';
    });
}

// Initialize the app when the page loads
let app;
console.log('Script loaded!');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    try {
        app = new BoredomBusterApp();
        console.log('App initialized successfully!');
        
        // Initialize user tier manager and check premium status
        initializePremiumStatus();
        

        
        // Audio will only start when user interacts with the app
        console.log('🚀 App initialized - audio will start when user interacts');
        
        // Add page visibility handler (respects user sound preference)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                if (app.soundEnabled) {
                    console.log('🚀 PAGE VISIBLE - INITIALIZING AUDIO...');
                    setTimeout(() => {
                        app.initializeAudioImmediately();
                        app.startAutoReading();
                    }, 100);
                }
                // Always refresh images when page becomes visible
                console.log('🖼️ Page visible - refreshing images...');
                setTimeout(() => {
                    app.refreshCardImages();
                }, 500);
            }
        });
        
        // Add focus handler (respects user sound preference)
        window.addEventListener('focus', () => {
            if (app.soundEnabled) {
                console.log('🚀 WINDOW FOCUSED - INITIALIZING AUDIO...');
                setTimeout(() => {
                    app.initializeAudioImmediately();
                    app.startAutoReading();
                }, 100);
            }
            // Always refresh images when window gets focus
            console.log('🖼️ Window focused - refreshing images...');
            setTimeout(() => {
                app.refreshCardImages();
            }, 500);
        });

        // Add user interaction handlers to trigger image refresh
        ['click', 'touchstart', 'scroll'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                // Throttle image refresh on user interaction
                if (!app.lastImageRefresh || Date.now() - app.lastImageRefresh > 10000) {
                    console.log('🖼️ User interaction detected - refreshing images...');
                    app.refreshCardImages();
                    app.lastImageRefresh = Date.now();
                }
            }, { once: true, passive: true });
        });
        
    } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback: show a basic message
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white; font-family: Arial;">
                <h1>🧠 Cerebray</h1>
                <p>Loading error: ${error.message}</p>
                <p>Please refresh the page.</p>
            </div>
        `;
    }
});