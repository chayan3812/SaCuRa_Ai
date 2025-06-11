import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface HybridAIResponse {
  primary: {
    content: string;
    confidence: number;
    model: string;
    source: 'claude' | 'openai';
  };
  secondary?: {
    content: string;
    confidence: number;
    model: string;
    source: 'claude' | 'openai';
  };
  consensus?: {
    content: string;
    confidence: number;
    agreement: number;
  };
  performance: {
    responseTime: number;
    tokensUsed: number;
    cost: number;
  };
}

export interface AITaskOptimization {
  taskType: 'content' | 'analysis' | 'strategy' | 'prediction' | 'creative';
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  preferredModel: 'claude' | 'openai' | 'hybrid';
  reasoning: string;
}

export class HybridAIEngine {
  private performanceHistory: Map<string, any[]> = new Map();
  private modelPreferences: Map<string, string> = new Map();

  constructor() {
    this.initializeModelPreferences();
  }

  private initializeModelPreferences(): void {
    // Claude excels at: Analysis, reasoning, creative writing, strategy
    this.modelPreferences.set('content_analysis', 'claude');
    this.modelPreferences.set('sentiment_analysis', 'claude');
    this.modelPreferences.set('strategic_planning', 'claude');
    this.modelPreferences.set('creative_writing', 'claude');
    this.modelPreferences.set('competitive_analysis', 'claude');
    
    // OpenAI excels at: Code generation, technical tasks, structured data
    this.modelPreferences.set('data_processing', 'openai');
    this.modelPreferences.set('json_generation', 'openai');
    this.modelPreferences.set('technical_analysis', 'openai');
    this.modelPreferences.set('structured_output', 'openai');
    
    // Hybrid for: Complex decision making, multi-perspective analysis
    this.modelPreferences.set('campaign_optimization', 'hybrid');
    this.modelPreferences.set('audience_targeting', 'hybrid');
    this.modelPreferences.set('crisis_management', 'hybrid');
  }

  async generateContent(
    prompt: string,
    taskType: string,
    options: {
      useHybrid?: boolean;
      requireConsensus?: boolean;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<HybridAIResponse> {
    const startTime = Date.now();
    const preferredModel = this.modelPreferences.get(taskType) || 'claude';
    const useHybrid = options.useHybrid || preferredModel === 'hybrid';

    try {
      if (useHybrid) {
        return await this.generateHybridResponse(prompt, options);
      } else if (preferredModel === 'claude') {
        return await this.generateClaudeResponse(prompt, options);
      } else {
        return await this.generateOpenAIResponse(prompt, options);
      }
    } catch (error) {
      console.error('Hybrid AI generation error:', error);
      // Fallback to working model
      return await this.generateFallbackResponse(prompt, options);
    }
  }

  private async generateClaudeResponse(
    prompt: string,
    options: any
  ): Promise<HybridAIResponse> {
    const startTime = Date.now();
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      primary: {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        confidence: 0.95,
        model: 'claude-sonnet-4-20250514',
        source: 'claude'
      },
      performance: {
        responseTime: Date.now() - startTime,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        cost: this.calculateCost('claude', response.usage.input_tokens, response.usage.output_tokens)
      }
    };
  }

  private async generateOpenAIResponse(
    prompt: string,
    options: any
  ): Promise<HybridAIResponse> {
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      primary: {
        content: response.choices[0].message.content || '',
        confidence: 0.90,
        model: 'gpt-4o',
        source: 'openai'
      },
      performance: {
        responseTime: Date.now() - startTime,
        tokensUsed: response.usage?.total_tokens || 0,
        cost: this.calculateCost('openai', response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0)
      }
    };
  }

