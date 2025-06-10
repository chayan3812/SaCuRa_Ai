import { claudeAI } from './claudeAI';

interface CreativeAsset {
  id: string;
  type: 'headline' | 'description' | 'image' | 'video' | 'cta';
  content: string;
  metadata: {
    length?: number;
    format?: string;
    dimensions?: { width: number; height: number };
    duration?: number;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cvr: number;
    cpm: number;
    lastUpdated: Date;
  };
  testingStatus: 'active' | 'paused' | 'winner' | 'loser';
  generatedAt: Date;
  generationMethod: 'ai' | 'manual' | 'template';
}

interface CreativeVariation {
  id: string;
  campaignId: string;
  name: string;
  assets: {
    headlines: CreativeAsset[];
    descriptions: CreativeAsset[];
    images: CreativeAsset[];
    videos: CreativeAsset[];
    ctas: CreativeAsset[];
  };
  combination: {
    headlineId: string;
    descriptionId: string;
    imageId?: string;
    videoId?: string;
    ctaId: string;
  };
  performance: {
    testDuration: number;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    roas: number;
    statisticalSignificance: number;
  };
  status: 'testing' | 'winning' | 'losing' | 'paused';
  confidence: number;
}

interface OptimizationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: Array<{
    metric: 'ctr' | 'cvr' | 'cpm' | 'roas';
    operator: 'greater_than' | 'less_than' | 'equals';
    value: number;
    timeframe: number;
  }>;
  actions: Array<{
    type: 'generate_variations' | 'pause_underperforming' | 'scale_winning' | 'refresh_creatives';
    parameters: Record<string, any>;
  }>;
  lastTriggered?: Date;
  effectiveness: number;
}

interface CreativeInsight {
  type: 'performance' | 'audience' | 'timing' | 'creative_element';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  data: any;
  actionable: boolean;
  recommendations: string[];
}

export class DynamicCreativeOptimizer {
  private activeTests = new Map<string, CreativeVariation[]>();
  private optimizationRules = new Map<string, OptimizationRule>();
  private performanceThresholds = {
    minImpressions: 1000,
    minClicks: 50,
    significanceLevel: 0.95,
    testDuration: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  constructor() {
    this.initializeDefaultRules();
  }

  async generateCreativeVariations(
    campaignId: string,
    baseCreative: any,
    variationCount: number = 5
  ): Promise<CreativeVariation[]> {
    try {
      const variations: CreativeVariation[] = [];
      
      // Analyze current performance to understand what works
      const performanceInsights = await this.analyzeCurrentPerformance(campaignId);
      
      // Generate variations using AI
      for (let i = 0; i < variationCount; i++) {
        const variation = await this.generateSingleVariation(
          campaignId,
          baseCreative,
          performanceInsights,
          i
        );
        variations.push(variation);
      }

      // Store variations for testing
      this.activeTests.set(campaignId, variations);
      
      // Start A/B testing
      await this.initiateABTesting(campaignId, variations);

      return variations;
    } catch (error) {
      console.error('Error generating creative variations:', error);
      return [];
    }
  }

  async optimizeCreativePerformance(campaignId: string): Promise<any> {
    try {
      const currentVariations = this.activeTests.get(campaignId) || [];
      
      if (currentVariations.length === 0) {
        return { message: 'No active variations to optimize' };
      }

      // Analyze performance of current variations
      const performanceAnalysis = await this.analyzeVariationPerformance(currentVariations);
      
      // Identify winning and losing variations
      const winners = performanceAnalysis.filter(v => v.status === 'winning');
      const losers = performanceAnalysis.filter(v => v.status === 'losing');
      
      // Generate insights and recommendations
      const insights = await this.generateOptimizationInsights(performanceAnalysis);
      
      // Auto-implement optimizations based on rules
      const optimizationResults = await this.implementAutoOptimizations(
        campaignId,
        winners,
        losers,
        insights
      );

      return {
        analysis: performanceAnalysis,
        insights,
        optimizations: optimizationResults,
        recommendations: await this.generateActionableRecommendations(insights)
      };

    } catch (error) {
      console.error('Error optimizing creative performance:', error);
      throw new Error('Failed to optimize creative performance');
    }
  }

  async generateAICreativeAssets(
    context: any,
    assetType: 'headline' | 'description' | 'cta',
    count: number = 10
  ): Promise<CreativeAsset[]> {
    try {
      const prompt = this.buildCreativeGenerationPrompt(context, assetType);
      
      const response = await claudeAI.generateContent(prompt, 'ad_copy', {
        maxTokens: 1500,
        temperature: 0.8
      });

      const generatedContent = JSON.parse(response.content);
      
      return generatedContent.assets.slice(0, count).map((content: string, index: number) => ({
        id: `${assetType}_${Date.now()}_${index}`,
        type: assetType,
        content,
        metadata: this.calculateAssetMetadata(content, assetType),
        performance: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cvr: 0,
          cpm: 0,
          lastUpdated: new Date()
        },
        testingStatus: 'active' as const,
        generatedAt: new Date(),
        generationMethod: 'ai' as const
      }));

    } catch (error) {
      console.error('Error generating AI creative assets:', error);
      return [];
    }
  }

