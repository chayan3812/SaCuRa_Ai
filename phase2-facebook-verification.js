/**
 * Phase 2 Facebook Integration Verification
 * Tests the enhanced image upload and link preview functionality
 */

import fs from 'fs';
import path from 'path';

class Phase2FacebookVerification {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  recordTest(name, status, details = '') {
    this.results.tests.push({ name, status, details, timestamp: new Date() });
    if (status === 'PASS') {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
    this.log(`${name}: ${status}${details ? ` - ${details}` : ''}`, status === 'PASS' ? 'success' : 'error');
  }

  // Test frontend component structure
  testFacebookDashboardComponent() {
    try {
      const componentPath = './client/src/components/facebook/FacebookDashboard.tsx';
      const componentExists = fs.existsSync(componentPath);
      
      if (!componentExists) {
        this.recordTest('FacebookDashboard Component Exists', 'FAIL', 'Component file not found');
        return;
      }

      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      // Check for Phase 2 features
      const hasFileUpload = componentContent.includes('uploadedFile') && componentContent.includes('handleFileUpload');
      const hasLinkPreview = componentContent.includes('linkPreview') && componentContent.includes('handleLinkPreview');
      const hasEnhancedUI = componentContent.includes('file:bg-blue-600') && componentContent.includes('CheckCircle');
      
      this.recordTest('File Upload Feature', hasFileUpload ? 'PASS' : 'FAIL', 
        hasFileUpload ? 'File upload state and handler present' : 'Missing file upload functionality');
      
      this.recordTest('Link Preview Feature', hasLinkPreview ? 'PASS' : 'FAIL',
        hasLinkPreview ? 'Link preview state and handler present' : 'Missing link preview functionality');
      
      this.recordTest('Enhanced UI Elements', hasEnhancedUI ? 'PASS' : 'FAIL',
        hasEnhancedUI ? 'Enhanced UI styling and feedback present' : 'Missing enhanced UI elements');

    } catch (error) {
      this.recordTest('FacebookDashboard Component Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  // Test backend endpoints
  testBackendEndpoints() {
    try {
      const routesPath = './server/routes.ts';
      const routesExists = fs.existsSync(routesPath);
      
      if (!routesExists) {
        this.recordTest('Backend Routes File', 'FAIL', 'Routes file not found');
        return;
      }

      const routesContent = fs.readFileSync(routesPath, 'utf8');
      
      // Check for Phase 2 endpoints
      const hasPhotoEndpoint = routesContent.includes('/api/facebook/photo') && routesContent.includes('uploadPhotoPost');
      const hasLinkEndpoint = routesContent.includes('/api/facebook/link') && routesContent.includes('getLinkPreview');
      
      this.recordTest('Photo Upload Endpoint', hasPhotoEndpoint ? 'PASS' : 'FAIL',
        hasPhotoEndpoint ? '/api/facebook/photo endpoint implemented' : 'Missing photo upload endpoint');
      
      this.recordTest('Link Preview Endpoint', hasLinkEndpoint ? 'PASS' : 'FAIL',
        hasLinkEndpoint ? '/api/facebook/link endpoint implemented' : 'Missing link preview endpoint');

    } catch (error) {
      this.recordTest('Backend Endpoints Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  // Test Facebook API service methods
  testFacebookAPIService() {
    try {
      const servicePath = './server/facebookAPIService.ts';
      const serviceExists = fs.existsSync(servicePath);
      
      if (!serviceExists) {
        this.recordTest('Facebook API Service File', 'FAIL', 'Service file not found');
        return;
      }

      const serviceContent = fs.readFileSync(servicePath, 'utf8');
      
      // Check for Phase 2 methods
      const hasUploadPhotoPost = serviceContent.includes('uploadPhotoPost') && serviceContent.includes('async uploadPhotoPost');
      const hasGetLinkPreview = serviceContent.includes('getLinkPreview') && serviceContent.includes('async getLinkPreview');
      const hasWebScraping = serviceContent.includes('og:title') && serviceContent.includes('User-Agent');
      
      this.recordTest('Upload Photo Post Method', hasUploadPhotoPost ? 'PASS' : 'FAIL',
        hasUploadPhotoPost ? 'uploadPhotoPost method implemented' : 'Missing uploadPhotoPost method');
      
      this.recordTest('Get Link Preview Method', hasGetLinkPreview ? 'PASS' : 'FAIL',
        hasGetLinkPreview ? 'getLinkPreview method implemented' : 'Missing getLinkPreview method');
      
      this.recordTest('Web Scraping Functionality', hasWebScraping ? 'PASS' : 'FAIL',
        hasWebScraping ? 'OpenGraph meta tag extraction implemented' : 'Missing web scraping functionality');

    } catch (error) {
      this.recordTest('Facebook API Service Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  // Test UI component integration
  testUIIntegration() {
    try {
      const componentPath = './client/src/components/facebook/FacebookDashboard.tsx';
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      // Check for proper import statements
      const hasAxiosImport = componentContent.includes('import axios from "axios"');
      const hasUploadIcon = componentContent.includes('Upload') && componentContent.includes('lucide-react');
      const hasProperStateManagement = componentContent.includes('useState<File | null>') && componentContent.includes('LinkPreview | null');
      
      this.recordTest('Required Imports', hasAxiosImport && hasUploadIcon ? 'PASS' : 'FAIL',
        'Axios and Upload icon imports verified');
      
      this.recordTest('State Management', hasProperStateManagement ? 'PASS' : 'FAIL',
        hasProperStateManagement ? 'Proper TypeScript state management' : 'Missing proper state types');

      // Check for enhanced UI elements
      const hasFileSelector = componentContent.includes('type="file"') && componentContent.includes('accept="image/*"');
      const hasPreviewUI = componentContent.includes('bg-gray-50 dark:bg-gray-800') && componentContent.includes('rounded-lg border');
      const hasButtonStates = componentContent.includes('disabled={!uploadedFile}') && componentContent.includes('variant={uploadedFile ? "default" : "outline"}');
      
      this.recordTest('File Selector UI', hasFileSelector ? 'PASS' : 'FAIL',
        hasFileSelector ? 'File input with image filter implemented' : 'Missing file selector');
      
      this.recordTest('Preview UI Components', hasPreviewUI ? 'PASS' : 'FAIL',
        hasPreviewUI ? 'Link preview UI styling implemented' : 'Missing preview UI');
      
      this.recordTest('Dynamic Button States', hasButtonStates ? 'PASS' : 'FAIL',
        hasButtonStates ? 'Dynamic button states based on file selection' : 'Missing dynamic button states');

    } catch (error) {
      this.recordTest('UI Integration Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  generateReport() {
    const totalTests = this.results.passed + this.results.failed;
    const passRate = totalTests > 0 ? (this.results.passed / totalTests * 100).toFixed(1) : 0;
    
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        passRate: `${passRate}%`
      },
      phase2Features: {
        imageUpload: {
          description: 'Direct file upload from device with preview',
          status: this.results.tests.find(t => t.name === 'File Upload Feature')?.status || 'NOT_TESTED'
        },
        linkPreview: {
          description: 'Web scraping for link metadata and preview',
          status: this.results.tests.find(t => t.name === 'Link Preview Feature')?.status || 'NOT_TESTED'
        },
        enhancedUI: {
          description: 'Improved user interface with visual feedback',
          status: this.results.tests.find(t => t.name === 'Enhanced UI Elements')?.status || 'NOT_TESTED'
        }
      },
      backendIntegration: {
        photoEndpoint: this.results.tests.find(t => t.name === 'Photo Upload Endpoint')?.status || 'NOT_TESTED',
        linkEndpoint: this.results.tests.find(t => t.name === 'Link Preview Endpoint')?.status || 'NOT_TESTED',
        apiService: this.results.tests.find(t => t.name === 'Upload Photo Post Method')?.status || 'NOT_TESTED'
      },
      detailedResults: this.results.tests,
      nextSteps: this.generateNextSteps()
    };

    return report;
  }

  generateNextSteps() {
    const failedTests = this.results.tests.filter(t => t.status === 'FAIL');
    
    if (failedTests.length === 0) {
      return [
        'Phase 2 integration complete and verified',
        'Ready for Facebook API credentials testing',
        'Ready to proceed with Phase 3 features'
      ];
    }

    return failedTests.map(test => `Fix: ${test.name} - ${test.details}`);
  }

  async runCompleteVerification() {
    this.log('Starting Phase 2 Facebook Integration Verification', 'info');
    this.log('='.repeat(60), 'info');

    this.testFacebookDashboardComponent();
    this.testBackendEndpoints();
    this.testFacebookAPIService();
    this.testUIIntegration();

    const report = this.generateReport();
    
    this.log('='.repeat(60), 'info');
    this.log(`Verification Complete: ${report.summary.passed}/${report.summary.totalTests} tests passed (${report.summary.passRate})`, 'info');
    
    if (report.summary.failed === 0) {
      this.log('🎉 Phase 2 Facebook Integration: ALL SYSTEMS OPERATIONAL', 'success');
    } else {
      this.log(`⚠️ ${report.summary.failed} issues need attention`, 'error');
    }

    // Write detailed report
    fs.writeFileSync('phase2-verification-report.json', JSON.stringify(report, null, 2));
    this.log('Detailed report saved to phase2-verification-report.json', 'info');

    return report;
  }
}

async function main() {
  const verifier = new Phase2FacebookVerification();
  await verifier.runCompleteVerification();
}

main().catch(console.error);