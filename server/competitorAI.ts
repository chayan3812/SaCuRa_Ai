import { claudeAI } from "./claudeAI";
import { websocketService } from "./websocket";

interface CompetitorProfile {
  id: string;
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  platforms: string[];
  followerCount: number;
  engagementRate: number;
  postingFrequency: number;
  contentTypes: string[];
  strengths: string[];
  weaknesses: string[];
  threats: string[];
  opportunities: string[];
  lastAnalyzed: Date;
}

interface CompetitorInsight {
  id: string;
  competitorId: string;
  type: 'content_strategy' | 'engagement_tactics' | 'audience_analysis' | 'growth_pattern' | 'threat_assessment';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionableItems: string[];
  confidence: number;
  dataPoints: any[];
  generatedAt: Date;
  validUntil: Date;
}

interface MarketIntelligence {
  industry: string;
  marketSize: number;
  growthRate: number;
  keyTrends: string[];
  emergingOpportunities: string[];
  competitiveLandscape: {
    leaders: string[];
    challengers: string[];
    niche_players: string[];
  };
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  lastUpdated: Date;
}

interface CompetitorComparison {
  metric: string;
  yourValue: number;
  competitorAverage: number;
  industryBenchmark: number;
  performance: 'above' | 'at' | 'below';
  gap: number;
  recommendation: string;
}

export class CompetitorAIEngine {
  private competitors: Map<string, CompetitorProfile> = new Map();
  private insights: Map<string, CompetitorInsight[]> = new Map();
  private marketIntelligence: Map<string, MarketIntelligence> = new Map();
  private analysisInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  constructor() {
    this.initializeCompetitorDatabase();
    this.startContinuousMonitoring();
  }

  private initializeCompetitorDatabase(): void {
    // Sample competitor data - in production this would integrate with real data sources
    const sampleCompetitors: CompetitorProfile[] = [
      {
        id: 'comp_1',
        name: 'Digital Marketing Pro',
        industry: 'Marketing Services',
        size: 'medium',
        platforms: ['Facebook', 'Instagram', 'LinkedIn'],
        followerCount: 25000,
        engagementRate: 4.2,
        postingFrequency: 5,
        contentTypes: ['Educational', 'Case Studies', 'Tips'],
        strengths: ['High engagement', 'Quality content', 'Consistent posting'],
        weaknesses: ['Limited video content', 'Low story usage'],
        threats: ['Growing audience', 'Increasing ad spend'],
        opportunities: ['Video content gap', 'Emerging platforms'],
        lastAnalyzed: new Date()
      },
      {
        id: 'comp_2',
        name: 'Social Media Solutions',
        industry: 'Marketing Services',
        size: 'large',
        platforms: ['Facebook', 'Instagram', 'Twitter', 'TikTok'],
        followerCount: 150000,
        engagementRate: 3.8,
        postingFrequency: 8,
        contentTypes: ['Video', 'Infographics', 'Live streams'],
        strengths: ['Large audience', 'Multi-platform presence', 'Video expertise'],
        weaknesses: ['Lower engagement rate', 'Generic content'],
        threats: ['Market dominance', 'Resource advantage'],
        opportunities: ['Personalization gap', 'Niche specialization'],
        lastAnalyzed: new Date()
      }
    ];

    sampleCompetitors.forEach(comp => {
      this.competitors.set(comp.id, comp);
    });

    console.log('🕵️ Competitor AI Engine: Initialized with sample competitor data');
  }

  private startContinuousMonitoring(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🕵️ Competitor AI Engine: Starting continuous competitive intelligence monitoring...');
    
    // Analyze competitors every 2 hours
    this.analysisInterval = setInterval(async () => {
      await this.performCompetitiveAnalysis();
    }, 7200000);

    // Initial analysis
    this.performCompetitiveAnalysis();
  }