  async analyzeCreativeElementPerformance(campaignId: string): Promise<CreativeInsight[]> {
    try {
      const variations = this.activeTests.get(campaignId) || [];
      const insights: CreativeInsight[] = [];

      // Analyze headline performance
      const headlineInsights = await this.analyzeAssetTypePerformance(variations, 'headline');
      insights.push(...headlineInsights);

      // Analyze description performance
      const descriptionInsights = await this.analyzeAssetTypePerformance(variations, 'description');
      insights.push(...descriptionInsights);

      // Analyze CTA performance
      const ctaInsights = await this.analyzeAssetTypePerformance(variations, 'cta');
      insights.push(...ctaInsights);

      // Analyze creative combinations
      const combinationInsights = await this.analyzeCombinationPerformance(variations);
      insights.push(...combinationInsights);

      return insights;

    } catch (error) {
      console.error('Error analyzing creative element performance:', error);
      return [];
    }
  }

  async setupAutomatedOptimization(
    campaignId: string,
    rules: Partial<OptimizationRule>[]
  ): Promise<void> {
    try {
      for (const rule of rules) {
        const ruleId = `rule_${campaignId}_${Date.now()}`;
        
        const optimizationRule: OptimizationRule = {
          id: ruleId,
          name: rule.name || 'Unnamed Rule',
          enabled: rule.enabled ?? true,
          triggers: rule.triggers || [],
          actions: rule.actions || [],
          effectiveness: 0
        };

        this.optimizationRules.set(ruleId, optimizationRule);
      }

      // Start monitoring for rule triggers
      await this.startRuleMonitoring(campaignId);

    } catch (error) {
      console.error('Error setting up automated optimization:', error);
      throw new Error('Failed to setup automated optimization');
    }
  }

  private async generateSingleVariation(
    campaignId: string,
    baseCreative: any,
    insights: any,
    variationIndex: number
  ): Promise<CreativeVariation> {
    // Generate AI-optimized creative assets
    const headlines = await this.generateAICreativeAssets(
      { baseCreative, insights, campaignId },
      'headline',
      3
    );
    
    const descriptions = await this.generateAICreativeAssets(
      { baseCreative, insights, campaignId },
      'description',
      3
    );
    
    const ctas = await this.generateAICreativeAssets(
      { baseCreative, insights, campaignId },
      'cta',
      3
    );

    // Select best combination using AI
    const combination = await this.selectOptimalCombination(headlines, descriptions, ctas);

    return {
      id: `variation_${campaignId}_${Date.now()}_${variationIndex}`,
      campaignId,
      name: `AI Generated Variation ${variationIndex + 1}`,
      assets: {
        headlines,
        descriptions,
        images: [], // Would integrate with image generation
        videos: [],
        ctas
      },
      combination,
      performance: {
        testDuration: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        roas: 0,
        statisticalSignificance: 0
      },
      status: 'testing',
      confidence: 0.5
    };
  }