  private async generateHybridResponse(
    prompt: string,
    options: any
  ): Promise<HybridAIResponse> {
    const startTime = Date.now();
    
    // Generate responses from both models in parallel
    const [claudeResponse, openaiResponse] = await Promise.allSettled([
      this.generateClaudeResponse(prompt, options),
      this.generateOpenAIResponse(prompt, options)
    ]);

    const claudeResult = claudeResponse.status === 'fulfilled' ? claudeResponse.value : null;
    const openaiResult = openaiResponse.status === 'fulfilled' ? openaiResponse.value : null;

    if (!claudeResult && !openaiResult) {
      throw new Error('Both AI models failed to respond');
    }

    if (!claudeResult) return openaiResult!;
    if (!openaiResult) return claudeResult!;

    // Generate consensus if both succeeded
    const consensus = options.requireConsensus ? 
      await this.generateConsensus(claudeResult.primary.content, openaiResult.primary.content) : 
      undefined;

    // Choose primary based on confidence and task optimization
    const primary = claudeResult.primary.confidence >= openaiResult.primary.confidence ? 
      claudeResult.primary : openaiResult.primary;
    const secondary = claudeResult.primary.confidence >= openaiResult.primary.confidence ? 
      openaiResult.primary : claudeResult.primary;

    return {
      primary,
      secondary,
      consensus,
      performance: {
        responseTime: Date.now() - startTime,
        tokensUsed: (claudeResult.performance.tokensUsed || 0) + (openaiResult.performance.tokensUsed || 0),
        cost: (claudeResult.performance.cost || 0) + (openaiResult.performance.cost || 0)
      }
    };
  }

