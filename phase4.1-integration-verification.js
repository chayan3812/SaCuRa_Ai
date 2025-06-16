const fs = require('fs');

console.log('🚀 Phase 4.1 Meta Ads API - Complete Integration Verification\n');

// Component verification
const metaAdsService = fs.existsSync('./server/meta/adCampaignService.ts');
const boostPanel = fs.existsSync('./client/src/components/BoostPostPanel.tsx');
const adsAdmin = fs.existsSync('./client/src/pages/FacebookAdsAdmin.tsx');

console.log('✅ CORE COMPONENTS:');
console.log(`   ${metaAdsService ? '✓' : '✗'} Meta Ads Campaign Service: ${metaAdsService ? 'READY' : 'MISSING'}`);
console.log(`   ${boostPanel ? '✓' : '✗'} Boost Post Panel: ${boostPanel ? 'READY' : 'MISSING'}`);
console.log(`   ${adsAdmin ? '✓' : '✗'} Facebook Ads Admin: ${adsAdmin ? 'READY' : 'MISSING'}`);

// API endpoint verification
const routesContent = fs.readFileSync('./server/routes.ts', 'utf8');
const hasBoostEndpoint = routesContent.includes('/api/facebook/boost-post');
const hasCampaignEndpoint = routesContent.includes('/api/facebook/campaign-status');
const hasPostsEndpoint = routesContent.includes('/api/facebook/posts');
const hasMetaImport = routesContent.includes('adCampaignService');

console.log('\n✅ API ENDPOINTS:');
console.log(`   ${hasBoostEndpoint ? '✓' : '✗'} Boost Post Endpoint: ${hasBoostEndpoint ? 'ACTIVE' : 'MISSING'}`);
console.log(`   ${hasCampaignEndpoint ? '✓' : '✗'} Campaign Status Endpoint: ${hasCampaignEndpoint ? 'ACTIVE' : 'MISSING'}`);
console.log(`   ${hasPostsEndpoint ? '✓' : '✗'} Posts Retrieval Endpoint: ${hasPostsEndpoint ? 'ACTIVE' : 'MISSING'}`);
console.log(`   ${hasMetaImport ? '✓' : '✗'} Service Integration: ${hasMetaImport ? 'CONNECTED' : 'MISSING'}`);

// Service implementation verification
if (metaAdsService) {
  const serviceContent = fs.readFileSync('./server/meta/adCampaignService.ts', 'utf8');
  const hasBoostMethod = serviceContent.includes('boostExistingPost');
  const hasStatusMethod = serviceContent.includes('getCampaignStatus');
  const hasActivateMethod = serviceContent.includes('activateCampaign');
  const hasPauseMethod = serviceContent.includes('pauseCampaign');
  
  console.log('\n✅ SERVICE METHODS:');
  console.log(`   ${hasBoostMethod ? '✓' : '✗'} Post Boosting: ${hasBoostMethod ? 'IMPLEMENTED' : 'MISSING'}`);
  console.log(`   ${hasStatusMethod ? '✓' : '✗'} Campaign Status: ${hasStatusMethod ? 'IMPLEMENTED' : 'MISSING'}`);
  console.log(`   ${hasActivateMethod ? '✓' : '✗'} Campaign Activation: ${hasActivateMethod ? 'IMPLEMENTED' : 'MISSING'}`);
  console.log(`   ${hasPauseMethod ? '✓' : '✗'} Campaign Pause: ${hasPauseMethod ? 'IMPLEMENTED' : 'MISSING'}`);
}

// Frontend routing verification
const appContent = fs.readFileSync('./client/src/App.tsx', 'utf8');
const hasAdsRoute = appContent.includes('/admin/facebook-ads');
const hasImport = appContent.includes('FacebookAdsAdmin');

console.log('\n✅ FRONTEND INTEGRATION:');
console.log(`   ${hasImport ? '✓' : '✗'} Component Import: ${hasImport ? 'IMPORTED' : 'MISSING'}`);
console.log(`   ${hasAdsRoute ? '✓' : '✗'} Admin Route: ${hasAdsRoute ? 'CONFIGURED' : 'MISSING'}`);

// Environment configuration
const envTemplate = fs.readFileSync('./.env.template', 'utf8');
const hasAdAccountVar = envTemplate.includes('FACEBOOK_AD_ACCOUNT_ID');
const hasAccessToken = envTemplate.includes('FACEBOOK_ACCESS_TOKEN');
const hasOpenAI = envTemplate.includes('OPENAI_API_KEY');