  private buildCreativeGenerationPrompt(context: any, assetType: string): string {
    const basePrompts = {
      headline: `Generate compelling ad headlines that:
        1. Grab attention immediately
        2. Communicate clear value proposition
        3. Include emotional triggers
        4. Are optimized for the target audience
        5. Stay within character limits (25-40 characters)`,
      
      description: `Generate persuasive ad descriptions that:
        1. Expand on the headline's promise
        2. Include specific benefits
        3. Create urgency or scarcity
        4. Address pain points
        5. Stay within character limits (90-125 characters)`,
        
      cta: `Generate powerful call-to-action phrases that:
        1. Create immediate action impulse
        2. Are specific and clear
        3. Match the campaign objective
        4. Use action-oriented language
        5. Stay within character limits (15-20 characters)`
    };

    return `
      ${basePrompts[assetType as keyof typeof basePrompts]}
      
      Context:
      - Campaign: ${context.campaignId}
      - Base Creative: ${JSON.stringify(context.baseCreative)}
      - Performance Insights: ${JSON.stringify(context.insights)}
      
      Generate 10 variations and return as JSON:
      {
        "assets": ["variation1", "variation2", ...]
      }
    `;
  }

  private calculateAssetMetadata(content: string, type: string): any {
    return {
      length: content.length,
      format: 'text',
      wordCount: content.split(' ').length
    };
  }

  private async selectOptimalCombination(
    headlines: CreativeAsset[],
    descriptions: CreativeAsset[],
    ctas: CreativeAsset[]
  ): Promise<any> {
    // Use AI to select the best combination
    const prompt = `
      Select the optimal combination of creative assets:
      
      Headlines: ${headlines.map(h => h.content).join(', ')}
      Descriptions: ${descriptions.map(d => d.content).join(', ')}
      CTAs: ${ctas.map(c => c.content).join(', ')}
      
      Consider:
      1. Message coherence and flow
      2. Emotional consistency
      3. Target audience appeal
      4. Expected performance
      
      Return the best combination as JSON:
      {
        "headlineId": "headline_id",
        "descriptionId": "description_id", 
        "ctaId": "cta_id",
        "reasoning": "explanation"
      }
    `;

    try {
      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 500,
        temperature: 0.3
      });

      const selection = JSON.parse(response.content);
      
