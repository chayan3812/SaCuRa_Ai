/**
 * AI-Powered Facebook Content Optimizer
 * Integrates with advancedAdOptimizer.ts for intelligent content automation
 */

import { aiService } from './aiService';
import { facebookAPI } from './facebookAPIService';
import { storage } from './storage';
import { openaiService } from './openaiService';

interface ContentSuggestion {
  id: string;
  type: 'text' | 'image' | 'carousel' | 'link';
  content: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  carouselCards?: Array<{
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
  }>;
  confidence: number;
  performancePrediction: {
    expectedEngagement: number;
    expectedReach: number;
    expectedClicks: number;
  };
  reasoning: string;
  tags: string[];
  scheduledTime?: Date;
}

interface PerformanceMetrics {
  postId: string;
  engagement: number;
  reach: number;
  clicks: number;
  ctr: number;
  sentimentScore: number;
  creativeFatigueScore: number;
  performanceScore: number;
}

interface CreativeFatigueAnalysis {
  fatigueLevel: 'low' | 'medium' | 'high' | 'critical';
  fatigueScore: number;
  recommendations: string[];
  suggestedRefresh: boolean;
  timeToRefresh: number; // hours
}

export class AIContentOptimizer {
  private performanceThreshold = 0.7; // 70% performance threshold
  private creativeFatigueThreshold = 0.6; // 60% fatigue threshold
  private autoPublishConfidence = 0.85; // 85% confidence for auto-publish
  
  async analyzeCreativeFatigue(recentPosts: any[]): Promise<CreativeFatigueAnalysis> {
    try {
      // Analyze recent posts for creative patterns
      const contentPatterns = this.extractContentPatterns(recentPosts);
      const engagementTrend = this.calculateEngagementTrend(recentPosts);
      
      // Calculate fatigue score based on repetition and declining engagement
      const repetitionScore = this.calculateRepetitionScore(contentPatterns);
      const engagementDecline = Math.max(0, 1 - engagementTrend);
      const fatigueScore = (repetitionScore + engagementDecline) / 2;
      
      let fatigueLevel: 'low' | 'medium' | 'high' | 'critical';
      if (fatigueScore < 0.3) fatigueLevel = 'low';
      else if (fatigueScore < 0.5) fatigueLevel = 'medium';
      else if (fatigueScore < 0.8) fatigueLevel = 'high';
      else fatigueLevel = 'critical';
      
      const recommendations = this.generateFatigueRecommendations(fatigueLevel, contentPatterns);
      
      return {
        fatigueLevel,
        fatigueScore,
        recommendations,
        suggestedRefresh: fatigueScore > this.creativeFatigueThreshold,
        timeToRefresh: this.calculateTimeToRefresh(fatigueScore)
      };
    } catch (error) {
      console.error('Creative fatigue analysis error:', error);
      return {
        fatigueLevel: 'low',
        fatigueScore: 0,
        recommendations: [],
        suggestedRefresh: false,
        timeToRefresh: 24
      };
    }
  }

  async generateContentSuggestion(
    performanceData: PerformanceMetrics[],
    fatigueAnalysis: CreativeFatigueAnalysis,
    businessContext?: {
      industry?: string;
      targetAudience?: string;
      objectives?: string[];
      currentCampaigns?: string[];
    }
  ): Promise<ContentSuggestion> {
    try {
      // Analyze top-performing content patterns
      const topPerformers = performanceData
        .filter(p => p.performanceScore > this.performanceThreshold)
        .slice(0, 5);
      
      const contentAnalysis = await this.analyzeSuccessfulContent(topPerformers);
      
      // Generate AI-powered content suggestion
      const prompt = this.buildContentGenerationPrompt(
        contentAnalysis,
        fatigueAnalysis,
        businessContext
      );
      
      const aiResponse = await openaiService.generateResponse(prompt, 'content_generation');
      const suggestion = this.parseContentSuggestion(aiResponse);
      
      // Add performance prediction
      const performancePrediction = await this.predictContentPerformance(suggestion, topPerformers);
      
      return {
        ...suggestion,
        performancePrediction,
        confidence: this.calculateConfidenceScore(suggestion, contentAnalysis, fatigueAnalysis)
      };
    } catch (error) {
      console.error('Content suggestion generation error:', error);
      throw new Error('Failed to generate content suggestion');
    }
  }

