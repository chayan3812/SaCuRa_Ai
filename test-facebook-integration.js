/**
 * SaCuRa AI - Facebook Integration Test Suite
 * Tests webhook processing, Graph API integration, and page management
 */

const axios = require('axios');
const crypto = require('crypto');

class FacebookIntegrationTester {
  constructor() {
    this.baseURL = 'http://localhost:5173';
    this.results = [];
    this.verifyToken = 'sacura_ai_webhook_token_2025';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = { info: '📘', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${emoji[type] || '📘'} [${timestamp}] ${message}`);
  }

  async recordTest(name, status, details = '') {
    this.results.push({ name, status, details, timestamp: new Date().toISOString() });
    this.log(`${status}: ${name} - ${details}`, status === 'PASS' ? 'success' : 'error');
  }

  async makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json', ...headers }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      return await axios(config);
    } catch (error) {
      throw error;
    }
  }

  generateSignature(payload, secret) {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async testWebhookVerification() {
    try {
      // Test webhook verification challenge
      const challenge = 'test_challenge_' + Date.now();
      const response = await this.makeRequest(
        `/webhook/facebook?hub.mode=subscribe&hub.verify_token=${this.verifyToken}&hub.challenge=${challenge}`
      );
      
      if (response.status === 200 && response.data === challenge) {
        await this.recordTest('Webhook Verification Challenge', 'PASS', 'Webhook verification working correctly');
      } else {
        await this.recordTest('Webhook Verification Challenge', 'FAIL', 
          `Expected challenge response, got: ${response.data}`);
      }
    } catch (error) {
      await this.recordTest('Webhook Verification Challenge', 'FAIL', error.message);
    }

    // Test invalid verification token
    try {
      const challenge = 'test_challenge_invalid';
      const response = await this.makeRequest(
        `/webhook/facebook?hub.mode=subscribe&hub.verify_token=invalid_token&hub.challenge=${challenge}`
      );
      
      await this.recordTest('Webhook Security - Invalid Token', 'FAIL', 'Should reject invalid tokens');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        await this.recordTest('Webhook Security - Invalid Token', 'PASS', 'Correctly rejects invalid tokens');
      } else {
        await this.recordTest('Webhook Security - Invalid Token', 'FAIL', error.message);
      }
    }
  }

  async testWebhookMessageProcessing() {
    const testMessages = [
      {
        scenario: 'Simple Text Message',
        payload: {
          object: 'page',
          entry: [{
            id: 'test_page_001',
            time: Date.now(),
            messaging: [{
              sender: { id: 'test_user_001' },
              recipient: { id: 'test_page_001' },
              timestamp: Date.now(),
              message: {
                mid: `test_msg_${Date.now()}`,
                text: 'Hello, I need help with my order'
              }
            }]
          }]
        }
      },
      {
        scenario: 'Message with Attachments',
        payload: {
          object: 'page',
          entry: [{
            id: 'test_page_002',
            time: Date.now(),
            messaging: [{
              sender: { id: 'test_user_002' },
              recipient: { id: 'test_page_002' },
              timestamp: Date.now(),
              message: {
                mid: `test_msg_${Date.now()}`,
                text: 'Here is my receipt',
                attachments: [{
                  type: 'image',
                  payload: { url: 'https://example.com/receipt.jpg' }
                }]
              }
            }]
          }]
        }
      },
      {
        scenario: 'Postback Event',
        payload: {
          object: 'page',
          entry: [{
            id: 'test_page_003',
            time: Date.now(),
            messaging: [{
              sender: { id: 'test_user_003' },
              recipient: { id: 'test_page_003' },
              timestamp: Date.now(),
              postback: {
                payload: 'GET_STARTED_PAYLOAD',
                title: 'Get Started'
              }
            }]
          }]
        }
      }
    ];

    for (const test of testMessages) {
      try {
        const payload = JSON.stringify(test.payload);
        const signature = this.generateSignature(payload, 'test_app_secret');
        
        const response = await this.makeRequest('/webhook/facebook', 'POST', test.payload, {
          'X-Hub-Signature-256': signature
        });
        
        if (response.status === 200) {
          await this.recordTest(`Webhook Processing: ${test.scenario}`, 'PASS', 'Message processed successfully');
        } else {
          await this.recordTest(`Webhook Processing: ${test.scenario}`, 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        await this.recordTest(`Webhook Processing: ${test.scenario}`, 'FAIL', error.message);
      }
    }
  }

  async testFacebookPagesAPI() {
    try {
      const response = await this.makeRequest('/api/facebook/pages');
      if (response.status === 200) {
        const pages = response.data;
        if (Array.isArray(pages)) {
          await this.recordTest('Facebook Pages API Structure', 'PASS', `${pages.length} pages retrieved`);
          
          // Validate page data structure
          if (pages.length > 0) {
            const firstPage = pages[0];
            const requiredFields = ['pageId', 'name', 'accessToken'];
            const hasRequiredFields = requiredFields.every(field => firstPage.hasOwnProperty(field));
            
            if (hasRequiredFields) {
              await this.recordTest('Facebook Pages Data Structure', 'PASS', 'Page data contains required fields');
            } else {
              await this.recordTest('Facebook Pages Data Structure', 'FAIL', 'Missing required page fields');
            }
          } else {
            await this.recordTest('Facebook Pages Data Structure', 'SKIP', 'No pages to validate');
          }
        } else {
          await this.recordTest('Facebook Pages API Structure', 'FAIL', 'Response is not an array');
        }
      } else if (response.status === 401) {
        await this.recordTest('Facebook Pages API', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('Facebook Pages API', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('Facebook Pages API', 'SKIP', 'Authentication required');
      } else {
        await this.recordTest('Facebook Pages API', 'FAIL', error.message);
      }
    }
  }

  async testFacebookPageOperations() {
    const testOperations = [
      {
        name: 'Page Details Retrieval',
        endpoint: '/api/facebook/page/test_page_id',
        method: 'GET'
      },
      {
        name: 'Page Insights',
        endpoint: '/api/facebook/page/test_page_id/insights',
        method: 'GET'
      },
      {
        name: 'Page Posts',
        endpoint: '/api/facebook/page/test_page_id/posts',
        method: 'GET'
      }
    ];

    for (const operation of testOperations) {
      try {
        const response = await this.makeRequest(operation.endpoint, operation.method);
        if (response.status === 200) {
          await this.recordTest(`Facebook ${operation.name}`, 'PASS', 'Operation completed successfully');
        } else if (response.status === 401) {
          await this.recordTest(`Facebook ${operation.name}`, 'SKIP', 'Authentication required');
        } else if (response.status === 404) {
          await this.recordTest(`Facebook ${operation.name}`, 'SKIP', 'Endpoint not implemented');
        } else {
          await this.recordTest(`Facebook ${operation.name}`, 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await this.recordTest(`Facebook ${operation.name}`, 'SKIP', 'Authentication required');
        } else if (error.response && error.response.status === 404) {
          await this.recordTest(`Facebook ${operation.name}`, 'SKIP', 'Endpoint not implemented');
        } else {
          await this.recordTest(`Facebook ${operation.name}`, 'FAIL', error.message);
        }
      }
    }
  }

  async testFacebookMessaging() {
    const testMessage = {
      pageId: 'test_page_id',
      recipientId: 'test_user_id',
      message: {
        text: 'Thank you for your message. Our team will respond shortly.'
      }
    };

    try {
      const response = await this.makeRequest('/api/facebook/send-message', 'POST', testMessage);
      if (response.status === 200) {
        await this.recordTest('Facebook Send Message', 'PASS', 'Message sent successfully');
      } else if (response.status === 401) {
        await this.recordTest('Facebook Send Message', 'SKIP', 'Authentication required');
      } else if (response.status === 404) {
        await this.recordTest('Facebook Send Message', 'SKIP', 'Endpoint not implemented');
      } else {
        await this.recordTest('Facebook Send Message', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await this.recordTest('Facebook Send Message', 'SKIP', 'Authentication required');
      } else if (error.response && error.response.status === 404) {
        await this.recordTest('Facebook Send Message', 'SKIP', 'Endpoint not implemented');
      } else {
        await this.recordTest('Facebook Send Message', 'FAIL', error.message);
      }
    }
  }

  async testFacebookConversionsAPI() {
    const testEvents = [
      {
        name: 'Page View Event',
        data: {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            external_id: 'test_user_' + Date.now()
          },
          custom_data: {
            content_name: 'SaCuRa AI Dashboard',
            content_category: 'Marketing Tool'
          }
        }
      },
      {
        name: 'Lead Event',
        data: {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            external_id: 'test_user_' + Date.now(),
            email: 'test@example.com'
          },
          custom_data: {
            content_name: 'Free Trial Signup',
            value: 0,
            currency: 'USD'
          }
        }
      }
    ];

    for (const event of testEvents) {
      try {
        const response = await this.makeRequest('/api/facebook/conversions/track', 'POST', event.data);
        if (response.status === 200) {
          await this.recordTest(`Facebook Conversions: ${event.name}`, 'PASS', 'Event tracked successfully');
        } else if (response.status === 401) {
          await this.recordTest(`Facebook Conversions: ${event.name}`, 'SKIP', 'Authentication required');
        } else if (response.status === 404) {
          await this.recordTest(`Facebook Conversions: ${event.name}`, 'SKIP', 'Endpoint not implemented');
        } else {
          await this.recordTest(`Facebook Conversions: ${event.name}`, 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await this.recordTest(`Facebook Conversions: ${event.name}`, 'SKIP', 'Authentication required');
        } else if (error.response && error.response.status === 404) {
          await this.recordTest(`Facebook Conversions: ${event.name}`, 'SKIP', 'Endpoint not implemented');
        } else {
          await this.recordTest(`Facebook Conversions: ${event.name}`, 'FAIL', error.message);
        }
      }
    }
  }

  async testWebhookSecurity() {
    const testPayload = {
      object: 'page',
      entry: [{
        id: 'security_test_page',
        time: Date.now(),
        messaging: [{
          sender: { id: 'security_test_user' },
          recipient: { id: 'security_test_page' },
          timestamp: Date.now(),
          message: {
            mid: 'security_test_message',
            text: 'This is a security test message'
          }
        }]
      }]
    };

    // Test with no signature
    try {
      const response = await this.makeRequest('/webhook/facebook', 'POST', testPayload);
      await this.recordTest('Webhook Security - No Signature', 'FAIL', 'Should reject requests without signature');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.recordTest('Webhook Security - No Signature', 'PASS', 'Correctly rejects unsigned requests');
      } else {
        await this.recordTest('Webhook Security - No Signature', 'FAIL', error.message);
      }
    }

    // Test with invalid signature
    try {
      const response = await this.makeRequest('/webhook/facebook', 'POST', testPayload, {
        'X-Hub-Signature-256': 'sha256=invalid_signature'
      });
      await this.recordTest('Webhook Security - Invalid Signature', 'FAIL', 'Should reject invalid signatures');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.recordTest('Webhook Security - Invalid Signature', 'PASS', 'Correctly rejects invalid signatures');
      } else {
        await this.recordTest('Webhook Security - Invalid Signature', 'FAIL', error.message);
      }
    }
  }

  async runAllTests() {
    this.log('📘 Starting Facebook Integration Tests');
    
    await this.testWebhookVerification();
    await this.testWebhookMessageProcessing();
    await this.testFacebookPagesAPI();
    await this.testFacebookPageOperations();
    await this.testFacebookMessaging();
    await this.testFacebookConversionsAPI();
    await this.testWebhookSecurity();

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    this.log(`✅ Facebook Integration Tests Complete: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    return this.results;
  }
}

module.exports = FacebookIntegrationTester;