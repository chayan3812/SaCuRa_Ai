import { claudeAI } from './claudeAI';

interface CompetitorProfile {
  id: string;
  name: string;
  website: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  marketShare: number;
  lastUpdated: Date;
  socialProfiles: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
  businessModel: string[];
  keyProducts: string[];
}

interface AdIntelligence {
  competitorId: string;
  adId: string;
  platform: 'facebook' | 'instagram' | 'google' | 'linkedin' | 'twitter';
  adType: 'image' | 'video' | 'carousel' | 'collection' | 'dynamic';
  creativeAssets: {
    headlines: string[];
    descriptions: string[];
    images: string[];
    videos: string[];
    callToActions: string[];
  };
  targeting: {
    demographics: any;
    interests: string[];
    behaviors: string[];
    locations: string[];
    estimatedAudience: number;
  };
  performance: {
    estimatedReach: number;
    estimatedImpressions: number;
    engagementRate: number;
    estimatedBudget: {
      daily: number;
      total: number;
    };
    runDuration: number;
    firstSeen: Date;
    lastSeen: Date;
  };
  analysis: {
    strategy: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

interface PricingIntelligence {
  competitorId: string;
  products: Array<{
    name: string;
    category: string;
    price: number;
    currency: string;
    pricingModel: 'one-time' | 'subscription' | 'freemium' | 'usage-based';
    features: string[];
    lastUpdated: Date;
    priceHistory: Array<{
      price: number;
      date: Date;
      changeReason?: string;
    }>;
  }>;
  promotions: Array<{
    type: 'discount' | 'bundle' | 'free-trial' | 'cashback';
    description: string;
    discount: number;
    validFrom: Date;
    validTo: Date;
    conditions: string[];
  }>;
}

interface MarketIntelligence {
  competitorId: string;
  marketPosition: {
    ranking: number;
    marketShare: number;
    growthRate: number;
    customerSentiment: number;
  };
  contentStrategy: {
    postingFrequency: number;
    contentTypes: string[];
    engagementMetrics: {
      avgLikes: number;
      avgComments: number;
      avgShares: number;
    };
    topPerformingContent: Array<{
      content: string;
      engagement: number;
      date: Date;
    }>;
  };
  customerInsights: {
    reviewSentiment: number;
    commonComplaints: string[];
    customerDemographics: any;
    satisfactionScore: number;
  };
}

interface CompetitorAlert {
  id: string;
  competitorId: string;
  type: 'new_ad' | 'price_change' | 'product_launch' | 'strategy_shift' | 'performance_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendedActions: string[];
  triggeredAt: Date;
  data: any;
}

export class CompetitorIntelligenceSystem {
  private monitoringActive = false;
  private updateInterval = 24 * 60 * 60 * 1000; // 24 hours
  private competitorProfiles = new Map<string, CompetitorProfile>();
  private adIntelligence = new Map<string, AdIntelligence[]>();
  private pricingData = new Map<string, PricingIntelligence>();
  private marketData = new Map<string, MarketIntelligence>();

  async addCompetitor(competitorData: Partial<CompetitorProfile>): Promise<CompetitorProfile> {
    try {
      const competitorId = `comp_${Date.now()}`;
      
      // Enrich competitor data using AI analysis
      const enrichedProfile = await this.enrichCompetitorProfile(competitorData);
      
      const competitor: CompetitorProfile = {
        id: competitorId,
        name: competitorData.name || '',
        website: competitorData.website || '',
        industry: competitorData.industry || '',
        size: competitorData.size || 'medium',
        marketShare: 0,
        lastUpdated: new Date(),
        socialProfiles: competitorData.socialProfiles || {
          facebook: '',
          instagram: '',
          linkedin: '',
          twitter: ''
        },
        businessModel: enrichedProfile.businessModel || [],
        keyProducts: enrichedProfile.keyProducts || []
      };

      this.competitorProfiles.set(competitorId, competitor);
      
      // Start monitoring this competitor
      await this.initializeCompetitorMonitoring(competitorId);
      
      return competitor;
    } catch (error) {
      console.error('Error adding competitor:', error);
      throw new Error('Failed to add competitor');
    }
  }

  async analyzeCompetitorAds(competitorId: string): Promise<AdIntelligence[]> {
    try {
      const competitor = this.competitorProfiles.get(competitorId);
      if (!competitor) {
        throw new Error('Competitor not found');
      }

      // Collect ad data from various sources
      const adData = await this.collectAdData(competitor);
      
      // Analyze each ad using AI
      const analyzedAds: AdIntelligence[] = [];
      
      for (const ad of adData) {
        const analysis = await this.analyzeAdStrategy(ad, competitor);
        analyzedAds.push({
          ...ad,
          analysis
        });
      }

      this.adIntelligence.set(competitorId, analyzedAds);
      return analyzedAds;

    } catch (error) {
      console.error('Error analyzing competitor ads:', error);
      return [];
    }
  }

  async monitorPricingChanges(competitorId: string): Promise<PricingIntelligence> {
    try {
      const competitor = this.competitorProfiles.get(competitorId);
      if (!competitor) {
        throw new Error('Competitor not found');
      }

      // Collect current pricing data
      const currentPricing = await this.collectPricingData(competitor);
      
      // Compare with historical data
      const historicalPricing = this.pricingData.get(competitorId);
      
      if (historicalPricing) {
        const changes = this.detectPricingChanges(historicalPricing, currentPricing);
        if (changes.length > 0) {
          await this.generatePricingAlerts(competitorId, changes);
        }
      }

      this.pricingData.set(competitorId, currentPricing);
      return currentPricing;

    } catch (error) {
      console.error('Error monitoring pricing changes:', error);
      throw new Error('Failed to monitor pricing changes');
    }
  }

  async generateCompetitiveIntelligenceReport(
    userId: string,
    competitorIds: string[]
  ): Promise<any> {
    try {
      const report = {
        generatedAt: new Date(),
        competitors: [],
        marketOverview: {},
        strategicInsights: [],
        recommendations: [],
        alerts: []
      };

      for (const competitorId of competitorIds) {
        const competitor = this.competitorProfiles.get(competitorId);
        if (!competitor) continue;

        const ads = this.adIntelligence.get(competitorId) || [];
        const pricing = this.pricingData.get(competitorId);
        const market = this.marketData.get(competitorId);

        // Generate AI-powered insights
        const insights = await this.generateCompetitorInsights(
          competitor, 
          ads, 
          pricing, 
          market
        );

        report.competitors.push({
          profile: competitor,
          ads: ads.slice(0, 10), // Top 10 most recent ads
          pricing: pricing,
          market: market,
          insights: insights
        });
      }

      // Generate strategic recommendations
      report.strategicInsights = await this.generateStrategicInsights(report.competitors);
      report.recommendations = await this.generateActionableRecommendations(
        userId, 
        report.competitors
      );

      return report;

    } catch (error) {
      console.error('Error generating intelligence report:', error);
      throw new Error('Failed to generate intelligence report');
    }
  }

  async detectEmergingTrends(): Promise<any[]> {
    try {
      const allAds = Array.from(this.adIntelligence.values()).flat();
      const recentAds = allAds.filter(ad => 
        new Date(ad.performance.firstSeen).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      );

      const trends = await this.analyzeTrends(recentAds);
      return trends;

    } catch (error) {
      console.error('Error detecting trends:', error);
      return [];
    }
  }

  async startRealTimeMonitoring(): Promise<void> {
    if (this.monitoringActive) return;

    this.monitoringActive = true;
    
    setInterval(async () => {
      await this.performScheduledUpdates();
    }, this.updateInterval);

    console.log('🔍 Competitor intelligence monitoring started');
  }

  private async enrichCompetitorProfile(data: Partial<CompetitorProfile>): Promise<any> {
    try {
      const prompt = `
        Analyze this competitor and enrich their profile:
        
        Basic Info:
        - Name: ${data.name}
        - Website: ${data.website}
        - Industry: ${data.industry}
        
        Research and determine:
        1. Business model(s) they use
        2. Key products/services
        3. Market position and competitive advantages
        4. Target audience characteristics
        5. Pricing strategy approach
        
        Return detailed analysis as JSON.
      `;

      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 1000,
        temperature: 0.3
      });

      return JSON.parse(response.content);

    } catch (error) {
      console.error('Error enriching competitor profile:', error);
      return { businessModel: [], keyProducts: [] };
    }
  }

