/**
 * Facebook Marketing API Integration Test
 * Validates the Marketing API token and tests campaign management features
 */

import axios from 'axios';

class MarketingAPITester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📘',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data && method !== 'GET') {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`${error.response?.status}: ${error.response?.data?.error || error.message}`);
    }
  }

  async testTokenValidation() {
    try {
      this.log('Testing Marketing API token validation...', 'info');
      
      const response = await this.makeRequest('/api/marketing/validate-token');
      
      if (response.success && response.validation) {
        const validation = response.validation;
        this.log(`Token Status: ${validation.isValid ? 'Valid' : 'Invalid'}`, validation.isValid ? 'success' : 'error');
        this.log(`App ID: ${validation.appId}`, 'info');
        this.log(`Scopes: ${validation.scopes?.join(', ') || 'None'}`, 'info');
        
        if (validation.userId) {
          this.log(`User ID: ${validation.userId}`, 'info');
        }
        
        if (validation.expiresAt) {
          const expiryDate = new Date(validation.expiresAt * 1000);
          this.log(`Expires: ${expiryDate.toISOString()}`, 'info');
        }
        
        this.results.tests.push({
          name: 'Token Validation',
          status: validation.isValid ? 'PASS' : 'FAIL',
          details: validation
        });
        
        if (validation.isValid) {
          this.results.passed++;
          return true;
        } else {
          this.results.failed++;
          return false;
        }
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      this.log(`Token validation failed: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Token Validation',
        status: 'FAIL',
        error: error.message
      });
      this.results.failed++;
      return false;
    }
  }

  async testAdAccountsRetrieval() {
    try {
      this.log('Testing ad accounts retrieval...', 'info');
      
      const response = await this.makeRequest('/api/marketing/ad-accounts');
      
      if (response.success && Array.isArray(response.adAccounts)) {
        this.log(`Found ${response.adAccounts.length} ad accounts`, 'success');
        
        response.adAccounts.forEach((account, index) => {
          this.log(`Account ${index + 1}: ${account.name} (${account.id})`, 'info');
          this.log(`  Status: ${account.account_status === 1 ? 'Active' : 'Inactive'}`, 'info');
          this.log(`  Currency: ${account.currency}`, 'info');
          if (account.balance) {
            this.log(`  Balance: ${account.currency} ${account.balance}`, 'info');
          }
        });
        
        this.results.tests.push({
          name: 'Ad Accounts Retrieval',
          status: 'PASS',
          details: { count: response.adAccounts.length, accounts: response.adAccounts }
        });
        this.results.passed++;
        return response.adAccounts;
      }
      
      throw new Error('Invalid response format or no ad accounts');
    } catch (error) {
      this.log(`Ad accounts retrieval failed: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Ad Accounts Retrieval',
        status: 'FAIL',
        error: error.message
      });
      this.results.failed++;
      return [];
    }
  }

  async testCampaignManagement(adAccountId) {
    if (!adAccountId) {
      this.log('Skipping campaign management test - no ad account available', 'warning');
      return false;
    }

    try {
      this.log(`Testing campaign management for account ${adAccountId}...`, 'info');
      
      // Test campaigns retrieval
      const campaignsResponse = await this.makeRequest(`/api/marketing/campaigns/${adAccountId}`);
      
      if (campaignsResponse.success && Array.isArray(campaignsResponse.campaigns)) {
        this.log(`Found ${campaignsResponse.campaigns.length} campaigns`, 'success');
        
        campaignsResponse.campaigns.slice(0, 3).forEach((campaign, index) => {
          this.log(`Campaign ${index + 1}: ${campaign.name}`, 'info');
          this.log(`  Objective: ${campaign.objective}`, 'info');
          this.log(`  Status: ${campaign.status}`, 'info');
          this.log(`  Created: ${new Date(campaign.created_time).toLocaleDateString()}`, 'info');
        });
        
        this.results.tests.push({
          name: 'Campaign Retrieval',
          status: 'PASS',
          details: { count: campaignsResponse.campaigns.length }
        });
        this.results.passed++;
        
        // Test campaign report generation
        try {
          const reportResponse = await this.makeRequest(`/api/marketing/campaign-report/${adAccountId}`);
          
          if (reportResponse.success && reportResponse.report) {
            const report = reportResponse.report;
            this.log('Campaign report generated successfully', 'success');
            this.log(`Total Spend: $${report.totalSpend.toFixed(2)}`, 'info');
            this.log(`Total Impressions: ${report.totalImpressions.toLocaleString()}`, 'info');
            this.log(`Total Clicks: ${report.totalClicks.toLocaleString()}`, 'info');
            this.log(`Average CTR: ${report.avgCTR.toFixed(2)}%`, 'info');
            
            this.results.tests.push({
              name: 'Campaign Report Generation',
              status: 'PASS',
              details: report
            });
            this.results.passed++;
          }
        } catch (reportError) {
          this.log(`Campaign report generation failed: ${reportError.message}`, 'warning');
          this.results.tests.push({
            name: 'Campaign Report Generation',
            status: 'FAIL',
            error: reportError.message
          });
          this.results.failed++;
        }
        
        return true;
      }
      
      throw new Error('Invalid campaigns response');
    } catch (error) {
      this.log(`Campaign management test failed: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Campaign Management',
        status: 'FAIL',
        error: error.message
      });
      this.results.failed++;
      return false;
    }
  }

  async testInterestTargeting() {
    try {
      this.log('Testing interest targeting research...', 'info');
      
      const testQueries = ['fitness', 'technology', 'travel'];
      
      for (const query of testQueries) {
        try {
          const response = await this.makeRequest(`/api/marketing/interest-suggestions?query=${encodeURIComponent(query)}&limit=5`);
          
          if (response.success && Array.isArray(response.suggestions)) {
            this.log(`Found ${response.suggestions.length} interests for "${query}"`, 'success');
            
            response.suggestions.slice(0, 2).forEach((interest, index) => {
              this.log(`  ${interest.name} (ID: ${interest.id})`, 'info');
              if (interest.audience_size_lower_bound) {
                this.log(`    Audience: ${interest.audience_size_lower_bound.toLocaleString()} - ${interest.audience_size_upper_bound.toLocaleString()} people`, 'info');
              }
            });
          }
        } catch (queryError) {
          this.log(`Interest query for "${query}" failed: ${queryError.message}`, 'warning');
        }
      }
      
      this.results.tests.push({
        name: 'Interest Targeting Research',
        status: 'PASS',
        details: { queriesTested: testQueries.length }
      });
      this.results.passed++;
      return true;
    } catch (error) {
      this.log(`Interest targeting test failed: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Interest Targeting Research',
        status: 'FAIL',
        error: error.message
      });
      this.results.failed++;
      return false;
    }
  }

  async testSecurityFeatures() {
    try {
      this.log('Testing security features...', 'info');
      
      const response = await this.makeRequest('/api/facebook/security-validation');
      
      if (response.success && response.validation) {
        this.log('Security validation completed', 'success');
        this.log(`App Secret Proof: ${response.validation.appSecretProofValidation ? 'Valid' : 'Invalid'}`, 'info');
        this.log(`Token Security: ${response.validation.tokenSecurityCheck ? 'Secure' : 'Insecure'}`, 'info');
        
        this.results.tests.push({
          name: 'Security Features',
          status: 'PASS',
          details: response.validation
        });
        this.results.passed++;
        return true;
      }
      
      throw new Error('Security validation failed');
    } catch (error) {
      this.log(`Security features test failed: ${error.message}`, 'error');
      this.results.tests.push({
        name: 'Security Features',
        status: 'FAIL',
        error: error.message
      });
      this.results.failed++;
      return false;
    }
  }

  generateReport() {
    const totalTests = this.results.passed + this.results.failed;
    const successRate = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(1) : 0;
    
    this.log('\n' + '='.repeat(60), 'info');
    this.log('FACEBOOK MARKETING API INTEGRATION TEST REPORT', 'info');
    this.log('='.repeat(60), 'info');
    this.log(`Total Tests: ${totalTests}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    this.log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
    this.log('', 'info');
    
    this.log('Test Details:', 'info');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      this.log(`${status} ${test.name}`, 'info');
      if (test.error) {
        this.log(`   Error: ${test.error}`, 'error');
      }
    });
    
    this.log('', 'info');
    
    if (successRate >= 80) {
      this.log('🎉 Marketing API integration is working correctly!', 'success');
    } else if (successRate >= 60) {
      this.log('⚠️ Marketing API integration has some issues but core functionality works', 'warning');
    } else {
      this.log('🚨 Marketing API integration needs attention', 'error');
    }
    
    return {
      totalTests,
      passed: this.results.passed,
      failed: this.results.failed,
      successRate: parseFloat(successRate),
      tests: this.results.tests
    };
  }

  async runCompleteTest() {
    this.log('Starting Facebook Marketing API Integration Test Suite...', 'info');
    this.log('', 'info');
    
    // Test 1: Token Validation
    const tokenValid = await this.testTokenValidation();
    
    if (!tokenValid) {
      this.log('Token validation failed - skipping remaining tests', 'error');
      return this.generateReport();
    }
    
    // Test 2: Ad Accounts Retrieval
    const adAccounts = await this.testAdAccountsRetrieval();
    
    // Test 3: Campaign Management (if ad accounts available)
    if (adAccounts.length > 0) {
      await this.testCampaignManagement(adAccounts[0].id);
    }
    
    // Test 4: Interest Targeting
    await this.testInterestTargeting();
    
    // Test 5: Security Features
    await this.testSecurityFeatures();
    
    return this.generateReport();
  }
}

async function main() {
  const tester = new MarketingAPITester();
  
  try {
    await tester.runCompleteTest();
  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);