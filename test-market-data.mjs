// Simple test to verify market data generation
import marketService from './src/services/marketService.js';

async function testMarketData() {
  console.log('🧪 Testing Market Data Generation...\n');
  
  try {
    // Test the main method
    console.log('1. Testing getNSEStocks():');
    const allStocks = await marketService.getNSEStocks();
    console.log(`   Total stocks: ${allStocks.length}`);
    
    // Test gainers
    console.log('\n2. Testing getNSETopGainers():');
    const gainers = await marketService.getNSETopGainers();
    console.log(`   Total gainers: ${gainers.length}`);
    console.log('   Top 5 Gainers:');
    gainers.slice(0, 5).forEach((stock, i) => {
      console.log(`   ${i + 1}. ${stock.symbol} (${stock.name}): +${stock.changePercent}% - ${stock.price} KES`);
    });
    
    // Test losers
    console.log('\n3. Testing getNSETopLosers():');
    const losers = await marketService.getNSETopLosers();
    console.log(`   Total losers: ${losers.length}`);
    console.log('   Top 5 Losers:');
    losers.slice(0, 5).forEach((stock, i) => {
      console.log(`   ${i + 1}. ${stock.symbol} (${stock.name}): ${stock.changePercent}% - ${stock.price} KES`);
    });
    
    // Test cache behavior
    console.log('\n4. Testing cache (calling again immediately):');
    const cachedStocks = await marketService.getNSEStocks();
    console.log(`   Should be same data: ${allStocks.length === cachedStocks.length ? '✅' : '❌'}`);
    console.log(`   Same first stock: ${allStocks[0].symbol === cachedStocks[0].symbol ? '✅' : '❌'}`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMarketData();