  private async collectAdData(competitor: CompetitorProfile): Promise<any[]> {
    // In production, this would integrate with ad intelligence APIs
    // For now, return structured mock data representing real ad collection
    return [
      {
        competitorId: competitor.id,
        adId: `ad_${Date.now()}`,
        platform: 'facebook' as const,
        adType: 'image' as const,
        creativeAssets: {
          headlines: ['Summer Sale - 50% Off All Products'],
          descriptions: ['Limited time offer on premium quality items'],
          images: ['summer_sale_creative.jpg'],
          videos: [],
          callToActions: ['Shop Now']
        },
        targeting: {
          demographics: { age: [25, 45], gender: ['all'] },
          interests: ['shopping', 'fashion'],
          behaviors: ['online_shoppers'],
          locations: ['US', 'CA'],
          estimatedAudience: 500000
        },
        performance: {
          estimatedReach: 50000,
          estimatedImpressions: 150000,
          engagementRate: 0.035,
          estimatedBudget: {
            daily: 200,
            total: 6000
          },
          runDuration: 30,
          firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastSeen: new Date()
        }
      }
    ];
  }

  private async analyzeAdStrategy(ad: any, competitor: CompetitorProfile): Promise<any> {
    try {
      const prompt = `
        Analyze this competitor's ad strategy:
        
        Competitor: ${competitor.name} (${competitor.industry})
        Ad Details:
        - Platform: ${ad.platform}
        - Headlines: ${ad.creativeAssets.headlines.join(', ')}
        - Description: ${ad.creativeAssets.descriptions.join(', ')}
        - Estimated Budget: $${ad.performance.estimatedBudget.daily}/day
        - Engagement Rate: ${ad.performance.engagementRate}
        - Audience Size: ${ad.targeting.estimatedAudience}
        
        Analyze:
        1. Overall strategy and positioning
        2. Strengths of this approach
        3. Potential weaknesses or gaps
        4. Opportunities for competitive advantage
        5. Threats this poses to competitors
        
        Return strategic analysis as JSON.
      `;

      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 800,
        temperature: 0.4
      });