  public stopMonitoring(): void {
    this.isActive = false;
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  private async performCompetitiveAnalysis(): Promise<void> {
    try {
      console.log('🔍 Performing competitive intelligence analysis...');
      
      for (const [competitorId, competitor] of this.competitors) {
        await this.analyzeCompetitor(competitor);
        await this.generateCompetitorInsights(competitor);
      }
      
      await this.updateMarketIntelligence();
      this.broadcastIntelligenceUpdates();
      
    } catch (error) {
      console.error('Error in competitive analysis:', error);
    }
  }

  private async analyzeCompetitor(competitor: CompetitorProfile): Promise<void> {
    try {
      const prompt = `Analyze this competitor profile and provide strategic insights:

Competitor: ${competitor.name}
Industry: ${competitor.industry}
Size: ${competitor.size}
Platforms: ${competitor.platforms.join(', ')}
Followers: ${competitor.followerCount}
Engagement Rate: ${competitor.engagementRate}%
Posting Frequency: ${competitor.postingFrequency} posts/week
Content Types: ${competitor.contentTypes.join(', ')}

Current Strengths: ${competitor.strengths.join(', ')}
Current Weaknesses: ${competitor.weaknesses.join(', ')}

Provide analysis on:
1. Content strategy effectiveness
2. Audience engagement tactics
3. Growth patterns and trends
4. Competitive threats they pose
5. Market opportunities they're missing

Focus on actionable intelligence for competitive advantage.`;

      const analysis = await claudeAI.generateContent(prompt, 'post');
      
      // Update competitor profile with new insights
      competitor.lastAnalyzed = new Date();
      this.competitors.set(competitor.id, competitor);
      
    } catch (error) {
      console.error(`Error analyzing competitor ${competitor.name}:`, error);
    }
  }

  private async generateCompetitorInsights(competitor: CompetitorProfile): Promise<void> {
    const insights: CompetitorInsight[] = [];

    try {
      // Content Strategy Insight
      const contentInsight = await this.analyzeContentStrategy(competitor);
      insights.push(contentInsight);

      // Engagement Tactics Insight
      const engagementInsight = await this.analyzeEngagementTactics(competitor);
      insights.push(engagementInsight);

      // Growth Pattern Analysis
      const growthInsight = await this.analyzeGrowthPatterns(competitor);
      insights.push(growthInsight);

      // Threat Assessment
      const threatInsight = await this.assessCompetitorThreats(competitor);
      insights.push(threatInsight);

      this.insights.set(competitor.id, insights);

    } catch (error) {
      console.error(`Error generating insights for ${competitor.name}:`, error);
    }
  }

  private async analyzeContentStrategy(competitor: CompetitorProfile): Promise<CompetitorInsight> {
    const prompt = `Analyze the content strategy of ${competitor.name} based on their content types: ${competitor.contentTypes.join(', ')}.
    
    Identify:
    1. Content strategy strengths and gaps
    2. Opportunities for differentiation
    3. Content performance patterns
    4. Actionable recommendations for competitive advantage`;

    try {
      const analysis = await claudeAI.generateContent(prompt, 'post');

      return {
        id: `insight_content_${Date.now()}`,
        competitorId: competitor.id,
        type: 'content_strategy',
        title: `${competitor.name} Content Strategy Analysis`,
        description: 'AI analysis of competitor content strategy and opportunities',
        impact: 'high',
        actionableItems: this.extractActionableItems(analysis),
        confidence: 0.82,
        dataPoints: [],
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 1 week
      };
    } catch (error) {
      return this.createFallbackInsight(competitor.id, 'content_strategy', 'Content strategy analysis unavailable');
    }
  }

  private async analyzeEngagementTactics(competitor: CompetitorProfile): Promise<CompetitorInsight> {
    const prompt = `Analyze engagement tactics for ${competitor.name} with ${competitor.engagementRate}% engagement rate and ${competitor.postingFrequency} posts per week.
    
    Evaluate:
    1. Engagement optimization strategies
    2. Community building approaches
    3. Interaction patterns and timing
    4. Areas for improvement and competitive advantage`;

    try {
      const analysis = await claudeAI.generateContent(prompt, 'post');

      return {
        id: `insight_engagement_${Date.now()}`,
        competitorId: competitor.id,
        type: 'engagement_tactics',
        title: `${competitor.name} Engagement Analysis`,
        description: 'Deep analysis of competitor engagement strategies and optimization opportunities',
        impact: competitor.engagementRate > 5 ? 'high' : 'medium',
        actionableItems: this.extractActionableItems(analysis),
        confidence: 0.78,
        dataPoints: [],
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Valid for 5 days
      };
    } catch (error) {
      return this.createFallbackInsight(competitor.id, 'engagement_tactics', 'Engagement analysis unavailable');
    }
  }

  private async analyzeGrowthPatterns(competitor: CompetitorProfile): Promise<CompetitorInsight> {
    const prompt = `Analyze growth patterns for ${competitor.name} with ${competitor.followerCount} followers across ${competitor.platforms.join(', ')}.
    
    Assess:
    1. Growth trajectory and momentum
    2. Platform-specific performance
    3. Audience acquisition strategies
    4. Scalability and expansion opportunities`;

    try {
      const analysis = await claudeAI.generateContent(prompt, 'post');

      return {
        id: `insight_growth_${Date.now()}`,
        competitorId: competitor.id,
        type: 'growth_pattern',
        title: `${competitor.name} Growth Pattern Analysis`,
        description: 'Strategic analysis of competitor growth patterns and market expansion',
        impact: competitor.followerCount > 50000 ? 'high' : 'medium',
        actionableItems: this.extractActionableItems(analysis),
        confidence: 0.75,
        dataPoints: [],
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // Valid for 10 days
      };
    } catch (error) {
      return this.createFallbackInsight(competitor.id, 'growth_pattern', 'Growth analysis unavailable');
    }
  }

  private async assessCompetitorThreats(competitor: CompetitorProfile): Promise<CompetitorInsight> {
    const threatLevel = this.calculateThreatLevel(competitor);
    
    const prompt = `Assess competitive threats from ${competitor.name} (${competitor.size} company with ${competitor.followerCount} followers).
    
    Current threats: ${competitor.threats.join(', ')}
    
    Analyze:
    1. Direct competitive threats
    2. Market position challenges
    3. Resource and capability gaps
    4. Defensive and offensive strategies`;

    try {
      const analysis = await claudeAI.generateContent(prompt, 'post');

      return {
        id: `insight_threat_${Date.now()}`,
        competitorId: competitor.id,
        type: 'threat_assessment',
        title: `${competitor.name} Threat Assessment`,
        description: 'Comprehensive threat analysis and competitive positioning strategy',
        impact: threatLevel,
        actionableItems: this.extractActionableItems(analysis),
        confidence: 0.85,
        dataPoints: [],
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Valid for 2 weeks
      };
    } catch (error) {
      return this.createFallbackInsight(competitor.id, 'threat_assessment', 'Threat assessment unavailable');
    }
  }

  private async updateMarketIntelligence(): Promise<void> {
    try {
      const industries = Array.from(new Set(Array.from(this.competitors.values()).map(c => c.industry)));
      
      for (const industry of industries) {
        const industryCompetitors = Array.from(this.competitors.values()).filter(c => c.industry === industry);
        
        const intelligence: MarketIntelligence = {
          industry,
          marketSize: this.estimateMarketSize(industryCompetitors),
          growthRate: this.calculateGrowthRate(industryCompetitors),
          keyTrends: await this.identifyKeyTrends(industry),
          emergingOpportunities: await this.identifyOpportunities(industry),
          competitiveLandscape: this.analyzeCompetitiveLandscape(industryCompetitors),
          threatLevel: this.assessIndustryThreatLevel(industryCompetitors),
          recommendations: await this.generateMarketRecommendations(industry, industryCompetitors),
          lastUpdated: new Date()
        };
        
        this.marketIntelligence.set(industry, intelligence);
      }
    } catch (error) {
      console.error('Error updating market intelligence:', error);
    }
  }

  public async generateCompetitiveAnalysisReport(userIndustry: string): Promise<any> {
    try {
      const industryCompetitors = Array.from(this.competitors.values()).filter(c => c.industry === userIndustry);
      const marketIntel = this.marketIntelligence.get(userIndustry);
      
      if (industryCompetitors.length === 0) {
        return {
          industry: userIndustry,
          competitorCount: 0,
          analysis: 'No competitor data available for this industry',
          recommendations: ['Conduct manual competitor research', 'Define competitive landscape']
        };
      }

      const competitorAnalysis = industryCompetitors.map(comp => ({
        name: comp.name,
        size: comp.size,
        followerCount: comp.followerCount,
        engagementRate: comp.engagementRate,
        strengths: comp.strengths.slice(0, 3),
        weaknesses: comp.weaknesses.slice(0, 3),
        threatLevel: this.calculateThreatLevel(comp)
      }));

      const benchmarks = this.calculateIndustryBenchmarks(industryCompetitors);
      const comparisons = this.generateCompetitorComparisons(industryCompetitors);

      return {
        industry: userIndustry,
        competitorCount: industryCompetitors.length,
        marketIntelligence: marketIntel || {},
        competitors: competitorAnalysis,
        industryBenchmarks: benchmarks,
        competitiveComparisons: comparisons,
        strategicRecommendations: await this.generateStrategicRecommendations(userIndustry, industryCompetitors),
        threats: industryCompetitors.flatMap(c => c.threats).slice(0, 5),
        opportunities: industryCompetitors.flatMap(c => c.opportunities).slice(0, 5),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error generating competitive analysis report:', error);
      return {
        industry: userIndustry,
        error: 'Failed to generate competitive analysis report',
        recommendations: ['Check system connectivity', 'Retry analysis']
      };
    }
  }

  public getCompetitorInsights(competitorId: string): CompetitorInsight[] {
    return this.insights.get(competitorId) || [];
  }

  public getAllCompetitors(): CompetitorProfile[] {
    return Array.from(this.competitors.values());
  }

  public getMarketIntelligence(industry: string): MarketIntelligence | undefined {
    return this.marketIntelligence.get(industry);
  }

  // Private helper methods
  private extractActionableItems(analysis: any): string[] {
    const text = typeof analysis === 'string' ? analysis : String(analysis);
    const items = [];
    
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('recommend') || line.includes('should') || line.includes('consider') || line.startsWith('•') || line.startsWith('-')) {
        items.push(line.trim());
      }
    }
    
    return items.length > 0 ? items.slice(0, 5) : [
      'Monitor competitor content strategy',
      'Analyze engagement patterns',
      'Identify differentiation opportunities',
      'Track performance metrics',
      'Develop competitive response plan'
    ];
  }

