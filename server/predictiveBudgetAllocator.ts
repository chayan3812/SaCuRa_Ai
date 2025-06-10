import { claudeAI } from './claudeAI';
import { openai } from './openai';

interface CampaignBudgetData {
  campaignId: string;
  name: string;
  objective: string;
  currentBudget: {
    daily: number;
    total: number;
    spent: number;
    remaining: number;
  };
  performance: {
    roas: number;
    ctr: number;
    cpm: number;
    conversions: number;
    revenue: number;
    costPerConversion: number;
  };
  trends: {
    roasTrend: 'up' | 'down' | 'stable';
    volumeTrend: 'up' | 'down' | 'stable';
    competitionTrend: 'up' | 'down' | 'stable';
  };
  seasonality: {
    currentSeason: string;
    seasonalityFactor: number;
    historicalPerformance: any[];
  };
  audience: {
    size: number;
    saturation: number;
    competitiveness: number;
  };
}

interface BudgetRecommendation {
  campaignId: string;
  currentBudget: number;
  recommendedBudget: number;
  budgetChange: number;
  changePercentage: number;
  reasoning: string[];
  confidence: number;
  expectedImpact: {
    roasChange: number;
    volumeChange: number;
    revenueChange: number;
  };
  timeframe: {
    implementationDate: Date;
    reviewDate: Date;
    duration: number;
  };
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    mitigationStrategies: string[];
  };
}

interface PortfolioOptimization {
  totalBudget: number;
  allocations: BudgetRecommendation[];
  portfolioMetrics: {
    expectedRoas: number;
    expectedRevenue: number;
    riskScore: number;
    diversificationScore: number;
  };
  reallocationStrategy: {
    moveBudgetFrom: string[];
    moveBudgetTo: string[];
    netImpact: number;
  };
}

export class PredictiveBudgetAllocator {
  private learningWindow = 30; // days
  private confidenceThreshold = 0.7;
  private maxBudgetChangePercentage = 0.5; // 50% max change
  private minDailyBudget = 10;

  async analyzeCampaignPerformance(userId: string): Promise<CampaignBudgetData[]> {
    try {
      const campaigns = await this.getCampaignData(userId);
      const enrichedCampaigns: CampaignBudgetData[] = [];

      for (const campaign of campaigns) {
        const trends = await this.calculatePerformanceTrends(campaign.campaignId);
        const seasonality = await this.analyzeSeasonality(campaign.campaignId);
        const audienceData = await this.getAudienceInsights(campaign.campaignId);

        enrichedCampaigns.push({
          ...campaign,
          trends,
          seasonality,
          audience: audienceData
        });
      }

      return enrichedCampaigns;
    } catch (error) {
      console.error('Error analyzing campaign performance:', error);
      return [];
    }
  }

  async generateBudgetRecommendations(
    campaignData: CampaignBudgetData[]
  ): Promise<BudgetRecommendation[]> {
    const recommendations: BudgetRecommendation[] = [];

    for (const campaign of campaignData) {
      try {
        const recommendation = await this.calculateOptimalBudget(campaign);
        if (recommendation.confidence >= this.confidenceThreshold) {
          recommendations.push(recommendation);
        }
      } catch (error) {
        console.error(`Error generating recommendation for campaign ${campaign.campaignId}:`, error);
      }
    }

    return recommendations;
  }

  async optimizePortfolioBudget(
    userId: string,
    totalBudget: number,
    constraints?: any
  ): Promise<PortfolioOptimization> {
    try {
      const campaignData = await this.analyzeCampaignPerformance(userId);
      const individualRecommendations = await this.generateBudgetRecommendations(campaignData);

      // Use AI to optimize the entire portfolio
      const portfolioOptimization = await this.generatePortfolioOptimization(
        campaignData,
        individualRecommendations,
        totalBudget,
        constraints
      );

      return portfolioOptimization;
    } catch (error) {
      console.error('Error optimizing portfolio budget:', error);
      throw new Error('Failed to optimize portfolio budget');
    }
  }

  private async calculateOptimalBudget(campaign: CampaignBudgetData): Promise<BudgetRecommendation> {
    try {
      const prompt = `
        Analyze this campaign and recommend optimal budget allocation:
        
        Campaign Data:
        - Name: ${campaign.name}
        - Current Daily Budget: $${campaign.currentBudget.daily}
        - ROAS: ${campaign.performance.roas}
        - CTR: ${campaign.performance.ctr}%
        - Cost per Conversion: $${campaign.performance.costPerConversion}
        - Audience Saturation: ${campaign.audience.saturation}%
        - Seasonality Factor: ${campaign.seasonality.seasonalityFactor}
        - Trends: ROAS ${campaign.trends.roasTrend}, Volume ${campaign.trends.volumeTrend}
        
        Consider:
        1. Performance efficiency vs. current spend
        2. Market opportunity and audience saturation
        3. Seasonal trends and competitive landscape
        4. Risk factors and budget constraints
        5. Expected ROI and scaling potential
        
        Provide budget recommendation with:
        - Recommended daily budget
        - Detailed reasoning
        - Expected impact metrics
        - Risk assessment
        - Implementation timeline
        
        Return as JSON with specific numeric recommendations.
      `;

      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 1500,
        temperature: 0.3
      });