  async autoPublishContent(
    suggestion: ContentSuggestion,
    forcePublish: boolean = false
  ): Promise<{ published: boolean; postId?: string; reason: string }> {
    try {
      // Check if auto-publish criteria are met
      if (!forcePublish && suggestion.confidence < this.autoPublishConfidence) {
        return {
          published: false,
          reason: `Confidence score ${suggestion.confidence.toFixed(2)} below threshold ${this.autoPublishConfidence}`
        };
      }
      
      let publishResult;
      
      switch (suggestion.type) {
        case 'text':
          publishResult = await facebookAPI.publishPost({ 
            message: suggestion.content 
          });
          break;
          
        case 'image':
          if (!suggestion.imageUrl) {
            throw new Error('Image URL required for image post');
          }
          publishResult = await facebookAPI.uploadMedia(suggestion.imageUrl, suggestion.content);
          break;
          
        case 'carousel':
          if (!suggestion.carouselCards) {
            throw new Error('Carousel cards required for carousel post');
          }
          publishResult = await facebookAPI.createCarouselPost(suggestion.content, suggestion.carouselCards);
          break;
          
        case 'link':
          if (!suggestion.linkUrl) {
            throw new Error('Link URL required for link post');
          }
          publishResult = await facebookAPI.createLinkPost(
            suggestion.content,
            suggestion.linkUrl,
            {
              title: suggestion.title,
              description: suggestion.description,
              imageUrl: suggestion.imageUrl
            }
          );
          break;
          
        default:
          throw new Error(`Unsupported post type: ${suggestion.type}`);
      }
      
      // Store content performance tracking
      await this.trackContentPerformance(suggestion, publishResult.id);
      
      return {
        published: true,
        postId: publishResult.id,
        reason: forcePublish ? 'Force published by user' : 'Auto-published based on high confidence score'
      };
    } catch (error) {
      console.error('Auto-publish error:', error);
      return {
        published: false,
        reason: `Publishing failed: ${error.message}`
      };
    }
  }

  async integrateWithAdOptimizer(
    campaignPerformance: any,
    adCreativeFatigue: any
  ): Promise<{
    shouldGenerateContent: boolean;
    contentSuggestions: ContentSuggestion[];
    autoPublishRecommendation: boolean;
  }> {
    try {
      // Analyze if content generation is needed based on ad performance
      const shouldGenerateContent = this.shouldTriggerContentGeneration(
        campaignPerformance,
        adCreativeFatigue
      );
      
      if (!shouldGenerateContent) {
        return {
          shouldGenerateContent: false,
          contentSuggestions: [],
          autoPublishRecommendation: false
        };
      }
      
      // Get recent posts for fatigue analysis
      const recentPosts = await facebookAPI.getRecentPosts(20);
      const performanceMetrics = await this.getPerformanceMetrics(recentPosts);
      const fatigueAnalysis = await this.analyzeCreativeFatigue(recentPosts);
      
      // Generate multiple content suggestions
      const suggestions = await Promise.all([
        this.generateContentSuggestion(performanceMetrics, fatigueAnalysis, {
          objectives: ['engagement', 'reach']
        }),
        this.generateContentSuggestion(performanceMetrics, fatigueAnalysis, {
          objectives: ['conversions', 'traffic']
        }),
        this.generateContentSuggestion(performanceMetrics, fatigueAnalysis, {
          objectives: ['brand_awareness', 'video_views']
        })
      ]);
      
      // Determine auto-publish recommendation
      const autoPublishRecommendation = suggestions.some(s => 
        s.confidence >= this.autoPublishConfidence &&
        fatigueAnalysis.fatigueLevel === 'high' || fatigueAnalysis.fatigueLevel === 'critical'
      );
      
      return {
        shouldGenerateContent: true,
        contentSuggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
        autoPublishRecommendation
      };
    } catch (error) {
      console.error('Ad optimizer integration error:', error);
      return {
        shouldGenerateContent: false,
        contentSuggestions: [],
        autoPublishRecommendation: false
      };
    }
  }

