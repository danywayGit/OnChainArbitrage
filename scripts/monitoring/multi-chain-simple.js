/**
 * 🚀 Simple Multi-Chain Monitor
 * 
 * Simplified approach: Launch one chain at a time in separate terminals
 */

console.log(`
═══════════════════════════════════════════════════════════════
     🚀 MULTI-CHAIN MONITORING - QUICK START 🚀
═══════════════════════════════════════════════════════════════

To start data collection on all 3 chains, open 3 separate terminals:

📋 TERMINAL 1 - Polygon (🟣):
   cd C:\\Users\\danyw\\Documents\\Git\\DanywayGit\\OnChainArbitrage
   $env:NETWORK="polygon"; npm start

📋 TERMINAL 2 - BSC (🟡):
   cd C:\\Users\\danyw\\Documents\\Git\\DanywayGit\\OnChainArbitrage
   $env:NETWORK="bsc"; npm start

📋 TERMINAL 3 - Base (🔵):
   cd C:\\Users\\danyw\\Documents\\Git\\DanywayGit\\OnChainArbitrage
   $env:NETWORK="base"; npm start

═══════════════════════════════════════════════════════════════

💡 TIP: You can also start just one chain for testing:
   $env:NETWORK="polygon"; npm start

📊 After 24-48 hours:
   - Press Ctrl+C in each terminal to stop
   - Compare total opportunities detected
   - Review DATA-COLLECTION-GUIDE.md for analysis

═══════════════════════════════════════════════════════════════
`);

// Keep process alive
process.stdin.resume();
