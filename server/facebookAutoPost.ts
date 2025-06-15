// server/facebookAutoPost.ts
import { FacebookAPIService } from "./facebookAPIService";
import { advancedAdOptimizer } from "./advancedAdOptimizer";

const AUTO_POST_ENABLED = process.env.AUTO_POST_ENABLED === "true";
const MIN_SCORE_THRESHOLD = parseFloat(process.env.MIN_SCORE_THRESHOLD || "50");

export interface AutoPostResult {
  executed: boolean;
  reason: string;
  postData?: any;
  performanceScores?: any[];
  averageScore?: number;
  timestamp: string;
}

export async function runAutoFacebookPost(): Promise<AutoPostResult> {
  const timestamp = new Date().toISOString();
  
  try {
    if (!AUTO_POST_ENABLED) {
      return {
        executed: false,
        reason: "Auto posting is disabled. Set AUTO_POST_ENABLED=true to enable.",
        timestamp
      };
    }

    console.log("🚀 Starting auto-post analysis...");
    
    // Fetch performance scores for recent posts
    const scores = await advancedAdOptimizer.fetchPerformanceScores();
    
    if (scores.length === 0) {
      console.log("📝 No posts found for analysis, generating initial content");
      const aiPost = await advancedAdOptimizer.generatePost("engagement boost");
      const facebookAPI = new FacebookAPIService();
      const postResult = await facebookAPI.publishPost(aiPost);
      
      return {
        executed: true,
        reason: "No existing posts found, created initial engaging content",
        postData: postResult,
        performanceScores: [],
        timestamp
      };
    }

    // Calculate average performance score
    const averageScore = scores.reduce((sum, post) => sum + parseFloat(post.score), 0) / scores.length;
    console.log(`📊 Average performance score: ${averageScore.toFixed(2)}%`);

    // Check if any recent posts are underperforming
    const lowPerformingPosts = scores.filter(post => parseFloat(post.score) < MIN_SCORE_THRESHOLD);
    
    if (lowPerformingPosts.length > 0 || averageScore < MIN_SCORE_THRESHOLD) {
      console.log(`⚠️ Performance below threshold (${MIN_SCORE_THRESHOLD}%), generating new content`);
      
      // Determine topic based on performance analysis
      let topic = "engagement improvement";
      if (averageScore < 20) {
        topic = "audience re-engagement";
      } else if (averageScore < 40) {
        topic = "content optimization";
      }

      const aiPost = await advancedAdOptimizer.generatePost(topic);
      const facebookAPI = new FacebookAPIService();
      const postResult = await facebookAPI.publishPost(aiPost);
      
      console.log("✅ Auto-posted new content due to low performance");
      
      return {
        executed: true,
        reason: `Performance below threshold (avg: ${averageScore.toFixed(2)}%), posted optimized content`,
        postData: postResult,
        performanceScores: scores,
        averageScore: parseFloat(averageScore.toFixed(2)),
        timestamp
      };
    } else {
      console.log("📈 All posts performing above threshold");
      
      return {
        executed: false,
        reason: `Performance above threshold (avg: ${averageScore.toFixed(2)}%), no action needed`,
        performanceScores: scores,
        averageScore: parseFloat(averageScore.toFixed(2)),
        timestamp
      };
    }
    
  } catch (error) {
    console.error("❌ Auto-post execution failed:", error);
    
    return {
      executed: false,
      reason: `Auto-post failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    };
  }
}

export async function getAutoPostStatus(): Promise<{
  enabled: boolean;
  threshold: number;
  lastRun?: string;
  nextScheduled?: string;
}> {
  return {
    enabled: AUTO_POST_ENABLED,
    threshold: MIN_SCORE_THRESHOLD,
    lastRun: undefined, // This would be stored in database in production
    nextScheduled: undefined // This would be calculated based on CRON schedule
  };
}

export async function triggerManualAutoPost(): Promise<AutoPostResult> {
  console.log("🎯 Manual auto-post trigger initiated");
  return await runAutoFacebookPost();
}