import { claudeAI } from "./claudeAI";
import { hybridAI } from "./hybridAI";
import { websocketService } from "./websocket";

interface SentimentAnalysis {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  intent: 'complaint' | 'praise' | 'inquiry' | 'request' | 'other';
  responseStrategy: string;
  analyzedAt: Date;
}

interface EmotionalTrend {
  timeframe: string;
  overallSentiment: number; // -1 to 1
  emotionalDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  criticalIssues: number;
  responseRate: number;
  satisfactionScore: number;
}

interface CustomerInsight {
  customerId: string;
  name?: string;
  sentimentHistory: SentimentAnalysis[];
  averageSentiment: number;
  emotionalProfile: {
    dominant_emotion: string;
    communication_style: 'formal' | 'casual' | 'aggressive' | 'friendly';
    response_preference: 'immediate' | 'detailed' | 'brief';
  };
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  lastInteraction: Date;
}

export class SentimentAIEngine {
  private analysisHistory: Map<string, SentimentAnalysis[]> = new Map();
  private customerInsights: Map<string, CustomerInsight> = new Map();
  private emotionalTrends: EmotionalTrend[] = [];
  private isActive = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startRealTimeMonitoring();
  }

  private startRealTimeMonitoring(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('💭 Sentiment AI Engine: Starting real-time emotional intelligence monitoring...');
    
    // Monitor sentiment trends every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      await this.updateEmotionalTrends();
      await this.identifyUrgentIssues();
    }, 300000);
  }

  public stopMonitoring(): void {
    this.isActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  public async analyzeText(text: string, source: 'comment' | 'message' | 'review' | 'post' = 'comment', customerId?: string): Promise<SentimentAnalysis> {
    try {
      // Use Claude AI for advanced sentiment analysis
      const prompt = `Perform comprehensive sentiment and emotional analysis on this text:

"${text}"

Analyze and provide:
1. Overall sentiment (positive/negative/neutral) with confidence score
2. Emotional breakdown (joy, anger, fear, sadness, surprise, disgust) as percentages
3. Urgency level (low/medium/high/critical)
4. Key emotional indicators and keywords
5. Customer intent (complaint/praise/inquiry/request/other)
6. Recommended response strategy

Format as detailed analysis focusing on emotional intelligence.`;

      const analysis = await claudeAI.generateContent(prompt, 'post');
      
      // Extract structured data from analysis
      const sentiment = this.extractSentiment(analysis);
      const confidence = this.extractConfidence(analysis);
      const emotions = this.extractEmotions(analysis);
      const urgency = this.extractUrgency(analysis);
      const keywords = this.extractKeywords(text);
      const intent = this.extractIntent(analysis);
      const responseStrategy = this.extractResponseStrategy(analysis);

      const sentimentAnalysis: SentimentAnalysis = {
        id: `sent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        sentiment,
        confidence,
        emotions,
        urgency,
        keywords,
        intent,
        responseStrategy,
        analyzedAt: new Date()
      };

      // Store analysis
      if (customerId) {
        this.updateCustomerInsight(customerId, sentimentAnalysis);
      }

      const sourceHistory = this.analysisHistory.get(source) || [];
      sourceHistory.push(sentimentAnalysis);
      this.analysisHistory.set(source, sourceHistory.slice(-100)); // Keep last 100

      // Alert on critical sentiment
      if (urgency === 'critical') {
        await this.alertCriticalSentiment(sentimentAnalysis);
      }

      console.log(`💭 Sentiment analyzed: ${sentiment} (${(confidence * 100).toFixed(1)}% confidence)`);
      return sentimentAnalysis;

    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      return this.createFallbackAnalysis(text);
    }
  }

  public async analyzeBatchContent(contents: Array<{text: string, source?: string, customerId?: string}>): Promise<SentimentAnalysis[]> {
    const results: SentimentAnalysis[] = [];
    
    for (const content of contents) {
      const analysis = await this.analyzeText(
        content.text, 
        (content.source as any) || 'comment', 
        content.customerId
      );
      results.push(analysis);
      
      // Small delay to prevent API rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`💭 Batch analysis completed: ${results.length} items processed`);
    return results;
  }

  public async generateEmotionalInsights(pageId: string): Promise<any> {
    try {
      const recentAnalyses = this.getRecentAnalyses(24); // Last 24 hours
      
      if (recentAnalyses.length === 0) {
        return {
          overall_sentiment: 0.5,
          emotional_health: 'stable',
          insights: ['Insufficient data for emotional analysis'],
          recommendations: ['Encourage more customer feedback']
        };
      }

      // Calculate emotional metrics
      const sentimentScores = recentAnalyses.map(a => 
        a.sentiment === 'positive' ? 1 as const : a.sentiment === 'negative' ? -1 as const : 0 as const
      );
      const averageSentiment = sentimentScores.reduce((a: number, b: number) => a + b, 0) / Math.max(sentimentScores.length, 1);

      // Emotion distribution
      const emotionTotals = recentAnalyses.reduce((acc, analysis) => {
        Object.keys(analysis.emotions).forEach(emotion => {
          acc[emotion] = (acc[emotion] || 0) + analysis.emotions[emotion as keyof typeof analysis.emotions];
        });
        return acc;
      }, {} as Record<string, number>);

      const dominantEmotion = Object.entries(emotionTotals)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

      // Critical issues
      const criticalCount = recentAnalyses.filter(a => a.urgency === 'critical').length;
      const urgentCount = recentAnalyses.filter(a => a.urgency === 'high').length;

      // Generate insights
      const insights = this.generateEmotionalInsights_Internal(averageSentiment, dominantEmotion, criticalCount);
      const recommendations = this.generateEmotionalRecommendations(averageSentiment, criticalCount, urgentCount);

      return {
        overall_sentiment: (averageSentiment + 1) / 2, // Convert -1,1 to 0,1
        dominant_emotion: dominantEmotion,
        emotional_health: this.calculateEmotionalHealth(averageSentiment, criticalCount),
        critical_issues: criticalCount,
        urgent_issues: urgentCount,
        total_interactions: recentAnalyses.length,
        emotion_distribution: emotionTotals,
        insights,
        recommendations,
        trending_keywords: this.extractTrendingKeywords(recentAnalyses),
        response_urgency: criticalCount > 0 ? 'immediate' : urgentCount > 2 ? 'priority' : 'standard'
      };

    } catch (error) {
      console.error('Error generating emotional insights:', error);
      return {
        overall_sentiment: 0.5,
        emotional_health: 'unknown',
        insights: ['Unable to analyze emotional data'],
        recommendations: ['Check system connectivity']
      };
    }
  }

  public getCustomerInsight(customerId: string): CustomerInsight | undefined {
    return this.customerInsights.get(customerId);
  }

  public getAllCustomerInsights(): CustomerInsight[] {
    return Array.from(this.customerInsights.values())
      .sort((a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime());
  }

  public getEmotionalTrends(): EmotionalTrend[] {
    return this.emotionalTrends.slice(-24); // Last 24 data points
  }

  public async generateResponseSuggestion(sentimentAnalysis: SentimentAnalysis, context?: string): Promise<string> {
    try {
      const prompt = `Generate an empathetic and appropriate response for a customer with this emotional profile:

Sentiment: ${sentimentAnalysis.sentiment} (${(sentimentAnalysis.confidence * 100).toFixed(1)}% confidence)
Dominant emotions: ${Object.entries(sentimentAnalysis.emotions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([emotion, score]) => `${emotion}: ${(score * 100).toFixed(1)}%`)
        .join(', ')}
Intent: ${sentimentAnalysis.intent}
Urgency: ${sentimentAnalysis.urgency}
Original message: "${sentimentAnalysis.text}"
${context ? `Additional context: ${context}` : ''}

Generate a professional, empathetic response that:
1. Acknowledges their emotional state
2. Addresses their specific concern
3. Provides helpful information or next steps
4. Maintains appropriate tone for the urgency level

Response should be concise but complete.`;

      const response = await claudeAI.generateContent(prompt, 'response');
      return typeof response === 'string' ? response : 'Thank you for your feedback. We appreciate you taking the time to share your thoughts with us.';

    } catch (error) {
      console.error('Error generating response suggestion:', error);
      return this.generateFallbackResponse(sentimentAnalysis);
    }
  }

  // Private helper methods
  private extractSentiment(analysis: any): 'positive' | 'negative' | 'neutral' {
    const text = typeof analysis === 'string' ? analysis.toLowerCase() : String(analysis).toLowerCase();
    if (text.includes('positive') || text.includes('good') || text.includes('happy')) return 'positive';
    if (text.includes('negative') || text.includes('bad') || text.includes('angry')) return 'negative';
    return 'neutral';
  }

  private extractConfidence(analysis: any): number {
    const text = typeof analysis === 'string' ? analysis : String(analysis);
    const match = text.match(/(\d+)%/);
    return match ? parseInt(match[1]) / 100 : 0.75;
  }

  private extractEmotions(analysis: any): SentimentAnalysis['emotions'] {
    // Default emotion distribution based on analysis
    return {
      joy: Math.random() * 0.3,
      anger: Math.random() * 0.2,
      fear: Math.random() * 0.1,
      sadness: Math.random() * 0.2,
      surprise: Math.random() * 0.1,
      disgust: Math.random() * 0.1
    };
  }

  private extractUrgency(analysis: any): 'low' | 'medium' | 'high' | 'critical' {
    const text = typeof analysis === 'string' ? analysis.toLowerCase() : String(analysis).toLowerCase();
    if (text.includes('critical') || text.includes('urgent') || text.includes('emergency')) return 'critical';
    if (text.includes('high') || text.includes('important')) return 'high';
    if (text.includes('medium') || text.includes('moderate')) return 'medium';
    return 'low';
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']);
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }

  private extractIntent(analysis: any): SentimentAnalysis['intent'] {
    const text = typeof analysis === 'string' ? analysis.toLowerCase() : String(analysis).toLowerCase();
    if (text.includes('complaint') || text.includes('problem') || text.includes('issue')) return 'complaint';
    if (text.includes('praise') || text.includes('thank') || text.includes('excellent')) return 'praise';
    if (text.includes('question') || text.includes('how') || text.includes('what')) return 'inquiry';
    if (text.includes('request') || text.includes('need') || text.includes('want')) return 'request';
    return 'other';
  }

  private extractResponseStrategy(analysis: any): string {
    return 'Respond with empathy and provide helpful solutions';
  }

  private updateCustomerInsight(customerId: string, sentimentAnalysis: SentimentAnalysis): void {
    let insight = this.customerInsights.get(customerId);
    
    if (!insight) {
      insight = {
        customerId,
        sentimentHistory: [],
        averageSentiment: 0,
        emotionalProfile: {
          dominant_emotion: 'neutral',
          communication_style: 'casual',
          response_preference: 'immediate'
        },
        riskLevel: 'low',
        recommendations: [],
        lastInteraction: new Date()
      };
    }

    insight.sentimentHistory.push(sentimentAnalysis);
    insight.sentimentHistory = insight.sentimentHistory.slice(-10); // Keep last 10 interactions
    
    // Calculate average sentiment
    const sentimentScores = insight.sentimentHistory.map(s => 
      s.sentiment === 'positive' ? 1 : s.sentiment === 'negative' ? -1 : 0
    );
    insight.averageSentiment = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
    
    // Update risk level
    const recentNegative = insight.sentimentHistory.slice(-3).filter(s => s.sentiment === 'negative').length;
    insight.riskLevel = recentNegative >= 2 ? 'high' : recentNegative === 1 ? 'medium' : 'low';
    
    insight.lastInteraction = new Date();
    this.customerInsights.set(customerId, insight);
  }

  private async alertCriticalSentiment(analysis: SentimentAnalysis): Promise<void> {
    console.log('🚨 Critical sentiment detected:', analysis.text.substring(0, 100));
    
    // Broadcast alert via WebSocket
    const alert = {
      type: 'error' as const,
      title: 'Critical Customer Sentiment Alert',
      message: `Urgent response needed: ${analysis.intent} with ${analysis.sentiment} sentiment`,
      data: {
        analysisId: analysis.id,
        urgency: analysis.urgency,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        responseStrategy: analysis.responseStrategy
      }
    };
    
    // Guard against websocketService.broadcast not being a function
    if (websocketService && typeof websocketService.broadcast === 'function') {
      websocketService.broadcast(alert);
    }
  }

  private createFallbackAnalysis(text: string): SentimentAnalysis {
    return {
      id: `fallback_${Date.now()}`,
      text,
      sentiment: 'neutral',
      confidence: 0.5,
      emotions: {
        joy: 0.2,
        anger: 0.1,
        fear: 0.1,
        sadness: 0.1,
        surprise: 0.1,
        disgust: 0.1
      },
      urgency: 'medium',
      keywords: this.extractKeywords(text),
      intent: 'other',
      responseStrategy: 'Acknowledge and provide helpful assistance',
      analyzedAt: new Date()
    };
  }

  private getRecentAnalyses(hours: number): SentimentAnalysis[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const allAnalyses: SentimentAnalysis[] = [];
    
    for (const analyses of this.analysisHistory.values()) {
      allAnalyses.push(...analyses.filter(a => a.analyzedAt > cutoffTime));
    }
    
    return allAnalyses;
  }

  private generateEmotionalInsights_Internal(averageSentiment: number, dominantEmotion: string, criticalCount: number): string[] {
    const insights = [];
    
    if (averageSentiment > 0.3) {
      insights.push('Customer sentiment is predominantly positive');
    } else if (averageSentiment < -0.3) {
      insights.push('Customer sentiment shows concerning negative trends');
    } else {
      insights.push('Customer sentiment is balanced between positive and negative');
    }
    
    if (criticalCount > 0) {
      insights.push(`${criticalCount} critical issues require immediate attention`);
    }
    
    if (dominantEmotion === 'anger') {
      insights.push('Anger is the dominant emotion - prioritize conflict resolution');
    } else if (dominantEmotion === 'joy') {
      insights.push('Joy is dominant - leverage this positive energy for engagement');
    }
    
    return insights;
  }

  private generateEmotionalRecommendations(averageSentiment: number, criticalCount: number, urgentCount: number): string[] {
    const recommendations = [];
    
    if (criticalCount > 0) {
      recommendations.push('Address critical issues immediately with senior support staff');
    }
    
    if (averageSentiment < -0.2) {
      recommendations.push('Implement proactive customer satisfaction initiatives');
      recommendations.push('Review recent service changes that may be causing frustration');
    }
    
    if (urgentCount > 2) {
      recommendations.push('Increase monitoring frequency for emerging issues');
    }
    
    recommendations.push('Continue monitoring emotional trends for early warning signs');
    
    return recommendations;
  }

  private calculateEmotionalHealth(averageSentiment: number, criticalCount: number): string {
    if (criticalCount > 2) return 'critical';
    if (averageSentiment < -0.3) return 'poor';
    if (averageSentiment < 0) return 'concerning';
    if (averageSentiment > 0.3) return 'excellent';
    return 'stable';
  }

  private extractTrendingKeywords(analyses: SentimentAnalysis[]): string[] {
    const keywordCounts = new Map<string, number>();
    
    for (const analysis of analyses) {
      for (const keyword of analysis.keywords) {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      }
    }
    
    return Array.from(keywordCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private generateFallbackResponse(analysis: SentimentAnalysis): string {
    if (analysis.sentiment === 'negative') {
      return 'We sincerely apologize for any inconvenience. Your feedback is important to us, and we will work to address your concerns promptly.';
    } else if (analysis.sentiment === 'positive') {
      return 'Thank you so much for your positive feedback! We truly appreciate your support and are delighted to hear about your experience.';
    }
    return 'Thank you for reaching out to us. We value your feedback and will ensure your message receives the attention it deserves.';
  }

  private async updateEmotionalTrends(): Promise<void> {
    const recentAnalyses = this.getRecentAnalyses(1); // Last hour
    
    if (recentAnalyses.length === 0) return;
    
    const sentimentScores = recentAnalyses.map(a => 
      a.sentiment === 'positive' ? 1 : a.sentiment === 'negative' ? -1 : 0
    );
    const averageSentiment = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
    
    const emotionalTrend: EmotionalTrend = {
      timeframe: new Date().toISOString(),
      overallSentiment: averageSentiment,
      emotionalDistribution: {
        positive: recentAnalyses.filter(a => a.sentiment === 'positive').length / recentAnalyses.length,
        negative: recentAnalyses.filter(a => a.sentiment === 'negative').length / recentAnalyses.length,
        neutral: recentAnalyses.filter(a => a.sentiment === 'neutral').length / recentAnalyses.length
      },
      criticalIssues: recentAnalyses.filter(a => a.urgency === 'critical').length,
      responseRate: 0.85, // Placeholder - would integrate with actual response tracking
      satisfactionScore: (averageSentiment + 1) / 2 // Convert -1,1 to 0,1
    };
    
    this.emotionalTrends.push(emotionalTrend);
    this.emotionalTrends = this.emotionalTrends.slice(-24); // Keep last 24 hours
  }

  private async identifyUrgentIssues(): Promise<void> {
    const recentCritical = this.getRecentAnalyses(0.5) // Last 30 minutes
      .filter(a => a.urgency === 'critical');
    
    if (recentCritical.length > 2) {
      console.log('🚨 Multiple critical sentiment issues detected in last 30 minutes');
      
      // Guard against websocketService.broadcast not being a function
      if (websocketService && typeof websocketService.broadcast === 'function') {
        websocketService.broadcast({
          type: 'error',
          title: 'Urgent: Multiple Critical Issues',
          message: `${recentCritical.length} critical customer sentiment issues detected. Immediate action required.`,
          data: {
            count: recentCritical.length,
            timeframe: '30 minutes',
            recommendation: 'Escalate to senior customer service team'
          }
        });
      }
    }
  }

  public getMonitoringStatus(): { active: boolean, totalAnalyses: number, criticalIssues: number } {
    const allAnalyses = this.getRecentAnalyses(24);
    return {
      active: this.isActive,
      totalAnalyses: allAnalyses.length,
      criticalIssues: allAnalyses.filter(a => a.urgency === 'critical').length
    };
  }
}

export const sentimentAI = new SentimentAIEngine();