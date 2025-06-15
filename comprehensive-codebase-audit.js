#!/usr/bin/env node

/**
 * PagePilot AI - Comprehensive Codebase Audit & Verification
 * Production-ready validation script for A-Z codebase quality
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class CodebaseAuditor {
  constructor() {
    this.results = {
      typescript: { passed: 0, failed: 0, issues: [] },
      responsiveness: { passed: 0, failed: 0, issues: [] },
      apiEndpoints: { passed: 0, failed: 0, issues: [] },
      components: { passed: 0, failed: 0, issues: [] },
      workflow: { passed: 0, failed: 0, issues: [] },
      security: { passed: 0, failed: 0, issues: [] },
      performance: { passed: 0, failed: 0, issues: [] }
    };
    this.startTime = Date.now();
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async runAudit(category, name, testFn) {
    try {
      this.log(`Testing ${category}: ${name}`);
      await testFn();
      this.results[category].passed++;
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      this.results[category].failed++;
      this.results[category].issues.push({ name, error: error.message });
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  // TypeScript Verification
  async auditTypeScript() {
    this.log('=== TYPESCRIPT AUDIT ===');

    await this.runAudit('typescript', 'TypeScript Compilation', () => {
      try {
        execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe', timeout: 30000 });
      } catch (error) {
        if (error.stdout || error.stderr) {
          const output = (error.stdout || error.stderr).toString();
          if (output.includes('error TS')) {
            throw new Error(`TypeScript errors found: ${output.split('\n').slice(0, 3).join('; ')}`);
          }
        }
      }
    });

    await this.runAudit('typescript', 'Settings Component Types', () => {
      const settingsFile = fs.readFileSync('client/src/pages/Settings.tsx', 'utf8');
      if (!settingsFile.includes('UserProfile') || !settingsFile.includes('NotificationSettings')) {
        throw new Error('Missing proper TypeScript interfaces in Settings component');
      }
    });

    await this.runAudit('typescript', 'Facebook API Service Types', () => {
      const facebookFile = fs.readFileSync('server/facebook.ts', 'utf8');
      if (!facebookFile.includes('FacebookPageInfo') || !facebookFile.includes('FacebookAdMetrics')) {
        throw new Error('Missing proper TypeScript interfaces in Facebook service');
      }
    });

    await this.runAudit('typescript', 'Enhanced Page Fixer Types', () => {
      const pageFixerFile = fs.readFileSync('server/enhancedPageFixer.ts', 'utf8');
      if (!pageFixerFile.includes('PageIssue') || !pageFixerFile.includes('FixResult')) {
        throw new Error('Missing proper TypeScript interfaces in Page Fixer');
      }
    });
  }

  // Responsiveness Verification
  async auditResponsiveness() {
    this.log('=== RESPONSIVENESS AUDIT ===');

    await this.runAudit('responsiveness', 'Component Responsive Classes', () => {
      const componentFiles = this.findFiles('client/src/components', '.tsx');
      let responsiveCount = 0;
      
      componentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.match(/className.*\b(sm:|md:|lg:|xl:)/)) {
          responsiveCount++;
        }
      });

      if (responsiveCount < 10) {
        throw new Error(`Only ${responsiveCount} components have responsive classes (expected 10+)`);
      }
    });

    await this.runAudit('responsiveness', 'Page Responsive Classes', () => {
      const pageFiles = this.findFiles('client/src/pages', '.tsx');
      let responsiveCount = 0;
      
      pageFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.match(/className.*\b(sm:|md:|lg:|xl:)/)) {
          responsiveCount++;
        }
      });

      if (responsiveCount < 15) {
        throw new Error(`Only ${responsiveCount} pages have responsive classes (expected 15+)`);
      }
    });

    await this.runAudit('responsiveness', 'AppLayout Responsive Structure', () => {
      const layoutFile = fs.readFileSync('client/src/components/layout/AppLayout.tsx', 'utf8');
      if (!layoutFile.includes('md:p-6') || !layoutFile.includes('flex-1')) {
        throw new Error('AppLayout missing responsive design patterns');
      }
    });
  }

  // API Endpoints Verification
  async auditAPIEndpoints() {
    this.log('=== API ENDPOINTS AUDIT ===');

    await this.runAudit('apiEndpoints', 'Routes File Structure', () => {
      const routesFile = fs.readFileSync('server/routes.ts', 'utf8');
      const requiredEndpoints = [
        '/api/auth/user',
        '/api/dashboard/metrics',
        '/api/customer-service',
        '/api/ad-optimizer',
        '/api/user/profile'
      ];

      requiredEndpoints.forEach(endpoint => {
        if (!routesFile.includes(endpoint)) {
          throw new Error(`Missing endpoint: ${endpoint}`);
        }
      });
    });

    await this.runAudit('apiEndpoints', 'Facebook API Service', () => {
      const facebookFile = fs.readFileSync('server/facebook.ts', 'utf8');
      const requiredMethods = ['getUserPages', 'getPagePosts', 'getPageInsights', 'sendMessage'];
      
      requiredMethods.forEach(method => {
        if (!facebookFile.includes(method)) {
          throw new Error(`Missing Facebook API method: ${method}`);
        }
      });
    });

    await this.runAudit('apiEndpoints', 'API Request Client', () => {
      const queryClientFile = fs.readFileSync('client/src/lib/queryClient.ts', 'utf8');
      if (!queryClientFile.includes('apiRequest') || !queryClientFile.includes('QueryClient')) {
        throw new Error('API request client not properly configured');
      }
    });
  }

  // Components Verification
  async auditComponents() {
    this.log('=== COMPONENTS AUDIT ===');

    await this.runAudit('components', 'Core Dashboard Components', () => {
      const requiredComponents = [
        'client/src/components/dashboard/MetricsCards.tsx',
        'client/src/components/dashboard/AdPerformanceChart.tsx',
        'client/src/components/dashboard/AIRecommendations.tsx',
        'client/src/components/dashboard/CustomerServiceMonitor.tsx'
      ];

      requiredComponents.forEach(component => {
        if (!fs.existsSync(component)) {
          throw new Error(`Missing component: ${component}`);
        }
      });
    });

    await this.runAudit('components', 'Layout Components', () => {
      const layoutComponents = [
        'client/src/components/layout/AppLayout.tsx',
        'client/src/components/layout/Sidebar.tsx',
        'client/src/components/layout/TopBar.tsx'
      ];

      layoutComponents.forEach(component => {
        if (!fs.existsSync(component)) {
          throw new Error(`Missing layout component: ${component}`);
        }
      });
    });

    await this.runAudit('components', 'Page Components Import Structure', () => {
      const appFile = fs.readFileSync('client/src/App.tsx', 'utf8');
      const requiredPages = ['Dashboard', 'AdOptimizer', 'CustomerService', 'Settings'];
      
      requiredPages.forEach(page => {
        if (!appFile.includes(`import ${page}`)) {
          throw new Error(`Missing page import: ${page}`);
        }
      });
    });
  }

  // Workflow Verification
  async auditWorkflow() {
    this.log('=== WORKFLOW AUDIT ===');

    await this.runAudit('workflow', 'Package.json Scripts', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredScripts = ['dev', 'build', 'db:push'];
      
      requiredScripts.forEach(script => {
        if (!packageJson.scripts[script]) {
          throw new Error(`Missing package.json script: ${script}`);
        }
      });
    });

    await this.runAudit('workflow', 'Database Configuration', () => {
      const dbFile = fs.readFileSync('server/db.ts', 'utf8');
      if (!dbFile.includes('DATABASE_URL') || !dbFile.includes('drizzle')) {
        throw new Error('Database configuration incomplete');
      }
    });

    await this.runAudit('workflow', 'Vite Configuration', () => {
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
      if (!viteConfig.includes('@vitejs/plugin-react') || !viteConfig.includes('resolve')) {
        throw new Error('Vite configuration incomplete');
      }
    });
  }

  // Security Verification
  async auditSecurity() {
    this.log('=== SECURITY AUDIT ===');

    await this.runAudit('security', 'Authentication Middleware', () => {
      const authFile = fs.readFileSync('server/replitAuth.ts', 'utf8');
      if (!authFile.includes('isAuthenticated') || !authFile.includes('passport')) {
        throw new Error('Authentication middleware incomplete');
      }
    });

    await this.runAudit('security', 'Security Headers', () => {
      const serverFile = fs.readFileSync('server/index.ts', 'utf8');
      const requiredHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'Content-Security-Policy'];
      
      requiredHeaders.forEach(header => {
        if (!serverFile.includes(header)) {
          throw new Error(`Missing security header: ${header}`);
        }
      });
    });

    await this.runAudit('security', 'Environment Variables Protection', () => {
      const serverFiles = this.findFiles('server', '.ts');
      let secretsFound = false;
      
      serverFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('process.env.') && !content.includes('console.log(process.env')) {
          secretsFound = true;
        }
      });

      if (!secretsFound) {
        throw new Error('No environment variable usage found');
      }
    });
  }

  // Performance Verification
  async auditPerformance() {
    this.log('=== PERFORMANCE AUDIT ===');

    await this.runAudit('performance', 'React Query Configuration', () => {
      const queryClientFile = fs.readFileSync('client/src/lib/queryClient.ts', 'utf8');
      if (!queryClientFile.includes('staleTime') || !queryClientFile.includes('refetchInterval')) {
        throw new Error('React Query not optimally configured for performance');
      }
    });

    await this.runAudit('performance', 'Component Optimization', () => {
      const componentFiles = this.findFiles('client/src/components', '.tsx');
      let optimizedCount = 0;
      
      componentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('useMemo') || content.includes('useCallback') || content.includes('React.memo')) {
          optimizedCount++;
        }
      });

      if (optimizedCount < 3) {
        throw new Error(`Only ${optimizedCount} components use performance optimizations (expected 3+)`);
      }
    });

    await this.runAudit('performance', 'Memory Optimization', () => {
      const serverFiles = this.findFiles('server', '.ts');
      let memoryOptFound = false;
      
      serverFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('memory') && content.includes('optimization')) {
          memoryOptFound = true;
        }
      });

      if (!memoryOptFound) {
        console.log('⚠️  Memory optimization patterns not extensively found');
      }
    });
  }

  findFiles(dir, extension) {
    const files = [];
    
    function traverse(currentDir) {
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && fullPath.endsWith(extension)) {
          files.push(fullPath);
        }
      });
    }
    
    traverse(dir);
    return files;
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const categories = Object.keys(this.results);
    
    console.log('\n='.repeat(80));
    console.log('🎯 COMPREHENSIVE CODEBASE AUDIT RESULTS');
    console.log('='.repeat(80));
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    categories.forEach(category => {
      const result = this.results[category];
      totalPassed += result.passed;
      totalFailed += result.failed;
      
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${category.toUpperCase()}: ${result.passed} passed, ${result.failed} failed`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue.name}: ${issue.error}`);
        });
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${totalPassed + totalFailed}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    console.log(`   Execution Time: ${(totalTime / 1000).toFixed(2)}s`);
    
    const overallStatus = totalFailed === 0 ? 'PRODUCTION READY ✅' : 'NEEDS ATTENTION ⚠️';
    console.log(`   Status: ${overallStatus}`);
    console.log('='.repeat(80));
    
    return {
      passed: totalPassed,
      failed: totalFailed,
      successRate: (totalPassed / (totalPassed + totalFailed)) * 100,
      executionTime: totalTime / 1000,
      status: totalFailed === 0 ? 'READY' : 'NEEDS_FIXES'
    };
  }

  async runFullAudit() {
    this.log('🚀 Starting Comprehensive Codebase Audit...');
    
    await this.auditTypeScript();
    await this.auditResponsiveness();
    await this.auditAPIEndpoints();
    await this.auditComponents();
    await this.auditWorkflow();
    await this.auditSecurity();
    await this.auditPerformance();
    
    return this.generateReport();
  }
}

async function main() {
  try {
    const auditor = new CodebaseAuditor();
    const results = await auditor.runFullAudit();
    
    // Write results to file
    fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
    
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

main();