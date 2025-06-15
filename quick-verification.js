#!/usr/bin/env node

/**
 * PagePilot AI - Quick Production Verification
 * Fast validation of critical codebase components
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 PagePilot AI - Quick Production Verification\n');

const results = {
  passed: 0,
  failed: 0,
  issues: []
};

function test(name, fn) {
  try {
    console.log(`Testing: ${name}`);
    fn();
    results.passed++;
    console.log(`✅ ${name} - PASSED`);
  } catch (error) {
    results.failed++;
    results.issues.push({ name, error: error.message });
    console.log(`❌ ${name} - FAILED: ${error.message}`);
  }
}

// Critical file existence
test('Core Files Exist', () => {
  const criticalFiles = [
    'client/src/App.tsx',
    'client/src/pages/Dashboard.tsx',
    'client/src/pages/Settings.tsx',
    'server/routes.ts',
    'server/facebook.ts',
    'shared/schema.ts'
  ];
  
  criticalFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing critical file: ${file}`);
    }
  });
});

// TypeScript interfaces
test('TypeScript Interfaces', () => {
  const settingsFile = fs.readFileSync('client/src/pages/Settings.tsx', 'utf8');
  if (!settingsFile.includes('UserProfile') || !settingsFile.includes('NotificationSettings')) {
    throw new Error('Settings component missing TypeScript interfaces');
  }
  
  const facebookFile = fs.readFileSync('server/facebook.ts', 'utf8');
  if (!facebookFile.includes('FacebookPageInfo')) {
    throw new Error('Facebook service missing TypeScript interfaces');
  }
});

// Responsive design
test('Responsive Design Implementation', () => {
  const layoutFile = fs.readFileSync('client/src/components/layout/AppLayout.tsx', 'utf8');
  if (!layoutFile.includes('md:p-6') || !layoutFile.includes('flex-1')) {
    throw new Error('AppLayout missing responsive design patterns');
  }
});

// API endpoints structure
test('API Routes Structure', () => {
  const routesFile = fs.readFileSync('server/routes.ts', 'utf8');
  const endpoints = ['/api/auth/user', '/api/dashboard/metrics', '/api/customer-service'];
  
  endpoints.forEach(endpoint => {
    if (!routesFile.includes(endpoint)) {
      throw new Error(`Missing API endpoint: ${endpoint}`);
    }
  });
});

// Database configuration
test('Database Configuration', () => {
  const dbFile = fs.readFileSync('server/db.ts', 'utf8');
  if (!dbFile.includes('DATABASE_URL') || !dbFile.includes('drizzle')) {
    throw new Error('Database configuration incomplete');
  }
});

// Security headers
test('Security Headers', () => {
  const serverFile = fs.readFileSync('server/index.ts', 'utf8');
  const headers = ['X-Content-Type-Options', 'X-Frame-Options'];
  
  headers.forEach(header => {
    if (!serverFile.includes(header)) {
      throw new Error(`Missing security header: ${header}`);
    }
  });
});

// Package.json structure
test('Package Configuration', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.scripts.dev || !packageJson.scripts.build) {
    throw new Error('Missing essential package.json scripts');
  }
});

// Component imports
test('Component Import Structure', () => {
  const appFile = fs.readFileSync('client/src/App.tsx', 'utf8');
  const pages = ['Dashboard', 'Settings', 'AdOptimizer'];
  
  pages.forEach(page => {
    if (!appFile.includes(`import ${page}`)) {
      throw new Error(`Missing page import: ${page}`);
    }
  });
});

// Schema validation
test('Schema Structure', () => {
  const schemaFile = fs.readFileSync('shared/schema.ts', 'utf8');
  if (!schemaFile.includes('users') || !schemaFile.includes('sessions')) {
    throw new Error('Database schema incomplete');
  }
});

// TypeScript settings types
test('Settings Types File', () => {
  if (!fs.existsSync('client/src/types/settings.ts')) {
    throw new Error('Settings types file missing');
  }
  
  const typesFile = fs.readFileSync('client/src/types/settings.ts', 'utf8');
  if (!typesFile.includes('UserProfile') || !typesFile.includes('NotificationSettings')) {
    throw new Error('Settings types incomplete');
  }
});

// Results summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION RESULTS');
console.log('='.repeat(60));
console.log(`Total Tests: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);

if (results.issues.length > 0) {
  console.log('\n❌ Issues Found:');
  results.issues.forEach(issue => {
    console.log(`   • ${issue.name}: ${issue.error}`);
  });
}

const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
console.log(`\nSuccess Rate: ${successRate}%`);

const status = results.failed === 0 ? '✅ PRODUCTION READY' : '⚠️  NEEDS ATTENTION';
console.log(`Status: ${status}`);
console.log('='.repeat(60));

// Write results
fs.writeFileSync('verification-results.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  passed: results.passed,
  failed: results.failed,
  successRate: parseFloat(successRate),
  status: results.failed === 0 ? 'READY' : 'NEEDS_FIXES',
  issues: results.issues
}, null, 2));

process.exit(results.failed > 0 ? 1 : 0);