  private async generateConsensus(claudeContent: string, openaiContent: string): Promise<any> {
    try {
      const consensusPrompt = `
Analyze these two AI responses and create a consensus that combines the best elements of both:

Response A (Claude): ${claudeContent}

Response B (OpenAI): ${openaiContent}

Create a unified response that:
1. Incorporates the strongest points from both
2. Resolves any contradictions
3. Provides the most comprehensive and accurate answer
4. Maintains consistency in tone and style

Consensus Response:`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: consensusPrompt }]
      });

      const agreement = this.calculateAgreement(claudeContent, openaiContent);
      
      return {
        content: response.content[0].text,
        confidence: 0.98,
        agreement
      };
    } catch (error) {
      return undefined;
    }
  }

  private calculateAgreement(content1: string, content2: string): number {
    // Simple similarity calculation based on common words and phrases
    const words1 = content1.toLowerCase().split(/\s+/);
    const words2 = content2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return Math.round((commonWords.length / Math.max(words1.length, words2.length)) * 100) / 100;
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Approximate pricing (update with actual rates)
    if (model === 'claude') {
      return (inputTokens * 0.000003) + (outputTokens * 0.000015); // Claude Sonnet pricing
    } else {
      return (inputTokens * 0.000005) + (outputTokens * 0.000015); // GPT-4o pricing
    }
  }

  private async generateFallbackResponse(prompt: string, options: any): Promise<HybridAIResponse> {
    // Try OpenAI first as fallback, then Claude
    try {
      return await this.generateOpenAIResponse(prompt, options);
    } catch (openaiError) {
      try {
        return await this.generateClaudeResponse(prompt, options);
      } catch (claudeError) {
        throw new Error('All AI models failed');
      }
    }
  }

  // Enhanced Content Generation
  async generateMarketingContent(
    contentType: 'ad_copy' | 'social_post' | 'email' | 'blog',
    brand: string,
    audience: string,
    goals: string[]
  ): Promise<HybridAIResponse> {
    const prompt = `Create ${contentType} for ${brand} targeting ${audience} with goals: ${goals.join(', ')}. 
    Make it engaging, conversion-focused, and platform-optimized.`;
    
    return await this.generateContent(prompt, 'creative_writing', { 
      useHybrid: true, 
      requireConsensus: true 
    });
  }

  // Advanced Sentiment Analysis
  async analyzeSentimentAdvanced(text: string, context?: string): Promise<HybridAIResponse> {
    const prompt = `Perform deep sentiment analysis on: "${text}"
    ${context ? `Context: ${context}` : ''}
    
    Provide:
    1. Overall sentiment (positive/negative/neutral) with confidence
    2. Emotional breakdown (joy, anger, fear, sadness, surprise, disgust)
    3. Intent analysis (complaint, praise, inquiry, request)
    4. Urgency level (low/medium/high/critical)
    5. Recommended response strategy
    
    Format as structured analysis.`;
    
    return await this.generateContent(prompt, 'sentiment_analysis', { useHybrid: true });
  }

  // Strategic Campaign Optimization
  async optimizeCampaignStrategy(
    campaignData: any,
    performanceMetrics: any,
    competitorData: any
  ): Promise<HybridAIResponse> {
    const prompt = `Analyze and optimize this campaign:
    
    Campaign: ${JSON.stringify(campaignData, null, 2)}
    Performance: ${JSON.stringify(performanceMetrics, null, 2)}
    Competitors: ${JSON.stringify(competitorData, null, 2)}
    
    Provide:
    1. Performance analysis
    2. Optimization recommendations
    3. Budget reallocation suggestions
    4. Targeting improvements
    5. Creative suggestions
    6. Expected ROI improvements
    
    Focus on actionable insights and measurable improvements.`;
    
    return await this.generateContent(prompt, 'campaign_optimization', { 
      useHybrid: true, 
      requireConsensus: true 
    });
  }

  // Predictive Analytics
  async generatePredictions(
    historicalData: any,
    marketTrends: any,
    predictionType: 'performance' | 'budget' | 'audience' | 'content'
  ): Promise<HybridAIResponse> {
    const prompt = `Generate ${predictionType} predictions based on:
    
    Historical Data: ${JSON.stringify(historicalData, null, 2)}
    Market Trends: ${JSON.stringify(marketTrends, null, 2)}
    
    Provide:
    1. Key predictions with confidence levels
    2. Supporting data analysis
    3. Risk factors and mitigation strategies
    4. Recommended actions
    5. Timeline for expected changes
    
    Focus on actionable insights with quantifiable predictions.`;
    
    return await this.generateContent(prompt, 'prediction', { useHybrid: true });
  }

  // Performance Tracking
  trackModelPerformance(taskType: string, response: HybridAIResponse, userFeedback?: number): void {
    const history = this.performanceHistory.get(taskType) || [];
    history.push({
      timestamp: new Date(),
      response,
      userFeedback,
      cost: response.performance.cost,
      responseTime: response.performance.responseTime
    });
    this.performanceHistory.set(taskType, history.slice(-100)); // Keep last 100
  }

  // Get optimization recommendations
  getModelOptimizations(): any {
    const optimizations = [];
    
    this.performanceHistory.forEach((history, taskType) => {
      if (history.length >= 5) {
        const avgCost = history.reduce((sum, h) => sum + h.cost, 0) / history.length;
        const avgTime = history.reduce((sum, h) => sum + h.response.performance.responseTime, 0) / history.length;
        const avgFeedback = history.filter(h => h.userFeedback).reduce((sum, h) => sum + h.userFeedback, 0) / 
                           history.filter(h => h.userFeedback).length || 0;
        
        optimizations.push({
          taskType,
          currentModel: this.modelPreferences.get(taskType),
          avgCost,
          avgTime,
          avgFeedback,
          recommendation: this.getOptimizationRecommendation(taskType, avgCost, avgTime, avgFeedback)
        });
      }
    });
    
    return optimizations;
  }

  private getOptimizationRecommendation(taskType: string, cost: number, time: number, feedback: number): string {
    if (feedback < 3 && cost > 0.01) return `Consider switching to more cost-effective model for ${taskType}`;
    if (time > 5000) return `Optimize response time for ${taskType} tasks`;
    if (feedback > 4) return `Current model performing well for ${taskType}`;
    return `Monitor performance for ${taskType}`;
  }
}

export const hybridAI = new HybridAIEngine();