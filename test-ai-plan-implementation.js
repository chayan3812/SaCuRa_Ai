/**
 * AI Plan Implementation Validation Test
 * Tests all three subscription tiers with real API integration
 */

class AIPlanImplementationTester {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://sa-cura-live-sopiahank.replit.app'
      : 'http://localhost:3000';
    this.testResults = [];
    this.userId = "test-user-" + Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
    this.testResults.push({ timestamp, type, message });
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return { success: response.ok, status: response.status, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testFreeTierGeneration() {
    this.log("Testing FREE tier AI content generation");
    
    // Simulate free tier user
    const response = await this.makeRequest('/api/ai/generate-content', 'POST', {
      topic: 'summer product launch',
      userPlan: 'free'
    });

    if (response.success && response.data.strategy === 'generic_template') {
      this.log("✅ FREE tier: Static template generation working", 'success');
      this.log(`Content preview: "${response.data.content.substring(0, 100)}..."`);
      return true;
    } else {
      this.log("❌ FREE tier: Template generation failed", 'error');
      return false;
    }
  }

  async testProTierGeneration() {
    this.log("Testing PRO tier AI content generation");
    
    const response = await this.makeRequest('/api/ai/generate-content', 'POST', {
      topic: 'holiday special offer',
      userPlan: 'pro'
    });

    if (response.success && response.data.strategy === 'pro_optimized') {
      this.log("✅ PRO tier: OpenAI optimization working", 'success');
      this.log(`Strategy: ${response.data.strategy}, Plan: ${response.data.plan}`);
      this.log(`Content preview: "${response.data.content.substring(0, 150)}..."`);
      return true;
    } else {
      this.log("❌ PRO tier: OpenAI optimization failed", 'error');
      return false;
    }
  }

  async testEnterpriseTierGeneration() {
    this.log("Testing ENTERPRISE tier AI content generation");
    
    const response = await this.makeRequest('/api/ai/generate-content', 'POST', {
      topic: 'new product announcement',
      userPlan: 'enterprise'
    });

    if (response.success && response.data.strategy === 'performance_based_fine_tuning') {
      this.log("✅ ENTERPRISE tier: Performance-based fine-tuning working", 'success');
      this.log(`Training Examples Used: ${response.data.trainingExamples || 0}`);
      this.log(`Content preview: "${response.data.content.substring(0, 150)}..."`);
      return true;
    } else {
      this.log("❌ ENTERPRISE tier: Performance-based fine-tuning failed", 'error');
      return false;
    }
  }

  async testAITrainingAnalytics() {
    this.log("Testing AI training analytics endpoint");
    
    const response = await this.makeRequest('/api/ai/training-analytics');

    if (response.success) {
      this.log("✅ AI Training Analytics: Endpoint accessible", 'success');
      this.log(`Analytics data structure: ${JSON.stringify(Object.keys(response.data || {}))}`);
      return true;
    } else {
      this.log("❌ AI Training Analytics: Endpoint failed", 'error');
      return false;
    }
  }

  async testPlanBasedCapabilities() {
    this.log("Testing plan-based AI capabilities differentiation");
    
    const capabilities = {
      free: ['static_templates', 'basic_emojis'],
      pro: ['openai_optimization', 'cta_enhancement', 'urgency_triggers'],
      enterprise: ['performance_fine_tuning', 'historical_analysis', 'custom_training']
    };

    const response = await this.makeRequest('/api/ai/plan-capabilities');
    
    if (response.success) {
      this.log("✅ Plan Capabilities: Successfully retrieved", 'success');
      
      for (const [plan, expectedCaps] of Object.entries(capabilities)) {
        const planCaps = response.data[plan] || [];
        const hasExpectedCaps = expectedCaps.every(cap => planCaps.includes(cap));
        
        if (hasExpectedCaps) {
          this.log(`✅ ${plan.toUpperCase()} capabilities: ${expectedCaps.join(', ')}`, 'success');
        } else {
          this.log(`⚠️ ${plan.toUpperCase()} capabilities: Missing some expected features`, 'warning');
        }
      }
      return true;
    } else {
      this.log("❌ Plan Capabilities: Endpoint not available", 'error');
      return false;
    }
  }

  async testPlanUpgradeImpact() {
    this.log("Testing plan upgrade impact simulation");
    
    const topics = ['product launch', 'seasonal sale', 'brand announcement'];
    const plans = ['free', 'pro', 'enterprise'];
    
    for (const topic of topics) {
      this.log(`\n--- Testing topic: "${topic}" ---`);
      
      for (const plan of plans) {
        const response = await this.makeRequest('/api/ai/generate-content', 'POST', {
          topic,
          userPlan: plan
        });
        
        if (response.success) {
          const contentLength = response.data.content.length;
          const strategy = response.data.strategy;
          const trainingExamples = response.data.trainingExamples || 0;
          
          this.log(`${plan.toUpperCase()}: ${contentLength} chars, strategy: ${strategy}, training: ${trainingExamples} examples`);
        }
      }
    }
    
    return true;
  }

  async testAITrainingHelpers() {
    this.log("Testing AI training helper functions");
    
    // Test training data quality assessment
    const qualityResponse = await this.makeRequest('/api/ai/training-quality');
    if (qualityResponse.success) {
      this.log("✅ Training Quality Assessment: Working", 'success');
      this.log(`Quality metrics: ${JSON.stringify(qualityResponse.data)}`);
    }
    
    // Test performance pattern analysis
    const patternsResponse = await this.makeRequest('/api/ai/performance-patterns');
    if (patternsResponse.success) {
      this.log("✅ Performance Pattern Analysis: Working", 'success');
      this.log(`Pattern insights: ${JSON.stringify(patternsResponse.data)}`);
    }
    
    return true;
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.type === 'success').length;
    const failed = this.testResults.filter(r => r.type === 'error').length;
    const warnings = this.testResults.filter(r => r.type === 'warning').length;
    
    const report = {
      summary: {
        total_tests: this.testResults.length,
        passed,
        failed,
        warnings,
        success_rate: `${Math.round((passed / (passed + failed)) * 100)}%`
      },
      ai_tier_validation: {
        free_tier_working: this.testResults.some(r => r.message.includes('FREE tier') && r.type === 'success'),
        pro_tier_working: this.testResults.some(r => r.message.includes('PRO tier') && r.type === 'success'),
        enterprise_tier_working: this.testResults.some(r => r.message.includes('ENTERPRISE tier') && r.type === 'success')
      },
      recommendations: this.generateRecommendations(passed, failed, warnings),
      test_timestamp: new Date().toISOString()
    };
    
    return report;
  }

