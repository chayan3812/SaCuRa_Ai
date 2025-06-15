#!/usr/bin/env node
// cronAutoPost.ts
// Standalone CRON runner for Facebook auto-posting
// Usage: node cronAutoPost.ts

import { runAutoFacebookPost } from "./server/facebookAutoPost";

async function main() {
  console.log(`🕐 Auto-post CRON job started at ${new Date().toISOString()}`);
  
  try {
    const result = await runAutoFacebookPost();
    
    console.log("📊 Auto-post execution result:", {
      executed: result.executed,
      reason: result.reason,
      averageScore: result.averageScore,
      postsAnalyzed: result.performanceScores?.length || 0
    });

    if (result.executed && result.postData) {
      console.log("✅ Successfully published new content:", result.postData.id);
    }

    // Exit with appropriate code
    process.exit(result.executed ? 0 : 1);
    
  } catch (error) {
    console.error("❌ CRON job failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 CRON job interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 CRON job terminated');
  process.exit(0);
});

// Execute if run directly
if (require.main === module) {
  main();
}