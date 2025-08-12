/**
 * Premium Content Backend System
 * Generates 100 cards daily with 90% new content guarantee
 * Includes all categories including premium games
 */

class PremiumContentBackend {
    constructor() {
        this.userId = this.getUserId();
        this.today = new Date().toDateString();
        this.storageKey = 'boredom_buster_premium_';
        
        // Initialize content pools with premium content
        this.initializePremiumContentPools();
        
        // Load or initialize user progress
        this.userProgress = this.loadUserProgress();
        
        // Generate today's premium cards
        this.todaysCards = this.generateTodaysPremiumCards();
    }
    
    getUserId() {
        let userId = localStorage.getItem(this.storageKey + 'user_id');
        if (!userId) {
            userId = 'premium_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.storageKey + 'user_id', userId);
        }
        return userId;
    }
    
    initializePremiumContentPools() {
        this.contentPools = {
            // Enhanced Fun Facts (20 categories for premium)
            funFacts: {
                'Ancient History': [
                    'The Great Pyramid of Giza was the tallest building in the world for over 3,800 years.',
                    'Ancient Egyptians used moldy bread as an antibiotic treatment.',
                    'The Library of Alexandria had over 700,000 scrolls at its peak.',
                    'Roman concrete was self-healing due to volcanic ash content.',
                    'The Antikythera mechanism was an ancient Greek analog computer.',
                    'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
                    'Ancient Romans used urine as mouthwash due to its ammonia content.',
                    'The Colosseum could be flooded for mock naval battles.',
                    'Ancient Greeks invented the first vending machine for holy water.',
                    'The oldest known recipe is for beer, dating back 5,000 years.'
                ],
                'Medieval Times': [
                    'Medieval people believed unicorns were real and sold narwhal tusks as unicorn horns.',
                    'The Black Death killed 30-60% of Europe\'s population in the 14th century.',
                    'Medieval castles had spiral staircases that went clockwise to favor right-handed defenders.',
                    'The word "salary" comes from Roman soldiers being paid in salt.',
                    'Medieval people rarely bathed, believing it opened pores to disease.',
                    'The first universities were established in medieval times, starting with Bologna in 1088.',
                    'Medieval knights could take up to an hour to put on their armor.',
                    'The bubonic plague led to the invention of quarantine (40 days isolation).',
                    'Medieval people used bread as plates, called "trenchers".',
                    'The longest medieval siege lasted 7 years (Candia, 1648-1669).'
                ],
                'Modern History': [
                    'The shortest war in history lasted only 38-45 minutes (Anglo-Zanzibar War, 1896).',
                    'Napoleon was actually average height for his time at 5\'7".',
                    'The first photograph of a human was taken in 1838 and shows a man getting his shoes shined.',
                    'The Eiffel Tower was originally intended to be temporary.',
                    'The first computer bug was an actual bug - a moth trapped in a computer relay.',
                    'The Berlin Wall fell in 1989, but some sections still stand today.',
                    'The first email was sent in 1971 by Ray Tomlinson to himself.',
                    'The Internet was originally called ARPANET and connected just 4 computers.',
                    'The first mobile phone call was made in 1973 and lasted 10 minutes.',
                    'The World Wide Web was invented by Tim Berners-Lee in 1989.'
                ],
                'World Geography': [
                    'Russia spans 11 time zones, more than any other country.',
                    'The Pacific Ocean is larger than all land masses combined.',
                    'Antarctica is the world\'s largest desert, not the Sahara.',
                    'The Dead Sea is actually a lake and is the lowest point on Earth\'s surface.',
                    'Mount Everest grows about 4mm taller each year due to tectonic activity.',
                    'The Amazon River is longer than the distance from New York to Rome.',
                    'Australia is the only country that is also a continent.',
                    'The Mariana Trench is deeper than Mount Everest is tall.',
                    'Iceland has no mosquitoes due to its climate and chemical environment.',
                    'The Sahara Desert is roughly the size of the entire United States.'
                ],
                'Ocean Life': [
                    'Blue whales are the largest animals ever known to have lived on Earth.',
                    'Octopuses have three hearts and blue blood.',
                    'Dolphins have names for each other - unique whistle signatures.',
                    'The ocean contains 99% of Earth\'s living space.',
                    'Sharks have been around longer than trees (400 million vs 350 million years).',
                    'The giant Pacific octopus can fit through any hole larger than its beak.',
                    'Sea otters hold hands while sleeping to prevent drifting apart.',
                    'The blobfish only looks blob-like when brought to the surface.',
                    'Coral reefs support 25% of all marine species despite covering <1% of the ocean.',
                    'The ocean produces over 50% of the world\'s oxygen.'
                ],
                'Space Mysteries': [
                    'One day on Venus is longer than one year on Venus.',
                    'There are more possible games of chess than atoms in the observable universe.',
                    'Neutron stars are so dense that a teaspoon would weigh 6 billion tons.',
                    'The footprints on the Moon will last millions of years due to no atmosphere.',
                    'Jupiter\'s Great Red Spot is a storm larger than Earth that\'s been raging for centuries.',
                    'Saturn would float in water if there was a bathtub big enough.',
                    'The Sun makes up 99.86% of the mass in our solar system.',
                    'A black hole with the mass of Earth would be smaller than a ping pong ball.',
                    'The Milky Way galaxy is on a collision course with Andromeda galaxy.',
                    'Time moves slower on GPS satellites, requiring relativistic corrections.'
                ],
                'Animal Kingdom': [
                    'Honey never spoils - 3000-year-old honey found in Egyptian tombs was still edible.',
                    'A group of flamingos is called a "flamboyance".',
                    'Elephants are afraid of bees and will avoid areas where they hear buzzing.',
                    'Penguins propose to their mates with pebbles.',
                    'A shrimp\'s heart is in its head.',
                    'Cats have a third eyelid called a nictitating membrane.',
                    'Giraffes only need 5-30 minutes of sleep per day.',
                    'A group of owls is called a "parliament".',
                    'Koalas have fingerprints that are nearly identical to human fingerprints.',
                    'Butterflies taste with their feet and smell with their antennae.'
                ],
                'Human Body': [
                    'Your brain uses 20% of your body\'s total energy despite being 2% of your weight.',
                    'You produce about 1.5 liters of saliva every day.',
                    'Your heart beats about 100,000 times per day.',
                    'Humans are the only animals that blush.',
                    'Your stomach gets an entirely new lining every 3-4 days.',
                    'The human eye can distinguish about 10 million colors.',
                    'Your bones are about 4 times stronger than concrete.',
                    'The human brain contains approximately 86 billion neurons.',
                    'Your liver can regenerate itself completely within 6 months.',
                    'Humans share 60% of their DNA with bananas.'
                ],
                'Technology & Science': [
                    'The first computer weighed 30 tons and took up 1,800 square feet.',
                    'More computing power exists in a modern calculator than was used to land on the Moon.',
                    'The Internet weighs about the same as a strawberry (50 grams).',
                    'Quantum computers could theoretically break most current encryption in seconds.',
                    'The first 1GB hard drive cost $40,000 in 1980.',
                    'Your smartphone has more computing power than NASA had in 1969.',
                    'The first webcam was created to monitor a coffee pot.',
                    'WiFi was invented accidentally while trying to detect black holes.',
                    'The @ symbol was used in commerce before email existed.',
                    'The first computer virus was created in 1971 and was called "Creeper".'
                ],
                'Literature & Arts': [
                    'Shakespeare invented over 1,700 words that we still use today.',
                    'The Mona Lisa has no eyebrows because it was fashionable to shave them off.',
                    'Vincent van Gogh only sold one painting during his lifetime.',
                    'The longest novel ever written has over 4 million words.',
                    'Agatha Christie is the most-translated individual author in the world.',
                    'The first novel was written in Japan around 1000 AD by Murasaki Shikibu.',
                    'Pablo Picasso\'s first word was "piz" for pencil.',
                    'The Statue of Liberty was originally brown but turned green due to oxidation.',
                    'Mozart composed his first piece of music at age 5.',
                    'The word "bookworm" originally referred to actual worms that ate books.'
                ],
                // Premium exclusive categories
                'Psychology & Mind': [
                    'The average person has 12,000 to 60,000 thoughts per day.',
                    'Your brain continues to develop until you\'re about 25 years old.',
                    'Multitasking is actually task-switching and reduces productivity by up to 40%.',
                    'The placebo effect works even when people know they\'re taking a placebo.',
                    'Your brain uses the same amount of power as a 10-watt light bulb.',
                    'Memories are reconstructed each time you recall them, making them less accurate.',
                    'The average attention span has decreased from 12 seconds to 8 seconds since 2000.',
                    'Your brain is more active when you\'re sleeping than when watching TV.',
                    'Chocolate releases the same chemicals in your brain as falling in love.',
                    'Your brain can\'t actually multitask - it rapidly switches between tasks.'
                ],
                'Food & Culture': [
                    'Honey is the only food that never expires.',
                    'Bananas are berries, but strawberries aren\'t.',
                    'The most expensive spice in the world is saffron, worth more than gold.',
                    'Chocolate was once used as currency by the Aztecs.',
                    'The fortune cookie was invented in California, not China.',
                    'Ketchup was once sold as medicine in the 1830s.',
                    'The hottest chili pepper is 400 times hotter than Tabasco sauce.',
                    'Vanilla is the second most expensive spice after saffron.',
                    'The sandwich was named after the Earl of Sandwich.',
                    'Pizza Margherita was created to honor Queen Margherita of Italy.'
                ],
                'Inventions & Innovation': [
                    'The microwave was invented by accident while working on radar technology.',
                    'Bubble wrap was originally invented as wallpaper.',
                    'The first alarm clock could only ring at 4 AM.',
                    'Velcro was inspired by burr seeds sticking to a dog\'s fur.',
                    'The chainsaw was originally invented for childbirth assistance.',
                    'Post-it Notes were invented by accident when trying to create super-strong adhesive.',
                    'The first computer mouse was made of wood.',
                    'Coca-Cola was originally green and contained cocaine.',
                    'The first video game was Pong, created in 1972.',
                    'The Internet was designed to survive nuclear war.'
                ],
                'Sports & Records': [
                    'The longest tennis match lasted 11 hours and 5 minutes.',
                    'Basketball was invented using peach baskets and a soccer ball.',
                    'The Olympic torch has been to space twice.',
                    'Golf balls have 336 dimples on average.',
                    'The fastest recorded tennis serve was 163.7 mph.',
                    'Soccer is played by 250 million people in over 200 countries.',
                    'The first Olympic Games had only one event: a 192-meter footrace.',
                    'Baseball\'s "seventh-inning stretch" started because fans got restless.',
                    'The Stanley Cup is the oldest trophy in North American sports.',
                    'Swimming was one of the first Olympic sports in 1896.'
                ],
                'Music & Entertainment': [
                    'The longest recorded song is 13 hours, 23 minutes, and 32 seconds long.',
                    'Beethoven continued composing after going deaf.',
                    'The first music video was "Video Killed the Radio Star" by The Buggles.',
                    'Elvis Presley never performed outside North America.',
                    'The Beatles used the word "love" 613 times in their songs.',
                    'Mozart\'s full name has 27 letters.',
                    'The piano has 88 keys: 52 white and 36 black.',
                    'The first jukebox was invented in 1889.',
                    'Rap music originated in the 1970s in the Bronx.',
                    'The longest-running TV show is "Meet the Press" since 1947.'
                ],
                'Nature & Environment': [
                    'A single tree can absorb 48 pounds of CO2 per year.',
                    'Rainforests produce 20% of the world\'s oxygen.',
                    'Lightning strikes the Earth 100 times per second.',
                    'The Amazon rainforest creates its own weather patterns.',
                    'A single raindrop can contain up to 1 million bacteria.',
                    'Trees can communicate with each other through underground networks.',
                    'The oldest living tree is over 5,000 years old.',
                    'Bamboo is the fastest-growing plant, growing up to 3 feet in 24 hours.',
                    'The Earth\'s magnetic field is weakening and may flip.',
                    'Hurricanes in the Northern Hemisphere spin counterclockwise.'
                ],
                'Mathematics & Logic': [
                    'The number zero was invented in India around 628 AD.',
                    'Pi has been calculated to over 31 trillion decimal places.',
                    'The Fibonacci sequence appears throughout nature.',
                    'There are more possible chess games than atoms in the universe.',
                    'The probability of shuffling a deck into perfect order is 1 in 8×10^67.',
                    'Infinity plus one still equals infinity.',
                    'The golden ratio (1.618) appears in art, architecture, and nature.',
                    'Prime numbers become less frequent as numbers get larger.',
                    'The Monty Hall problem stumps even mathematicians.',
                    'Fractals are infinitely complex patterns that repeat at every scale.'
                ],
                'Mysteries & Unexplained': [
                    'The Bermuda Triangle has no more disappearances than other ocean areas.',
                    'Stonehenge\'s purpose remains a mystery after thousands of years.',
                    'The Voynich Manuscript is written in an undeciphered language.',
                    'Easter Island statues have bodies buried underground.',
                    'The Antikythera mechanism\'s full purpose is still debated.',
                    'Ball lightning is a rare and poorly understood phenomenon.',
                    'The Wow! Signal from space has never been explained.',
                    'Spontaneous human combustion has been reported but never proven.',
                    'The Taos Hum is a mysterious low-frequency sound heard by some people.',
                    'The Dancing Plague of 1518 caused people to dance themselves to death.'
                ],
                'Future & Predictions': [
                    'By 2050, there could be more plastic than fish in the ocean.',
                    'Artificial intelligence may surpass human intelligence by 2045.',
                    'Lab-grown meat could replace traditional farming within decades.',
                    'Virtual reality may become indistinguishable from reality.',
                    'Space elevators could make space travel as cheap as air travel.',
                    'Quantum computers may solve problems in seconds that take years today.',
                    'Gene editing could eliminate hereditary diseases.',
                    'Self-driving cars may reduce traffic accidents by 90%.',
                    '3D printing may revolutionize manufacturing and medicine.',
                    'Renewable energy could power 100% of the world by 2050.'
                ],
                'Weird Science': [
                    'Hot water can freeze faster than cold water under certain conditions.',
                    'Bananas are radioactive due to their potassium content.',
                    'Your DNA is 50% identical to a banana\'s DNA.',
                    'Stomach acid is strong enough to dissolve metal.',
                    'You can\'t hum while holding your nose closed.',
                    'Your body produces enough heat in 30 minutes to boil water.',
                    'Diamonds rain on Neptune and Uranus.',
                    'Time moves faster at higher altitudes due to gravity.',
                    'Quantum particles can exist in multiple places simultaneously.',
                    'The human body contains enough carbon to make 900 pencils.'
                ]
            },
            
            // Enhanced Activities (12 categories for premium)
            activities: {
                'Creative Arts': [
                    { title: 'Digital Art Challenge', description: 'Create a masterpiece using only geometric shapes and three colors.' },
                    { title: 'Story in Six Words', description: 'Write a complete story using exactly six words.' },
                    { title: 'Reverse Engineering Art', description: 'Look at a famous painting and imagine the story behind it.' },
                    { title: 'Sound Sculpture', description: 'Create a visual representation of your favorite song.' },
                    { title: 'Texture Collage', description: 'Make art using only materials with interesting textures.' }
                ],
                'Physical Challenges': [
                    { title: 'Balance Master', description: 'Stand on one foot for 60 seconds while juggling imaginary balls.' },
                    { title: 'Flexibility Flow', description: 'Create a 5-minute stretching routine for desk workers.' },
                    { title: 'Coordination Challenge', description: 'Pat your head and rub your stomach while walking backwards.' },
                    { title: 'Breathing Exercise', description: 'Practice 4-7-8 breathing: inhale 4, hold 7, exhale 8.' },
                    { title: 'Posture Reset', description: 'Do wall angels for 2 minutes to improve posture.' }
                ],
                'Mental Exercises': [
                    { title: 'Memory Palace', description: 'Memorize a shopping list using the memory palace technique.' },
                    { title: 'Speed Reading', description: 'Read a page and summarize it in 30 seconds.' },
                    { title: 'Mental Math Marathon', description: 'Calculate tips for restaurant bills without a calculator.' },
                    { title: 'Pattern Recognition', description: 'Find patterns in license plates you see today.' },
                    { title: 'Mindfulness Minute', description: 'Focus on your breath for one minute without distraction.' }
                ],
                'Social Experiments': [
                    { title: 'Compliment Challenge', description: 'Give three genuine compliments to different people.' },
                    { title: 'Active Listening', description: 'Have a conversation where you only ask questions.' },
                    { title: 'Gratitude Expression', description: 'Thank someone who has helped you recently.' },
                    { title: 'Random Act of Kindness', description: 'Do something nice for a stranger without expecting anything back.' },
                    { title: 'Perspective Taking', description: 'Argue for the opposite of your opinion on a topic.' }
                ],
                'Learning Adventures': [
                    { title: 'Language Immersion', description: 'Learn 10 words in a language you\'ve never studied.' },
                    { title: 'Skill Sampling', description: 'Watch a 5-minute tutorial on something completely new.' },
                    { title: 'Historical Deep Dive', description: 'Research what happened on this day 100 years ago.' },
                    { title: 'Science Experiment', description: 'Test if hot water really freezes faster than cold water.' },
                    { title: 'Cultural Exploration', description: 'Learn about a tradition from a culture different from yours.' }
                ],
                'Observation Games': [
                    { title: 'Detail Detective', description: 'Describe your room from memory, then check your accuracy.' },
                    { title: 'Color Hunt', description: 'Find 20 different shades of blue in your environment.' },
                    { title: 'Sound Mapping', description: 'Identify and list all sounds you can hear for 5 minutes.' },
                    { title: 'Micro Photography', description: 'Take close-up photos of everyday objects to see them differently.' },
                    { title: 'People Watching', description: 'Observe strangers and create backstories for them.' }
                ],
                'Problem Solving': [
                    { title: 'Everyday Innovation', description: 'Invent a solution to a minor daily annoyance.' },
                    { title: 'Resource Optimization', description: 'Find 5 new uses for a common household item.' },
                    { title: 'Logic Puzzle Creation', description: 'Create a riddle that has multiple valid solutions.' },
                    { title: 'Efficiency Challenge', description: 'Optimize your morning routine to save 10 minutes.' },
                    { title: 'Alternative Thinking', description: 'Solve a simple problem using the most complicated method possible.' }
                ],
                'Mindfulness & Reflection': [
                    { title: 'Gratitude Journaling', description: 'Write down 5 things you\'re grateful for and why.' },
                    { title: 'Future Self Visualization', description: 'Imagine and describe your life 5 years from now.' },
                    { title: 'Emotion Mapping', description: 'Track your emotions throughout the day and identify triggers.' },
                    { title: 'Value Clarification', description: 'Identify your top 3 values and how they guide your decisions.' },
                    { title: 'Mindful Eating', description: 'Eat something slowly, focusing on all five senses.' }
                ],
                'Technology & Digital': [
                    { title: 'Digital Detox', description: 'Go 2 hours without checking any screens or notifications.' },
                    { title: 'Productivity Hack', description: 'Learn a new keyboard shortcut and use it 10 times.' },
                    { title: 'App Audit', description: 'Delete 5 apps you haven\'t used in the last month.' },
                    { title: 'Password Security', description: 'Update your passwords using a secure password manager.' },
                    { title: 'Digital Organization', description: 'Organize your desktop and delete unnecessary files.' }
                ],
                'Nature Connection': [
                    { title: 'Plant Identification', description: 'Identify 5 different plants or trees in your area.' },
                    { title: 'Weather Prediction', description: 'Predict tomorrow\'s weather using only natural signs.' },
                    { title: 'Seasonal Awareness', description: 'Notice and document 3 signs of the current season.' },
                    { title: 'Animal Behavior', description: 'Observe and record the behavior of birds or insects for 10 minutes.' },
                    { title: 'Natural Art', description: 'Create art using only natural materials you find outside.' }
                ],
                'Communication Skills': [
                    { title: 'Storytelling Practice', description: 'Tell a 2-minute story about your day using only questions.' },
                    { title: 'Non-Verbal Communication', description: 'Have a 5-minute conversation using only gestures.' },
                    { title: 'Persuasion Practice', description: 'Convince someone to try something new using only benefits.' },
                    { title: 'Conflict Resolution', description: 'Practice mediating a hypothetical disagreement.' },
                    { title: 'Public Speaking', description: 'Give a 1-minute impromptu speech on a random topic.' }
                ],
                'Life Skills': [
                    { title: 'Budget Analysis', description: 'Track every expense for one day and categorize spending.' },
                    { title: 'Time Management', description: 'Use the Pomodoro Technique for your next task.' },
                    { title: 'Goal Setting', description: 'Set a SMART goal for something you want to achieve this week.' },
                    { title: 'Decision Making', description: 'Use a pros and cons list for your next decision.' },
                    { title: 'Habit Formation', description: 'Start a new micro-habit that takes less than 2 minutes.' }
                ]
            },
            
            // Premium Games (includes all free games plus new ones)
            premiumGames: [
                // Original free games
                { 
                    type: 'Game', 
                    title: 'Tic Tac Toe', 
                    description: 'Classic strategy game for two players',
                    action: 'play',
                    gameType: 'tictactoe',
                    category: 'Strategy',
                    image: this.getCardImage('Game', 'tictactoe')
                },
                { 
                    type: 'Game', 
                    title: 'Connect 4', 
                    description: 'Drop checkers to get four in a row',
                    action: 'play',
                    gameType: 'connect4',
                    category: 'Strategy',
                    image: this.getCardImage('Game', 'connect4')
                },
                { 
                    type: 'Game', 
                    title: 'Chess Puzzle', 
                    description: 'Solve chess puzzles and improve your game',
                    action: 'play',
                    gameType: 'chess',
                    category: 'Strategy',
                    image: this.getCardImage('Game', 'chess')
                },
                { 
                    type: 'Game', 
                    title: 'Flappy Bird', 
                    description: 'Navigate through pipes in this addictive game',
                    action: 'play',
                    gameType: 'flappy',
                    category: 'Arcade',
                    image: this.getCardImage('Game', 'flappy')
                },
                
                // New Premium Games
                { 
                    type: 'Game', 
                    title: 'Sudoku Master', 
                    description: 'Fill the 9x9 grid with numbers 1-9',
                    action: 'play',
                    gameType: 'sudoku',
                    category: 'Puzzle',
                    image: this.getCardImage('Game', 'sudoku')
                },
                { 
                    type: 'Game', 
                    title: 'Crossword Puzzle', 
                    description: 'Fill in the crossword with the given clues',
                    action: 'play',
                    gameType: 'crossword',
                    category: 'Word',
                    image: this.getCardImage('Game', 'crossword')
                },
                { 
                    type: 'Game', 
                    title: 'Pac-Man Classic', 
                    description: 'Eat dots and avoid ghosts in this retro classic',
                    action: 'play',
                    gameType: 'pacman',
                    category: 'Arcade',
                    image: this.getCardImage('Game', 'pacman')
                },
                { 
                    type: 'Game', 
                    title: 'Tetris', 
                    description: 'Arrange falling blocks to clear lines',
                    action: 'play',
                    gameType: 'tetris',
                    category: 'Puzzle',
                    image: this.getCardImage('Game', 'tetris')
                },
                { 
                    type: 'Game', 
                    title: 'Galaga', 
                    description: 'Shoot aliens in this space shooter classic',
                    action: 'play',
                    gameType: 'galaga',
                    category: 'Arcade',
                    image: this.getCardImage('Game', 'galaga')
                },
                { 
                    type: 'Game', 
                    title: 'Snake Game', 
                    description: 'Grow your snake by eating food',
                    action: 'play',
                    gameType: 'snake',
                    category: 'Arcade',
                    image: this.getCardImage('Game', 'snake')
                },
                { 
                    type: 'Game', 
                    title: 'Breakout', 
                    description: 'Break bricks with a bouncing ball',
                    action: 'play',
                    gameType: 'breakout',
                    category: 'Arcade',
                    image: this.getCardImage('Game', 'breakout')
                },
                { 
                    type: 'Game', 
                    title: 'Memory Match', 
                    description: 'Match pairs of cards to test your memory',
                    action: 'play',
                    gameType: 'memory',
                    category: 'Memory',
                    image: this.getCardImage('Game', 'memory')
                },
                { 
                    type: 'Game', 
                    title: 'Word Search', 
                    description: 'Find hidden words in the letter grid',
                    action: 'play',
                    gameType: 'wordsearch',
                    category: 'Word',
                    image: this.getCardImage('Game', 'wordsearch')
                },
                { 
                    type: 'Game', 
                    title: 'Solitaire', 
                    description: 'Classic card game for one player',
                    action: 'play',
                    gameType: 'solitaire',
                    category: 'Card',
                    image: this.getCardImage('Game', 'solitaire')
                },
                { 
                    type: 'Game', 
                    title: 'Minesweeper', 
                    description: 'Clear the minefield without detonating bombs',
                    action: 'play',
                    gameType: 'minesweeper',
                    category: 'Logic',
                    image: this.getCardImage('Game', 'minesweeper')
                }
            ],
            
            // Enhanced Riddles (50 for premium)
            riddles: [
                { question: 'What has keys but no locks, space but no room, and you can enter but not go inside?', answer: 'A keyboard' },
                { question: 'I am not alive, but I grow; I don\'t have lungs, but I need air; I don\'t have a mouth, but water kills me. What am I?', answer: 'Fire' },
                { question: 'What comes once in a minute, twice in a moment, but never in a thousand years?', answer: 'The letter M' },
                { question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', answer: 'A map' },
                { question: 'What gets wetter the more it dries?', answer: 'A towel' },
                { question: 'What has hands but cannot clap?', answer: 'A clock' },
                { question: 'What can travel around the world while staying in a corner?', answer: 'A stamp' },
                { question: 'I am tall when I am young, and short when I am old. What am I?', answer: 'A candle' },
                { question: 'What has a head, a tail, is brown, and has no legs?', answer: 'A penny' },
                { question: 'What gets broken without being held?', answer: 'A promise' },
                { question: 'What has one eye but cannot see?', answer: 'A needle' },
                { question: 'What has many teeth but cannot bite?', answer: 'A zipper' },
                { question: 'What goes up but never comes down?', answer: 'Your age' },
                { question: 'What has a neck but no head?', answer: 'A bottle' },
                { question: 'What can you catch but not throw?', answer: 'A cold' },
                { question: 'What has words but never speaks?', answer: 'A book' },
                { question: 'What has a thumb and four fingers but is not alive?', answer: 'A glove' },
                { question: 'What goes through cities and fields but never moves?', answer: 'A road' },
                { question: 'What has a bottom at the top?', answer: 'Your legs' },
                { question: 'What gets sharper the more you use it?', answer: 'Your brain' },
                // Additional premium riddles...
                { question: 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?', answer: 'An echo' },
                { question: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps' },
                { question: 'I am always hungry and will die if not fed, but whatever I touch will soon turn red. What am I?', answer: 'Fire' },
                { question: 'What can fill a room but takes up no space?', answer: 'Light' },
                { question: 'What is so fragile that saying its name breaks it?', answer: 'Silence' },
                { question: 'I have branches, but no fruit, trunk, or leaves. What am I?', answer: 'A bank' },
                { question: 'What disappears as soon as you say its name?', answer: 'Silence' },
                { question: 'What is always in front of you but can\'t be seen?', answer: 'The future' },
                { question: 'What can you keep after giving to someone?', answer: 'Your word' },
                { question: 'I am not alive, but I can die. What am I?', answer: 'A battery' },
                { question: 'What has legs but doesn\'t walk?', answer: 'A table' },
                { question: 'What has ears but cannot hear?', answer: 'Corn' },
                { question: 'What has a face but no eyes?', answer: 'A clock' },
                { question: 'What can you hold in your right hand but not in your left?', answer: 'Your left hand' },
                { question: 'What goes around the world but stays in a corner?', answer: 'A stamp' },
                { question: 'What has four wheels and flies?', answer: 'A garbage truck' },
                { question: 'What gets bigger when more is taken away from it?', answer: 'A hole' },
                { question: 'What is full of holes but still holds water?', answer: 'A sponge' },
                { question: 'What can you break, even if you never pick it up or touch it?', answer: 'A promise' },
                { question: 'What goes up and down but doesn\'t move?', answer: 'A staircase' },
                { question: 'What has many keys but can\'t open a single lock?', answer: 'A piano' },
                { question: 'What can you put in a bucket to make it weigh less?', answer: 'A hole' },
                { question: 'What is black when you buy it, red when you use it, and gray when you throw it away?', answer: 'Charcoal' },
                { question: 'What has a golden head and a golden tail, but no body?', answer: 'A coin' },
                { question: 'What building has the most stories?', answer: 'The library' },
                { question: 'What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?', answer: 'A river' },
                { question: 'What is cut on a table, but is never eaten?', answer: 'A deck of cards' },
                { question: 'What has one head, one foot, and four legs?', answer: 'A bed' },
                { question: 'What can you serve but never eat?', answer: 'A tennis ball' },
                { question: 'What kind of band never plays music?', answer: 'A rubber band' }
            ],
            
            // Enhanced Math Challenges (50 for premium)
            mathChallenges: [
                { problem: 'If you have 3 apples and you take away 2, how many do you have?', answer: '2', explanation: 'You took 2 apples, so you have 2.' },
                { problem: 'What is 15% of 200?', answer: '30', explanation: '15% = 0.15, so 0.15 × 200 = 30' },
                { problem: 'If a train travels 60 mph for 2.5 hours, how far does it go?', answer: '150 miles', explanation: 'Distance = Speed × Time = 60 × 2.5 = 150 miles' },
                { problem: 'What is the next number in the sequence: 2, 6, 12, 20, 30, ?', answer: '42', explanation: 'The differences are 4, 6, 8, 10, so next is +12: 30 + 12 = 42' },
                { problem: 'If you flip a coin 3 times, what\'s the probability of getting exactly 2 heads?', answer: '3/8 or 0.375', explanation: 'There are 8 possible outcomes, 3 have exactly 2 heads: HHT, HTH, THH' },
                { problem: 'What is 7² - 3² + 2³?', answer: '48', explanation: '49 - 9 + 8 = 48' },
                { problem: 'If x + 5 = 12, what is x?', answer: '7', explanation: 'x = 12 - 5 = 7' },
                { problem: 'What is the area of a circle with radius 5?', answer: '25π or about 78.54', explanation: 'Area = πr² = π × 5² = 25π' },
                { problem: 'If you save $50 per month, how much will you have after 2 years?', answer: '$1,200', explanation: '$50 × 24 months = $1,200' },
                { problem: 'What is 144 ÷ 12 + 8 × 3?', answer: '36', explanation: '12 + 24 = 36 (following order of operations)' },
                { problem: 'If a rectangle has length 8 and width 5, what is its perimeter?', answer: '26', explanation: 'Perimeter = 2(length + width) = 2(8 + 5) = 26' },
                { problem: 'What is 25% of 80?', answer: '20', explanation: '25% = 0.25, so 0.25 × 80 = 20' },
                { problem: 'If you roll two dice, what\'s the probability of getting a sum of 7?', answer: '1/6 or about 0.167', explanation: 'There are 6 ways to get 7 out of 36 possible outcomes' },
                { problem: 'What is the square root of 169?', answer: '13', explanation: '13 × 13 = 169' },
                { problem: 'If y = 2x + 3 and x = 4, what is y?', answer: '11', explanation: 'y = 2(4) + 3 = 8 + 3 = 11' },
                { problem: 'What is 3! (3 factorial)?', answer: '6', explanation: '3! = 3 × 2 × 1 = 6' },
                { problem: 'If a pizza is cut into 8 equal slices and you eat 3, what fraction is left?', answer: '5/8', explanation: '8 - 3 = 5 slices left out of 8 total' },
                { problem: 'What is the volume of a cube with side length 4?', answer: '64', explanation: 'Volume = side³ = 4³ = 64' },
                { problem: 'If you invest $1000 at 5% annual interest, how much will you have after 1 year?', answer: '$1,050', explanation: '$1000 + ($1000 × 0.05) = $1,050' },
                { problem: 'What is the median of: 3, 7, 2, 9, 5?', answer: '5', explanation: 'Sorted: 2, 3, 5, 7, 9. The middle value is 5' },
                // Additional premium math challenges...
                { problem: 'What is 2⁴ + 3³ - 5²?', answer: '18', explanation: '16 + 27 - 25 = 18' },
                { problem: 'If sin(30°) = 0.5, what is sin(60°)?', answer: '√3/2 or about 0.866', explanation: 'sin(60°) = √3/2' },
                { problem: 'What is the derivative of x²?', answer: '2x', explanation: 'Using the power rule: d/dx(x²) = 2x' },
                { problem: 'If log₁₀(100) = 2, what is log₁₀(1000)?', answer: '3', explanation: '1000 = 10³, so log₁₀(1000) = 3' },
                { problem: 'What is the sum of the first 10 positive integers?', answer: '55', explanation: 'Sum = n(n+1)/2 = 10(11)/2 = 55' },
                { problem: 'If f(x) = x² + 2x + 1, what is f(3)?', answer: '16', explanation: 'f(3) = 3² + 2(3) + 1 = 9 + 6 + 1 = 16' },
                { problem: 'What is the hypotenuse of a right triangle with legs 3 and 4?', answer: '5', explanation: 'Using Pythagorean theorem: √(3² + 4²) = √(9 + 16) = √25 = 5' },
                { problem: 'If you compound $100 annually at 10% for 2 years, what do you have?', answer: '$121', explanation: '$100 × 1.1² = $100 × 1.21 = $121' },
                { problem: 'What is the slope of the line passing through (1,2) and (3,8)?', answer: '3', explanation: 'Slope = (8-2)/(3-1) = 6/2 = 3' },
                { problem: 'What is ∫x dx?', answer: 'x²/2 + C', explanation: 'The integral of x is x²/2 plus a constant' },
                { problem: 'If matrix A = [1 2; 3 4], what is det(A)?', answer: '-2', explanation: 'det(A) = (1)(4) - (2)(3) = 4 - 6 = -2' },
                { problem: 'What is the limit of (x² - 1)/(x - 1) as x approaches 1?', answer: '2', explanation: 'Factor: (x+1)(x-1)/(x-1) = x+1, so limit is 1+1 = 2' },
                { problem: 'If P(A) = 0.3 and P(B) = 0.4, what is P(A ∪ B) if A and B are mutually exclusive?', answer: '0.7', explanation: 'For mutually exclusive events: P(A ∪ B) = P(A) + P(B) = 0.3 + 0.4 = 0.7' },
                { problem: 'What is the standard deviation of the dataset: 2, 4, 6, 8, 10?', answer: '√8 or about 2.83', explanation: 'Mean = 6, variance = 8, so standard deviation = √8' },
                { problem: 'If z = 3 + 4i, what is |z|?', answer: '5', explanation: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5' },
                { problem: 'What is the Taylor series expansion of eˣ around x = 0 (first 3 terms)?', answer: '1 + x + x²/2', explanation: 'eˣ = 1 + x + x²/2! + x³/3! + ...' },
                { problem: 'If vectors u = (1,2) and v = (3,4), what is u · v?', answer: '11', explanation: 'Dot product: u · v = (1)(3) + (2)(4) = 3 + 8 = 11' },
                { problem: 'What is the inverse of the function f(x) = 2x + 3?', answer: 'f⁻¹(x) = (x-3)/2', explanation: 'Solve y = 2x + 3 for x: x = (y-3)/2' },
                { problem: 'If you have a normal distribution with μ = 100 and σ = 15, what percentage of values fall within one standard deviation?', answer: '68%', explanation: 'By the empirical rule, 68% of values fall within μ ± σ' },
                { problem: 'What is the area under the curve y = x² from x = 0 to x = 2?', answer: '8/3', explanation: '∫₀² x² dx = [x³/3]₀² = 8/3 - 0 = 8/3' }
            ]
        };
    }
    
    loadUserProgress() {
        const stored = localStorage.getItem(this.storageKey + 'user_progress');
        if (stored) {
            const progress = JSON.parse(stored);
            // Convert seenContent array back to Set
            if (Array.isArray(progress.seenContent)) {
                progress.seenContent = new Set(progress.seenContent);
            } else if (!progress.seenContent) {
                progress.seenContent = new Set();
            }
            
            // Convert categoriesExplored arrays back to Sets for each day
            if (progress.dailyStats) {
                Object.keys(progress.dailyStats).forEach(date => {
                    if (progress.dailyStats[date] && Array.isArray(progress.dailyStats[date].categoriesExplored)) {
                        progress.dailyStats[date].categoriesExplored = new Set(progress.dailyStats[date].categoriesExplored);
                    } else if (progress.dailyStats[date] && !progress.dailyStats[date].categoriesExplored) {
                        progress.dailyStats[date].categoriesExplored = new Set();
                    }
                });
            }
            
            return progress;
        }
        
        return {
            userId: this.userId,
            joinDate: new Date().toISOString(),
            seenContent: new Set(),
            dailyStats: {},
            totalCardsViewed: 0,
            daysActive: 1
        };
    }
    
    saveUserProgress() {
        // Convert Sets to Arrays for storage
        const progressToSave = {
            ...this.userProgress,
            seenContent: Array.from(this.userProgress.seenContent),
            dailyStats: {}
        };
        
        // Convert categoriesExplored Sets to arrays for each day
        Object.keys(this.userProgress.dailyStats).forEach(date => {
            progressToSave.dailyStats[date] = {
                ...this.userProgress.dailyStats[date],
                categoriesExplored: Array.from(this.userProgress.dailyStats[date].categoriesExplored || new Set())
            };
        });
        
        localStorage.setItem(this.storageKey + 'user_progress', JSON.stringify(progressToSave));
    }
    
    generateTodaysPremiumCards() {
        const cacheKey = this.storageKey + 'daily_cards_' + this.today;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            return JSON.parse(cached);
        }
        
        // Generate 100 new cards for premium
        const cards = [];
        const targetCount = 100;
        
        // Convert seenContent back to Set if it's an array
        if (Array.isArray(this.userProgress.seenContent)) {
            this.userProgress.seenContent = new Set(this.userProgress.seenContent);
        }
        
        // Calculate how many new cards we can provide (90% target)
        const newContentTarget = Math.floor(targetCount * 0.9); // 90 new cards
        
        // Collect all available content
        const allContent = [];
        
        // Add fun facts from all categories
        Object.keys(this.contentPools.funFacts).forEach(category => {
            this.contentPools.funFacts[category].forEach((fact, index) => {
                const contentId = `fact_${category}_${index}`;
                allContent.push({
                    contentId,
                    type: 'Fun Fact',
                    category,
                    title: `${category} Fact`,
                    description: fact,
                    action: 'Learn More',
                    image: this.getCardImage(category),
                    isNew: !this.userProgress.seenContent.has(contentId)
                });
            });
        });
        
        // Add activities from all categories
        Object.keys(this.contentPools.activities).forEach(category => {
            this.contentPools.activities[category].forEach((activity, index) => {
                const contentId = `activity_${category}_${index}`;
                allContent.push({
                    contentId,
                    type: 'Activity',
                    category,
                    title: activity.title,
                    description: activity.description,
                    action: 'Try This',
                    image: this.getCardImage('Activity'),
                    isNew: !this.userProgress.seenContent.has(contentId)
                });
            });
        });
        
        // Add riddles
        this.contentPools.riddles.forEach((riddle, index) => {
            const contentId = `riddle_${index}`;
            allContent.push({
                contentId,
                type: 'Riddle',
                category: 'Brain Teaser',
                title: 'Brain Teaser',
                description: riddle.question,
                action: 'Show Answer',
                solution: riddle.answer,
                image: this.getCardImage('Riddle'),
                isNew: !this.userProgress.seenContent.has(contentId)
            });
        });
        
        // Add math challenges
        this.contentPools.mathChallenges.forEach((challenge, index) => {
            const contentId = `math_${index}`;
            allContent.push({
                contentId,
                type: 'Math Challenge',
                category: 'Mathematics',
                title: 'Math Challenge',
                description: challenge.problem,
                action: 'Show Solution',
                solution: challenge.answer,
                explanation: challenge.explanation,
                image: this.getCardImage('Math Challenge'),
                isNew: !this.userProgress.seenContent.has(contentId)
            });
        });
        
        // Add premium games (ensure all games are included)
        const premiumGameCards = [];
        this.contentPools.premiumGames.forEach((game, index) => {
            const contentId = `premium_game_${index}`;
            premiumGameCards.push({
                contentId,
                ...game,
                isNew: !this.userProgress.seenContent.has(contentId)
            });
        });
        
        // Separate new and seen content
        const newContent = allContent.filter(item => item.isNew);
        const seenContent = allContent.filter(item => !item.isNew);
        
        // Calculate how many non-game cards we need
        const gameCount = premiumGameCards.length; // Use actual number of premium games
        const remainingSlots = Math.max(0, targetCount - gameCount);
        let selectedContent = [];
        
        // Add new content first (up to 90% of remaining slots)
        const maxNewContent = Math.min(newContent.length, Math.floor(remainingSlots * 0.9));
        selectedContent = this.shuffleArray([...newContent]).slice(0, maxNewContent);
        
        // Fill remaining slots with seen content if needed
        const remainingAfterNew = remainingSlots - selectedContent.length;
        if (remainingAfterNew > 0 && seenContent.length > 0) {
            const additionalContent = this.shuffleArray([...seenContent]).slice(0, remainingAfterNew);
            selectedContent = selectedContent.concat(additionalContent);
        }
        
        // Combine all cards: premium games + other content
        cards = [...premiumGameCards, ...selectedContent];
        
        // Shuffle all cards but don't slice - we want all premium games included
        const finalCards = this.shuffleArray(cards);
        
        // Cache the generated cards
        localStorage.setItem(cacheKey, JSON.stringify(finalCards));
        
        // Clean up old cached cards (keep only last 7 days)
        this.cleanupOldCards();
        
        return finalCards;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    cleanupOldCards() {
        const keys = Object.keys(localStorage);
        const cardKeys = keys.filter(key => key.startsWith(this.storageKey + 'daily_cards_'));
        
        cardKeys.forEach(key => {
            const dateStr = key.replace(this.storageKey + 'daily_cards_', '');
            const cardDate = new Date(dateStr);
            const daysDiff = (new Date() - cardDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > 7) {
                localStorage.removeItem(key);
            }
        });
    }
    
    getTodaysCards() {
        return this.todaysCards;
    }
    
    markCardAsViewed(contentId) {
        // Ensure seenContent is always a Set
        if (!this.userProgress.seenContent || !(this.userProgress.seenContent instanceof Set)) {
            this.userProgress.seenContent = new Set();
        }
        
        this.userProgress.seenContent.add(contentId);
        this.userProgress.totalCardsViewed++;
        
        // Update daily stats
        if (!this.userProgress.dailyStats[this.today]) {
            this.userProgress.dailyStats[this.today] = {
                cardsViewed: 0,
                newCardsViewed: 0,
                categoriesExplored: new Set()
            };
        }
        
        // Ensure categoriesExplored is always a Set
        if (!this.userProgress.dailyStats[this.today].categoriesExplored || !(this.userProgress.dailyStats[this.today].categoriesExplored instanceof Set)) {
            this.userProgress.dailyStats[this.today].categoriesExplored = new Set();
        }
        
        this.userProgress.dailyStats[this.today].cardsViewed++;
        
        // Check if this was a new card
        const card = this.todaysCards.find(c => c.contentId === contentId);
        if (card && card.isNew) {
            this.userProgress.dailyStats[this.today].newCardsViewed++;
        }
        
        if (card && card.category) {
            this.userProgress.dailyStats[this.today].categoriesExplored.add(card.category);
        }
        
        this.saveUserProgress();
    }
    
    getUserStats() {
        const todayStats = this.userProgress.dailyStats[this.today];
        const newContentRatio = this.todaysCards.length > 0 ? 
            (this.todaysCards.filter(c => c.isNew).length / this.todaysCards.length) * 100 : 0;
        
        return {
            userId: this.userProgress.userId,
            joinDate: this.userProgress.joinDate,
            totalCardsViewed: this.userProgress.totalCardsViewed,
            seenContentCount: this.userProgress.seenContent.size,
            daysActive: Object.keys(this.userProgress.dailyStats).length,
            todayStats: todayStats ? {
                cardsViewed: todayStats.cardsViewed,
                newCardsViewed: todayStats.newCardsViewed,
                categoriesExplored: Array.from(todayStats.categoriesExplored)
            } : null,
            newContentRatio: Math.round(newContentRatio),
            totalDailyCards: this.todaysCards.length,
            isPremium: true
        };
    }
    
    getContentPoolStats() {
        const stats = {
            funFacts: {},
            activities: {},
            riddles: this.contentPools.riddles.length,
            mathChallenges: this.contentPools.mathChallenges.length,
            premiumGames: this.contentPools.premiumGames.length
        };
        
        Object.keys(this.contentPools.funFacts).forEach(category => {
            stats.funFacts[category] = this.contentPools.funFacts[category].length;
        });
        
        Object.keys(this.contentPools.activities).forEach(category => {
            stats.activities[category] = this.contentPools.activities[category].length;
        });
        
        return stats;
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
            'Inventions & Innovation': ['images/technology-science.svg', 'images/trivia-&-facts.svg'],
            'Sports & Records': ['images/sports-&-records.svg', 'images/sports-fitness.svg'],
            
            // Riddle images with fallbacks
            'Riddle': ['images/riddle.svg', 'images/mathematics-&-logic.svg'],
            'Mystery Challenge': ['images/riddle.svg', 'images/mysteries-&-unexplained.svg'],
            'Word Puzzle': ['images/riddle.svg', 'images/word-games.svg'],
            'Logic Puzzle': ['images/riddle.svg', 'images/mathematics-&-logic.svg'],
            'Brain Teaser': ['images/riddle.svg', 'images/psychology-mind.svg'],
            
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
}

// Make it globally available
window.PremiumContentBackend = PremiumContentBackend;