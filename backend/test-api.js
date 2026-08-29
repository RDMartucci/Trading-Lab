#!/usr/bin/env node

/**
 * Simple API endpoint tests for Trading Lab
 */

const BASE_URL = 'http://localhost:4000';

async function test(method, path, description) {
  try {
    console.log(`\n📝 ${description}`);
    console.log(`   ${method} ${path}`);
    
    const url = new URL(path, BASE_URL);
    const response = await fetch(url, { method });
    const data = await response.json();
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}${JSON.stringify(data).length > 200 ? '...' : ''}`);
    
    return response.ok;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Trading Lab API Tests');
  console.log('========================\n');
  
  const results = {};
  
  // Test 1: Health
  results.health = await test('GET', '/api/health', 'Health Check');
  
  // Test 2: Assets List
  results.assetsList = await test('GET', '/api/assets', 'List All Assets');
  
  // Test 3: Asset Details (AAPL)
  results.assetDetail = await test('GET', '/api/assets/AAPL', 'Get Asset Details (AAPL)');
  
  // Test 4: Asset Stats
  results.assetStats = await test('GET', '/api/assets/AAPL/stats', 'Get Asset Stats (AAPL)');
  
  // Test 5: Market Quote
  results.quote = await test('GET', '/api/market/quote/AAPL', 'Get Market Quote (AAPL)');
  
  // Test 6: Market History
  results.history = await test('GET', '/api/market/history/AAPL?interval=1day&outputsize=30', 'Get Market History (AAPL)');
  
  // Test 7: Persisted Candles
  results.candles = await test('GET', '/api/market/candles/AAPL', 'Get Persisted Candles (AAPL)');
  
  // Summary
  console.log('\n\n📊 Test Summary');
  console.log('================');
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  console.log(`✅ Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! API is ready for production.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.\n');
  }
}

runTests().catch(console.error);