  private createFallbackInsight(competitorId: string, type: CompetitorInsight['type'], error: string): CompetitorInsight {
    return {
      id: `fallback_${Date.now()}`,
      competitorId,
      type,
      title: 'Analysis Temporarily Unavailable',
      description: 'Competitive intelligence analysis currently unavailable',
      impact: 'low',
      actionableItems: [
        'Conduct manual competitor research',
        'Monitor competitor social media activity',
        'Track key performance metrics',
        'Review competitive positioning'
      ],
      confidence: 0.5,
      dataPoints: [],
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 60 * 60 * 1000) // Valid for 1 hour
    };
  }

  private calculateThreatLevel(competitor: CompetitorProfile): 'low' | 'medium' | 'high' | 'critical' {
    let score = 0;
    
    // Size factor
    if (competitor.size === 'enterprise') score += 3;
    else if (competitor.size === 'large') score += 2;
    else if (competitor.size === 'medium') score += 1;
    
    // Follower count factor
    if (competitor.followerCount > 100000) score += 3;
    else if (competitor.followerCount > 50000) score += 2;
    else if (competitor.followerCount > 10000) score += 1;
    
    // Engagement rate factor
    if (competitor.engagementRate > 5) score += 2;
    else if (competitor.engagementRate > 3) score += 1;
    
    // Platform diversification factor
    if (competitor.platforms.length > 3) score += 1;
    
    if (score >= 7) return 'critical';
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  private estimateMarketSize(competitors: CompetitorProfile[]): number {
    return competitors.reduce((total, comp) => total + comp.followerCount, 0);
  }

  private calculateGrowthRate(competitors: CompetitorProfile[]): number {
    // Simulate growth rate calculation based on competitor data
    const avgEngagement = competitors.reduce((sum, comp) => sum + comp.engagementRate, 0) / competitors.length;
    return Math.max(0, Math.min(100, avgEngagement * 2 + Math.random() * 10));
  }

  private async identifyKeyTrends(industry: string): Promise<string[]> {
    return [
      'Increased video content adoption',
      'AI-powered content personalization',
      'Community-driven engagement',
      'Multi-platform content strategies',
      'Real-time customer service integration'
    ];
  }

  private async identifyOpportunities(industry: string): Promise<string[]> {
    return [
      'Emerging social media platforms',
      'Voice and audio content',
      'Interactive content formats',
      'Micro-influencer partnerships',
      'AI-driven content optimization'
    ];
  }

  private analyzeCompetitiveLandscape(competitors: CompetitorProfile[]): MarketIntelligence['competitiveLandscape'] {
    const sorted = competitors.sort((a, b) => b.followerCount - a.followerCount);
    
    return {
      leaders: sorted.slice(0, 2).map(c => c.name),
      challengers: sorted.slice(2, 4).map(c => c.name),
      niche_players: sorted.slice(4).map(c => c.name)
    };
  }

  private assessIndustryThreatLevel(competitors: CompetitorProfile[]): 'low' | 'medium' | 'high' | 'critical' {
    const threatLevels = competitors.map(c => this.calculateThreatLevel(c));
    const criticalCount = threatLevels.filter(t => t === 'critical').length;
    const highCount = threatLevels.filter(t => t === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 1) return 'high';
    if (highCount > 0) return 'medium';
    return 'low';
  }

  private async generateMarketRecommendations(industry: string, competitors: CompetitorProfile[]): Promise<string[]> {
    return [
      'Focus on differentiated content strategy',
      'Leverage underutilized platforms',
      'Develop unique value proposition',
      'Build strong community engagement',
      'Monitor competitor innovations closely'
    ];
  }

  private calculateIndustryBenchmarks(competitors: CompetitorProfile[]): any {
    const avgEngagement = competitors.reduce((sum, comp) => sum + comp.engagementRate, 0) / competitors.length;
    const avgFollowers = competitors.reduce((sum, comp) => sum + comp.followerCount, 0) / competitors.length;
    const avgPostingFreq = competitors.reduce((sum, comp) => sum + comp.postingFrequency, 0) / competitors.length;

    return {
      averageEngagementRate: Number(avgEngagement.toFixed(2)),
      averageFollowerCount: Math.round(avgFollowers),
      averagePostingFrequency: Number(avgPostingFreq.toFixed(1)),
      topPerformers: competitors.filter(c => c.engagementRate > avgEngagement).length,
      platformDiversity: Math.round(competitors.reduce((sum, comp) => sum + comp.platforms.length, 0) / competitors.length)
    };
  }

  private generateCompetitorComparisons(competitors: CompetitorProfile[]): CompetitorComparison[] {
    const benchmarks = this.calculateIndustryBenchmarks(competitors);
    
    // Sample user metrics for comparison (in production, these would come from user's actual data)
    const userMetrics = {
      engagementRate: 3.5,
      followerCount: 8500,
      postingFrequency: 4
    };

    return [
      {
        metric: 'Engagement Rate',
        yourValue: userMetrics.engagementRate,
        competitorAverage: benchmarks.averageEngagementRate,
        industryBenchmark: benchmarks.averageEngagementRate,
        performance: userMetrics.engagementRate >= benchmarks.averageEngagementRate ? 'above' : 'below',
        gap: Number((benchmarks.averageEngagementRate - userMetrics.engagementRate).toFixed(2)),
        recommendation: userMetrics.engagementRate < benchmarks.averageEngagementRate ? 
          'Increase engagement through interactive content and community building' : 
          'Maintain current engagement strategy while exploring growth opportunities'
      },
      {
        metric: 'Follower Count',
        yourValue: userMetrics.followerCount,
        competitorAverage: benchmarks.averageFollowerCount,
        industryBenchmark: benchmarks.averageFollowerCount,
        performance: userMetrics.followerCount >= benchmarks.averageFollowerCount ? 'above' : 'below',
        gap: benchmarks.averageFollowerCount - userMetrics.followerCount,
        recommendation: userMetrics.followerCount < benchmarks.averageFollowerCount ? 
          'Focus on audience growth through targeted content and advertising' : 
          'Leverage large audience for increased engagement and conversions'
      }
    ];
  }

  private async generateStrategicRecommendations(industry: string, competitors: CompetitorProfile[]): Promise<string[]> {
    const topCompetitor = competitors.reduce((top, comp) => 
      comp.followerCount > top.followerCount ? comp : top, competitors[0]);

    return [
      `Study ${topCompetitor.name}'s content strategy for industry best practices`,
      'Identify gaps in competitor coverage for unique positioning',
      'Develop content formats that competitors are underutilizing',
      'Focus on platforms where competitors have weaker presence',
      'Build community features that differentiate from competitive offerings'
    ];
  }

  private broadcastIntelligenceUpdates(): void {
    const totalCompetitors = this.competitors.size;
    const totalInsights = Array.from(this.insights.values()).reduce((sum, insights) => sum + insights.length, 0);
    const criticalThreats = Array.from(this.competitors.values()).filter(c => this.calculateThreatLevel(c) === 'critical').length;

    // Guard against websocketService.broadcast not being a function
    if (websocketService && typeof websocketService.broadcast === 'function') {
      websocketService.broadcast({
        type: 'info',
        title: 'Competitive Intelligence Updated',
        message: `Analyzed ${totalCompetitors} competitors with ${totalInsights} strategic insights`,
        data: {
          competitors: totalCompetitors,
          insights: totalInsights,
          criticalThreats,
          lastUpdated: new Date()
        }
      });
    }
  }

  public getMonitoringStatus(): { active: boolean, competitorCount: number, insightCount: number } {
    const totalInsights = Array.from(this.insights.values()).reduce((sum, insights) => sum + insights.length, 0);
    
    return {
      active: this.isActive,
      competitorCount: this.competitors.size,
      insightCount: totalInsights
    };
  }
}

export const competitorAI = new CompetitorAIEngine();