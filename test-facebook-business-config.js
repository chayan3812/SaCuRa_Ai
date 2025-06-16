/**
 * Facebook Business Configuration Test Suite
 * Tests Configuration ID 1595617591110969 integration
 */

import axios from 'axios';

class FacebookBusinessConfigTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.configId = '1595617591110969';
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message };
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    this.results.push(logEntry);
  }

  async testBusinessConfigEndpoint() {
    try {
      this.log('Testing Facebook Business Configuration endpoint...');
      const response = await axios.get(`${this.baseUrl}/api/facebook/business-config`);
      
      if (response.status === 200) {
        const config = response.data;
        this.log(`Configuration ID: ${config.configurationId}`, 'success');
        this.log(`App ID: ${config.appId}`, 'success');
        this.log(`Pixel ID: ${config.pixelId}`, 'success');
        this.log(`Status: ${config.status}`, 'success');
        
        // Verify Configuration ID matches
        if (config.configurationId === this.configId) {
          this.log('Configuration ID verification: PASSED', 'success');
        } else {
          this.log(`Configuration ID mismatch: Expected ${this.configId}, got ${config.configurationId}`, 'error');
        }
        
        // Verify features are enabled
        const features = config.features;
        this.log(`Login for Business: ${features.loginForBusiness ? 'ENABLED' : 'DISABLED'}`, features.loginForBusiness ? 'success' : 'warning');
        this.log(`Conversions API: ${features.conversionsAPI ? 'ENABLED' : 'DISABLED'}`, features.conversionsAPI ? 'success' : 'warning');
        this.log(`Advanced Matching: ${features.advancedMatching ? 'ENABLED' : 'DISABLED'}`, features.advancedMatching ? 'success' : 'warning');
        this.log(`Server-Side Events: ${features.serverSideEvents ? 'ENABLED' : 'DISABLED'}`, features.serverSideEvents ? 'success' : 'warning');
        
        return { success: true, config };
      }
    } catch (error) {
      this.log(`Business config endpoint error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testConfigValidation() {
    try {
      this.log('Testing configuration validation...');
      const response = await axios.post(`${this.baseUrl}/api/facebook/validate-config`, {
        configId: this.configId,
        permissions: ['email', 'pages_show_list', 'pages_read_engagement']
      });
      
      if (response.status === 200) {
        const validation = response.data;
        this.log(`Validation result: ${validation.valid ? 'VALID' : 'INVALID'}`, validation.valid ? 'success' : 'error');
        this.log(`Status: ${validation.status}`, 'success');
        this.log(`Validated permissions: ${validation.validatedPermissions.join(', ')}`, 'success');
        
        if (validation.recommendations.length > 0) {
          this.log(`Recommendations: ${validation.recommendations.join(', ')}`, 'warning');
        }
        
        return { success: true, validation };
      }
    } catch (error) {
      this.log(`Config validation error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testConversionsAPI() {
    try {
      this.log('Testing Conversions API with Configuration ID...');
      const response = await axios.post(`${this.baseUrl}/api/conversions/test`, {
        event_name: 'PageView',
        action_source: 'website',
        user_data: {
          external_id: 'test_user_config_123',
          client_ip_address: '127.0.0.1',
          client_user_agent: 'Mozilla/5.0 (Test Browser)'
        },
        event_source_url: 'https://sa-cura-live-sopiahank.replit.app'
      });
      
      if (response.status === 200) {
        const result = response.data;
        this.log(`Conversions API success: ${result.success}`, result.success ? 'success' : 'error');
        this.log(`Configuration ID in response: ${result.configurationId}`, 'success');
        this.log(`Message: ${result.message}`, 'success');
        
        return { success: true, result };
      }
    } catch (error) {
      this.log(`Conversions API error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testAuthenticationFlow() {
    try {
      this.log('Testing Facebook authentication redirect...');
      const response = await axios.get(`${this.baseUrl}/api/facebook/auth`, {
        maxRedirects: 0,
        validateStatus: (status) => status === 302
      });
      
      if (response.status === 302) {
        const redirectUrl = response.headers.location;
        this.log(`Authentication redirect URL: ${redirectUrl}`, 'success');
        
        // Check if redirect contains Facebook OAuth URL
        if (redirectUrl && redirectUrl.includes('facebook.com')) {
          this.log('Facebook OAuth redirect: VALID', 'success');
        } else {
          this.log('Invalid OAuth redirect URL', 'warning');
        }
        
        return { success: true, redirectUrl };
      }
    } catch (error) {
      this.log(`Authentication flow error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async runCompleteTest() {
    this.log('Starting Facebook Business Configuration Test Suite');
    this.log(`Configuration ID: ${this.configId}`);
    
    const results = {
      businessConfig: await this.testBusinessConfigEndpoint(),
      validation: await this.testConfigValidation(),
      conversionsAPI: await this.testConversionsAPI(),
      authFlow: await this.testAuthenticationFlow()
    };
    
    // Summary
    this.log('\n=== TEST SUMMARY ===');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r.success).length;
    
    this.log(`Total Tests: ${totalTests}`);
    this.log(`Passed: ${passedTests}`);
    this.log(`Failed: ${totalTests - passedTests}`);
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      this.log('🎉 ALL TESTS PASSED - Facebook Business Configuration is fully operational!', 'success');
    } else {
      this.log('⚠️ Some tests failed - Configuration needs attention', 'warning');
    }
    
    return results;
  }
}

// Run the test suite
async function main() {
  const tester = new FacebookBusinessConfigTester();
  await tester.runCompleteTest();
}

main().catch(console.error);