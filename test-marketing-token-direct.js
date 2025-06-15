/**
 * Direct Facebook Marketing API Token Test
 * Tests the Marketing API token directly against Facebook's Graph API
 */

import crypto from 'crypto';

const MARKETING_TOKEN = 'EAA5OFJJFbmcBOzmmAyZBVwwUajJ8iME21pNPNhKaZCeBZCCw77Q0Li4KJ8MNjeqwfys3SXZCkneqAHaX9Kc1R7XgSelFVyoXZCiEwxueuzaPZAmqyWGugDTrPq4rvhFWejsaDybuIThJOrPZAZClt7z2bFoY7ZC5yKO6X1hY2hgTNW7cx9kJ9i0gu2um2EILGy9kG7umt';
const APP_SECRET = '0426b1ae64c6f5951bd8f974e9492ec4';
const APP_ID = '4026499934285415';

function generateAppSecretProof(accessToken) {
  return crypto.createHmac('sha256', APP_SECRET).update(accessToken).digest('hex');
}

async function testMarketingAPIToken() {
  console.log('🔍 Testing Marketing API Token Directly...\n');
  
  try {
    // Test 1: Token validation
    console.log('📘 Test 1: Token Validation');
    const appSecretProof = generateAppSecretProof(MARKETING_TOKEN);
    
    const debugUrl = `https://graph.facebook.com/v18.0/debug_token?input_token=${MARKETING_TOKEN}&access_token=${MARKETING_TOKEN}&appsecret_proof=${appSecretProof}`;
    
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();
    
    if (debugData.error) {
      console.log('❌ Token validation failed:', debugData.error.message);
      return false;
    }
    
    console.log('✅ Token is valid');
    console.log(`   App ID: ${debugData.data.app_id}`);
    console.log(`   User ID: ${debugData.data.user_id || 'N/A'}`);
    console.log(`   Scopes: ${debugData.data.scopes ? debugData.data.scopes.join(', ') : 'None'}`);
    console.log(`   Expires: ${debugData.data.expires_at ? new Date(debugData.data.expires_at * 1000).toISOString() : 'Never'}`);
    console.log('');
    
    // Test 2: User info
    console.log('📘 Test 2: User Information');
    const userUrl = `https://graph.facebook.com/v18.0/me?access_token=${MARKETING_TOKEN}&appsecret_proof=${appSecretProof}`;
    
    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();
    
    if (userData.error) {
      console.log('❌ User info failed:', userData.error.message);
    } else {
      console.log('✅ User info retrieved');
      console.log(`   ID: ${userData.id}`);
      console.log(`   Name: ${userData.name || 'N/A'}`);
      console.log('');
    }
    
    // Test 3: Ad Accounts
    console.log('📘 Test 3: Ad Accounts Access');
    const adAccountsUrl = `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${MARKETING_TOKEN}&appsecret_proof=${appSecretProof}`;
    
    const adAccountsResponse = await fetch(adAccountsUrl);
    const adAccountsData = await adAccountsResponse.json();
    
    if (adAccountsData.error) {
      console.log('❌ Ad accounts access failed:', adAccountsData.error.message);
      if (adAccountsData.error.code === 200) {
        console.log('   This suggests the token lacks ads_management or ads_read permissions');
      }
    } else {
      console.log('✅ Ad accounts accessible');
      console.log(`   Found ${adAccountsData.data ? adAccountsData.data.length : 0} ad accounts`);
      
      if (adAccountsData.data && adAccountsData.data.length > 0) {
        adAccountsData.data.slice(0, 2).forEach((account, index) => {
          console.log(`   Account ${index + 1}: ${account.name} (${account.id})`);
        });
      }
      console.log('');
    }
    
    // Test 4: Pages Access
    console.log('📘 Test 4: Pages Access');
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${MARKETING_TOKEN}&appsecret_proof=${appSecretProof}`;
    
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.log('❌ Pages access failed:', pagesData.error.message);
    } else {
      console.log('✅ Pages accessible');
      console.log(`   Found ${pagesData.data ? pagesData.data.length : 0} pages`);
      
      if (pagesData.data && pagesData.data.length > 0) {
        pagesData.data.slice(0, 2).forEach((page, index) => {
          console.log(`   Page ${index + 1}: ${page.name} (${page.id})`);
        });
      }
      console.log('');
    }
    
    // Test 5: Business Access
    console.log('📘 Test 5: Business Access');
    const businessUrl = `https://graph.facebook.com/v18.0/me/businesses?access_token=${MARKETING_TOKEN}&appsecret_proof=${appSecretProof}`;
    
    const businessResponse = await fetch(businessUrl);
    const businessData = await businessResponse.json();
    
    if (businessData.error) {
      console.log('❌ Business access failed:', businessData.error.message);
    } else {
      console.log('✅ Business access available');
      console.log(`   Found ${businessData.data ? businessData.data.length : 0} businesses`);
      console.log('');
    }
    
    console.log('🎉 Marketing API token test completed!');
    return true;
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return false;
  }
}

testMarketingAPIToken().catch(console.error);