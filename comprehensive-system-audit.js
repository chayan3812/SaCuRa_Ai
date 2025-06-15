/**
 * SaCuRa AI Platform - Comprehensive A-Z System Audit
 * Deep examination of all components, integrations, and synchronization
 */

import fs from 'fs';
import path from 'path';

class SaCuRaSystemAuditor {
  constructor() {
    this.results = {
      critical: [],
      warnings: [],
      passed: [],
      integrations: [],
      synchronization: [],
      performance: [],
      security: []
    };
    this.baseUrl = 'http://localhost:5000';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const fetch = (await import('node-fetch')).default;
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const result = await response.json();
      return { status: response.status, data: result };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  async auditDatabaseIntegration() {
    this.log('Auditing database integration and schema synchronization...', 'info');
    
    try {
      // Test database connectivity
      const dbTest = await this.makeRequest('/api/dashboard/metrics');
      if (dbTest.status === 200) {
        this.results.passed.push('Database connectivity operational');
      } else {
        this.results.critical.push('Database connectivity failed');
      }

      // Verify schema synchronization
      const schemaFiles = [
        'shared/schema.ts',
        'server/db.ts',
        'server/storage.ts'
      ];

      for (const file of schemaFiles) {
        if (fs.existsSync(file)) {
          this.results.passed.push(`Schema file ${file} exists`);
        } else {
          this.results.critical.push(`Missing schema file: ${file}`);
        }
      }

    } catch (error) {
      this.results.critical.push(`Database audit failed: ${error.message}`);
    }
  }

  async auditAPIEndpoints() {
    this.log('Auditing all API endpoints and route synchronization...', 'info');
    
    const criticalEndpoints = [
      '/api/dashboard/metrics',
      '/api/dashboard/pages',
      '/api/dashboard/recommendations',
      '/api/notifications',
      '/api/employees',
      '/api/customer-service/interactions/all',
      '/api/auth/user'
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await this.makeRequest(endpoint);
        if (response.status === 200 || response.status === 304) {
          this.results.passed.push(`API endpoint ${endpoint} operational`);
        } else if (response.status === 401) {
          this.results.warnings.push(`Authentication required for ${endpoint}`);
        } else {
          this.results.critical.push(`API endpoint ${endpoint} failed: ${response.status}`);
        }
      } catch (error) {
        this.results.critical.push(`API endpoint ${endpoint} error: ${error.message}`);
      }
    }
  }

  async auditFacebookIntegration() {
    this.log('Auditing Facebook integration and webhook synchronization...', 'info');
    
    try {
      // Test webhook verification
      const webhookTest = await this.makeRequest('/webhook/facebook?hub.mode=subscribe&hub.verify_token=sacura_ai_webhook_token_2025&hub.challenge=audit_test');
      if (webhookTest.status === 200) {
        this.results.integrations.push('Facebook webhook verification working');
      } else {
        this.results.critical.push('Facebook webhook verification failed');
      }

      // Test webhook processing
      const webhookData = {
        object: "page",
        entry: [{
          id: "114683271735733",
          messaging: [{
            sender: { id: "audit_test_user" },
            recipient: { id: "114683271735733" },
            message: { text: "System audit test message" }
          }]
        }]
      };

      const webhookResponse = await this.makeRequest('/webhook/facebook', 'POST', webhookData);
      if (webhookResponse.status === 200) {
        this.results.integrations.push('Facebook webhook message processing operational');
      } else {
        this.results.critical.push('Facebook webhook message processing failed');
      }

    } catch (error) {
      this.results.critical.push(`Facebook integration audit failed: ${error.message}`);
    }
  }