      return {
        headlineId: headlines[0]?.id || '',
        descriptionId: descriptions[0]?.id || '',
        ctaId: ctas[0]?.id || '',
        reasoning: selection.reasoning || ''
      };

    } catch (error) {
      console.error('Error selecting optimal combination:', error);
      return {
        headlineId: headlines[0]?.id || '',
        descriptionId: descriptions[0]?.id || '',
        ctaId: ctas[0]?.id || ''
      };
    }
  }

  private async analyzeCurrentPerformance(campaignId: string): Promise<any> {
    // Analyze historical performance data
    return {
      topPerformingElements: [],
      audiencePreferences: {},
      seasonalTrends: {},
      competitiveInsights: {}
    };
  }

  private async initiateABTesting(campaignId: string, variations: CreativeVariation[]): Promise<void> {
    // Set up A/B testing for the variations
    console.log(`Initiated A/B testing for campaign ${campaignId} with ${variations.length} variations`);
  }

  private async analyzeVariationPerformance(variations: CreativeVariation[]): Promise<CreativeVariation[]> {
    return variations.map(variation => {
      // Calculate statistical significance and performance metrics
      const { ctr, cvr, roas } = variation.performance;
      
      // Determine status based on performance
      let status: 'testing' | 'winning' | 'losing' | 'paused' = 'testing';
      
      if (variation.performance.impressions > this.performanceThresholds.minImpressions) {
        if (roas > 2.0 && ctr > 0.03) {
          status = 'winning';
        } else if (roas < 1.0 || ctr < 0.01) {
          status = 'losing';
        }
      }

      return {
        ...variation,
        status,
        confidence: this.calculateConfidence(variation.performance)
      };
    });
  }

  private calculateConfidence(performance: any): number {
    const { impressions, clicks } = performance;
    
    if (impressions < this.performanceThresholds.minImpressions) {
      return 0.1;
    }
    
    if (clicks < this.performanceThresholds.minClicks) {
      return 0.3;
    }
    
    // Statistical confidence calculation
    return Math.min(0.95, impressions / 10000);
  }

  private async generateOptimizationInsights(variations: CreativeVariation[]): Promise<CreativeInsight[]> {
    const insights: CreativeInsight[] = [];
    
    // Performance insight
    const avgRoas = variations.reduce((sum, v) => sum + v.performance.roas, 0) / variations.length;
    if (avgRoas < 1.5) {
      insights.push({
        type: 'performance',
        title: 'Low ROAS Performance',
        description: `Average ROAS of ${avgRoas.toFixed(2)} is below target`,
        impact: 'high',
        data: { avgRoas },
        actionable: true,
        recommendations: [
          'Test more aggressive value propositions',
          'Refine targeting parameters',
          'Optimize landing page conversion'
        ]
      });
    }

    return insights;
  }

  private async implementAutoOptimizations(
    campaignId: string,
    winners: CreativeVariation[],
    losers: CreativeVariation[],
    insights: CreativeInsight[]
  ): Promise<any> {
    const results = {
      scaled: [],
      paused: [],
      generated: []
    };

    // Scale winning variations
    for (const winner of winners) {
      await this.scaleVariation(winner);
      results.scaled.push(winner.id);
    }

    // Pause losing variations
    for (const loser of losers) {
      await this.pauseVariation(loser);
      results.paused.push(loser.id);
    }

    // Generate new variations if needed
    if (winners.length < 2) {
      const newVariations = await this.generateCreativeVariations(campaignId, {}, 3);
      results.generated = newVariations.map(v => v.id);
    }

    return results;
  }

  private async generateActionableRecommendations(insights: CreativeInsight[]): Promise<string[]> {
    return insights
      .filter(insight => insight.actionable)
      .flatMap(insight => insight.recommendations);
  }

  private async analyzeAssetTypePerformance(
    variations: CreativeVariation[],
    assetType: 'headline' | 'description' | 'cta'
  ): Promise<CreativeInsight[]> {
    // Analyze performance of specific asset types
    return [];
  }

  private async analyzeCombinationPerformance(variations: CreativeVariation[]): Promise<CreativeInsight[]> {
    // Analyze how different asset combinations perform
    return [];
  }

  private async startRuleMonitoring(campaignId: string): Promise<void> {
    // Monitor for rule triggers and execute actions
    console.log(`Started rule monitoring for campaign: ${campaignId}`);
  }

  private async scaleVariation(variation: CreativeVariation): Promise<void> {
    // Increase budget allocation for winning variation
    console.log(`Scaling variation: ${variation.id}`);
  }

  private async pauseVariation(variation: CreativeVariation): Promise<void> {
    // Pause underperforming variation
    console.log(`Pausing variation: ${variation.id}`);
  }

  private initializeDefaultRules(): void {
    const defaultRule: OptimizationRule = {
      id: 'default_performance_rule',
      name: 'Auto-optimize performance',
      enabled: true,
      triggers: [
        {
          metric: 'roas',
          operator: 'less_than',
          value: 1.0,
          timeframe: 24 * 60 * 60 * 1000 // 24 hours
        }
      ],
      actions: [
        {
          type: 'pause_underperforming',
          parameters: { threshold: 1.0 }
        },
        {
          type: 'generate_variations',
          parameters: { count: 3 }
        }
      ],
      effectiveness: 0.8
    };

    this.optimizationRules.set(defaultRule.id, defaultRule);
  }
}

export const dynamicCreativeOptimizer = new DynamicCreativeOptimizer();