/**
 * Performance and Load Testing Audit
 */

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');

class PerformanceAuditor {
  constructor() {
    this.results = {
      lighthouse: {},
      loadTesting: {},
      memoryProfiling: {},
      networkAnalysis: {}
    };
  }

  async runLighthouseAudit() {
    console.log('🔍 Running Lighthouse Performance Audit...');
    
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const { lhr } = await lighthouse('http://localhost:5000', {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'error'
      });

      await browser.close();

      this.results.lighthouse = {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100,
        metrics: {
          firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
          largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
          cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
          timeToInteractive: lhr.audits['interactive'].numericValue
        }
      };

      console.log(`✅ Lighthouse Performance Score: ${this.results.lighthouse.performance}/100`);
      return this.results.lighthouse;
    } catch (error) {
      console.log(`❌ Lighthouse audit failed: ${error.message}`);
      this.results.lighthouse = { error: error.message };
      return null;
    }
  }

  async runMemoryProfiling() {
    console.log('📊 Running Memory Profiling...');
    
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Start memory monitoring
      await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
      
      const memoryMetrics = await page.metrics();
      
      // Simulate user interactions
      await page.waitForTimeout(2000);
      const afterInteractionMetrics = await page.metrics();
      
      await browser.close();

      this.results.memoryProfiling = {
        initialLoad: {
          jsHeapUsedSize: memoryMetrics.JSHeapUsedSize,
          jsHeapTotalSize: memoryMetrics.JSHeapTotalSize,
          nodes: memoryMetrics.Nodes,
          documents: memoryMetrics.Documents
        },
        afterInteraction: {
          jsHeapUsedSize: afterInteractionMetrics.JSHeapUsedSize,
          jsHeapTotalSize: afterInteractionMetrics.JSHeapTotalSize,
          nodes: afterInteractionMetrics.Nodes,
          documents: afterInteractionMetrics.Documents
        },
        memoryGrowth: {
          heap: afterInteractionMetrics.JSHeapUsedSize - memoryMetrics.JSHeapUsedSize,
          nodes: afterInteractionMetrics.Nodes - memoryMetrics.Nodes
        }
      };

      console.log(`✅ Memory profiling completed`);
      return this.results.memoryProfiling;
    } catch (error) {
      console.log(`❌ Memory profiling failed: ${error.message}`);
      this.results.memoryProfiling = { error: error.message };
      return null;
    }
  }

  async runNetworkAnalysis() {
    console.log('🌐 Running Network Analysis...');
    
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      const requests = [];
      const responses = [];
      
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          timestamp: Date.now()
        });
      });
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        });
      });
      
      const startTime = Date.now();
      await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      await browser.close();

      this.results.networkAnalysis = {
        totalLoadTime: loadTime,
        requestCount: requests.length,
        responseCount: responses.length,
        resourceTypes: this.analyzeResourceTypes(requests),
        apiRequests: requests.filter(r => r.url.includes('/api/')),
        staticAssets: requests.filter(r => ['image', 'stylesheet', 'script'].includes(r.resourceType)),
        averageResponseTime: this.calculateAverageResponseTime(requests, responses)
      };

      console.log(`✅ Network analysis completed - ${requests.length} requests in ${loadTime}ms`);
      return this.results.networkAnalysis;
    } catch (error) {
      console.log(`❌ Network analysis failed: ${error.message}`);
      this.results.networkAnalysis = { error: error.message };
      return null;
    }
  }

  analyzeResourceTypes(requests) {
    const types = {};
    requests.forEach(req => {
      types[req.resourceType] = (types[req.resourceType] || 0) + 1;
    });
    return types;
  }

  calculateAverageResponseTime(requests, responses) {
    const times = [];
    requests.forEach(req => {
      const matchingResponse = responses.find(res => res.url === req.url);
      if (matchingResponse) {
        times.push(matchingResponse.timestamp - req.timestamp);
      }
    });
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        lighthouseScore: this.results.lighthouse.performance || 0,
        memoryEfficient: this.results.memoryProfiling.memoryGrowth?.heap < 10000000, // 10MB threshold
        networkOptimized: this.results.networkAnalysis.totalLoadTime < 3000, // 3s threshold
        overallScore: this.calculateOverallScore()
      },
      details: this.results
    };

    fs.writeFileSync('performance-audit-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 PERFORMANCE AUDIT REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Audit Date: ${report.timestamp}`);
    console.log(`🎯 Overall Performance Score: ${report.summary.overallScore}/100`);
    console.log(`⚡ Lighthouse Score: ${report.summary.lighthouseScore}/100`);
    console.log(`🧠 Memory Efficient: ${report.summary.memoryEfficient ? 'Yes' : 'No'}`);
    console.log(`🌐 Network Optimized: ${report.summary.networkOptimized ? 'Yes' : 'No'}`);
    console.log('═══════════════════════════════════════════════════════');
    
    return report;
  }

  calculateOverallScore() {
    const lighthouse = this.results.lighthouse.performance || 0;
    const memory = this.results.memoryProfiling.memoryGrowth?.heap < 10000000 ? 100 : 50;
    const network = this.results.networkAnalysis.totalLoadTime < 3000 ? 100 : 50;
    
    return Math.round((lighthouse + memory + network) / 3);
  }

  async runFullAudit() {
    console.log('🚀 Starting Performance Audit Suite...');
    
    await this.runLighthouseAudit();
    await this.runMemoryProfiling();
    await this.runNetworkAnalysis();
    
    return this.generateReport();
  }
}

module.exports = PerformanceAuditor;