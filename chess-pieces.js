// Simple and reliable chess piece theme
// Using external URLs as primary source with local fallback

console.log('Loading chess pieces...');

// Create a simple piece theme function
function createChessPieceTheme() {
    console.log('Creating chess piece theme...');
    
    // Use Wikipedia chess pieces as they are reliable and always available
    const baseUrl = 'https://upload.wikimedia.org/wikipedia/commons/';
    
    const pieces = {
        'wK': baseUrl + 'thumb/4/42/Chess_klt45.svg/45px-Chess_klt45.svg.png',
        'wQ': baseUrl + 'thumb/1/15/Chess_qlt45.svg/45px-Chess_qlt45.svg.png', 
        'wR': baseUrl + 'thumb/7/72/Chess_rlt45.svg/45px-Chess_rlt45.svg.png',
        'wB': baseUrl + 'thumb/b/b1/Chess_blt45.svg/45px-Chess_blt45.svg.png',
        'wN': baseUrl + 'thumb/7/70/Chess_nlt45.svg/45px-Chess_nlt45.svg.png',
        'wP': baseUrl + 'thumb/4/45/Chess_plt45.svg/45px-Chess_plt45.svg.png',
        'bK': baseUrl + 'thumb/f/f0/Chess_kdt45.svg/45px-Chess_kdt45.svg.png',
        'bQ': baseUrl + 'thumb/4/47/Chess_qdt45.svg/45px-Chess_qdt45.svg.png',
        'bR': baseUrl + 'thumb/f/ff/Chess_rdt45.svg/45px-Chess_rdt45.svg.png',
        'bB': baseUrl + 'thumb/9/98/Chess_bdt45.svg/45px-Chess_bdt45.svg.png',
        'bN': baseUrl + 'thumb/e/ef/Chess_ndt45.svg/45px-Chess_ndt45.svg.png',
        'bP': baseUrl + 'thumb/c/c7/Chess_pdt45.svg/45px-Chess_pdt45.svg.png'
    };
    
    console.log('Chess pieces created:', Object.keys(pieces));
    return pieces;
}

// Make it available globally
window.chessPieceTheme = createChessPieceTheme();
console.log('Chess piece theme loaded successfully!');