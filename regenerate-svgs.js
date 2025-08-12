// Complete SVG Regeneration Script - Creates beautiful, animated SVG images for ALL cards

const svgTemplates = {
    // Game SVGs
    'tictactoe': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ee5a52;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="oGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#44a08d;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gridGradient)" stroke-width="2" opacity="0.1"/>
        <line x1="70" y1="40" x2="70" y2="160" stroke="url(#gridGradient)" stroke-width="3" stroke-linecap="round"/>
        <line x1="130" y1="40" x2="130" y2="160" stroke="url(#gridGradient)" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="70" x2="160" y2="70" stroke="url(#gridGradient)" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="130" x2="160" y2="130" stroke="url(#gridGradient)" stroke-width="3" stroke-linecap="round"/>
        <g transform="translate(55,55)">
            <line x1="-10" y1="-10" x2="10" y2="10" stroke="url(#xGradient)" stroke-width="4" stroke-linecap="round"/>
            <line x1="10" y1="-10" x2="-10" y2="10" stroke="url(#xGradient)" stroke-width="4" stroke-linecap="round"/>
        </g>
        <circle cx="100" cy="100" r="12" fill="none" stroke="url(#oGradient)" stroke-width="4"/>
        <g transform="translate(145,145)">
            <line x1="-10" y1="-10" x2="10" y2="10" stroke="url(#xGradient)" stroke-width="4" stroke-linecap="round"/>
            <line x1="10" y1="-10" x2="-10" y2="10" stroke="url(#xGradient)" stroke-width="4" stroke-linecap="round"/>
        </g>
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#gridGradient)" stroke-width="1" opacity="0.3"/>
    </svg>`,

    'connect4': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="boardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="redPiece" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ee5a52;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="yellowPiece" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#feca57;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ff9ff3;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#boardGradient)" opacity="0.1"/>
        <rect x="40" y="50" width="120" height="100" rx="8" fill="none" stroke="url(#boardGradient)" stroke-width="3"/>
        <circle cx="55" cy="125" r="8" fill="url(#redPiece)"/>
        <circle cx="75" cy="125" r="8" fill="url(#yellowPiece)"/>
        <circle cx="95" cy="125" r="8" fill="url(#redPiece)"/>
        <circle cx="115" cy="125" r="8" fill="url(#redPiece)"/>
        <circle cx="55" cy="105" r="8" fill="url(#yellowPiece)"/>
        <circle cx="75" cy="105" r="8" fill="url(#redPiece)"/>
        <circle cx="95" cy="105" r="8" fill="url(#yellowPiece)"/>
        <line x1="50" y1="125" x2="120" y2="125" stroke="url(#redPiece)" stroke-width="3" opacity="0.7"/>
        <circle cx="100" cy="70" r="6" fill="url(#yellowPiece)" opacity="0.8">
            <animate attributeName="cy" values="30;70" dur="1s" repeatCount="indefinite"/>
        </circle>
    </svg>`,

    'chess': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="boardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="kingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#feca57;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ff9ff3;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ee5a52;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#boardGradient)" stroke-width="2" opacity="0.1"/>
        <g opacity="0.3">
            <rect x="60" y="60" width="20" height="20" fill="url(#boardGradient)"/>
            <rect x="100" y="60" width="20" height="20" fill="url(#boardGradient)"/>
            <rect x="80" y="80" width="20" height="20" fill="url(#boardGradient)"/>
            <rect x="120" y="80" width="20" height="20" fill="url(#boardGradient)"/>
            <rect x="60" y="100" width="20" height="20" fill="url(#boardGradient)"/>
            <rect x="100" y="100" width="20" height="20" fill="url(#boardGradient)"/>
            <rect x="80" y="120" width="20" height="20" fill="url(#boardGradient)"/>
            <rect x="120" y="120" width="20" height="20" fill="url(#boardGradient)"/>
        </g>
        <rect x="55" y="55" width="90" height="90" fill="none" stroke="url(#boardGradient)" stroke-width="2" rx="4"/>
        <g transform="translate(100,110)">
            <ellipse cx="0" cy="15" rx="12" ry="4" fill="url(#kingGradient)"/>
            <rect x="-8" y="0" width="16" height="20" rx="3" fill="url(#kingGradient)"/>
            <polygon points="-10,-8 -5,-15 0,-12 5,-15 10,-8 8,-5 -8,-5" fill="url(#crownGradient)"/>
            <circle cx="0" cy="-10" r="2" fill="#fff" opacity="0.9"/>
            <line x1="0" y1="-18" x2="0" y2="-14" stroke="#fff" stroke-width="1.5"/>
            <line x1="-2" y1="-16" x2="2" y2="-16" stroke="#fff" stroke-width="1.5"/>
        </g>
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#kingGradient)" stroke-width="1" opacity="0.4" stroke-dasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
        </circle>
    </svg>`,

    'flappy': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#74b9ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0984e3;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="birdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#feca57;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ff9ff3;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#skyGradient)" opacity="0.2"/>
        <g transform="translate(80,100)">
            <ellipse cx="0" cy="0" rx="15" ry="10" fill="url(#birdGradient)"/>
            <circle cx="8" cy="-3" r="2" fill="#333"/>
            <polygon points="15,0 25,-3 25,3" fill="#ff6b6b"/>
            <ellipse cx="-5" cy="-8" rx="12" ry="4" fill="url(#birdGradient)">
                <animateTransform attributeName="transform" type="rotate" values="0;-20;0" dur="0.5s" repeatCount="indefinite"/>
            </ellipse>
            <animateTransform attributeName="transform" type="translate" values="80,100;80,90;80,100" dur="1s" repeatCount="indefinite"/>
        </g>
        <rect x="150" y="40" width="20" height="60" fill="#2d3436"/>
        <rect x="150" y="140" width="20" height="60" fill="#2d3436"/>
        <g opacity="0.6">
            <circle cx="30" cy="50" r="2" fill="#fff">
                <animate attributeName="cx" values="30;170" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="40" cy="60" r="1.5" fill="#fff">
                <animate attributeName="cx" values="40;180" dur="4s" repeatCount="indefinite"/>
            </circle>
        </g>
    </svg>`,

    'math-challenge': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="mathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00cec9;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#55a3ff;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="calcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#2d3436;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#636e72;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#mathGradient)" opacity="0.1"/>
        <rect x="75" y="65" width="50" height="70" rx="5" fill="url(#calcGradient)" opacity="0.9"/>
        <rect x="80" y="70" width="40" height="15" rx="2" fill="#333"/>
        <text x="115" y="82" font-family="monospace" font-size="10" fill="#0f0" text-anchor="end">42</text>
        <g fill="#ddd" font-family="Arial" font-size="8" text-anchor="middle">
            <text x="87" y="100">7</text>
            <text x="100" y="100">8</text>
            <text x="113" y="100">9</text>
            <text x="87" y="115">4</text>
            <text x="100" y="115">5</text>
            <text x="113" y="115">6</text>
        </g>
        <text x="50" y="50" font-family="serif" font-size="20" fill="url(#mathGradient)">π</text>
        <text x="150" y="60" font-family="serif" font-size="20" fill="url(#mathGradient)">∑</text>
        <text x="40" y="150" font-family="serif" font-size="20" fill="url(#mathGradient)">∞</text>
        <text x="160" y="140" font-family="serif" font-size="20" fill="url(#mathGradient)">√</text>
        <text x="100" y="40" font-family="serif" font-size="14" fill="url(#mathGradient)" text-anchor="middle">x² + y² = r²</text>
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#mathGradient)" stroke-width="1" opacity="0.3" stroke-dasharray="3,3">
            <animate attributeName="stroke-dashoffset" values="0;6" dur="2s" repeatCount="indefinite"/>
        </circle>
    </svg>`,

    'riddle': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="riddleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#a29bfe;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#6c5ce7;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ffeaa7;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#riddleGradient)" opacity="0.1"/>
        <path d="M 85 75 Q 85 65 95 65 Q 115 65 115 80 Q 115 95 100 100 L 100 110" 
              stroke="url(#riddleGradient)" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="100" cy="120" r="4" fill="url(#riddleGradient)"/>
        <g transform="translate(60,60)" opacity="0.8">
            <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#bulbGradient)"/>
            <rect x="-6" y="8" width="12" height="4" rx="1" fill="#ddd"/>
            <line x1="-15" y1="-15" x2="-12" y2="-12" stroke="url(#bulbGradient)" stroke-width="2"/>
            <line x1="15" y1="-15" x2="12" y2="-12" stroke="url(#bulbGradient)" stroke-width="2"/>
            <line x1="0" y1="-20" x2="0" y2="-17" stroke="url(#bulbGradient)" stroke-width="2"/>
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
        </g>
        <g opacity="0.6">
            <circle cx="140" cy="140" r="2" fill="url(#riddleGradient)">
                <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="160" cy="120" r="1.5" fill="url(#riddleGradient)">
                <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite"/>
            </circle>
        </g>
    </svg>`,

    'ocean-life': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#74b9ff;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#0984e3;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2d3436;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="jellyfishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:0.6" />
            </linearGradient>
            <linearGradient id="fishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00cec9;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#55a3ff;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#oceanGradient)"/>
        <g opacity="0.6">
            <circle cx="30" cy="160" r="3" fill="#fff">
                <animate attributeName="cy" values="160;20" dur="4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="170" cy="180" r="2" fill="#fff">
                <animate attributeName="cy" values="180;30" dur="5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0" dur="5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="100" cy="170" r="4" fill="#fff">
                <animate attributeName="cy" values="170;10" dur="6s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0" dur="6s" repeatCount="indefinite"/>
            </circle>
        </g>
        <g transform="translate(60,80)">
            <ellipse cx="0" cy="0" rx="20" ry="15" fill="url(#jellyfishGradient)"/>
            <path d="M -15 10 Q -10 25 -5 15 Q 0 30 5 15 Q 10 25 15 10" stroke="url(#jellyfishGradient)" stroke-width="2" fill="none">
                <animate attributeName="d" values="M -15 10 Q -10 25 -5 15 Q 0 30 5 15 Q 10 25 15 10;M -15 10 Q -10 20 -5 18 Q 0 25 5 18 Q 10 20 15 10;M -15 10 Q -10 25 -5 15 Q 0 30 5 15 Q 10 25 15 10" dur="2s" repeatCount="indefinite"/>
            </path>
            <circle cx="-5" cy="-5" r="2" fill="#fff" opacity="0.8"/>
            <circle cx="5" cy="-5" r="2" fill="#fff" opacity="0.8"/>
        </g>
        <g transform="translate(130,120)">
            <ellipse cx="0" cy="0" rx="15" ry="8" fill="url(#fishGradient)"/>
            <polygon points="-15,0 -25,-5 -25,5" fill="url(#fishGradient)"/>
            <circle cx="8" cy="-2" r="2" fill="#fff"/>
            <circle cx="9" cy="-2" r="1" fill="#333"/>
            <animateTransform attributeName="transform" type="translate" values="130,120;140,115;130,120" dur="3s" repeatCount="indefinite"/>
        </g>
        <g transform="translate(100,140)" opacity="0.8">
            <path d="M 0 0 Q -20 10 -15 25 Q -10 35 -20 40" stroke="url(#fishGradient)" stroke-width="4" fill="none" stroke-linecap="round">
                <animate attributeName="d" values="M 0 0 Q -20 10 -15 25 Q -10 35 -20 40;M 0 0 Q -25 15 -10 30 Q -5 40 -15 45;M 0 0 Q -20 10 -15 25 Q -10 35 -20 40" dur="3s" repeatCount="indefinite"/>
            </path>
            <path d="M 0 0 Q 20 10 15 25 Q 10 35 20 40" stroke="url(#fishGradient)" stroke-width="4" fill="none" stroke-linecap="round">
                <animate attributeName="d" values="M 0 0 Q 20 10 15 25 Q 10 35 20 40;M 0 0 Q 25 15 10 30 Q 5 40 15 45;M 0 0 Q 20 10 15 25 Q 10 35 20 40" dur="3s" repeatCount="indefinite"/>
            </path>
        </g>
        <g transform="translate(40,150)" opacity="0.7">
            <path d="M 0 20 Q -5 15 -3 10 Q -8 5 -5 0 M 0 20 Q 5 15 3 10 Q 8 5 5 0" stroke="#ff7675" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>
        <g transform="translate(160,140)" opacity="0.6">
            <path d="M 0 40 Q -5 30 0 20 Q 5 10 0 0" stroke="#00b894" stroke-width="3" fill="none" stroke-linecap="round">
                <animate attributeName="d" values="M 0 40 Q -5 30 0 20 Q 5 10 0 0;M 0 40 Q 5 30 0 20 Q -5 10 0 0;M 0 40 Q -5 30 0 20 Q 5 10 0 0" dur="4s" repeatCount="indefinite"/>
            </path>
        </g>
    </svg>`,

    'space-mysteries': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="spaceGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#2d3436;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#000;stop-opacity:1" />
            </radialGradient>
            <linearGradient id="planetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#spaceGradient)"/>
        <g opacity="0.8">
            <circle cx="30" cy="40" r="1" fill="#fff">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="170" cy="60" r="1.5" fill="#fff">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="50" cy="170" r="1" fill="#fff">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="160" cy="150" r="1" fill="#fff">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite"/>
            </circle>
        </g>
        <circle cx="120" cy="80" r="25" fill="url(#planetGradient)" opacity="0.9"/>
        <ellipse cx="120" cy="80" rx="35" ry="8" fill="none" stroke="url(#planetGradient)" stroke-width="2" opacity="0.6"/>
        <circle cx="80" cy="130" r="15" fill="#74b9ff" opacity="0.8"/>
        <g transform="translate(60,60)">
            <polygon points="0,-10 3,0 10,0 4,6 6,15 0,10 -6,15 -4,6 -10,0 -3,0" fill="#ffeaa7">
                <animateTransform attributeName="transform" type="rotate" values="0;360" dur="10s" repeatCount="indefinite"/>
            </polygon>
        </g>
        <path d="M 40 100 Q 60 80 80 100 Q 100 120 120 100 Q 140 80 160 100" stroke="#55a3ff" stroke-width="2" fill="none" opacity="0.6" stroke-dasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
        </path>
        <g transform="translate(140,140)">
            <circle cx="0" cy="0" r="8" fill="#e17055" opacity="0.7"/>
            <circle cx="0" cy="0" r="12" fill="none" stroke="#e17055" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="12;16;12" dur="3s" repeatCount="indefinite"/>
            </circle>
        </g>
    </svg>`,

    'animal-kingdom': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="jungleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00b894;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#00cec9;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="lionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fdcb6e;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e17055;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#jungleGradient)" opacity="0.2"/>
        <g transform="translate(100,100)">
            <circle cx="0" cy="0" r="20" fill="url(#lionGradient)"/>
            <circle cx="-15" cy="-15" r="8" fill="url(#lionGradient)"/>
            <circle cx="15" cy="-15" r="8" fill="url(#lionGradient)"/>
            <circle cx="-6" cy="-5" r="2" fill="#333"/>
            <circle cx="6" cy="-5" r="2" fill="#333"/>
            <ellipse cx="0" cy="5" rx="3" ry="2" fill="#333"/>
            <path d="M -10 15 Q 0 20 10 15" stroke="#333" stroke-width="2" fill="none"/>
            <g stroke="url(#lionGradient)" stroke-width="3" opacity="0.8">
                <path d="M -25 -10 Q -30 -15 -25 -20"/>
                <path d="M 25 -10 Q 30 -15 25 -20"/>
                <path d="M -20 -25 Q -25 -30 -20 -35"/>
                <path d="M 20 -25 Q 25 -30 20 -35"/>
            </g>
        </g>
        <g transform="translate(60,150)" opacity="0.7">
            <ellipse cx="0" cy="0" rx="8" ry="4" fill="#636e72"/>
            <rect x="-2" y="-8" width="4" height="8" fill="#636e72"/>
            <circle cx="-3" cy="-10" r="1" fill="#333"/>
            <circle cx="3" cy="-10" r="1" fill="#333"/>
        </g>
        <g transform="translate(140,60)" opacity="0.7">
            <circle cx="0" cy="0" r="6" fill="#fd79a8"/>
            <polygon points="-8,-8 -4,-12 0,-8 4,-12 8,-8 6,-4 -6,-4" fill="#fd79a8"/>
            <circle cx="-2" cy="-2" r="1" fill="#333"/>
            <circle cx="2" cy="-2" r="1" fill="#333"/>
        </g>
        <g opacity="0.5">
            <path d="M 30 30 Q 35 25 40 30 Q 45 35 50 30" stroke="url(#jungleGradient)" stroke-width="3" fill="none"/>
            <path d="M 150 170 Q 155 165 160 170 Q 165 175 170 170" stroke="url(#jungleGradient)" stroke-width="3" fill="none"/>
        </g>
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#jungleGradient)" stroke-width="1" opacity="0.3" stroke-dasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="3s" repeatCount="indefinite"/>
        </circle>
    </svg>`,

    'human-body': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ee5a52;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#bodyGradient)" opacity="0.1"/>
        <g transform="translate(100,100)">
            <circle cx="0" cy="-40" r="15" fill="url(#bodyGradient)" opacity="0.8"/>
            <rect x="-8" y="-25" width="16" height="30" rx="3" fill="url(#bodyGradient)" opacity="0.8"/>
            <rect x="-12" y="-15" width="8" height="20" rx="2" fill="url(#bodyGradient)" opacity="0.6"/>
            <rect x="4" y="-15" width="8" height="20" rx="2" fill="url(#bodyGradient)" opacity="0.6"/>
            <rect x="-6" y="5" width="5" height="25" rx="2" fill="url(#bodyGradient)" opacity="0.6"/>
            <rect x="1" y="5" width="5" height="25" rx="2" fill="url(#bodyGradient)" opacity="0.6"/>
        </g>
        <g transform="translate(85,85)">
            <path d="M 0 0 C -5 -5, -15 -5, -15 0 C -15 5, -5 15, 0 20 C 5 15, 15 5, 15 0 C 15 -5, 5 -5, 0 0 Z" fill="url(#heartGradient)">
                <animate attributeName="transform" values="scale(1);scale(1.2);scale(1)" dur="1s" repeatCount="indefinite"/>
            </path>
        </g>
        <g opacity="0.6">
            <circle cx="70" cy="70" r="3" fill="url(#bodyGradient)">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="130" cy="130" r="2" fill="url(#bodyGradient)">
                <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite"/>
            </circle>
        </g>
        <g transform="translate(120,60)" opacity="0.7">
            <circle cx="0" cy="0" r="8" fill="none" stroke="url(#bodyGradient)" stroke-width="2"/>
            <circle cx="0" cy="0" r="4" fill="url(#bodyGradient)"/>
        </g>
        <path d="M 50 150 Q 100 130 150 150" stroke="url(#bodyGradient)" stroke-width="2" fill="none" opacity="0.5" stroke-dasharray="3,3">
            <animate attributeName="stroke-dashoffset" values="0;6" dur="2s" repeatCount="indefinite"/>
        </path>
    </svg>`,

    'technology-science': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#74b9ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0984e3;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00cec9;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#55a3ff;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#techGradient)" opacity="0.1"/>
        <g transform="translate(100,100)">
            <rect x="-25" y="-15" width="50" height="30" rx="3" fill="url(#techGradient)" opacity="0.8"/>
            <rect x="-20" y="-10" width="40" height="20" rx="2" fill="#333"/>
            <circle cx="-10" cy="0" r="3" fill="url(#circuitGradient)"/>
            <circle cx="0" cy="0" r="3" fill="url(#circuitGradient)"/>
            <circle cx="10" cy="0" r="3" fill="url(#circuitGradient)"/>
            <line x1="-7" y1="0" x2="-3" y2="0" stroke="url(#circuitGradient)" stroke-width="2"/>
            <line x1="3" y1="0" x2="7" y2="0" stroke="url(#circuitGradient)" stroke-width="2"/>
        </g>
        <g opacity="0.6">
            <rect x="60" y="60" width="8" height="8" fill="url(#circuitGradient)"/>
            <rect x="132" y="132" width="8" height="8" fill="url(#circuitGradient)"/>
            <line x1="68" y1="64" x2="85" y2="64" stroke="url(#circuitGradient)" stroke-width="2"/>
            <line x1="115" y1="136" x2="132" y2="136" stroke="url(#circuitGradient)" stroke-width="2"/>
        </g>
        <g transform="translate(60,140)">
            <polygon points="0,-8 8,0 0,8 -8,0" fill="url(#techGradient)" opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" values="0;360" dur="4s" repeatCount="indefinite"/>
            </polygon>
        </g>
        <g transform="translate(140,60)">
            <circle cx="0" cy="0" r="6" fill="none" stroke="url(#techGradient)" stroke-width="2"/>
            <circle cx="0" cy="0" r="3" fill="url(#techGradient)">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
            </circle>
        </g>
        <path d="M 40 40 L 60 60 M 140 140 L 160 160 M 40 160 L 60 140 M 140 60 L 160 40" stroke="url(#circuitGradient)" stroke-width="2" opacity="0.5" stroke-dasharray="2,2">
            <animate attributeName="stroke-dashoffset" values="0;4" dur="1s" repeatCount="indefinite"/>
        </path>
    </svg>`,

    'ancient-history': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ancientGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#d63031;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e17055;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fdcb6e;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#e84393;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#ancientGradient)" opacity="0.1"/>
        <g transform="translate(100,120)">
            <polygon points="-30,0 -20,-40 20,-40 30,0" fill="url(#ancientGradient)" opacity="0.8"/>
            <rect x="-25" y="-35" width="50" height="8" fill="url(#goldGradient)"/>
            <rect x="-20" y="-30" width="8" height="25" fill="url(#goldGradient)" opacity="0.6"/>
            <rect x="-5" y="-30" width="8" height="25" fill="url(#goldGradient)" opacity="0.6"/>
            <rect x="10" y="-30" width="8" height="25" fill="url(#goldGradient)" opacity="0.6"/>
        </g>
        <g transform="translate(70,70)" opacity="0.7">
            <circle cx="0" cy="0" r="8" fill="url(#goldGradient)"/>
            <polygon points="0,-12 3,-6 9,-6 4.5,-1 6,5 0,2 -6,5 -4.5,-1 -9,-6 -3,-6" fill="url(#goldGradient)"/>
        </g>
        <g transform="translate(130,80)" opacity="0.6">
            <rect x="-8" y="-15" width="16" height="30" rx="2" fill="url(#ancientGradient)"/>
            <circle cx="0" cy="-20" r="4" fill="url(#goldGradient)"/>
            <rect x="-2" y="-25" width="4" height="8" fill="url(#goldGradient)"/>
        </g>
        <g opacity="0.5">
            <path d="M 40 160 Q 50 150 60 160 Q 70 170 80 160" stroke="url(#ancientGradient)" stroke-width="3" fill="none"/>
            <path d="M 120 40 Q 130 30 140 40 Q 150 50 160 40" stroke="url(#ancientGradient)" stroke-width="3" fill="none"/>
        </g>
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#goldGradient)" stroke-width="1" opacity="0.4" stroke-dasharray="6,6">
            <animate attributeName="stroke-dashoffset" values="0;12" dur="4s" repeatCount="indefinite"/>
        </circle>
    </svg>`,

    'literature-arts': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6c5ce7;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#a29bfe;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="quillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#bookGradient)" opacity="0.1"/>
        <g transform="translate(100,100)">
            <rect x="-20" y="-25" width="40" height="50" rx="3" fill="url(#bookGradient)" opacity="0.8"/>
            <rect x="-18" y="-23" width="36" height="46" rx="2" fill="#fff" opacity="0.9"/>
            <line x1="-10" y1="-15" x2="10" y2="-15" stroke="url(#bookGradient)" stroke-width="2"/>
            <line x1="-10" y1="-8" x2="10" y2="-8" stroke="url(#bookGradient)" stroke-width="2"/>
            <line x1="-10" y1="-1" x2="10" y2="-1" stroke="url(#bookGradient)" stroke-width="2"/>
            <line x1="-10" y1="6" x2="5" y2="6" stroke="url(#bookGradient)" stroke-width="2"/>
        </g>
        <g transform="translate(60,60)" opacity="0.8">
            <path d="M 0 20 Q -2 15 0 10 Q 2 5 0 0" stroke="url(#quillGradient)" stroke-width="3" fill="none"/>
            <ellipse cx="0" cy="0" rx="2" ry="6" fill="url(#quillGradient)"/>
            <path d="M -1 18 Q 0 22 1 18" stroke="url(#quillGradient)" stroke-width="2" fill="none"/>
        </g>
        <g transform="translate(140,140)" opacity="0.6">
            <circle cx="0" cy="0" r="8" fill="none" stroke="url(#bookGradient)" stroke-width="2"/>
            <polygon points="0,-5 3,0 0,5 -3,0" fill="url(#bookGradient)">
                <animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite"/>
            </polygon>
        </g>
        <g opacity="0.4">
            <circle cx="50" cy="150" r="2" fill="url(#quillGradient)">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="150" cy="50" r="2" fill="url(#quillGradient)">
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.5s" repeatCount="indefinite"/>
            </circle>
        </g>
        <path d="M 30 30 Q 100 50 170 30" stroke="url(#bookGradient)" stroke-width="2" fill="none" opacity="0.3" stroke-dasharray="4,4">
            <animate attributeName="stroke-dashoffset" values="0;8" dur="3s" repeatCount="indefinite"/>
        </path>
    </svg>`
};

// Add more SVG templates for all remaining categories
Object.assign(svgTemplates, {
    'breakout': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#gameGradient)" opacity="0.1"/>
        <rect x="40" y="40" width="15" height="8" fill="#ff6b6b"/>
        <rect x="60" y="40" width="15" height="8" fill="#4ecdc4"/>
        <rect x="80" y="40" width="15" height="8" fill="#feca57"/>
        <rect x="100" y="40" width="15" height="8" fill="#ff6b6b"/>
        <rect x="120" y="40" width="15" height="8" fill="#4ecdc4"/>
        <rect x="140" y="40" width="15" height="8" fill="#feca57"/>
        <rect x="40" y="55" width="15" height="8" fill="#4ecdc4"/>
        <rect x="60" y="55" width="15" height="8" fill="#feca57"/>
        <rect x="80" y="55" width="15" height="8" fill="#ff6b6b"/>
        <rect x="100" y="55" width="15" height="8" fill="#4ecdc4"/>
        <rect x="120" y="55" width="15" height="8" fill="#feca57"/>
        <rect x="140" y="55" width="15" height="8" fill="#ff6b6b"/>
        <rect x="80" y="160" width="40" height="8" rx="4" fill="url(#gameGradient)"/>
        <circle cx="100" cy="140" r="4" fill="#fff">
            <animate attributeName="cy" values="140;80;140" dur="2s" repeatCount="indefinite"/>
        </circle>
    </svg>`,

    'communication-skills': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="commGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#commGradient)" opacity="0.1"/>
        <g transform="translate(70,80)">
            <ellipse cx="0" cy="0" rx="20" ry="15" fill="none" stroke="url(#commGradient)" stroke-width="3"/>
            <path d="M 20 0 L 35 -10 L 35 10 Z" fill="url(#commGradient)"/>
        </g>
        <g transform="translate(130,120)">
            <ellipse cx="0" cy="0" rx="20" ry="15" fill="none" stroke="url(#commGradient)" stroke-width="3"/>
            <path d="M -20 0 L -35 -10 L -35 10 Z" fill="url(#commGradient)"/>
        </g>
        <g opacity="0.6">
            <circle cx="50" cy="50" r="2" fill="url(#commGradient)">
                <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="150" cy="150" r="2" fill="url(#commGradient)">
                <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
            </circle>
        </g>
        <path d="M 90 95 Q 100 85 110 95" stroke="url(#commGradient)" stroke-width="2" fill="none" stroke-dasharray="3,3">
            <animate attributeName="stroke-dashoffset" values="0;6" dur="1s" repeatCount="indefinite"/>
        </path>
    </svg>`,

    'creative-arts': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="artGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#artGradient)" opacity="0.1"/>
        <g transform="translate(100,120)">
            <ellipse cx="0" cy="0" rx="25" ry="15" fill="url(#artGradient)" opacity="0.8"/>
            <rect x="-20" y="-10" width="40" height="5" fill="#333"/>
            <circle cx="-15" cy="-5" r="3" fill="#ff6b6b"/>
            <circle cx="-5" cy="-5" r="3" fill="#4ecdc4"/>
            <circle cx="5" cy="-5" r="3" fill="#feca57"/>
            <circle cx="15" cy="-5" r="3" fill="#a29bfe"/>
        </g>
        <g transform="translate(80,60)">
            <path d="M 0 20 Q -2 15 0 10 Q 2 5 0 0" stroke="#333" stroke-width="4" fill="none"/>
            <ellipse cx="0" cy="0" rx="3" ry="8" fill="#e17055"/>
        </g>
        <g opacity="0.7">
            <circle cx="60" cy="80" r="4" fill="#ff6b6b"/>
            <circle cx="140" cy="60" r="3" fill="#4ecdc4"/>
            <circle cx="50" cy="140" r="3" fill="#feca57"/>
            <circle cx="150" cy="140" r="4" fill="#a29bfe"/>
        </g>
        <path d="M 40 40 Q 100 20 160 40 Q 180 100 160 160 Q 100 180 40 160 Q 20 100 40 40" stroke="url(#artGradient)" stroke-width="2" fill="none" opacity="0.3" stroke-dasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="3s" repeatCount="indefinite"/>
        </path>
    </svg>`,

    'crossword': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="crosswordGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#crosswordGradient)" opacity="0.1"/>
        <g transform="translate(100,100)">
            <rect x="-40" y="-40" width="80" height="80" fill="#fff" stroke="url(#crosswordGradient)" stroke-width="2"/>
            <g stroke="url(#crosswordGradient)" stroke-width="1">
                <line x1="-40" y1="-20" x2="40" y2="-20"/>
                <line x1="-40" y1="0" x2="40" y2="0"/>
                <line x1="-40" y1="20" x2="40" y2="20"/>
                <line x1="-20" y1="-40" x2="-20" y2="40"/>
                <line x1="0" y1="-40" x2="0" y2="40"/>
                <line x1="20" y1="-40" x2="20" y2="40"/>
            </g>
            <rect x="-30" y="-30" width="20" height="20" fill="#333"/>
            <rect x="10" y="-30" width="20" height="20" fill="#333"/>
            <rect x="-30" y="10" width="20" height="20" fill="#333"/>
            <text x="-25" y="-5" font-family="Arial" font-size="12" fill="url(#crosswordGradient)" text-anchor="middle">A</text>
            <text x="-5" y="-5" font-family="Arial" font-size="12" fill="url(#crosswordGradient)" text-anchor="middle">B</text>
            <text x="15" y="-5" font-family="Arial" font-size="12" fill="url(#crosswordGradient)" text-anchor="middle">C</text>
        </g>
    </svg>`,

    'food-culture': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="foodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fdcb6e;stop-opacity:1" />
            </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#foodGradient)" opacity="0.1"/>
        <g transform="translate(100,120)">
            <ellipse cx="0" cy="0" rx="30" ry="8" fill="url(#foodGradient)" opacity="0.6"/>
            <circle cx="0" cy="-10" r="25" fill="none" stroke="url(#foodGradient)" stroke-width="3"/>
            <circle cx="-10" cy="-15" r="4" fill="#ff6b6b"/>
            <circle cx="0" cy="-15" r="4" fill="#4ecdc4"/>
            <circle cx="10" cy="-15" r="4" fill="#feca57"/>
            <circle cx="-5" cy="-5" r="3" fill="#a29bfe"/>
            <circle cx="5" cy="-5" r="3" fill="#00b894"/>
        </g>
        <g transform="translate(70,70)" opacity="0.8">
            <rect x="-2" y="0" width="4" height="20" fill="#e17055"/>
            <ellipse cx="0" cy="0" rx="8" ry="4" fill="#00b894"/>
        </g>
        <g transform="translate(130,80)" opacity="0.8">
            <path d="M 0 0 Q -5 -10 0 -15 Q 5 -10 0 0"