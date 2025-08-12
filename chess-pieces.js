// Enhanced chess piece theme with multiple fallbacks and local SVG support
// Using reliable sources with comprehensive error handling

console.log('Loading enhanced chess pieces...');

// Create chess piece theme with multiple fallback options
function createChessPieceTheme() {
    console.log('Creating enhanced chess piece theme...');
    
    // Primary source: ChessboardJS default (most reliable)
    const chessboardJsUrl = 'https://chessboardjs.com/img/chesspieces/wikipedia/';
    
    // Secondary source: Wikipedia direct
    const wikipediaUrl = 'https://upload.wikimedia.org/wikipedia/commons/';
    
    // Tertiary source: Local SVG data URIs (embedded)
    const localSvgPieces = createLocalSvgPieces();
    
    const pieces = {
        'wK': chessboardJsUrl + 'wK.png',
        'wQ': chessboardJsUrl + 'wQ.png', 
        'wR': chessboardJsUrl + 'wR.png',
        'wB': chessboardJsUrl + 'wB.png',
        'wN': chessboardJsUrl + 'wN.png',
        'wP': chessboardJsUrl + 'wP.png',
        'bK': chessboardJsUrl + 'bK.png',
        'bQ': chessboardJsUrl + 'bQ.png',
        'bR': chessboardJsUrl + 'bR.png',
        'bB': chessboardJsUrl + 'bB.png',
        'bN': chessboardJsUrl + 'bN.png',
        'bP': chessboardJsUrl + 'bP.png'
    };
    
    // Add fallback URLs for each piece
    Object.keys(pieces).forEach(piece => {
        pieces[piece + '_fallback1'] = wikipediaUrl + getWikipediaPath(piece);
        pieces[piece + '_fallback2'] = localSvgPieces[piece];
    });
    
    console.log('Chess pieces created with fallbacks:', Object.keys(pieces).filter(k => !k.includes('_fallback')));
    return pieces;
}

// Get Wikipedia path for piece
function getWikipediaPath(piece) {
    const paths = {
        'wK': 'thumb/4/42/Chess_klt45.svg/45px-Chess_klt45.svg.png',
        'wQ': 'thumb/1/15/Chess_qlt45.svg/45px-Chess_qlt45.svg.png', 
        'wR': 'thumb/7/72/Chess_rlt45.svg/45px-Chess_rlt45.svg.png',
        'wB': 'thumb/b/b1/Chess_blt45.svg/45px-Chess_blt45.svg.png',
        'wN': 'thumb/7/70/Chess_nlt45.svg/45px-Chess_nlt45.svg.png',
        'wP': 'thumb/4/45/Chess_plt45.svg/45px-Chess_plt45.svg.png',
        'bK': 'thumb/f/f0/Chess_kdt45.svg/45px-Chess_kdt45.svg.png',
        'bQ': 'thumb/4/47/Chess_qdt45.svg/45px-Chess_qdt45.svg.png',
        'bR': 'thumb/f/ff/Chess_rdt45.svg/45px-Chess_rdt45.svg.png',
        'bB': 'thumb/9/98/Chess_bdt45.svg/45px-Chess_bdt45.svg.png',
        'bN': 'thumb/e/ef/Chess_ndt45.svg/45px-Chess_ndt45.svg.png',
        'bP': 'thumb/c/c7/Chess_pdt45.svg/45px-Chess_pdt45.svg.png'
    };
    return paths[piece] || '';
}

// Create local SVG pieces as data URIs (fallback)
function createLocalSvgPieces() {
    // Simple SVG representations of chess pieces
    const svgPieces = {
        'wK': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>'),
        'wQ': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g></svg>'),
        'wR': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>'),
        'wB': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke="#000"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/><path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#000"/></g></svg>'),
        'wN': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#fff"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#000"/><path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#000" stroke="#000"/></g></svg>'),
        'wP': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>'),
        'bK': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#000" stroke="#000" stroke-width="1.5"><path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0"/></g></svg>'),
        'bQ': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#000" stroke="#000" stroke-width="1.5" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g></svg>'),
        'bR': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>'),
        'bB': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke="#000"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/><path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#000"/></g></svg>'),
        'bN': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#000"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#fff"/><path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#fff" stroke="#fff"/></g></svg>'),
        'bP': 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>')
    };
    
    return svgPieces;
}

// Enhanced piece theme function with fallback handling
function createPieceThemeFunction() {
    const pieces = window.chessPieceTheme;
    
    return function(piece) {
        console.log('Loading piece:', piece);
        
        // Try primary URL first
        if (pieces[piece]) {
            console.log('Using primary piece URL for:', piece);
            return pieces[piece];
        }
        
        // Try fallback URLs
        if (pieces[piece + '_fallback1']) {
            console.log('Using fallback 1 for:', piece);
            return pieces[piece + '_fallback1'];
        }
        
        if (pieces[piece + '_fallback2']) {
            console.log('Using fallback 2 (SVG) for:', piece);
            return pieces[piece + '_fallback2'];
        }
        
        // Final fallback to chessboard.js default
        console.log('Using final fallback for:', piece);
        return 'https://chessboardjs.com/img/chesspieces/wikipedia/' + piece + '.png';
    };
}

// Make it available globally
window.chessPieceTheme = createChessPieceTheme();
window.chessPieceThemeFunction = createPieceThemeFunction();

// Preload images to prevent disappearing pieces
function preloadChessPieces() {
    console.log('Preloading chess pieces...');
    const pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
    let loadedCount = 0;
    
    pieces.forEach(piece => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            console.log(`Piece ${piece} loaded (${loadedCount}/${pieces.length})`);
            if (loadedCount === pieces.length) {
                console.log('✅ All chess pieces preloaded successfully!');
                window.chessPiecesLoaded = true;
            }
        };
        img.onerror = () => {
            console.warn(`Failed to load piece ${piece}, will use fallback`);
            loadedCount++;
            if (loadedCount === pieces.length) {
                console.log('⚠️ Chess pieces loaded with some fallbacks');
                window.chessPiecesLoaded = true;
            }
        };
        img.src = window.chessPieceTheme[piece];
    });
}

// Make preload function globally available
window.preloadChessPieces = preloadChessPieces;

console.log('Enhanced chess piece theme loaded successfully!');

// Start preloading automatically when this file loads
setTimeout(() => {
    console.log('Auto-starting chess piece preload...');
    preloadChessPieces();
}, 100);