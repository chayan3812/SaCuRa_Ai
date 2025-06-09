import OpenAI from 'openai';
import { storage } from './storage';
import { sendWebSocketMessage } from './websocket';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface AIInsight {
  type: 'performance' | 'content' | 'audience' | 'budget' | 'timing';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionableSteps: string[];
  expectedImpact: string;
  dataPoints: any[];
}

interface ContentSuggestion {
  type: 'post' | 'video' | 'story' | 'reel';
  content: string;
  hashtags: string[];
  targetAudience: string;
  optimalTiming: string;
  estimatedReach: number;
  engagementScore: number;
}

interface MarketTrend {
  trend: string;
  momentum: 'rising' | 'stable' | 'declining';
  relevanceScore: number;
  opportunities: string[];
  threats: string[];
  recommendedActions: string[];
}

export class AIEngine {
  
  async generateAdvancedInsights(userId: string, timeframe: string = '30d'): Promise<AIInsight[]> {
    try {
      // Gather comprehensive data
      const [analytics, contentPerformance, audienceData, competitorData] = await Promise.all([
        this.getAnalyticsData(userId, timeframe),
        this.getContentPerformanceData(userId, timeframe),
        this.getAudienceInsights(userId),
        this.getCompetitorIntelligence(userId)
      ]);

      const insights: AIInsight[] = [];

      // Performance Analysis
      const performanceInsight = await this.analyzePerformanceTrends(analytics);
      if (performanceInsight) insights.push(performanceInsight);

      // Content Strategy Analysis
      const contentInsight = await this.analyzeContentStrategy(contentPerformance);
      if (contentInsight) insights.push(contentInsight);

      // Audience Optimization
      const audienceInsight = await this.analyzeAudienceOptimization(audienceData);
      if (audienceInsight) insights.push(audienceInsight);

      // Budget Optimization
      const budgetInsight = await this.analyzeBudgetOptimization(analytics);
      if (budgetInsight) insights.push(budgetInsight);

      // Timing Optimization
      const timingInsight = await this.analyzeTimingOptimization(contentPerformance);
      if (timingInsight) insights.push(timingInsight);

      return insights.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [];
    }
  }

  async generateContentSuggestions(userId: string, contentType: string, targetAudience?: string): Promise<ContentSuggestion[]> {
    try {
      const audienceData = await this.getAudienceInsights(userId);
      const performanceData = await this.getContentPerformanceData(userId, '30d');
      const trends = await this.getMarketTrends(userId);

      const prompt = `
        Generate 5 high-performing ${contentType} content suggestions for a Facebook page.
        
        Audience Data: ${JSON.stringify(audienceData)}
        Performance History: ${JSON.stringify(performanceData)}
        Current Trends: ${JSON.stringify(trends)}
        Target Audience: ${targetAudience || 'general'}
        
        For each suggestion, provide:
        1. Engaging content text
        2. Relevant hashtags (5-10)
        3. Target audience description
        4. Optimal posting time
        5. Estimated reach potential
        6. Engagement score prediction (1-100)
        
        Focus on content that:
        - Aligns with current trends
        - Matches audience interests
        - Has high viral potential
        - Drives meaningful engagement
        
        Return as JSON array with proper structure.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const suggestions = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return suggestions.suggestions || [];

    } catch (error) {
      console.error('Error generating content suggestions:', error);
      return [];
    }
  }

  async detectMarketTrends(userId: string, industry?: string): Promise<MarketTrend[]> {
    try {
      const competitorData = await this.getCompetitorIntelligence(userId);
      const performanceData = await this.getContentPerformanceData(userId, '90d');

      const prompt = `
        Analyze market trends based on the following data:
        
        Competitor Intelligence: ${JSON.stringify(competitorData)}
        Performance Data: ${JSON.stringify(performanceData)}
        Industry: ${industry || 'general'}
        
        Identify 5-7 key market trends with:
        1. Trend description
        2. Momentum (rising/stable/declining)
        3. Relevance score (1-100)
        4. Business opportunities
        5. Potential threats
        6. Recommended actions
        
        Focus on actionable insights that can drive business growth.
        Return as JSON object with trends array.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{"trends": []}');
      return result.trends || [];

    } catch (error) {
      console.error('Error detecting market trends:', error);
      return [];
    }
  }

  async generateMultiLanguageContent(
    content: string, 
    targetLanguages: string[], 
    culturalAdaptation: boolean = true
  ): Promise<{ [language: string]: string }> {
    try {
      const translations: { [language: string]: string } = {};

      for (const language of targetLanguages) {
        const prompt = culturalAdaptation 
          ? `Translate and culturally adapt the following content for ${language} audience: "${content}". 
             Maintain the tone and intent while making it culturally relevant and engaging for local audience.`
          : `Translate the following content to ${language}, maintaining exact meaning: "${content}"`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        });

        translations[language] = response.choices[0].message.content || content;
      }

