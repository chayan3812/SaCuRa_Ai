import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219

export interface ClaudeResponse {
  content: string;
  confidence: number;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ContentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  tone: string;
  readabilityScore: number;
  keyThemes: string[];
  improvementSuggestions: string[];
  engagementPrediction: number;
}

export interface MarketingStrategy {
  targetAudience: string;
  contentPillars: string[];
  postingSchedule: {
    frequency: string;
    optimalTimes: string[];
  };
  hashtagStrategy: string[];
  expectedResults: {
    reachIncrease: string;
    engagementIncrease: string;
  };
}

export class ClaudeAIService {
  
  async generateContent(
    prompt: string,
    contentType: 'post' | 'caption' | 'story' | 'ad_copy',
    brand?: string,
    audience?: string
  ): Promise<ClaudeResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(contentType, brand, audience);
      
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        content: response.content[0].text,
        confidence: 0.95,
        model: 'claude-sonnet-4-20250514',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Claude AI content generation error:', error);
      throw new Error('Failed to generate content with Claude AI');
    }
  }

  async analyzeContent(content: string): Promise<ContentAnalysis> {
    try {
      const prompt = `
        Analyze the following social media content and provide detailed insights:
        
        Content: "${content}"
        
        Please analyze:
        1. Sentiment (positive/negative/neutral)
        2. Overall tone
        3. Readability score (1-100)
        4. Key themes (3-5 main topics)
        5. Improvement suggestions (3-5 actionable items)
        6. Engagement prediction score (1-100)
        
        Respond in JSON format with these exact keys: sentiment, tone, readabilityScore, keyThemes, improvementSuggestions, engagementPrediction
      `;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const analysis = JSON.parse(response.content[0].text);
      return analysis;
    } catch (error) {
      console.error('Claude AI content analysis error:', error);
      return {
        sentiment: 'neutral',
        tone: 'informative',
        readabilityScore: 75,
        keyThemes: ['general content'],
        improvementSuggestions: ['Add more engaging elements'],
        engagementPrediction: 60
      };
    }
  }

  async generateMarketingStrategy(
    businessType: string,
    goals: string[],
    currentMetrics?: any
  ): Promise<MarketingStrategy> {
    try {
      const prompt = `
        Create a comprehensive Facebook marketing strategy for:
        
        Business Type: ${businessType}
        Goals: ${goals.join(', ')}
        Current Metrics: ${currentMetrics ? JSON.stringify(currentMetrics) : 'None provided'}
        
        Please provide:
        1. Target audience description
        2. 4-5 content pillars
        3. Posting schedule with frequency and optimal times
        4. Hashtag strategy (8-12 relevant hashtags)
        5. Expected results (percentage increases)
        
        Respond in JSON format with keys: targetAudience, contentPillars, postingSchedule, hashtagStrategy, expectedResults
      `;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const strategy = JSON.parse(response.content[0].text);
      return strategy;
    } catch (error) {
      console.error('Claude AI strategy generation error:', error);
      return {
        targetAudience: 'General audience',
        contentPillars: ['Educational', 'Entertainment', 'Behind-the-scenes', 'User-generated'],
        postingSchedule: {
          frequency: 'Daily',
          optimalTimes: ['9:00 AM', '2:00 PM', '7:00 PM']
        },
        hashtagStrategy: ['#business', '#marketing', '#socialmedia', '#growth'],
        expectedResults: {
          reachIncrease: '25-40%',
          engagementIncrease: '30-50%'
        }
      };
    }
  }

  async optimizeAdCopy(
    originalCopy: string,
    objective: 'awareness' | 'engagement' | 'conversions' | 'traffic',
    targetAudience?: string
  ): Promise<{
    optimizedCopy: string;
    improvements: string[];
    expectedPerformance: string;
  }> {
    try {
      const prompt = `
        Optimize this Facebook ad copy for maximum performance:
        
        Original Copy: "${originalCopy}"
        Objective: ${objective}
        Target Audience: ${targetAudience || 'General'}
        
        Please provide:
        1. Optimized version of the copy
        2. List of key improvements made
        3. Expected performance improvement description
        
        Focus on:
        - Clear value proposition
        - Compelling call-to-action
        - Emotional triggers
        - Audience-specific language
        - Platform best practices
        
        Respond in JSON format with keys: optimizedCopy, improvements, expectedPerformance
      `;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const optimization = JSON.parse(response.content[0].text);
      return optimization;
    } catch (error) {
      console.error('Claude AI ad optimization error:', error);
      return {
        optimizedCopy: originalCopy,
        improvements: ['Unable to optimize at this time'],
        expectedPerformance: 'Performance data unavailable'
      };
    }
  }

  async generateCustomerResponse(
    customerMessage: string,
    context: string,
    tone: 'professional' | 'friendly' | 'helpful' | 'apologetic'
  ): Promise<{
    response: string;
    sentiment: string;
    urgency: 'low' | 'medium' | 'high';
    suggestedActions: string[];
  }> {
    try {
      const prompt = `
        Generate a customer service response for this message:
        
        Customer Message: "${customerMessage}"
        Context: ${context}
        Required Tone: ${tone}
        
        Please provide:
        1. A professional response
        2. Detected customer sentiment
        3. Urgency level assessment
        4. Suggested follow-up actions
        
        The response should be:
        - Empathetic and understanding
        - Solution-focused
        - Clear and concise
        - Appropriate to the tone requested
        
        Respond in JSON format with keys: response, sentiment, urgency, suggestedActions
      `;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const customerResponse = JSON.parse(response.content[0].text);
      return customerResponse;
    } catch (error) {
      console.error('Claude AI customer response error:', error);
      return {
        response: 'Thank you for your message. We appreciate your feedback and will address your concern promptly.',
        sentiment: 'neutral',
        urgency: 'medium',
        suggestedActions: ['Follow up within 24 hours']
      };
    }
  }

  async generateCompetitorInsights(
    competitorData: any[],
    industry: string
  ): Promise<{
    keyInsights: string[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Analyze competitor data and provide strategic insights:
        
        Competitor Data: ${JSON.stringify(competitorData)}
        Industry: ${industry}
        
        Please provide:
        1. Key insights from competitor analysis
        2. Market opportunities identified
        3. Potential threats to be aware of
        4. Strategic recommendations
        
        Focus on actionable intelligence that can drive business decisions and competitive advantage.
        
        Respond in JSON format with keys: keyInsights, opportunities, threats, recommendations
      `;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 700,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const insights = JSON.parse(response.content[0].text);
      return insights;
    } catch (error) {
      console.error('Claude AI competitor analysis error:', error);
      return {
        keyInsights: ['Competitive analysis data needs review'],
        opportunities: ['Further market research recommended'],
        threats: ['Monitor competitor activities closely'],
        recommendations: ['Develop unique value proposition']
      };
    }
  }

  async translateAndLocalizeContent(
    content: string,
    targetLanguage: string,
    culturalContext?: string
  ): Promise<{
    translatedContent: string;
    culturalAdaptations: string[];
    localizedHashtags: string[];
  }> {
    try {
      const prompt = `
        Translate and culturally adapt this content:
        
        Original Content: "${content}"
        Target Language: ${targetLanguage}
        Cultural Context: ${culturalContext || 'General'}
        
        Please provide:
        1. Accurate translation maintaining tone and intent
        2. Cultural adaptations made for local relevance
        3. Localized hashtags appropriate for the target market
        
        Ensure the translation:
        - Maintains the original message's impact
        - Uses culturally appropriate expressions
        - Considers local social media conventions
        - Optimizes for local engagement patterns
        
        Respond in JSON format with keys: translatedContent, culturalAdaptations, localizedHashtags
      `;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const translation = JSON.parse(response.content[0].text);
      return translation;
    } catch (error) {
      console.error('Claude AI translation error:', error);
      return {
        translatedContent: content,
        culturalAdaptations: ['Translation service temporarily unavailable'],
        localizedHashtags: ['#global']
      };
    }
  }

  private getSystemPrompt(
    contentType: string,
    brand?: string,
    audience?: string
  ): string {
    const basePrompt = `You are an expert social media content creator specializing in Facebook marketing.`;
    
    const typePrompts = {
      post: 'Create engaging Facebook posts that drive meaningful interaction and build community.',
      caption: 'Write compelling captions that enhance visual content and encourage engagement.',
      story: 'Develop authentic story content that creates personal connections with the audience.',
      ad_copy: 'Craft persuasive ad copy that drives conversions while maintaining authenticity.'
    };

    let prompt = `${basePrompt} ${typePrompts[contentType]}`;
    
    if (brand) {
      prompt += ` Keep the brand voice consistent with ${brand}'s identity and values.`;
    }
    
    if (audience) {
      prompt += ` Tailor the content specifically for ${audience}.`;
    }
    
    prompt += ' Focus on creating content that is authentic, engaging, and drives meaningful results.';
    
    return prompt;
  }
}

export const claudeAI = new ClaudeAIService();