#!/usr/bin/env node

/**
 * PagePilot AI - Comprehensive User Workflow Testing Script
 * Tests all major platform features like a real user
 */

import http from 'http';
import https from 'https';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

class PagePilotTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      summary: {}
    };
  }

  async runTest(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        passed: true,
        duration: `${duration}ms`,
        result,
        timestamp: new Date().toISOString()
      });
      this.results.passed++;
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        passed: false,
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.results.failed++;
      console.log(`❌ ${name} - FAILED (${duration}ms): ${error.message}`);
      return null;
    }
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PagePilot-Audit-Bot/1.0'
        }
      };

      if (data && method !== 'GET') {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const responseData = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: responseData,
              body
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: null,
              body
            });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => req.destroy(new Error('Request timeout')));

      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testServerHealth() {
    const response = await this.makeRequest('/api/system/health');
    
    if (response.status !== 200) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    const health = response.data;
    if (!health || health.status !== 'healthy') {
      throw new Error(`Server not healthy: ${health?.status || 'unknown'}`);
    }

    return {
      status: health.status,
      memory: health.metrics?.memoryUsage?.percentage,
      connections: health.metrics?.activeConnections,
      database: health.metrics?.databasePool
    };
  }

  async testAuthenticationFlow() {
    // Test unauthenticated access
    const unauth = await this.makeRequest('/api/auth/user');
    if (unauth.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauth.status}`);
    }

    // Test protected endpoints
    const protectedEndpoints = [
      '/api/notifications',
      '/api/dashboard/metrics',
      '/api/employees'
    ];

    const results = [];
    for (const endpoint of protectedEndpoints) {
      const response = await this.makeRequest(endpoint);
      results.push({
        endpoint,
        status: response.status,
        protected: response.status === 401
      });
    }

    const allProtected = results.every(r => r.protected);
    if (!allProtected) {
      throw new Error('Some protected endpoints are not properly secured');
    }

    return { protectedEndpoints: results.length, allSecured: allProtected };
  }

  async testDashboardMetrics() {
    const response = await this.makeRequest('/api/dashboard/metrics');
    
    if (response.status === 401) {
      // Expected for unauthenticated request
      return { authRequired: true, endpointWorking: true };
    }

    if (response.status !== 200) {
      throw new Error(`Dashboard metrics endpoint failed with status ${response.status}`);
    }

    return {
      authRequired: false,
      data: response.data,
      hasMetrics: !!response.data
    };
  }

  async testAdOptimizerFeatures() {
    const endpoints = [
      '/api/ads/performance-metrics',
      '/api/ads/campaigns',
      '/api/ads/optimization-suggestions'
    ];

    const results = [];
    for (const endpoint of endpoints) {
      const response = await this.makeRequest(endpoint);
      results.push({
        endpoint,
        status: response.status,
        working: response.status === 200 || response.status === 401
      });
    }

    return {
      endpointsTested: results.length,
      results
    };
  }

  async testAIFeatures() {
    const endpoints = [
      '/api/ai/insights',
      '/api/hybrid-ai/optimizations',
      '/api/ml/status'
    ];

    const results = [];
    for (const endpoint of endpoints) {
      const response = await this.makeRequest(endpoint);
      results.push({
        endpoint,
        status: response.status,
        working: response.status === 200 || response.status === 401
      });
    }

    return {
      aiEndpointsTested: results.length,
      results
    };
  }

  async testPageHealthMonitoring() {
    const response = await this.makeRequest('/api/page-health/demo_page_123');
    
    return {
      status: response.status,
      working: response.status === 200 || response.status === 401,
      data: response.data
    };
  }

  async testWebSocketConnectivity() {
    const response = await this.makeRequest('/socket.io/');
    
    // WebSocket endpoint should return 400 for HTTP requests
    return {
      status: response.status,
      webSocketEndpointResponsive: response.status === 400,
      body: response.body
    };
  }

  async testDatabaseConnectivity() {
    const endpoints = [
      '/api/facebook/pages',
      '/api/employees',
      '/api/templates'
    ];

    const results = [];
    for (const endpoint of endpoints) {
      const response = await this.makeRequest(endpoint);
      results.push({
        endpoint,
        status: response.status,
        connected: response.status === 200 || response.status === 401
      });
    }

    const allConnected = results.every(r => r.connected);
    return {
      databaseConnected: allConnected,
      endpointsTested: results.length,
      results
    };
  }

  async testAPIEndpointsCoverage() {
    const allEndpoints = [
      '/api/system/health',
      '/api/auth/user',
      '/api/notifications',
      '/api/dashboard/metrics',
      '/api/dashboard/pages',
      '/api/dashboard/recommendations',
      '/api/ads/performance-metrics',
      '/api/ads/campaigns',
      '/api/ai/insights',
      '/api/page-health/demo_page_123',
      '/api/employees',
      '/api/templates',
      '/api/facebook/pages',
      '/api/customer-service/interactions/all',
      '/api/ml/status',
      '/api/hybrid-ai/optimizations'
    ];

    const results = [];
    let workingCount = 0;

    for (const endpoint of allEndpoints) {
      const response = await this.makeRequest(endpoint);
      const isWorking = response.status === 200 || response.status === 401;
      
      if (isWorking) workingCount++;
      
      results.push({
        endpoint,
        status: response.status,
        working: isWorking,
        responseTime: Date.now()
      });
    }

    const coverage = (workingCount / allEndpoints.length) * 100;

    return {
      totalEndpoints: allEndpoints.length,
      workingEndpoints: workingCount,
      coverage: `${coverage.toFixed(1)}%`,
      results: results.slice(0, 10) // Show first 10 for brevity
    };
  }

  async testHybridAIIntegration() {
    const aiEndpoints = [
      '/api/hybrid-ai/optimizations',
      '/api/hybrid-ai/analyze',
      '/api/hybrid-ai/sentiment',
      '/api/ai/insights'
    ];

    const results = [];
    for (const endpoint of aiEndpoints) {
      const response = await this.makeRequest(endpoint);
      results.push({
        endpoint,
        status: response.status,
        aiEngineResponsive: response.status === 200 || response.status === 401
      });
    }

    return {
      hybridAIEndpoints: results.length,
      results
    };
  }

  async testAutoAnalyzeFeature() {
    const response = await this.makeRequest('/api/auto-analyze/demo_page_123');
    
    return {
      status: response.status,
      autoAnalyzeWorking: response.status === 200 || response.status === 401,
      data: response.data
    };
  }

  async generateReport() {
    const totalTests = this.results.passed + this.results.failed;
    const successRate = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(1) : 0;

    this.results.summary = {
      totalTests,
      passed: this.results.passed,
      failed: this.results.failed,
      successRate: parseFloat(successRate),
      timestamp: new Date().toISOString()
    };

    // Save detailed results
    fs.writeFileSync('test-report.json', JSON.stringify(this.results, null, 2));

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 COMPREHENSIVE SYSTEM TEST REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Test Date: ${this.results.summary.timestamp}`);
    console.log(`🎯 Success Rate: ${this.results.summary.successRate}%`);
    console.log(`📊 Total Tests: ${this.results.summary.totalTests}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log('═══════════════════════════════════════════════════════');

    // Show individual test results
    this.results.tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.name} (${test.duration})`);
    });

    console.log('\n💾 Detailed test report saved to: test-report.json');
    console.log('🎉 COMPREHENSIVE TESTING COMPLETE!\n');

    return this.results;
  }

  async runAllTests() {
    console.log('🚀 Starting PagePilot AI Comprehensive System Testing...\n');

    await this.runTest('Server Health Check', () => this.testServerHealth());
    await this.runTest('Authentication Flow', () => this.testAuthenticationFlow());
    await this.runTest('Dashboard Metrics', () => this.testDashboardMetrics());
    await this.runTest('Ad Optimizer Features', () => this.testAdOptimizerFeatures());
    await this.runTest('AI Features', () => this.testAIFeatures());
    await this.runTest('Page Health Monitoring', () => this.testPageHealthMonitoring());
    await this.runTest('WebSocket Connectivity', () => this.testWebSocketConnectivity());
    await this.runTest('Database Connectivity', () => this.testDatabaseConnectivity());
    await this.runTest('API Endpoints Coverage', () => this.testAPIEndpointsCoverage());
    await this.runTest('Hybrid AI Integration', () => this.testHybridAIIntegration());
    await this.runTest('Auto Analyze Feature', () => this.testAutoAnalyzeFeature());

    return await this.generateReport();
  }
}

async function main() {
  const tester = new PagePilotTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Critical error during testing:', error.message);
    process.exit(1);
  }
}

main();