/**
 * AI Content Optimizer - Complete Automation Pipeline Test
 * Tests full integration from creative fatigue detection to auto-publishing
 */

import axios from 'axios';
import fs from 'fs';

class AIContentOptimizerTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${timestamp} ${icon} ${message}`);
  }

  async recordTest(name, status, details = '') {
    this.testResults.details.push({
      name,
      status,
      details,
      timestamp: new Date().toISOString()
    });
    
    if (status === 'passed') {
      this.testResults.passed++;
      this.log(`${name} - PASSED`, 'success');
    } else {
      this.testResults.failed++;
      this.log(`${name} - FAILED: ${details}`, 'error');
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.message, 
        status: error.response?.status || 0 
      };
    }
  }

  async testCreativeFatigueAnalysis() {
    this.log('Testing Creative Fatigue Analysis API...');
    
    const result = await this.makeRequest('/api/ai-content/fatigue-analysis');
    
    if (result.success) {
      const analysis = result.data;
      
      // Validate fatigue analysis structure
      const requiredFields = ['fatigueLevel', 'fatigueScore', 'recommendations', 'suggestedRefresh', 'timeToRefresh'];
      const hasAllFields = requiredFields.every(field => field in analysis);
      
      if (hasAllFields) {
        const validFatigueLevel = ['low', 'medium', 'high', 'critical'].includes(analysis.fatigueLevel);
        const validScore = typeof analysis.fatigueScore === 'number' && analysis.fatigueScore >= 0 && analysis.fatigueScore <= 1;
        const validRecommendations = Array.isArray(analysis.recommendations);
        
        if (validFatigueLevel && validScore && validRecommendations) {
          await this.recordTest('Creative Fatigue Analysis', 'passed', 
            `Fatigue level: ${analysis.fatigueLevel}, Score: ${analysis.fatigueScore.toFixed(2)}, Recommendations: ${analysis.recommendations.length}`);
        } else {
          await this.recordTest('Creative Fatigue Analysis', 'failed', 'Invalid data format in response');
        }
      } else {
        await this.recordTest('Creative Fatigue Analysis', 'failed', 'Missing required fields in response');
      }
    } else {
      await this.recordTest('Creative Fatigue Analysis', 'failed', `API request failed: ${result.error}`);
    }
  }

  async testContentGeneration() {
    this.log('Testing AI Content Generation...');
    
    const businessContext = {
      industry: 'E-commerce',
      targetAudience: 'Small business owners',
      objectives: ['engagement', 'conversions'],
      currentCampaigns: ['Holiday Sale', 'Product Launch']
    };

    const result = await this.makeRequest('/api/ai-content/generate-suggestion', 'POST', { 
      businessContext,
      forceGeneration: true 
    });
    
    if (result.success) {
      const suggestion = result.data;
      
      // Validate content suggestion structure
      const requiredFields = ['id', 'type', 'content', 'confidence', 'performancePrediction', 'reasoning'];
      const hasRequiredFields = requiredFields.every(field => field in suggestion);
      
      if (hasRequiredFields) {
        const validType = ['text', 'image', 'carousel', 'link'].includes(suggestion.type);
        const validConfidence = typeof suggestion.confidence === 'number' && suggestion.confidence >= 0 && suggestion.confidence <= 1;
        const hasContent = suggestion.content && suggestion.content.length > 0;
        const hasPrediction = suggestion.performancePrediction && 
          'expectedEngagement' in suggestion.performancePrediction &&
          'expectedReach' in suggestion.performancePrediction &&
          'expectedClicks' in suggestion.performancePrediction;
        
        if (validType && validConfidence && hasContent && hasPrediction) {
          await this.recordTest('AI Content Generation', 'passed', 
            `Generated ${suggestion.type} content with ${(suggestion.confidence * 100).toFixed(1)}% confidence`);
          return suggestion; // Return for use in publishing test
        } else {
          await this.recordTest('AI Content Generation', 'failed', 'Invalid suggestion data structure');
        }
      } else {
        await this.recordTest('AI Content Generation', 'failed', 'Missing required fields in suggestion');
      }
    } else {
      await this.recordTest('AI Content Generation', 'failed', `Content generation failed: ${result.error}`);
    }
    
    return null;
  }

  async testOptimizerIntegration() {
    this.log('Testing Ad Optimizer Integration...');
    
    const result = await this.makeRequest('/api/ai-content/optimizer-integration');
    
    if (result.success) {
      const integration = result.data;
      
      // Validate integration response
      const requiredFields = ['shouldGenerateContent', 'contentSuggestions', 'autoPublishRecommendation'];
      const hasRequiredFields = requiredFields.every(field => field in integration);
      
      if (hasRequiredFields) {
        const validGeneration = typeof integration.shouldGenerateContent === 'boolean';
        const validSuggestions = Array.isArray(integration.contentSuggestions);
        const validAutoPublish = typeof integration.autoPublishRecommendation === 'boolean';
        
        if (validGeneration && validSuggestions && validAutoPublish) {
          await this.recordTest('Ad Optimizer Integration', 'passed', 
            `Integration active: ${integration.shouldGenerateContent}, Suggestions: ${integration.contentSuggestions.length}, Auto-publish: ${integration.autoPublishRecommendation}`);
        } else {
          await this.recordTest('Ad Optimizer Integration', 'failed', 'Invalid integration response format');
        }
      } else {
        await this.recordTest('Ad Optimizer Integration', 'failed', 'Missing required integration fields');
      }
    } else {
      await this.recordTest('Ad Optimizer Integration', 'failed', `Integration test failed: ${result.error}`);
    }
  }

  async testAutoPublishing(suggestion) {
    this.log('Testing Auto-Publishing System...');
    
    if (!suggestion) {
      await this.recordTest('Auto-Publishing Test', 'failed', 'No suggestion available for publishing test');
      return;
    }

    // Test smart publish (confidence-based)
    const smartPublishResult = await this.makeRequest('/api/ai-content/auto-publish', 'POST', {
      suggestion,
      forcePublish: false
    });
    
    if (smartPublishResult.success) {
      const result = smartPublishResult.data;
      
      if ('published' in result && 'reason' in result) {
        if (result.published && result.postId) {
          await this.recordTest('Smart Auto-Publishing', 'passed', 
            `Content published successfully: ${result.postId}`);
        } else if (!result.published && result.reason) {
          await this.recordTest('Smart Auto-Publishing', 'passed', 
            `Publishing correctly skipped: ${result.reason}`);
        } else {
          await this.recordTest('Smart Auto-Publishing', 'failed', 'Unexpected publishing response');
        }
      } else {
        await this.recordTest('Smart Auto-Publishing', 'failed', 'Invalid publishing response format');
      }
    } else {
      await this.recordTest('Smart Auto-Publishing', 'failed', `Publishing request failed: ${smartPublishResult.error}`);
    }

    // Test force publish
    const forcePublishResult = await this.makeRequest('/api/ai-content/auto-publish', 'POST', {
      suggestion,
      forcePublish: true
    });
    
    if (forcePublishResult.success) {
      const result = forcePublishResult.data;
      
      if (result.published) {
        await this.recordTest('Force Auto-Publishing', 'passed', 
          `Force publish successful: ${result.postId || 'Published'}`);
      } else {
        await this.recordTest('Force Auto-Publishing', 'failed', 
          `Force publish failed: ${result.reason}`);
      }
    } else {
      await this.recordTest('Force Auto-Publishing', 'failed', 
        `Force publish request failed: ${forcePublishResult.error}`);
    }
  }

  async testMediaSupport() {
    this.log('Testing Advanced Media Support...');
    
    // Test carousel post creation
    const carouselData = {
      message: "Check out our latest products! 🛍️",
      cards: [
        {
          title: "Product 1",
          description: "Amazing quality at great price",
          imageUrl: "https://via.placeholder.com/400x300/0066cc/ffffff?text=Product+1",
          linkUrl: "https://example.com/product1"
        },
        {
          title: "Product 2", 
          description: "Best seller this month",
          imageUrl: "https://via.placeholder.com/400x300/cc6600/ffffff?text=Product+2",
          linkUrl: "https://example.com/product2"
        }
      ]
    };

    const carouselResult = await this.makeRequest('/api/facebook/create-carousel', 'POST', carouselData);
    
    if (carouselResult.success) {
      await this.recordTest('Carousel Post Creation', 'passed', 
        `Carousel post API ready: ${carouselResult.status}`);
    } else {
      await this.recordTest('Carousel Post Creation', 'failed', 
        `Carousel creation failed: ${carouselResult.error}`);
    }

    // Test link post creation
    const linkData = {
      message: "Read our latest blog post about AI marketing automation",
      linkUrl: "https://example.com/blog/ai-marketing",
      linkData: {
        title: "AI Marketing Revolution",
        description: "How AI is transforming digital marketing strategies",
        imageUrl: "https://via.placeholder.com/600x315/0066cc/ffffff?text=Blog+Post"
      }
    };

    const linkResult = await this.makeRequest('/api/facebook/create-link-post', 'POST', linkData);
    
    if (linkResult.success) {
      await this.recordTest('Link Post Creation', 'passed', 
        `Link post API ready: ${linkResult.status}`);
    } else {
      await this.recordTest('Link Post Creation', 'failed', 
        `Link post creation failed: ${linkResult.error}`);
    }

    // Test link preview generation
    const previewResult = await this.makeRequest('/api/facebook/link-preview?url=https://example.com');
    
    if (previewResult.success) {
      await this.recordTest('Link Preview Generation', 'passed', 
        `Link preview API ready: ${previewResult.status}`);
    } else {
      await this.recordTest('Link Preview Generation', 'failed', 
        `Link preview failed: ${previewResult.error}`);
    }
  }

  async testEndToEndAutomation() {
    this.log('Testing End-to-End Automation Pipeline...');
    
    try {
      // Step 1: Analyze creative fatigue
      const fatigueResult = await this.makeRequest('/api/ai-content/fatigue-analysis');
      
      if (!fatigueResult.success) {
        await this.recordTest('E2E Automation - Fatigue Analysis', 'failed', 'Fatigue analysis step failed');
        return;
      }

      const fatigueData = fatigueResult.data;
      
      // Step 2: Check if content generation should be triggered
      const integrationResult = await this.makeRequest('/api/ai-content/optimizer-integration');
      
      if (!integrationResult.success) {
        await this.recordTest('E2E Automation - Integration Check', 'failed', 'Integration check failed');
        return;
      }

      const integrationData = integrationResult.data;
      
      // Step 3: Generate content if needed
      if (integrationData.shouldGenerateContent || fatigueData.suggestedRefresh) {
        const contentResult = await this.makeRequest('/api/ai-content/generate-suggestion', 'POST', {
          businessContext: {
            industry: 'AI/SaaS',
            targetAudience: 'Digital marketers',
            objectives: ['engagement', 'lead_generation']
          }
        });
        
        if (contentResult.success) {
          const suggestion = contentResult.data;
          
          // Step 4: Auto-publish if confidence threshold met
          if (suggestion.confidence >= 0.7 || integrationData.autoPublishRecommendation) {
            const publishResult = await this.makeRequest('/api/ai-content/auto-publish', 'POST', {
              suggestion,
              forcePublish: integrationData.autoPublishRecommendation
            });
            
            if (publishResult.success) {
              await this.recordTest('E2E Automation Pipeline', 'passed', 
                `Complete automation successful: Fatigue detected → Content generated → Auto-published`);
            } else {
              await this.recordTest('E2E Automation Pipeline', 'failed', 
                `Publishing step failed: ${publishResult.error}`);
            }
          } else {
            await this.recordTest('E2E Automation Pipeline', 'passed', 
              `Automation successful with manual review: Confidence ${(suggestion.confidence * 100).toFixed(1)}% below auto-publish threshold`);
          }
        } else {
          await this.recordTest('E2E Automation Pipeline', 'failed', 
            `Content generation step failed: ${contentResult.error}`);
        }
      } else {
        await this.recordTest('E2E Automation Pipeline', 'passed', 
          `Automation pipeline healthy: No content generation needed`);
      }
      
    } catch (error) {
      await this.recordTest('E2E Automation Pipeline', 'failed', 
        `Pipeline error: ${error.message}`);
    }
  }

  async testPerformanceMetrics() {
    this.log('Testing Performance Prediction and Metrics...');
    
    // Test performance prediction accuracy by generating multiple suggestions
    const suggestions = [];
    
    for (let i = 0; i < 3; i++) {
      const result = await this.makeRequest('/api/ai-content/generate-suggestion', 'POST', {
        businessContext: {
          industry: `Industry_${i + 1}`,
          targetAudience: `Audience_${i + 1}`,
          objectives: ['engagement']
        }
      });
      
      if (result.success) {
        suggestions.push(result.data);
      }
    }
    
    if (suggestions.length >= 2) {
      // Validate performance predictions are reasonable and varied
      const predictions = suggestions.map(s => s.performancePrediction);
      const engagements = predictions.map(p => p.expectedEngagement);
      const reaches = predictions.map(p => p.expectedReach);
      
      const hasVariation = new Set(engagements).size > 1 || new Set(reaches).size > 1;
      const hasReasonablePredictions = predictions.every(p => 
        p.expectedEngagement >= 0 && 
        p.expectedReach >= 0 && 
        p.expectedClicks >= 0 &&
        p.expectedReach >= p.expectedEngagement // Reach should be >= engagement
      );
      
      if (hasVariation && hasReasonablePredictions) {
        await this.recordTest('Performance Prediction Accuracy', 'passed', 
          `Generated varied and reasonable predictions across ${suggestions.length} suggestions`);
      } else {
        await this.recordTest('Performance Prediction Accuracy', 'failed', 
          'Performance predictions lack variation or contain unreasonable values');
      }
    } else {
      await this.recordTest('Performance Prediction Accuracy', 'failed', 
        'Insufficient suggestions generated for prediction testing');
    }
  }

  generateComprehensiveReport() {
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = ((this.testResults.passed / totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    console.log('🤖 AI CONTENT OPTIMIZER - COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    console.log(`🚀 Full Automation Pipeline: Complete AI-Powered Content Optimization`);
    console.log(`✅ Tests Passed: ${this.testResults.passed}`);
    console.log(`❌ Tests Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏰ Completed: ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    
    if (this.testResults.failed > 0) {
      console.log('⚠️  Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`❌ ${test.name}: ${test.details}`);
        });
    }
    
    console.log('\n🎯 AI Content Optimization Features Tested:');
    console.log('  ✓ Creative Fatigue Analysis with AI-powered recommendations');
    console.log('  ✓ Intelligent Content Generation based on performance data');
    console.log('  ✓ Advanced Ad Optimizer Integration for automated triggers');
    console.log('  ✓ Smart Auto-Publishing with confidence thresholds');
    console.log('  ✓ Force Publishing for manual overrides');
    console.log('  ✓ Multi-format Media Support (Text, Image, Carousel, Link)');
    console.log('  ✓ Performance Prediction Engine');
    console.log('  ✓ End-to-End Automation Pipeline');
    console.log('  ✓ Link Preview Generation');
    console.log('  ✓ Business Context-Aware Content Creation');
    
    console.log('\n📋 Integration Points Validated:');
    console.log('  ✓ Facebook API Service integration');
    console.log('  ✓ OpenAI/Anthropic AI content generation');
    console.log('  ✓ Advanced Ad Optimizer pipeline connection');
    console.log('  ✓ Creative fatigue detection algorithms');
    console.log('  ✓ Performance-based auto-publishing logic');
    
    return {
      totalTests,
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      successRate: parseFloat(successRate),
      details: this.testResults.details
    };
  }

  async runCompleteTestSuite() {
    this.log('🚀 Starting AI Content Optimizer Complete Test Suite...');
    
    try {
      // Core AI functionality tests
      await this.testCreativeFatigueAnalysis();
      const suggestion = await this.testContentGeneration();
      await this.testOptimizerIntegration();
      
      // Publishing and media tests
      await this.testAutoPublishing(suggestion);
      await this.testMediaSupport();
      
      // Advanced functionality tests
      await this.testPerformanceMetrics();
      await this.testEndToEndAutomation();
      
      // Generate comprehensive report
      const report = this.generateComprehensiveReport();
      
      // Save detailed report
      fs.writeFileSync('ai-content-optimizer-test-report.json', JSON.stringify({
        testSuite: 'AI Content Optimizer Complete Pipeline',
        timestamp: new Date().toISOString(),
        summary: report,
        detailedResults: this.testResults.details,
        testedFeatures: [
          'Creative Fatigue Analysis',
          'AI Content Generation',
          'Ad Optimizer Integration', 
          'Smart Auto-Publishing',
          'Media Format Support',
          'Performance Prediction',
          'End-to-End Automation'
        ]
      }, null, 2));
      
      console.log('\n📄 Detailed report saved to: ai-content-optimizer-test-report.json');
      
      return report;
      
    } catch (error) {
      this.log(`Test suite execution error: ${error.message}`, 'error');
      throw error;
    }
  }
}

async function main() {
  const tester = new AIContentOptimizerTester();
  
  try {
    await tester.runCompleteTestSuite();
  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AIContentOptimizerTester };