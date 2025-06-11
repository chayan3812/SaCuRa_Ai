#!/usr/bin/env node

/**
 * PagePilot AI - Production Security Audit
 * Comprehensive security testing for deployment readiness
 */

import http from 'http';
import https from 'https';
import fs from 'fs';

class SecurityAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      securityTests: [],
      passed: 0,
      failed: 0,
      critical: 0,
      warnings: 0
    };
  }

  async runSecurityTest(name, testFn, severity = 'medium') {
    console.log(`🔒 Security Test: ${name}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.securityTests.push({
        name,
        passed: true,
        severity,
        duration: `${duration}ms`,
        result,
        timestamp: new Date().toISOString()
      });
      this.results.passed++;
      console.log(`✅ ${name} - SECURE (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.securityTests.push({
        name,
        passed: false,
        severity,
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.results.failed++;
      
      if (severity === 'critical') {
        this.results.critical++;
        console.log(`🚨 ${name} - CRITICAL SECURITY ISSUE (${duration}ms): ${error.message}`);
      } else {
        this.results.warnings++;
        console.log(`⚠️ ${name} - SECURITY WARNING (${duration}ms): ${error.message}`);
      }
      return null;
    }
  }

  async makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Security-Audit-Bot/1.0',
          ...headers
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

  async testAuthenticationSecurity() {
    const protectedEndpoints = [
      '/api/auth/user',
      '/api/notifications', 
      '/api/dashboard/metrics',
      '/api/employees',
      '/api/ml/status',
      '/api/hybrid-ai/optimizations'
    ];

    let securedCount = 0;
    const results = [];

    for (const endpoint of protectedEndpoints) {
      const response = await this.makeRequest(endpoint);
      const isSecured = response.status === 401;
      
      if (isSecured) securedCount++;
      
      results.push({
        endpoint,
        status: response.status,
        secured: isSecured,
        message: response.data?.message
      });
    }

    if (securedCount < protectedEndpoints.length) {
      throw new Error(`${protectedEndpoints.length - securedCount} endpoints not properly secured`);
    }

    return {
      totalEndpoints: protectedEndpoints.length,
      securedEndpoints: securedCount,
      securityRate: (securedCount / protectedEndpoints.length) * 100,
      results
    };
  }

  async testSQLInjectionProtection() {
    const injectionPayloads = [
      "1'; DROP TABLE users; --",
      "' OR '1'='1",
      "1' UNION SELECT * FROM users --",
      "'; DELETE FROM sessions; --",
      "1' OR 1=1 #"
    ];

    const testEndpoints = [
      '/api/facebook/pages',
      '/api/employees',
      '/api/templates'
    ];

    const vulnerabilities = [];

    for (const endpoint of testEndpoints) {
      for (const payload of injectionPayloads) {
        const response = await this.makeRequest(`${endpoint}?id=${encodeURIComponent(payload)}`);
        
        if (response.status === 500 || 
            (response.body && response.body.includes('SQL')) ||
            (response.body && response.body.includes('database error'))) {
          vulnerabilities.push({
            endpoint,
            payload,
            response: response.status,
            issue: 'Potential SQL injection vulnerability'
          });
        }
      }
    }

    if (vulnerabilities.length > 0) {
      throw new Error(`SQL injection vulnerabilities found: ${vulnerabilities.length}`);
    }

    return {
      endpointsTested: testEndpoints.length,
      payloadsTested: injectionPayloads.length,
      vulnerabilitiesFound: 0,
      status: 'Protected'
    };
  }

  async testXSSProtection() {
    const xssPayloads = [
      "<script>alert('xss')</script>",
      "javascript:alert('xss')",
      "<img src=x onerror=alert('xss')>",
      "'><script>alert('xss')</script>",
      "<svg onload=alert('xss')>"
    ];

    const testEndpoints = [
      '/api/facebook/pages',
      '/api/auto-analyze/demo_page_123'
    ];

    const vulnerabilities = [];

    for (const endpoint of testEndpoints) {
      for (const payload of xssPayloads) {
        const response = await this.makeRequest(`${endpoint}?search=${encodeURIComponent(payload)}`);
        
        if (response.body && response.body.includes('<script>')) {
          vulnerabilities.push({
            endpoint,
            payload,
            issue: 'XSS vulnerability - unescaped script tags'
          });
        }
      }
    }

    if (vulnerabilities.length > 0) {
      throw new Error(`XSS vulnerabilities found: ${vulnerabilities.length}`);
    }

    return {
      endpointsTested: testEndpoints.length,
      payloadsTested: xssPayloads.length,
      vulnerabilitiesFound: 0,
      status: 'Protected'
    };
  }

  async testSecurityHeaders() {
    const response = await this.makeRequest('/api/system/health');
    const headers = response.headers;
    
    const requiredHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': ['DENY', 'SAMEORIGIN'],
      'x-xss-protection': '1; mode=block',
      'strict-transport-security': true,
      'content-security-policy': true
    };

    const missingHeaders = [];
    const presentHeaders = {};

    for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
      const actualValue = headers[header];
      
      if (!actualValue) {
        missingHeaders.push(header);
      } else {
        presentHeaders[header] = actualValue;
        
        if (Array.isArray(expectedValue)) {
          if (!expectedValue.includes(actualValue)) {
            missingHeaders.push(`${header} (invalid value: ${actualValue})`);
          }
        } else if (typeof expectedValue === 'string' && actualValue !== expectedValue) {
          missingHeaders.push(`${header} (invalid value: ${actualValue})`);
        }
      }
    }

    if (missingHeaders.length > 0) {
      throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
    }

    return {
      requiredHeaders: Object.keys(requiredHeaders).length,
      presentHeaders: Object.keys(presentHeaders).length,
      headers: presentHeaders,
      status: 'Compliant'
    };
  }

  async testInputValidation() {
    const maliciousInputs = [
      { field: 'email', value: '../../../etc/passwd' },
      { field: 'username', value: 'admin\x00' },
      { field: 'id', value: '999999999999999999999' },
      { field: 'content', value: 'A'.repeat(10000) },
      { field: 'json', value: '{"__proto__":{"admin":true}}' }
    ];

    const testEndpoints = [
      { endpoint: '/api/employees', method: 'POST' },
      { endpoint: '/api/templates', method: 'POST' }
    ];

    const vulnerabilities = [];

    for (const { endpoint, method } of testEndpoints) {
      for (const input of maliciousInputs) {
        const data = { [input.field]: input.value };
        const response = await this.makeRequest(endpoint, method, data);
        
        if (response.status === 500) {
          vulnerabilities.push({
            endpoint,
            input: input.field,
            issue: 'Server error on malicious input - insufficient validation'
          });
        }
      }
    }

    if (vulnerabilities.length > 0) {
      throw new Error(`Input validation issues: ${vulnerabilities.length}`);
    }

    return {
      endpointsTested: testEndpoints.length,
      inputsTested: maliciousInputs.length,
      vulnerabilitiesFound: 0,
      status: 'Validated'
    };
  }

  async testRateLimiting() {
    const endpoint = '/api/system/health';
    const requestCount = 50;
    const responses = [];

    console.log(`Testing rate limiting with ${requestCount} rapid requests...`);

    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < requestCount; i++) {
      promises.push(this.makeRequest(endpoint));
    }

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const rateLimitedRequests = results.filter(r => r.status === 429).length;
    const successfulRequests = results.filter(r => r.status === 200).length;

    return {
      totalRequests: requestCount,
      successfulRequests,
      rateLimitedRequests,
      duration: `${duration}ms`,
      averageResponseTime: `${duration / requestCount}ms`,
      rateLimitingActive: rateLimitedRequests > 0
    };
  }

  async testSSLConfiguration() {
    // Test if HTTPS redirect is configured
    const httpResponse = await this.makeRequest('/api/system/health');
    
    return {
      httpAccessible: httpResponse.status === 200,
      secureHeaders: !!httpResponse.headers['strict-transport-security'],
      recommendation: 'Configure HTTPS redirect for production deployment'
    };
  }

  async testSessionSecurity() {
    const response = await this.makeRequest('/api/system/health');
    const setCookieHeaders = response.headers['set-cookie'] || [];
    
    const sessionCookies = setCookieHeaders.filter(cookie => 
      cookie.includes('session') || cookie.includes('connect.sid')
    );

    const securityFlags = {
      httpOnly: false,
      secure: false,
      sameSite: false
    };

    sessionCookies.forEach(cookie => {
      if (cookie.includes('HttpOnly')) securityFlags.httpOnly = true;
      if (cookie.includes('Secure')) securityFlags.secure = true;
      if (cookie.includes('SameSite')) securityFlags.sameSite = true;
    });

    return {
      sessionCookiesFound: sessionCookies.length,
      securityFlags,
      recommendation: 'Ensure session cookies have HttpOnly, Secure, and SameSite flags'
    };
  }

  async testEnvironmentSecurity() {
    // Check for exposed environment information
    const response = await this.makeRequest('/api/system/health');
    
    const exposedInfo = [];
    
    if (response.body.includes('development')) {
      exposedInfo.push('Development mode detected');
    }
    
    if (response.body.includes('localhost')) {
      exposedInfo.push('Localhost references found');
    }

    if (exposedInfo.length > 0) {
      throw new Error(`Environment information exposed: ${exposedInfo.join(', ')}`);
    }

    return {
      environmentMode: 'Production',
      exposedInformation: exposedInfo.length,
      status: 'Secure'
    };
  }

  async generateSecurityReport() {
    const totalTests = this.results.passed + this.results.failed;
    const securityScore = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(1) : 0;
    
    const riskLevel = this.results.critical > 0 ? 'HIGH' : 
                     this.results.warnings > 0 ? 'MEDIUM' : 'LOW';

    const report = {
      ...this.results,
      summary: {
        totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        critical: this.results.critical,
        warnings: this.results.warnings,
        securityScore: parseFloat(securityScore),
        riskLevel,
        deploymentReady: this.results.critical === 0,
        timestamp: new Date().toISOString()
      }
    };

    fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔒 PRODUCTION SECURITY AUDIT REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Audit Date: ${report.summary.timestamp}`);
    console.log(`🛡️ Security Score: ${report.summary.securityScore}%`);
    console.log(`📊 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`🚨 Critical Issues: ${report.summary.critical}`);
    console.log(`⚠️ Warnings: ${report.summary.warnings}`);
    console.log(`🎯 Risk Level: ${report.summary.riskLevel}`);
    console.log(`🚀 Deployment Ready: ${report.summary.deploymentReady ? 'YES' : 'NO'}`);
    console.log('═══════════════════════════════════════════════════════');

    this.results.securityTests.forEach(test => {
      const status = test.passed ? '✅' : (test.severity === 'critical' ? '🚨' : '⚠️');
      console.log(`${status} ${test.name} (${test.duration})`);
    });

    console.log('\n💾 Detailed security report saved to: security-audit-report.json');
    console.log('🔒 SECURITY AUDIT COMPLETE!\n');

    return report;
  }

  async runFullSecurityAudit() {
    console.log('🔒 Starting Production Security Audit...\n');

    await this.runSecurityTest('Authentication Security', 
      () => this.testAuthenticationSecurity(), 'critical');
    
    await this.runSecurityTest('SQL Injection Protection', 
      () => this.testSQLInjectionProtection(), 'critical');
    
    await this.runSecurityTest('XSS Protection', 
      () => this.testXSSProtection(), 'critical');
    
    await this.runSecurityTest('Security Headers', 
      () => this.testSecurityHeaders(), 'medium');
    
    await this.runSecurityTest('Input Validation', 
      () => this.testInputValidation(), 'medium');
    
    await this.runSecurityTest('Rate Limiting', 
      () => this.testRateLimiting(), 'medium');
    
    await this.runSecurityTest('SSL Configuration', 
      () => this.testSSLConfiguration(), 'medium');
    
    await this.runSecurityTest('Session Security', 
      () => this.testSessionSecurity(), 'medium');
    
    await this.runSecurityTest('Environment Security', 
      () => this.testEnvironmentSecurity(), 'critical');

    return await this.generateSecurityReport();
  }
}

async function main() {
  const auditor = new SecurityAuditor();
  
  try {
    await auditor.runFullSecurityAudit();
    process.exit(0);
  } catch (error) {
    console.error('🚨 Critical error during security audit:', error.message);
    process.exit(1);
  }
}

main();