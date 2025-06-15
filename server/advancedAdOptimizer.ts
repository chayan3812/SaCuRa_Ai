// server/advancedAdOptimizer.ts
import axios from "axios";
import { FacebookAPIService } from "./facebookAPIService";

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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