/**
 * Web Vitals Tracker - Monitors Core Web Vitals for performance optimization
 * Tracks LCP, FID, CLS, FCP, and TTFB to ensure optimal user experience
 */

class WebVitalsTracker {
    constructor() {
        this.vitals = {
            lcp: null,
            fid: null,
            cls: 0,
            fcp: null,
            ttfb: null
        };
        
        this.thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            fcp: { good: 1800, poor: 3000 },
            ttfb: { good: 800, poor: 1800 }
        };
        
        this.callbacks = [];
        this.init();
    }
    
    init() {
        this.trackLCP();
        this.trackFID();
        this.trackCLS();
        this.trackFCP();
        this.trackTTFB();
        this.createVitalsDisplay();
    }
    
    // Largest Contentful Paint
    trackLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.vitals.lcp = lastEntry.startTime;
                this.notifyCallbacks('lcp', lastEntry.startTime);
                this.updateDisplay();
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
    
    // First Input Delay
    trackFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    const fid = entry.processingStart - entry.startTime;
                    this.vitals.fid = fid;
                    this.notifyCallbacks('fid', fid);
                    this.updateDisplay();
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        }
    }
    
    // Cumulative Layout Shift
    trackCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                
                this.vitals.cls = clsValue;
                this.notifyCallbacks('cls', clsValue);
                this.updateDisplay();
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    // First Contentful Paint
    trackFCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.vitals.fcp = entry.startTime;
                        this.notifyCallbacks('fcp', entry.startTime);
                        this.updateDisplay();
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
        }
    }
    
    // Time to First Byte
    trackTTFB() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const ttfb = entry.responseStart - entry.requestStart;
                        this.vitals.ttfb = ttfb;
                        this.notifyCallbacks('ttfb', ttfb);
                        this.updateDisplay();
                    }
                });
            });
            
            observer.observe({ entryTypes: ['navigation'] });
        }
    }
    
    // Get rating for a metric
    getRating(metric, value) {
        const threshold = this.thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }
    
    // Get color for rating
    getRatingColor(rating) {
        switch (rating) {
            case 'good': return '#0CCE6B';
            case 'needs-improvement': return '#FFA400';
            case 'poor': return '#FF4E42';
            default: return '#9AA0A6';
        }
    }
    
    // Create visual display
    createVitalsDisplay() {
        const display = document.createElement('div');
        display.id = 'web-vitals-display';
        display.innerHTML = `
            <div class="vitals-header">
                <h3>📊 Core Web Vitals</h3>
                <button id="toggle-vitals">Hide</button>
            </div>
            <div class="vitals-grid">
                <div class="vital-item" data-metric="lcp">
                    <div class="vital-label">LCP</div>
                    <div class="vital-value" id="lcp-value">--</div>
                    <div class="vital-rating" id="lcp-rating">--</div>
                </div>
                <div class="vital-item" data-metric="fid">
                    <div class="vital-label">FID</div>
                    <div class="vital-value" id="fid-value">--</div>
                    <div class="vital-rating" id="fid-rating">--</div>
                </div>
                <div class="vital-item" data-metric="cls">
                    <div class="vital-label">CLS</div>
                    <div class="vital-value" id="cls-value">--</div>
                    <div class="vital-rating" id="cls-rating">--</div>
                </div>
                <div class="vital-item" data-metric="fcp">
                    <div class="vital-label">FCP</div>
                    <div class="vital-value" id="fcp-value">--</div>
                    <div class="vital-rating" id="fcp-rating">--</div>
                </div>
                <div class="vital-item" data-metric="ttfb">
                    <div class="vital-label">TTFB</div>
                    <div class="vital-value" id="ttfb-value">--</div>
                    <div class="vital-rating" id="ttfb-rating">--</div>
                </div>
            </div>
            <div class="vitals-score">
                <div class="score-label">Overall Score:</div>
                <div class="score-value" id="overall-score">--</div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #web-vitals-display {
                position: fixed;
                bottom: 10px;
                left: 10px;
                width: 320px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 12px;
                padding: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                display: none;
            }
            
            .vitals-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .vitals-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #202124;
            }
            
            .vitals-header button {
                background: #1a73e8;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
            }
            
            .vitals-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .vital-item {
                text-align: center;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 2px solid transparent;
                transition: all 0.2s ease;
            }
            
            .vital-label {
                font-size: 12px;
                font-weight: 600;
                color: #5f6368;
                margin-bottom: 4px;
            }
            
            .vital-value {
                font-size: 18px;
                font-weight: 700;
                color: #202124;
                margin-bottom: 4px;
            }
            
            .vital-rating {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                padding: 2px 6px;
                border-radius: 4px;
                background: #e8eaed;
                color: #5f6368;
            }
            
            .vitals-score {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                color: white;
            }
            
            .score-label {
                font-weight: 600;
            }
            
            .score-value {
                font-size: 24px;
                font-weight: 700;
            }
            
            /* Rating colors */
            .vital-item[data-rating="good"] {
                border-color: #0CCE6B;
            }
            
            .vital-item[data-rating="needs-improvement"] {
                border-color: #FFA400;
            }
            
            .vital-item[data-rating="poor"] {
                border-color: #FF4E42;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(display);
        
        // Add event listeners
        const toggleVitalsBtn = document.getElementById('toggle-vitals');
        const toggleVitalsHandler = () => {
            const display = document.getElementById('web-vitals-display');
            const button = document.getElementById('toggle-vitals');
            
            if (display.style.display === 'none') {
                display.style.display = 'block';
                button.textContent = 'Hide';
            } else {
                display.style.display = 'none';
                button.textContent = 'Show';
            }
        };
        
        toggleVitalsBtn.addEventListener('click', toggleVitalsHandler);
        toggleVitalsBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleVitalsHandler();
        }, { passive: false });
        
        // Show/hide with Ctrl+Shift+V
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                const display = document.getElementById('web-vitals-display');
                display.style.display = display.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    // Update display
    updateDisplay() {
        const formatValue = (metric, value) => {
            if (value === null || value === undefined) return '--';
            
            if (metric === 'cls') {
                return value.toFixed(3);
            } else {
                return Math.round(value) + 'ms';
            }
        };
        
        // Update each metric
        Object.keys(this.vitals).forEach(metric => {
            const value = this.vitals[metric];
            const valueElement = document.getElementById(`${metric}-value`);
            const ratingElement = document.getElementById(`${metric}-rating`);
            const itemElement = document.querySelector(`[data-metric="${metric}"]`);
            
            if (valueElement && ratingElement && itemElement) {
                valueElement.textContent = formatValue(metric, value);
                
                if (value !== null && value !== undefined) {
                    const rating = this.getRating(metric, value);
                    ratingElement.textContent = rating.replace('-', ' ');
                    ratingElement.style.background = this.getRatingColor(rating);
                    ratingElement.style.color = 'white';
                    itemElement.setAttribute('data-rating', rating);
                }
            }
        });
        
        // Update overall score
        this.updateOverallScore();
    }
    
    // Calculate and update overall score
    updateOverallScore() {
        let score = 0;
        let count = 0;
        
        Object.keys(this.vitals).forEach(metric => {
            const value = this.vitals[metric];
            if (value !== null && value !== undefined) {
                const rating = this.getRating(metric, value);
                let points = 0;
                
                switch (rating) {
                    case 'good': points = 100; break;
                    case 'needs-improvement': points = 50; break;
                    case 'poor': points = 0; break;
                }
                
                score += points;
                count++;
            }
        });
        
        const overallScore = count > 0 ? Math.round(score / count) : 0;
        const scoreElement = document.getElementById('overall-score');
        
        if (scoreElement) {
            scoreElement.textContent = overallScore;
            
            // Color based on score
            let color = '#FF4E42'; // poor
            if (overallScore >= 80) color = '#0CCE6B'; // good
            else if (overallScore >= 50) color = '#FFA400'; // needs improvement
            
            scoreElement.style.color = color;
        }
    }
    
    // Add callback for metric updates
    onVitalUpdate(callback) {
        this.callbacks.push(callback);
    }
    
    // Notify callbacks
    notifyCallbacks(metric, value) {
        this.callbacks.forEach(callback => {
            try {
                callback(metric, value, this.getRating(metric, value));
            } catch (error) {
                console.error('Error in Web Vitals callback:', error);
            }
        });
    }
    
    // Get current vitals
    getVitals() {
        return { ...this.vitals };
    }
    
    // Get performance report
    getReport() {
        const report = {
            vitals: this.getVitals(),
            ratings: {},
            overallScore: 0
        };
        
        let totalScore = 0;
        let count = 0;
        
        Object.keys(this.vitals).forEach(metric => {
            const value = this.vitals[metric];
            if (value !== null && value !== undefined) {
                const rating = this.getRating(metric, value);
                report.ratings[metric] = rating;
                
                let points = 0;
                switch (rating) {
                    case 'good': points = 100; break;
                    case 'needs-improvement': points = 50; break;
                    case 'poor': points = 0; break;
                }
                
                totalScore += points;
                count++;
            }
        });
        
        report.overallScore = count > 0 ? Math.round(totalScore / count) : 0;
        return report;
    }
    
    // Send vitals to analytics
    sendToAnalytics() {
        const report = this.getReport();
        
        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            Object.keys(report.vitals).forEach(metric => {
                const value = report.vitals[metric];
                if (value !== null && value !== undefined) {
                    gtag('event', 'web_vital', {
                        metric_name: metric.toUpperCase(),
                        metric_value: Math.round(value),
                        metric_rating: report.ratings[metric]
                    });
                }
            });
        }
        
        // Send to custom analytics endpoint
        if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track('Web Vitals', report);
        }
        
        return report;
    }
}

// Initialize Web Vitals tracker
if (typeof window !== 'undefined') {
    window.webVitalsTracker = new WebVitalsTracker();
    
    // Auto-show in development - DISABLED
    // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    //     setTimeout(() => {
    //         document.getElementById('web-vitals-display').style.display = 'block';
    //     }, 1000);
    //     
    //     console.log('📊 Web Vitals Tracker initialized. Press Ctrl+Shift+V to toggle display.');
    // }
    
    console.log('📊 Web Vitals Tracker initialized. Press Ctrl+Shift+V to toggle display.');
    
    // Send vitals to analytics when page is about to unload
    window.addEventListener('beforeunload', () => {
        window.webVitalsTracker.sendToAnalytics();
    });
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebVitalsTracker;
}