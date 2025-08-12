/**
 * Performance Test Suite - Automated performance testing and benchmarking
 * Tests various aspects of app performance and generates reports
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;
const path = require('path');

class PerformanceTestSuite {
    constructor(options = {}) {
        this.options = {
            url: options.url || 'http://localhost:8000',
            outputDir: options.outputDir || './performance-reports',
            iterations: options.iterations || 3,
            ...options
        };
        
        this.results = {
            lighthouse: [],
            customMetrics: [],
            loadTimes: [],
            memoryUsage: [],
            errors: []
        };
    }
    
    async runFullSuite() {
        console.log('🚀 Starting Performance Test Suite...');
        
        try {
            // Ensure output directory exists
            await this.ensureOutputDir();
            
            // Run Lighthouse tests
            await this.runLighthouseTests();
            
            // Run custom performance tests
            await this.runCustomTests();
            
            // Run load testing
            await this.runLoadTests();
            
            // Run memory leak tests
            await this.runMemoryTests();
            
            // Generate comprehensive report
            await this.generateReport();
            
            console.log('✅ Performance Test Suite completed successfully!');
            console.log(`📊 Reports saved to: ${this.options.outputDir}`);
            
        } catch (error) {
            console.error('❌ Performance Test Suite failed:', error);
            this.results.errors.push(error.message);
        }
    }
    
    async ensureOutputDir() {
        try {
            await fs.access(this.options.outputDir);
        } catch {
            await fs.mkdir(this.options.outputDir, { recursive: true });
        }
    }
    
    async runLighthouseTests() {
        console.log('🔍 Running Lighthouse tests...');
        
        for (let i = 0; i < this.options.iterations; i++) {
            console.log(`  Iteration ${i + 1}/${this.options.iterations}`);
            
            try {
                const browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-dev-shm-usage']
                });
                
                const result = await lighthouse(this.options.url, {
                    port: new URL(browser.wsEndpoint()).port,
                    output: 'json',
                    logLevel: 'error',
                    onlyCategories: ['performance', 'accessibility', 'best-practices']
                });
                
                await browser.close();
                
                this.results.lighthouse.push({
                    iteration: i + 1,
                    timestamp: new Date().toISOString(),
                    scores: {
                        performance: result.lhr.categories.performance.score * 100,
                        accessibility: result.lhr.categories.accessibility.score * 100,
                        bestPractices: result.lhr.categories['best-practices'].score * 100
                    },
                    metrics: {
                        firstContentfulPaint: result.lhr.audits['first-contentful-paint'].numericValue,
                        largestContentfulPaint: result.lhr.audits['largest-contentful-paint'].numericValue,
                        firstInputDelay: result.lhr.audits['max-potential-fid'].numericValue,
                        cumulativeLayoutShift: result.lhr.audits['cumulative-layout-shift'].numericValue,
                        speedIndex: result.lhr.audits['speed-index'].numericValue,
                        totalBlockingTime: result.lhr.audits['total-blocking-time'].numericValue
                    },
                    opportunities: result.lhr.audits,
                    fullReport: result.lhr
                });
                
                // Save individual Lighthouse report
                const reportPath = path.join(this.options.outputDir, `lighthouse-${i + 1}.json`);
                await fs.writeFile(reportPath, JSON.stringify(result.lhr, null, 2));
                
            } catch (error) {
                console.error(`  Failed iteration ${i + 1}:`, error.message);
                this.results.errors.push(`Lighthouse iteration ${i + 1}: ${error.message}`);
            }
        }
    }
    
    async runCustomTests() {
        console.log('🧪 Running custom performance tests...');
        
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        
        try {
            const page = await browser.newPage();
            
            // Enable performance monitoring
            await page.setCacheEnabled(false);
            await page.setViewport({ width: 1920, height: 1080 });
            
            // Test page load performance
            await this.testPageLoad(page);
            
            // Test interaction performance
            await this.testInteractions(page);
            
            // Test animation performance
            await this.testAnimations(page);
            
            // Test memory usage
            await this.testMemoryUsage(page);
            
        } finally {
            await browser.close();
        }
    }
    
    async testPageLoad(page) {
        console.log('  Testing page load performance...');
        
        for (let i = 0; i < this.options.iterations; i++) {
            const startTime = Date.now();
            
            await page.goto(this.options.url, { waitUntil: 'networkidle0' });
            
            const loadTime = Date.now() - startTime;
            
            // Get performance metrics
            const metrics = await page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                return {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                    totalLoadTime: loadTime
                };
            });
            
            this.results.loadTimes.push({
                iteration: i + 1,
                timestamp: new Date().toISOString(),
                ...metrics
            });
        }
    }
    
    async testInteractions(page) {
        console.log('  Testing interaction performance...');
        
        // Test card swipe performance
        const cards = await page.$$('.card');
        if (cards.length > 0) {
            for (let i = 0; i < Math.min(3, cards.length); i++) {
                const startTime = Date.now();
                
                // Simulate swipe gesture
                const card = cards[i];
                const box = await card.boundingBox();
                
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2, { steps: 10 });
                await page.mouse.up();
                
                // Wait for animation to complete
                await page.waitForTimeout(1000);
                
                const interactionTime = Date.now() - startTime;
                
                this.results.customMetrics.push({
                    type: 'swipe_interaction',
                    cardIndex: i,
                    duration: interactionTime,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
    
    async testAnimations(page) {
        console.log('  Testing animation performance...');
        
        // Monitor frame rate during animations
        await page.evaluate(() => {
            return new Promise((resolve) => {
                let frameCount = 0;
                let startTime = performance.now();
                
                const countFrames = () => {
                    frameCount++;
                    const currentTime = performance.now();
                    
                    if (currentTime - startTime >= 2000) { // Test for 2 seconds
                        const fps = frameCount / 2;
                        window.testResults = window.testResults || {};
                        window.testResults.animationFPS = fps;
                        resolve(fps);
                    } else {
                        requestAnimationFrame(countFrames);
                    }
                };
                
                // Trigger some animations
                const cards = document.querySelectorAll('.card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.transform = `translateX(${index * 50}px) rotate(${index * 10}deg)`;
                    }, index * 100);
                });
                
                requestAnimationFrame(countFrames);
            });
        });
        
        const animationFPS = await page.evaluate(() => window.testResults?.animationFPS || 0);
        
        this.results.customMetrics.push({
            type: 'animation_fps',
            fps: animationFPS,
            timestamp: new Date().toISOString()
        });
    }
    
    async testMemoryUsage(page) {
        console.log('  Testing memory usage...');
        
        // Monitor memory usage over time
        for (let i = 0; i < 5; i++) {
            const memoryInfo = await page.evaluate(() => {
                if ('memory' in performance) {
                    return {
                        usedJSHeapSize: performance.memory.usedJSHeapSize,
                        totalJSHeapSize: performance.memory.totalJSHeapSize,
                        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                    };
                }
                return null;
            });
            
            if (memoryInfo) {
                this.results.memoryUsage.push({
                    iteration: i + 1,
                    timestamp: new Date().toISOString(),
                    usedMB: memoryInfo.usedJSHeapSize / 1024 / 1024,
                    totalMB: memoryInfo.totalJSHeapSize / 1024 / 1024,
                    limitMB: memoryInfo.jsHeapSizeLimit / 1024 / 1024
                });
            }
            
            // Trigger some memory-intensive operations
            await page.evaluate(() => {
                // Create and destroy some objects
                const objects = [];
                for (let j = 0; j < 1000; j++) {
                    objects.push({ data: new Array(1000).fill(Math.random()) });
                }
                // Let them be garbage collected
                objects.length = 0;
            });
            
            await page.waitForTimeout(1000);
        }
    }
    
    async runLoadTests() {
        console.log('🔄 Running load tests...');
        
        // Simulate multiple concurrent users
        const concurrentUsers = 5;
        const promises = [];
        
        for (let i = 0; i < concurrentUsers; i++) {
            promises.push(this.simulateUser(i));
        }
        
        await Promise.all(promises);
    }
    
    async simulateUser(userId) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        
        try {
            const page = await browser.newPage();
            const startTime = Date.now();
            
            await page.goto(this.options.url);
            
            // Simulate user interactions
            await page.waitForTimeout(1000);
            
            // Try to interact with cards
            const cards = await page.$$('.card');
            if (cards.length > 0) {
                for (let i = 0; i < Math.min(3, cards.length); i++) {
                    const card = cards[i];
                    const box = await card.boundingBox();
                    
                    if (box) {
                        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
                        await page.waitForTimeout(500);
                    }
                }
            }
            
            const totalTime = Date.now() - startTime;
            
            this.results.customMetrics.push({
                type: 'load_test',
                userId: userId,
                duration: totalTime,
                timestamp: new Date().toISOString()
            });
            
        } finally {
            await browser.close();
        }
    }
    
    async runMemoryTests() {
        console.log('🧠 Running memory leak tests...');
        
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        
        try {
            const page = await browser.newPage();
            await page.goto(this.options.url);
            
            // Perform repeated operations to detect memory leaks
            for (let i = 0; i < 10; i++) {
                // Simulate heavy usage
                await page.evaluate(() => {
                    // Create and destroy DOM elements
                    for (let j = 0; j < 100; j++) {
                        const div = document.createElement('div');
                        div.innerHTML = `<span>Test ${j}</span>`;
                        document.body.appendChild(div);
                        setTimeout(() => {
                            if (div.parentNode) {
                                div.parentNode.removeChild(div);
                            }
                        }, 10);
                    }
                });
                
                await page.waitForTimeout(100);
                
                // Check memory usage
                const memoryInfo = await page.evaluate(() => {
                    if ('memory' in performance) {
                        return performance.memory.usedJSHeapSize / 1024 / 1024;
                    }
                    return 0;
                });
                
                this.results.customMetrics.push({
                    type: 'memory_leak_test',
                    iteration: i + 1,
                    memoryMB: memoryInfo,
                    timestamp: new Date().toISOString()
                });
            }
            
        } finally {
            await browser.close();
        }
    }
    
    async generateReport() {
        console.log('📊 Generating performance report...');
        
        const report = {
            summary: this.generateSummary(),
            lighthouse: this.results.lighthouse,
            customMetrics: this.results.customMetrics,
            loadTimes: this.results.loadTimes,
            memoryUsage: this.results.memoryUsage,
            errors: this.results.errors,
            recommendations: this.generateRecommendations(),
            timestamp: new Date().toISOString()
        };
        
        // Save JSON report
        const jsonPath = path.join(this.options.outputDir, 'performance-report.json');
        await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
        
        // Generate HTML report
        await this.generateHTMLReport(report);
        
        // Generate CSV for metrics
        await this.generateCSVReport(report);
        
        console.log('📈 Performance report generated successfully!');
    }
    
    generateSummary() {
        const lighthouse = this.results.lighthouse;
        const loadTimes = this.results.loadTimes;
        
        if (lighthouse.length === 0) {
            return { error: 'No Lighthouse data available' };
        }
        
        const avgScores = {
            performance: lighthouse.reduce((sum, r) => sum + r.scores.performance, 0) / lighthouse.length,
            accessibility: lighthouse.reduce((sum, r) => sum + r.scores.accessibility, 0) / lighthouse.length,
            bestPractices: lighthouse.reduce((sum, r) => sum + r.scores.bestPractices, 0) / lighthouse.length
        };
        
        const avgMetrics = {
            firstContentfulPaint: lighthouse.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / lighthouse.length,
            largestContentfulPaint: lighthouse.reduce((sum, r) => sum + r.metrics.largestContentfulPaint, 0) / lighthouse.length,
            cumulativeLayoutShift: lighthouse.reduce((sum, r) => sum + r.metrics.cumulativeLayoutShift, 0) / lighthouse.length
        };
        
        const avgLoadTime = loadTimes.length > 0 ? 
            loadTimes.reduce((sum, r) => sum + r.totalLoadTime, 0) / loadTimes.length : 0;
        
        return {
            scores: avgScores,
            metrics: avgMetrics,
            avgLoadTime,
            testIterations: this.options.iterations,
            errorCount: this.results.errors.length
        };
    }
    
    generateRecommendations() {
        const recommendations = [];
        const summary = this.generateSummary();
        
        if (summary.error) return recommendations;
        
        // Performance recommendations
        if (summary.scores.performance < 90) {
            recommendations.push({
                category: 'Performance',
                priority: 'High',
                issue: 'Low performance score',
                recommendation: 'Optimize images, minify CSS/JS, enable compression'
            });
        }
        
        if (summary.metrics.largestContentfulPaint > 2500) {
            recommendations.push({
                category: 'Performance',
                priority: 'High',
                issue: 'Slow Largest Contentful Paint',
                recommendation: 'Optimize critical rendering path, preload key resources'
            });
        }
        
        if (summary.metrics.cumulativeLayoutShift > 0.1) {
            recommendations.push({
                category: 'Performance',
                priority: 'Medium',
                issue: 'High Cumulative Layout Shift',
                recommendation: 'Set explicit dimensions for images and ads, avoid inserting content above existing content'
            });
        }
        
        if (summary.avgLoadTime > 3000) {
            recommendations.push({
                category: 'Performance',
                priority: 'High',
                issue: 'Slow page load time',
                recommendation: 'Optimize server response time, enable caching, use CDN'
            });
        }
        
        // Memory recommendations
        const memoryIssues = this.results.memoryUsage.filter(m => m.usedMB > 100);
        if (memoryIssues.length > 0) {
            recommendations.push({
                category: 'Memory',
                priority: 'Medium',
                issue: 'High memory usage detected',
                recommendation: 'Implement object pooling, cleanup event listeners, optimize DOM manipulation'
            });
        }
        
        return recommendations;
    }
    
    async generateHTMLReport(report) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .metric-label { font-size: 0.9em; opacity: 0.9; }
        .score-good { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
        .score-warning { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); }
        .score-poor { background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%); }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #007bff; }
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Performance Test Report</h1>
        <p class="timestamp">Generated: ${report.timestamp}</p>
        
        <h2>📊 Summary</h2>
        <div class="summary">
            <div class="metric-card ${this.getScoreClass(report.summary.scores?.performance || 0)}">
                <div class="metric-label">Performance Score</div>
                <div class="metric-value">${Math.round(report.summary.scores?.performance || 0)}</div>
            </div>
            <div class="metric-card ${this.getScoreClass(report.summary.scores?.accessibility || 0)}">
                <div class="metric-label">Accessibility Score</div>
                <div class="metric-value">${Math.round(report.summary.scores?.accessibility || 0)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Avg Load Time</div>
                <div class="metric-value">${Math.round(report.summary.avgLoadTime || 0)}ms</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Test Iterations</div>
                <div class="metric-value">${report.summary.testIterations || 0}</div>
            </div>
        </div>
        
        <h2>💡 Recommendations</h2>
        <div class="recommendations">
            ${report.recommendations.map(rec => `
                <div class="recommendation priority-${rec.priority.toLowerCase()}">
                    <strong>${rec.category} - ${rec.issue}</strong><br>
                    ${rec.recommendation}
                </div>
            `).join('')}
        </div>
        
        <h2>📈 Lighthouse Metrics</h2>
        <table>
            <thead>
                <tr>
                    <th>Iteration</th>
                    <th>Performance</th>
                    <th>FCP (ms)</th>
                    <th>LCP (ms)</th>
                    <th>CLS</th>
                    <th>Speed Index</th>
                </tr>
            </thead>
            <tbody>
                ${report.lighthouse.map(result => `
                    <tr>
                        <td>${result.iteration}</td>
                        <td>${Math.round(result.scores.performance)}</td>
                        <td>${Math.round(result.metrics.firstContentfulPaint)}</td>
                        <td>${Math.round(result.metrics.largestContentfulPaint)}</td>
                        <td>${result.metrics.cumulativeLayoutShift.toFixed(3)}</td>
                        <td>${Math.round(result.metrics.speedIndex)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>⏱️ Load Times</h2>
        <table>
            <thead>
                <tr>
                    <th>Iteration</th>
                    <th>Total Load Time</th>
                    <th>DOM Content Loaded</th>
                    <th>First Paint</th>
                    <th>First Contentful Paint</th>
                </tr>
            </thead>
            <tbody>
                ${report.loadTimes.map(result => `
                    <tr>
                        <td>${result.iteration}</td>
                        <td>${Math.round(result.totalLoadTime)}ms</td>
                        <td>${Math.round(result.domContentLoaded)}ms</td>
                        <td>${Math.round(result.firstPaint)}ms</td>
                        <td>${Math.round(result.firstContentfulPaint)}ms</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        ${report.errors.length > 0 ? `
            <h2>❌ Errors</h2>
            <ul>
                ${report.errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        ` : ''}
    </div>
</body>
</html>`;
        
        const htmlPath = path.join(this.options.outputDir, 'performance-report.html');
        await fs.writeFile(htmlPath, html);
    }
    
    getScoreClass(score) {
        if (score >= 90) return 'score-good';
        if (score >= 50) return 'score-warning';
        return 'score-poor';
    }
    
    async generateCSVReport(report) {
        const csvData = [
            ['Metric', 'Value', 'Unit', 'Timestamp'],
            ...report.lighthouse.map(r => [
                'Performance Score',
                r.scores.performance,
                'score',
                r.timestamp
            ]),
            ...report.loadTimes.map(r => [
                'Load Time',
                r.totalLoadTime,
                'ms',
                r.timestamp
            ])
        ];
        
        const csv = csvData.map(row => row.join(',')).join('\n');
        const csvPath = path.join(this.options.outputDir, 'performance-metrics.csv');
        await fs.writeFile(csvPath, csv);
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        
        if (key === 'iterations') {
            options.iterations = parseInt(value);
        } else if (key === 'url') {
            options.url = value;
        } else if (key === 'output') {
            options.outputDir = value;
        }
    }
    
    const testSuite = new PerformanceTestSuite(options);
    testSuite.runFullSuite().catch(console.error);
}

module.exports = PerformanceTestSuite;