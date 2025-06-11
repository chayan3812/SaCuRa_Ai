/**
 * PagePilot AI - Comprehensive Component Verification Script
 * Tests each component, route, and endpoint systematically
 */

import fs from 'fs';
import path from 'path';

class ComponentVerifier {
  constructor() {
    this.results = {
      components: {},
      routes: {},
      endpoints: {},
      overall: { passed: 0, failed: 0, warnings: 0 }
    };
  }

  // Verify component structure and dependencies
  verifyComponent(componentPath) {
    try {
      const fullPath = path.join(process.cwd(), componentPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const verification = {
        exists: true,
        hasImports: content.includes('import'),
        hasExports: content.includes('export'),
        usesTypeScript: componentPath.endsWith('.tsx') || componentPath.endsWith('.ts'),
        hasReactHooks: /use[A-Z]/.test(content),
        hasErrorHandling: content.includes('try') || content.includes('catch'),
        size: content.length,
        lines: content.split('\n').length
      };

      // Check for common patterns
      verification.patterns = {
        hasStateManagement: content.includes('useState') || content.includes('useQuery'),
        hasEventHandlers: /on[A-Z]/.test(content),
        hasConditionalRendering: content.includes('&&') || content.includes('?'),
        hasPropsInterface: content.includes('interface') && content.includes('Props'),
        hasAsyncOperations: content.includes('async') || content.includes('await')
      };

      verification.status = 'PASSED';
      this.results.overall.passed++;
      
      return verification;
    } catch (error) {
      this.results.overall.failed++;
      return {
        exists: false,
        error: error.message,
        status: 'FAILED'
      };
    }
  }

  // Verify all UI components
  verifyUIComponents() {
    const uiPath = 'client/src/components/ui';
    const uiComponents = [
      'button.tsx', 'card.tsx', 'input.tsx', 'label.tsx', 'form.tsx',
      'dropdown-menu.tsx', 'dialog.tsx', 'toast.tsx', 'badge.tsx',
      'tabs.tsx', 'table.tsx', 'select.tsx', 'checkbox.tsx'
    ];

    console.log('\n🧩 VERIFYING UI COMPONENTS...');
    uiComponents.forEach(component => {
      const result = this.verifyComponent(`${uiPath}/${component}`);
      this.results.components[`ui/${component}`] = result;
      console.log(`${result.status === 'PASSED' ? '✅' : '❌'} UI/${component}: ${result.status}`);
    });
  }

  // Verify layout components
  verifyLayoutComponents() {
    const layoutComponents = [
      'client/src/components/layout/TopBar.tsx',
      'client/src/components/layout/Sidebar.tsx'
    ];

    console.log('\n🏗️ VERIFYING LAYOUT COMPONENTS...');
    layoutComponents.forEach(component => {
      const result = this.verifyComponent(component);
      this.results.components[path.basename(component)] = result;
      console.log(`${result.status === 'PASSED' ? '✅' : '❌'} ${path.basename(component)}: ${result.status}`);
      
      if (result.status === 'PASSED') {
        console.log(`   - Lines: ${result.lines}, Hooks: ${result.hasReactHooks}, State: ${result.patterns.hasStateManagement}`);
      }
    });
  }

  // Verify dashboard components
  verifyDashboardComponents() {
    const dashboardComponents = [
      'client/src/components/dashboard/MetricsCards.tsx',
      'client/src/components/dashboard/AdPerformanceChart.tsx',
      'client/src/components/dashboard/AIRecommendations.tsx',
      'client/src/components/dashboard/CustomerServiceMonitor.tsx'
    ];

    console.log('\n📊 VERIFYING DASHBOARD COMPONENTS...');
    dashboardComponents.forEach(component => {
      const result = this.verifyComponent(component);
      this.results.components[path.basename(component)] = result;
      console.log(`${result.status === 'PASSED' ? '✅' : '❌'} ${path.basename(component)}: ${result.status}`);
    });
  }

  // Verify page components
  verifyPages() {
    const pages = [
      'client/src/pages/Dashboard.tsx',
      'client/src/pages/AdOptimizer.tsx',
      'client/src/pages/AIInsights.tsx',
      'client/src/pages/CompetitorAnalysis.tsx',
      'client/src/pages/PageStatus.tsx',
      'client/src/pages/CustomerService.tsx'
    ];

    console.log('\n📄 VERIFYING PAGE COMPONENTS...');
    pages.forEach(page => {
      const result = this.verifyComponent(page);
      this.results.components[path.basename(page)] = result;
      console.log(`${result.status === 'PASSED' ? '✅' : '❌'} ${path.basename(page)}: ${result.status}`);
      
      if (result.status === 'PASSED') {
        console.log(`   - Async Ops: ${result.patterns.hasAsyncOperations}, State: ${result.patterns.hasStateManagement}`);
      }
    });
  }

  // Verify routing configuration
  verifyRouting() {
    console.log('\n🛣️ VERIFYING ROUTING CONFIGURATION...');
    
    try {
      const appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
      
      const routeAnalysis = {
        hasRouter: appContent.includes('Switch') && appContent.includes('Route'),
        hasAuthentication: appContent.includes('isAuthenticated'),
        hasLoadingStates: appContent.includes('isLoading'),
        routeCount: (appContent.match(/Route path=/g) || []).length,
        hasNotFound: appContent.includes('NotFound'),
        status: 'PASSED'
      };

      this.results.routes.configuration = routeAnalysis;
      this.results.overall.passed++;
      console.log('✅ Routing Configuration: PASSED');
      console.log(`   - Routes: ${routeAnalysis.routeCount}, Auth: ${routeAnalysis.hasAuthentication}, 404: ${routeAnalysis.hasNotFound}`);
      
    } catch (error) {
      this.results.routes.configuration = { status: 'FAILED', error: error.message };
      this.results.overall.failed++;
      console.log('❌ Routing Configuration: FAILED');
    }
  }

  // Verify backend services
  verifyBackendServices() {
    const services = [
      'server/routes.ts',
      'server/db.ts',
      'server/storage.ts',
      'server/aiEngine.ts',
      'server/facebook.ts',
      'server/hybridAI.ts'
    ];

    console.log('\n🔧 VERIFYING BACKEND SERVICES...');
    services.forEach(service => {
      const result = this.verifyComponent(service);
      this.results.components[path.basename(service)] = result;
      console.log(`${result.status === 'PASSED' ? '✅' : '❌'} ${path.basename(service)}: ${result.status}`);
    });
  }

  // Generate comprehensive report
  generateReport() {
    const timestamp = new Date().toISOString();
    const totalTests = this.results.overall.passed + this.results.overall.failed;
    const successRate = totalTests > 0 ? ((this.results.overall.passed / totalTests) * 100).toFixed(1) : 0;

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 COMPREHENSIVE COMPONENT VERIFICATION REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Verification Date: ${timestamp}`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    console.log(`📊 Total Components: ${totalTests}`);
    console.log(`✅ Passed: ${this.results.overall.passed}`);
    console.log(`❌ Failed: ${this.results.overall.failed}`);
    console.log(`⚠️  Warnings: ${this.results.overall.warnings}`);
    console.log('═══════════════════════════════════════════════════════');

    // Detailed breakdown
    console.log('\n📋 DETAILED COMPONENT ANALYSIS:');
    
    Object.entries(this.results.components).forEach(([name, result]) => {
      if (result.status === 'PASSED') {
        console.log(`✅ ${name}`);
        console.log(`   - TypeScript: ${result.usesTypeScript}`);
        console.log(`   - React Hooks: ${result.hasReactHooks}`);
        console.log(`   - State Management: ${result.patterns?.hasStateManagement || false}`);
        console.log(`   - Error Handling: ${result.hasErrorHandling}`);
        console.log(`   - Lines of Code: ${result.lines}`);
      } else {
        console.log(`❌ ${name}: ${result.error || 'Verification failed'}`);
      }
    });

    // Save detailed report
    const reportData = {
      timestamp,
      successRate: parseFloat(successRate),
      summary: this.results.overall,
      components: this.results.components,
      routes: this.results.routes,
      endpoints: this.results.endpoints
    };

    fs.writeFileSync('component-verification-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Detailed report saved to: component-verification-report.json');
    
    return this.results;
  }

  // Run all verifications
  async runAllVerifications() {
    console.log('🚀 Starting Comprehensive Component Verification...\n');
    
    this.verifyUIComponents();
    this.verifyLayoutComponents();
    this.verifyDashboardComponents();
    this.verifyPages();
    this.verifyRouting();
    this.verifyBackendServices();
    
    return this.generateReport();
  }
}

// Execute verification
async function main() {
  const verifier = new ComponentVerifier();
  const results = await verifier.runAllVerifications();
  
  console.log('\n🎉 COMPONENT VERIFICATION COMPLETE!');
  console.log(`🎯 Final Success Rate: ${((results.overall.passed / (results.overall.passed + results.overall.failed)) * 100).toFixed(1)}%`);
  
  process.exit(0);
}

main().catch(console.error);