/**
 * PagePilot AI - Comprehensive System Audit
 * Tests backend, frontend, synchronization, logic, and functions
 */

const request = require('supertest');
const puppeteer = require('puppeteer');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5000';

// Test results storage
let auditResults = {
  timestamp: new Date().toISOString(),
  backend: { tests: [], passed: 0, failed: 0 },
  frontend: { tests: [], passed: 0, failed: 0 },
  integration: { tests: [], passed: 0, failed: 0 },
  performance: { tests: [], passed: 0, failed: 0 },
  security: { tests: [], passed: 0, failed: 0 },
  logic: { tests: [], passed: 0, failed: 0 }
};

// Helper function to record test results
function recordTest(category, testName, passed, details = {}) {
  const result = {
    name: testName,
    passed,
    timestamp: new Date().toISOString(),
    details
  };
  
  auditResults[category].tests.push(result);
  auditResults[category][passed ? 'passed' : 'failed']++;
  
  console.log(`${passed ? '✅' : '❌'} ${category.toUpperCase()}: ${testName}`);
  if (!passed && details.error) {
    console.log(`   Error: ${details.error}`);
  }
}

describe('PagePilot AI - Comprehensive System Audit', () => {
  let browser;
  let page;

  beforeAll(async () => {
    console.log('🚀 Starting Comprehensive System Audit...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
    jest.setTimeout(120000);
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    generateAuditReport();
  });

  describe('Backend API Audit', () => {
    test('Server Health Check', async () => {
      try {
        const response = await request(BASE_URL)
          .get('/api/system/health')
          .expect(200);
        
        const health = response.body;
        const isHealthy = health.status === 'healthy';
        const memoryOK = health.metrics?.memoryUsage?.percentage < 95;
        
        recordTest('backend', 'Server Health Check', isHealthy && memoryOK, {
          status: health.status,
          memory: health.metrics?.memoryUsage?.percentage,
          connections: health.metrics?.activeConnections
        });
      } catch (error) {
        recordTest('backend', 'Server Health Check', false, { error: error.message });
      }
    });

    test('Authentication System', async () => {
      try {
        const unauth = await request(BASE_URL)
          .get('/api/auth/user')
          .expect(401);
        
        const protectedEndpoint = await request(BASE_URL)
          .get('/api/notifications')
          .expect(401);
        
        recordTest('backend', 'Authentication System', true, {
          unauthenticatedBlocked: unauth.status === 401,
          protectedEndpointsSecured: protectedEndpoint.status === 401
        });
      } catch (error) {
        recordTest('backend', 'Authentication System', false, { error: error.message });
      }
    });

    test('Database Connectivity', async () => {
      try {
        const response = await request(BASE_URL)
          .get('/api/facebook/pages')
          .expect(200);
        
        recordTest('backend', 'Database Connectivity', true, {
          responseTime: response.duration,
          dataStructure: Array.isArray(response.body)
        });
      } catch (error) {
        recordTest('backend', 'Database Connectivity', false, { error: error.message });
      }
    });

    test('API Endpoint Coverage', async () => {
      const endpoints = [
        '/api/dashboard/metrics',
        '/api/ads/performance-metrics',
        '/api/ai/insights',
        '/api/page-health/demo_page_123',
        '/api/employees',
        '/api/templates',
        '/api/ml/status',
        '/api/hybrid-ai/optimizations'
      ];

      let working = 0;
      const results = [];

      for (const endpoint of endpoints) {
        try {
          const response = await request(BASE_URL).get(endpoint);
          const isWorking = response.status === 401 || response.status === 200;
          if (isWorking) working++;
          
          results.push({
            endpoint,
            status: response.status,
            working: isWorking
          });
        } catch (error) {
          results.push({
            endpoint,
            status: 'error',
            working: false,
            error: error.message
          });
        }
      }

      const coverage = (working / endpoints.length) * 100;
      recordTest('backend', 'API Endpoint Coverage', coverage >= 90, {
        coverage: `${coverage}%`,
        workingEndpoints: working,
        totalEndpoints: endpoints.length,
        results
      });
    });
  });

  describe('Frontend Audit', () => {
    test('Page Load Performance', async () => {
      try {
        const startTime = Date.now();
        await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 30000 });
        const loadTime = Date.now() - startTime;
        
        const title = await page.title();
        const isLoaded = title.length > 0 && loadTime < 10000;
        
        recordTest('frontend', 'Page Load Performance', isLoaded, {
          loadTime: `${loadTime}ms`,
          title,
          threshold: '10000ms'
        });
      } catch (error) {
        recordTest('frontend', 'Page Load Performance', false, { error: error.message });
      }
    });

    test('Component Rendering', async () => {
      try {
        await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
        
        const components = await page.evaluate(() => {
          return {
            topBar: !!document.querySelector('header'),
            navigation: !!document.querySelector('nav'),
            mainContent: !!document.querySelector('main'),
            buttons: document.querySelectorAll('button').length > 0,
            cards: document.querySelectorAll('[data-testid="card"], .card').length > 0
          };
        });
        
        const allComponentsPresent = Object.values(components).every(Boolean);
        
        recordTest('frontend', 'Component Rendering', allComponentsPresent, components);
      } catch (error) {
        recordTest('frontend', 'Component Rendering', false, { error: error.message });
      }
    });

    test('JavaScript Execution', async () => {
      try {
        await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
        
        const reactLoaded = await page.evaluate(() => {
          return typeof window.React !== 'undefined' || 
                 document.querySelector('[data-reactroot]') !== null ||
                 document.querySelector('#root') !== null;
        });
        
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        page.on('pageerror', error => logs.push(`PAGE ERROR: ${error.message}`));
        
        await page.waitForTimeout(2000);
        
        const hasErrors = logs.some(log => 
          log.includes('ERROR') || 
          log.includes('Failed') || 
          log.includes('Error')
        );
        
        recordTest('frontend', 'JavaScript Execution', reactLoaded && !hasErrors, {
          reactLoaded,
          hasErrors,
          consoleLogs: logs.slice(0, 5)
        });
      } catch (error) {
        recordTest('frontend', 'JavaScript Execution', false, { error: error.message });
      }
    });
  });

  describe('Integration & Synchronization Audit', () => {
    test('Frontend-Backend Communication', async () => {
      try {
        await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
        
        const requests = [];
        page.on('request', req => {
          if (req.url().includes('/api/')) {
            requests.push({
              url: req.url(),
              method: req.method()
            });
          }
        });
        
        await page.waitForTimeout(5000);
        
        const hasAPIRequests = requests.length > 0;
        const hasHealthCheck = requests.some(r => r.url.includes('/api/system/health'));
        
        recordTest('integration', 'Frontend-Backend Communication', hasAPIRequests, {
          requestCount: requests.length,
          hasHealthCheck,
          sampleRequests: requests.slice(0, 3)
        });
      } catch (error) {
        recordTest('integration', 'Frontend-Backend Communication', false, { error: error.message });
      }
    });

    test('Data Persistence', async () => {
      try {
        const initialData = await request(BASE_URL)
          .get('/api/facebook/pages')
          .expect(200);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const secondData = await request(BASE_URL)
          .get('/api/facebook/pages')
          .expect(200);
        
        const dataConsistent = JSON.stringify(initialData.body) === JSON.stringify(secondData.body);
        
        recordTest('integration', 'Data Persistence', dataConsistent, {
          initialDataLength: initialData.body.length,
          secondDataLength: secondData.body.length,
          consistent: dataConsistent
        });
      } catch (error) {
        recordTest('integration', 'Data Persistence', false, { error: error.message });
      }
    });
  });

  describe('Security Audit', () => {
    test('Authentication Protection', async () => {
      try {
        const protectedEndpoints = [
          '/api/auth/user',
          '/api/notifications',
          '/api/dashboard/metrics',
          '/api/employees'
        ];
        
        let securedEndpoints = 0;
        
        for (const endpoint of protectedEndpoints) {
          const response = await request(BASE_URL).get(endpoint);
          if (response.status === 401) {
            securedEndpoints++;
          }
        }
        
        const allSecured = securedEndpoints === protectedEndpoints.length;
        
        recordTest('security', 'Authentication Protection', allSecured, {
          securedEndpoints,
          totalEndpoints: protectedEndpoints.length,
          percentage: (securedEndpoints / protectedEndpoints.length) * 100
        });
      } catch (error) {
        recordTest('security', 'Authentication Protection', false, { error: error.message });
      }
    });
  });

  describe('Performance Audit', () => {
    test('Response Time Analysis', async () => {
      try {
        const endpoints = [
          '/api/system/health',
          '/api/facebook/pages'
        ];
        
        const results = [];
        
        for (const endpoint of endpoints) {
          const startTime = Date.now();
          const response = await request(BASE_URL).get(endpoint);
          const responseTime = Date.now() - startTime;
          
          results.push({
            endpoint,
            responseTime,
            status: response.status
          });
        }
        
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        const performanceGood = avgResponseTime < 1000;
        
        recordTest('performance', 'Response Time Analysis', performanceGood, {
          averageResponseTime: `${avgResponseTime}ms`,
          results,
          threshold: '1000ms'
        });
      } catch (error) {
        recordTest('performance', 'Response Time Analysis', false, { error: error.message });
      }
    });
  });
});

function generateAuditReport() {
  const totalTests = Object.values(auditResults).reduce((sum, category) => {
    return sum + (category.tests ? category.tests.length : 0);
  }, 0);
  
  const totalPassed = Object.values(auditResults).reduce((sum, category) => {
    return sum + (category.passed || 0);
  }, 0);
  
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  
  const report = {
    ...auditResults,
    summary: {
      totalTests,
      totalPassed,
      totalFailed: totalTests - totalPassed,
      successRate: parseFloat(successRate),
      timestamp: new Date().toISOString()
    }
  };
  
  fs.writeFileSync('audit-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📋 COMPREHENSIVE SYSTEM AUDIT REPORT');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 Audit Date: ${report.summary.timestamp}`);
  console.log(`🎯 Overall Success Rate: ${report.summary.successRate}%`);
  console.log(`📊 Total Tests: ${report.summary.totalTests}`);
  console.log(`✅ Passed: ${report.summary.totalPassed}`);
  console.log(`❌ Failed: ${report.summary.totalFailed}`);
  console.log('═══════════════════════════════════════════════════════');
  
  Object.entries(auditResults).forEach(([category, data]) => {
    if (data.tests) {
      const categoryRate = data.tests.length > 0 ? 
        ((data.passed / data.tests.length) * 100).toFixed(1) : 0;
      console.log(`${category.toUpperCase()}: ${categoryRate}% (${data.passed}/${data.tests.length})`);
    }
  });
  
  console.log('\n💾 Detailed audit report saved to: audit-report.json');
  console.log('🎉 COMPREHENSIVE AUDIT COMPLETE!\n');
}

module.exports = { auditResults, generateAuditReport };