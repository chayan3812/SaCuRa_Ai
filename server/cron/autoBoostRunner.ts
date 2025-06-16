// 🔁 Auto Boost Runner - Daily execution at 9am
import axios from "axios";
import { storage } from "../storage";

export const autoBoostRunner = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log(`📆 AutoBoostRunner: Checking for boosts scheduled for ${today}`);

    // Get all users to check their scheduled boosts
    const allUsers = await storage.getAllUsers?.() || [];
    let totalBoosts = 0;
    let successfulBoosts = 0;
    let failedBoosts = 0;

    for (const user of allUsers) {
      try {
        const userBoosts = await storage.getScheduledBoosts(user.id);
        const todayBoosts = userBoosts.filter((boost: any) => 
          boost.date && boost.date.toISOString().startsWith(today) && 
          boost.status === "scheduled"
        );

        console.log(`👤 User ${user.id}: Found ${todayBoosts.length} boosts for today`);
        totalBoosts += todayBoosts.length;

        for (const boost of todayBoosts) {
          try {
            // Make boost request to internal API
            const response = await axios.post("http://localhost:3000/api/facebook/boost-post", {
              pagePostId: boost.postId,
              budget: boost.budget || 10,
              days: 3,
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer internal-cron-token`
              }
            });

            if (response.status === 200) {
              console.log(`✅ Successfully boosted post: ${boost.postId} with budget $${boost.budget}`);
              successfulBoosts++;
              
              // Update boost status to active
              await storage.updateScheduledBoostStatus?.(boost.id, "active");
            }
          } catch (boostError: any) {
            console.error(`❌ Failed to boost post ${boost.postId}:`, boostError.message);
            failedBoosts++;
            
            // Update boost status to failed
            await storage.updateScheduledBoostStatus?.(boost.id, "failed");
          }
        }
      } catch (userError: any) {
        console.error(`⚠️ Error processing boosts for user ${user.id}:`, userError.message);
      }
    }

    console.log(`📊 AutoBoostRunner Summary:
      Total Boosts Processed: ${totalBoosts}
      Successful: ${successfulBoosts}
      Failed: ${failedBoosts}
      Success Rate: ${totalBoosts > 0 ? ((successfulBoosts / totalBoosts) * 100).toFixed(1) : 0}%
    `);

    // Log the execution for monitoring
    await storage.logAutoBoostExecution?.({
      date: new Date(),
      totalProcessed: totalBoosts,
      successful: successfulBoosts,
      failed: failedBoosts,
      successRate: totalBoosts > 0 ? (successfulBoosts / totalBoosts) * 100 : 0
    });

  } catch (error: any) {
    console.error("🛑 AutoBoostRunner Critical Error:", error.message);
    
    // Log critical error for monitoring
    await storage.logAutoBoostError?.({
      date: new Date(),
      error: error.message,
      stack: error.stack
    });
  }
};

// Enhanced runner with retry logic
export const autoBoostRunnerWithRetry = async (maxRetries: number = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await autoBoostRunner();
      console.log(`✅ AutoBoostRunner completed successfully on attempt ${attempt}`);
      return;
    } catch (error: any) {
      console.error(`❌ AutoBoostRunner attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error(`🛑 AutoBoostRunner failed after ${maxRetries} attempts`);
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};