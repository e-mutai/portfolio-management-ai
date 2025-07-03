// Quick test script to check market data
import('./dist/services/marketService.js').then(({ default: marketService }) => {
  console.log('Testing market data...');
  
  marketService.getNSEStocks().then(stocks => {
    console.log('Total stocks:', stocks.length);
    
    const gainers = stocks
      .filter(s => s.changePercent > 0)
      .sort((a,b) => b.changePercent - a.changePercent)
      .slice(0,5);
      
    const losers = stocks
      .filter(s => s.changePercent < 0)
      .sort((a,b) => a.changePercent - b.changePercent)
      .slice(0,5);
    
    console.log('\nTop 5 Gainers:');
    gainers.forEach((s, i) => console.log(`${i+1}. ${s.symbol} (${s.name}): +${s.changePercent}%`));
    
    console.log('\nTop 5 Losers:');
    losers.forEach((s, i) => console.log(`${i+1}. ${s.symbol} (${s.name}): ${s.changePercent}%`));
    
    console.log('\nSample of all stocks:');
    stocks.slice(0, 10).forEach(s => {
      console.log(`${s.symbol}: ${s.changePercent}% (${s.changePercent > 0 ? 'Gainer' : s.changePercent < 0 ? 'Loser' : 'Flat'})`);
    });
  }).catch(e => {
    console.error('Error:', e.message);
  });
}).catch(e => {
  console.error('Import error:', e.message);
});
