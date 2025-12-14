/**
 * Test script for Click API
 * Tests clicking 100 times and reports results
 */

import { APIClient } from './src/core/apiClient.js';
import { config } from './src/core/config.js';

async function testClickAPI() {
  console.log('='.repeat(60));
  console.log('Click API Test Script');
  console.log('='.repeat(60));

  // Get account from command line
  const accountId = process.argv[2] || 'acc_001';
  const accountConfig = config.getAccount(accountId);

  if (!accountConfig) {
    console.error(`❌ Account ${accountId} not found in config/accounts.json`);
    console.error('Usage: node test-click-api.js <account_id>');
    process.exit(1);
  }

  if (!accountConfig.sessionToken) {
    console.error(`❌ No session token for ${accountId}`);
    console.error('Add sessionToken to config/accounts.json first!');
    process.exit(1);
  }

  console.log(`\n📋 Testing account: ${accountId}`);
  console.log(`👤 Username: ${accountConfig.username}`);

  // Create API client
  const client = new APIClient(accountConfig.sessionToken);

  try {
    // Test /api/me first (verify session works)
    console.log('\n1️⃣ Testing session token with /api/me...');
    const me = await client.getMe();
    console.log(`✅ Session valid!`);
    console.log(`   Level: ${me.level}, Tokens: ${me.tokens}, Rank: ${me.rank || 'Unranked'}`);

    // Test click API
    console.log('\n2️⃣ Testing Click API...');
    console.log('   Attempting 10 test clicks...\n');

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (let i = 1; i <= 10; i++) {
      try {
        const startTime = Date.now();
        const result = await client.clickToken();
        const duration = Date.now() - startTime;

        successCount++;
        results.push({ success: true, result, duration });

        console.log(`   ✅ Click ${i}/10 - Success (${duration}ms)`);
        if (result.money !== undefined) {
          console.log(`      Money gained: ${result.money}`);
        }
        if (result.tokens !== undefined) {
          console.log(`      Tokens: ${result.tokens}`);
        }

        // Small delay between clicks
        await sleep(100);
      } catch (error) {
        errorCount++;
        results.push({ success: false, error: error.message });
        console.log(`   ❌ Click ${i}/10 - Error: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Results:');
    console.log('='.repeat(60));
    console.log(`✅ Successful clicks: ${successCount}/10`);
    console.log(`❌ Failed clicks: ${errorCount}/10`);

    if (successCount > 0) {
      const avgDuration = results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.duration, 0) / successCount;
      console.log(`⏱️  Average response time: ${avgDuration.toFixed(0)}ms`);
    }

    // Recommendations
    console.log('\n📊 Analysis:');
    if (successCount === 10) {
      console.log('✅ Click API is working perfectly!');
      console.log('\n✨ Next steps:');
      console.log('   1. Run short test: npm run test-phase1');
      console.log('   2. Run full automation: npm start acc_001');
    } else if (successCount > 0) {
      console.log('⚠️  Click API is partially working');
      console.log(`   ${errorCount} failures might indicate rate limiting`);
      console.log('   Try increasing clickDelay in config/settings.json');
    } else {
      console.log('❌ Click API not working');
      console.log('   Possible issues:');
      console.log('   - Wrong endpoint URL in apiClient.js');
      console.log('   - Session token expired');
      console.log('   - API changed format');
      console.log('\n   Check Network tab in browser DevTools to verify endpoint');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.response?.status === 401) {
      console.error('   Session token is invalid or expired');
      console.error('   Get fresh token from browser and update config/accounts.json');
    } else if (error.message.includes('API endpoint not discovered')) {
      console.error('\n   You need to discover the Click API endpoint first!');
      console.error('   See: API_DISCOVERY_GUIDE.md');
    }
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testClickAPI();
