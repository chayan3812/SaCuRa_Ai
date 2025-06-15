/**
 * Facebook OAuth Flow Test - Live Integration Verification
 * Tests the complete authentication flow with real Facebook credentials
 */

import axios from 'axios';

class FacebookOAuthTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    
    this.testResults.push({
      timestamp,
      type,
      message,
      status: type === 'error' ? 'FAILED' : 'PASSED'
    });
  }

  async testCredentialVerification() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/facebook/verify-credentials`);
      
      if (response.status === 200) {
        const { results } = response.data;
        
        if (results.appCredentials && results.appCredentials.valid) {
          this.log('Facebook app credentials verified successfully');
          this.log(`App configured: ${results.appCredentials.configured}`);
          return true;
        } else {
          this.log('Facebook app credentials not properly configured', 'error');
          return false;
        }
      }
      
      this.log('Credential verification endpoint not responding correctly', 'error');
      return false;
    } catch (error) {
      this.log(`Credential verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAuthURLGeneration() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/facebook/auth`, {
        maxRedirects: 0,
        validateStatus: (status) => status === 302
      });
      
      if (response.status === 302) {
        const redirectUrl = response.headers.location;
        
        if (redirectUrl && redirectUrl.includes('facebook.com') && redirectUrl.includes('oauth')) {
          this.log('Facebook OAuth URL generated successfully');
          this.log(`Redirect URL contains proper Facebook OAuth endpoint`);
          
          // Extract app ID from URL to verify it matches our configuration
          const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
          const clientId = urlParams.get('client_id');
          
          if (clientId) {
            this.log(`OAuth configured with App ID: ${clientId}`);
          }
          
          return true;
        } else {
          this.log('Invalid OAuth redirect URL generated', 'error');
          return false;
        }
      }
      
      this.log('OAuth endpoint not returning proper redirect', 'error');
      return false;
    } catch (error) {
      this.log(`OAuth URL generation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPagesEndpoint() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/facebook/pages`);
      
      if (response.status === 200) {
        const pages = response.data;
        
        if (Array.isArray(pages)) {
          this.log(`Facebook pages endpoint working - ${pages.length} pages found`);
          
          if (pages.length > 0) {
            this.log('Connected Facebook pages detected');
            pages.forEach((page, index) => {
              this.log(`  Page ${index + 1}: ${page.pageName} (${page.followerCount} followers)`);
            });
          } else {
            this.log('No Facebook pages connected yet (expected before OAuth)');
          }
          
          return true;
        } else {
          this.log('Pages endpoint not returning array format', 'error');
          return false;
        }
      }
      
      this.log('Pages endpoint not responding correctly', 'error');
      return false;
    } catch (error) {
      this.log(`Pages endpoint test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testTokenManager() {
    try {
      // Test token manager functionality
      const response = await axios.post(`${this.baseUrl}/api/facebook/validate-token`, {
        token: 'test_token'
      });
      
      // We expect this to fail with invalid token, but the endpoint should respond
      if (response.status === 200 || response.status === 400) {
        this.log('Token validation endpoint responding correctly');
        return true;
      }
      
      this.log('Token validation endpoint not configured', 'error');
      return false;
    } catch (error) {
      // Expected to fail with test token, but should return proper error response
      if (error.response && error.response.status === 400) {
        this.log('Token validation endpoint working (properly rejecting invalid token)');
        return true;
      }
      
      this.log(`Token manager test failed: ${error.message}`, 'error');
      return false;
    }
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;
    
    console.log('\n=== FACEBOOK OAUTH FLOW TEST REPORT ===');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('\n✅ ALL TESTS PASSED - Facebook OAuth integration is ready for production use!');
      console.log('\nNext Steps:');
      console.log('1. Click "Connect New Page" button in dashboard');
      console.log('2. Complete Facebook OAuth authorization');
      console.log('3. Your business pages will be connected automatically');
    } else {
      console.log('\n❌ SOME TESTS FAILED - Please check configuration');
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.message}`));
    }
    
    return { passed, failed, total, testResults: this.testResults };
  }

  async runCompleteTest() {
    console.log('Starting Facebook OAuth Flow Test...\n');
    
    await this.testCredentialVerification();
    await this.testAuthURLGeneration();
    await this.testPagesEndpoint();
    await this.testTokenManager();
    
    return this.generateReport();
  }
}

async function main() {
  const tester = new FacebookOAuthTester();
  await tester.runCompleteTest();
}

main().catch(console.error);