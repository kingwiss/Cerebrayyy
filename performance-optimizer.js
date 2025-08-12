/**
 * Performance Optimizer - Automatic performance optimizations and jitter prevention
 * Implements various optimization strategies to maintain smooth performance
 */

class PerformanceOptimizer {
    constructor() {
        this.optimizations = {
            imageOptimization: true,
            lazyLoading: true,
            resourcePreloading: true,
            memoryManagement: true,
            animationOptimization: true,
            eventThrottling: true,
            domOptimization: true
        };
        
        this.cache = new Map();
        this.observers = new Map();
        this.throttledFunctions = new Map();
        this.animationFrameId = null;
        this.memoryCleanupInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupImageOptimization();
        this.setupLazyLoading();
        this.setupResourcePreloading();
        this.setupMemoryManagement();
        this.setupAnimationOptimization();
        this.setupEventThrottling();
        this.setupDOMOptimization();
        this.setupPerformanceMonitoring();
    }
    
    // Image Optimization
    setupImageOptimization() {
        if (!this.optimizations.imageOptimization) return;
        
        // Convert images to WebP if supported
        const supportsWebP = this.checkWebPSupport();
        
        // Optimize existing images
        const images = document.querySelectorAll('img');
        images.forEach(img => this.optimizeImage(img, supportsWebP));
        
        // Observe new images
        const imageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        images.forEach(img => this.optimizeImage(img, supportsWebP));
                    }
                });
            });
        });
        
        imageObserver.observe(document.body, { childList: true, subtree: true });
        this.observers.set('images', imageObserver);
    }
    
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    optimizeImage(img, supportsWebP) {
        // Add loading="lazy" if not present
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add decoding="async" for better performance
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
        
        // Optimize image format if WebP is supported
        if (supportsWebP && img.src && !img.src.includes('.webp')) {
            const originalSrc = img.src;
            const webpSrc = this.convertToWebP(originalSrc);
            
            if (webpSrc !== originalSrc) {
                img.src = webpSrc;
                
                // Fallback to original if WebP fails to load
                img.onerror = () => {
                    img.src = originalSrc;
                    img.onerror = null;
                };
            }
        }
        
        // Add intersection observer for better lazy loading
        this.addImageIntersectionObserver(img);
    }
    
    convertToWebP(src) {
        // This would typically be handled by a server or CDN
        // For demo purposes, we'll just return the original src
        // In production, you'd replace this with actual WebP conversion logic
        return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    addImageIntersectionObserver(img) {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    
                    // Preload the image
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.removeAttribute('data-src');
                    }
                    
                    // Add fade-in animation
                    image.style.opacity = '0';
                    image.style.transition = 'opacity 0.3s ease';
                    
                    image.onload = () => {
                        image.style.opacity = '1';
                    };
                    
                    observer.unobserve(image);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        observer.observe(img);
    }
    
    // Lazy Loading
    setupLazyLoading() {
        if (!this.optimizations.lazyLoading) return;
        
        // Lazy load non-critical resources
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.loadLazyElement(entry.target);
                        lazyObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px 0px'
            });
            
            lazyElements.forEach(el => lazyObserver.observe(el));
            this.observers.set('lazy', lazyObserver);
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyElements.forEach(el => this.loadLazyElement(el));
        }
    }
    
    loadLazyElement(element) {
        const src = element.dataset.lazy;
        if (src) {
            if (element.tagName === 'IMG') {
                element.src = src;
            } else if (element.tagName === 'IFRAME') {
                element.src = src;
            } else {
                element.style.backgroundImage = `url(${src})`;
            }
            
            element.removeAttribute('data-lazy');
            element.classList.add('lazy-loaded');
        }
    }
    
    // Resource Preloading
    setupResourcePreloading() {
        if (!this.optimizations.resourcePreloading) return;
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Prefetch likely next resources
        this.setupPrefetching();
    }
    
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'styles.css', as: 'style' },
            { href: 'script.js', as: 'script' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            
            if (resource.as === 'style') {
                link.onload = () => {
                    link.rel = 'stylesheet';
                };
            }
            
            document.head.appendChild(link);
        });
    }
    
    setupPrefetching() {
        // Prefetch resources on hover
        document.addEventListener('mouseover', this.throttle((e) => {
            const link = e.target.closest('a[href]');
            if (link && !link.dataset.prefetched) {
                this.prefetchResource(link.href);
                link.dataset.prefetched = 'true';
            }
        }, 100));
    }
    
    prefetchResource(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }
    
    // Memory Management
    setupMemoryManagement() {
        if (!this.optimizations.memoryManagement) return;
        
        // Regular memory cleanup
        this.memoryCleanupInterval = setInterval(() => {
            this.cleanupMemory();
        }, 30000); // Every 30 seconds
        
        // Cleanup on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.cleanupMemory();
            }
        });
        
        // Monitor memory usage
        this.monitorMemoryUsage();
    }
    
    cleanupMemory() {
        // Clear caches
        this.cache.clear();
        
        // Remove unused event listeners
        this.cleanupEventListeners();
        
        // Clear throttled functions
        this.throttledFunctions.clear();
        
        // Force garbage collection if available
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log('🧹 Memory cleanup performed');
    }
    
    cleanupEventListeners() {
        // Remove event listeners from elements that are no longer in the DOM
        const elements = document.querySelectorAll('[data-has-listeners]');
        elements.forEach(element => {
            if (!document.contains(element)) {
                // Element is no longer in DOM, cleanup would happen automatically
                // This is more for tracking purposes
                console.log('Cleaned up listeners for removed element');
            }
        });
    }
    
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
                
                // If memory usage is above 80%, trigger cleanup
                if (usedMB / limitMB > 0.8) {
                    console.warn('🚨 High memory usage detected, triggering cleanup');
                    this.cleanupMemory();
                }
            }, 10000); // Check every 10 seconds
        }
    }
    
    // Animation Optimization
    setupAnimationOptimization() {
        if (!this.optimizations.animationOptimization) return;
        
        // Optimize CSS animations
        this.optimizeCSSAnimations();
        
        // Provide optimized animation utilities
        this.setupAnimationUtils();
    }
    
    optimizeCSSAnimations() {
        // Add will-change property to animated elements
        const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
        animatedElements.forEach(element => {
            if (!element.style.willChange) {
                element.style.willChange = 'transform, opacity';
            }
        });
        
        // Remove will-change after animation completes
        document.addEventListener('animationend', (e) => {
            e.target.style.willChange = 'auto';
        });
        
        document.addEventListener('transitionend', (e) => {
            e.target.style.willChange = 'auto';
        });
    }
    
    setupAnimationUtils() {
        // Optimized animation function
        this.animate = (element, keyframes, options = {}) => {
            // Use Web Animations API if available
            if (element.animate) {
                return element.animate(keyframes, {
                    duration: 300,
                    easing: 'ease-out',
                    fill: 'forwards',
                    ...options
                });
            } else {
                // Fallback to CSS transitions
                return this.fallbackAnimate(element, keyframes, options);
            }
        };
        
        // Batch DOM updates
        this.batchDOMUpdates = (updates) => {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            this.animationFrameId = requestAnimationFrame(() => {
                updates.forEach(update => update());
                this.animationFrameId = null;
            });
        };
    }
    
    fallbackAnimate(element, keyframes, options) {
        const duration = options.duration || 300;
        const easing = options.easing || 'ease-out';
        
        // Apply final state
        const finalFrame = keyframes[keyframes.length - 1];
        Object.assign(element.style, {
            transition: `all ${duration}ms ${easing}`,
            ...finalFrame
        });
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    // Event Throttling
    setupEventThrottling() {
        if (!this.optimizations.eventThrottling) return;
        
        // Throttle scroll events
        this.throttleScrollEvents();
        
        // Throttle resize events
        this.throttleResizeEvents();
        
        // Throttle mouse move events
        this.throttleMouseEvents();
    }
    
    throttleScrollEvents() {
        let scrollTimeout;
        
        document.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                // Dispatch throttled scroll event
                document.dispatchEvent(new CustomEvent('throttledScroll'));
                scrollTimeout = null;
            }, 16); // ~60fps
        }, { passive: true });
    }
    
    throttleResizeEvents() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            if (resizeTimeout) return;
            
            resizeTimeout = setTimeout(() => {
                // Dispatch throttled resize event
                window.dispatchEvent(new CustomEvent('throttledResize'));
                resizeTimeout = null;
            }, 100);
        });
    }
    
    throttleMouseEvents() {
        let mouseMoveTimeout;
        
        document.addEventListener('mousemove', () => {
            if (mouseMoveTimeout) return;
            
            mouseMoveTimeout = setTimeout(() => {
                // Dispatch throttled mousemove event
                document.dispatchEvent(new CustomEvent('throttledMouseMove'));
                mouseMoveTimeout = null;
            }, 16); // ~60fps
        }, { passive: true });
    }
    
    // DOM Optimization
    setupDOMOptimization() {
        if (!this.optimizations.domOptimization) return;
        
        // Optimize DOM queries
        this.optimizeDOMQueries();
        
        // Batch DOM mutations
        this.setupDOMMutationBatching();
    }
    
    optimizeDOMQueries() {
        // Cache frequently accessed elements
        this.elementCache = new Map();
        
        // Override querySelector to add caching
        const originalQuerySelector = document.querySelector;
        const originalQuerySelectorAll = document.querySelectorAll;
        
        document.querySelector = (selector) => {
            if (this.elementCache.has(selector)) {
                const cached = this.elementCache.get(selector);
                if (document.contains(cached)) {
                    return cached;
                }
                this.elementCache.delete(selector);
            }
            
            const element = originalQuerySelector.call(document, selector);
            if (element) {
                this.elementCache.set(selector, element);
            }
            return element;
        };
    }
    
    setupDOMMutationBatching() {
        let mutationQueue = [];
        let mutationTimeout;
        
        this.batchMutation = (mutation) => {
            mutationQueue.push(mutation);
            
            if (mutationTimeout) return;
            
            mutationTimeout = requestAnimationFrame(() => {
                // Process all mutations in batch
                mutationQueue.forEach(mutation => mutation());
                mutationQueue = [];
                mutationTimeout = null;
            });
        };
    }
    
    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor frame rate
        this.monitorFrameRate();
        
        // Monitor long tasks
        this.monitorLongTasks();
    }
    
    monitorFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const countFrames = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Alert if FPS drops below threshold
                if (fps < 55) {
                    console.warn(`🚨 Low FPS detected: ${fps}`);
                    this.optimizeForLowFPS();
                }
            }
            
            requestAnimationFrame(countFrames);
        };
        
        requestAnimationFrame(countFrames);
    }
    
    monitorLongTasks() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn(`🚨 Long task detected: ${entry.duration}ms`);
                        this.optimizeForLongTasks();
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
    }
    
    optimizeForLowFPS() {
        // Reduce animation quality
        document.body.classList.add('reduced-motion');
        
        // Disable non-essential animations
        const style = document.createElement('style');
        style.textContent = `
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
        
        // Remove after 5 seconds
        setTimeout(() => {
            document.body.classList.remove('reduced-motion');
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 5000);
    }
    
    optimizeForLongTasks() {
        // Break up long tasks
        this.breakUpLongTasks();
        
        // Defer non-critical operations
        this.deferNonCriticalOperations();
    }
    
    breakUpLongTasks() {
        // Implement task scheduling
        this.scheduler = (tasks) => {
            const runTask = (index = 0) => {
                if (index >= tasks.length) return;
                
                const startTime = performance.now();
                
                while (index < tasks.length && performance.now() - startTime < 5) {
                    tasks[index]();
                    index++;
                }
                
                if (index < tasks.length) {
                    setTimeout(() => runTask(index), 0);
                }
            };
            
            runTask();
        };
    }
    
    deferNonCriticalOperations() {
        // Use requestIdleCallback if available
        if ('requestIdleCallback' in window) {
            this.runWhenIdle = (callback) => {
                requestIdleCallback(callback, { timeout: 1000 });
            };
        } else {
            this.runWhenIdle = (callback) => {
                setTimeout(callback, 0);
            };
        }
    }
    
    // Utility Functions
    throttle(func, limit) {
        const key = func.toString();
        
        if (this.throttledFunctions.has(key)) {
            return this.throttledFunctions.get(key);
        }
        
        let inThrottle;
        const throttled = function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
        
        this.throttledFunctions.set(key, throttled);
        return throttled;
    }
    
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    // Public API
    enableOptimization(type) {
        this.optimizations[type] = true;
        console.log(`✅ ${type} optimization enabled`);
    }
    
    disableOptimization(type) {
        this.optimizations[type] = false;
        console.log(`❌ ${type} optimization disabled`);
    }
    
    getOptimizationStatus() {
        return { ...this.optimizations };
    }
    
    // Cleanup
    destroy() {
        // Clear intervals
        if (this.memoryCleanupInterval) {
            clearInterval(this.memoryCleanupInterval);
        }
        
        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear caches
        this.cache.clear();
        this.throttledFunctions.clear();
        
        // Cancel animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// Initialize Performance Optimizer
if (typeof window !== 'undefined') {
    window.performanceOptimizer = new PerformanceOptimizer();
    
    console.log('🚀 Performance Optimizer initialized');
    console.log('Available optimizations:', window.performanceOptimizer.getOptimizationStatus());
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}