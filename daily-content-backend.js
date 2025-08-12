// Daily Content Backend System
// Generates 40 fresh cards daily for free users with 80% new content guarantee

class DailyContentBackend {
    constructor() {
        this.userId = this.getUserId();
        this.today = this.getTodayString();
        this.contentPools = this.initializeContentPools();
        this.userProgress = this.loadUserProgress();
        this.dailyCards = this.loadDailyCards();
        
        console.log('🎯 Daily Content Backend initialized for user:', this.userId);
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

    // Initialize massive content pools for daily generation
    initializeContentPools() {
        return {
            // Basic games for free users (only 3 simple games)
            basicGames: [
                {
                    type: 'Game',
                    title: 'Tic Tac Toe',
                    description: 'Classic strategy game - get three in a row!',
                    action: 'play',
                    gameType: 'tictactoe',
                    category: 'tictactoe',
                    image: this.getCardImage('Game', 'tictactoe')
                },
                {
                    type: 'Game',
                    title: 'Connect 4',
                    description: 'Drop checkers and connect four in a row!',
                    action: 'play',
                    gameType: 'connect4',
                    category: 'connect4',
                    image: this.getCardImage('Game', 'connect4')
                },
                {
                    type: 'Chess Puzzle',
                    title: 'Checkmate in One',
                    description: 'Find the winning move! White to play and checkmate.',
                    action: 'play',
                    gameType: 'chess',
                    category: 'chess',
                    image: this.getCardImage('Game', 'chess')
                }
            ],
            funFacts: {
                'Ancient History': [
                    'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.',
                    'The ancient Romans used urine as mouthwash because they believed it whitened teeth.',
                    'Vikings discovered America 500 years before Columbus, establishing settlements in Newfoundland.',
                    'The Library of Alexandria had over 700,000 scrolls and attracted scholars from around the world.',
                    'Ancient Egyptians invented the first pregnancy test using wheat and barley seeds.',
                    'The Colosseum could be flooded to stage mock naval battles with real ships.',
                    'Spartacus was originally a Thracian soldier who became Rome\'s greatest military threat.',
                    'Pompeii had fast food restaurants, graffiti, and sophisticated plumbing systems.',
                    'Hannibal crossed the Alps with 37 elephants, but only one survived the journey.',
                    'The Rosetta Stone was found by Napoleon\'s soldiers and unlocked Egyptian hieroglyphs.',
                    'Ancient Greek fire was a secret weapon that could burn on water and was never extinguished.',
                    'The Antikythera mechanism was an ancient Greek computer that predicted astronomical positions.',
                    'Roman concrete was so advanced that some structures are still standing 2,000 years later.',
                    'The ancient Mayans invented the concept of zero independently from other civilizations.',
                    'Stonehenge was built over 1,500 years and its purpose remains a mystery.',
                    'The Terracotta Army contains over 8,000 unique soldier statues, each with different faces.',
                    'Ancient Babylonians created the first known map of the world on a clay tablet.',
                    'The Dead Sea Scrolls were hidden for nearly 2,000 years before being discovered in 1947.',
                    'Ancient Egyptians were the first to use makeup, including kohl eyeliner made from lead.',
                    'The ancient city of Troy was thought to be mythical until it was discovered in Turkey.'
                ],
                'Modern Science': [
                    'Your smartphone has more computing power than all of NASA had when they sent humans to the moon.',
                    'A single cloud can weigh more than a million pounds but floats because it\'s less dense than air.',
                    'Lightning strikes Earth about 100 times per second, totaling 8.6 million strikes daily.',
                    'The human brain uses 20% of the body\'s energy despite being only 2% of body weight.',
                    'Glass takes over 4,000 years to decompose, making it more permanent than most civilizations.',
                    'A single Google search uses the same energy as a 60-watt light bulb for 17 seconds.',
                    'The Internet weighs about the same as a strawberry when considering electron mass.',
                    'More bacteria live in your mouth than there are people on Earth.',
                    'Your DNA contains enough information to fill 200 phone books.',
                    'The first computer bug was literally a bug - a moth trapped in a Harvard computer.',
                    'Quantum computers can theoretically break most current encryption in seconds.',
                    'CRISPR gene editing can potentially cure genetic diseases by rewriting DNA.',
                    'Graphene is 200 times stronger than steel and conducts electricity better than copper.',
                    '3D printing can now create living tissue and may soon print entire organs.',
                    'Artificial intelligence can now detect diseases from photos better than doctors.',
                    'Nanotechnology allows us to build machines smaller than viruses.',
                    'Solar panels are now cheaper than fossil fuels in most parts of the world.',
                    'Lab-grown meat could revolutionize food production and reduce environmental impact.',
                    'Brain-computer interfaces allow paralyzed patients to control devices with thoughts.',
                    'Fusion energy could provide unlimited clean power by recreating the sun\'s process.'
                ],
                'Space Wonders': [
                    'A day on Venus is longer than its year - 243 Earth days vs 225 days to orbit the Sun.',
                    'Jupiter\'s moon Europa has twice as much water as all Earth\'s oceans combined.',
                    'Saturn\'s moon Titan has lakes and rivers made of liquid methane instead of water.',
                    'One teaspoon of neutron star material would weigh 6 billion tons on Earth.',
                    'The footprints on the Moon will last millions of years due to no wind erosion.',
                    'Mars has the largest volcano in the solar system - Olympus Mons is three times taller than Everest.',
                    'Black holes can slow down time due to their extreme gravitational fields.',
                    'The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes.',
                    'There are more possible chess games than atoms in the observable universe.',
                    'If you could drive to the Sun at highway speeds, it would take over 100 years.',
                    'The Milky Way galaxy contains over 100 billion stars and is 100,000 light-years across.',
                    'Proxima Centauri, our nearest star neighbor, would take 73,000 years to reach with current technology.',
                    'The universe is expanding faster than the speed of light at its edges.',
                    'Dark matter makes up 85% of all matter but we can\'t see or directly detect it.',
                    'A single solar flare can release more energy than a billion nuclear bombs.',
                    'The temperature at the Sun\'s core reaches 27 million degrees Fahrenheit.',
                    'Voyager 1 has been traveling for over 45 years and is now in interstellar space.',
                    'The James Webb Space Telescope can see galaxies from when the universe was young.',
                    'Exoplanets are so common that there may be more planets than stars in our galaxy.',
                    'Time dilation means astronauts age slightly slower than people on Earth.'
                ],
                'Animal Kingdom': [
                    'Octopuses have three hearts and blue blood, with two hearts pumping to gills.',
                    'Dolphins have unique whistle signatures that act like names for identification.',
                    'Sea otters hold hands while sleeping to prevent drifting apart in currents.',
                    'Elephants are one of the few animals that can recognize themselves in mirrors.',
                    'Honey never spoils - edible honey has been found in 3,000-year-old Egyptian tombs.',
                    'Penguins propose with pebbles and mate for life in elaborate courtship rituals.',
                    'Crows can remember human faces for years and teach offspring to recognize threats.',
                    'Hummingbirds are the only birds that can fly backwards with hearts beating 1,260 times per minute.',
                    'Sloths only defecate once a week and lose up to 30% of body weight doing so.',
                    'Koalas sleep 18-22 hours daily and have fingerprints nearly identical to humans.',
                    'Mantis shrimp have the most complex eyes with 16 color receptors (humans have 3).',
                    'Sharks have existed for over 400 million years, longer than trees have existed.',
                    'Bees communicate through dance, telling others the location of flowers.',
                    'Wolves have a complex social hierarchy and can run up to 40 mph.',
                    'Chimpanzees share 98.8% of their DNA with humans and use tools in the wild.',
                    'Arctic foxes can survive temperatures as low as -58°F thanks to their thick fur.',
                    'Giraffes only need 5-30 minutes of sleep per day and sleep standing up.',
                    'Polar bears have black skin under their white fur to absorb heat from sunlight.',
                    'Chameleons can move their eyes independently and change color in 20 seconds.',
                    'Emperor penguins can dive to depths of 1,800 feet and hold their breath for 22 minutes.'
                ],
                'Human Body': [
                    'Your brain contains 86 billion neurons, each connected to thousands of others.',
                    'You produce 1.5 liters of saliva daily - enough to fill two water bottles.',
                    'Your stomach gets a new lining every 3-4 days to prevent acid from digesting it.',
                    'The human eye can distinguish about 10 million different colors.',
                    'Your bones are 5 times stronger than steel of the same density.',
                    'You lose 8 pounds of dead skin cells every year through natural shedding.',
                    'Your heart beats 100,000 times daily and pumps 2,000 gallons of blood.',
                    'You have the same number of neck vertebrae as a giraffe - exactly seven.',
                    'You blink 17,000 times per day, with each blink lasting 0.3 seconds.',
                    'Your liver can regenerate itself completely even if 75% is removed.',
                    'Stomach acid is strong enough to dissolve metal but doesn\'t harm healthy stomach lining.',
                    'Your lungs contain 300-500 million tiny air sacs called alveoli.',
                    'The human body contains enough carbon to make 900 pencils.',
                    'Your kidneys filter 50 gallons of blood every day to produce urine.',
                    'Taste buds are replaced every 7-10 days, which is why taste preferences can change.',
                    'The human body produces 25 million new cells every second.',
                    'Your ears never stop growing throughout your entire lifetime.',
                    'The strongest muscle in the human body is the masseter (jaw muscle).',
                    'Humans are the only animals that cry emotional tears.',
                    'Your body contains enough iron to make a 3-inch nail.'
                ]
            },
            activities: {
                'Creative Arts': [
                    'Create a comic strip about your day using only stick figures and speech bubbles.',
                    'Write a haiku about the weather outside your window right now.',
                    'Design your dream house using only items you can find around you.',
                    'Compose a 30-second song using kitchen utensils as instruments.',
                    'Draw a self-portrait using your non-dominant hand.',
                    'Create a story where you\'re the main character in your favorite movie.',
                    'Make origami animals using old newspapers or magazines.',
                    'Write a letter to yourself 10 years in the future.',
                    'Create a photo collage of things that make you happy.',
                    'Invent a new dance move and give it a creative name.',
                    'Write a poem using only questions.',
                    'Design a logo for a fictional company you\'d like to start.',
                    'Create a treasure map of your neighborhood with hidden gems.',
                    'Make a flipbook animation using sticky notes.',
                    'Write a short story that takes place entirely in an elevator.',
                    'Design your own board game with simple rules.',
                    'Create a playlist that tells the story of your life.',
                    'Draw what happiness looks like to you.',
                    'Write a recipe for the perfect day.',
                    'Make a time capsule with items representing this moment.'
                ],
                'Learning Adventures': [
                    'Learn to say "hello" in 10 different languages and practice pronunciation.',
                    'Research a country you\'ve never heard of and discover 5 fascinating facts.',
                    'Learn a new skill using only YouTube tutorials for 30 minutes.',
                    'Study the night sky and identify 3 constellations visible tonight.',
                    'Learn the basics of sign language and practice common phrases.',
                    'Research your family tree and discover something new about your ancestors.',
                    'Learn about a historical event that happened on today\'s date.',
                    'Study a famous painting and learn about the artist\'s life.',
                    'Learn to identify 5 different bird species in your area.',
                    'Research an extinct animal and imagine what it would be like today.',
                    'Learn about a scientific discovery that changed the world.',
                    'Study a different culture\'s traditions and compare them to your own.',
                    'Learn about renewable energy and how it works.',
                    'Research a famous inventor and their most important creation.',
                    'Learn about the human brain and how memory works.',
                    'Study the water cycle and track water\'s journey from ocean to rain.',
                    'Learn about different types of clouds and what they predict.',
                    'Research a endangered species and what\'s being done to protect it.',
                    'Learn about the history of your hometown or city.',
                    'Study how different musical instruments produce sound.'
                ],
                'Physical Challenges': [
                    'Create an obstacle course using furniture and household items.',
                    'Learn 3 new stretches and hold each for 30 seconds.',
                    'Practice balancing on one foot for increasing amounts of time.',
                    'Do a 5-minute dance party to your favorite upbeat songs.',
                    'Try yoga poses inspired by animals (cat, dog, cobra, etc.).',
                    'Create a workout using only your body weight - no equipment needed.',
                    'Practice juggling with soft objects like socks or bean bags.',
                    'Learn to walk backwards in a straight line with your eyes closed.',
                    'Do jumping jacks while reciting the alphabet.',
                    'Practice standing up and sitting down without using your hands.',
                    'Create a hopscotch course and play for 10 minutes.',
                    'Try to touch your toes and work on improving flexibility.',
                    'Practice deep breathing exercises for relaxation.',
                    'Do wall push-ups if regular push-ups are too challenging.',
                    'Create a balance beam using tape on the floor and practice walking it.',
                    'Try planking and see how long you can hold the position.',
                    'Practice coordination by patting your head while rubbing your stomach.',
                    'Do lunges while brushing your teeth.',
                    'Create a stretching routine for when you wake up.',
                    'Practice mindful walking, focusing on each step.'
                ]
            },
            riddles: [
                {
                    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
                    answer: "A map",
                    explanation: "A map shows cities, mountains, and water bodies but doesn't contain the actual physical objects."
                },
                {
                    question: "The more you take, the more you leave behind. What am I?",
                    answer: "Footsteps",
                    explanation: "Each step you take leaves a footprint behind you."
                },
                {
                    question: "I'm tall when I'm young and short when I'm old. What am I?",
                    answer: "A candle",
                    explanation: "A candle starts tall and gets shorter as it burns down over time."
                },
                {
                    question: "What has hands but cannot clap?",
                    answer: "A clock",
                    explanation: "A clock has hands (hour and minute hands) but they cannot clap together."
                },
                {
                    question: "I have a head and a tail, but no body. What am I?",
                    answer: "A coin",
                    explanation: "Coins have a 'heads' side and a 'tails' side but no body."
                },
                {
                    question: "What gets wet while drying?",
                    answer: "A towel",
                    explanation: "A towel gets wet when it's used to dry something else."
                },
                {
                    question: "I'm light as a feather, yet the strongest person can't hold me for 5 minutes. What am I?",
                    answer: "Your breath",
                    explanation: "You can't hold your breath for very long, even though breath weighs nothing."
                },
                {
                    question: "What has one eye but cannot see?",
                    answer: "A needle",
                    explanation: "A needle has an 'eye' (the hole for thread) but cannot see."
                },
                {
                    question: "I go up but never come down. What am I?",
                    answer: "Your age",
                    explanation: "Age only increases and never decreases."
                },
                {
                    question: "What has keys but no locks, space but no room, and you can enter but not go inside?",
                    answer: "A keyboard",
                    explanation: "A keyboard has keys, a space bar, and an enter key, but no physical locks or rooms."
                }
            ],
            mathChallenges: [
                {
                    question: "If you have 3 apples and you take away 2, how many do you have?",
                    answer: "2",
                    explanation: "You took 2 apples, so you have 2 apples with you."
                },
                {
                    question: "What is 15% of 200?",
                    answer: "30",
                    explanation: "15% of 200 = 0.15 × 200 = 30"
                },
                {
                    question: "If a train travels 60 miles in 1 hour, how far will it travel in 2.5 hours?",
                    answer: "150 miles",
                    explanation: "60 miles/hour × 2.5 hours = 150 miles"
                },
                {
                    question: "What is the next number in the sequence: 2, 4, 8, 16, ?",
                    answer: "32",
                    explanation: "Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32"
                },
                {
                    question: "If you flip a coin twice, what's the probability of getting two heads?",
                    answer: "1/4 or 25%",
                    explanation: "P(HH) = P(H) × P(H) = 1/2 × 1/2 = 1/4"
                }
            ]
        };
    }

    // Load user progress from localStorage
    loadUserProgress() {
        const key = `user_progress_${this.userId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const progress = JSON.parse(stored);
                // Convert seenContent array back to Set
                if (Array.isArray(progress.seenContent)) {
                    progress.seenContent = new Set(progress.seenContent);
                } else if (!progress.seenContent) {
                    progress.seenContent = new Set();
                }
                return progress;
            } catch (e) {
                console.error('Error loading user progress:', e);
            }
        }
        
        // Initialize new user progress
        return {
            seenContent: new Set(),
            dailyStats: {},
            totalCardsViewed: 0,
            joinDate: this.today,
            lastActiveDate: this.today
        };
    }

    // Save user progress to localStorage
    saveUserProgress() {
        const key = `user_progress_${this.userId}`;
        const progressToSave = {
            ...this.userProgress,
            seenContent: Array.from(this.userProgress.seenContent) // Convert Set to Array for JSON
        };
        localStorage.setItem(key, JSON.stringify(progressToSave));
    }

    // Load today's daily cards
    loadDailyCards() {
        const key = `daily_cards_${this.userId}_${this.today}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const cards = JSON.parse(stored);
                console.log(`📋 Loaded ${cards.length} existing daily cards for today`);
                return cards;
            } catch (e) {
                console.error('Error loading daily cards:', e);
            }
        }
        
