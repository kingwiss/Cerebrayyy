require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const USERS_FILE = path.join(__dirname, 'users.json');
const RESET_TOKENS_FILE = path.join(__dirname, 'reset-tokens.json');

// Email configuration (SendGrid)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

// Initialize users file if it doesn't exist
async function initializeUsersFile() {
    try {
        await fs.promises.access(USERS_FILE);
    } catch (error) {
        await fs.promises.writeFile(USERS_FILE, JSON.stringify([]));
    }
}

// Stripe configuration endpoint
app.get('/api/stripe-config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// Helper functions
async function readUsers() {
    try {
        const data = await fs.promises.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeUsers(users) {
    await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function findUserByEmail(email) {
    const users = await readUsers();
    return users.find(user => user.email === email);
}

// Reset token management
async function readResetTokens() {
    try {
        if (!fs.existsSync(RESET_TOKENS_FILE)) {
            await fs.promises.writeFile(RESET_TOKENS_FILE, '[]');
        }
        const data = await fs.promises.readFile(RESET_TOKENS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading reset tokens:', error);
        return [];
    }
}

async function writeResetTokens(tokens) {
    await fs.promises.writeFile(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

async function createResetToken(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    const tokens = await readResetTokens();
    // Remove any existing tokens for this email
    const filteredTokens = tokens.filter(t => t.email !== email);
    
    filteredTokens.push({
        email,
        token,
        expiry: expiry.toISOString(),
        used: false
    });
    
    await writeResetTokens(filteredTokens);
    return token;
}

async function validateResetToken(token) {
    const tokens = await readResetTokens();
    const resetToken = tokens.find(t => t.token === token && !t.used);
    
    if (!resetToken) {
        return null;
    }
    
    if (new Date() > new Date(resetToken.expiry)) {
        return null;
    }
    
    return resetToken;
}

async function markTokenAsUsed(token) {
    const tokens = await readResetTokens();
    const tokenIndex = tokens.findIndex(t => t.token === token);
    
    if (tokenIndex !== -1) {
        tokens[tokenIndex].used = true;
        await writeResetTokens(tokens);
    }
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Validation
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, password, and username are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email,
            username,
            password: hashedPassword,
            tier: 'basic', // Add tier field
            createdAt: new Date().toISOString()
        };

        // Save user
        const users = await readUsers();
        users.push(newUser);
        await writeUsers(users);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                tier: newUser.tier
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                tier: user.tier || 'basic'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user (protected route)
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const user = await findUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                tier: user.tier || 'basic'
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to upgrade a user to premium
app.post('/api/user/upgrade', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const users = await readUsers();
        const userIndex = users.findIndex(user => user.email === email);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[userIndex].tier = 'premium';
        await writeUsers(users);

        res.json({ message: 'User upgraded to premium successfully' });
    } catch (error) {
        console.error('Upgrade error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token
app.post('/api/verify-token', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            username: req.user.username
        }
    });
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await findUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = await createResetToken(email);
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;

        // Send email using SendGrid
        const msg = {
            to: email,
            from: FROM_EMAIL,
            subject: 'Password Reset - Cerebray',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4ecdc4;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested a password reset for your Cerebray account. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4ecdc4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">This email was sent by Cerebray Brain Training Platform</p>
                </div>
            `
        };

        await sgMail.send(msg);
        console.log('Password reset email sent to:', email);
        
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Validate reset token
        const resetToken = await validateResetToken(token);
        if (!resetToken) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Find user
        const user = await findUserByEmail(resetToken.email);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.email === resetToken.email);
        if (userIndex !== -1) {
            users[userIndex].password = hashedPassword;
            await writeUsers(users);
        }

        // Mark token as used
        await markTokenAsUsed(token);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Validate reset token endpoint
app.get('/api/validate-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const resetToken = await validateResetToken(token);
        
        if (resetToken) {
            res.json({ valid: true, email: resetToken.email });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        console.error('Validate token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Free TTS endpoint using multiple high-quality APIs
app.post('/api/free-tts', async (req, res) => {
    try {
        const { text, voice_id } = req.body;
        
        console.log('🔄 Generating free high-quality TTS for voice:', voice_id);
        
        // Try multiple free TTS services in order of quality
        let audioBuffer = null;
        
        // 1. Try Edge TTS (Microsoft's free service - highest quality)
        try {
            audioBuffer = await generateEdgeTTS(text, voice_id);
            if (audioBuffer) {
                console.log('✅ Successfully generated audio with Edge TTS');
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.length
                });
                return res.send(audioBuffer);
            }
        } catch (error) {
            console.log('⚠️ Edge TTS failed, trying next service...');
        }
        
        // 2. Try Google Translate TTS (free, good quality)
        try {
            audioBuffer = await generateGoogleTTS(text, voice_id);
            if (audioBuffer) {
                console.log('✅ Successfully generated audio with Google TTS');
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.length
                });
                return res.send(audioBuffer);
            }
        } catch (error) {
            console.log('⚠️ Google TTS failed, trying next service...');
        }
        
        // 3. Try ResponsiveVoice (free tier)
        try {
            audioBuffer = await generateResponsiveVoiceTTS(text, voice_id);
            if (audioBuffer) {
                console.log('✅ Successfully generated audio with ResponsiveVoice');
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.length
                });
                return res.send(audioBuffer);
            }
        } catch (error) {
            console.log('⚠️ ResponsiveVoice failed');
        }
        
        throw new Error('All free TTS services failed');
        
    } catch (error) {
        console.error('❌ Free TTS error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Edge TTS implementation (Microsoft's free service)
async function generateEdgeTTS(text, voiceId) {
    try {
        // Map voice IDs to Edge TTS voices
        const voiceMap = {
            'female': 'en-US-AriaNeural',
            'male': 'en-US-DavisNeural',
            'british-female': 'en-GB-SoniaNeural',
            'british-male': 'en-GB-RyanNeural',
            'default': 'en-US-JennyNeural'
        };
        
        const edgeVoice = voiceMap[voiceId] || voiceMap['default'];
        
        // Create SSML for better speech quality
        const ssml = `
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="${edgeVoice}">
                    <prosody rate="1.0" pitch="0%" volume="100%">
                        ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                    </prosody>
                </voice>
            </speak>
        `;
        
        // Use edge-tts via a simple HTTP request
        const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: ssml
        });
        
        if (response.ok) {
            return await response.buffer();
        }
        throw new Error('Edge TTS request failed');
        
    } catch (error) {
        console.error('Edge TTS error:', error);
        return null;
    }
}

// Google Translate TTS implementation
async function generateGoogleTTS(text, voiceId) {
    try {
        // Google Translate TTS endpoint (free)
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob&ttsspeed=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.ok) {
            return await response.buffer();
        }
        throw new Error('Google TTS request failed');
        
    } catch (error) {
        console.error('Google TTS error:', error);
        return null;
    }
}

// ResponsiveVoice TTS implementation
async function generateResponsiveVoiceTTS(text, voiceId) {
    try {
        // ResponsiveVoice free API
        const voiceMap = {
            'female': 'US English Female',
            'male': 'US English Male',
            'british-female': 'UK English Female',
            'british-male': 'UK English Male',
            'default': 'US English Female'
        };
        
        const voice = voiceMap[voiceId] || voiceMap['default'];
        
        const url = `https://code.responsivevoice.org/getvoice.php?t=${encodeURIComponent(text)}&tl=en&sv=&vn=${encodeURIComponent(voice)}&pitch=0.5&rate=0.5&vol=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.ok) {
            return await response.buffer();
        }
        throw new Error('ResponsiveVoice request failed');
        
    } catch (error) {
        console.error('ResponsiveVoice error:', error);
        return null;
    }
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, async () => {
    await initializeUsersFile();
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
    console.log('📱 Open this URL in your browser to test the app');
    console.log('🔄 Press Ctrl+C to stop the server');
});