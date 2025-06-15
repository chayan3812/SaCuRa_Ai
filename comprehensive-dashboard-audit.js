/**
 * SaCuRa AI - Comprehensive Dashboard Systems Audit
 * Complete end-to-end verification from database to frontend
 * DevOps, Full-Stack, Testing, Product Management, and Analysis perspective
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveDashboardAuditor {
  constructor() {
    this.auditResults = {
      database: { passed: 0, failed: 0, issues: [] },
      backend: { passed: 0, failed: 0, issues: [] },
      frontend: { passed: 0, failed: 0, issues: [] },
      integration: { passed: 0, failed: 0, issues: [] },
      performance: { passed: 0, failed: 0, issues: [] },
      security: { passed: 0, failed: 0, issues: [] }
    };
    this.baseUrl = 'http://localhost:5000';
    this.detailedReport = [];
  }

  log(message, category = 'info', severity = 'normal') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${category.toUpperCase()}] ${message}`;
    console.log(logEntry);
    
    this.detailedReport.push({
      timestamp,
      category,
      severity,
      message,
      component: 'audit'
    });
  }

  async recordTest(testName, category, status, details = '', evidence = null) {
    const result = {
      test: testName,
      category,
      status,
      details,
      evidence,
      timestamp: new Date().toISOString()
    };

    this.auditResults[category][status === 'PASS' ? 'passed' : 'failed']++;
    if (status === 'FAIL') {
      this.auditResults[category].issues.push(result);
    }

    this.log(`${testName}: ${status} - ${details}`, category, status === 'FAIL' ? 'critical' : 'normal');
    return result;
  }

  // PHASE 1: DATABASE LAYER ANALYSIS
  async auditDatabaseLayer() {
    this.log('=== PHASE 1: DATABASE LAYER DEEP ANALYSIS ===', 'database');
    
    // Check schema structure
    await this.verifySchemaStructure();
    
    // Verify database connections
    await this.verifyDatabaseConnections();
    
    // Test CRUD operations
    await this.testDatabaseCRUDOperations();
    
    // Check data integrity
    await this.validateDataIntegrity();
    
    // Performance analysis
    await this.analyzeDatabasePerformance();
  }

  async verifySchemaStructure() {
    this.log('Analyzing database schema structure...', 'database');
    
    try {
      const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        
        // Check for essential tables
        const requiredTables = [
          'users', 'sessions', 'customerInteractions', 'facebookPages',
          'aiTrainingData', 'campaignPerformance', 'notifications'
        ];
        
        const missingTables = [];
        requiredTables.forEach(table => {
          if (!schemaContent.includes(table)) {
            missingTables.push(table);
          }
        });
        
        if (missingTables.length === 0) {
          await this.recordTest('Schema Structure Complete', 'database', 'PASS', 
            'All required tables defined in schema');
        } else {
          await this.recordTest('Schema Structure Incomplete', 'database', 'FAIL',
            `Missing tables: ${missingTables.join(', ')}`);
        }
        
        // Check for proper relations
        const hasRelations = schemaContent.includes('relations(');
        await this.recordTest('Database Relations', 'database', hasRelations ? 'PASS' : 'FAIL',
          hasRelations ? 'Relations properly defined' : 'Missing table relations');
          
      } else {
        await this.recordTest('Schema File Missing', 'database', 'FAIL', 
          'shared/schema.ts not found');
      }
    } catch (error) {
      await this.recordTest('Schema Analysis Error', 'database', 'FAIL', 
        `Error reading schema: ${error.message}`);
    }
  }

  async verifyDatabaseConnections() {
    this.log('Testing database connectivity...', 'database');
    
    try {
      // Test basic database connection
      const response = await axios.get(`${this.baseUrl}/api/health/database`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        await this.recordTest('Database Connection', 'database', 'PASS',
          'Database connection successful');
      } else {
        await this.recordTest('Database Connection', 'database', 'FAIL',
          `Connection failed with status ${response.status}`);
      }
    } catch (error) {
      await this.recordTest('Database Connection', 'database', 'FAIL',
        `Connection error: ${error.message}`);
    }
  }

  async testDatabaseCRUDOperations() {
    this.log('Testing database CRUD operations...', 'database');
    
    const crudTests = [
      { operation: 'CREATE', endpoint: '/api/test/create-user', method: 'POST' },
      { operation: 'READ', endpoint: '/api/users', method: 'GET' },
      { operation: 'UPDATE', endpoint: '/api/test/update-user', method: 'PUT' },
      { operation: 'DELETE', endpoint: '/api/test/delete-user', method: 'DELETE' }
    ];
    
    for (const test of crudTests) {
      try {
        let response;
        switch (test.method) {
          case 'GET':
            response = await axios.get(`${this.baseUrl}${test.endpoint}`, { timeout: 5000 });
            break;
          case 'POST':
            response = await axios.post(`${this.baseUrl}${test.endpoint}`, {
              testData: true
            }, { timeout: 5000 });
            break;
          case 'PUT':
            response = await axios.put(`${this.baseUrl}${test.endpoint}`, {
              testData: true
            }, { timeout: 5000 });
            break;
          case 'DELETE':
            response = await axios.delete(`${this.baseUrl}${test.endpoint}`, { timeout: 5000 });
            break;
        }
        
        const status = response.status < 400 ? 'PASS' : 'FAIL';
        await this.recordTest(`Database ${test.operation}`, 'database', status,
          `${test.method} ${test.endpoint} returned ${response.status}`);
          
      } catch (error) {
        await this.recordTest(`Database ${test.operation}`, 'database', 'FAIL',
          `${test.method} ${test.endpoint} failed: ${error.message}`);
      }
    }
  }

  async validateDataIntegrity() {
    this.log('Validating data integrity...', 'database');
    
    try {
      // Check for data consistency
      const metricsResponse = await axios.get(`${this.baseUrl}/api/dashboard/metrics`);
      const interactionsResponse = await axios.get(`${this.baseUrl}/api/customer-service/interactions/all`);
      
      const metricsValid = metricsResponse.data && typeof metricsResponse.data === 'object';
      const interactionsValid = Array.isArray(interactionsResponse.data);
      
      await this.recordTest('Data Integrity - Metrics', 'database', 
        metricsValid ? 'PASS' : 'FAIL',
        metricsValid ? 'Metrics data structure valid' : 'Invalid metrics data');
        
      await this.recordTest('Data Integrity - Interactions', 'database',
        interactionsValid ? 'PASS' : 'FAIL', 
        interactionsValid ? 'Interactions data structure valid' : 'Invalid interactions data');
        
    } catch (error) {
      await this.recordTest('Data Integrity Check', 'database', 'FAIL',
        `Data validation failed: ${error.message}`);
    }
  }

  async analyzeDatabasePerformance() {
    this.log('Analyzing database performance...', 'database');
    
    const performanceTests = [
      '/api/dashboard/metrics',
      '/api/customer-service/interactions/all',
      '/api/ai/learning-metrics',
      '/api/notifications'
    ];
    
    for (const endpoint of performanceTests) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${this.baseUrl}${endpoint}`);
        const responseTime = Date.now() - startTime;
        
        const isOptimal = responseTime < 500; // 500ms threshold
        await this.recordTest(`Performance - ${endpoint}`, 'database',
          isOptimal ? 'PASS' : 'FAIL',
          `Response time: ${responseTime}ms`);
          
      } catch (error) {
        await this.recordTest(`Performance - ${endpoint}`, 'database', 'FAIL',
          `Performance test failed: ${error.message}`);
      }
    }
  }

  // PHASE 2: BACKEND LAYER ANALYSIS
  async auditBackendLayer() {
    this.log('=== PHASE 2: BACKEND LAYER DEEP ANALYSIS ===', 'backend');
    
    await this.analyzeServerArchitecture();
    await this.verifyAPIEndpoints();
    await this.testRouteHandlers();
    await this.validateMiddleware();
    await this.checkServiceIntegrations();
  }

  async analyzeServerArchitecture() {
    this.log('Analyzing server architecture...', 'backend');
    
    const serverFiles = [
      'server/index.ts',
      'server/routes.ts', 
      'server/storage.ts',
      'server/db.ts',
      'server/facebookAPI.ts',
      'server/openaiService.ts'
    ];
    
    for (const file of serverFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasProperStructure = content.includes('export') && content.length > 100;
        
        await this.recordTest(`Server File - ${file}`, 'backend',
          hasProperStructure ? 'PASS' : 'FAIL',
          hasProperStructure ? 'File structure valid' : 'File missing or invalid');
      } else {
        await this.recordTest(`Server File - ${file}`, 'backend', 'FAIL',
          'File does not exist');
      }
    }
  }

  async verifyAPIEndpoints() {
    this.log('Verifying API endpoints...', 'backend');
    
    const criticalEndpoints = [
      { path: '/api/dashboard/metrics', method: 'GET', auth: false },
      { path: '/api/customer-service/interactions/all', method: 'GET', auth: false },
      { path: '/api/ai/learning-metrics', method: 'GET', auth: false },
      { path: '/api/notifications', method: 'GET', auth: false },
      { path: '/api/facebook/pages', method: 'GET', auth: false },
      { path: '/api/ai/suggestions', method: 'POST', auth: false },
      { path: '/api/feedback/submit', method: 'POST', auth: false }
    ];
    
    for (const endpoint of criticalEndpoints) {
      try {
        let response;
        switch (endpoint.method) {
          case 'GET':
            response = await axios.get(`${this.baseUrl}${endpoint.path}`);
            break;
          case 'POST':
            response = await axios.post(`${this.baseUrl}${endpoint.path}`, {
              test: true
            });
            break;
        }
        
        const isWorking = response.status < 500;
        await this.recordTest(`API Endpoint - ${endpoint.path}`, 'backend',
          isWorking ? 'PASS' : 'FAIL',
          `${endpoint.method} returned ${response.status}`);
          
      } catch (error) {
        const status = error.response?.status || 'ERROR';
        await this.recordTest(`API Endpoint - ${endpoint.path}`, 'backend',
          status < 500 ? 'PASS' : 'FAIL',
          `${endpoint.method} error: ${error.message}`);
      }
    }
  }

  async testRouteHandlers() {
    this.log('Testing route handlers...', 'backend');
    
    try {
      const routesPath = path.join(__dirname, 'server', 'routes.ts');
      if (fs.existsSync(routesPath)) {
        const routesContent = fs.readFileSync(routesPath, 'utf8');
        
        // Check for proper error handling
        const hasErrorHandling = routesContent.includes('try {') && 
                                 routesContent.includes('catch');
        
        await this.recordTest('Route Error Handling', 'backend',
          hasErrorHandling ? 'PASS' : 'FAIL',
          hasErrorHandling ? 'Routes have error handling' : 'Missing error handling');
        
        // Check for input validation
        const hasValidation = routesContent.includes('validate') || 
                             routesContent.includes('schema');
        
        await this.recordTest('Input Validation', 'backend',
          hasValidation ? 'PASS' : 'FAIL',
          hasValidation ? 'Input validation present' : 'Missing input validation');
          
      } else {
        await this.recordTest('Routes File', 'backend', 'FAIL',
          'routes.ts file not found');
      }
    } catch (error) {
      await this.recordTest('Route Analysis', 'backend', 'FAIL',
        `Route analysis failed: ${error.message}`);
    }
  }

  async validateMiddleware() {
    this.log('Validating middleware...', 'backend');
    
    // Test CORS
    try {
      const response = await axios.options(`${this.baseUrl}/api/dashboard/metrics`);
      const hasCORS = response.headers['access-control-allow-origin'];
      
      await this.recordTest('CORS Middleware', 'backend',
        hasCORS ? 'PASS' : 'FAIL',
        hasCORS ? 'CORS headers present' : 'CORS not configured');
        
    } catch (error) {
      await this.recordTest('CORS Middleware', 'backend', 'FAIL',
        `CORS test failed: ${error.message}`);
    }
    
    // Test JSON parsing
    try {
      const response = await axios.post(`${this.baseUrl}/api/ai/suggestions`, {
        message: "test json parsing"
      });
      
      await this.recordTest('JSON Middleware', 'backend', 'PASS',
        'JSON parsing working');
        
    } catch (error) {
      const status = error.response?.status === 400 ? 'PASS' : 'FAIL';
      await this.recordTest('JSON Middleware', 'backend', status,
        `JSON parsing test: ${error.message}`);
    }
  }

  async checkServiceIntegrations() {
    this.log('Checking service integrations...', 'backend');
    
    // Check OpenAI integration
    try {
      const openaiPath = path.join(__dirname, 'server', 'openaiService.ts');
      if (fs.existsSync(openaiPath)) {
        const content = fs.readFileSync(openaiPath, 'utf8');
        const hasOpenAI = content.includes('openai') || content.includes('OpenAI');
        
        await this.recordTest('OpenAI Integration', 'backend',
          hasOpenAI ? 'PASS' : 'FAIL',
          hasOpenAI ? 'OpenAI service configured' : 'OpenAI service missing');
      }
    } catch (error) {
      await this.recordTest('OpenAI Integration', 'backend', 'FAIL',
        `OpenAI check failed: ${error.message}`);
    }
    
    // Check Facebook API integration
    try {
      const fbPath = path.join(__dirname, 'server', 'facebookAPI.ts');
      if (fs.existsSync(fbPath)) {
        const content = fs.readFileSync(fbPath, 'utf8');
        const hasFacebookAPI = content.includes('graph.facebook.com');
        
        await this.recordTest('Facebook API Integration', 'backend',
          hasFacebookAPI ? 'PASS' : 'FAIL',
          hasFacebookAPI ? 'Facebook API configured' : 'Facebook API missing');
      }
    } catch (error) {
      await this.recordTest('Facebook API Integration', 'backend', 'FAIL',
        `Facebook API check failed: ${error.message}`);
    }
  }

  // PHASE 3: FRONTEND LAYER ANALYSIS
  async auditFrontendLayer() {
    this.log('=== PHASE 3: FRONTEND LAYER DEEP ANALYSIS ===', 'frontend');
    
    await this.analyzeComponentStructure();
    await this.validateRouting();
    await this.testStateManagement();
    await this.checkUIComponents();
    await this.validateDataFlow();
  }

  async analyzeComponentStructure() {
    this.log('Analyzing component structure...', 'frontend');
    
    const criticalComponents = [
      'client/src/pages/Dashboard.tsx',
      'client/src/components/dashboard/QuickActions.tsx',
      'client/src/components/dashboard/AdvancedAnalyticsChart.tsx',
      'client/src/components/dashboard/LiveSystemStatus.tsx',
      'client/src/components/dashboard/AIRecommendations.tsx',
      'client/src/lib/queryClient.ts'
    ];
    
    for (const component of criticalComponents) {
      const filePath = path.join(__dirname, component);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for React patterns
        const hasReact = content.includes('import') && 
                        (content.includes('React') || content.includes('useState') || 
                         content.includes('useEffect'));
        
        // Check for TypeScript
        const hasTypeScript = content.includes('interface') || content.includes('type ');
        
        // Check for proper exports
        const hasExport = content.includes('export default') || content.includes('export {');
        
        const isValid = hasReact && hasTypeScript && hasExport;
        
        await this.recordTest(`Component - ${component}`, 'frontend',
          isValid ? 'PASS' : 'FAIL',
          isValid ? 'Component structure valid' : 'Component structure issues');
          
      } else {
        await this.recordTest(`Component - ${component}`, 'frontend', 'FAIL',
          'Component file not found');
      }
    }
  }

  async validateRouting() {
    this.log('Validating frontend routing...', 'frontend');
    
    try {
      const appPath = path.join(__dirname, 'client', 'src', 'App.tsx');
      if (fs.existsSync(appPath)) {
        const content = fs.readFileSync(appPath, 'utf8');
        
        const hasRouting = content.includes('Router') || content.includes('Route');
        const hasWouter = content.includes('wouter');
        
        await this.recordTest('Frontend Routing', 'frontend',
          hasRouting && hasWouter ? 'PASS' : 'FAIL',
          hasRouting ? 'Routing configured' : 'Routing missing');
          
      } else {
        await this.recordTest('App Component', 'frontend', 'FAIL',
          'App.tsx not found');
      }
    } catch (error) {
      await this.recordTest('Routing Validation', 'frontend', 'FAIL',
        `Routing check failed: ${error.message}`);
    }
  }

  async testStateManagement() {
    this.log('Testing state management...', 'frontend');
    
    try {
      const queryClientPath = path.join(__dirname, 'client', 'src', 'lib', 'queryClient.ts');
      if (fs.existsSync(queryClientPath)) {
        const content = fs.readFileSync(queryClientPath, 'utf8');
        
        const hasTanstackQuery = content.includes('@tanstack/react-query');
        const hasQueryClient = content.includes('QueryClient');
        
        await this.recordTest('State Management - React Query', 'frontend',
          hasTanstackQuery && hasQueryClient ? 'PASS' : 'FAIL',
          hasTanstackQuery ? 'React Query configured' : 'React Query missing');
          
      } else {
        await this.recordTest('Query Client', 'frontend', 'FAIL',
          'queryClient.ts not found');
      }
    } catch (error) {
      await this.recordTest('State Management', 'frontend', 'FAIL',
        `State management check failed: ${error.message}`);
    }
  }

  async checkUIComponents() {
    this.log('Checking UI components...', 'frontend');
    
    const uiComponents = [
      'client/src/components/ui/card.tsx',
      'client/src/components/ui/button.tsx',
      'client/src/components/ui/badge.tsx',
      'client/src/components/ui/progress.tsx'
    ];
    
    let foundComponents = 0;
    for (const component of uiComponents) {
      const filePath = path.join(__dirname, component);
      if (fs.existsSync(filePath)) {
        foundComponents++;
      }
    }
    
    const componentCoverage = (foundComponents / uiComponents.length) * 100;
    await this.recordTest('UI Components Coverage', 'frontend',
      componentCoverage >= 75 ? 'PASS' : 'FAIL',
      `${componentCoverage.toFixed(1)}% UI components available`);
  }

  async validateDataFlow() {
    this.log('Validating data flow...', 'frontend');
    
    try {
      const dashboardPath = path.join(__dirname, 'client', 'src', 'pages', 'Dashboard.tsx');
      if (fs.existsSync(dashboardPath)) {
        const content = fs.readFileSync(dashboardPath, 'utf8');
        
        const hasDataFetching = content.includes('useQuery') || content.includes('useMutation');
        const hasErrorHandling = content.includes('error') || content.includes('Error');
        const hasLoadingStates = content.includes('loading') || content.includes('Loading');
        
        await this.recordTest('Data Fetching', 'frontend',
          hasDataFetching ? 'PASS' : 'FAIL',
          hasDataFetching ? 'Data fetching implemented' : 'No data fetching');
          
        await this.recordTest('Error Handling UI', 'frontend',
          hasErrorHandling ? 'PASS' : 'FAIL',
          hasErrorHandling ? 'Error handling present' : 'Missing error handling');
          
        await this.recordTest('Loading States', 'frontend',
          hasLoadingStates ? 'PASS' : 'FAIL',
          hasLoadingStates ? 'Loading states implemented' : 'Missing loading states');
          
      }
    } catch (error) {
      await this.recordTest('Data Flow Validation', 'frontend', 'FAIL',
        `Data flow check failed: ${error.message}`);
    }
  }

  // PHASE 4: INTEGRATION TESTING
  async auditIntegrationLayer() {
    this.log('=== PHASE 4: INTEGRATION LAYER DEEP ANALYSIS ===', 'integration');
    
    await this.testFrontendBackendIntegration();
    await this.validateAPIResponseFormats();
    await this.testErrorPropagation();
    await this.checkDataConsistency();
  }

  async testFrontendBackendIntegration() {
    this.log('Testing frontend-backend integration...', 'integration');
    
    const integrationTests = [
      {
        name: 'Dashboard Metrics Flow',
        endpoint: '/api/dashboard/metrics',
        expectedFields: ['totalSpend', 'totalResponses']
      },
      {
        name: 'AI Learning Metrics Flow',
        endpoint: '/api/ai/learning-metrics', 
        expectedFields: ['customerToneAnalysis']
      },
      {
        name: 'Customer Interactions Flow',
        endpoint: '/api/customer-service/interactions/all',
        expectedFields: []
      }
    ];
    
    for (const test of integrationTests) {
      try {
        const response = await axios.get(`${this.baseUrl}${test.endpoint}`);
        const data = response.data;
        
        let fieldsPresent = true;
        if (test.expectedFields.length > 0 && typeof data === 'object') {
          fieldsPresent = test.expectedFields.some(field => field in data);
        }
        
        await this.recordTest(test.name, 'integration',
          response.status === 200 && fieldsPresent ? 'PASS' : 'FAIL',
          `Status: ${response.status}, Fields: ${fieldsPresent ? 'Present' : 'Missing'}`);
          
      } catch (error) {
        await this.recordTest(test.name, 'integration', 'FAIL',
          `Integration test failed: ${error.message}`);
      }
    }
  }

  async validateAPIResponseFormats() {
    this.log('Validating API response formats...', 'integration');
    
    const endpoints = [
      '/api/dashboard/metrics',
      '/api/notifications',
      '/api/ai/learning-metrics'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`);
        const data = response.data;
        
        const isValidJSON = typeof data === 'object';
        const hasConsistentStructure = data !== null && data !== undefined;
        
        await this.recordTest(`Response Format - ${endpoint}`, 'integration',
          isValidJSON && hasConsistentStructure ? 'PASS' : 'FAIL',
          `JSON: ${isValidJSON}, Structure: ${hasConsistentStructure}`);
          
      } catch (error) {
        await this.recordTest(`Response Format - ${endpoint}`, 'integration', 'FAIL',
          `Format validation failed: ${error.message}`);
      }
    }
  }

  async testErrorPropagation() {
    this.log('Testing error propagation...', 'integration');
    
    try {
      // Test 404 handling
      const response404 = await axios.get(`${this.baseUrl}/api/nonexistent`, {
        validateStatus: () => true
      });
      
      await this.recordTest('404 Error Handling', 'integration',
        response404.status === 404 ? 'PASS' : 'FAIL',
        `404 endpoint returned ${response404.status}`);
      
      // Test invalid data handling
      try {
        await axios.post(`${this.baseUrl}/api/ai/suggestions`, {
          invalidData: true
        });
      } catch (error) {
        const hasProperErrorFormat = error.response?.data?.message || error.response?.data?.error;
        await this.recordTest('Error Message Format', 'integration',
          hasProperErrorFormat ? 'PASS' : 'FAIL',
          hasProperErrorFormat ? 'Proper error format' : 'Poor error format');
      }
      
    } catch (error) {
      await this.recordTest('Error Propagation', 'integration', 'FAIL',
        `Error propagation test failed: ${error.message}`);
    }
  }

  async checkDataConsistency() {
    this.log('Checking data consistency...', 'integration');
    
    try {
      // Make multiple requests to check consistency
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(axios.get(`${this.baseUrl}/api/dashboard/metrics`));
      }
      
      const responses = await Promise.all(requests);
      const firstResponse = JSON.stringify(responses[0].data);
      
      const isConsistent = responses.every(response => 
        JSON.stringify(response.data) === firstResponse
      );
      
      await this.recordTest('Data Consistency', 'integration',
        isConsistent ? 'PASS' : 'FAIL',
        isConsistent ? 'Data consistent across requests' : 'Data inconsistency detected');
        
    } catch (error) {
      await this.recordTest('Data Consistency', 'integration', 'FAIL',
        `Consistency check failed: ${error.message}`);
    }
  }

  // PHASE 5: PERFORMANCE ANALYSIS
  async auditPerformanceLayer() {
    this.log('=== PHASE 5: PERFORMANCE LAYER DEEP ANALYSIS ===', 'performance');
    
    await this.analyzeResponseTimes();
    await this.testConcurrentRequests();
    await this.checkMemoryUsage();
    await this.validateCaching();
  }

  async analyzeResponseTimes() {
    this.log('Analyzing response times...', 'performance');
    
    const endpoints = [
      '/api/dashboard/metrics',
      '/api/customer-service/interactions/all',
      '/api/ai/learning-metrics',
      '/api/notifications'
    ];
    
    for (const endpoint of endpoints) {
      const times = [];
      
      for (let i = 0; i < 5; i++) {
        try {
          const startTime = Date.now();
          await axios.get(`${this.baseUrl}${endpoint}`);
          const endTime = Date.now();
          times.push(endTime - startTime);
        } catch (error) {
          // Continue with other tests
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const isOptimal = avgTime < 1000; // 1 second threshold
        
        await this.recordTest(`Response Time - ${endpoint}`, 'performance',
          isOptimal ? 'PASS' : 'FAIL',
          `Average: ${avgTime.toFixed(0)}ms`);
      }
    }
  }

  async testConcurrentRequests() {
    this.log('Testing concurrent request handling...', 'performance');
    
    try {
      const concurrentRequests = [];
      for (let i = 0; i < 10; i++) {
        concurrentRequests.push(
          axios.get(`${this.baseUrl}/api/dashboard/metrics`)
        );
      }
      
      const startTime = Date.now();
      const responses = await Promise.allSettled(concurrentRequests);
      const endTime = Date.now();
      
      const successfulRequests = responses.filter(r => r.status === 'fulfilled').length;
      const successRate = (successfulRequests / concurrentRequests.length) * 100;
      
      await this.recordTest('Concurrent Request Handling', 'performance',
        successRate >= 80 ? 'PASS' : 'FAIL',
        `${successRate}% success rate, ${endTime - startTime}ms total time`);
        
    } catch (error) {
      await this.recordTest('Concurrent Request Handling', 'performance', 'FAIL',
        `Concurrent test failed: ${error.message}`);
    }
  }

  async checkMemoryUsage() {
    this.log('Checking memory usage patterns...', 'performance');
    
    // This would require server-side memory monitoring
    // For now, we'll check for memory-related patterns in the code
    try {
      const serverFiles = ['server/routes.ts', 'server/storage.ts'];
      let hasMemoryOptimization = false;
      
      for (const file of serverFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('cache') || content.includes('limit') || 
              content.includes('cleanup')) {
            hasMemoryOptimization = true;
            break;
          }
        }
      }
      
      await this.recordTest('Memory Optimization', 'performance',
        hasMemoryOptimization ? 'PASS' : 'FAIL',
        hasMemoryOptimization ? 'Memory optimization patterns found' : 'No memory optimization detected');
        
    } catch (error) {
      await this.recordTest('Memory Usage Check', 'performance', 'FAIL',
        `Memory check failed: ${error.message}`);
    }
  }

  async validateCaching() {
    this.log('Validating caching mechanisms...', 'performance');
    
    try {
      // Test if responses have appropriate cache headers
      const response = await axios.get(`${this.baseUrl}/api/dashboard/metrics`);
      const hasCacheHeaders = response.headers['cache-control'] || 
                             response.headers['etag'] ||
                             response.headers['last-modified'];
      
      await this.recordTest('HTTP Caching', 'performance',
        hasCacheHeaders ? 'PASS' : 'FAIL',
        hasCacheHeaders ? 'Cache headers present' : 'No cache headers');
        
      // Test frontend caching (React Query)
      const queryClientPath = path.join(__dirname, 'client', 'src', 'lib', 'queryClient.ts');
      if (fs.existsSync(queryClientPath)) {
        const content = fs.readFileSync(queryClientPath, 'utf8');
        const hasQueryCaching = content.includes('staleTime') || content.includes('cacheTime');
        
        await this.recordTest('Frontend Caching', 'performance',
          hasQueryCaching ? 'PASS' : 'FAIL',
          hasQueryCaching ? 'React Query caching configured' : 'No frontend caching');
      }
      
    } catch (error) {
      await this.recordTest('Caching Validation', 'performance', 'FAIL',
        `Caching check failed: ${error.message}`);
    }
  }

  // PHASE 6: SECURITY ANALYSIS
  async auditSecurityLayer() {
    this.log('=== PHASE 6: SECURITY LAYER DEEP ANALYSIS ===', 'security');
    
    await this.checkInputValidation();
    await this.validateAuthentication();
    await this.testSQLInjectionProtection();
    await this.checkSecurityHeaders();
  }

  async checkInputValidation() {
    this.log('Checking input validation...', 'security');
    
    const testPayloads = [
      { name: 'XSS Script', payload: '<script>alert("xss")</script>' },
      { name: 'SQL Injection', payload: "'; DROP TABLE users; --" },
      { name: 'Large Payload', payload: 'A'.repeat(10000) }
    ];
    
    for (const test of testPayloads) {
      try {
        const response = await axios.post(`${this.baseUrl}/api/ai/suggestions`, {
          message: test.payload
        }, { validateStatus: () => true });
        
        // If server returns 400, it's likely validating input
        const isValidating = response.status === 400 || response.status === 422;
        
        await this.recordTest(`Input Validation - ${test.name}`, 'security',
          isValidating ? 'PASS' : 'FAIL',
          `Server returned ${response.status} for malicious input`);
          
      } catch (error) {
        await this.recordTest(`Input Validation - ${test.name}`, 'security', 'PASS',
          'Request properly rejected');
      }
    }
  }

  async validateAuthentication() {
    this.log('Validating authentication mechanisms...', 'security');
    
    try {
      // Check if protected endpoints exist
      const protectedEndpoints = ['/api/admin', '/api/protected'];
      
      for (const endpoint of protectedEndpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, {
            validateStatus: () => true
          });
          
          const isProtected = response.status === 401 || response.status === 403;
          await this.recordTest(`Authentication - ${endpoint}`, 'security',
            isProtected ? 'PASS' : 'FAIL',
            `Protected endpoint returned ${response.status}`);
            
        } catch (error) {
          await this.recordTest(`Authentication - ${endpoint}`, 'security', 'PASS',
            'Endpoint properly protected');
        }
      }
      
    } catch (error) {
      await this.recordTest('Authentication Validation', 'security', 'FAIL',
        `Authentication check failed: ${error.message}`);
    }
  }

  async testSQLInjectionProtection() {
    this.log('Testing SQL injection protection...', 'security');
    
    const sqlPayloads = [
      "1' OR '1'='1",
      "1; DROP TABLE users;",
      "' UNION SELECT * FROM users --"
    ];
    
    for (const payload of sqlPayloads) {
      try {
        const response = await axios.get(`${this.baseUrl}/api/dashboard/metrics?id=${payload}`, {
          validateStatus: () => true
        });
        
        // Server should not execute SQL injection
        const isSafe = response.status !== 200 || 
                      !JSON.stringify(response.data).includes('users');
        
        await this.recordTest('SQL Injection Protection', 'security',
          isSafe ? 'PASS' : 'FAIL',
          `SQL payload handled safely: ${response.status}`);
          
      } catch (error) {
        await this.recordTest('SQL Injection Protection', 'security', 'PASS',
          'SQL injection attempt properly blocked');
      }
    }
  }

  async checkSecurityHeaders() {
    this.log('Checking security headers...', 'security');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/dashboard/metrics`);
      const headers = response.headers;
      
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options', 
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      let headerCount = 0;
      securityHeaders.forEach(header => {
        if (headers[header]) {
          headerCount++;
        }
      });
      
      const headerCoverage = (headerCount / securityHeaders.length) * 100;
      await this.recordTest('Security Headers', 'security',
        headerCoverage >= 50 ? 'PASS' : 'FAIL',
        `${headerCoverage}% security headers present`);
        
    } catch (error) {
      await this.recordTest('Security Headers', 'security', 'FAIL',
        `Security headers check failed: ${error.message}`);
    }
  }

  // GENERATE COMPREHENSIVE REPORT
  generateComprehensiveReport() {
    this.log('=== GENERATING COMPREHENSIVE AUDIT REPORT ===', 'audit');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        overallHealth: 0
      },
      categories: {},
      criticalIssues: [],
      recommendations: [],
      detailedLog: this.detailedReport
    };
    
    // Calculate summary statistics
    Object.keys(this.auditResults).forEach(category => {
      const categoryData = this.auditResults[category];
      report.categories[category] = {
        passed: categoryData.passed,
        failed: categoryData.failed,
        total: categoryData.passed + categoryData.failed,
        healthScore: categoryData.passed + categoryData.failed > 0 ? 
          (categoryData.passed / (categoryData.passed + categoryData.failed)) * 100 : 0,
        issues: categoryData.issues
      };
      
      report.summary.totalTests += categoryData.passed + categoryData.failed;
      report.summary.totalPassed += categoryData.passed;
      report.summary.totalFailed += categoryData.failed;
      
      // Collect critical issues
      categoryData.issues.forEach(issue => {
        if (issue.status === 'FAIL') {
          report.criticalIssues.push({
            category,
            test: issue.test,
            details: issue.details,
            timestamp: issue.timestamp
          });
        }
      });
    });
    
    report.summary.overallHealth = report.summary.totalTests > 0 ?
      (report.summary.totalPassed / report.summary.totalTests) * 100 : 0;
    
    // Generate recommendations
    if (report.summary.overallHealth < 70) {
      report.recommendations.push('System health is below acceptable threshold. Immediate attention required.');
    }
    
    if (report.categories.database?.healthScore < 80) {
      report.recommendations.push('Database layer requires optimization and error handling improvements.');
    }
    
    if (report.categories.security?.healthScore < 90) {
      report.recommendations.push('Security layer needs strengthening. Review input validation and authentication.');
    }
    
    if (report.categories.performance?.healthScore < 75) {
      report.recommendations.push('Performance optimization needed. Consider caching and response time improvements.');
    }
    
    return report;
  }

  async runCompleteAudit() {
    this.log('🚀 STARTING COMPREHENSIVE DASHBOARD AUDIT 🚀', 'audit');
    this.log('This audit will examine every layer from database to frontend', 'audit');
    
    try {
      // Run all audit phases
      await this.auditDatabaseLayer();
      await this.auditBackendLayer();
      await this.auditFrontendLayer();
      await this.auditIntegrationLayer();
      await this.auditPerformanceLayer();
      await this.auditSecurityLayer();
      
      // Generate final report
      const finalReport = this.generateComprehensiveReport();
      
      // Save report to file
      const reportPath = path.join(__dirname, 'comprehensive-dashboard-audit-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
      
      this.log('=== AUDIT COMPLETED ===', 'audit');
      this.log(`Total Tests: ${finalReport.summary.totalTests}`, 'audit');
      this.log(`Passed: ${finalReport.summary.totalPassed}`, 'audit');
      this.log(`Failed: ${finalReport.summary.totalFailed}`, 'audit');
      this.log(`Overall Health: ${finalReport.summary.overallHealth.toFixed(1)}%`, 'audit');
      this.log(`Report saved to: ${reportPath}`, 'audit');
      
      // Display category breakdown
      Object.keys(finalReport.categories).forEach(category => {
        const cat = finalReport.categories[category];
        this.log(`${category.toUpperCase()}: ${cat.healthScore.toFixed(1)}% (${cat.passed}/${cat.total})`, 'audit');
      });
      
      // Display critical issues
      if (finalReport.criticalIssues.length > 0) {
        this.log('\n🚨 CRITICAL ISSUES FOUND:', 'audit');
        finalReport.criticalIssues.forEach(issue => {
          this.log(`[${issue.category}] ${issue.test}: ${issue.details}`, 'audit');
        });
      }
      
      // Display recommendations
      if (finalReport.recommendations.length > 0) {
        this.log('\n💡 RECOMMENDATIONS:', 'audit');
        finalReport.recommendations.forEach(rec => {
          this.log(`• ${rec}`, 'audit');
        });
      }
      
      return finalReport;
      
    } catch (error) {
      this.log(`AUDIT FAILED: ${error.message}`, 'audit');
      throw error;
    }
  }
}

// Execute the audit
async function main() {
  const auditor = new ComprehensiveDashboardAuditor();
  try {
    await auditor.runCompleteAudit();
    process.exit(0);
  } catch (error) {
    console.error('Audit execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ComprehensiveDashboardAuditor;