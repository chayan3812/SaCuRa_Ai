// server/advancedAdOptimizer.ts
import axios from "axios";
import { FacebookAPIService } from "./facebookAPIService";
import OpenAI from "openai";
import { storage } from "./storage";

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Plan-based AI Training System
export const generateAdContent = async (userId: string, plan: string = 'free', topic?: string) => {
  const basePrompt = topic ? `Write a short, engaging Facebook post about ${topic}` : `Write a short, engaging Facebook post`;

  switch (plan.toLowerCase()) {
    case "free":
      // Generic post generator (no learning)
      return { 
        text: `${basePrompt} that showcases our product's value proposition. Keep it simple and engaging.`,
        strategy: 'generic'
      };

    case "pro":
      // Smart rewriting + boosted content focus
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{
            role: "user",
            content: `${basePrompt} that promotes value, urgency, and a strong CTA. Focus on conversion-optimized language that drives engagement and click-through rates. Include emotional triggers and clear next steps.`
          }],
          max_tokens: 300,
          temperature: 0.7
        });

        return {
          text: response.choices[0].message.content || `${basePrompt} with compelling value proposition.`,
          strategy: 'pro_optimized'
        };
      } catch (error) {
        console.error('OpenAI Pro content generation error:', error);
        return { 
          text: `${basePrompt} that promotes value, urgency, and a strong CTA.`,
          strategy: 'pro_fallback'
        };
      }

    case "enterprise":
      // Fine-tuned AI from past performance
      try {
        const pastWinners = await fetchTopPerformingPosts(userId);
        return await fineTuneWithData(basePrompt, pastWinners);
      } catch (error) {
        console.error('Enterprise AI content generation error:', error);
        return { 
          text: `${basePrompt} with enterprise-grade optimization.`,
          strategy: 'enterprise_fallback'
        };
      }

    default:
      return { 
        text: `${basePrompt} now.`,
        strategy: 'default'
      };
  }
};

// Training Data Functions
async function fetchTopPerformingPosts(userId: string) {
  try {
    const posts = await storage.getPostsByUserId(userId);
    
    // Filter for high-performing posts (performance score >= 7)
    const topPosts = posts
      .filter(post => post.performanceScore && post.performanceScore >= 7)
      .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
      .slice(0, 10)
      .map(post => ({
        message: post.message,
        performance: post.performanceScore,
        engagement: post.totalEngagement
      }));

    return topPosts;
  } catch (error) {
    console.error('Error fetching top performing posts:', error);
    return [];
  }
}

async function fineTuneWithData(prompt: string, examples: any[]) {
  try {
    if (examples.length === 0) {
      // Fallback to Pro-level optimization if no historical data
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{
          role: "user",
          content: `${prompt} with enterprise-level optimization focusing on conversion and engagement.`
        }],
        max_tokens: 300,
        temperature: 0.6
      });

      return {
        text: response.choices[0].message.content || `${prompt} with enterprise optimization.`,
        strategy: 'enterprise_no_data'
      };
    }

    const examplesText = examples
      .map((e, i) => `Example ${i + 1} (Performance: ${e.performance}): ${e.message}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{
        role: "system",
        content: "You are an expert Facebook ad copywriter. Analyze the provided high-performing examples and create content that follows similar patterns, tone, and structure while being original."
      }, {
        role: "user",
        content: `${prompt} based on these top-performing examples from this account:\n\n${examplesText}\n\nCreate a new post that captures the successful elements of these examples while being completely original.`
      }],
      max_tokens: 300,
      temperature: 0.6
    });

    return {
      text: response.choices[0].message.content || `${prompt} based on successful patterns.`,
      strategy: 'enterprise_fine_tuned',
      trainingExamples: examples.length
    };
  } catch (error) {
    console.error('Fine-tuning error:', error);
    return {
      text: `${prompt} with personalized optimization.`,
      strategy: 'enterprise_error',
      error: error.message
    };
  }
}

export const advancedAdOptimizer = {
  async fetchPerformanceScores() {
    try {
      const facebookAPI = new FacebookAPIService();
      const posts = await facebookAPI.getPosts();
      
      if (!posts?.data || posts.data.length === 0) {
        console.log('No posts found for performance analysis');
        return [];
      }

      const scores = await Promise.all(
        posts.data.slice(0, 5).map(async (post: any) => {
          try {
            const insightUrl = `https://graph.facebook.com/v21.0/${post.id}/insights/post_impressions,post_engaged_users?access_token=${ACCESS_TOKEN}`;
            const { data } = await axios.get(insightUrl);
            
            const impressions = data?.data?.find((d: any) => d.name === 'post_impressions')?.values[0]?.value || 1;
            const engaged = data?.data?.find((d: any) => d.name === 'post_engaged_users')?.values[0]?.value || 0;
            const score = (engaged / impressions) * 100;
            
            return { 
              id: post.id, 
              message: post.message || 'No message', 
              score: score.toFixed(2),
              impressions,
              engaged,
              timestamp: post.created_time
            };
          } catch (error) {
            console.error(`Error fetching insights for post ${post.id}:`, error);
            return { 
              id: post.id, 
              message: post.message || 'No message', 
              score: '0.00',
              impressions: 0,
              engaged: 0,
              timestamp: post.created_time
            };
          }
        })
      );
      
      return scores.filter(score => score !== null);
    } catch (error) {
      console.error('Error fetching performance scores:', error);
      return [];
    }
  },

  async generatePost(topic = "growth marketing") {
    try {
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `Generate an engaging Facebook post for a business page about: ${topic}. Include emoji, CTA, and hashtags. Make it conversational and authentic. Keep it under 200 characters.`;
      
      const { data } = await axios.post("https://api.openai.com/v1/completions", {
        model: "text-davinci-003",
        prompt,
        max_tokens: 100,
        temperature: 0.7
      }, {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return data.choices[0].text.trim();
    } catch (error) {
      console.error('Error generating AI post:', error);
      // Fallback post if AI generation fails
      return `🚀 Exciting updates coming your way! Stay tuned for more amazing content. What would you like to see next? #GrowthMarketing #SocialMedia #Engagement`;
    }
  },

  async analyzeContentTrends() {
    try {
      const scores = await this.fetchPerformanceScores();
      
      if (scores.length === 0) {
        return {
          averageScore: 0,
          trendDirection: 'stable',
          recommendation: 'No data available for analysis'
        };
      }

      const averageScore = scores.reduce((sum, post) => sum + parseFloat(post.score), 0) / scores.length;
      const recentScores = scores.slice(0, 3).map(post => parseFloat(post.score));
      const olderScores = scores.slice(3).map(post => parseFloat(post.score));
      
      const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b) / recentScores.length : 0;
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b) / olderScores.length : 0;
      
      let trendDirection = 'stable';
      if (recentAvg > olderAvg * 1.1) trendDirection = 'improving';
      else if (recentAvg < olderAvg * 0.9) trendDirection = 'declining';

      let recommendation = '';
      if (averageScore < 30) {
        recommendation = 'Performance is low. Consider more engaging content, better timing, or audience targeting.';
      } else if (averageScore < 60) {
        recommendation = 'Performance is moderate. Try A/B testing different content types and posting times.';
      } else {
        recommendation = 'Performance is good! Continue with current strategy and experiment with new content formats.';
      }

      return {
        averageScore: averageScore.toFixed(2),
        trendDirection,
        recommendation,
        totalPosts: scores.length,
        topPerformingPost: scores.reduce((max, post) => 
          parseFloat(post.score) > parseFloat(max.score) ? post : max, scores[0]
        )
      };
    } catch (error) {
      console.error('Error analyzing content trends:', error);
      return {
        averageScore: 0,
        trendDirection: 'unknown',
        recommendation: 'Unable to analyze trends due to error'
      };
    }
  }
};