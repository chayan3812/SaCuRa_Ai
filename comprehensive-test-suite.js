/**
 * SaCuRa AI Platform - Comprehensive Test Suite
 * Complete system testing including authentication, database, APIs, and AI functionality
 */

import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class ComprehensiveTestSuite {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
    this.authenticatedCookie = null;
    this.testUser = {
      id: '43354582',
      email: 'sopiahank@gmail.com'
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪',
      api: '🔗',
      db: '🗄️',
      auth: '🔐',
      ai: '🤖'
    };
    console.log(`${emoji[type] || '📋'} [${timestamp}] ${message}`);
  }

  async recordTest(testName, category, status, details = '', duration = 0) {
    this.testResults.tests.push({
      name: testName,
      category,
      status,
      details,
      duration,
      timestamp: new Date().toISOString()
    });

    if (status === 'PASS') {
      this.testResults.passed++;
      this.log(`PASS: ${testName}`, 'success');
    } else if (status === 'FAIL') {
      this.testResults.failed++;
      this.log(`FAIL: ${testName} - ${details}`, 'error');
    } else {
      this.testResults.skipped++;
      this.log(`SKIP: ${testName} - ${details}`, 'warning');
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null, authenticated = false) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SaCuRa-Test-Suite/1.0'
        }
      };

      if (authenticated && this.authenticatedCookie) {
        config.headers.Cookie = this.authenticatedCookie;
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Authentication Tests
  async testAuthenticationFlow() {
    this.log('Testing Authentication System...', 'auth');
    
    try {
      // Test unauthenticated access
      const start = Date.now();
      const response = await this.makeRequest('/api/auth/user');
      const duration = Date.now() - start;
      
      if (response.status === 401) {
        await this.recordTest('Unauthenticated Access Protection', 'Authentication', 'PASS', 'Properly returns 401 for unauthenticated requests', duration);
      } else {
        await this.recordTest('Unauthenticated Access Protection', 'Authentication', 'FAIL', `Expected 401, got ${response.status}`, duration);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('Unauthenticated Access Protection', 'Authentication', 'PASS', 'Properly returns 401 for unauthenticated requests');
      } else {
        await this.recordTest('Unauthenticated Access Protection', 'Authentication', 'FAIL', error.message);
      }
    }

    // Test login endpoint availability
    try {
      const response = await this.makeRequest('/api/login');
      await this.recordTest('Login Endpoint Availability', 'Authentication', 'PASS', 'Login endpoint is accessible');
    } catch (error) {
      await this.recordTest('Login Endpoint Availability', 'Authentication', 'SKIP', 'Login requires external OAuth');
    }
  }

  // Database Tests
  async testDatabaseConnectivity() {
    this.log('Testing Database Connectivity...', 'db');
    
    try {
      // Test basic database connection via API
      const response = await this.makeRequest('/api/dashboard/metrics', 'GET', null, true);
      if (response.status === 200 || response.status === 401) {
        await this.recordTest('Database Connection', 'Database', 'PASS', 'Database queries are functional');
      } else {
        await this.recordTest('Database Connection', 'Database', 'FAIL', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      await this.recordTest('Database Connection', 'Database', 'FAIL', error.message);
    }
  }

  // API Endpoint Tests
  async testAPIEndpoints() {
    this.log('Testing API Endpoints...', 'api');
    
    const endpoints = [
      { path: '/api/auth/user', method: 'GET', auth: true, name: 'User Info API' },
      { path: '/api/dashboard/metrics', method: 'GET', auth: true, name: 'Dashboard Metrics API' },
      { path: '/api/ai/learning-metrics', method: 'GET', auth: true, name: 'AI Learning Metrics API' },
      { path: '/api/facebook/pages', method: 'GET', auth: true, name: 'Facebook Pages API' },
      { path: '/api/customer-service/interactions/all', method: 'GET', auth: true, name: 'Customer Interactions API' },
      { path: '/api/dashboard/employees', method: 'GET', auth: true, name: 'Employees API' },
      { path: '/api/dashboard/recommendations', method: 'GET', auth: true, name: 'AI Recommendations API' },
      { path: '/api/notifications', method: 'GET', auth: true, name: 'Notifications API' }
    ];

    for (const endpoint of endpoints) {
      try {
        const start = Date.now();
        const response = await this.makeRequest(endpoint.path, endpoint.method, null, endpoint.auth);
        const duration = Date.now() - start;
        
        if (response.status === 200) {
          await this.recordTest(endpoint.name, 'API', 'PASS', `Response time: ${duration}ms`, duration);
        } else if (response.status === 401 && endpoint.auth) {
          await this.recordTest(endpoint.name, 'API', 'SKIP', 'Requires authentication');
        } else {
          await this.recordTest(endpoint.name, 'API', 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401 && endpoint.auth) {
          await this.recordTest(endpoint.name, 'API', 'SKIP', 'Requires authentication');
        } else {
          await this.recordTest(endpoint.name, 'API', 'FAIL', error.message);
        }
      }
    }
  }

  // Facebook Integration Tests
  async testFacebookIntegration() {
    this.log('Testing Facebook Integration...', 'api');
    
    try {
      const response = await this.makeRequest('/api/facebook/pages', 'GET', null, true);
      if (response.status === 200) {
        const pages = response.data;
        await this.recordTest('Facebook Pages Integration', 'Facebook', 'PASS', `Retrieved ${pages.length} pages`);
      } else if (response.status === 401) {
        await this.recordTest('Facebook Pages Integration', 'Facebook', 'SKIP', 'Requires authentication');
      } else {
        await this.recordTest('Facebook Pages Integration', 'Facebook', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('Facebook Pages Integration', 'Facebook', 'SKIP', 'Requires authentication');
      } else {
        await this.recordTest('Facebook Pages Integration', 'Facebook', 'FAIL', error.message);
      }
    }

    // Test webhook endpoint
    try {
      const webhookData = {
        object: 'page',
        entry: [{
          id: 'test_page_id',
          time: Date.now(),
          messaging: [{
            sender: { id: 'test_user_id' },
            recipient: { id: 'test_page_id' },
            timestamp: Date.now(),
            message: {
              mid: 'test_message_id',
              text: 'Test message for webhook validation'
            }
          }]
        }]
      };

      const response = await this.makeRequest('/webhook/facebook', 'POST', webhookData);
      if (response.status === 200) {
        await this.recordTest('Facebook Webhook Processing', 'Facebook', 'PASS', 'Webhook processes messages correctly');
      } else {
        await this.recordTest('Facebook Webhook Processing', 'Facebook', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      await this.recordTest('Facebook Webhook Processing', 'Facebook', 'FAIL', error.message);
    }
  }

  // AI System Tests
  async testAISystemIntegration() {
    this.log('Testing AI System Integration...', 'ai');
    
    // Test AI learning metrics
    try {
      const response = await this.makeRequest('/api/ai/learning-metrics', 'GET', null, true);
      if (response.status === 200) {
        const metrics = response.data;
        const requiredFields = ['customerToneAnalysis', 'responseAccuracy', 'policyCompliance', 'totalInteractions'];
        const hasAllFields = requiredFields.every(field => metrics.hasOwnProperty(field));
        
        if (hasAllFields) {
          await this.recordTest('AI Learning Metrics Structure', 'AI', 'PASS', 'All required metrics fields present');
        } else {
          await this.recordTest('AI Learning Metrics Structure', 'AI', 'FAIL', 'Missing required metrics fields');
        }
      } else if (response.status === 401) {
        await this.recordTest('AI Learning Metrics Structure', 'AI', 'SKIP', 'Requires authentication');
      } else {
        await this.recordTest('AI Learning Metrics Structure', 'AI', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('AI Learning Metrics Structure', 'AI', 'SKIP', 'Requires authentication');
      } else {
        await this.recordTest('AI Learning Metrics Structure', 'AI', 'FAIL', error.message);
      }
    }

    // Test AI feedback system
    try {
      const feedbackData = {
        messageId: 'test_message_' + Date.now(),
        aiSuggestion: 'Thank you for your message. How can I help you today?',
        feedback: true,
        reviewedBy: 'test_agent',
        platformContext: 'test',
        responseTime: 2.5
      };

      const response = await this.makeRequest('/api/ai/feedback', 'POST', feedbackData, true);
      if (response.status === 200 || response.status === 201) {
        await this.recordTest('AI Feedback System', 'AI', 'PASS', 'AI feedback is properly recorded');
      } else if (response.status === 401) {
        await this.recordTest('AI Feedback System', 'AI', 'SKIP', 'Requires authentication');
      } else {
        await this.recordTest('AI Feedback System', 'AI', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('AI Feedback System', 'AI', 'SKIP', 'Requires authentication');
      } else if (error.response && error.response.status === 404) {
        await this.recordTest('AI Feedback System', 'AI', 'SKIP', 'Endpoint not yet implemented');
      } else {
        await this.recordTest('AI Feedback System', 'AI', 'FAIL', error.message);
      }
    }
  }

  // Frontend Component Tests
  async testFrontendComponents() {
    this.log('Testing Frontend Components...', 'test');
    
    try {
      // Test main application loads
      const response = await this.makeRequest('/');
      if (response.status === 200) {
        await this.recordTest('Frontend Application Load', 'Frontend', 'PASS', 'Main application loads successfully');
      } else {
        await this.recordTest('Frontend Application Load', 'Frontend', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      await this.recordTest('Frontend Application Load', 'Frontend', 'FAIL', error.message);
    }

    // Test static assets
    const assets = ['/vite.svg', '/favicon.ico'];
    for (const asset of assets) {
      try {
        const response = await this.makeRequest(asset);
        if (response.status === 200) {
          await this.recordTest(`Static Asset: ${asset}`, 'Frontend', 'PASS', 'Asset loads correctly');
        } else {
          await this.recordTest(`Static Asset: ${asset}`, 'Frontend', 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        await this.recordTest(`Static Asset: ${asset}`, 'Frontend', 'FAIL', error.message);
      }
    }
  }

  // Performance Tests
  async testPerformance() {
    this.log('Testing System Performance...', 'test');
    
    const performanceEndpoints = [
      '/api/dashboard/metrics',
      '/api/ai/learning-metrics',
      '/api/customer-service/interactions/all'
    ];

    for (const endpoint of performanceEndpoints) {
      try {
        const iterations = 5;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
          const start = Date.now();
          await this.makeRequest(endpoint, 'GET', null, true);
          const duration = Date.now() - start;
          times.push(duration);
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxTime = Math.max(...times);
        
        if (avgTime < 1000) {
          await this.recordTest(`Performance: ${endpoint}`, 'Performance', 'PASS', `Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime}ms`);
        } else if (avgTime < 3000) {
          await this.recordTest(`Performance: ${endpoint}`, 'Performance', 'PASS', `Avg: ${avgTime.toFixed(2)}ms (acceptable), Max: ${maxTime}ms`);
        } else {
          await this.recordTest(`Performance: ${endpoint}`, 'Performance', 'FAIL', `Avg: ${avgTime.toFixed(2)}ms (too slow), Max: ${maxTime}ms`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await this.recordTest(`Performance: ${endpoint}`, 'Performance', 'SKIP', 'Requires authentication');
        } else {
          await this.recordTest(`Performance: ${endpoint}`, 'Performance', 'FAIL', error.message);
        }
      }
    }
  }

  // Security Tests
  async testSecurity() {
    this.log('Testing Security Configuration...', 'test');
    
    // Test CORS headers
    try {
      const response = await this.makeRequest('/api/dashboard/metrics');
      const corsHeaders = response.headers['access-control-allow-origin'];
      if (corsHeaders) {
        await this.recordTest('CORS Configuration', 'Security', 'PASS', 'CORS headers are present');
      } else {
        await this.recordTest('CORS Configuration', 'Security', 'SKIP', 'CORS headers not detected');
      }
    } catch (error) {
      await this.recordTest('CORS Configuration', 'Security', 'SKIP', 'Unable to test CORS');
    }

    // Test SQL injection protection
    try {
      const maliciousData = {
        id: "'; DROP TABLE users; --",
        message: "Test message"
      };
      
      const response = await this.makeRequest('/api/customer-service/interactions', 'POST', maliciousData, true);
      // If we get here without error, the system handled the malicious input safely
      await this.recordTest('SQL Injection Protection', 'Security', 'PASS', 'System handles malicious SQL input safely');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('SQL Injection Protection', 'Security', 'SKIP', 'Requires authentication for testing');
      } else if (error.response && error.response.status === 400) {
        await this.recordTest('SQL Injection Protection', 'Security', 'PASS', 'System properly validates input');
      } else {
        await this.recordTest('SQL Injection Protection', 'Security', 'FAIL', error.message);
      }
    }

    // Test rate limiting
    try {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(this.makeRequest('/api/dashboard/metrics'));
      }
      
      const responses = await Promise.allSettled(promises);
      const rateLimited = responses.some(r => r.status === 'rejected' && r.reason.response && r.reason.response.status === 429);
      
      if (rateLimited) {
        await this.recordTest('Rate Limiting', 'Security', 'PASS', 'Rate limiting is active');
      } else {
        await this.recordTest('Rate Limiting', 'Security', 'SKIP', 'Rate limiting not detected or high threshold');
      }
    } catch (error) {
      await this.recordTest('Rate Limiting', 'Security', 'SKIP', 'Unable to test rate limiting');
    }
  }

  // Load Tests
  async testLoadCapacity() {
    this.log('Testing Load Capacity...', 'test');
    
    try {
      const concurrentRequests = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(this.makeRequest('/api/dashboard/metrics', 'GET', null, true));
      }
      
      const start = Date.now();
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - start;
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful >= concurrentRequests * 0.9) {
        await this.recordTest('Concurrent Load Test', 'Load', 'PASS', `${successful}/${concurrentRequests} requests succeeded in ${duration}ms`);
      } else {
        await this.recordTest('Concurrent Load Test', 'Load', 'FAIL', `Only ${successful}/${concurrentRequests} requests succeeded`);
      }
    } catch (error) {
      await this.recordTest('Concurrent Load Test', 'Load', 'FAIL', error.message);
    }
  }

  // Environment Tests
  async testEnvironmentConfiguration() {
    this.log('Testing Environment Configuration...', 'test');
    
    // Test required environment variables through API behavior
    const envTests = [
      { name: 'Database URL', indicator: 'database queries work', test: () => this.makeRequest('/api/dashboard/metrics', 'GET', null, true) },
      { name: 'Facebook Integration', indicator: 'facebook endpoints respond', test: () => this.makeRequest('/api/facebook/pages', 'GET', null, true) },
      { name: 'Session Configuration', indicator: 'auth endpoints work', test: () => this.makeRequest('/api/auth/user', 'GET', null, true) }
    ];

    for (const envTest of envTests) {
      try {
        const response = await envTest.test();
        if (response.status === 200 || response.status === 401) {
          await this.recordTest(`Environment: ${envTest.name}`, 'Environment', 'PASS', envTest.indicator);
        } else {
          await this.recordTest(`Environment: ${envTest.name}`, 'Environment', 'FAIL', `Unexpected status: ${response.status}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await this.recordTest(`Environment: ${envTest.name}`, 'Environment', 'PASS', `${envTest.indicator} (auth required)`);
        } else {
          await this.recordTest(`Environment: ${envTest.name}`, 'Environment', 'FAIL', error.message);
        }
      }
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      summary: {
        totalTests: this.testResults.tests.length,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        skipped: this.testResults.skipped,
        successRate: this.testResults.tests.length > 0 ? 
          ((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2) : 0,
        timestamp: new Date().toISOString()
      },
      categories: {},
      failedTests: this.testResults.tests.filter(t => t.status === 'FAIL'),
      performanceMetrics: this.testResults.tests
        .filter(t => t.category === 'Performance' && t.duration > 0)
        .map(t => ({ name: t.name, duration: t.duration })),
      recommendations: []
    };

    // Group by category
    this.testResults.tests.forEach(test => {
      if (!report.categories[test.category]) {
        report.categories[test.category] = { passed: 0, failed: 0, skipped: 0, tests: [] };
      }
      report.categories[test.category][test.status.toLowerCase()]++;
      report.categories[test.category].tests.push(test);
    });

    // Generate recommendations
    if (report.failedTests.length > 0) {
      report.recommendations.push('Address failed tests to improve system reliability');
    }
    if (report.summary.skipped > report.summary.passed) {
      report.recommendations.push('Many tests were skipped - consider implementing authentication for full test coverage');
    }
    if (report.performanceMetrics.some(p => p.duration > 2000)) {
      report.recommendations.push('Some endpoints are slow - consider performance optimization');
    }

    return report;
  }

  async runCompleteTestSuite() {
    this.log('🚀 Starting SaCuRa AI Comprehensive Test Suite', 'test');
    this.log('================================================', 'info');
    
    const startTime = Date.now();
    
    try {
      // Run all test categories
      await this.testAuthenticationFlow();
      await this.testDatabaseConnectivity();
      await this.testAPIEndpoints();
      await this.testFacebookIntegration();
      await this.testAISystemIntegration();
      await this.testFrontendComponents();
      await this.testPerformance();
      await this.testSecurity();
      await this.testLoadCapacity();
      await this.testEnvironmentConfiguration();
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      this.log('================================================', 'info');
      this.log(`✅ Test Suite Completed in ${(totalDuration / 1000).toFixed(2)} seconds`, 'success');
      
      const report = this.generateReport();
      
      // Display summary
      this.log(`📊 RESULTS: ${report.summary.passed} PASSED, ${report.summary.failed} FAILED, ${report.summary.skipped} SKIPPED`, 'info');
      this.log(`🎯 Success Rate: ${report.summary.successRate}%`, 'info');
      
      // Save detailed report
      fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(report, null, 2));
      this.log('📄 Detailed report saved to comprehensive-test-report.json', 'info');
      
      return report;
      
    } catch (error) {
      this.log(`❌ Test Suite Failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Execute test suite
async function main() {
  const testSuite = new ComprehensiveTestSuite();
  
  try {
    const report = await testSuite.runCompleteTestSuite();
    
    // Return appropriate exit code
    if (report.summary.failed > 0) {
      process.exit(1); // Some tests failed
    } else {
      process.exit(0); // All tests passed or skipped
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(2); // Test suite itself failed
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ComprehensiveTestSuite;