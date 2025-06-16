import axios from "axios";
import { storage } from "../storage";
import { facebookAPIService } from "../facebookAPIService";

interface ContentGeneration {
  text: string;
  imageUrl?: string;
  hashtags?: string[];
}

export const runAutoContentPost = async () => {
  console.log("🔌 AutoContentRunner: Starting automated content generation...");
  
  try {
    // Get all users with autopilot enabled
    const users = await storage.getAllUsers();
    const autopilotUsers = users.filter(user => user.autopilotEnabled);
    
    console.log(`📊 Found ${autopilotUsers.length} users with autopilot enabled`);
    
    for (const user of autopilotUsers) {
      try {
        await processUserContent(user.id);
      } catch (error) {
        console.error(`❌ Failed to process content for user ${user.id}:`, error);
        await storage.logAutoContentError(user.id, error as Error);
      }
    }
    
    console.log("✅ AutoContentRunner completed successfully");
  } catch (error) {
    console.error("❌ AutoContentRunner failed:", error);
  }
};

const processUserContent = async (userId: string) => {
  console.log(`🎯 Processing content for user ${userId}`);
  
  // Generate AI content using advanced optimizer
  const content = await generateOptimizedContent(userId);
  
  // Get best posting slot via insights API
  const insights = await axios.get(`http://localhost:5000/api/facebook/recommend-time-slots`, {
    headers: { 'user-id': userId }
  });
  
  const bestSlot = insights.data?.recommendedSlots?.[0];
  
  if (!bestSlot) {
    console.log(`⚠️ No recommended time slots found for user ${userId}`);
    return;
  }
  
  // Post content to Facebook
  const postResponse = await facebookAPIService.createPost(userId, {
    message: content.text,
    image: content.imageUrl,
    scheduledTime: bestSlot.date
  });
  
  const postId = postResponse.id;
  
  if (postId && bestSlot.date) {
    // Schedule boost for optimal engagement
    await axios.post(`http://localhost:5000/api/facebook/scheduled-boosts`, {
      postId,
      date: bestSlot.date,
      budget: content.recommendedBudget || 20
    });
    
    console.log(`✅ Auto-generated content posted and boost scheduled for user ${userId}`);
    console.log(`📅 Scheduled for: ${bestSlot.dayName} at ${bestSlot.timeLabel}`);
    console.log(`💰 Budget: $${content.recommendedBudget || 20}`);
    
    // Log successful execution
    await storage.logAutoContentExecution({
      userId,
      postId,
      scheduledTime: bestSlot.date,
      budget: content.recommendedBudget || 20,
      contentType: content.type || 'standard',
      status: 'success'
    });
  }
};

const generateOptimizedContent = async (userId: string): Promise<ContentGeneration & { recommendedBudget?: number; type?: string }> => {
  try {
    // Use existing advanced ad optimizer
    const response = await axios.get(`http://localhost:5000/api/ai/content-optimizer/generate`, {
      headers: { 'user-id': userId }
    });
    
    if (response.data?.content) {
      return {
        text: response.data.content.text,
        imageUrl: response.data.content.imageUrl,
        hashtags: response.data.content.hashtags,
        recommendedBudget: response.data.content.recommendedBudget,
        type: response.data.content.type
      };
    }
    
    // Fallback to basic content generation
    return {
      text: "🚀 Exciting updates coming your way! Stay tuned for more amazing content. #Innovation #Business #Growth",
      type: 'fallback'
    };
  } catch (error) {
    console.error("Error generating optimized content:", error);
    
    // Emergency fallback content
    return {
      text: "✨ Thank you for following our journey! More exciting updates ahead. #Community #Updates",
      type: 'emergency_fallback'
    };
  }
};

// Enhanced version with retry logic and error handling
export const autoContentRunnerWithRetry = async (maxRetries: number = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await runAutoContentPost();
      return; // Success, exit retry loop
    } catch (error) {
      console.error(`❌ AutoContentRunner attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error("🚨 AutoContentRunner failed after all retry attempts");
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};