      const aiRecommendation = JSON.parse(response.content);

      // Apply business rules and constraints
      const recommendedBudget = this.applyBudgetConstraints(
        aiRecommendation.recommendedBudget,
        campaign.currentBudget.daily
      );

      const budgetChange = recommendedBudget - campaign.currentBudget.daily;
      const changePercentage = (budgetChange / campaign.currentBudget.daily) * 100;

      // Calculate confidence based on data quality and model certainty
      const confidence = this.calculateRecommendationConfidence(campaign, aiRecommendation);

      return {
        campaignId: campaign.campaignId,
        currentBudget: campaign.currentBudget.daily,
        recommendedBudget,
        budgetChange,
        changePercentage,
        reasoning: aiRecommendation.reasoning || [],
        confidence,
        expectedImpact: aiRecommendation.expectedImpact || {
          roasChange: 0,
          volumeChange: 0,
          revenueChange: 0
        },
        timeframe: {
          implementationDate: new Date(),
          reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          duration: 7
        },
        riskAssessment: aiRecommendation.riskAssessment || {
          riskLevel: 'medium' as const,
          riskFactors: [],
          mitigationStrategies: []
        }
      };

    } catch (error) {
      console.error('Error calculating optimal budget:', error);
      throw new Error('Failed to calculate optimal budget');
    }
  }

  private async generatePortfolioOptimization(
    campaignData: CampaignBudgetData[],
    recommendations: BudgetRecommendation[],
    totalBudget: number,
    constraints?: any
  ): Promise<PortfolioOptimization> {
    try {
      const prompt = `
        Optimize budget allocation across this campaign portfolio:
        
        Total Available Budget: $${totalBudget}
        
        Campaigns:
        ${campaignData.map(c => `
        - ${c.name}: Current $${c.currentBudget.daily}/day, ROAS ${c.performance.roas}
        `).join('')}
        
        Individual Recommendations:
        ${recommendations.map(r => `
        - ${r.campaignId}: Recommended $${r.recommendedBudget}/day (${r.changePercentage.toFixed(1)}% change)
        `).join('')}
        
        Optimize for:
        1. Maximum portfolio ROAS
        2. Risk diversification
        3. Growth opportunities
        4. Market constraints
        
        Consider:
        - Campaign interdependencies
        - Market saturation effects
        - Budget reallocation efficiency
        - Risk management
        
        Return JSON with:
        - Final budget allocations
        - Portfolio metrics
        - Reallocation strategy
        - Expected outcomes
      `;

      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 2000,
        temperature: 0.2
      });

      const optimization = JSON.parse(response.content);

      // Ensure budget allocations sum to total budget
      const normalizedAllocations = this.normalizeBudgetAllocations(
        optimization.allocations,
        totalBudget
      );

      return {
        totalBudget,
        allocations: normalizedAllocations,
        portfolioMetrics: optimization.portfolioMetrics || {
          expectedRoas: 0,
          expectedRevenue: 0,
          riskScore: 0,
          diversificationScore: 0
        },
        reallocationStrategy: optimization.reallocationStrategy || {
          moveBudgetFrom: [],
          moveBudgetTo: [],
          netImpact: 0
        }
      };

    } catch (error) {
      console.error('Error generating portfolio optimization:', error);
      throw new Error('Failed to generate portfolio optimization');
    }
  }

  async forecastBudgetPerformance(
    campaignId: string,
    proposedBudget: number,
    timeframe: number = 30
  ): Promise<any> {
    try {
      const historicalData = await this.getHistoricalPerformance(campaignId, 90);
      const marketData = await this.getMarketConditions(campaignId);

      const prompt = `
        Forecast campaign performance with proposed budget change:
        
        Campaign ID: ${campaignId}
        Current Budget: $${historicalData.currentBudget}
        Proposed Budget: $${proposedBudget}
        Forecast Period: ${timeframe} days
        
        Historical Performance (90 days):
        ${JSON.stringify(historicalData.metrics)}
        
        Market Conditions:
        ${JSON.stringify(marketData)}
        
        Predict:
        1. Daily and cumulative performance metrics
        2. Scaling effects and diminishing returns
        3. Market response and competitive impact
        4. Risk scenarios (best/worst/likely case)
        
        Return detailed forecast with confidence intervals.
      `;

      const response = await claudeAI.generateContent(prompt, 'ai_analysis', {
        maxTokens: 1500,
        temperature: 0.3
      });

      return JSON.parse(response.content);

    } catch (error) {
      console.error('Error forecasting budget performance:', error);
      return null;
    }
  }

  async implementBudgetChanges(
    userId: string,
    recommendations: BudgetRecommendation[]
  ): Promise<any> {
    try {
      const implementationResults = [];

      for (const rec of recommendations) {
        if (Math.abs(rec.changePercentage) > 5) { // Only implement significant changes
          const result = await this.updateCampaignBudget(rec.campaignId, rec.recommendedBudget);
          implementationResults.push({
            campaignId: rec.campaignId,
            success: result.success,
            oldBudget: rec.currentBudget,
            newBudget: rec.recommendedBudget,
            implementedAt: new Date()
          });
        }
      }

      return {
        implementedChanges: implementationResults.filter(r => r.success),
        failedChanges: implementationResults.filter(r => !r.success),
        totalChanges: implementationResults.length
      };

    } catch (error) {
      console.error('Error implementing budget changes:', error);
      throw new Error('Failed to implement budget changes');
    }
  }

  private applyBudgetConstraints(recommendedBudget: number, currentBudget: number): number {
    // Apply maximum change percentage constraint
    const maxChange = currentBudget * this.maxBudgetChangePercentage;
    const constrainedBudget = Math.min(
      Math.max(recommendedBudget, currentBudget - maxChange),
      currentBudget + maxChange
    );

    // Apply minimum budget constraint
    return Math.max(constrainedBudget, this.minDailyBudget);
  }

  private calculateRecommendationConfidence(
    campaign: CampaignBudgetData,
    aiRecommendation: any
  ): number {
    let confidence = 0.5; // Base confidence

    // Data quality factors
    if (campaign.performance.conversions > 50) confidence += 0.2;
    if (campaign.currentBudget.spent > campaign.currentBudget.daily * 7) confidence += 0.1;

    // Performance stability
    if (campaign.trends.roasTrend === 'stable') confidence += 0.1;
    if (campaign.performance.roas > 1.5) confidence += 0.1;

    // Model confidence
    if (aiRecommendation.confidence) confidence *= aiRecommendation.confidence;

    return Math.min(confidence, 1.0);
  }

  private normalizeBudgetAllocations(
    allocations: any[],
    totalBudget: number
  ): BudgetRecommendation[] {
    const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.recommendedBudget, 0);
    const scaleFactor = totalBudget / totalAllocated;

    return allocations.map(alloc => ({
      ...alloc,
      recommendedBudget: alloc.recommendedBudget * scaleFactor
    }));
  }

  private async calculatePerformanceTrends(campaignId: string): Promise<any> {
    // Calculate 7-day vs 30-day performance trends
    return {
      roasTrend: 'up' as const,
      volumeTrend: 'stable' as const,
      competitionTrend: 'up' as const
    };
  }

  private async analyzeSeasonality(campaignId: string): Promise<any> {
    return {
      currentSeason: 'Q4',
      seasonalityFactor: 1.2,
      historicalPerformance: []
    };
  }

  private async getAudienceInsights(campaignId: string): Promise<any> {
    return {
      size: 1000000,
      saturation: 0.15,
      competitiveness: 0.7
    };
  }

  private async getCampaignData(userId: string): Promise<any[]> {
    // Return structured campaign data
    return [
      {
        campaignId: 'camp_123',
        name: 'Summer Sale Campaign',
        objective: 'conversions',
        currentBudget: {
          daily: 100,
          total: 3000,
          spent: 1500,
          remaining: 1500
        },
        performance: {
          roas: 3.2,
          ctr: 0.045,
          cpm: 12.5,
          conversions: 45,
          revenue: 4800,
          costPerConversion: 33.33
        }
      }
    ];
  }

  private async getHistoricalPerformance(campaignId: string, days: number): Promise<any> {
    return {
      currentBudget: 100,
      metrics: {}
    };
  }

  private async getMarketConditions(campaignId: string): Promise<any> {
    return {
      competition: 'high',
      seasonality: 'peak'
    };
  }

  private async updateCampaignBudget(campaignId: string, newBudget: number): Promise<any> {
    // Implement actual budget update via Facebook API
    return { success: true };
  }
}

export const predictiveBudgetAllocator = new PredictiveBudgetAllocator();