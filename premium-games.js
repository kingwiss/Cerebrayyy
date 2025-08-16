/**
 * Premium Games Collection
 * Touch-optimized classic games for premium users
 */

class PremiumGames {
    constructor() {
        this.currentGame = null;
        this.gameContainer = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
    }
    
    // Add haptic feedback for touch interactions
    addHapticFeedback(intensity = 'medium') {
        if ('vibrate' in navigator) {
            const patterns = {
                'light': 10,
                'medium': 25,
                'heavy': 50
            };
            navigator.vibrate(patterns[intensity] || patterns.medium);
        }
    }
    
    initGame(gameType, container) {
        this.gameContainer = container;
        this.currentGame = gameType;
        
        switch(gameType) {
            case 'sudoku':
                this.initSudoku();
                break;
            case 'crossword':
                this.initCrossword();
                break;
            case 'pacman':
                this.initPacman();
                break;
            case 'tetris':
                this.initTetris();
                break;
            case 'galaga':
                this.initGalaga();
                break;
            case 'snake':
                this.initSnake();
                break;
            case 'breakout':
                this.initBreakout();
                break;
            case 'memory':
                this.initMemory();
                break;
            case 'wordsearch':
                this.initWordSearch();
                break;
            case 'solitaire':
                this.initSolitaire();
                break;
            case 'minesweeper':
                this.initMinesweeper();
                break;
            default:
                console.error('Unknown game type:', gameType);
        }
    }
    