      return translations;

    } catch (error) {
      console.error('Error generating multi-language content:', error);
      return {};
    }
  }

  async analyzeSentimentTrends(userId: string, timeframe: string = '30d'): Promise<{
    overall: number;
    trend: 'improving' | 'stable' | 'declining';
    breakdown: { [sentiment: string]: number };
    insights: string[];
  }> {
    try {
      const interactions = await this.getCustomerInteractions(userId, timeframe);
      
      if (interactions.length === 0) {
        return {
          overall: 0,
          trend: 'stable',
          breakdown: { positive: 0, neutral: 0, negative: 0 },
          insights: ['No customer interactions found for analysis']
        };
      }

      const sentiments = interactions.map(i => i.sentiment).filter(Boolean);
      const breakdown = sentiments.reduce((acc, sentiment) => {
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const total = sentiments.length;
      const positive = breakdown.positive || 0;
      const negative = breakdown.negative || 0;
      const overall = total > 0 ? (positive - negative) / total : 0;

      // Determine trend by comparing recent vs older interactions
      const midpoint = Math.floor(interactions.length / 2);
      const recentSentiments = interactions.slice(0, midpoint);
      const olderSentiments = interactions.slice(midpoint);

      const recentScore = this.calculateSentimentScore(recentSentiments);
      const olderScore = this.calculateSentimentScore(olderSentiments);

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentScore > olderScore + 0.1) trend = 'improving';
      else if (recentScore < olderScore - 0.1) trend = 'declining';

      const insights = await this.generateSentimentInsights(breakdown, trend, overall);

      return {
        overall,
        trend,
        breakdown: {
          positive: Math.round((positive / total) * 100) || 0,
          neutral: Math.round(((breakdown.neutral || 0) / total) * 100) || 0,
          negative: Math.round((negative / total) * 100) || 0
        },
        insights
      };

    } catch (error) {
      console.error('Error analyzing sentiment trends:', error);
      return {
        overall: 0,
        trend: 'stable',
        breakdown: { positive: 0, neutral: 0, negative: 0 },
        insights: ['Error analyzing sentiment data']
      };
    }
  }

  async predictPerformance(userId: string, contentData: any): Promise<{
    reach: { min: number; max: number; expected: number };
    engagement: { min: number; max: number; expected: number };
    confidence: number;
    factors: string[];
  }> {
    try {
      const historicalData = await this.getContentPerformanceData(userId, '90d');
      const audienceData = await this.getAudienceInsights(userId);

      const prompt = `
        Predict performance for new content based on historical data:
        
        Content Data: ${JSON.stringify(contentData)}
        Historical Performance: ${JSON.stringify(historicalData)}
        Audience Data: ${JSON.stringify(audienceData)}
        
        Predict:
        1. Reach (min, max, expected)
        2. Engagement (min, max, expected)
        3. Confidence level (0-100)
        4. Key factors affecting performance
        
        Base predictions on data patterns and audience behavior.
        Return as JSON object.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const prediction = JSON.parse(response.choices[0].message.content || '{}');
      return prediction;

    } catch (error) {
      console.error('Error predicting performance:', error);
      return {
        reach: { min: 0, max: 0, expected: 0 },
        engagement: { min: 0, max: 0, expected: 0 },
        confidence: 0,
        factors: ['Insufficient data for prediction']
      };
    }
  }

  // Helper methods
  private async getAnalyticsData(userId: string, timeframe: string) {
    // Mock data - in production, this would fetch real analytics
    return {
      totalSpend: 2500,
      totalReach: 45000,
      totalEngagement: 3200,
      roas: 3.2,
      ctr: 2.8,
      conversions: 125
    };
  }

  private async getContentPerformanceData(userId: string, timeframe: string) {
    // Mock data - in production, this would fetch real content performance
    return [
      { id: '1', type: 'post', reach: 15000, engagement: 850, sentiment: 0.8 },
      { id: '2', type: 'video', reach: 25000, engagement: 1200, sentiment: 0.6 },
      { id: '3', type: 'story', reach: 8000, engagement: 400, sentiment: 0.9 }
    ];
  }

  private async getAudienceInsights(userId: string) {
    // Mock data - in production, this would fetch real audience data
    return {
      demographics: {
        age: { '25-34': 35, '35-44': 30, '18-24': 20, '45-54': 15 },
        gender: { female: 60, male: 38, other: 2 },
        location: { 'United States': 45, 'Canada': 20, 'UK': 15, 'Australia': 10, 'Other': 10 }
      },
      interests: ['Technology', 'Business', 'Lifestyle', 'Education'],
      peakActivityHours: [9, 10, 11, 19, 20, 21]
    };
  }

  private async getCompetitorIntelligence(userId: string) {
    // Mock data - in production, this would fetch real competitor data
    return [
      { name: 'Competitor A', engagement: 1500, reach: 30000, strategy: 'video-focused' },
      { name: 'Competitor B', engagement: 1200, reach: 25000, strategy: 'community-driven' }
    ];
  }

  private async getCustomerInteractions(userId: string, timeframe: string) {
    try {
      return await storage.getAllCustomerInteractionsByUser(userId, 100);
    } catch (error) {
      console.error('Error fetching customer interactions:', error);
      return [];
    }
  }

  private calculateSentimentScore(interactions: any[]): number {
    if (interactions.length === 0) return 0;
    
    const sentimentValues = interactions.map(i => {
      switch (i.sentiment) {
        case 'positive': return 1;
        case 'negative': return -1;
        default: return 0;
      }
    });

    return sentimentValues.reduce((sum, val) => sum + val, 0) / sentimentValues.length;
  }

  private async generateSentimentInsights(breakdown: any, trend: string, overall: number): Promise<string[]> {
    const insights = [];
    
    if (trend === 'improving') {
      insights.push('Customer sentiment is trending positively');
    } else if (trend === 'declining') {
      insights.push('Customer sentiment requires attention');
    }

    if (breakdown.negative > 30) {
      insights.push('High negative sentiment detected - review recent interactions');
    }

    if (breakdown.positive > 70) {
      insights.push('Strong positive sentiment - capitalize on customer satisfaction');
    }

    return insights;
  }

  private async analyzePerformanceTrends(analytics: any): Promise<AIInsight | null> {
    if (analytics.roas > 3.0) {
      return {
        type: 'performance',
        title: 'Strong ROAS Performance',
        description: `Current ROAS of ${analytics.roas}x exceeds industry benchmarks`,
        priority: 'high',
        confidence: 0.9,
        actionableSteps: [
          'Increase budget allocation to high-performing campaigns',
          'Expand successful ad creative formats',
          'Test scaling to similar audiences'
        ],
        expectedImpact: '15-25% increase in conversions',
        dataPoints: [{ metric: 'ROAS', value: analytics.roas, benchmark: 2.5 }]
      };
    }
    return null;
  }

  private async analyzeContentStrategy(contentData: any): Promise<AIInsight | null> {
    const videoContent = contentData.filter((c: any) => c.type === 'video');
    if (videoContent.length > 0) {
      const avgVideoEngagement = videoContent.reduce((sum: number, c: any) => sum + c.engagement, 0) / videoContent.length;
      
      return {
        type: 'content',
        title: 'Video Content Opportunity',
        description: 'Video content shows higher engagement rates',
        priority: 'medium',
        confidence: 0.8,
        actionableSteps: [
          'Increase video content frequency',
          'Test different video formats (reels, stories, long-form)',
          'Focus on educational and behind-the-scenes content'
        ],
        expectedImpact: '20-30% increase in engagement',
        dataPoints: [{ metric: 'Video Engagement', value: avgVideoEngagement }]
      };
    }
    return null;
  }

  private async analyzeAudienceOptimization(audienceData: any): Promise<AIInsight | null> {
    const topAgeGroup = Object.entries(audienceData.demographics.age)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    return {
      type: 'audience',
      title: 'Audience Targeting Optimization',
      description: `${topAgeGroup[0]} age group represents ${topAgeGroup[1]}% of your audience`,
      priority: 'medium',
      confidence: 0.85,
      actionableSteps: [
        `Focus ad targeting on ${topAgeGroup[0]} demographic`,
        'Create content that resonates with this age group',
        'Test lookalike audiences based on top performers'
      ],
      expectedImpact: '10-15% improvement in CTR',
      dataPoints: [{ metric: 'Top Age Group', value: topAgeGroup[0], percentage: topAgeGroup[1] }]
    };
  }

  private async analyzeBudgetOptimization(analytics: any): Promise<AIInsight | null> {
    if (analytics.ctr > 2.5) {
      return {
        type: 'budget',
        title: 'Budget Scaling Opportunity',
        description: `High CTR of ${analytics.ctr}% indicates strong ad relevance`,
        priority: 'high',
        confidence: 0.9,
        actionableSteps: [
          'Increase daily budget by 20-30%',
          'Expand to additional placements',
          'Test budget allocation across different time periods'
        ],
        expectedImpact: 'Potential 25-40% increase in conversions',
        dataPoints: [{ metric: 'CTR', value: analytics.ctr, benchmark: 1.8 }]
      };
    }
    return null;
  }

  private async analyzeTimingOptimization(contentData: any): Promise<AIInsight | null> {
    return {
      type: 'timing',
      title: 'Optimal Posting Schedule',
      description: 'Peak engagement occurs during evening hours',
      priority: 'medium',
      confidence: 0.75,
      actionableSteps: [
        'Schedule more posts between 7-9 PM',
        'Test posting frequency during peak hours',
        'Adjust timezone targeting for global audiences'
      ],
      expectedImpact: '5-15% increase in organic reach',
      dataPoints: [{ metric: 'Peak Hour', value: '8 PM', engagement: '35% higher' }]
    };
  }
}

export const aiEngine = new AIEngine();