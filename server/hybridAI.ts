import { claudeAI } from './claudeAI';
import { 
  generateCustomerServiceResponse,
  generateAdOptimizationSuggestions,
  checkPolicyCompliance,
  generateAdCopy,
  analyzeSentiment,
  generateFacebookPost,
  analyzePostContent,
  generateSEOOptimizedContent
} from './openai';

interface AIProvider {
  name: 'openai' | 'claude';
  available: boolean;
  responseTime: number;
  errorRate: number;
}

interface HybridAIConfig {
  primaryProvider: 'openai' | 'claude';
  fallbackEnabled: boolean;
  loadBalancing: boolean;
  qualityThreshold: number;
}

export class HybridAIEngine {
  private providers: Map<string, AIProvider> = new Map();
  private config: HybridAIConfig;
  
  constructor(config: HybridAIConfig = {
    primaryProvider: 'openai',
    fallbackEnabled: true,
    loadBalancing: true,
    qualityThreshold: 0.8
  }) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    this.providers.set('openai', {
      name: 'openai',
      available: true,
      responseTime: 0,
      errorRate: 0
    });
    
    this.providers.set('claude', {
      name: 'claude',
      available: true,
      responseTime: 0,
      errorRate: 0
    });
  }

  // Enhanced content generation with AI provider selection
  async generateEnhancedContent(
    prompt: string,
    contentType: 'post' | 'ad' | 'response' | 'story',
    options: {
      brand?: string;
      audience?: string;
      tone?: string;
      length?: 'short' | 'medium' | 'long';
    } = {}
  ): Promise<{
    content: string;
    provider: string;
    confidence: number;
    alternatives?: string[];
  }> {
    const provider = this.selectOptimalProvider();
    
    try {
      if (provider === 'claude') {
        const result = await claudeAI.generateContent(
          prompt,
          contentType === 'ad' ? 'ad_copy' : contentType,
          options.brand,
          options.audience
        );
        
        // Get alternative from OpenAI if quality is high enough
        let alternatives = [];
        if (result.confidence > this.config.qualityThreshold && this.config.loadBalancing) {
          try {
            const openaiResult = await this.generateWithOpenAI(prompt, contentType, options);
            alternatives.push(openaiResult);
          } catch (error) {
            console.log('OpenAI alternative generation failed:', error);
          }
        }
        
        return {
          content: result.content,
          provider: 'claude',
          confidence: result.confidence,
          alternatives
        };
      } else {
        const openaiResult = await this.generateWithOpenAI(prompt, contentType, options);
        
        // Get alternative from Claude if enabled
        let alternatives = [];
        if (this.config.loadBalancing) {
          try {
            const claudeResult = await claudeAI.generateContent(
              prompt,
              contentType === 'ad' ? 'ad_copy' : contentType,
              options.brand,
              options.audience
            );
            alternatives.push(claudeResult.content);
          } catch (error) {
            console.log('Claude alternative generation failed:', error);
          }
        }
        
        return {
          content: openaiResult,
          provider: 'openai',
          confidence: 0.9,
          alternatives
        };
      }
    } catch (error) {
      console.error(`Primary provider ${provider} failed:`, error);
      
      if (this.config.fallbackEnabled) {
        const fallbackProvider = provider === 'claude' ? 'openai' : 'claude';
        console.log(`Falling back to ${fallbackProvider}`);
        
        try {
          if (fallbackProvider === 'claude') {
            const result = await claudeAI.generateContent(
              prompt,
              contentType === 'ad' ? 'ad_copy' : contentType,
              options.brand,
              options.audience
            );
            return {
              content: result.content,
              provider: 'claude',
              confidence: result.confidence * 0.9, // Slight penalty for fallback
              alternatives: []
            };
          } else {
            const result = await this.generateWithOpenAI(prompt, contentType, options);
            return {
              content: result,
              provider: 'openai',
              confidence: 0.85,
              alternatives: []
            };
          }
        } catch (fallbackError) {
          console.error('Fallback provider also failed:', fallbackError);
          throw new Error('Both AI providers are currently unavailable');
        }
      } else {
        throw error;
      }
    }
  }

  // Enhanced customer service with dual AI processing
  async generateCustomerServiceResponse(
    message: string,
    context: string,
    tone: 'professional' | 'friendly' | 'helpful' | 'apologetic' = 'professional'
  ): Promise<{
    response: string;
    sentiment: string;
    urgency: 'low' | 'medium' | 'high';
    confidence: number;
    provider: string;
    alternatives?: any[];
  }> {
    try {
      // Get responses from both providers for comparison
      const [claudeResult, openaiResult] = await Promise.allSettled([
        claudeAI.generateCustomerResponse(message, context, tone),
        generateCustomerServiceResponse(message, context, tone)
      ]);

      let primaryResult, alternatives = [];
      
      if (claudeResult.status === 'fulfilled' && openaiResult.status === 'fulfilled') {
        // Both succeeded - use Claude as primary, OpenAI as alternative
        primaryResult = {
          ...claudeResult.value,
          provider: 'claude',
          confidence: 0.95
        };
        alternatives.push({
          ...openaiResult.value,
          provider: 'openai'
        });
      } else if (claudeResult.status === 'fulfilled') {
        // Only Claude succeeded
        primaryResult = {
          ...claudeResult.value,
          provider: 'claude',
          confidence: 0.9
        };
      } else if (openaiResult.status === 'fulfilled') {
        // Only OpenAI succeeded
        primaryResult = {
          ...openaiResult.value,
          provider: 'openai',
          confidence: 0.85
        };
      } else {
        throw new Error('Both AI providers failed to generate customer response');
      }

      return {
        ...primaryResult,
        alternatives
      };
    } catch (error) {
      console.error('Hybrid customer service response failed:', error);
      throw error;
    }
  }

  // Enhanced content analysis with cross-validation
  async analyzeContentAdvanced(content: string): Promise<{
    analysis: any;
    crossValidation: any;
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const [claudeAnalysis, openaiAnalysis] = await Promise.allSettled([
        claudeAI.analyzeContent(content),
        analyzePostContent(content)
      ]);

      let primaryAnalysis, crossValidation;
      
      if (claudeAnalysis.status === 'fulfilled' && openaiAnalysis.status === 'fulfilled') {
        primaryAnalysis = claudeAnalysis.value;
        crossValidation = openaiAnalysis.value;
        
        // Generate consensus recommendations
        const recommendations = this.generateConsensusRecommendations(
          primaryAnalysis.improvementSuggestions,
          crossValidation.improvementSuggestions
        );
        
        return {
          analysis: primaryAnalysis,
          crossValidation,
          confidence: 0.95,
          recommendations
        };
      } else if (claudeAnalysis.status === 'fulfilled') {
        return {
          analysis: claudeAnalysis.value,
          crossValidation: null,
          confidence: 0.8,
          recommendations: claudeAnalysis.value.improvementSuggestions
        };
      } else if (openaiAnalysis.status === 'fulfilled') {
        return {
          analysis: {
            sentiment: openaiAnalysis.value.sentiment,
            readabilityScore: openaiAnalysis.value.readabilityScore,
            engagementPrediction: 75,
            improvementSuggestions: openaiAnalysis.value.improvementSuggestions
          },
          crossValidation: null,
          confidence: 0.8,
          recommendations: openaiAnalysis.value.improvementSuggestions
        };
      } else {
        throw new Error('Content analysis failed on both providers');
      }
    } catch (error) {
      console.error('Hybrid content analysis failed:', error);
      throw error;
    }
  }

  // Enhanced ad optimization with dual AI insights
  async optimizeAdCampaign(
    adCopy: string,
    objective: 'awareness' | 'engagement' | 'conversions' | 'traffic',
    targetAudience?: string
  ): Promise<{
    optimizedCopy: string;
    improvements: string[];
    expectedPerformance: string;
    alternatives: any[];
    confidence: number;
  }> {
    try {
      const [claudeOptimization, openaiSuggestions] = await Promise.allSettled([
        claudeAI.optimizeAdCopy(adCopy, objective, targetAudience),
        generateAdOptimizationSuggestions(adCopy, objective, { targetAudience })
      ]);

      if (claudeOptimization.status === 'fulfilled' && openaiSuggestions.status === 'fulfilled') {
        return {
          optimizedCopy: claudeOptimization.value.optimizedCopy,
          improvements: claudeOptimization.value.improvements,
          expectedPerformance: claudeOptimization.value.expectedPerformance,
          alternatives: openaiSuggestions.value,
          confidence: 0.95
        };
      } else if (claudeOptimization.status === 'fulfilled') {
        return {
          ...claudeOptimization.value,
          alternatives: [],
          confidence: 0.85
        };
      } else {
        throw new Error('Ad optimization failed');
      }
    } catch (error) {
      console.error('Hybrid ad optimization failed:', error);
      throw error;
    }
  }

  // Multi-language content generation with cultural adaptation
  async generateMultiLanguageContent(
    content: string,
    targetLanguages: string[],
    culturalAdaptation: boolean = true
  ): Promise<{
    translations: { [language: string]: any };
    quality: { [language: string]: number };
    provider: string;
  }> {
    const translations: { [language: string]: any } = {};
    const quality: { [language: string]: number } = {};

    for (const language of targetLanguages) {
      try {
        const result = await claudeAI.translateAndLocalizeContent(
          content,
          language,
          culturalAdaptation ? 'Culturally adapted' : 'Direct translation'
        );
        
        translations[language] = result;
        quality[language] = culturalAdaptation ? 0.9 : 0.8;
      } catch (error) {
        console.error(`Translation failed for ${language}:`, error);
        translations[language] = {
          translatedContent: content,
          culturalAdaptations: ['Translation unavailable'],
          localizedHashtags: ['#global']
        };
        quality[language] = 0.3;
      }
    }

    return {
      translations,
      quality,
      provider: 'claude'
    };
  }

  // Performance monitoring and provider selection
  private selectOptimalProvider(): 'openai' | 'claude' {
    if (!this.config.loadBalancing) {
      return this.config.primaryProvider;
    }

    const openaiProvider = this.providers.get('openai')!;
    const claudeProvider = this.providers.get('claude')!;

    // Simple load balancing based on availability and performance
    if (!openaiProvider.available) return 'claude';
    if (!claudeProvider.available) return 'openai';

    // Select based on performance metrics
    const openaiScore = 1 / (openaiProvider.responseTime + 1) * (1 - openaiProvider.errorRate);
    const claudeScore = 1 / (claudeProvider.responseTime + 1) * (1 - claudeProvider.errorRate);

    return claudeScore > openaiScore ? 'claude' : 'openai';
  }

  private async generateWithOpenAI(
    prompt: string,
    contentType: string,
    options: any
  ): Promise<string> {
    switch (contentType) {
      case 'post':
        const postResult = await generateFacebookPost(
          prompt,
          options.audience || 'general',
          options.tone || 'professional'
        );
        return postResult.content;
      
      case 'ad':
        return await generateAdCopy(
          prompt,
          options.audience || 'general',
          'awareness'
        );
      
      default:
        const seoResult = await generateSEOOptimizedContent(
          prompt,
          options.audience || 'general'
        );
        return seoResult.content;
    }
  }

  private generateConsensusRecommendations(
    claudeRecs: string[],
    openaiRecs: string[]
  ): string[] {
    const allRecs = [...claudeRecs, ...openaiRecs];
    const consensus = [];
    
    // Find common themes
    for (const rec of claudeRecs) {
      const similar = openaiRecs.find(openaiRec => 
        this.calculateSimilarity(rec, openaiRec) > 0.6
      );
      
      if (similar) {
        consensus.push(`${rec} (Cross-validated)`);
      } else {
        consensus.push(rec);
      }
    }
    
    // Add unique OpenAI recommendations
    for (const rec of openaiRecs) {
      const alreadyIncluded = claudeRecs.some(claudeRec => 
        this.calculateSimilarity(rec, claudeRec) > 0.6
      );
      
      if (!alreadyIncluded) {
        consensus.push(rec);
      }
    }
    
    return consensus.slice(0, 8); // Limit to top 8 recommendations
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  // Health monitoring
  public getProviderHealth(): { [provider: string]: AIProvider } {
    return Object.fromEntries(this.providers);
  }

  public updateProviderMetrics(provider: string, responseTime: number, success: boolean) {
    const providerData = this.providers.get(provider);
    if (providerData) {
      providerData.responseTime = (providerData.responseTime + responseTime) / 2;
      providerData.errorRate = success 
        ? Math.max(0, providerData.errorRate - 0.01)
        : Math.min(1, providerData.errorRate + 0.05);
      providerData.available = providerData.errorRate < 0.5;
    }
  }
}

export const hybridAI = new HybridAIEngine();