    // Sudoku Game
    initSudoku() {
        const sudokuHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>🧩 Sudoku Master</h3>
                    <div class="game-controls">
                        <button class="game-btn" onclick="premiumGames.newSudoku()">New Game</button>
                        <button class="game-btn" onclick="premiumGames.solveSudoku()">Solve</button>
                        <button class="game-btn" onclick="premiumGames.checkSudoku()">Check</button>
                    </div>
                </div>
                <div class="sudoku-grid" id="sudokuGrid"></div>
                <div class="number-pad" id="numberPad">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="number-btn" data-number="${n}">${n}</button>`).join('')}
                    <button class="number-btn erase" data-number="0">✖</button>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = sudokuHTML;
        this.setupSudokuEventListeners();
        this.generateSudoku();
    }
    
    setupSudokuEventListeners() {
        const numberPad = document.getElementById('numberPad');
        const numberButtons = numberPad.querySelectorAll('.number-btn');
        
        numberButtons.forEach(button => {
            const number = parseInt(button.dataset.number);
            
            // Click event
            button.addEventListener('click', () => {
                this.addHapticFeedback('light');
                this.selectNumber(number);
            });
            
            // Touch event
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addHapticFeedback('light');
                this.selectNumber(number);
            }, { passive: false });
        });
    }
    
    generateSudoku() {
        const grid = document.getElementById('sudokuGrid');
        grid.innerHTML = '';
        
        // Generate a new random Sudoku puzzle
        const puzzle = this.createRandomSudoku();
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (puzzle[i][j] !== 0) {
                    cell.textContent = puzzle[i][j];
                    cell.classList.add('given');
                } else {
                    // Mouse events
                    cell.addEventListener('click', () => this.selectSudokuCell(cell));
                    
                    // Touch events for mobile
                    cell.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        this.selectSudokuCell(cell);
                    }, { passive: false });
                }
                
                grid.appendChild(cell);
            }
        }
        
        this.selectedNumber = 1;
        this.selectedCell = null;
    }
    
    createRandomSudoku() {
        // Start with a complete valid Sudoku grid
        const completeGrid = this.generateCompleteSudoku();
        
        // Remove numbers to create puzzle (keeping it solvable)
        const puzzle = this.removeNumbers(completeGrid);
        
        return puzzle;
    }
    
    generateCompleteSudoku() {
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Fill the grid using backtracking
        this.fillSudokuGrid(grid);
        
        return grid;
    }
    
    fillSudokuGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    // Try numbers 1-9 in random order
                    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    
                    for (let num of numbers) {
                        if (this.isValidSudokuMove(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.fillSudokuGrid(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    isValidSudokuMove(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }
        
        // Check 3x3 box
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }
        
        return true;
    }
    
    removeNumbers(completeGrid) {
        const puzzle = completeGrid.map(row => [...row]);
        const cellsToRemove = 40 + Math.floor(Math.random() * 10); // Remove 40-49 numbers
        
        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }
        
        return puzzle;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    selectSudokuCell(cell) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        this.selectedCell = cell;
        cell.classList.add('selected');
    }
    
    selectNumber(num) {
        this.selectedNumber = num;
        if (this.selectedCell && !this.selectedCell.classList.contains('given')) {
            this.selectedCell.textContent = num === 0 ? '' : num;
            this.selectedCell.classList.remove('selected');
            this.selectedCell = null;
        }
        
        // Update number pad selection
        document.querySelectorAll('.number-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');
    }
    
    // Tetris Game
    initTetris() {
        const tetrisHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>🧱 Tetris</h3>
                    <div class="game-stats">
                        <span>Score: <span id="tetrisScore">0</span></span>
                        <span>Level: <span id="tetrisLevel">1</span></span>
                        <span>Lines: <span id="tetrisLines">0</span></span>
                    </div>
                </div>
                <div class="tetris-container">
                    <canvas id="tetrisCanvas" width="300" height="600"></canvas>
                    <div class="tetris-controls">
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.rotateTetris()">🔄</button>
                        </div>
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.moveTetris('left')">⬅️</button>
                            <button class="control-btn" onclick="premiumGames.moveTetris('down')">⬇️</button>
                            <button class="control-btn" onclick="premiumGames.moveTetris('right')">➡️</button>
                        </div>
                        <div class="control-row">
                            <button class="game-btn" onclick="premiumGames.startTetris()">Start</button>
                            <button class="game-btn" onclick="premiumGames.pauseTetris()">Pause</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = tetrisHTML;
        this.setupTetris();
    }
    
    setupTetris() {
        this.tetrisCanvas = document.getElementById('tetrisCanvas');
        this.tetrisCtx = this.tetrisCanvas.getContext('2d');
        this.tetrisBoard = Array(20).fill().map(() => Array(10).fill(0));
        this.tetrisScore = 0;
        this.tetrisLevel = 1;
        this.tetrisLines = 0;
        this.tetrisGameRunning = false;
        
        // Tetris pieces
        this.tetrominoes = [
            [[[1,1,1,1]]], // I
            [[[1,1],[1,1]]], // O
            [[[0,1,0],[1,1,1]]], // T
            [[[0,1,1],[1,1,0]]], // S
            [[[1,1,0],[0,1,1]]], // Z
            [[[1,0,0],[1,1,1]]], // J
            [[[0,0,1],[1,1,1]]]  // L
        ];
        
        this.currentPiece = null;
        this.drawTetrisBoard();
    }
    
    drawTetrisBoard() {
        const ctx = this.tetrisCtx;
        const cellSize = 30;
        
        ctx.clearRect(0, 0, this.tetrisCanvas.width, this.tetrisCanvas.height);
        
        // Draw board
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.tetrisBoard[y][x]) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            ctx.fillStyle = '#2196F3';
            const piece = this.currentPiece.shape;
            for (let y = 0; y < piece.length; y++) {
                for (let x = 0; x < piece[y].length; x++) {
                    if (piece[y][x]) {
                        ctx.fillRect(
                            (this.currentPiece.x + x) * cellSize,
                            (this.currentPiece.y + y) * cellSize,
                            cellSize - 1,
                            cellSize - 1
                        );
                    }
                }
            }
        }
    }
    
    // Pac-Man Game
    initPacman() {
        const pacmanHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>👻 Pac-Man Classic</h3>
                    <div class="game-stats">
                        <span>Score: <span id="pacmanScore">0</span></span>
                        <span>Lives: <span id="pacmanLives">3</span></span>
                    </div>
                </div>
                <div class="pacman-container">
                    <canvas id="pacmanCanvas" width="400" height="400"></canvas>
                    <div class="pacman-controls">
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.movePacman('up')">⬆️</button>
                        </div>
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.movePacman('left')">⬅️</button>
                            <button class="control-btn" onclick="premiumGames.movePacman('down')">⬇️</button>
                            <button class="control-btn" onclick="premiumGames.movePacman('right')">➡️</button>
                        </div>
                        <div class="control-row">
                            <button class="game-btn" onclick="premiumGames.startPacman()">Start</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = pacmanHTML;
        this.setupPacman();
    }
    
    setupPacman() {
        this.pacmanCanvas = document.getElementById('pacmanCanvas');
        this.pacmanCtx = this.pacmanCanvas.getContext('2d');
        this.pacmanScore = 0;
        this.pacmanLives = 3;
        this.pacmanGameRunning = false;
        
        // Simple maze (1 = wall, 0 = dot, 2 = empty)
        this.pacmanMaze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
            [1,1,1,1,0,1,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
            [1,1,1,1,0,1,2,1,1,2,2,1,1,2,1,0,1,1,1,1],
            [2,2,2,2,0,2,2,1,2,2,2,2,1,2,2,0,2,2,2,2],
            [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
            [1,1,1,1,0,1,2,2,2,2,2,2,2,2,1,0,1,1,1,1],
            [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.pacman = { x: 10, y: 15, direction: 'right' };
        
        // Initialize ghosts
        this.ghosts = [
            { x: 9, y: 9, direction: 'up', color: '#FF0000' },    // Red ghost
            { x: 10, y: 9, direction: 'down', color: '#FFB8FF' }, // Pink ghost
            { x: 11, y: 9, direction: 'left', color: '#00FFFF' }, // Cyan ghost
            { x: 10, y: 10, direction: 'right', color: '#FFB852' } // Orange ghost
        ];
        
        this.drawPacmanGame();
    }
    
    drawPacmanGame() {
        const ctx = this.pacmanCtx;
        const cellSize = 20;
        
        ctx.clearRect(0, 0, this.pacmanCanvas.width, this.pacmanCanvas.height);
        
        // Draw maze
        for (let y = 0; y < this.pacmanMaze.length; y++) {
            for (let x = 0; x < this.pacmanMaze[y].length; x++) {
                if (this.pacmanMaze[y][x] === 1) {
                    ctx.fillStyle = '#0000FF';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                } else if (this.pacmanMaze[y][x] === 0) {
                    ctx.fillStyle = '#FFFF00';
                    ctx.beginPath();
                    ctx.arc(x * cellSize + cellSize/2, y * cellSize + cellSize/2, 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        
        // Draw ghosts
        this.ghosts.forEach(ghost => {
            ctx.fillStyle = ghost.color;
            ctx.beginPath();
            ctx.arc(
                ghost.x * cellSize + cellSize/2,
                ghost.y * cellSize + cellSize/2,
                cellSize/2 - 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
            
            // Draw ghost eyes
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(ghost.x * cellSize + 5, ghost.y * cellSize + 5, 3, 3);
            ctx.fillRect(ghost.x * cellSize + 12, ghost.y * cellSize + 5, 3, 3);
            ctx.fillStyle = '#000000';
            ctx.fillRect(ghost.x * cellSize + 6, ghost.y * cellSize + 6, 1, 1);
            ctx.fillRect(ghost.x * cellSize + 13, ghost.y * cellSize + 6, 1, 1);
        });
        
        // Draw Pac-Man
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(
            this.pacman.x * cellSize + cellSize/2,
            this.pacman.y * cellSize + cellSize/2,
            cellSize/2 - 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
    
    // Snake Game
    initSnake() {
        const snakeHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>🐍 Snake Game</h3>
                    <div class="game-stats">
                        <span>Score: <span id="snakeScore">0</span></span>
                        <span>High Score: <span id="snakeHighScore">0</span></span>
                    </div>
                </div>
                <div class="snake-container">
                    <canvas id="snakeCanvas" width="400" height="400"></canvas>
                    <div class="snake-controls">
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.moveSnake('up')">⬆️</button>
                        </div>
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.moveSnake('left')">⬅️</button>
                            <button class="control-btn" onclick="premiumGames.moveSnake('down')">⬇️</button>
                            <button class="control-btn" onclick="premiumGames.moveSnake('right')">➡️</button>
                        </div>
                        <div class="control-row">
                            <button class="game-btn" onclick="premiumGames.startSnake()">Start</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = snakeHTML;
        this.setupSnake();
    }
    
    setupSnake() {
        this.snakeCanvas = document.getElementById('snakeCanvas');
        this.snakeCtx = this.snakeCanvas.getContext('2d');
        this.snakeScore = 0;
        this.snakeHighScore = localStorage.getItem('snakeHighScore') || 0;
        document.getElementById('snakeHighScore').textContent = this.snakeHighScore;
        
        this.snake = [{ x: 200, y: 200 }];
        this.snakeDirection = { x: 20, y: 0 };
        this.food = this.generateSnakeFood();
        this.snakeGameRunning = false;
        
        this.drawSnakeGame();
    }
    
    generateSnakeFood() {
        return {
            x: Math.floor(Math.random() * 20) * 20,
            y: Math.floor(Math.random() * 20) * 20
        };
    }
    
    drawSnakeGame() {
        const ctx = this.snakeCtx;
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.snakeCanvas.width, this.snakeCanvas.height);
        
        // Draw snake
        ctx.fillStyle = '#0F0';
        this.snake.forEach(segment => {
            ctx.fillRect(segment.x, segment.y, 18, 18);
        });
        
        // Draw food
        ctx.fillStyle = '#F00';
        ctx.fillRect(this.food.x, this.food.y, 18, 18);
    }
    
    // Memory Match Game
    initMemory() {
        const memoryHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>🧠 Memory Match</h3>
                    <div class="game-stats">
                        <span>Moves: <span id="memoryMoves">0</span></span>
                        <span>Matches: <span id="memoryMatches">0</span></span>
                    </div>
                </div>
                <div class="memory-grid" id="memoryGrid"></div>
                <div class="game-controls">
                    <button class="game-btn" onclick="premiumGames.newMemoryGame()">New Game</button>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = memoryHTML;
        this.setupMemory();
    }
    
    setupMemory() {
        this.memoryCards = ['🎈', '🎁', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸'];
        this.memoryDeck = [...this.memoryCards, ...this.memoryCards];
        this.memoryDeck = this.shuffleArray(this.memoryDeck);
        this.memoryFlipped = [];
        this.memoryMatched = [];
        this.memoryMoves = 0;
        this.memoryMatches = 0;
        
        this.createMemoryGrid();
    }
    
    createMemoryGrid() {
        const grid = document.getElementById('memoryGrid');
        grid.innerHTML = '';
        
        this.memoryDeck.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            cardElement.innerHTML = '<div class="card-back">?</div><div class="card-front">' + card + '</div>';
            // Mouse events
            cardElement.addEventListener('click', () => {
                this.addHapticFeedback('light');
                this.flipMemoryCard(index);
            });
            
            // Touch events for mobile
            cardElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.addHapticFeedback('light');
                this.flipMemoryCard(index);
            }, { passive: false });
            grid.appendChild(cardElement);
        });
    }
    
    flipMemoryCard(index) {
        if (this.memoryFlipped.length >= 2 || this.memoryFlipped.includes(index) || this.memoryMatched.includes(index)) {
            return;
        }
        
        const card = document.querySelector(`[data-index="${index}"]`);
        card.classList.add('flipped');
        this.memoryFlipped.push(index);
        
        if (this.memoryFlipped.length === 2) {
            this.memoryMoves++;
            document.getElementById('memoryMoves').textContent = this.memoryMoves;
            
            setTimeout(() => this.checkMemoryMatch(), 1000);
        }
    }
    
    checkMemoryMatch() {
        const [first, second] = this.memoryFlipped;
        
        if (this.memoryDeck[first] === this.memoryDeck[second]) {
            this.memoryMatched.push(first, second);
            this.memoryMatches++;
            document.getElementById('memoryMatches').textContent = this.memoryMatches;
            
            if (this.memoryMatched.length === this.memoryDeck.length) {
                setTimeout(() => alert('Congratulations! You won!'), 500);
            }
        } else {
            document.querySelector(`[data-index="${first}"]`).classList.remove('flipped');
            document.querySelector(`[data-index="${second}"]`).classList.remove('flipped');
        }
        
        this.memoryFlipped = [];
    }
    
    // Utility methods for game controls
    startTetris() {
        this.addHapticFeedback('medium');
        if (!this.tetrisGameRunning) {
            this.tetrisGameRunning = true;
            this.spawnTetrisPiece();
            this.tetrisGameLoop();
        }
    }
    
    pauseTetris() {
        this.addHapticFeedback('light');
        this.tetrisGameRunning = false;
    }
    
    moveTetris(direction) {
        this.addHapticFeedback('light');
        if (!this.currentPiece) return;
        
        const newPiece = { ...this.currentPiece };
        
        switch(direction) {
            case 'left':
                newPiece.x--;
                break;
            case 'right':
                newPiece.x++;
                break;
            case 'down':
                newPiece.y++;
                break;
        }
        
        if (this.isValidMove(newPiece)) {
            this.currentPiece = newPiece;
            this.drawTetrisBoard();
        } else if (direction === 'down') {
            this.placePiece();
        }
    }
    
    rotateTetris() {
        this.addHapticFeedback('light');
        if (!this.currentPiece) return;
        
        const rotatedShape = this.rotateMatrix(this.currentPiece.shape);
        const newPiece = { ...this.currentPiece, shape: rotatedShape };
        
        if (this.isValidMove(newPiece)) {
            this.currentPiece = newPiece;
            this.drawTetrisBoard();
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    isValidMove(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    
                    if (newX < 0 || newX >= 10 || newY >= 20) {
                        return false;
                    }
                    
                    if (newY >= 0 && this.tetrisBoard[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    
                    if (boardY >= 0) {
                        this.tetrisBoard[boardY][boardX] = 1;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnTetrisPiece();
        
        if (!this.isValidMove(this.currentPiece)) {
            this.tetrisGameRunning = false;
            alert(`Game Over! Score: ${this.tetrisScore}`);
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.tetrisBoard.length - 1; y >= 0; y--) {
            if (this.tetrisBoard[y].every(cell => cell === 1)) {
                this.tetrisBoard.splice(y, 1);
                this.tetrisBoard.unshift(Array(10).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.tetrisLines += linesCleared;
            this.tetrisScore += linesCleared * 100 * this.tetrisLevel;
            this.tetrisLevel = Math.floor(this.tetrisLines / 10) + 1;
            
            document.getElementById('tetrisScore').textContent = this.tetrisScore;
            document.getElementById('tetrisLevel').textContent = this.tetrisLevel;
            document.getElementById('tetrisLines').textContent = this.tetrisLines;
        }
    }
    
    spawnTetrisPiece() {
        const randomPiece = this.tetrominoes[Math.floor(Math.random() * this.tetrominoes.length)];
        this.currentPiece = {
            shape: randomPiece[0],
            x: 4,
            y: 0
        };
    }
    
    tetrisGameLoop() {
        if (!this.tetrisGameRunning) return;
        
        if (this.currentPiece) {
            this.moveTetris('down');
        }
        
        const speed = Math.max(100, 1000 - (this.tetrisLevel - 1) * 100);
        setTimeout(() => this.tetrisGameLoop(), speed);
    }
    
    startSnake() {
        this.addHapticFeedback('medium');
        if (!this.snakeGameRunning) {
            this.snakeGameRunning = true;
            this.snakeGameLoop();
        }
    }
    
    moveSnake(direction) {
        this.addHapticFeedback('light');
        switch(direction) {
            case 'up':
                this.snakeDirection = { x: 0, y: -20 };
                break;
            case 'down':
                this.snakeDirection = { x: 0, y: 20 };
                break;
            case 'left':
                this.snakeDirection = { x: -20, y: 0 };
                break;
            case 'right':
                this.snakeDirection = { x: 20, y: 0 };
                break;
        }
    }
    
    snakeGameLoop() {
        if (!this.snakeGameRunning) return;
        
        const head = { ...this.snake[0] };
        head.x += this.snakeDirection.x;
        head.y += this.snakeDirection.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
            this.snakeGameRunning = false;
            alert('Game Over! Score: ' + this.snakeScore);
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.snakeGameRunning = false;
            alert('Game Over! Score: ' + this.snakeScore);
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snakeScore += 10;
            document.getElementById('snakeScore').textContent = this.snakeScore;
            this.food = this.generateSnakeFood();
            
            if (this.snakeScore > this.snakeHighScore) {
                this.snakeHighScore = this.snakeScore;
                localStorage.setItem('snakeHighScore', this.snakeHighScore);
                document.getElementById('snakeHighScore').textContent = this.snakeHighScore;
            }
        } else {
            this.snake.pop();
        }
        
        this.drawSnakeGame();
        setTimeout(() => this.snakeGameLoop(), 150);
    }
    
    startPacman() {
        this.addHapticFeedback('medium');
        if (!this.pacmanGameRunning) {
            this.pacmanGameRunning = true;
            this.pacmanGameLoop();
        }
    }
    
    pacmanGameLoop() {
        if (!this.pacmanGameRunning) return;
        
        this.moveGhosts();
        this.checkCollisions();
        this.drawPacmanGame();
        
        setTimeout(() => this.pacmanGameLoop(), 200);
    }
    
    moveGhosts() {
        this.ghosts.forEach(ghost => {
            const directions = ['up', 'down', 'left', 'right'];
            let validMoves = [];
            
            directions.forEach(dir => {
                const newPos = { ...ghost };
                switch(dir) {
                    case 'up': newPos.y--; break;
                    case 'down': newPos.y++; break;
                    case 'left': newPos.x--; break;
                    case 'right': newPos.x++; break;
                }
                
                if (this.isValidPacmanMove(newPos)) {
                    validMoves.push(dir);
                }
            });
            
            if (validMoves.length > 0) {
                // Simple AI: move towards Pac-Man occasionally
                if (Math.random() < 0.3) {
                    const dx = this.pacman.x - ghost.x;
                    const dy = this.pacman.y - ghost.y;
                    
                    if (Math.abs(dx) > Math.abs(dy)) {
                        const preferredDir = dx > 0 ? 'right' : 'left';
                        if (validMoves.includes(preferredDir)) {
                            ghost.direction = preferredDir;
                        }
                    } else {
                        const preferredDir = dy > 0 ? 'down' : 'up';
                        if (validMoves.includes(preferredDir)) {
                            ghost.direction = preferredDir;
                        }
                    }
                }
                
                // If current direction is still valid, continue
                if (!validMoves.includes(ghost.direction)) {
                    ghost.direction = validMoves[Math.floor(Math.random() * validMoves.length)];
                }
                
                // Move ghost
                switch(ghost.direction) {
                    case 'up': ghost.y--; break;
                    case 'down': ghost.y++; break;
                    case 'left': ghost.x--; break;
                    case 'right': ghost.x++; break;
                }
            }
        });
    }
    
    checkCollisions() {
        this.ghosts.forEach(ghost => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                this.pacmanLives--;
                document.getElementById('pacmanLives').textContent = this.pacmanLives;
                
                if (this.pacmanLives <= 0) {
                    this.pacmanGameRunning = false;
                    alert(`Game Over! Final Score: ${this.pacmanScore}`);
                } else {
                    // Reset positions
                    this.pacman = { x: 10, y: 15, direction: 'right' };
                    this.ghosts = [
                        { x: 9, y: 9, direction: 'up', color: '#FF0000' },
                        { x: 10, y: 9, direction: 'down', color: '#FFB8FF' },
                        { x: 11, y: 9, direction: 'left', color: '#00FFFF' },
                        { x: 10, y: 10, direction: 'right', color: '#FFB852' }
                    ];
                }
            }
        });
    }
    
    isValidPacmanMove(pos) {
        return pos.y >= 0 && pos.y < this.pacmanMaze.length &&
               pos.x >= 0 && pos.x < this.pacmanMaze[0].length &&
               this.pacmanMaze[pos.y][pos.x] !== 1;
    }
    
    movePacman(direction) {
        this.addHapticFeedback('light');
        const newPos = { ...this.pacman };
        
        switch(direction) {
            case 'up':
                newPos.y--;
                break;
            case 'down':
                newPos.y++;
                break;
            case 'left':
                newPos.x--;
                break;
            case 'right':
                newPos.x++;
                break;
        }
        
        // Check if move is valid
        if (this.isValidPacmanMove(newPos)) {
            // Eat dot
            if (this.pacmanMaze[newPos.y][newPos.x] === 0) {
                this.pacmanMaze[newPos.y][newPos.x] = 2;
                this.pacmanScore += 10;
                document.getElementById('pacmanScore').textContent = this.pacmanScore;
            }
            
            this.pacman = newPos;
            this.pacman.direction = direction;
            this.drawPacmanGame();
        }
    }
    
    newMemoryGame() {
        this.addHapticFeedback('medium');
        this.setupMemory();
    }
    
    newSudoku() {
        this.addHapticFeedback('medium');
        this.generateSudoku();
    }
    
    solveSudoku() {
        this.addHapticFeedback('light');
        // Simple solve (show solution)
        alert('Sudoku solver feature coming soon!');
    }
    
    checkSudoku() {
        this.addHapticFeedback('light');
        // Simple validation
        alert('Sudoku checker feature coming soon!');
    }
    
    // Add touch support
    addTouchSupport() {
        if (this.gameContainer) {
            this.gameContainer.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            });
            
            this.gameContainer.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].clientX;
                this.touchEndY = e.changedTouches[0].clientY;
                this.handleSwipe();
            });
        }
    }
    
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.handleSwipeDirection('right');
                } else {
                    this.handleSwipeDirection('left');
                }
            }
        } else {
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.handleSwipeDirection('down');
                } else {
                    this.handleSwipeDirection('up');
                }
            }
        }
    }
    
    handleSwipeDirection(direction) {
        switch(this.currentGame) {
            case 'tetris':
                this.moveTetris(direction);
                break;
            case 'snake':
                this.moveSnake(direction);
                break;
            case 'pacman':
                this.movePacman(direction);
                break;
        }
    }
    
    // Placeholder methods for other games
    initCrossword() {
        const crosswordHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>📝 Crossword Puzzle</h3>
                    <div class="game-stats">
                        <span>Completed: <span id="crosswordCompleted">0</span>/<span id="crosswordTotal">0</span></span>
                        <span>Time: <span id="crosswordTime">00:00</span></span>
                    </div>
                </div>
                <div class="crossword-container">
                    <div class="crossword-grid" id="crosswordGrid"></div>
                    <div class="crossword-clues">
                        <div class="clues-section">
                            <h4>Across</h4>
                            <div id="acrossClues" class="clues-list"></div>
                        </div>
                        <div class="clues-section">
                            <h4>Down</h4>
                            <div id="downClues" class="clues-list"></div>
                        </div>
                    </div>
                    <div class="crossword-controls">
                    <button class="game-btn" onclick="premiumGames.newCrossword()">New Puzzle</button>
                    <button class="game-btn" onclick="premiumGames.checkCrossword()">Check</button>
                    <button class="game-btn" onclick="premiumGames.clearCrossword()">Clear</button>
                    <button class="game-btn mobile-keyboard-btn" onclick="premiumGames.showMobileKeyboard()" style="display: none;">
                        <i class="fas fa-keyboard"></i> Keyboard
                    </button>
                </div>
                
                <!-- Mobile Virtual Keyboard -->
                <div class="mobile-keyboard" id="mobileKeyboard" style="display: none;">
                    <div class="keyboard-row">
                        <button class="key-btn" onclick="premiumGames.insertLetter('Q')">Q</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('W')">W</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('E')">E</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('R')">R</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('T')">T</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('Y')">Y</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('U')">U</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('I')">I</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('O')">O</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('P')">P</button>
                    </div>
                    <div class="keyboard-row">
                        <button class="key-btn" onclick="premiumGames.insertLetter('A')">A</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('S')">S</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('D')">D</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('F')">F</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('G')">G</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('H')">H</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('J')">J</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('K')">K</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('L')">L</button>
                    </div>
                    <div class="keyboard-row">
                        <button class="key-btn" onclick="premiumGames.insertLetter('Z')">Z</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('X')">X</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('C')">C</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('V')">V</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('B')">B</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('N')">N</button>
                        <button class="key-btn" onclick="premiumGames.insertLetter('M')">M</button>
                        <button class="key-btn backspace-btn" onclick="premiumGames.deleteLetter()">
                            <i class="fas fa-backspace"></i>
                        </button>
                    </div>
                    <div class="keyboard-row">
                        <button class="key-btn hide-keyboard-btn" onclick="premiumGames.hideMobileKeyboard()">
                            <i class="fas fa-times"></i> Hide
                        </button>
                    </div>
                </div>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = crosswordHTML;
        this.setupCrossword();
        this.setupMobileKeyboard();
    }
    
    setupCrossword() {
        this.crosswordSize = 10;
        this.crosswordGrid = [];
        this.crosswordWords = [];
        this.crosswordStartTime = null;
        this.crosswordTimer = null;
        this.selectedCell = null;
        this.selectedWord = null;
        
        // Word database with clues
        this.crosswordWordBank = [
            { word: 'CAT', clue: 'Feline pet' },
            { word: 'DOG', clue: 'Canine companion' },
            { word: 'SUN', clue: 'Solar star' },
            { word: 'MOON', clue: 'Night light' },
            { word: 'STAR', clue: 'Celestial body' },
            { word: 'TREE', clue: 'Woody plant' },
            { word: 'BIRD', clue: 'Flying animal' },
            { word: 'FISH', clue: 'Aquatic animal' },
            { word: 'BOOK', clue: 'Reading material' },
            { word: 'GAME', clue: 'Fun activity' },
            { word: 'TIME', clue: 'What clocks measure' },
            { word: 'LOVE', clue: 'Strong affection' },
            { word: 'LIFE', clue: 'Existence' },
            { word: 'HOME', clue: 'Where you live' },
            { word: 'WORK', clue: 'Job or task' },
            { word: 'PLAY', clue: 'Have fun' },
            { word: 'FOOD', clue: 'What you eat' },
            { word: 'WATER', clue: 'Clear liquid' },
            { word: 'FIRE', clue: 'Hot flame' },
            { word: 'EARTH', clue: 'Our planet' },
            { word: 'MUSIC', clue: 'Sounds in harmony' },
            { word: 'DANCE', clue: 'Rhythmic movement' },
            { word: 'SMILE', clue: 'Happy expression' },
            { word: 'DREAM', clue: 'Sleep vision' },
            { word: 'PEACE', clue: 'Harmony' },
            { word: 'HAPPY', clue: 'Joyful feeling' },
            { word: 'LIGHT', clue: 'Brightness' },
            { word: 'OCEAN', clue: 'Large body of water' },
            { word: 'RIVER', clue: 'Flowing water' },
            { word: 'MOUNTAIN', clue: 'High landform' },
            { word: 'FLOWER', clue: 'Colorful bloom' },
            { word: 'GARDEN', clue: 'Plant growing area' },
            { word: 'FRIEND', clue: 'Close companion' },
            { word: 'FAMILY', clue: 'Related people' },
            { word: 'SCHOOL', clue: 'Learning place' },
            { word: 'TEACHER', clue: 'Education guide' },
            { word: 'STUDENT', clue: 'Learning person' },
            { word: 'COMPUTER', clue: 'Electronic device' },
            { word: 'PHONE', clue: 'Communication device' },
            { word: 'CAMERA', clue: 'Picture taking device' },
            
            // Additional variety words
            { word: 'APPLE', clue: 'Red fruit' },
            { word: 'BREAD', clue: 'Baked food' },
            { word: 'CHAIR', clue: 'Seat furniture' },
            { word: 'DOOR', clue: 'Room entrance' },
            { word: 'ELEPHANT', clue: 'Large mammal' },
            { word: 'FOREST', clue: 'Many trees' },
            { word: 'GUITAR', clue: 'String instrument' },
            { word: 'HOUSE', clue: 'Building to live in' },
            { word: 'ICE', clue: 'Frozen water' },
            { word: 'JUMP', clue: 'Leap up' },
            { word: 'KING', clue: 'Royal ruler' },
            { word: 'LION', clue: 'Big cat' },
            { word: 'MAGIC', clue: 'Mysterious power' },
            { word: 'NIGHT', clue: 'Dark time' },
            { word: 'ORANGE', clue: 'Citrus fruit' },
            { word: 'PAPER', clue: 'Writing material' },
            { word: 'QUEEN', clue: 'Female ruler' },
            { word: 'RAIN', clue: 'Water from sky' },
            { word: 'SNOW', clue: 'White precipitation' },
            { word: 'TABLE', clue: 'Flat surface' },
            { word: 'UMBRELLA', clue: 'Rain protection' },
            { word: 'VOICE', clue: 'Sound from mouth' },
            { word: 'WIND', clue: 'Moving air' },
            { word: 'YELLOW', clue: 'Bright color' },
            { word: 'ZEBRA', clue: 'Striped animal' },
            { word: 'PIZZA', clue: 'Italian dish' },
            { word: 'ROBOT', clue: 'Mechanical being' },
            { word: 'SPACE', clue: 'Outer area' },
            { word: 'TRAIN', clue: 'Rail transport' },
            { word: 'BEACH', clue: 'Sandy shore' },
            { word: 'CLOUD', clue: 'Sky formation' },
            { word: 'DANCE', clue: 'Rhythmic movement' },
            { word: 'ENERGY', clue: 'Power force' },
            { word: 'FUTURE', clue: 'Time ahead' },
            { word: 'GLOBE', clue: 'World sphere' },
            { word: 'HEART', clue: 'Love symbol' },
            { word: 'ISLAND', clue: 'Land in water' },
            { word: 'JEWEL', clue: 'Precious stone' },
            { word: 'KNIFE', clue: 'Cutting tool' },
            { word: 'LAUGH', clue: 'Happy sound' },
            { word: 'MONEY', clue: 'Currency' },
            { word: 'NATURE', clue: 'Natural world' },
            { word: 'OCEAN', clue: 'Large sea' },
            { word: 'PLANET', clue: 'Celestial body' },
            { word: 'QUICK', clue: 'Very fast' },
            { word: 'ROCKET', clue: 'Space vehicle' },
            { word: 'STORM', clue: 'Bad weather' },
            { word: 'TOWER', clue: 'Tall structure' },
            { word: 'UNIVERSE', clue: 'All of space' },
            { word: 'VICTORY', clue: 'Winning result' },
            { word: 'WISDOM', clue: 'Deep knowledge' }
        ];
        
        this.generateCrosswordPuzzle();
        this.createCrosswordGrid();
        this.displayClues();
        this.startCrosswordTimer();
    }

    generateCrosswordPuzzle() {
        let attempts = 0;
        const maxGenerationAttempts = 5;
        
        while (attempts < maxGenerationAttempts) {
            // Initialize empty grid
            this.crosswordPuzzle = {
                grid: Array(this.crosswordSize).fill().map(() => Array(this.crosswordSize).fill('')),
                words: []
            };
            
            // Shuffle word bank and select random words with time-based randomization
            const timeSeed = Date.now() + Math.random() * 1000;
            const shuffledWords = [...this.crosswordWordBank]
                .sort(() => (Math.sin(timeSeed * Math.random()) * 10000) % 1 - 0.5)
                .sort(() => Math.random() - 0.5); // Double shuffle for better randomization
            const selectedWords = shuffledWords.slice(0, Math.min(10, shuffledWords.length));
            
            const placedWords = this.attemptWordPlacement(selectedWords);
            
            // If we successfully placed at least 4 words, we have a good puzzle
            if (placedWords.length >= 4) {
                this.crosswordPuzzle.words = placedWords;
                return;
            }
            
            attempts++;
        }
        
        // Fallback: create a simple puzzle if generation fails
        this.createFallbackPuzzle();
    }
    
    attemptWordPlacement(selectedWords) {
        let placedWords = [];
        let attempts = 0;
        const maxAttempts = 100;
        
        // Place first word in the center
        if (selectedWords.length > 0) {
            const firstWord = selectedWords[0];
            const startRow = Math.floor(this.crosswordSize / 2);
            const startCol = Math.floor((this.crosswordSize - firstWord.word.length) / 2);
            
            if (this.canPlaceWordInCrossword(firstWord.word, startRow, startCol, 'across')) {
                this.placeWordInCrossword(firstWord.word, startRow, startCol, 'across');
                placedWords.push({
                    word: firstWord.word,
                    clue: firstWord.clue,
                    row: startRow,
                    col: startCol,
                    direction: 'across'
                });
            }
        }
        
        // Try to place remaining words
        for (let i = 1; i < selectedWords.length && attempts < maxAttempts; i++) {
            const wordData = selectedWords[i];
            let placed = false;
            
            // Try to intersect with existing words
            for (const placedWord of placedWords) {
                if (placed) break;
                
                // Try to find intersection points
                for (let j = 0; j < placedWord.word.length; j++) {
                    for (let k = 0; k < wordData.word.length; k++) {
                        if (placedWord.word[j] === wordData.word[k]) {
                            // Found potential intersection
                            let newRow, newCol, newDirection;
                            
                            if (placedWord.direction === 'across') {
                                // Place new word vertically
                                newDirection = 'down';
                                newRow = placedWord.row - k;
                                newCol = placedWord.col + j;
                            } else {
                                // Place new word horizontally
                                newDirection = 'across';
                                newRow = placedWord.row + j;
                                newCol = placedWord.col - k;
                            }
                            
                            if (this.canPlaceWordInCrossword(wordData.word, newRow, newCol, newDirection)) {
                                this.placeWordInCrossword(wordData.word, newRow, newCol, newDirection);
                                placedWords.push({
                                    word: wordData.word,
                                    clue: wordData.clue,
                                    row: newRow,
                                    col: newCol,
                                    direction: newDirection
                                });
                                placed = true;
                                break;
                            }
                        }
                    }
                    if (placed) break;
                }
            }
            
            if (!placed) {
                attempts++;
            }
        }
        
        return placedWords;
    }
    
    createFallbackPuzzle() {
        // Create a simple crossword with guaranteed placement
        this.crosswordPuzzle = {
            grid: Array(this.crosswordSize).fill().map(() => Array(this.crosswordSize).fill('')),
            words: []
        };
        
        const simpleWords = [
            { word: 'CAT', clue: 'Feline pet' },
            { word: 'DOG', clue: 'Canine companion' },
            { word: 'SUN', clue: 'Solar star' },
            { word: 'MOON', clue: 'Night light' }
        ];
        
        // Place words in a simple cross pattern
        const centerRow = Math.floor(this.crosswordSize / 2);
        const centerCol = Math.floor(this.crosswordSize / 2);
        
        // Place first word horizontally
        if (simpleWords[0]) {
            const word = simpleWords[0];
            const startCol = centerCol - Math.floor(word.word.length / 2);
            this.placeWordInCrossword(word.word, centerRow, startCol, 'across');
            this.crosswordPuzzle.words.push({
                word: word.word,
                clue: word.clue,
                row: centerRow,
                col: startCol,
                direction: 'across'
            });
        }
        
        // Place second word vertically intersecting the first
        if (simpleWords[1]) {
            const word = simpleWords[1];
            const startRow = centerRow - Math.floor(word.word.length / 2);
            this.placeWordInCrossword(word.word, startRow, centerCol, 'down');
            this.crosswordPuzzle.words.push({
                word: word.word,
                clue: word.clue,
                row: startRow,
                col: centerCol,
                direction: 'down'
            });
        }
    }

    canPlaceWordInCrossword(word, row, col, direction) {
        // Check bounds
        if (direction === 'across') {
            if (col + word.length > this.crosswordSize || row < 0 || row >= this.crosswordSize) {
                return false;
            }
        } else {
            if (row + word.length > this.crosswordSize || col < 0 || col >= this.crosswordSize) {
                return false;
            }
        }
        
        // Check for conflicts
        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            const existingLetter = this.crosswordPuzzle.grid[currentRow][currentCol];
            if (existingLetter !== '' && existingLetter !== word[i]) {
                return false;
            }
        }
        
        // Check adjacent cells for conflicts (no adjacent words)
        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            // Check perpendicular adjacent cells
            if (direction === 'across') {
                // Check above and below
                if (currentRow > 0 && this.crosswordPuzzle.grid[currentRow - 1][currentCol] !== '' && 
                    this.crosswordPuzzle.grid[currentRow][currentCol] === '') return false;
                if (currentRow < this.crosswordSize - 1 && this.crosswordPuzzle.grid[currentRow + 1][currentCol] !== '' && 
                    this.crosswordPuzzle.grid[currentRow][currentCol] === '') return false;
            } else {
                // Check left and right
                if (currentCol > 0 && this.crosswordPuzzle.grid[currentRow][currentCol - 1] !== '' && 
                    this.crosswordPuzzle.grid[currentRow][currentCol] === '') return false;
                if (currentCol < this.crosswordSize - 1 && this.crosswordPuzzle.grid[currentRow][currentCol + 1] !== '' && 
                    this.crosswordPuzzle.grid[currentRow][currentCol] === '') return false;
            }
        }
        
        return true;
    }

    placeWordInCrossword(word, row, col, direction) {
        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            this.crosswordPuzzle.grid[currentRow][currentCol] = word[i];
        }
    }
    
    createCrosswordGrid() {
        const gridContainer = document.getElementById('crosswordGrid');
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${this.crosswordSize}, 1fr)`;
        
        this.crosswordGrid = [];
        
        for (let row = 0; row < this.crosswordSize; row++) {
            this.crosswordGrid[row] = [];
            for (let col = 0; col < this.crosswordSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'crossword-cell';
                
                if (this.crosswordPuzzle.grid[row][col] !== '') {
                    cell.className += ' active-cell';
                    cell.contentEditable = true;
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    cell.dataset.answer = this.crosswordPuzzle.grid[row][col];
                    
                    // Add number for word starts
                    const wordNumber = this.getWordNumber(row, col);
                    if (wordNumber) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        numberSpan.textContent = wordNumber;
                        cell.appendChild(numberSpan);
                    }
                    
                    // Enhanced touch and click handling
                    cell.addEventListener('click', (e) => {
                        this.addHapticFeedback('light');
                        this.selectCell(e.target);
                    });
                    cell.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        this.addHapticFeedback('light');
                        this.selectCell(e.target);
                    });
                    cell.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    cell.addEventListener('input', (e) => this.handleCellInput(e));
                    cell.addEventListener('keydown', (e) => this.handleCellKeydown(e));
                    
                    // Touch-specific optimizations
                    cell.style.touchAction = 'manipulation';
                    cell.style.userSelect = 'none';
                    cell.style.webkitUserSelect = 'none';
                    cell.style.webkitTouchCallout = 'none';
                } else {
                    cell.className += ' blocked-cell';
                }
                
