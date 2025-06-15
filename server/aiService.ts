/**
 * SaCuRa AI Service - Unified AI Operations Hub
 * Integrates OpenAI and Anthropic for comprehensive AI capabilities
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  suggestions: string[];
  category: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface CustomerMessageAnalysis {
  intent: string;
  sentiment: string;
  urgency: 'low' | 'medium' | 'high';
  suggestedResponse: string;
  confidence: number;
  category: string;
}

export interface ContentOptimization {
  optimizedContent: string;
  improvements: string[];
  engagementScore: number;
  targetAudience: string;
}

export class AIService {
  /**
   * Analyze customer message for intent, sentiment, and generate response suggestions
   */
  async analyzeCustomerMessage(message: string, context?: string): Promise<CustomerMessageAnalysis> {
    try {
      const prompt = `Analyze this customer message and provide JSON response:
Message: "${message}"
Context: ${context || 'None'}

Analyze for:
1. Intent (question, complaint, compliment, request, etc.)
2. Sentiment (positive, negative, neutral)
3. Urgency level (low, medium, high)
4. Suggested professional response
5. Confidence score (0-1)
6. Category (support, sales, feedback, etc.)

Return JSON format:
{
  "intent": "string",
  "sentiment": "string", 
  "urgency": "low|medium|high",
  "suggestedResponse": "string",
  "confidence": 0.95,
  "category": "string"
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const result = JSON.parse(response.content[0].text);
      return {
        intent: result.intent,
        sentiment: result.sentiment,
        urgency: result.urgency,
        suggestedResponse: result.suggestedResponse,
        confidence: Math.max(0, Math.min(1, result.confidence)),
        category: result.category
      };
    } catch (error) {
      console.error('AI message analysis error:', error);
      throw new Error('Failed to analyze customer message');
    }
  }

  /**
   * Generate optimized content for Facebook posts/ads
   */
  async optimizeContent(content: string, objective: string, audience: string): Promise<ContentOptimization> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a social media optimization expert. Optimize content for maximum engagement while maintaining authenticity. Return JSON format."
          },
          {
            role: "user",
            content: `Optimize this content:
Content: "${content}"
Objective: ${objective}
Target Audience: ${audience}

Return JSON with:
{
  "optimizedContent": "improved version",
  "improvements": ["list of changes made"],
  "engagementScore": 0.85,
  "targetAudience": "refined audience description"
}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        optimizedContent: result.optimizedContent,
        improvements: result.improvements || [],
        engagementScore: Math.max(0, Math.min(1, result.engagementScore || 0.5)),
        targetAudience: result.targetAudience
      };
    } catch (error) {
      console.error('Content optimization error:', error);
      throw new Error('Failed to optimize content');
    }
  }

  /**
   * Analyze competitor content and generate insights
   */
  async analyzeCompetitorContent(posts: any[]): Promise<any> {
    try {
      const postsText = posts.map(post => post.message || post.description || '').join('\n---\n');
      
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze these competitor posts and provide strategic insights:

${postsText}

Provide JSON analysis:
{
  "contentThemes": ["theme1", "theme2"],
  "engagementTactics": ["tactic1", "tactic2"],
  "postingPatterns": "analysis",
  "strengths": ["strength1", "strength2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "recommendedStrategy": "strategic recommendations"
}`
        }],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Competitor analysis error:', error);
      throw new Error('Failed to analyze competitor content');
    }
  }

  /**
   * Generate ad copy variations
   */
  async generateAdCopy(product: string, audience: string, objective: string, tone?: string): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a Facebook ads copywriter expert. Create compelling, policy-compliant ad copy that drives results."
          },
          {
            role: "user",
            content: `Create 3 ad copy variations:
Product: ${product}
Audience: ${audience}
Objective: ${objective}
Tone: ${tone || 'professional'}

Return JSON:
{
  "variations": [
    {
      "headline": "compelling headline",
      "body": "engaging body text",
      "cta": "call to action",
      "hook": "attention grabber"
    }
  ],
  "targeting_suggestions": ["suggestion1", "suggestion2"],
  "estimated_performance": "performance prediction"
}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Ad copy generation error:', error);
      throw new Error('Failed to generate ad copy');
    }
  }

  /**
   * Analyze post performance and provide optimization suggestions
   */
  async analyzePostPerformance(postData: any): Promise<any> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze this post performance data:
${JSON.stringify(postData, null, 2)}

Provide optimization insights in JSON:
{
  "performance_score": 0.75,
  "key_metrics": {
    "engagement_rate": 0.05,
    "reach_effectiveness": 0.80
  },
  "optimization_suggestions": [
    "specific actionable suggestion 1",
    "specific actionable suggestion 2"
  ],
  "best_posting_times": ["time1", "time2"],
  "content_recommendations": "content strategy advice"
}`
        }],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Post performance analysis error:', error);
      throw new Error('Failed to analyze post performance');
    }
  }

  /**
   * Generate content ideas based on trends and audience
   */
  async generateContentIdeas(niche: string, audience: string, trends?: string[]): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative content strategist. Generate engaging, original content ideas that align with current trends and audience interests."
          },
          {
            role: "user",
            content: `Generate content ideas for:
Niche: ${niche}
Audience: ${audience}
Current Trends: ${trends?.join(', ') || 'General social media trends'}

Return JSON with 5 content ideas:
{
  "content_ideas": [
    {
      "title": "engaging title",
      "description": "content concept",
      "content_type": "post|video|carousel|story",
      "engagement_potential": "high|medium|low",
      "best_timing": "optimal posting time"
    }
  ],
  "hashtag_suggestions": ["#hashtag1", "#hashtag2"],
  "content_calendar_recommendations": "posting schedule advice"
}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Content idea generation error:', error);
      throw new Error('Failed to generate content ideas');
    }
  }

  /**
   * Sentiment analysis for batch processing
   */
  async analyzeSentimentBatch(texts: string[]): Promise<AIAnalysisResult[]> {
    try {
      const results = await Promise.all(
        texts.map(async (text) => {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 512,
            messages: [{
              role: 'user',
              content: `Analyze sentiment and provide JSON:
Text: "${text}"

Return:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.95,
  "suggestions": ["actionable suggestion"],
  "category": "support|sales|feedback|general",
  "urgency": "low|medium|high"
}`
            }],
          });

          const result = JSON.parse(response.content[0].text);
          return {
            sentiment: result.sentiment,
            confidence: Math.max(0, Math.min(1, result.confidence)),
            suggestions: result.suggestions || [],
            category: result.category,
            urgency: result.urgency
          };
        })
      );

      return results;
    } catch (error) {
      console.error('Batch sentiment analysis error:', error);
      throw new Error('Failed to analyze sentiment batch');
    }
  }
}

export const aiService = new AIService();
export default aiService;