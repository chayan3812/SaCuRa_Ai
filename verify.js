#!/usr/bin/env node

/**
 * SaCuRa AI Platform - Complete Project Verification
 * Comprehensive production readiness validation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectVerifier {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} ${message}`);
    
    if (type === 'pass') this.passed++;
    if (type === 'fail') this.failed++;
    
    this.results.push({ timestamp, type, message });
  }

  checkFile(filePath, description) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          this.log(`${description}: ${filePath}`, 'pass');
          return true;
        } else {
          this.log(`${description}: ${filePath} (empty file)`, 'fail');
          return false;
        }
      } else {
        this.log(`${description}: ${filePath} (missing)`, 'fail');
        return false;
      }
    } catch (error) {
      this.log(`${description}: ${filePath} (error: ${error.message})`, 'fail');
      return false;
    }
  }

  checkDirectory(dirPath, description) {
    try {
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        this.log(`${description}: ${dirPath} (${files.length} files)`, 'pass');
        return true;
      } else {
        this.log(`${description}: ${dirPath} (missing or not directory)`, 'fail');
        return false;
      }
    } catch (error) {
      this.log(`${description}: ${dirPath} (error: ${error.message})`, 'fail');
      return false;
    }
  }

  runCommand(command, description, silent = false) {
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: silent ? 'pipe' : 'inherit',
        timeout: 30000 
      });
      this.log(`${description}`, 'pass');
      return { success: true, output };
    } catch (error) {
      this.log(`${description} (failed: ${error.message})`, 'fail');
      return { success: false, error: error.message };
    }
  }

  checkPackageJson() {
    this.log('\n📦 CHECKING PACKAGE CONFIGURATION', 'info');
    
    if (!this.checkFile('package.json', 'Package.json exists')) return false;
    
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check critical dependencies
      const criticalDeps = [
        'express', 'react', 'vite', 'drizzle-orm', '@tanstack/react-query',
        'wouter', 'zod', 'axios', '@anthropic-ai/sdk', 'openai'
      ];
      
      let depsOk = true;
      criticalDeps.forEach(dep => {
        if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
          this.log(`Dependency ${dep} found`, 'pass');
        } else {
          this.log(`Critical dependency ${dep} missing`, 'fail');
          depsOk = false;
        }
      });
      
      // Check scripts
      const criticalScripts = ['dev', 'build', 'db:push'];
      criticalScripts.forEach(script => {
        if (pkg.scripts?.[script]) {
          this.log(`Script ${script} defined`, 'pass');
        } else {
          this.log(`Critical script ${script} missing`, 'fail');
          depsOk = false;
        }
      });
      
      return depsOk;
    } catch (error) {
      this.log(`Package.json parse error: ${error.message}`, 'fail');
      return false;
    }
  }

  checkCoreFiles() {
    this.log('\n🏗️ CHECKING CORE PROJECT FILES', 'info');
    
    const coreFiles = [
      { path: 'vite.config.ts', desc: 'Vite configuration' },
      { path: 'tsconfig.json', desc: 'TypeScript configuration' },
      { path: 'tailwind.config.ts', desc: 'Tailwind configuration' },
      { path: 'drizzle.config.ts', desc: 'Drizzle configuration' },
      { path: 'components.json', desc: 'shadcn/ui components config' }
    ];
    
    let allPresent = true;
    coreFiles.forEach(file => {
      if (!this.checkFile(file.path, file.desc)) {
        allPresent = false;
      }
    });
    
    return allPresent;
  }

  checkFrontendStructure() {
    this.log('\n🎨 CHECKING FRONTEND STRUCTURE', 'info');
    
    // Check directories
    const frontendDirs = [
      { path: 'client', desc: 'Client directory' },
      { path: 'client/src', desc: 'Client source' },
      { path: 'client/src/components', desc: 'Components directory' },
      { path: 'client/src/pages', desc: 'Pages directory' },
      { path: 'client/src/lib', desc: 'Library directory' }
    ];
    
    let structureOk = true;
    frontendDirs.forEach(dir => {
      if (!this.checkDirectory(dir.path, dir.desc)) {
        structureOk = false;
      }
    });
    
    // Check critical frontend files
    const frontendFiles = [
      { path: 'client/src/App.tsx', desc: 'Main App component' },
      { path: 'client/src/main.tsx', desc: 'React entry point' },
      { path: 'client/index.html', desc: 'HTML template' },
      { path: 'client/src/lib/queryClient.ts', desc: 'React Query client' },
      { path: 'client/src/pages/Dashboard.tsx', desc: 'Dashboard page' },
      { path: 'client/src/components/dashboard/ConnectedAccounts.tsx', desc: 'Connected Accounts component' }
    ];
    
    frontendFiles.forEach(file => {
      if (!this.checkFile(file.path, file.desc)) {
        structureOk = false;
      }
    });
    
    return structureOk;
  }

  checkBackendStructure() {
    this.log('\n⚙️ CHECKING BACKEND STRUCTURE', 'info');
    
    // Check directories
    const backendDirs = [
      { path: 'server', desc: 'Server directory' },
      { path: 'shared', desc: 'Shared types directory' }
    ];
    
    let structureOk = true;
    backendDirs.forEach(dir => {
      if (!this.checkDirectory(dir.path, dir.desc)) {
        structureOk = false;
      }
    });
    
    // Check critical backend files
    const backendFiles = [
      { path: 'server/index.ts', desc: 'Server entry point' },
      { path: 'server/routes.ts', desc: 'API routes' },
      { path: 'server/db.ts', desc: 'Database connection' },
      { path: 'server/storage.ts', desc: 'Storage interface' },
      { path: 'server/vite.ts', desc: 'Vite integration' },
      { path: 'shared/schema.ts', desc: 'Database schema' },
      { path: 'server/facebookTokenManager.ts', desc: 'Facebook token manager' },
      { path: 'server/aiService.ts', desc: 'AI service integration' }
    ];
    
    backendFiles.forEach(file => {
      if (!this.checkFile(file.path, file.desc)) {
        structureOk = false;
      }
    });
    
    return structureOk;
  }

  checkEnvironmentSetup() {
    this.log('\n🔐 CHECKING ENVIRONMENT CONFIGURATION', 'info');
    
    // Check if .env files exist
    const envFiles = ['.env', '.env.local', '.env.example'];
    let hasEnvFile = false;
    
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log(`Environment file ${file} found`, 'pass');
        hasEnvFile = true;
      }
    });
    
    if (!hasEnvFile) {
      this.log('No environment files found', 'warn');
    }
    
    // Check critical environment variables
    const criticalEnvVars = [
      'DATABASE_URL',
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY'
    ];
    
    let envOk = true;
    criticalEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        this.log(`Environment variable ${envVar} is set`, 'pass');
      } else {
        this.log(`Environment variable ${envVar} is missing`, 'warn');
      }
    });
    
    return envOk;
  }

  checkDependencies() {
    this.log('\n📚 CHECKING DEPENDENCIES', 'info');
    
    // Check if node_modules exists
    if (!this.checkDirectory('node_modules', 'Node modules directory')) {
      this.log('Running npm install...', 'info');
      const installResult = this.runCommand('npm install', 'Installing dependencies');
      if (!installResult.success) return false;
    } else {
      this.log('Dependencies already installed', 'pass');
    }
    
    return true;
  }

  checkTypeScript() {
    this.log('\n🔍 CHECKING TYPESCRIPT COMPILATION', 'info');
    
    // Check if TypeScript can compile without errors
    const tscResult = this.runCommand('npx tsc --noEmit', 'TypeScript compilation check', true);
    
    if (tscResult.success) {
      this.log('TypeScript compilation successful', 'pass');
      return true;
    } else {
      this.log('TypeScript compilation has errors', 'warn');
      this.log('TypeScript errors (non-blocking):', 'info');
      console.log(tscResult.error);
      return false;
    }
  }

  checkBuild() {
    this.log('\n🏗️ CHECKING BUILD PROCESS', 'info');
    
    const buildResult = this.runCommand('npm run build', 'Frontend build process', true);
    
    if (buildResult.success) {
      this.log('Build process completed successfully', 'pass');
      
      // Check if build output exists
      if (this.checkDirectory('client/dist', 'Build output directory')) {
        return true;
      }
    } else {
      this.log('Build process failed', 'fail');
      console.log('Build errors:', buildResult.error);
    }
    
    return false;
  }

  checkDatabase() {
    this.log('\n🗄️ CHECKING DATABASE SETUP', 'info');
    
    // Check if database schema push works
    const dbResult = this.runCommand('npm run db:push', 'Database schema push', true);
    
    if (dbResult.success) {
      this.log('Database schema synchronized successfully', 'pass');
      return true;
    } else {
      this.log('Database schema synchronization failed', 'warn');
      this.log('Database may not be properly configured', 'info');
      return false;
    }
  }

  checkLinting() {
    this.log('\n🧹 CHECKING CODE QUALITY', 'info');
    
    // Check ESLint
    const lintResult = this.runCommand('npx eslint server/routes.ts --max-warnings 10', 'ESLint check', true);
    
    if (lintResult.success) {
      this.log('Code quality checks passed', 'pass');
      return true;
    } else {
      this.log('Code quality issues found (non-blocking)', 'warn');
      return false;
    }
  }

  generateReport() {
    this.log('\n📊 VERIFICATION COMPLETE', 'info');
    
    const totalTests = this.passed + this.failed;
    const successRate = totalTests > 0 ? ((this.passed / totalTests) * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log(`📈 VERIFICATION SUMMARY`);
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log('='.repeat(60));
    
    if (successRate >= 90) {
      console.log('🎉 PROJECT STATUS: EXCELLENT - Ready for production!');
    } else if (successRate >= 75) {
      console.log('✅ PROJECT STATUS: GOOD - Minor issues to address');
    } else if (successRate >= 50) {
      console.log('⚠️ PROJECT STATUS: NEEDS WORK - Several issues to fix');
    } else {
      console.log('❌ PROJECT STATUS: CRITICAL - Major issues need attention');
    }
    
    console.log('\n💡 Next Steps:');
    if (this.failed > 0) {
      console.log('• Address failed checks above');
      console.log('• Run verification again after fixes');
    }
    console.log('• Configure Facebook app redirect URI');
    console.log('• Test OAuth flow end-to-end');
    console.log('• Deploy to production when ready');
    
    return successRate;
  }

  async runCompleteVerification() {
    console.log('🚀 SaCuRa AI Platform - Complete Project Verification');
    console.log('=' .repeat(60));
    
    // Run all verification steps
    const steps = [
      () => this.checkPackageJson(),
      () => this.checkCoreFiles(),
      () => this.checkFrontendStructure(),
      () => this.checkBackendStructure(),
      () => this.checkEnvironmentSetup(),
      () => this.checkDependencies(),
      () => this.checkTypeScript(),
      () => this.checkBuild(),
      () => this.checkDatabase(),
      () => this.checkLinting()
    ];
    
    for (const step of steps) {
      try {
        await step();
      } catch (error) {
        this.log(`Verification step failed: ${error.message}`, 'fail');
      }
    }
    
    return this.generateReport();
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new ProjectVerifier();
  verifier.runCompleteVerification()
    .then(successRate => {
      process.exit(successRate >= 75 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

export default ProjectVerifier;