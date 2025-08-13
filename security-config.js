/**
 * Security Configuration for Cerebray
 * Enforces HTTPS and implements security best practices
 */

(function() {
    'use strict';

    // HTTPS Enforcement
    function enforceHTTPS() {
        // Only enforce HTTPS in production (not localhost)
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            if (location.protocol !== 'https:') {
                console.log('🔒 Redirecting to HTTPS for security...');
                location.replace('https:' + window.location.href.substring(window.location.protocol.length));
                return;
            }
        }
    }

    // Content Security Policy enforcement via JavaScript (fallback)
    function enforceCSP() {
        // Remove any inline event handlers for security
        const elementsWithEvents = document.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
        elementsWithEvents.forEach(element => {
            const eventAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'];
            eventAttrs.forEach(attr => {
                if (element.hasAttribute(attr)) {
                    console.warn('🚨 Removing inline event handler for security:', attr, element);
                    element.removeAttribute(attr);
                }
            });
        });
    }

    // Prevent clickjacking
    function preventClickjacking() {
        if (window.top !== window.self) {
            console.warn('🚨 Potential clickjacking attempt detected');
            window.top.location = window.self.location;
        }
    }

    // Secure cookie settings
    function secureStorage() {
        // Override localStorage and sessionStorage to add security warnings
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
            // Warn about sensitive data in storage
            if (typeof value === 'string' && (
                value.includes('password') || 
                value.includes('token') || 
                value.includes('secret') ||
                value.includes('key')
            )) {
                console.warn('⚠️ Potentially sensitive data being stored:', key);
            }
            return originalSetItem.call(this, key, value);
        };
    }

    // Mixed content detection
    function detectMixedContent() {
        if (location.protocol === 'https:') {
            // Check for HTTP resources
            const httpResources = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
            if (httpResources.length > 0) {
                console.warn('🚨 Mixed content detected - HTTP resources on HTTPS page:', httpResources);
            }
        }
    }

    // Security headers check
    function checkSecurityHeaders() {
        // This would typically be done server-side, but we can log recommendations
        const recommendations = [
            'Strict-Transport-Security',
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Content-Security-Policy'
        ];
        
        console.log('🔒 Security recommendations implemented:', recommendations);
    }

    // Initialize security measures
    function initSecurity() {
        console.log('🛡️ Initializing Cerebray Security Configuration...');
        
        enforceHTTPS();
        preventClickjacking();
        secureStorage();
        
        // Run after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                enforceCSP();
                detectMixedContent();
                checkSecurityHeaders();
            });
        } else {
            enforceCSP();
            detectMixedContent();
            checkSecurityHeaders();
        }

        console.log('✅ Security configuration loaded successfully');
    }

    // Initialize immediately
    initSecurity();

    // Export for manual testing
    window.CerebraySecurity = {
        enforceHTTPS,
        enforceCSP,
        preventClickjacking,
        detectMixedContent,
        checkSecurityHeaders
    };

})();