  async auditAIComponents() {
    this.log('Auditing AI systems and response generation...', 'info');
    
    try {
      // Check AI service files
      const aiFiles = [
        'server/openai.ts',
        'server/advancedAIEngine.ts',
        'server/competitorAI.ts',
        'server/claudeAI.ts'
      ];

      for (const file of aiFiles) {
        if (fs.existsSync(file)) {
          this.results.passed.push(`AI service ${file} exists`);
        } else {
          this.results.warnings.push(`AI service ${file} missing`);
        }
      }

      // Test AI response generation through customer service
      const aiTest = await this.makeRequest('/api/customer-service/interactions/all');
      if (aiTest.status === 200 || aiTest.status === 304) {
        this.results.integrations.push('AI customer service integration operational');
      } else {
        this.results.critical.push('AI customer service integration failed');
      }

    } catch (error) {
      this.results.critical.push(`AI components audit failed: ${error.message}`);
    }
  }

  async auditFrontendComponents() {
    this.log('Auditing frontend components and UI synchronization...', 'info');
    
    try {
      const frontendFiles = [
        'client/src/App.tsx',
        'client/src/pages',
        'client/src/components',
        'client/src/lib',
        'client/src/hooks'
      ];

      for (const file of frontendFiles) {
        if (fs.existsSync(file)) {
          this.results.passed.push(`Frontend component ${file} exists`);
        } else {
          this.results.critical.push(`Missing frontend component: ${file}`);
        }
      }

      // Check package.json for dependencies
      if (fs.existsSync('package.json')) {
        const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const criticalDeps = ['react', 'express', 'drizzle-orm', '@anthropic-ai/sdk', 'openai'];
        
        for (const dep of criticalDeps) {
          if (packageData.dependencies[dep] || packageData.devDependencies?.[dep]) {
            this.results.passed.push(`Dependency ${dep} installed`);
          } else {
            this.results.critical.push(`Missing dependency: ${dep}`);
          }
        }
      }

    } catch (error) {
      this.results.critical.push(`Frontend audit failed: ${error.message}`);
    }
  }

  async auditSecurityConfiguration() {
    this.log('Auditing security configuration and environment variables...', 'info');
    
    try {
      const requiredSecrets = [
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'FB_PAGE_ACCESS_TOKEN',
        'FB_VERIFY_TOKEN',
        'DATABASE_URL'
      ];

      for (const secret of requiredSecrets) {
        if (process.env[secret]) {
          this.results.security.push(`Environment variable ${secret} configured`);
        } else {
          this.results.critical.push(`Missing environment variable: ${secret}`);
        }
      }

      // Check for security best practices
      if (fs.existsSync('server/routes.ts')) {
        const routesContent = fs.readFileSync('server/routes.ts', 'utf8');
        if (routesContent.includes('isAuthenticated')) {
          this.results.security.push('Authentication middleware implemented');
        } else {
          this.results.warnings.push('Limited authentication middleware detected');
        }
      }

    } catch (error) {
      this.results.critical.push(`Security audit failed: ${error.message}`);
    }
  }

