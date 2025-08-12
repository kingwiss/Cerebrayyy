/**
 * Performance Monitor - Comprehensive performance tracking and optimization
 * Monitors app performance, detects jitters, and provides optimization suggestions
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            memoryUsage: [],
            renderTimes: [],
            touchLatency: [],
            animationFrames: [],
            domQueries: 0,
            eventListeners: 0
        };
        
        this.thresholds = {
            minFPS: 55, // Target 60 FPS, alert below 55
            maxMemory: 100, // MB
            maxRenderTime: 16, // ms (60 FPS = 16.67ms per frame)
            maxTouchLatency: 50, // ms
            maxDOMQueries: 100 // per second
        };
        
        this.isMonitoring = false;
        this.performanceObserver = null;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        
        this.init();
    }
    
    init() {
        this.setupFPSMonitoring();
        this.setupMemoryMonitoring();
        this.setupRenderTimeMonitoring();
        this.setupTouchLatencyMonitoring();
        this.setupDOMQueryMonitoring();
        this.setupPerformanceObserver();
        this.createPerformancePanel();
    }
    
    // FPS Monitoring
    setupFPSMonitoring() {
        const measureFPS = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastFrameTime;
            const fps = 1000 / deltaTime;
            
            this.metrics.fps.push(fps);
            if (this.metrics.fps.length > 60) {
                this.metrics.fps.shift(); // Keep last 60 frames
            }
            
            this.frameCount++;
            this.lastFrameTime = currentTime;
            
            // Alert on low FPS
            if (fps < this.thresholds.minFPS) {
                this.alertPerformanceIssue('Low FPS', `FPS dropped to ${fps.toFixed(1)}`);
            }
            
            if (this.isMonitoring) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        this.startFPSMonitoring = () => {
            this.isMonitoring = true;
            requestAnimationFrame(measureFPS);
        };
        
        this.stopFPSMonitoring = () => {
            this.isMonitoring = false;
        };
    }
    
    // Memory Usage Monitoring
    setupMemoryMonitoring() {
        this.monitorMemory = () => {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                
                this.metrics.memoryUsage.push(usedMB);
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
                
                if (usedMB > this.thresholds.maxMemory) {
                    this.alertPerformanceIssue('High Memory Usage', `Memory usage: ${usedMB.toFixed(1)}MB`);
                }
            }
        };
        
        // Monitor memory every 5 seconds
        setInterval(this.monitorMemory, 5000);
    }
    
    // Render Time Monitoring
    setupRenderTimeMonitoring() {
        this.measureRenderTime = (callback) => {
            const startTime = performance.now();
            
            return (...args) => {
                const result = callback.apply(this, args);
                const endTime = performance.now();
                const renderTime = endTime - startTime;
                
                this.metrics.renderTimes.push(renderTime);
                if (this.metrics.renderTimes.length > 50) {
                    this.metrics.renderTimes.shift();
                }
                
                if (renderTime > this.thresholds.maxRenderTime) {
                    this.alertPerformanceIssue('Slow Render', `Render took ${renderTime.toFixed(1)}ms`);
                }
                
                return result;
            };
        };
    }
    
    // Touch Latency Monitoring
    setupTouchLatencyMonitoring() {
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartTime = performance.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (touchStartTime) {
                const latency = performance.now() - touchStartTime;
                this.metrics.touchLatency.push(latency);
                
                if (this.metrics.touchLatency.length > 50) {
                    this.metrics.touchLatency.shift();
                }
                
                if (latency > this.thresholds.maxTouchLatency) {
                    this.alertPerformanceIssue('High Touch Latency', `Touch latency: ${latency.toFixed(1)}ms`);
                }
            }
        }, { passive: true });
    }
    
    // DOM Query Monitoring
    setupDOMQueryMonitoring() {
        const originalQuerySelector = document.querySelector;
        const originalQuerySelectorAll = document.querySelectorAll;
        const originalGetElementById = document.getElementById;
        
        let queryCount = 0;
        const resetQueryCount = () => {
            if (queryCount > this.thresholds.maxDOMQueries) {
                this.alertPerformanceIssue('Excessive DOM Queries', `${queryCount} queries in 1 second`);
            }
            queryCount = 0;
        };
        
        // Override DOM query methods
        document.querySelector = function(...args) {
            queryCount++;
            return originalQuerySelector.apply(this, args);
        };
        
        document.querySelectorAll = function(...args) {
            queryCount++;
            return originalQuerySelectorAll.apply(this, args);
        };
        
        document.getElementById = function(...args) {
            queryCount++;
            return originalGetElementById.apply(this, args);
        };
        
        setInterval(resetQueryCount, 1000);
    }
    
    // Performance Observer for Web Vitals
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
                
                if (lastEntry.startTime > 2500) {
                    this.alertPerformanceIssue('Slow LCP', `LCP: ${lastEntry.startTime.toFixed(0)}ms`);
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    
                    const fid = entry.processingStart - entry.startTime;
                    if (fid > 100) {
                        this.alertPerformanceIssue('High FID', `FID: ${fid.toFixed(0)}ms`);
                    }
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            
            // Cumulative Layout Shift
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                
                if (clsValue > 0.1) {
                    this.alertPerformanceIssue('High CLS', `CLS: ${clsValue.toFixed(3)}`);
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    // Performance Alert System
    alertPerformanceIssue(type, message) {
        console.warn(`🚨 Performance Issue - ${type}: ${message}`);
        
        // Show visual alert if performance panel exists
        const alertsContainer = document.getElementById('performance-alerts');
        if (alertsContainer) {
            const alert = document.createElement('div');
            alert.className = 'performance-alert';
            alert.innerHTML = `
                <span class="alert-type">${type}</span>
                <span class="alert-message">${message}</span>
                <span class="alert-time">${new Date().toLocaleTimeString()}</span>
            `;
            
            alertsContainer.appendChild(alert);
            
            // Remove alert after 5 seconds
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 5000);
        }
    }
    
    // Performance Panel UI
    createPerformancePanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.innerHTML = `
            <div class="performance-header">
                <h3>🚀 Performance Monitor</h3>
                <button id="toggle-monitoring">Start</button>
                <button id="clear-metrics">Clear</button>
            </div>
            <div class="performance-metrics">
                <div class="metric">
                    <label>FPS:</label>
                    <span id="fps-display">--</span>
                </div>
                <div class="metric">
                    <label>Memory:</label>
                    <span id="memory-display">--</span>
                </div>
                <div class="metric">
                    <label>Render Time:</label>
                    <span id="render-display">--</span>
                </div>
                <div class="metric">
                    <label>Touch Latency:</label>
                    <span id="touch-display">--</span>
                </div>
            </div>
            <div id="performance-alerts"></div>
            <div class="performance-suggestions">
                <h4>💡 Optimization Suggestions:</h4>
                <ul id="suggestions-list"></ul>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #performance-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 300px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px;
                border-radius: 10px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                display: none;
            }
            
            .performance-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .performance-header h3 {
                margin: 0;
                font-size: 14px;
            }
            
            .performance-header button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
                margin-left: 5px;
            }
            
            .performance-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
            }
            
            .performance-alert {
                background: #ff4444;
                padding: 5px;
                margin: 2px 0;
                border-radius: 3px;
                font-size: 10px;
            }
            
            .performance-suggestions {
                margin-top: 15px;
            }
            
            .performance-suggestions h4 {
                margin: 0 0 5px 0;
                font-size: 12px;
            }
            
            .performance-suggestions ul {
                margin: 0;
                padding-left: 15px;
                font-size: 10px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(panel);
        
        // Add event listeners
        document.getElementById('toggle-monitoring').addEventListener('click', () => {
            if (this.isMonitoring) {
                this.stopFPSMonitoring();
                document.getElementById('toggle-monitoring').textContent = 'Start';
            } else {
                this.startFPSMonitoring();
                document.getElementById('toggle-monitoring').textContent = 'Stop';
            }
        });
        
        document.getElementById('clear-metrics').addEventListener('click', () => {
            this.clearMetrics();
        });
        
        // Update display every second
        setInterval(() => {
            this.updateDisplay();
        }, 1000);
        
        // Show/hide panel with Ctrl+Shift+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                const panel = document.getElementById('performance-panel');
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    updateDisplay() {
        const avgFPS = this.metrics.fps.length > 0 ? 
            (this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length).toFixed(1) : '--';
        
        const currentMemory = this.metrics.memoryUsage.length > 0 ? 
            this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1].toFixed(1) + 'MB' : '--';
        
        const avgRenderTime = this.metrics.renderTimes.length > 0 ? 
            (this.metrics.renderTimes.reduce((a, b) => a + b, 0) / this.metrics.renderTimes.length).toFixed(1) + 'ms' : '--';
        
        const avgTouchLatency = this.metrics.touchLatency.length > 0 ? 
            (this.metrics.touchLatency.reduce((a, b) => a + b, 0) / this.metrics.touchLatency.length).toFixed(1) + 'ms' : '--';
        
        document.getElementById('fps-display').textContent = avgFPS;
        document.getElementById('memory-display').textContent = currentMemory;
        document.getElementById('render-display').textContent = avgRenderTime;
        document.getElementById('touch-display').textContent = avgTouchLatency;
        
        this.updateSuggestions();
    }
    
    updateSuggestions() {
        const suggestions = [];
        
        const avgFPS = this.metrics.fps.length > 0 ? 
            this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length : 60;
        
        if (avgFPS < 55) {
            suggestions.push('Reduce CSS animations or use transform instead of changing layout properties');
        }
        
        const currentMemory = this.metrics.memoryUsage.length > 0 ? 
            this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] : 0;
        
        if (currentMemory > 80) {
            suggestions.push('Consider implementing object pooling or reducing DOM elements');
        }
        
        const avgRenderTime = this.metrics.renderTimes.length > 0 ? 
            this.metrics.renderTimes.reduce((a, b) => a + b, 0) / this.metrics.renderTimes.length : 0;
        
        if (avgRenderTime > 12) {
            suggestions.push('Optimize rendering by batching DOM updates');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('Performance looks good! 🎉');
        }
        
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }
    
    clearMetrics() {
        this.metrics = {
            fps: [],
            memoryUsage: [],
            renderTimes: [],
            touchLatency: [],
            animationFrames: [],
            domQueries: 0,
            eventListeners: 0
        };
        
        document.getElementById('performance-alerts').innerHTML = '';
    }
    
    // Public API
    getMetrics() {
        return this.metrics;
    }
    
    getPerformanceReport() {
        const avgFPS = this.metrics.fps.length > 0 ? 
            this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length : 0;
        
        const avgMemory = this.metrics.memoryUsage.length > 0 ? 
            this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length : 0;
        
        const avgRenderTime = this.metrics.renderTimes.length > 0 ? 
            this.metrics.renderTimes.reduce((a, b) => a + b, 0) / this.metrics.renderTimes.length : 0;
        
        return {
            fps: avgFPS,
            memory: avgMemory,
            renderTime: avgRenderTime,
            score: this.calculatePerformanceScore()
        };
    }
    
    calculatePerformanceScore() {
        let score = 100;
        
        const avgFPS = this.metrics.fps.length > 0 ? 
            this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length : 60;
        
        if (avgFPS < 60) score -= (60 - avgFPS) * 2;
        
        const currentMemory = this.metrics.memoryUsage.length > 0 ? 
            this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] : 0;
        
        if (currentMemory > 50) score -= (currentMemory - 50);
        
        return Math.max(0, Math.min(100, score));
    }
}

// Initialize performance monitor when DOM is ready
if (typeof window !== 'undefined') {
    window.performanceMonitor = new PerformanceMonitor();
    
    // Auto-start monitoring in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🚀 Performance Monitor initialized. Press Ctrl+Shift+P to toggle panel.');
    }
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}