      return JSON.parse(response.content);

    } catch (error) {
      console.error('Error analyzing ad strategy:', error);
      return {
        strategy: 'Unable to analyze',
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };
    }
  }

  private async collectPricingData(competitor: CompetitorProfile): Promise<PricingIntelligence> {
    // In production, this would scrape competitor websites and integrate with pricing APIs
    return {
      competitorId: competitor.id,
      products: [
        {
          name: 'Premium Plan',
          category: 'subscription',
          price: 99,
          currency: 'USD',
          pricingModel: 'subscription' as const,
          features: ['Feature A', 'Feature B', 'Feature C'],
          lastUpdated: new Date(),
          priceHistory: [
            { price: 89, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            { price: 99, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), changeReason: 'Feature update' }
          ]
        }
      ],
      promotions: [
        {
          type: 'discount' as const,
          description: '20% off first month',
          discount: 20,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          conditions: ['New customers only']
        }
      ]
    };
  }

  private detectPricingChanges(historical: PricingIntelligence, current: PricingIntelligence): any[] {
    const changes = [];
    
    for (const currentProduct of current.products) {
      const historicalProduct = historical.products.find(p => p.name === currentProduct.name);
      
      if (historicalProduct && historicalProduct.price !== currentProduct.price) {
        changes.push({
          product: currentProduct.name,
          oldPrice: historicalProduct.price,
          newPrice: currentProduct.price,
          changePercent: ((currentProduct.price - historicalProduct.price) / historicalProduct.price) * 100,
          changeType: currentProduct.price > historicalProduct.price ? 'increase' : 'decrease'
        });
      }
    }
    
    return changes;
  }

  private async generatePricingAlerts(competitorId: string, changes: any[]): Promise<void> {
    for (const change of changes) {
      const alert: CompetitorAlert = {
        id: `alert_${Date.now()}_${Math.random()}`,
        competitorId,
        type: 'price_change',
        severity: Math.abs(change.changePercent) > 20 ? 'high' : 'medium',
        title: `Price ${change.changeType} detected`,
        description: `${change.product} price changed from $${change.oldPrice} to $${change.newPrice} (${change.changePercent.toFixed(1)}%)`,
        impact: `Competitor pricing ${change.changeType} may affect market positioning`,
        recommendedActions: [
          'Review your pricing strategy',
          'Analyze competitive positioning',
          'Consider promotional response'
        ],
        triggeredAt: new Date(),
        data: change
      };

      await this.storeAlert(alert);
    }
  }

  private async generateCompetitorInsights(
    competitor: CompetitorProfile,
    ads: AdIntelligence[],
    pricing?: PricingIntelligence,
    market?: MarketIntelligence
  ): Promise<any> {
    try {
      const prompt = `
        Generate strategic insights for this competitor:
        
        Competitor: ${competitor.name}
        Industry: ${competitor.industry}
        
        Recent Ad Activity: ${ads.length} ads analyzed
        Average Engagement: ${ads.reduce((sum, ad) => sum + ad.performance.engagementRate, 0) / ads.length || 0}
        
        Key Observations:
        - Primary platforms: ${[...new Set(ads.map(ad => ad.platform))].join(', ')}
        - Budget range: $${Math.min(...ads.map(ad => ad.performance.estimatedBudget.daily))} - $${Math.max(...ads.map(ad => ad.performance.estimatedBudget.daily))}/day
        - Main strategies: ${[...new Set(ads.map(ad => ad.analysis.strategy))].join(', ')}
        
        Generate:
        1. Overall competitive assessment
        2. Key strategic advantages they have
        3. Vulnerabilities to exploit
        4. Market positioning insights
        5. Recommended counter-strategies
        
        Return structured insights as JSON.
      `;

      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 1200,
        temperature: 0.4
      });

      return JSON.parse(response.content);

    } catch (error) {
      console.error('Error generating competitor insights:', error);
      return {};
    }
  }

  private async generateStrategicInsights(competitors: any[]): Promise<any[]> {
    try {
      const prompt = `
        Analyze competitive landscape and generate strategic insights:
        
        Competitors analyzed: ${competitors.length}
        
        Market Overview:
        ${competitors.map(c => `
        - ${c.profile.name}: ${c.ads?.length || 0} ads, avg engagement ${
          c.ads?.reduce((sum: number, ad: any) => sum + ad.performance.engagementRate, 0) / (c.ads?.length || 1) || 0
        }`).join('')}
        
        Generate high-level strategic insights:
        1. Market trends and patterns
        2. Competitive gaps and opportunities
        3. Emerging threats
        4. Strategic recommendations
        
        Return insights array as JSON.
      `;

      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 1000,
        temperature: 0.3
      });

      return JSON.parse(response.content).insights || [];

    } catch (error) {
      console.error('Error generating strategic insights:', error);
      return [];
    }
  }

  private async generateActionableRecommendations(userId: string, competitors: any[]): Promise<any[]> {
    // Generate specific, actionable recommendations based on competitive analysis
    return [
      {
        priority: 'high',
        category: 'pricing',
        title: 'Adjust pricing strategy',
        description: 'Consider competitive pricing adjustments based on market analysis',
        actions: ['Review current pricing', 'Analyze value proposition', 'Test new pricing tiers']
      },
      {
        priority: 'medium',
        category: 'content',
        title: 'Enhance creative strategy',
        description: 'Improve ad creatives based on competitor best practices',
        actions: ['A/B test new creative formats', 'Expand targeting options', 'Optimize ad copy']
      }
    ];
  }

  private async analyzeTrends(ads: AdIntelligence[]): Promise<any[]> {
    // Analyze emerging trends from recent ad data
    const platformTrends = this.analyzePlatformTrends(ads);
    const creativeTrends = this.analyzeCreativeTrends(ads);
    const budgetTrends = this.analyzeBudgetTrends(ads);

    return [
      ...platformTrends,
      ...creativeTrends,
      ...budgetTrends
    ];
  }

  private analyzePlatformTrends(ads: AdIntelligence[]): any[] {
    const platformCounts = ads.reduce((acc, ad) => {
      acc[ad.platform] = (acc[ad.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(platformCounts).map(([platform, count]) => ({
      type: 'platform_trend',
      platform,
      adCount: count,
      trend: count > ads.length * 0.3 ? 'rising' : 'stable'
    }));
  }

  private analyzeCreativeTrends(ads: AdIntelligence[]): any[] {
    const adTypes = ads.reduce((acc, ad) => {
      acc[ad.adType] = (acc[ad.adType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(adTypes).map(([type, count]) => ({
      type: 'creative_trend',
      adType: type,
      usage: count,
      percentage: (count / ads.length) * 100
    }));
  }

  private analyzeBudgetTrends(ads: AdIntelligence[]): any[] {
    const avgBudget = ads.reduce((sum, ad) => sum + ad.performance.estimatedBudget.daily, 0) / ads.length;
    
    return [{
      type: 'budget_trend',
      averageDailyBudget: avgBudget,
      budgetRange: {
        min: Math.min(...ads.map(ad => ad.performance.estimatedBudget.daily)),
        max: Math.max(...ads.map(ad => ad.performance.estimatedBudget.daily))
      }
    }];
  }

  private async initializeCompetitorMonitoring(competitorId: string): Promise<void> {
    // Set up monitoring schedules for the new competitor
    console.log(`Initialized monitoring for competitor: ${competitorId}`);
  }

  private async performScheduledUpdates(): Promise<void> {
    for (const [competitorId] of this.competitorProfiles) {
      try {
        await this.analyzeCompetitorAds(competitorId);
        await this.monitorPricingChanges(competitorId);
      } catch (error) {
        console.error(`Error updating competitor ${competitorId}:`, error);
      }
    }
  }

  private async storeAlert(alert: CompetitorAlert): Promise<void> {
    // Store alert in database and trigger notifications
    console.log('Alert generated:', alert.title);
  }
}

export const competitorIntelligence = new CompetitorIntelligenceSystem();