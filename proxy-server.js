const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

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

// Legacy ElevenLabs endpoint (kept for compatibility)
app.post('/api/elevenlabs/tts', async (req, res) => {
    try {
        const { text, voice_id, api_key } = req.body;
        
        console.log('🔄 ElevenLabs request received, redirecting to free TTS...');
        
        // Redirect to free TTS service
        const freeTTSResponse = await fetch('http://localhost:3001/api/free-tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, voice_id })
        });
        
        if (freeTTSResponse.ok) {
            const audioBuffer = await freeTTSResponse.buffer();
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length
            });
            res.send(audioBuffer);
            console.log('✅ Successfully redirected to free TTS');
        } else {
            throw new Error('Free TTS service failed');
        }
        
    } catch (error) {
        console.error('❌ Proxy error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Handle API key update
app.post('/update-api-key', async (req, res) => {
    try {
        const { apiKey } = req.body;
        
        if (!apiKey || !apiKey.startsWith('sk_')) {
            return res.status(400).json({ error: 'Invalid API key format' });
        }

        // Test the API key first
        const testResponse = await fetch(`https://api.elevenlabs.io/v1/voices`, {
            headers: {
                'xi-api-key': apiKey
            }
        });

        if (!testResponse.ok) {
            return res.status(400).json({ error: 'API key validation failed' });
        }

        // Read and update script.js
        const fs = require('fs');
        const path = require('path');
        const scriptPath = path.join(__dirname, 'script.js');
        
        let scriptContent = fs.readFileSync(scriptPath, 'utf8');
        scriptContent = scriptContent.replace(
            /this\.elevenLabsApiKey = '[^']*'/,
            `this.elevenLabsApiKey = '${apiKey}'`
        );
        
        fs.writeFileSync(scriptPath, scriptContent);
        
        res.json({ success: true, message: 'API key updated successfully' });
        
    } catch (error) {
        console.error('Error updating API key:', error);
        res.status(500).json({ error: 'Failed to update API key' });
    }
});

// Free TTS voices endpoint
app.get('/api/free-tts/voices', async (req, res) => {
    try {
        const voices = {
            voices: [
                {
                    voice_id: 'female',
                    name: 'Aria (US Female)',
                    category: 'premade',
                    description: 'High-quality US English female voice using Microsoft Edge TTS'
                },
                {
                    voice_id: 'male',
                    name: 'Davis (US Male)',
                    category: 'premade',
                    description: 'High-quality US English male voice using Microsoft Edge TTS'
                },
                {
                    voice_id: 'british-female',
                    name: 'Sonia (UK Female)',
                    category: 'premade',
                    description: 'High-quality British English female voice using Microsoft Edge TTS'
                },
                {
                    voice_id: 'british-male',
                    name: 'Ryan (UK Male)',
                    category: 'premade',
                    description: 'High-quality British English male voice using Microsoft Edge TTS'
                },
                {
                    voice_id: 'default',
                    name: 'Jenny (Default)',
                    category: 'premade',
                    description: 'Default high-quality voice using Microsoft Edge TTS'
                }
            ]
        };
        
        console.log('✅ Returning free TTS voices');
        res.json(voices);
        
    } catch (error) {
        console.error('❌ Free TTS voices error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Legacy ElevenLabs voices endpoint (redirects to free TTS)
app.get('/api/elevenlabs/voices', async (req, res) => {
    try {
        console.log('🔄 ElevenLabs voices request received, redirecting to free TTS voices...');
        
        // Redirect to free TTS voices
        const freeTTSResponse = await fetch('http://localhost:3001/api/free-tts/voices');
        
        if (freeTTSResponse.ok) {
            const voices = await freeTTSResponse.json();
            res.json(voices);
            console.log('✅ Successfully redirected to free TTS voices');
        } else {
            throw new Error('Free TTS voices service failed');
        }
        
    } catch (error) {
        console.error('❌ Voices proxy error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Free TTS Proxy Server running on http://localhost:${PORT}`);
    console.log('🎵 Free High-Quality TTS: POST /api/free-tts');
    console.log('🎤 Free TTS Voices: GET /api/free-tts/voices');
    console.log('📡 Legacy ElevenLabs proxy: POST /api/elevenlabs/tts (redirects to free TTS)');
    console.log('🔄 Legacy ElevenLabs voices: GET /api/elevenlabs/voices (redirects to free TTS)');
    console.log('');
    console.log('🌟 Using Microsoft Edge TTS, Google TTS, and ResponsiveVoice');
    console.log('💰 100% Free - No API keys required!');
});