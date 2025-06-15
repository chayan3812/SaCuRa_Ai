/**
 * SaCuRa AI - AI Systems Test Suite
 * Tests AI learning, feedback systems, and intelligent automation
 */

const axios = require('axios');

class AISystemsTester {
  constructor() {
    this.baseURL = 'http://localhost:5173';
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = { info: '🤖', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${emoji[type] || '🤖'} [${timestamp}] ${message}`);
  }

  async recordTest(name, status, details = '') {
    this.results.push({ name, status, details, timestamp: new Date().toISOString() });
    this.log(`${status}: ${name} - ${details}`, status === 'PASS' ? 'success' : 'error');
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      return await axios(config);
    } catch (error) {
      throw error;
    }
  }

  async testAILearningMetrics() {
    try {
      const response = await this.makeRequest('/api/ai/learning-metrics');
      if (response.status === 200) {
        const metrics = response.data;
        const requiredFields = ['customerToneAnalysis', 'responseAccuracy', 'policyCompliance', 'totalInteractions'];
        
        // Check structure
        const hasAllFields = requiredFields.every(field => metrics.hasOwnProperty(field));
        if (!hasAllFields) {
          await this.recordTest('AI Learning Metrics Structure', 'FAIL', 'Missing required fields');
          return;
        }

        // Validate data ranges
        const validRanges = 
          metrics.customerToneAnalysis >= 0 && metrics.customerToneAnalysis <= 100 &&
          metrics.responseAccuracy >= 0 && metrics.responseAccuracy <= 100 &&
          metrics.policyCompliance >= 0 && metrics.policyCompliance <= 100 &&
          metrics.totalInteractions >= 0;

        if (validRanges) {
          await this.recordTest('AI Learning Metrics Data Validation', 'PASS', 
            `Tone: ${metrics.customerToneAnalysis}%, Accuracy: ${metrics.responseAccuracy}%, Compliance: ${metrics.policyCompliance}%, Interactions: ${metrics.totalInteractions}`);
        } else {
          await this.recordTest('AI Learning Metrics Data Validation', 'FAIL', 'Invalid data ranges detected');
        }
      } else if (response.status === 401) {
        await this.recordTest('AI Learning Metrics', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('AI Learning Metrics', 'FAIL', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('AI Learning Metrics', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('AI Learning Metrics', 'FAIL', error.message);
      }
    }
  }

  async testAIFeedbackSystem() {
    const testCases = [
      {
        name: 'Positive Feedback',
        data: {
          messageId: `test_pos_${Date.now()}`,
          aiSuggestion: 'Thank you for contacting us. How can I help you today?',
          feedback: true,
          reviewedBy: 'test_agent',
          platformContext: 'facebook',
          responseTime: 1.2
        }
      },
      {
        name: 'Negative Feedback',
        data: {
          messageId: `test_neg_${Date.now()}`,
          aiSuggestion: 'I cannot help with that request.',
          feedback: false,
          reviewedBy: 'test_agent',
          platformContext: 'facebook',
          responseTime: 0.8
        }
      },
      {
        name: 'Neutral Feedback',
        data: {
          messageId: `test_neu_${Date.now()}`,
          aiSuggestion: 'Please provide more details about your inquiry.',
          feedback: null,
          reviewedBy: 'test_agent',
          platformContext: 'facebook',
          responseTime: 1.5
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.makeRequest('/api/ai/feedback', 'POST', testCase.data);
        if (response.status === 200 || response.status === 201) {
          await this.recordTest(`AI Feedback: ${testCase.name}`, 'PASS', 'Feedback recorded successfully');
        } else if (response.status === 401) {
          await this.recordTest(`AI Feedback: ${testCase.name}`, 'SKIP', 'Authentication required');
        } else {
          await this.recordTest(`AI Feedback: ${testCase.name}`, 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await this.recordTest(`AI Feedback: ${testCase.name}`, 'SKIP', 'Authentication required');
        } else if (error.response && error.response.status === 404) {
          await this.recordTest(`AI Feedback: ${testCase.name}`, 'SKIP', 'Endpoint not implemented');
        } else {
          await this.recordTest(`AI Feedback: ${testCase.name}`, 'FAIL', error.message);
        }
      }
    }
  }

  async testAIRecommendations() {
    try {
      const response = await this.makeRequest('/api/dashboard/recommendations');
      if (response.status === 200) {
        const recommendations = response.data;
        if (Array.isArray(recommendations)) {
          await this.recordTest('AI Recommendations Structure', 'PASS', `${recommendations.length} recommendations found`);
          
          // Test recommendation data quality
          if (recommendations.length > 0) {
            const firstRec = recommendations[0];
            const hasRequiredFields = firstRec.title && firstRec.description && firstRec.priority;
            if (hasRequiredFields) {
              await this.recordTest('AI Recommendations Data Quality', 'PASS', 'Valid recommendation structure');
            } else {
              await this.recordTest('AI Recommendations Data Quality', 'FAIL', 'Missing required fields');
            }
          } else {
            await this.recordTest('AI Recommendations Data Quality', 'SKIP', 'No recommendations to validate');
          }
        } else {
          await this.recordTest('AI Recommendations Structure', 'FAIL', 'Response is not an array');
        }
      } else if (response.status === 401) {
        await this.recordTest('AI Recommendations', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('AI Recommendations', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('AI Recommendations', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('AI Recommendations', 'FAIL', error.message);
      }
    }
  }

  async testAIMessageProcessing() {
    const testMessages = [
      {
        scenario: 'Customer Complaint',
        message: 'I am very disappointed with your service. This is unacceptable!',
        expectedTone: 'negative'
      },
      {
        scenario: 'Product Inquiry',
        message: 'Hi, I would like to know more about your premium plan features.',
        expectedTone: 'neutral'
      },
      {
        scenario: 'Thank You Message',
        message: 'Thank you so much for your excellent customer service!',
        expectedTone: 'positive'
      }
    ];

    for (const test of testMessages) {
      try {
        const messageData = {
          pageId: 'test_page_id',
          customerId: 'test_customer_id',
          customerName: 'Test Customer',
          message: test.message,
          messageType: 'text',
          timestamp: new Date().toISOString()
        };

        const response = await this.makeRequest('/api/ai/analyze-message', 'POST', messageData);
        if (response.status === 200) {
          const analysis = response.data;
          if (analysis.sentiment && analysis.suggestedResponse) {
            await this.recordTest(`AI Message Analysis: ${test.scenario}`, 'PASS', 
              `Sentiment: ${analysis.sentiment}, Response generated`);
          } else {
            await this.recordTest(`AI Message Analysis: ${test.scenario}`, 'FAIL', 'Incomplete analysis response');
          }
        } else if (response.status === 401) {
          await this.recordTest(`AI Message Analysis: ${test.scenario}`, 'SKIP', 'Authentication required');
        } else {
          await this.recordTest(`AI Message Analysis: ${test.scenario}`, 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await this.recordTest(`AI Message Analysis: ${test.scenario}`, 'SKIP', 'Authentication required');
        } else if (error.response && error.response.status === 404) {
          await this.recordTest(`AI Message Analysis: ${test.scenario}`, 'SKIP', 'Endpoint not implemented');
        } else {
          await this.recordTest(`AI Message Analysis: ${test.scenario}`, 'FAIL', error.message);
        }
      }
    }
  }

  async testAITrainingPipeline() {
    try {
      // Test training data storage
      const trainingData = {
        messageId: `training_test_${Date.now()}`,
        originalPrompt: 'Customer asking about refund policy',
        originalReply: 'We do not offer refunds.',
        correctedReply: 'I understand your concern about our refund policy. Let me help you with that. Our refund policy allows returns within 30 days of purchase with receipt.',
        improvementCategory: 'customer_service_tone',
        priority: 'high'
      };

      const response = await this.makeRequest('/api/ai/training/store', 'POST', trainingData);
      if (response.status === 200 || response.status === 201) {
        await this.recordTest('AI Training Data Storage', 'PASS', 'Training data stored successfully');
      } else if (response.status === 401) {
        await this.recordTest('AI Training Data Storage', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('AI Training Data Storage', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('AI Training Data Storage', 'SKIP', 'Authentication required');
      } else if (error.response && error.response.status === 404) {
        await this.recordTest('AI Training Data Storage', 'SKIP', 'Endpoint not implemented');
      } else {
        await this.recordTest('AI Training Data Storage', 'FAIL', error.message);
      }
    }

    // Test training queue processing
    try {
      const response = await this.makeRequest('/api/ai/training/queue');
      if (response.status === 200) {
        const queue = response.data;
        if (Array.isArray(queue)) {
          await this.recordTest('AI Training Queue', 'PASS', `${queue.length} items in training queue`);
        } else {
          await this.recordTest('AI Training Queue', 'FAIL', 'Invalid queue response format');
        }
      } else if (response.status === 401) {
        await this.recordTest('AI Training Queue', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('AI Training Queue', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('AI Training Queue', 'SKIP', 'Authentication required');
      } else if (error.response && error.response.status === 404) {
        await this.recordTest('AI Training Queue', 'SKIP', 'Endpoint not implemented');
      } else {
        await this.recordTest('AI Training Queue', 'FAIL', error.message);
      }
    }
  }

  async testAIPerformanceMetrics() {
    try {
      const response = await this.makeRequest('/api/ai/performance');
      if (response.status === 200) {
        const metrics = response.data;
        const requiredMetrics = ['totalSuggestions', 'positiveRating', 'negativeRating', 'usageRate', 'avgResponseTime'];
        
        const hasAllMetrics = requiredMetrics.every(metric => metrics.hasOwnProperty(metric));
        if (hasAllMetrics) {
          await this.recordTest('AI Performance Metrics', 'PASS', 
            `Usage: ${metrics.usageRate}%, Response time: ${metrics.avgResponseTime}ms`);
        } else {
          await this.recordTest('AI Performance Metrics', 'FAIL', 'Missing required performance metrics');
        }
      } else if (response.status === 401) {
        await this.recordTest('AI Performance Metrics', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('AI Performance Metrics', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('AI Performance Metrics', 'SKIP', 'Authentication required');
      } else if (error.response && error.response.status === 404) {
        await this.recordTest('AI Performance Metrics', 'SKIP', 'Endpoint not implemented');
      } else {
        await this.recordTest('AI Performance Metrics', 'FAIL', error.message);
      }
    }
  }

  async runAllTests() {
    this.log('🤖 Starting AI Systems Tests');
    
    await this.testAILearningMetrics();
    await this.testAIFeedbackSystem();
    await this.testAIRecommendations();
    await this.testAIMessageProcessing();
    await this.testAITrainingPipeline();
    await this.testAIPerformanceMetrics();

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    this.log(`✅ AI Systems Tests Complete: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    return this.results;
  }
}

module.exports = AISystemsTester;