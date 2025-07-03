// Test market data variation - Run this multiple times to see different results
console.log('Testing Market Data Variation...\n');

// Simulate multiple cache expiration cycles
const testRuns = 3;
const delays = [0, 100, 200]; // Small delays to force cache refresh

async function runTest(runNumber) {
  console.log(`\n📊 Test Run #${runNumber + 1}:`);
  
  // Import the service (assuming ES modules)
  const { default: marketService } = await import('./dist/services/marketService.js');
  
  // Get fresh data (bypass cache)
  marketService.clearCache?.(); // If cache clearing method exists
  
  const stocks = await marketService.getNSEStocks();
  const gainers = stocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = stocks.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  
  console.log('Top 5 Gainers:');
  gainers.forEach((s, i) => console.log(`  ${i+1}. ${s.symbol} (+${s.changePercent}%)`));
  
  console.log('Top 5 Losers:');
  losers.forEach((s, i) => console.log(`  ${i+1}. ${s.symbol} (${s.changePercent}%)`));
}

// Run tests with delays
for (let i = 0; i < testRuns; i++) {
  setTimeout(() => runTest(i), delays[i]);
}

setTimeout(() => {
  console.log('\n✅ Variation test completed. Each run should show different top performers.');
}, 500);