        console.log('🎯 Generating fresh daily cards for today...');
        return this.generateDailyCards();
    }

    // Generate 40 fresh cards for today
    generateDailyCards() {
        const cards = [];
        const targetCards = 40;
        
        // Convert Set back to Set if it was loaded as Array
        if (Array.isArray(this.userProgress.seenContent)) {
            this.userProgress.seenContent = new Set(this.userProgress.seenContent);
        }
        
        // Calculate content distribution for free users (40 cards total)
        const distribution = {
            funFacts: 18,      // 45% fun facts
            activities: 14,    // 35% activities  
            riddles: 3,        // 7.5% riddles
            mathChallenges: 2, // 5% math challenges
            basicGames: 3      // 7.5% basic games (all 3 games)
        };
        
        console.log('🎯 Generating content with distribution:', distribution);
        
        // Generate fun facts
        cards.push(...this.generateContentByType('funFacts', distribution.funFacts));
        
        // Generate activities
        cards.push(...this.generateContentByType('activities', distribution.activities));
        
        // Generate riddles
        cards.push(...this.generateContentByType('riddles', distribution.riddles));
        
        // Generate math challenges
        cards.push(...this.generateContentByType('mathChallenges', distribution.mathChallenges));
        
        // Generate basic games (all 3 games for free users)
        cards.push(...this.generateContentByType('basicGames', distribution.basicGames));
        
        // Shuffle the cards for variety
        this.shuffleArray(cards);
        
        // Save today's cards
        const key = `daily_cards_${this.userId}_${this.today}`;
        localStorage.setItem(key, JSON.stringify(cards));
        
        // Update user progress
        this.userProgress.lastActiveDate = this.today;
        this.userProgress.dailyStats[this.today] = {
            cardsGenerated: cards.length,
            newContentPercentage: this.calculateNewContentPercentage(cards)
        };
        this.saveUserProgress();
        
        console.log(`✅ Generated ${cards.length} daily cards with ${this.userProgress.dailyStats[this.today].newContentPercentage}% new content`);
        
        return cards;
    }

    // Generate content by type with 80% new content guarantee
    generateContentByType(type, count) {
        const cards = [];
        const pool = this.contentPools[type];
        
        if (type === 'funFacts') {
            // Handle fun facts (nested by category)
            const categories = Object.keys(pool);
            const factsPerCategory = Math.ceil(count / categories.length);
            
            for (const category of categories) {
                const categoryFacts = pool[category];
                const categoryCards = this.selectContentWithNewnessPriority(
                    categoryFacts, 
                    Math.min(factsPerCategory, categoryFacts.length),
                    `fact_${category}`
                );
                
                categoryCards.forEach(fact => {
                    cards.push({
                        type: category,
                        title: this.generateFactTitle(category),
                        description: fact.content,
                        action: 'read',
                        category: 'content',
                        contentId: fact.id,
                        isNew: fact.isNew
                    });
                });
                
                if (cards.length >= count) break;
            }
        } else if (type === 'activities') {
            // Handle activities (nested by category)
            const categories = Object.keys(pool);
            const activitiesPerCategory = Math.ceil(count / categories.length);
            
            for (const category of categories) {
                const categoryActivities = pool[category];
                const categoryCards = this.selectContentWithNewnessPriority(
                    categoryActivities,
                    Math.min(activitiesPerCategory, categoryActivities.length),
                    `activity_${category}`
                );
                
                categoryCards.forEach(activity => {
                    cards.push({
                        type: 'Activity',
                        title: this.generateActivityTitle(category),
                        description: activity.content,
                        action: 'try',
                        category: 'content',
                        contentId: activity.id,
                        isNew: activity.isNew
                    });
                });
                
                if (cards.length >= count) break;
            }
        } else if (type === 'basicGames') {
            // Handle basic games (flat array - always include all 3 games)
            const gameCards = this.contentPools.basicGames.map(game => ({
                ...game,
                contentId: `game_${game.gameType}`,
                isNew: false // Games don't count as "new" content
            }));
            cards.push(...gameCards);
        } else {
            // Handle riddles and math challenges (flat arrays)
            const selectedContent = this.selectContentWithNewnessPriority(pool, count, type);
            
            selectedContent.forEach(item => {
                if (type === 'riddles') {
                    cards.push({
                        type: 'Riddle',
                        title: 'Brain Teaser Challenge',
                        description: item.content.question,
                        answer: item.content.answer,
                        solution: item.content.explanation,
                        action: 'solve',
                        category: 'content',
                        contentId: item.id,
                        isNew: item.isNew
                    });
                } else if (type === 'mathChallenges') {
                    cards.push({
                        type: 'Math Challenge',
                        title: 'Quick Math Problem',
                        description: item.content.question,
                        answer: item.content.answer,
                        solution: item.content.explanation,
                        action: 'solve',
                        category: 'content',
                        contentId: item.id,
                        isNew: item.isNew
                    });
                }
            });
        }
        
        return cards.slice(0, count); // Ensure we don't exceed requested count
    }

    // Select content with 80% new content priority
    selectContentWithNewnessPriority(contentArray, count, prefix) {
        const selected = [];
        const unseenContent = [];
        const seenContent = [];
        
        // Separate content into seen and unseen
        contentArray.forEach((content, index) => {
            const contentId = `${prefix}_${index}`;
            const contentObj = {
                content: content,
                id: contentId,
                isNew: !this.userProgress.seenContent.has(contentId)
            };
            
            if (contentObj.isNew) {
                unseenContent.push(contentObj);
            } else {
                seenContent.push(contentObj);
            }
        });
        
        // Calculate how many new vs old content pieces to include
        const targetNewContent = Math.floor(count * 0.8); // 80% new content
        const targetOldContent = count - targetNewContent;
        
        // Shuffle arrays for randomness
        this.shuffleArray(unseenContent);
        this.shuffleArray(seenContent);
        
        // Select new content first (up to 80%)
        const newContentToAdd = Math.min(targetNewContent, unseenContent.length);
        selected.push(...unseenContent.slice(0, newContentToAdd));
        
        // Fill remaining slots with old content if needed
        const remainingSlots = count - selected.length;
        if (remainingSlots > 0) {
            selected.push(...seenContent.slice(0, remainingSlots));
        }
        
        // If we still need more content and have more new content available
        if (selected.length < count && unseenContent.length > newContentToAdd) {
            const additionalNew = Math.min(count - selected.length, unseenContent.length - newContentToAdd);
            selected.push(...unseenContent.slice(newContentToAdd, newContentToAdd + additionalNew));
        }
        
        // Mark selected content as seen
        selected.forEach(item => {
            if (item.isNew) {
                // Ensure seenContent is always a Set
                if (!this.userProgress.seenContent || !(this.userProgress.seenContent instanceof Set)) {
                    this.userProgress.seenContent = new Set();
                }
                this.userProgress.seenContent.add(item.id);
            }
        });
        
        return selected;
    }

    // Calculate percentage of new content in generated cards
    calculateNewContentPercentage(cards) {
        const newCards = cards.filter(card => card.isNew).length;
        return Math.round((newCards / cards.length) * 100);
    }

    // Utility function to shuffle array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Generate dynamic titles
    generateFactTitle(category) {
        const titles = {
            'Ancient History': ['Ancient Mysteries', 'Historical Wonders', 'Lost Civilizations', 'Ancient Secrets'],
            'Modern Science': ['Scientific Breakthrough', 'Amazing Discovery', 'Science Facts', 'Modern Marvels'],
            'Space Wonders': ['Cosmic Mysteries', 'Space Exploration', 'Universe Secrets', 'Stellar Facts'],
            'Animal Kingdom': ['Wildlife Wonders', 'Animal Mysteries', 'Nature\'s Marvels', 'Creature Features'],
            'Human Body': ['Body Mysteries', 'Human Marvels', 'Biological Wonders', 'Body Science']
        };
        
        const categoryTitles = titles[category] || ['Fun Fact'];
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }

    generateActivityTitle(category) {
        const titles = {
            'Creative Arts': ['Creative Challenge', 'Artistic Adventure', 'Creative Expression', 'Art Project'],
            'Learning Adventures': ['Learning Quest', 'Knowledge Adventure', 'Discovery Challenge', 'Educational Fun'],
            'Physical Challenges': ['Fitness Challenge', 'Physical Activity', 'Movement Fun', 'Active Challenge']
        };
        
        const categoryTitles = titles[category] || ['Activity Challenge'];
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }

    // Get appropriate image for card type
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
            'Plants & Nature': ['images/plants-nature.svg', 'images/nature-&-environment.svg'],
            'Weather & Climate': ['images/weather-climate.svg', 'images/nature-&-environment.svg'],
            
            // Riddle images with fallbacks
            'Riddle': ['images/riddle.svg', 'images/mathematics-&-logic.svg'],
            'Mystery Challenge': ['images/riddle.svg', 'images/mysteries-&-unexplained.svg'],
            'Word Puzzle': ['images/riddle.svg', 'images/word-games.svg'],
            'Logic Puzzle': ['images/riddle.svg', 'images/mathematics-&-logic.svg'],
            
            // Math Challenge images with fallbacks
            'Math Challenge': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Math Puzzle': ['images/math-challenge.svg', 'images/mathematics-&-logic.svg'],
            'Pattern Puzzle': ['images/math-challenge.svg', 'images/visual-perception.svg'],
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
            return imageList[0]; // Return the first one
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

    // Get today's cards for the user
    getTodaysCards() {
        return this.dailyCards;
    }

    // Get user statistics
    getUserStats() {
        return {
            userId: this.userId,
            totalCardsViewed: this.userProgress.totalCardsViewed,
            joinDate: this.userProgress.joinDate,
            daysActive: Object.keys(this.userProgress.dailyStats).length,
            todayStats: this.userProgress.dailyStats[this.today] || null,
            seenContentCount: this.userProgress.seenContent.size
        };
    }

    // Mark a card as viewed
    markCardAsViewed(cardId) {
        this.userProgress.totalCardsViewed++;
        this.saveUserProgress();
    }

    // Check if new daily content is available
    shouldGenerateNewContent() {
        const lastGenerated = localStorage.getItem(`daily_cards_${this.userId}_${this.today}`);
        return !lastGenerated;
    }

    // Generate a random basic game
    generateBasicGame() {
        if (!this.contentPools.basicGames || this.contentPools.basicGames.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * this.contentPools.basicGames.length);
        const game = this.contentPools.basicGames[randomIndex];
        
        return {
            ...game,
            contentId: `game_${game.gameType}_${Date.now()}`,
            isNew: false // Games don't count as "new" content
        };
    }

    // Clean up old daily cards (keep only last 7 days)
    cleanupOldCards() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`daily_cards_${this.userId}_`)) {
                const dateStr = key.split('_').pop();
                const cardDate = new Date(dateStr);
                const daysDiff = (new Date() - cardDate) / (1000 * 60 * 60 * 24);
                
                if (daysDiff > 7) {
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 Cleaned up ${keysToRemove.length} old daily card sets`);
    }
}

// Export for use in main application
window.DailyContentBackend = DailyContentBackend;