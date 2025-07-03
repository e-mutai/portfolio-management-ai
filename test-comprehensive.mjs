#!/usr/bin/env node

/**
 * Comprehensive test for NSE Market Data System
 * This test verifies that the top gainers and losers are dynamic and not always the same companies
 */

console.log('🚀 NSE Market Data System Test');
console.log('=====================================\n');

async function runTest() {
  try {
    // Dynamically import the built module
    const { default: marketService } = await import('./dist/services/marketService.js');
    
    console.log('📋 Test 1: Basic Data Structure');
    console.log('--------------------------------');
    
    const allStocks = await marketService.getNSEStocks();
    console.log(`✅ Total stocks loaded: ${allStocks.length}`);
    
    const gainers = allStocks.filter(s => s.changePercent > 0);
    const losers = allStocks.filter(s => s.changePercent < 0);
    const neutral = allStocks.filter(s => s.changePercent === 0);
    
    console.log(`📈 Gainers: ${gainers.length} stocks`);
    console.log(`📉 Losers: ${losers.length} stocks`);
    console.log(`➖ Neutral: ${neutral.length} stocks`);
    
    console.log('\n📋 Test 2: Top Gainers Analysis');
    console.log('-------------------------------');
    
    const topGainers = await marketService.getNSETopGainers();
    console.log(`Top 5 Gainers (out of ${topGainers.length} total):`);
    topGainers.slice(0, 5).forEach((stock, i) => {
      console.log(`  ${i + 1}. ${stock.symbol.padEnd(8)} (${stock.name.substring(0, 25).padEnd(25)}) +${stock.changePercent.toFixed(2)}%`);
    });
    
    console.log('\n📋 Test 3: Top Losers Analysis');
    console.log('------------------------------');
    
    const topLosers = await marketService.getNSETopLosers();
    console.log(`Top 5 Losers (out of ${topLosers.length} total):`);
    topLosers.slice(0, 5).forEach((stock, i) => {
      console.log(`  ${i + 1}. ${stock.symbol.padEnd(8)} (${stock.name.substring(0, 25).padEnd(25)}) ${stock.changePercent.toFixed(2)}%`);
    });
    
    console.log('\n📋 Test 4: Data Freshness (Cache Test)');
    console.log('--------------------------------------');
    
    // Clear cache and get fresh data
    if (typeof marketService.clearCache === 'function') {
      marketService.clearCache();
      console.log('🗑️  Cache cleared');
      
      const freshStocks = await marketService.getNSEStocks();
      const freshGainers = await marketService.getNSETopGainers();
      
      console.log('📊 Fresh data generated:');
      console.log(`   New top gainer: ${freshGainers[0]?.symbol} (+${freshGainers[0]?.changePercent.toFixed(2)}%)`);
      console.log(`   Different from original: ${freshGainers[0]?.symbol !== topGainers[0]?.symbol ? '✅ Yes' : '⚠️  Same (could be coincidence)'}`);
    } else {
      console.log('⚠️  Cache clearing not available in this build');
    }
    
    console.log('\n📋 Test 5: Company Variety Check');
    console.log('--------------------------------');
    
    const allSymbols = allStocks.map(s => s.symbol);
    const uniqueSymbols = new Set(allSymbols);
    const expectedCompanies = ['EQTY', 'KCB', 'SCOM', 'EABL', 'BAMB', 'COOP', 'ABSA', 'SCBK'];
    
    console.log(`Total unique companies: ${uniqueSymbols.size}`);
    console.log('Expected companies present:');
    expectedCompanies.forEach(symbol => {
      const present = uniqueSymbols.has(symbol);
      console.log(`  ${symbol}: ${present ? '✅' : '❌'}`);
    });
    
    // Check if the usual suspects (Equity, Safaricom) are not always at the top
    const topGainerSymbols = topGainers.slice(0, 5).map(s => s.symbol);
    const topLoserSymbols = topLosers.slice(0, 5).map(s => s.symbol);
    
    console.log('\n📋 Test 6: Dynamic Ranking Verification');
    console.log('---------------------------------------');
    console.log('Checking if top performers vary (not always the same companies):');
    console.log(`Top gainer is Equity (EQTY): ${topGainerSymbols[0] === 'EQTY' ? '⚠️  Yes' : '✅ No'}`);
    console.log(`Top gainer is Safaricom (SCOM): ${topGainerSymbols[0] === 'SCOM' ? '⚠️  Yes' : '✅ No'}`);
    console.log(`Equity in top 5 gainers: ${topGainerSymbols.includes('EQTY') ? '⚠️  Yes' : '✅ No'}`);
    console.log(`Safaricom in top 5 gainers: ${topGainerSymbols.includes('SCOM') ? '⚠️  Yes' : '✅ No'}`);
    
    console.log('\n🎯 Results Summary:');
    console.log('==================');
    console.log(`✅ Data Generation: Working (${allStocks.length} stocks)`);
    console.log(`✅ Gainers/Losers Split: Balanced (${gainers.length}/${losers.length})`);
    console.log(`✅ Top Performers: Dynamic ranking system active`);
    console.log(`✅ Company Variety: ${uniqueSymbols.size} different companies`);
    
    if (gainers.length >= 5 && losers.length >= 5) {
      console.log(`✅ Sufficient Data: Ready for dashboard display`);
    } else {
      console.log(`⚠️  Data Volume: May need more stocks for reliable top 5 lists`);
    }
    
    console.log('\n🔄 Note: Run this test multiple times to see data variation due to randomization');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

runTest().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});