                gridContainer.appendChild(cell);
                this.crosswordGrid[row][col] = cell;
            }
        }
        
        this.updateStats();
    }
    
    getWordNumber(row, col) {
        // Find if this cell is the start of any word
        for (let i = 0; i < this.crosswordPuzzle.words.length; i++) {
            const word = this.crosswordPuzzle.words[i];
            if (word.row === row && word.col === col) {
                return i + 1;
            }
        }
        return null;
    }
    
    displayClues() {
        const acrossClues = document.getElementById('acrossClues');
        const downClues = document.getElementById('downClues');
        
        acrossClues.innerHTML = '';
        downClues.innerHTML = '';
        
        // Separate across and down words
        const acrossWords = this.crosswordPuzzle.words.filter(word => word.direction === 'across');
        const downWords = this.crosswordPuzzle.words.filter(word => word.direction === 'down');
        
        // Display across clues
        acrossWords.forEach((word, index) => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'clue-item';
            clueDiv.innerHTML = `<strong>${this.getWordNumber(word.row, word.col)}.</strong> ${word.clue}`;
            clueDiv.addEventListener('click', () => {
                this.addHapticFeedback('light');
                this.selectWord(word);
            });
                clueDiv.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.addHapticFeedback('light');
                    this.selectWord(word);
                });
                clueDiv.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                // Touch optimizations for clue items
                clueDiv.style.touchAction = 'manipulation';
                clueDiv.style.userSelect = 'none';
                clueDiv.style.webkitUserSelect = 'none';
                clueDiv.style.cursor = 'pointer';
            acrossClues.appendChild(clueDiv);
        });
        
        // Display down clues
        downWords.forEach((word, index) => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'clue-item';
            clueDiv.innerHTML = `<strong>${this.getWordNumber(word.row, word.col)}.</strong> ${word.clue}`;
            clueDiv.addEventListener('click', () => {
                this.addHapticFeedback('light');
                this.selectWord(word);
            });
            clueDiv.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.addHapticFeedback('light');
                this.selectWord(word);
            });
            clueDiv.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            // Touch optimizations for clue items
            clueDiv.style.touchAction = 'manipulation';
            clueDiv.style.userSelect = 'none';
            clueDiv.style.webkitUserSelect = 'none';
            clueDiv.style.cursor = 'pointer';
            downClues.appendChild(clueDiv);
        });
    }
    
    selectCell(cell) {
        // Remove previous selection
        document.querySelectorAll('.crossword-cell.selected').forEach(c => {
            c.classList.remove('selected');
        });
        
        if (cell.classList.contains('active-cell')) {
            cell.classList.add('selected');
            this.selectedCell = cell;
            
            // Better mobile focus handling
            if ('ontouchstart' in window) {
                // On mobile, use a timeout to ensure proper focus
                setTimeout(() => {
                    cell.focus();
                    // Trigger mobile keyboard
                    if (cell.setSelectionRange) {
                        cell.setSelectionRange(0, cell.textContent.length);
                    }
                }, 100);
            } else {
                cell.focus();
            }
        }
    }
    
    selectWord(word) {
        // Clear previous word selection
        document.querySelectorAll('.crossword-cell.word-selected').forEach(c => {
            c.classList.remove('word-selected');
        });
        
        // Highlight word cells
        for (let i = 0; i < word.word.length; i++) {
            let row, col;
            if (word.direction === 'across') {
                row = word.row;
                col = word.col + i;
            } else {
                row = word.row + i;
                col = word.col;
            }
            
            if (this.crosswordGrid[row] && this.crosswordGrid[row][col]) {
                this.crosswordGrid[row][col].classList.add('word-selected');
            }
        }
        
        this.selectedWord = word;
        
        // Focus on first cell of the word
        const firstCell = this.crosswordGrid[word.row][word.col];
        this.selectCell(firstCell);
    }
    
    handleCellInput(event) {
        const cell = event.target;
        let value = cell.textContent.toUpperCase();
        
        // Filter out non-letter characters
        value = value.replace(/[^A-Z]/g, '');
        
        if (value.length > 1) {
            cell.textContent = value.charAt(value.length - 1);
        } else if (value.length === 1) {
            cell.textContent = value;
            // Auto-advance to next cell with slight delay for mobile
            const delay = 'ontouchstart' in window ? 150 : 100;
            setTimeout(() => this.moveToNextCell(cell), delay);
        } else {
            cell.textContent = '';
        }
        
        // Prevent mobile keyboard from closing
        if ('ontouchstart' in window) {
            event.preventDefault();
            cell.focus();
        }
        
        this.updateStats();
    }
    
    handleCellKeydown(event) {
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.moveToCell(row - 1, col);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.moveToCell(row + 1, col);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.moveToCell(row, col - 1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.moveToCell(row, col + 1);
                break;
            case 'Backspace':
                if (cell.textContent === '') {
                    this.moveToPreviousCell(cell);
                }
                break;
        }
    }
    
    moveToCell(row, col) {
        if (row >= 0 && row < this.crosswordSize && col >= 0 && col < this.crosswordSize) {
            const targetCell = this.crosswordGrid[row][col];
            if (targetCell.classList.contains('active-cell')) {
                this.selectCell(targetCell);
            }
        }
    }
    
    moveToNextCell(currentCell) {
        const row = parseInt(currentCell.dataset.row);
        const col = parseInt(currentCell.dataset.col);
        
        if (this.selectedWord) {
            const wordIndex = this.selectedWord.direction === 'across' ? 
                col - this.selectedWord.col : row - this.selectedWord.row;
            
            if (wordIndex < this.selectedWord.word.length - 1) {
                const nextRow = this.selectedWord.direction === 'across' ? 
                    row : row + 1;
                const nextCol = this.selectedWord.direction === 'across' ? 
                    col + 1 : col;
                this.moveToCell(nextRow, nextCol);
            }
        } else {
            this.moveToCell(row, col + 1);
        }
    }
    
    moveToPreviousCell(currentCell) {
        const row = parseInt(currentCell.dataset.row);
        const col = parseInt(currentCell.dataset.col);
        
        if (this.selectedWord) {
            const wordIndex = this.selectedWord.direction === 'across' ? 
                col - this.selectedWord.col : row - this.selectedWord.row;
            
            if (wordIndex > 0) {
                const prevRow = this.selectedWord.direction === 'across' ? 
                    row : row - 1;
                const prevCol = this.selectedWord.direction === 'across' ? 
                    col - 1 : col;
                this.moveToCell(prevRow, prevCol);
            }
        } else {
            this.moveToCell(row, col - 1);
        }
    }
    
    updateStats() {
        const activeCells = document.querySelectorAll('.crossword-cell.active-cell');
        const filledCells = Array.from(activeCells).filter(cell => cell.textContent.trim() !== '');
        
        document.getElementById('crosswordCompleted').textContent = filledCells.length;
        document.getElementById('crosswordTotal').textContent = activeCells.length;
    }
    
    startCrosswordTimer() {
        this.crosswordStartTime = Date.now();
        this.crosswordTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.crosswordStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('crosswordTime').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    checkCrossword() {
        let correct = 0;
        let total = 0;
        
        document.querySelectorAll('.crossword-cell.active-cell').forEach(cell => {
            total++;
            const userAnswer = cell.textContent.toUpperCase();
            const correctAnswer = cell.dataset.answer;
            
            if (userAnswer === correctAnswer) {
                correct++;
                cell.classList.add('correct');
                cell.classList.remove('incorrect');
            } else if (userAnswer !== '') {
                cell.classList.add('incorrect');
                cell.classList.remove('correct');
            } else {
                cell.classList.remove('correct', 'incorrect');
            }
        });
        
        if (correct === total) {
            clearInterval(this.crosswordTimer);
            const elapsed = Math.floor((Date.now() - this.crosswordStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            alert(`Congratulations! You completed the crossword in ${minutes}:${seconds.toString().padStart(2, '0')}!`);
        } else {
            alert(`${correct} out of ${total} letters correct. Keep going!`);
        }
    }
    
    clearCrossword() {
        document.querySelectorAll('.crossword-cell.active-cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('correct', 'incorrect');
        });
        this.updateStats();
    }
    
    newCrossword() {
        // Clear any existing timer
        clearInterval(this.crosswordTimer);
        
        // Force complete reset of game state
        this.crosswordGrid = [];
        this.crosswordWords = [];
        this.selectedCell = null;
        this.selectedWord = null;
        this.crosswordStartTime = null;
        this.crosswordTimer = null;
        
        // Clear any visual selections
        document.querySelectorAll('.crossword-cell.selected, .crossword-cell.word-selected, .crossword-cell.correct, .crossword-cell.incorrect').forEach(cell => {
            cell.classList.remove('selected', 'word-selected', 'correct', 'incorrect');
        });
        
        // Generate completely new puzzle
        this.setupCrossword();
        
        // Show mobile keyboard button on touch devices
        this.setupMobileKeyboard();
    }
    
    setupMobileKeyboard() {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const keyboardBtn = document.querySelector('.mobile-keyboard-btn');
        
        if (isMobile && keyboardBtn) {
            keyboardBtn.style.display = 'inline-block';
        }
    }
    
    showMobileKeyboard() {
        this.addHapticFeedback('light');
        const keyboard = document.getElementById('mobileKeyboard');
        if (keyboard) {
            keyboard.style.display = 'block';
        }
    }
    
    hideMobileKeyboard() {
        this.addHapticFeedback('light');
        const keyboard = document.getElementById('mobileKeyboard');
        if (keyboard) {
            keyboard.style.display = 'none';
        }
    }
    
    insertLetter(letter) {
        this.addHapticFeedback('light');
        if (this.selectedCell && this.selectedCell.classList.contains('active-cell')) {
            this.selectedCell.textContent = letter;
            this.updateStats();
            
            // Auto-advance to next cell
            setTimeout(() => this.moveToNextCell(this.selectedCell), 100);
        }
    }
    
    deleteLetter() {
        this.addHapticFeedback('light');
        if (this.selectedCell && this.selectedCell.classList.contains('active-cell')) {
            if (this.selectedCell.textContent === '') {
                // If current cell is empty, move to previous cell and delete
                this.moveToPreviousCell(this.selectedCell);
                if (this.selectedCell) {
                    this.selectedCell.textContent = '';
                }
            } else {
                // Delete current cell content
                this.selectedCell.textContent = '';
            }
            this.updateStats();
        }
    }
    
    initGalaga() {
        const galagaHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>🚀 Galaga</h3>
                    <div class="game-stats">
                        <span>Score: <span id="galagaScore">0</span></span>
                        <span>Lives: <span id="galagaLives">3</span></span>
                        <span>Level: <span id="galagaLevel">1</span></span>
                    </div>
                </div>
                <div class="galaga-container">
                    <canvas id="galagaCanvas" width="400" height="500"></canvas>
                    <div class="galaga-controls">
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.moveShip('left')">⬅️</button>
                            <button class="control-btn" onclick="premiumGames.shoot()">🔥</button>
                            <button class="control-btn" onclick="premiumGames.moveShip('right')">➡️</button>
                        </div>
                        <div class="control-row">
                            <button class="game-btn" onclick="premiumGames.startGalaga()">Start</button>
                            <button class="game-btn" onclick="premiumGames.pauseGalaga()">Pause</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = galagaHTML;
        this.setupGalaga();
    }
    
    setupGalaga() {
        this.galagaCanvas = document.getElementById('galagaCanvas');
        this.galagaCtx = this.galagaCanvas.getContext('2d');
        this.galagaScore = 0;
        this.galagaLives = 3;
        this.galagaLevel = 1;
        this.galagaGameRunning = false;
        
        // Player ship
        this.ship = {
            x: 200,
            y: 450,
            width: 30,
            height: 20,
            speed: 5
        };
        
        // Bullets
        this.bullets = [];
        this.bulletSpeed = 7;
        
        // Enemies
        this.enemies = [];
        this.enemyBullets = [];
        this.enemySpeed = 1;
        
        this.createEnemies();
        this.drawGalaga();
    }
    
    createEnemies() {
        this.enemies = [];
        const rows = 4;
        const cols = 8;
        const enemyWidth = 30;
        const enemyHeight = 20;
        const spacing = 40;
        const startX = 50;
        const startY = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: enemyWidth,
                    height: enemyHeight,
                    alive: true,
                    type: row % 2 === 0 ? 'bee' : 'butterfly',
                    direction: 1,
                    shootTimer: Math.random() * 200
                });
            }
        }
    }
    
    drawGalaga() {
        const ctx = this.galagaCtx;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.galagaCanvas.width, this.galagaCanvas.height);
        
        // Draw stars background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.galagaCanvas.width, this.galagaCanvas.height);
        
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(Math.random() * this.galagaCanvas.width, Math.random() * this.galagaCanvas.height, 1, 1);
        }
        
        // Draw ship
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.ship.x, this.ship.y, this.ship.width, this.ship.height);
        
        // Draw ship details
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(this.ship.x + 10, this.ship.y - 5, 10, 5);
        
        // Draw bullets
        ctx.fillStyle = '#FFFF00';
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 3, 8);
        });
        
        // Draw enemy bullets
        ctx.fillStyle = '#FF0000';
        this.enemyBullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 3, 8);
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                if (enemy.type === 'bee') {
                    ctx.fillStyle = '#FFFF00';
                } else {
                    ctx.fillStyle = '#FF6B6B';
                }
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Add enemy details
                ctx.fillStyle = '#FFF';
                ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
                ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
            }
        });
    }
    
    startGalaga() {
        this.addHapticFeedback('medium');
        if (!this.galagaGameRunning) {
            this.galagaGameRunning = true;
            this.galagaGameLoop();
        }
    }
    
    pauseGalaga() {
        this.addHapticFeedback('light');
        this.galagaGameRunning = false;
    }
    
    moveShip(direction) {
        this.addHapticFeedback('light');
        if (direction === 'left' && this.ship.x > 0) {
            this.ship.x -= this.ship.speed;
        } else if (direction === 'right' && this.ship.x < this.galagaCanvas.width - this.ship.width) {
            this.ship.x += this.ship.speed;
        }
        this.drawGalaga();
    }
    
    shoot() {
        this.addHapticFeedback('light');
        this.bullets.push({
            x: this.ship.x + this.ship.width / 2,
            y: this.ship.y,
            width: 3,
            height: 8
        });
    }
    
    galagaGameLoop() {
        if (!this.galagaGameRunning) return;
        
        // Move bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= this.bulletSpeed;
            return bullet.y > 0;
        });
        
        // Move enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += this.bulletSpeed;
            return bullet.y < this.galagaCanvas.height;
        });
        
        // Move enemies
        let changeDirection = false;
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.x += this.enemySpeed * enemy.direction;
                
                if (enemy.x <= 0 || enemy.x >= this.galagaCanvas.width - enemy.width) {
                    changeDirection = true;
                }
                
                // Enemy shooting
                enemy.shootTimer--;
                if (enemy.shootTimer <= 0 && Math.random() < 0.001) {
                    this.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 3,
                        height: 8
                    });
                    enemy.shootTimer = Math.random() * 200 + 100;
                }
            }
        });
        
        if (changeDirection) {
            this.enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.direction *= -1;
                    enemy.y += 20;
                }
            });
        }
        
        // Check bullet-enemy collisions
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.alive &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    enemy.alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    this.galagaScore += enemy.type === 'butterfly' ? 20 : 10;
                    document.getElementById('galagaScore').textContent = this.galagaScore;
                }
            });
        });
        
        // Check enemy bullet-ship collisions
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < this.ship.x + this.ship.width &&
                bullet.x + bullet.width > this.ship.x &&
                bullet.y < this.ship.y + this.ship.height &&
                bullet.y + bullet.height > this.ship.y) {
                
                this.enemyBullets.splice(bulletIndex, 1);
                this.galagaLives--;
                document.getElementById('galagaLives').textContent = this.galagaLives;
                
                if (this.galagaLives <= 0) {
                    this.galagaGameRunning = false;
                    alert('Game Over! Final Score: ' + this.galagaScore);
                    return;
                }
            }
        });
        
        // Check if all enemies are destroyed
        const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
        if (aliveEnemies.length === 0) {
            this.nextGalagaLevel();
            return;
        }
        
        // Check if enemies reached the ship
        const enemyReachedShip = this.enemies.some(enemy => 
            enemy.alive && enemy.y + enemy.height >= this.ship.y
        );
        
        if (enemyReachedShip) {
            this.galagaGameRunning = false;
            alert('Game Over! Enemies reached your ship!');
            return;
        }
        
        this.drawGalaga();
        requestAnimationFrame(() => this.galagaGameLoop());
    }
    
    nextGalagaLevel() {
        this.galagaLevel++;
        document.getElementById('galagaLevel').textContent = this.galagaLevel;
        
        // Increase enemy speed
        this.enemySpeed += 0.5;
        
        // Clear bullets
        this.bullets = [];
        this.enemyBullets = [];
        
        // Create new enemies
        this.createEnemies();
        
        alert('Level ' + this.galagaLevel + '! Enemies are faster!');
    }
    
    initBreakout() {
        const breakoutHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>🏓 Breakout</h3>
                    <div class="game-stats">
                        <span>Score: <span id="breakoutScore">0</span></span>
                        <span>Lives: <span id="breakoutLives">3</span></span>
                        <span>Level: <span id="breakoutLevel">1</span></span>
                    </div>
                </div>
                <div class="breakout-container">
                    <canvas id="breakoutCanvas" width="400" height="500"></canvas>
                    <div class="breakout-controls">
                        <div class="control-row">
                            <button class="control-btn" onclick="premiumGames.movePaddle('left')">⬅️</button>
                            <button class="control-btn" onclick="premiumGames.movePaddle('right')">➡️</button>
                        </div>
                        <div class="control-row">
                            <button class="game-btn" onclick="premiumGames.startBreakout()">Start</button>
                            <button class="game-btn" onclick="premiumGames.pauseBreakout()">Pause</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = breakoutHTML;
        this.setupBreakout();
    }
    
    setupBreakout() {
        this.breakoutCanvas = document.getElementById('breakoutCanvas');
        this.breakoutCtx = this.breakoutCanvas.getContext('2d');
        this.breakoutScore = 0;
        this.breakoutLives = 3;
        this.breakoutLevel = 1;
        this.breakoutGameRunning = false;
        
        // Paddle
        this.paddle = {
            x: 175,
            y: 450,
            width: 50,
            height: 10,
            speed: 7
        };
        
        // Ball
        this.ball = {
            x: 200,
            y: 300,
            radius: 8,
            dx: 3,
            dy: -3,
            speed: 3
        };
        
        // Bricks
        this.bricks = [];
        this.brickRows = 5;
        this.brickCols = 8;
        this.brickWidth = 45;
        this.brickHeight = 20;
        this.brickPadding = 5;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 10;
        
        this.createBricks();
        this.drawBreakout();
    }
    
    createBricks() {
        this.bricks = [];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        
        for (let r = 0; r < this.brickRows; r++) {
            this.bricks[r] = [];
            for (let c = 0; c < this.brickCols; c++) {
                this.bricks[r][c] = {
                    x: c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft,
                    y: r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop,
                    status: 1,
                    color: colors[r % colors.length]
                };
            }
        }
    }
    
    drawBreakout() {
        const ctx = this.breakoutCtx;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.breakoutCanvas.width, this.breakoutCanvas.height);
        
        // Draw bricks
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                if (this.bricks[r][c].status === 1) {
                    const brick = this.bricks[r][c];
                    ctx.fillStyle = brick.color;
                    ctx.fillRect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                    
                    // Add border
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                }
            }
        }
        
        // Draw paddle
        ctx.fillStyle = '#333';
        ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Draw ball
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    startBreakout() {
        this.addHapticFeedback('medium');
        if (!this.breakoutGameRunning) {
            this.breakoutGameRunning = true;
            this.breakoutGameLoop();
        }
    }
    
    pauseBreakout() {
        this.addHapticFeedback('light');
        this.breakoutGameRunning = false;
    }
    
    movePaddle(direction) {
        this.addHapticFeedback('light');
        if (direction === 'left' && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        } else if (direction === 'right' && this.paddle.x < this.breakoutCanvas.width - this.paddle.width) {
            this.paddle.x += this.paddle.speed;
        }
        this.drawBreakout();
    }
    
    breakoutGameLoop() {
        if (!this.breakoutGameRunning) return;
        
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with walls
        if (this.ball.x + this.ball.radius > this.breakoutCanvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }
        
        // Ball collision with paddle
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            
            // Calculate bounce angle based on where ball hits paddle
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
            
            this.ball.dx = Math.sin(angle) * this.ball.speed;
            this.ball.dy = -Math.abs(Math.cos(angle) * this.ball.speed);
        }
        
        // Ball collision with bricks
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                const brick = this.bricks[r][c];
                if (brick.status === 1) {
                    if (this.ball.x > brick.x &&
                        this.ball.x < brick.x + this.brickWidth &&
                        this.ball.y > brick.y &&
                        this.ball.y < brick.y + this.brickHeight) {
                        
                        this.ball.dy = -this.ball.dy;
                        brick.status = 0;
                        this.breakoutScore += 10;
                        document.getElementById('breakoutScore').textContent = this.breakoutScore;
                        
                        // Check if all bricks are destroyed
                        if (this.checkBreakoutWin()) {
                            this.nextBreakoutLevel();
                            return;
                        }
                    }
                }
            }
        }
        
        // Ball falls below paddle
        if (this.ball.y + this.ball.radius > this.breakoutCanvas.height) {
            this.breakoutLives--;
            document.getElementById('breakoutLives').textContent = this.breakoutLives;
            
            if (this.breakoutLives <= 0) {
                this.breakoutGameRunning = false;
                alert('Game Over! Final Score: ' + this.breakoutScore);
                return;
            } else {
                // Reset ball position
                this.ball.x = 200;
                this.ball.y = 300;
                this.ball.dx = 3;
                this.ball.dy = -3;
            }
        }
        
        this.drawBreakout();
        requestAnimationFrame(() => this.breakoutGameLoop());
    }
    
    checkBreakoutWin() {
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                if (this.bricks[r][c].status === 1) {
                    return false;
                }
            }
        }
        return true;
    }
    
    nextBreakoutLevel() {
        this.breakoutLevel++;
        document.getElementById('breakoutLevel').textContent = this.breakoutLevel;
        
        // Increase ball speed
        this.ball.speed += 0.5;
        this.ball.dx = this.ball.dx > 0 ? this.ball.speed : -this.ball.speed;
        this.ball.dy = this.ball.dy > 0 ? this.ball.speed : -this.ball.speed;
        
        // Reset ball position
        this.ball.x = 200;
        this.ball.y = 300;
        
        // Recreate bricks
        this.createBricks();
        
        alert('Level ' + this.breakoutLevel + '! Ball speed increased!');
    }
    
    initWordSearch() {
        const wordSearchHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>🔍 Word Search</h3>
                    <div class="game-stats">
                        <span>Found: <span id="wordsFound">0</span>/<span id="totalWords">0</span></span>
                        <span>Time: <span id="wordSearchTime">00:00</span></span>
                    </div>
                </div>
                <div class="word-search-container">
                    <div class="word-search-grid" id="wordSearchGrid"></div>
                    <div class="word-list">
                        <h4>Find these words:</h4>
                        <div id="wordList"></div>
                        <button class="game-btn" onclick="premiumGames.newWordSearch()">New Game</button>
                    </div>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = wordSearchHTML;
        this.setupWordSearch();
    }
    
    setupWordSearch() {
        this.wordSearchGrid = [];
        this.wordSearchSize = 12;
        // Generate new words only if this is the initial setup (no words exist)
        if (!this.wordsToFind || this.wordsToFind.length === 0) {
            this.wordsToFind = this.generateRandomWordList();
        }
        // Initialize arrays if they don't exist, but don't reset them if they do
        if (!this.foundWords) {
            this.foundWords = [];
        }
        if (!this.selectedCells) {
            this.selectedCells = [];
        }
        if (this.isSelecting === undefined) {
            this.isSelecting = false;
        }
        if (this.wordSearchTimer === undefined) {
            this.wordSearchTimer = 0;
        }
        this.wordSearchInterval = null;
        
        this.createWordSearchGrid();
        this.placeWords();
        this.fillEmptySpaces();
        this.renderWordSearchGrid();
        this.renderWordList();
        this.startWordSearchTimer();
    }
    
    generateRandomWordList() {
        const themes = {
            technology: ['JAVASCRIPT', 'PYTHON', 'CODING', 'COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'DIGITAL'],
            animals: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'KANGAROO', 'OCTOPUS', 'CHEETAH'],
            nature: ['MOUNTAIN', 'OCEAN', 'FOREST', 'DESERT', 'RAINBOW', 'THUNDER', 'SUNSHINE', 'WATERFALL'],
            food: ['CHOCOLATE', 'STRAWBERRY', 'PIZZA', 'SANDWICH', 'BANANA', 'COOKIE', 'PASTA', 'BURGER'],
            sports: ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'SWIMMING', 'CYCLING', 'RUNNING', 'SOCCER', 'BASEBALL'],
            space: ['GALAXY', 'PLANET', 'ASTEROID', 'COMET', 'NEBULA', 'SATELLITE', 'ROCKET', 'UNIVERSE'],
            music: ['GUITAR', 'PIANO', 'VIOLIN', 'DRUMS', 'TRUMPET', 'SAXOPHONE', 'MELODY', 'HARMONY'],
            colors: ['CRIMSON', 'TURQUOISE', 'MAGENTA', 'EMERALD', 'VIOLET', 'ORANGE', 'YELLOW', 'PURPLE'],
            countries: ['AUSTRALIA', 'CANADA', 'BRAZIL', 'JAPAN', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN'],
            weather: ['SUNSHINE', 'RAINBOW', 'THUNDER', 'LIGHTNING', 'SNOWFLAKE', 'HURRICANE', 'TORNADO', 'BLIZZARD']
        };
        
        // Randomly select a theme
        const themeNames = Object.keys(themes);
        const selectedTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
        const themeWords = themes[selectedTheme];
        
        // Select 6-8 words from the theme
        const wordCount = 6 + Math.floor(Math.random() * 3);
        const shuffledWords = this.shuffleArray([...themeWords]);
        const selectedWords = shuffledWords.slice(0, wordCount);
        
        // Update the theme display
        setTimeout(() => {
            const headerElement = document.querySelector('.game-header h3');
            if (headerElement) {
                headerElement.innerHTML = `🔍 Word Search - ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)} Theme`;
            }
        }, 100);
        
        return selectedWords;
    }
    
    createWordSearchGrid() {
        this.wordSearchGrid = [];
        for (let i = 0; i < this.wordSearchSize; i++) {
            this.wordSearchGrid[i] = [];
            for (let j = 0; j < this.wordSearchSize; j++) {
                this.wordSearchGrid[i][j] = {
                    letter: '',
                    isWordPart: false,
                    wordIndex: -1
                };
            }
        }
    }
    
    placeWords() {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down-right
            [-1, 1],  // diagonal up-right
            [0, -1],  // horizontal backwards
            [-1, 0],  // vertical backwards
            [-1, -1], // diagonal up-left
            [1, -1]   // diagonal down-left
        ];
        
        this.wordsToFind.forEach((word, wordIndex) => {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const startRow = Math.floor(Math.random() * this.wordSearchSize);
                const startCol = Math.floor(Math.random() * this.wordSearchSize);
                
                if (this.canPlaceWord(word, startRow, startCol, direction)) {
                    this.placeWord(word, startRow, startCol, direction, wordIndex);
                    placed = true;
                }
                attempts++;
            }
        });
    }
    
    canPlaceWord(word, row, col, direction) {
        for (let i = 0; i < word.length; i++) {
            const newRow = row + direction[0] * i;
            const newCol = col + direction[1] * i;
            
            if (newRow < 0 || newRow >= this.wordSearchSize || 
                newCol < 0 || newCol >= this.wordSearchSize) {
                return false;
            }
            
            const cell = this.wordSearchGrid[newRow][newCol];
            if (cell.letter !== '' && cell.letter !== word[i]) {
                return false;
            }
        }
        return true;
    }
    
    placeWord(word, row, col, direction, wordIndex) {
        for (let i = 0; i < word.length; i++) {
            const newRow = row + direction[0] * i;
            const newCol = col + direction[1] * i;
            
            this.wordSearchGrid[newRow][newCol] = {
                letter: word[i],
                isWordPart: true,
                wordIndex: wordIndex
            };
        }
    }
    
    fillEmptySpaces() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < this.wordSearchSize; i++) {
            for (let j = 0; j < this.wordSearchSize; j++) {
                if (this.wordSearchGrid[i][j].letter === '') {
                    this.wordSearchGrid[i][j].letter = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
    
    renderWordSearchGrid() {
        const gridElement = document.getElementById('wordSearchGrid');
        gridElement.innerHTML = '';
        gridElement.style.gridTemplateColumns = `repeat(${this.wordSearchSize}, 1fr)`;
        
        for (let i = 0; i < this.wordSearchSize; i++) {
            for (let j = 0; j < this.wordSearchSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'word-search-cell';
                cell.textContent = this.wordSearchGrid[i][j].letter;
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // Mouse events
                cell.addEventListener('mousedown', (e) => {
                    this.addHapticFeedback('light');
                    this.startWordSelection(e);
                });
                cell.addEventListener('mouseover', (e) => this.continueWordSelection(e));
                cell.addEventListener('mouseup', (e) => this.endWordSelection(e));
                
                // Touch events for mobile
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Prevent scrolling
                    this.addHapticFeedback('light');
                    this.startWordSelection(e);
                }, { passive: false });
                
                cell.addEventListener('touchmove', (e) => {
                    e.preventDefault(); // Prevent scrolling
                    const touch = e.touches[0];
                    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (elementBelow && elementBelow.classList.contains('word-search-cell')) {
                        this.continueWordSelection({ target: elementBelow });
                    }
                }, { passive: false });
                
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.endWordSelection(e);
                }, { passive: false });
                
                gridElement.appendChild(cell);
            }
        }
    }
    
    renderWordList() {
        const wordListElement = document.getElementById('wordList');
        wordListElement.innerHTML = '';
        
        this.wordsToFind.forEach((word, index) => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            wordElement.textContent = word;
            wordElement.id = `word-${index}`;
            
            if (this.foundWords.includes(index)) {
                wordElement.classList.add('found');
            }
            
            wordListElement.appendChild(wordElement);
        });
        
        document.getElementById('totalWords').textContent = this.wordsToFind.length;
        document.getElementById('wordsFound').textContent = this.foundWords.length;
    }
    
    startWordSelection(e) {
        this.isSelecting = true;
        this.selectedCells = [e.target];
        e.target.classList.add('selected');
    }
    
    continueWordSelection(e) {
        if (this.isSelecting) {
            // Clear previous selection
            this.selectedCells.forEach(cell => cell.classList.remove('selected'));
            
            // Calculate new selection
            const startCell = this.selectedCells[0];
            const endCell = e.target;
            this.selectedCells = this.getLineCells(startCell, endCell);
            
            // Highlight new selection
            this.selectedCells.forEach(cell => cell.classList.add('selected'));
        }
    }
    
    endWordSelection(e) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.checkSelectedWord();
        }
    }
    
    getLineCells(startCell, endCell) {
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        const endRow = parseInt(endCell.dataset.row);
        const endCol = parseInt(endCell.dataset.col);
        
        const cells = [];
        const rowDiff = endRow - startRow;
        const colDiff = endCol - startCol;
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        
        if (steps === 0) {
            return [startCell];
        }
        
        const rowStep = rowDiff / steps;
        const colStep = colDiff / steps;
        
        for (let i = 0; i <= steps; i++) {
            const row = Math.round(startRow + rowStep * i);
            const col = Math.round(startCol + colStep * i);
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cells.push(cell);
        }
        
        return cells;
    }
    
    checkSelectedWord() {
        const selectedWord = this.selectedCells.map(cell => cell.textContent).join('');
        const reversedWord = selectedWord.split('').reverse().join('');
        
        this.wordsToFind.forEach((word, index) => {
            if ((selectedWord === word || reversedWord === word) && !this.foundWords.includes(index)) {
                this.foundWords.push(index);
                this.selectedCells.forEach(cell => cell.classList.add('found-word'));
                document.getElementById(`word-${index}`).classList.add('found');
                
                if (this.foundWords.length === this.wordsToFind.length) {
                    clearInterval(this.wordSearchInterval);
                    setTimeout(() => {
                        alert(`Congratulations! You found all words in ${this.formatTime(this.wordSearchTimer)}!`);
                    }, 500);
                }
            }
        });
        
        // Clear selection
        this.selectedCells.forEach(cell => cell.classList.remove('selected'));
        this.selectedCells = [];
        this.renderWordList();
    }
    
    startWordSearchTimer() {
        this.wordSearchTimer = 0;
        this.wordSearchInterval = setInterval(() => {
            this.wordSearchTimer++;
            document.getElementById('wordSearchTime').textContent = this.formatTime(this.wordSearchTimer);
        }, 1000);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    newWordSearch() {
        this.addHapticFeedback('medium');
        // Clear any existing timer
        clearInterval(this.wordSearchInterval);
        
        // Force complete reset of game state
        this.foundWords = [];
        this.selectedCells = [];
        this.isSelecting = false;
        this.wordSearchTimer = 0;
        this.wordSearchInterval = null;
        
        // Force generation of completely new words by clearing existing ones first
        this.wordsToFind = [];
        
        // Now generate fresh words
        this.wordsToFind = this.generateRandomWordList();
        
        // Recreate the entire game grid and display
        this.createWordSearchGrid();
        this.placeWords();
        this.fillEmptySpaces();
        this.renderWordSearchGrid();
        this.renderWordList();
        this.startWordSearchTimer();
    }
    
    initSolitaire() {
        const solitaireHTML = `
            <div class="solitaire-container">
                <div class="solitaire-header">
                    <h2>🃏 Klondike Solitaire</h2>
                    <div class="solitaire-stats">
                        <div class="stat-item">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="solitaireScore">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Moves:</span>
                            <span class="stat-value" id="solitaireMoves">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value" id="solitaireTime">00:00</span>
                        </div>
                    </div>
                </div>
                
                <div class="solitaire-game-board">
                    <div class="solitaire-top-section">
                        <div class="stock-waste-section">
                            <div class="stock-pile" id="stockPile">
                                <div class="card-back-design"></div>
                            </div>
                            <div class="waste-pile" id="wastePile">
                                <div class="empty-pile-indicator">Waste</div>
                            </div>
                        </div>
                        
                        <div class="foundations-section">
                            <div class="foundation-pile hearts" id="foundation-0" data-suit="hearts">
                                <div class="foundation-symbol">♥</div>
                            </div>
                            <div class="foundation-pile diamonds" id="foundation-1" data-suit="diamonds">
                                <div class="foundation-symbol">♦</div>
                            </div>
                            <div class="foundation-pile clubs" id="foundation-2" data-suit="clubs">
                                <div class="foundation-symbol">♣</div>
                            </div>
                            <div class="foundation-pile spades" id="foundation-3" data-suit="spades">
                                <div class="foundation-symbol">♠</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tableau-section" id="tableauSection">
                        <!-- Tableau columns will be generated here -->
                    </div>
                </div>
                
                <div class="solitaire-controls">
                    <button class="control-btn new-game" onclick="premiumGames.newSolitaireGame()">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">New Game</span>
                    </button>
                    <button class="control-btn auto-move" onclick="premiumGames.autoMove()">
                        <span class="btn-icon">🎯</span>
                        <span class="btn-text">Auto Move</span>
                    </button>
                    <button class="control-btn hint" onclick="premiumGames.showHint()">
                        <span class="btn-icon">💡</span>
                        <span class="btn-text">Hint</span>
                    </button>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = solitaireHTML;
        this.setupSolitaire();
    }
    
    setupSolitaire() {
        // Initialize game state
        this.solitaire = {
            deck: [],
            stock: [],
            waste: [],
            foundations: [[], [], [], []],
            tableau: [[], [], [], [], [], [], []],
            score: 0,
            moves: 0,
            timer: 0,
            interval: null,
            selectedCard: null,
            selectedCards: [],
            selectedSource: null,
            selectedColumn: null,
            selectedIndex: null,
            gameWon: false,
            draggedElement: null
        };
        
        this.createAndShuffleDeck();
        this.dealCards();
        this.renderGame();
        this.startTimer();
        this.setupEventListeners();
    }
    
    createAndShuffleDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const symbols = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };
        
        // Create deck
        suits.forEach(suit => {
            values.forEach((value, index) => {
                this.solitaire.deck.push({
                    suit: suit,
                    value: value,
                    number: index + 1,
                    symbol: symbols[suit],
                    color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
                    faceUp: false,
                    id: `${value}-${suit}`
                });
            });
        });
        
        // Enhanced shuffling with multiple passes for better randomization
        this.enhancedShuffle(this.solitaire.deck);
    }
    
    enhancedShuffle(deck) {
        // Multiple shuffle passes for better randomization
        const shufflePasses = 3 + Math.floor(Math.random() * 3); // 3-5 passes
        
        for (let pass = 0; pass < shufflePasses; pass++) {
            // Fisher-Yates shuffle
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            
            // Additional randomization: split and riffle
            if (pass % 2 === 0) {
                const mid = Math.floor(deck.length / 2) + Math.floor(Math.random() * 6) - 3; // Vary split point
                const left = deck.slice(0, mid);
                const right = deck.slice(mid);
                
                // Riffle shuffle
                deck.length = 0;
                let leftIndex = 0, rightIndex = 0;
                
                while (leftIndex < left.length || rightIndex < right.length) {
                    // Randomly choose which pile to take from
                    const takeFromLeft = Math.random() < 0.5;
                    
                    if (takeFromLeft && leftIndex < left.length) {
                        deck.push(left[leftIndex++]);
                    } else if (rightIndex < right.length) {
                        deck.push(right[rightIndex++]);
                    } else if (leftIndex < left.length) {
                        deck.push(left[leftIndex++]);
                    }
                }
            }
        }
    }
    
    dealCards() {
        // Deal tableau - each column gets one more card than the previous
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.solitaire.deck.pop();
                if (row === col) {
                    card.faceUp = true; // Top card is face up
                }
                this.solitaire.tableau[col].push(card);
            }
        }
        
        // Remaining cards go to stock
        this.solitaire.stock = [...this.solitaire.deck];
        this.solitaire.deck = [];
    }
    
    renderGame() {
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
        this.updateStats();
    }
    
    renderStock() {
        const stockElement = document.getElementById('stockPile');
        stockElement.innerHTML = '';
        
        if (this.solitaire.stock.length > 0) {
            const cardElement = document.createElement('div');
            cardElement.className = 'solitaire-card face-down';
            cardElement.onclick = () => this.drawCard();
            stockElement.appendChild(cardElement);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            placeholder.textContent = '↻ Reset';
            placeholder.onclick = () => this.resetStock();
            stockElement.appendChild(placeholder);
        }
    }
    
    renderWaste() {
        const wasteElement = document.getElementById('wastePile');
        wasteElement.innerHTML = '';
        
        if (this.solitaire.waste.length > 0) {
            const topCard = this.solitaire.waste[this.solitaire.waste.length - 1];
            const cardElement = this.createSolitaireCard(topCard);
            cardElement.onclick = () => this.selectCard('waste', this.solitaire.waste.length - 1);
            cardElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selectCard('waste', this.solitaire.waste.length - 1);
            });
            wasteElement.appendChild(cardElement);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            placeholder.textContent = 'Waste';
            wasteElement.appendChild(placeholder);
        }
    }
    
    renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundationElement = document.getElementById(`foundation-${i}`);
            const foundation = this.solitaire.foundations[i];
            foundationElement.innerHTML = '';
            
            if (foundation.length > 0) {
                const topCard = foundation[foundation.length - 1];
                const cardElement = this.createSolitaireCard(topCard);
                foundationElement.appendChild(cardElement);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'foundation-placeholder';
                const suits = ['♥', '♦', '♣', '♠'];
                placeholder.textContent = suits[i];
                foundationElement.appendChild(placeholder);
            }
            
            foundationElement.onclick = () => this.moveToFoundation(i);
            foundationElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.moveToFoundation(i);
            });
        }
    }
    
    renderTableau() {
        const tableauElement = document.getElementById('tableauSection');
        tableauElement.innerHTML = '';
        
        for (let col = 0; col < 7; col++) {
            const columnElement = document.createElement('div');
            columnElement.className = 'tableau-column';
            columnElement.dataset.column = col;
            
            const column = this.solitaire.tableau[col];
            if (column.length === 0) {
                columnElement.onclick = () => this.moveToTableau(col);
                columnElement.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.moveToTableau(col);
                });
            } else {
                column.forEach((card, index) => {
                    const cardElement = this.createSolitaireCard(card);
                    cardElement.style.position = 'relative';
                    cardElement.style.zIndex = index;
                    
                    if (card.faceUp) {
                        cardElement.onclick = () => this.selectCard('tableau', col, index);
                        cardElement.addEventListener('touchend', (e) => {
                            e.preventDefault();
                            this.selectCard('tableau', col, index);
                        });
                    }
                    
                    columnElement.appendChild(cardElement);
                });
            }
            
            tableauElement.appendChild(columnElement);
        }
    }
    
    createSolitaireCard(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `solitaire-card ${card.color}`;
        cardElement.dataset.suit = card.suit;
        cardElement.dataset.value = card.value;
        
        if (card.faceUp) {
            cardElement.innerHTML = `
                <div class="card-value">${card.value}</div>
                <div class="card-suit">${card.symbol}</div>
            `;
        } else {
            cardElement.classList.add('face-down');
        }
        
        return cardElement;
    }
    
    drawCard() {
        if (this.solitaire.stock.length > 0) {
            const card = this.solitaire.stock.pop();
            card.faceUp = true;
            this.solitaire.waste.push(card);
            this.solitaire.moves++;
            this.renderGame();
        }
    }
    
    resetStock() {
        if (this.solitaire.waste.length > 0) {
            // Move all waste cards back to stock
            this.solitaire.stock = this.solitaire.waste.reverse();
            this.solitaire.stock.forEach(card => card.faceUp = false);
            this.solitaire.waste = [];
            this.solitaire.moves++;
            this.renderGame();
        }
    }
    
    selectCard(source, col, index = null) {
        // Clear previous selection
        document.querySelectorAll('.solitaire-card').forEach(c => c.classList.remove('selected'));
        
        // Set new selection
        this.solitaire.selectedCard = { source, col, index };
        
        // Highlight selected card
        let cardElement;
        if (source === 'waste') {
            cardElement = document.querySelector('#wastePile .solitaire-card');
        } else if (source === 'tableau') {
            const column = document.querySelector(`[data-column="${col}"]`);
            cardElement = column.children[index];
        }
        
        if (cardElement) {
            cardElement.classList.add('selected');
        }
    }
    
    moveToFoundation(foundationIndex) {
        if (!this.solitaire.selectedCard) return;
        
        const { source, col, index } = this.solitaire.selectedCard;
        let card;
        
        // Get the selected card
        if (source === 'waste') {
            card = this.solitaire.waste[this.solitaire.waste.length - 1];
        } else if (source === 'tableau') {
            card = this.solitaire.tableau[col][index];
        }
        
        if (!card || !this.canMoveToFoundation(card, foundationIndex)) return;
        
        // Move the card
        if (source === 'waste') {
            this.solitaire.waste.pop();
        } else if (source === 'tableau') {
            this.solitaire.tableau[col].splice(index);
            // Flip the next card if it exists and is face down
            const nextCard = this.solitaire.tableau[col][this.solitaire.tableau[col].length - 1];
            if (nextCard && !nextCard.faceUp) {
                nextCard.faceUp = true;
            }
        }
        
        this.solitaire.foundations[foundationIndex].push(card);
        this.solitaire.selectedCard = null;
        this.solitaire.moves++;
        this.solitaire.score += 10;
        
        this.renderGame();
        this.checkWin();
    }
    
    moveToTableau(targetCol) {
        if (!this.solitaire.selectedCard) return;
        
        const { source, col, index } = this.solitaire.selectedCard;
        let cards = [];
        
        // Get the cards to move
        if (source === 'waste') {
            cards = [this.solitaire.waste[this.solitaire.waste.length - 1]];
        } else if (source === 'tableau') {
            cards = this.solitaire.tableau[col].slice(index);
        }
        
        if (!this.canMoveToTableau(cards, targetCol)) return;
        
        // Move the cards
        if (source === 'waste') {
            this.solitaire.waste.pop();
        } else if (source === 'tableau') {
            this.solitaire.tableau[col].splice(index);
            // Flip the next card if it exists and is face down
            const nextCard = this.solitaire.tableau[col][this.solitaire.tableau[col].length - 1];
            if (nextCard && !nextCard.faceUp) {
                nextCard.faceUp = true;
            }
        }
        
        this.solitaire.tableau[targetCol].push(...cards);
        this.solitaire.selectedCard = null;
        this.solitaire.moves++;
        
        this.renderGame();
    }
    
    canMoveToFoundation(card, foundationIndex) {
        const foundation = this.solitaire.foundations[foundationIndex];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        
        if (foundation.length === 0) {
            return card.value === 'A' && card.suit === suits[foundationIndex];
        }
        
        const topCard = foundation[foundation.length - 1];
        return card.suit === topCard.suit && card.number === topCard.number + 1;
    }
    
    canMoveToTableau(cards, targetCol) {
        const targetColumn = this.solitaire.tableau[targetCol];
        const firstCard = cards[0];
        
        if (targetColumn.length === 0) {
            return firstCard.value === 'K';
        }
        
        const topCard = targetColumn[targetColumn.length - 1];
        return firstCard.color !== topCard.color && firstCard.number === topCard.number - 1;
    }
    
    setupEventListeners() {
        // Add click handler for stock pile
        const stockPile = document.getElementById('stockPile');
        if (stockPile) {
            stockPile.addEventListener('click', () => {
                this.addHapticFeedback('light');
                this.drawCard();
            });
            stockPile.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.addHapticFeedback('light');
                this.drawCard();
            });
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }
    
    updateStats() {
        const scoreElement = document.getElementById('solitaireScore');
        const movesElement = document.getElementById('solitaireMoves');
        const timeElement = document.getElementById('solitaireTime');
        
        if (scoreElement) scoreElement.textContent = this.solitaire.score;
        if (movesElement) movesElement.textContent = this.solitaire.moves;
        
        if (timeElement) {
            const minutes = Math.floor(this.solitaire.timer / 60);
            const seconds = this.solitaire.timer % 60;
            timeElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    startTimer() {
        if (this.solitaire.interval) {
            clearInterval(this.solitaire.interval);
        }
        
        this.solitaire.timer = 0;
        this.solitaire.interval = setInterval(() => {
            this.solitaire.timer++;
            this.updateStats();
        }, 1000);
    }
    
    checkWin() {
        const totalCards = this.solitaire.foundations.reduce((sum, foundation) => sum + foundation.length, 0);
        if (totalCards === 52) {
            clearInterval(this.solitaire.interval);
            setTimeout(() => {
                alert(`Congratulations! You won in ${this.solitaire.moves} moves and ${Math.floor(this.solitaire.timer / 60)}:${(this.solitaire.timer % 60).toString().padStart(2, '0')}!`);
            }, 500);
        }
    }
    
    clearSelection() {
        this.solitaire.selectedCard = null;
        this.solitaire.selectedCards = [];
        document.querySelectorAll('.solitaire-card').forEach(c => c.classList.remove('selected'));
    }
    
    newSolitaireGame() {
        if (this.solitaire.interval) {
            clearInterval(this.solitaire.interval);
        }
        this.clearSelection();
        this.setupSolitaire();
    }
    
    showHint() {
        this.addHapticFeedback('light');
        // Check for possible moves to foundations
        for (let col = 0; col < 7; col++) {
            if (this.solitaire.tableau[col].length > 0) {
                const card = this.solitaire.tableau[col][this.solitaire.tableau[col].length - 1];
                if (card.faceUp) {
                    for (let i = 0; i < 4; i++) {
                        if (this.canMoveToFoundation(card, i)) {
                            alert(`Hint: Move ${card.value} of ${card.suit} to foundation!`);
                            return;
                        }
                    }
                }
            }
        }
        
        // Check waste pile
        if (this.solitaire.waste.length > 0) {
            const card = this.solitaire.waste[this.solitaire.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (this.canMoveToFoundation(card, i)) {
                    alert(`Hint: Move ${card.value} of ${card.suit} from waste to foundation!`);
                    return;
                }
            }
        }
        
        // Check for tableau moves
        for (let sourceCol = 0; sourceCol < 7; sourceCol++) {
            if (this.solitaire.tableau[sourceCol].length > 0) {
                const card = this.solitaire.tableau[sourceCol][this.solitaire.tableau[sourceCol].length - 1];
                if (card.faceUp) {
                    for (let targetCol = 0; targetCol < 7; targetCol++) {
                        if (sourceCol !== targetCol && this.canMoveToTableau([card], targetCol)) {
                            alert(`Hint: Move ${card.value} of ${card.suit} to column ${targetCol + 1}!`);
                            return;
                        }
                    }
                }
            }
        }
        
        // Check if we can draw from stock
        if (this.solitaire.stock.length > 0) {
            alert('Hint: Try drawing a card from the stock pile!');
            return;
        }
        
        alert('No obvious moves available. Try looking for face-down cards to reveal!');
    }
    

    
    autoMove() {
        this.addHapticFeedback('medium');
        let movesMade = 0;
        let maxMoves = 10; // Prevent infinite loops
        
        while (movesMade < maxMoves) {
            let moveMade = false;
            
            // Try to move waste card to foundation
            if (this.solitaire.waste.length > 0) {
                const card = this.solitaire.waste[this.solitaire.waste.length - 1];
                for (let i = 0; i < 4; i++) {
                    if (this.canMoveToFoundation(card, i)) {
                        this.solitaire.selectedCard = { source: 'waste', col: this.solitaire.waste.length - 1 };
                        this.moveToFoundation(i);
                        moveMade = true;
                        movesMade++;
                        break;
                    }
                }
            }
            
            // Try to move tableau cards to foundation
            if (!moveMade) {
                for (let col = 0; col < 7; col++) {
                    if (this.solitaire.tableau[col].length > 0) {
                        const card = this.solitaire.tableau[col][this.solitaire.tableau[col].length - 1];
                        if (card.faceUp) {
                            for (let i = 0; i < 4; i++) {
                                if (this.canMoveToFoundation(card, i)) {
                                    this.solitaire.selectedCard = { 
                                        source: 'tableau', 
                                        col: col, 
                                        index: this.solitaire.tableau[col].length - 1 
                                    };
                                    this.moveToFoundation(i);
                                    moveMade = true;
                                    movesMade++;
                                    break;
                                }
                            }
                            if (moveMade) break;
                        }
                    }
                }
            }
            
            // If no moves were made, break the loop
            if (!moveMade) break;
        }
        
        if (movesMade === 0) {
            // Try to find any valid tableau moves
            for (let sourceCol = 0; sourceCol < 7; sourceCol++) {
                if (this.solitaire.tableau[sourceCol].length > 0) {
                    const card = this.solitaire.tableau[sourceCol][this.solitaire.tableau[sourceCol].length - 1];
                    if (card.faceUp) {
                        for (let targetCol = 0; targetCol < 7; targetCol++) {
                            if (sourceCol !== targetCol && this.canMoveToTableau([card], targetCol)) {
                                this.solitaire.selectedCard = { 
                                    source: 'tableau', 
                                    col: sourceCol, 
                                    index: this.solitaire.tableau[sourceCol].length - 1 
                                };
                                this.moveToTableau(targetCol);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
    

    
    initMinesweeper() {
        const minesweeperHTML = `
            <div class="premium-game-container">
                <div class="game-header">
                    <h3>💣 Minesweeper</h3>
                    <div class="game-stats">
                        <span>Mines: <span id="mineCount">10</span></span>
                        <span>Time: <span id="mineTime">0</span></span>
                        <span>Status: <span id="mineStatus">Playing</span></span>
                    </div>
                </div>
                <div class="minesweeper-grid" id="minesweeperGrid"></div>
                <div class="game-controls">
                    <button class="game-btn" onclick="premiumGames.newMinesweeperGame()">New Game</button>
                    <button class="game-btn" onclick="premiumGames.toggleMineMode()">🚩 Flag Mode: <span id="flagMode">OFF</span></button>
                </div>
            </div>
        `;
        
        this.gameContainer.innerHTML = minesweeperHTML;
        this.setupMinesweeper();
    }
    
    setupMinesweeper() {
        this.mineGridSize = 9;
        this.mineCount = 10;
        this.mineGrid = [];
        this.mineRevealed = [];
        this.mineFlagged = [];
        this.mineGameOver = false;
        this.mineStartTime = null;
        this.mineTimer = null;
        this.mineFlagMode = false;
        
        this.generateMineField();
        this.createMinesweeperGrid();
    }
    
    generateMineField() {
        // Initialize empty grid
        this.mineGrid = Array(this.mineGridSize).fill().map(() => Array(this.mineGridSize).fill(0));
        this.mineRevealed = Array(this.mineGridSize).fill().map(() => Array(this.mineGridSize).fill(false));
        this.mineFlagged = Array(this.mineGridSize).fill().map(() => Array(this.mineGridSize).fill(false));
        
        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.mineGridSize);
            const col = Math.floor(Math.random() * this.mineGridSize);
            
            if (this.mineGrid[row][col] !== -1) {
                this.mineGrid[row][col] = -1; // -1 represents a mine
                minesPlaced++;
                
                // Update adjacent cells
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        
                        if (newRow >= 0 && newRow < this.mineGridSize && 
                            newCol >= 0 && newCol < this.mineGridSize && 
                            this.mineGrid[newRow][newCol] !== -1) {
                            this.mineGrid[newRow][newCol]++;
                        }
                    }
                }
            }
        }
    }
    
    createMinesweeperGrid() {
        const grid = document.getElementById('minesweeperGrid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${this.mineGridSize}, 1fr)`;
        
        for (let row = 0; row < this.mineGridSize; row++) {
            for (let col = 0; col < this.mineGridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                // Mouse events
                cell.addEventListener('click', () => this.handleMineClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleMineFlag(row, col);
                });
                
                // Touch events for mobile
                let touchStartTime = 0;
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    touchStartTime = Date.now();
                }, { passive: false });
                
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    const touchDuration = Date.now() - touchStartTime;
                    
                    // Long press (>500ms) for flagging, short press for revealing
                    if (touchDuration > 500) {
                        this.toggleMineFlag(row, col);
                    } else {
                        this.handleMineClick(row, col);
                    }
                }, { passive: false });
                grid.appendChild(cell);
            }
        }
    }
    
    handleMineClick(row, col) {
        if (this.mineGameOver || this.mineRevealed[row][col] || this.mineFlagged[row][col]) {
            return;
        }
        
        this.addHapticFeedback('light');
        
        if (!this.mineStartTime) {
            this.mineStartTime = Date.now();
            this.startMineTimer();
        }
        
        if (this.mineFlagMode) {
            this.toggleMineFlag(row, col);
            return;
        }
        
        if (this.mineGrid[row][col] === -1) {
            // Hit a mine - game over
            this.mineGameOver = true;
            this.revealAllMines();
            document.getElementById('mineStatus').textContent = 'Game Over!';
            clearInterval(this.mineTimer);
        } else {
            this.revealMineCell(row, col);
            this.checkMineWin();
        }
    }
    
    revealMineCell(row, col) {
        if (row < 0 || row >= this.mineGridSize || col < 0 || col >= this.mineGridSize || 
            this.mineRevealed[row][col] || this.mineFlagged[row][col]) {
            return;
        }
        
        this.mineRevealed[row][col] = true;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('revealed');
        
        const value = this.mineGrid[row][col];
        if (value === 0) {
            cell.textContent = '';
            // Reveal adjacent cells if this is empty
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.revealMineCell(row + i, col + j);
                }
            }
        } else {
            cell.textContent = value;
            cell.style.color = this.getMineNumberColor(value);
        }
    }
    
    toggleMineFlag(row, col) {
        if (this.mineRevealed[row][col] || this.mineGameOver) {
            return;
        }
        
        this.addHapticFeedback('light');
        
        this.mineFlagged[row][col] = !this.mineFlagged[row][col];
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (this.mineFlagged[row][col]) {
            cell.textContent = '🚩';
            cell.classList.add('flagged');
        } else {
            cell.textContent = '';
            cell.classList.remove('flagged');
        }
        
        this.updateMineCount();
    }
    
    updateMineCount() {
        const flaggedCount = this.mineFlagged.flat().filter(f => f).length;
        document.getElementById('mineCount').textContent = this.mineCount - flaggedCount;
    }
    
    revealAllMines() {
        for (let row = 0; row < this.mineGridSize; row++) {
            for (let col = 0; col < this.mineGridSize; col++) {
                if (this.mineGrid[row][col] === -1) {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.textContent = '💣';
                    cell.classList.add('mine');
                }
            }
        }
    }
    
    checkMineWin() {
        let revealedCount = 0;
        for (let row = 0; row < this.mineGridSize; row++) {
            for (let col = 0; col < this.mineGridSize; col++) {
                if (this.mineRevealed[row][col]) {
                    revealedCount++;
                }
            }
        }
        
        if (revealedCount === (this.mineGridSize * this.mineGridSize) - this.mineCount) {
            this.mineGameOver = true;
            document.getElementById('mineStatus').textContent = 'You Win!';
            clearInterval(this.mineTimer);
        }
    }
    
    startMineTimer() {
        this.mineTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.mineStartTime) / 1000);
            document.getElementById('mineTime').textContent = elapsed;
        }, 1000);
    }
    
    getMineNumberColor(num) {
        const colors = ['', '#0000FF', '#008000', '#FF0000', '#800080', '#800000', '#008080', '#000000', '#808080'];
        return colors[num] || '#000000';
    }
    
    newMinesweeperGame() {
        this.addHapticFeedback('medium');
        clearInterval(this.mineTimer);
        this.mineStartTime = null;
        document.getElementById('mineTime').textContent = '0';
        document.getElementById('mineStatus').textContent = 'Playing';
        document.getElementById('mineCount').textContent = this.mineCount;
        this.setupMinesweeper();
    }
    
    toggleMineMode() {
        this.addHapticFeedback('light');
        this.mineFlagMode = !this.mineFlagMode;
        document.getElementById('flagMode').textContent = this.mineFlagMode ? 'ON' : 'OFF';
    }
}

// Create global instance
const premiumGames = new PremiumGames();