  generateRecommendations(passed, failed, warnings) {
    const recommendations = [];
    
    if (failed === 0) {
      recommendations.push("🎉 All AI tier systems are working perfectly!");
      recommendations.push("✅ Your plan-based AI training is production-ready");
    }
    
    if (failed > 0) {
      recommendations.push("🔧 Some AI tier functions need attention");
      recommendations.push("📋 Review failed tests and check API configurations");
    }
    
    if (warnings > 0) {
      recommendations.push("⚠️ Some optional features may need enhancement");
    }
    
    recommendations.push("🚀 Consider adding more training data for Enterprise tier");
    recommendations.push("📊 Monitor AI performance metrics regularly");
    
    return recommendations;
  }

  async runCompleteTest() {
    this.log("🚀 Starting AI Plan Implementation Validation", 'info');
    this.log("="  .repeat(60));
    
    const tests = [
      this.testFreeTierGeneration.bind(this),
      this.testProTierGeneration.bind(this),
      this.testEnterpriseTierGeneration.bind(this),
      this.testAITrainingAnalytics.bind(this),
      this.testPlanBasedCapabilities.bind(this),
      this.testPlanUpgradeImpact.bind(this),
      this.testAITrainingHelpers.bind(this)
    ];
    
    for (const test of tests) {
      try {
        await test();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
      } catch (error) {
        this.log(`Test execution error: ${error.message}`, 'error');
      }
    }
    
    this.log("\n" + "=".repeat(60));
    this.log("🏁 AI Plan Implementation Test Complete");
    
    const report = this.generateReport();
    console.log("\n📊 FINAL REPORT:");
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

// Execute the test
async function main() {
  const tester = new AIPlanImplementationTester();
  await tester.runCompleteTest();
}

main().catch(console.error);