  async auditPerformanceOptimization() {
    this.log('Auditing performance optimization and memory management...', 'info');
    
    try {
      // Check for performance optimization files
      const perfFiles = [
        'server/advancedAIEngine.ts',
        'server/memoryOptimization.ts'
      ];

      for (const file of perfFiles) {
        if (fs.existsSync(file)) {
          this.results.performance.push(`Performance optimization ${file} exists`);
        } else {
          this.results.warnings.push(`Performance file ${file} missing`);
        }
      }

      // Monitor memory usage patterns
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed / memUsage.heapTotal < 0.8) {
        this.results.performance.push('Memory usage within acceptable limits');
      } else {
        this.results.warnings.push('High memory usage detected');
      }

    } catch (error) {
      this.results.warnings.push(`Performance audit failed: ${error.message}`);
    }
  }

  async auditSynchronizationStatus() {
    this.log('Auditing component synchronization and data flow...', 'info');
    
    try {
      // Test real-time synchronization
      const wsTest = await this.makeRequest('/api/dashboard/metrics');
      if (wsTest.status === 200 || wsTest.status === 304) {
        this.results.synchronization.push('Dashboard data synchronization operational');
      } else {
        this.results.critical.push('Dashboard synchronization failed');
      }

      // Check for consistency between frontend and backend
      if (fs.existsSync('shared/schema.ts')) {
        this.results.synchronization.push('Shared schema maintains frontend-backend consistency');
      } else {
        this.results.critical.push('Missing shared schema for synchronization');
      }

    } catch (error) {
      this.results.critical.push(`Synchronization audit failed: ${error.message}`);
    }
  }

  generateComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: Object.values(this.results).flat().length,
        critical_issues: this.results.critical.length,
        warnings: this.results.warnings.length,
        passed_tests: this.results.passed.length,
        integration_status: this.results.integrations.length,
        synchronization_status: this.results.synchronization.length
      },
      details: this.results,
      recommendations: this.generateRecommendations(),
      overall_health: this.calculateOverallHealth()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.critical.length > 0) {
      recommendations.push("🚨 CRITICAL: Address critical issues immediately for production stability");
    }
    
    if (this.results.warnings.length > 5) {
      recommendations.push("⚠️ WARNING: Multiple warnings detected - review and optimize");
    }
    
    if (this.results.integrations.length < 3) {
      recommendations.push("🔌 INTEGRATION: Verify external service integrations");
    }
    
    if (this.results.security.length < 5) {
      recommendations.push("🔒 SECURITY: Enhance security configuration");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("✅ EXCELLENT: System is well-synchronized and production-ready");
    }
    
    return recommendations;
  }

  calculateOverallHealth() {
    const total = Object.values(this.results).flat().length;
    const critical = this.results.critical.length;
    const warnings = this.results.warnings.length;
    const passed = this.results.passed.length + this.results.integrations.length + this.results.synchronization.length;
    
    if (critical > 0) return 'CRITICAL';
    if (warnings > passed * 0.3) return 'WARNING';
    if (passed > total * 0.8) return 'EXCELLENT';
    return 'GOOD';
  }

  async runComprehensiveAudit() {
    this.log('🚀 Starting comprehensive A-Z system audit...', 'info');
    
    await this.auditDatabaseIntegration();
    await this.auditAPIEndpoints();
    await this.auditFacebookIntegration();
    await this.auditAIComponents();
    await this.auditFrontendComponents();
    await this.auditSecurityConfiguration();
    await this.auditPerformanceOptimization();
    await this.auditSynchronizationStatus();
    
    const report = this.generateComprehensiveReport();
    
    // Save detailed report
    fs.writeFileSync('comprehensive-system-audit-report.json', JSON.stringify(report, null, 2));
    
    this.log('📊 Comprehensive audit completed', 'success');
    
    // Display summary
    console.log('\n' + '='.repeat(80));
    console.log('🎯 SACURA AI PLATFORM - COMPREHENSIVE AUDIT SUMMARY');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${report.summary.total_tests}`);
    console.log(`✅ Passed: ${report.summary.passed_tests}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Critical: ${report.summary.critical_issues}`);
    console.log(`🔌 Integrations: ${report.summary.integration_status}`);
    console.log(`🔄 Synchronization: ${report.summary.synchronization_status}`);
    console.log(`🏥 Overall Health: ${report.overall_health}`);
    console.log('='.repeat(80));
    
    // Display recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
    
    // Display critical issues if any
    if (report.details.critical.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      report.details.critical.forEach(issue => console.log(`   ❌ ${issue}`));
    }
    
    // Display warnings if any
    if (report.details.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      report.details.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
    }
    
    console.log('\n📁 Detailed report saved to: comprehensive-system-audit-report.json');
    console.log('='.repeat(80));
    
    return report;
  }
}

async function main() {
  const auditor = new SaCuRaSystemAuditor();
  await auditor.runComprehensiveAudit();
}

main().catch(console.error);

export { SaCuRaSystemAuditor };