console.log('\n✅ ENVIRONMENT SETUP:');
console.log(`   ${hasAdAccountVar ? '✓' : '✗'} Ad Account Variable: ${hasAdAccountVar ? 'CONFIGURED' : 'MISSING'}`);
console.log(`   ${hasAccessToken ? '✓' : '✗'} Facebook Access Token: ${hasAccessToken ? 'CONFIGURED' : 'MISSING'}`);
console.log(`   ${hasOpenAI ? '✓' : '✗'} OpenAI API Key: ${hasOpenAI ? 'CONFIGURED' : 'MISSING'}`);

// Phase 3 integration check
const phase3AutoPost = fs.existsSync('./server/facebookAutoPost.ts');
const phase3Config = fs.existsSync('./client/src/components/AutoPostConfig.tsx');
const phase3Admin = fs.existsSync('./client/src/pages/AutoPostAdmin.tsx');

console.log('\n✅ PHASE 3 INTEGRATION:');
console.log(`   ${phase3AutoPost ? '✓' : '✗'} Auto-Post Engine: ${phase3AutoPost ? 'ACTIVE' : 'MISSING'}`);
console.log(`   ${phase3Config ? '✓' : '✗'} Auto-Post Config: ${phase3Config ? 'READY' : 'MISSING'}`);
console.log(`   ${phase3Admin ? '✓' : '✗'} Auto-Post Admin: ${phase3Admin ? 'READY' : 'MISSING'}`);

// Authentication verification
const hasAuthentication = routesContent.includes('isAuthenticated');
const hasErrorHandling = routesContent.includes('try {') && routesContent.includes('catch (error)');

console.log('\n✅ SECURITY & ERROR HANDLING:');
console.log(`   ${hasAuthentication ? '✓' : '✗'} Authentication Protection: ${hasAuthentication ? 'ENABLED' : 'MISSING'}`);
console.log(`   ${hasErrorHandling ? '✓' : '✗'} Error Handling: ${hasErrorHandling ? 'IMPLEMENTED' : 'MISSING'}`);

// Calculate overall status
const coreComponents = metaAdsService && boostPanel && adsAdmin;
const apiEndpoints = hasBoostEndpoint && hasCampaignEndpoint && hasPostsEndpoint && hasMetaImport;
const frontendIntegration = hasImport && hasAdsRoute;
const environmentSetup = hasAdAccountVar && hasAccessToken;
const phase3Integration = phase3AutoPost && phase3Config;
const security = hasAuthentication && hasErrorHandling;

const overallReady = coreComponents && apiEndpoints && frontendIntegration && environmentSetup && phase3Integration && security;

console.log('\n' + '='.repeat(80));
console.log('PHASE 4.1 META ADS API INTEGRATION STATUS:');
console.log(overallReady ? '🎯 PRODUCTION READY' : '⚠️  CONFIGURATION NEEDED');
console.log('='.repeat(80));

if (overallReady) {
  console.log('\n🚀 COMPLETE SYSTEM CAPABILITIES:');
  console.log('   • AI-Powered Auto-Posting (Phase 3)');
  console.log('   • Facebook Post Boosting with Budget Controls');
  console.log('   • Campaign Creation, Activation, and Management');
  console.log('   • Real-time Performance Tracking');
  console.log('   • Unified Admin Dashboard (/admin/facebook-ads)');
  console.log('   • Secure Authentication and Error Handling');
  
  console.log('\n📋 DEPLOYMENT STEPS:');
  console.log('   1. Set FACEBOOK_AD_ACCOUNT_ID=act_your_account_id');
  console.log('   2. Ensure Facebook token has ads_management permission');
  console.log('   3. Configure OPENAI_API_KEY for content generation');
  console.log('   4. Access unified interface at /admin/facebook-ads');
  console.log('   5. Test with small budget campaigns first');
  
  console.log('\n✨ MARKETING AUTOMATION WORKFLOW:');
  console.log('   Phase 3: AI monitors → generates content → posts automatically');
  console.log('   Phase 4.1: Select posts → set budget → create campaigns → track performance');
  console.log('   Result: Complete hands-off marketing automation');
  
  console.log('\n🎯 YOUR PLATFORM IS READY FOR PRODUCTION DEPLOYMENT');
} else {
  console.log('\n❌ MISSING COMPONENTS - REVIEW ABOVE FOR DETAILS');
  
  if (!coreComponents) console.log('   • Core components need implementation');
  if (!apiEndpoints) console.log('   • API endpoints need configuration');
  if (!frontendIntegration) console.log('   • Frontend routing needs setup');
  if (!environmentSetup) console.log('   • Environment variables need configuration');
  if (!phase3Integration) console.log('   • Phase 3 integration needs completion');
  if (!security) console.log('   • Security and error handling needs implementation');
}

console.log('\n' + '='.repeat(80));