  private extractContentPatterns(posts: any[]): any {
    const patterns = {
      wordFrequency: {},
      hashtagFrequency: {},
      postTypes: {},
      postLength: [],
      timePatterns: {},
      engagementPatterns: {}
    };
    
    posts.forEach(post => {
      // Extract word patterns
      const words = post.message?.toLowerCase().split(/\s+/) || [];
      words.forEach(word => {
        if (word.length > 3) {
          patterns.wordFrequency[word] = (patterns.wordFrequency[word] || 0) + 1;
        }
      });
      
      // Extract hashtag patterns
      const hashtags = post.message?.match(/#\w+/g) || [];
      hashtags.forEach(tag => {
        patterns.hashtagFrequency[tag] = (patterns.hashtagFrequency[tag] || 0) + 1;
      });
      
      // Post characteristics
      patterns.postLength.push(post.message?.length || 0);
      
      const hour = new Date(post.created_time).getHours();
      patterns.timePatterns[hour] = (patterns.timePatterns[hour] || 0) + 1;
    });
    
    return patterns;
  }

  private calculateEngagementTrend(posts: any[]): number {
    if (posts.length < 2) return 1;
    
    const engagements = posts.map(post => {
      const likes = post.likes?.summary?.total_count || 0;
      const comments = post.comments?.summary?.total_count || 0;
      const shares = post.shares?.count || 0;
      return likes + comments * 2 + shares * 3; // Weighted engagement
    });
    
    // Calculate trend using linear regression
    const n = engagements.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = engagements;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Normalize slope to 0-1 range
    return Math.max(0, Math.min(1, (slope + 1) / 2));
  }

  private calculateRepetitionScore(patterns: any): number {
    const wordCounts = Object.values(patterns.wordFrequency) as number[];
    const hashtagCounts = Object.values(patterns.hashtagFrequency) as number[];
    
    const maxWordCount = Math.max(...wordCounts, 0);
    const maxHashtagCount = Math.max(...hashtagCounts, 0);
    
    // Higher repetition = higher score
    const wordRepetition = maxWordCount > 1 ? maxWordCount / wordCounts.length : 0;
    const hashtagRepetition = maxHashtagCount > 1 ? maxHashtagCount / hashtagCounts.length : 0;
    
    return Math.min(1, (wordRepetition + hashtagRepetition) / 2);
  }

  private generateFatigueRecommendations(fatigueLevel: string, patterns: any): string[] {
    const recommendations = [];
    
    switch (fatigueLevel) {
      case 'critical':
        recommendations.push('Immediate content refresh needed');
        recommendations.push('Try completely new content themes');
        recommendations.push('Experiment with different post formats');
        break;
      case 'high':
        recommendations.push('Consider refreshing content strategy');
        recommendations.push('Introduce new topics and themes');
        recommendations.push('Vary post timing and frequency');
        break;
      case 'medium':
        recommendations.push('Monitor engagement trends closely');
        recommendations.push('Introduce some content variety');
        break;
      case 'low':
        recommendations.push('Content performing well, maintain strategy');
        break;
    }
    
    // Add specific recommendations based on patterns
    const topWords = Object.entries(patterns.wordFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([word]) => word);
    
    if (topWords.length > 0) {
      recommendations.push(`Consider reducing use of: ${topWords.join(', ')}`);
    }
    
    return recommendations;
  }

  private calculateTimeToRefresh(fatigueScore: number): number {
    // Convert fatigue score to hours until refresh needed
    if (fatigueScore > 0.8) return 2; // Critical - immediate
    if (fatigueScore > 0.6) return 6; // High - within 6 hours
    if (fatigueScore > 0.4) return 24; // Medium - within a day
    return 72; // Low - within 3 days
  }

  private async analyzeSuccessfulContent(topPerformers: PerformanceMetrics[]): Promise<any> {
    // Analyze patterns in successful content
    const analysis = {
      commonThemes: [],
      optimalLength: 0,
      bestPostingTimes: [],
      successfulFormats: [],
      engagementDrivers: []
    };
    
    // This would involve more sophisticated analysis
    // For now, return basic structure
    return analysis;
  }

  private buildContentGenerationPrompt(
    contentAnalysis: any,
    fatigueAnalysis: CreativeFatigueAnalysis,
    businessContext?: any
  ): string {
    return `
Generate a high-performing Facebook post suggestion based on the following analysis:

Creative Fatigue Level: ${fatigueAnalysis.fatigueLevel}
Recommendations: ${fatigueAnalysis.recommendations.join(', ')}

Business Context:
${businessContext ? JSON.stringify(businessContext, null, 2) : 'General business'}

Requirements:
1. Create engaging, authentic content
2. Avoid overused patterns from fatigue analysis
3. Focus on driving engagement and reach
4. Include relevant hashtags (2-3 maximum)
5. Keep post length between 100-300 characters for optimal engagement

Response format:
{
  "type": "text|image|carousel|link",
  "content": "Main post text",
  "title": "Optional title for link posts",
  "description": "Optional description",
  "reasoning": "Why this content will perform well",
  "tags": ["relevant", "hashtags"],
  "imageUrl": "Optional image URL for image posts",
  "linkUrl": "Optional link URL"
}
    `;
  }

  private parseContentSuggestion(aiResponse: string): Partial<ContentSuggestion> {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: parsed.type || 'text',
        content: parsed.content,
        title: parsed.title,
        description: parsed.description,
        imageUrl: parsed.imageUrl,
        linkUrl: parsed.linkUrl,
        reasoning: parsed.reasoning || 'AI-generated content suggestion',
        tags: parsed.tags || []
      };
    } catch (error) {
      // Fallback parsing if JSON fails
      return {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        content: aiResponse.substring(0, 300),
        reasoning: 'AI-generated content suggestion',
        tags: []
      };
    }
  }

  private async predictContentPerformance(
    suggestion: Partial<ContentSuggestion>,
    topPerformers: PerformanceMetrics[]
  ): Promise<ContentSuggestion['performancePrediction']> {
    // Use historical data to predict performance
    const avgEngagement = topPerformers.reduce((sum, p) => sum + p.engagement, 0) / topPerformers.length || 100;
    const avgReach = topPerformers.reduce((sum, p) => sum + p.reach, 0) / topPerformers.length || 500;
    const avgClicks = topPerformers.reduce((sum, p) => sum + p.clicks, 0) / topPerformers.length || 20;
    
    // Apply modifiers based on content type and characteristics
    let engagementModifier = 1;
    let reachModifier = 1;
    let clickModifier = 1;
    
    if (suggestion.type === 'image') {
      engagementModifier = 1.3;
      reachModifier = 1.2;
    } else if (suggestion.type === 'carousel') {
      engagementModifier = 1.5;
      clickModifier = 1.4;
    } else if (suggestion.type === 'link') {
      clickModifier = 1.6;
      engagementModifier = 0.9;
    }
    
    return {
      expectedEngagement: Math.round(avgEngagement * engagementModifier),
      expectedReach: Math.round(avgReach * reachModifier),
      expectedClicks: Math.round(avgClicks * clickModifier)
    };
  }

  private calculateConfidenceScore(
    suggestion: Partial<ContentSuggestion>,
    contentAnalysis: any,
    fatigueAnalysis: CreativeFatigueAnalysis
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for addressing fatigue
    if (fatigueAnalysis.fatigueLevel === 'high' || fatigueAnalysis.fatigueLevel === 'critical') {
      confidence += 0.2;
    }
    
    // Boost for quality content characteristics
    if (suggestion.content && suggestion.content.length > 50 && suggestion.content.length < 300) {
      confidence += 0.1;
    }
    
    if (suggestion.tags && suggestion.tags.length > 0 && suggestion.tags.length <= 3) {
      confidence += 0.1;
    }
    
    if (suggestion.reasoning && suggestion.reasoning.length > 20) {
      confidence += 0.1;
    }
    
    return Math.min(1, confidence);
  }

  private shouldTriggerContentGeneration(campaignPerformance: any, adCreativeFatigue: any): boolean {
    // Logic to determine if content generation should be triggered
    // Based on ad performance drops or creative fatigue
    
    if (adCreativeFatigue?.fatigueLevel === 'high' || adCreativeFatigue?.fatigueLevel === 'critical') {
      return true;
    }
    
    if (campaignPerformance?.performanceScore < this.performanceThreshold) {
      return true;
    }
    
    if (campaignPerformance?.engagementDecline > 0.3) {
      return true;
    }
    
    return false;
  }

  private async getPerformanceMetrics(posts: any[]): Promise<PerformanceMetrics[]> {
    return posts.map(post => {
      const likes = post.likes?.summary?.total_count || 0;
      const comments = post.comments?.summary?.total_count || 0;
      const shares = post.shares?.count || 0;
      const engagement = likes + comments * 2 + shares * 3;
      
      return {
        postId: post.id,
        engagement,
        reach: engagement * 5, // Estimated reach
        clicks: engagement * 0.1, // Estimated clicks
        ctr: engagement > 0 ? (engagement * 0.1) / (engagement * 5) : 0,
        sentimentScore: 0.7, // Would be calculated from comments
        creativeFatigueScore: 0.3, // Would be calculated from content analysis
        performanceScore: Math.min(1, engagement / 100) // Normalized performance
      };
    });
  }

  private async trackContentPerformance(suggestion: ContentSuggestion, postId: string): Promise<void> {
    try {
      // Store content tracking in database for future optimization
      await storage.createContentTracking({
        postId,
        contentType: suggestion.type,
        aiGeneratedContent: suggestion.content,
        confidence: suggestion.confidence,
        predictedEngagement: suggestion.performancePrediction.expectedEngagement,
        predictedReach: suggestion.performancePrediction.expectedReach,
        predictedClicks: suggestion.performancePrediction.expectedClicks,
        reasoning: suggestion.reasoning,
        tags: suggestion.tags,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Content tracking error:', error);
      // Don't throw - tracking failure shouldn't stop publishing
    }
  }
}

export const aiContentOptimizer = new AIContentOptimizer();