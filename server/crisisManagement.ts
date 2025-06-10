import { claudeAI } from './claudeAI';

interface CrisisEvent {
  id: string;
  type: 'sentiment_spike' | 'negative_review_surge' | 'social_media_backlash' | 'pr_incident' | 'product_issue' | 'customer_service_overload';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'responding' | 'contained' | 'resolved';
  detectedAt: Date;
  title: string;
  description: string;
  affectedChannels: string[];
  sentimentScore: number;
  volumeIncrease: number;
  keyMetrics: {
    negativeComments: number;
    neutralComments: number;
    positiveComments: number;
    shareVelocity: number;
    reachImpact: number;
    brandMentions: number;
  };
  rootCause?: string;
  responseStrategy: ResponseStrategy;
  timeline: Array<{
    timestamp: Date;
    action: string;
    result: string;
    actor: 'system' | 'human';
  }>;
}

interface ResponseStrategy {
  immediateActions: Array<{
    type: 'pause_ads' | 'activate_response_team' | 'draft_statement' | 'monitor_escalation' | 'engage_stakeholders';
    priority: number;
    automated: boolean;
    description: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  communicationPlan: {
    channels: string[];
    tone: 'apologetic' | 'explanatory' | 'defensive' | 'transparent' | 'empathetic';
    keyMessages: string[];
    approvalRequired: boolean;
  };
  containmentMeasures: Array<{
    action: string;
    timeframe: string;
    expectedImpact: string;
  }>;
  recoveryPlan: {
    shortTerm: string[];
    longTerm: string[];
    successMetrics: string[];
  };
}

interface SentimentMonitoring {
  pageId: string;
  baseline: {
    averageSentiment: number;
    typicalVolume: number;
    normalNegativePercentage: number;
  };
  current: {
    sentiment: number;
    volume: number;
    negativePercentage: number;
    lastUpdated: Date;
  };
  alerts: {
    sentimentThreshold: number;
    volumeThreshold: number;
    negativePercentageThreshold: number;
  };
}

interface CrisisAlert {
  id: string;
  crisisId: string;
  severity: 'warning' | 'critical' | 'emergency';
  message: string;
  channels: Array<'email' | 'sms' | 'slack' | 'dashboard'>;
  recipients: string[];
  sentAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class CrisisManagementSystem {
  private monitoringActive = false;
  private sentimentBaselines = new Map<string, SentimentMonitoring>();
  private activeCrises = new Map<string, CrisisEvent>();
  private responseTeam: string[] = [];
  private escalationThresholds = {
    sentiment: -0.3, // Sentiment drops below -0.3
    volumeSpike: 5.0, // 5x normal volume
    negativePercentage: 0.6 // 60% negative comments
  };

  async initializeMonitoring(pageIds: string[]): Promise<void> {
    try {
      for (const pageId of pageIds) {
        await this.establishSentimentBaseline(pageId);
      }
      
      this.monitoringActive = true;
      this.startRealTimeMonitoring();
      
      console.log('🚨 Crisis management monitoring initialized for', pageIds.length, 'pages');
    } catch (error) {
      console.error('Error initializing crisis monitoring:', error);
      throw new Error('Failed to initialize crisis monitoring');
    }
  }

  async detectCrisisEvents(): Promise<CrisisEvent[]> {
    try {
      const detectedCrises: CrisisEvent[] = [];
      
      for (const [pageId, monitoring] of this.sentimentBaselines) {
        const crisisIndicators = await this.analyzeCrisisIndicators(pageId, monitoring);
        
        if (crisisIndicators.isCrisis) {
          const crisis = await this.createCrisisEvent(pageId, crisisIndicators);
          detectedCrises.push(crisis);
          this.activeCrises.set(crisis.id, crisis);
        }
      }

      return detectedCrises;
    } catch (error) {
      console.error('Error detecting crisis events:', error);
      return [];
    }
  }

  async respondToCrisis(crisisId: string): Promise<any> {
    try {
      const crisis = this.activeCrises.get(crisisId);
      if (!crisis) {
        throw new Error('Crisis not found');
      }

      // Execute immediate response actions
      const immediateResults = await this.executeImmediateResponse(crisis);
      
      // Generate and deploy communication response
      const communicationResults = await this.deployCommunicationResponse(crisis);
      
      // Implement containment measures
      const containmentResults = await this.implementContainmentMeasures(crisis);
      
      // Update crisis status
      crisis.status = 'responding';
      crisis.timeline.push({
        timestamp: new Date(),
        action: 'Crisis response initiated',
        result: 'All immediate actions triggered',
        actor: 'system'
      });

      return {
        crisisId,
        immediate: immediateResults,
        communication: communicationResults,
        containment: containmentResults,
        nextSteps: await this.generateNextSteps(crisis)
      };

    } catch (error) {
      console.error('Error responding to crisis:', error);
      throw new Error('Failed to respond to crisis');
    }
  }

  async generateCrisisStatement(
    crisisId: string,
    context: any
  ): Promise<{ statement: string; tone: string; channels: string[] }> {
    try {
      const crisis = this.activeCrises.get(crisisId);
      if (!crisis) {
        throw new Error('Crisis not found');
      }

      const prompt = `
        Generate a crisis communication statement for this situation:
        
        Crisis Type: ${crisis.type}
        Severity: ${crisis.severity}
        Description: ${crisis.description}
        Affected Channels: ${crisis.affectedChannels.join(', ')}
        
        Key Metrics:
        - Sentiment Score: ${crisis.sentimentScore}
        - Negative Comments: ${crisis.keyMetrics.negativeComments}
        - Brand Mentions: ${crisis.keyMetrics.brandMentions}
        
        Context: ${JSON.stringify(context)}
        
        Generate a professional crisis statement that:
        1. Acknowledges the situation appropriately
        2. Takes responsibility where needed
        3. Explains steps being taken
        4. Reassures stakeholders
        5. Provides next steps or timeline
        
        Consider the tone should be: ${crisis.responseStrategy.communicationPlan.tone}
        
        Return JSON with:
        {
          "statement": "full statement text",
          "tone": "communication tone",
          "channels": ["recommended channels"],
          "keyMessages": ["main points"],
          "timing": "when to publish"
        }
      `;

      const response = await claudeAI.generateContent(prompt, 'content', {
        maxTokens: 1500,
        temperature: 0.3
      });

      return JSON.parse(response.content);

    } catch (error) {
      console.error('Error generating crisis statement:', error);
      return {
        statement: 'We are aware of the current situation and are actively working to address it. We will provide updates as more information becomes available.',
        tone: 'transparent',
        channels: ['facebook', 'website']
      };
    }
  }

  async trackCrisisResolution(crisisId: string): Promise<any> {
    try {
      const crisis = this.activeCrises.get(crisisId);
      if (!crisis) {
        throw new Error('Crisis not found');
      }

      // Monitor resolution metrics
      const resolutionMetrics = await this.calculateResolutionMetrics(crisis);
      
      // Check if crisis is contained
      const isContained = await this.assessCrisisContainment(crisis);
      
      if (isContained) {
        crisis.status = 'contained';
        await this.initiatRecoveryPhase(crisis);
      }

      return {
        crisisId,
        status: crisis.status,
        metrics: resolutionMetrics,
        isContained,
        timeToContainment: isContained ? Date.now() - crisis.detectedAt.getTime() : null,
        recoveryProgress: crisis.status === 'contained' ? await this.getRecoveryProgress(crisis) : null
      };

    } catch (error) {
      console.error('Error tracking crisis resolution:', error);
      throw new Error('Failed to track crisis resolution');
    }
  }

  async generateLessonsLearned(crisisId: string): Promise<any> {
    try {
      const crisis = this.activeCrises.get(crisisId);
      if (!crisis || crisis.status !== 'resolved') {
        throw new Error('Crisis not resolved or not found');
      }

      const prompt = `
        Analyze this resolved crisis and generate lessons learned:
        
        Crisis Summary:
        - Type: ${crisis.type}
        - Severity: ${crisis.severity}
        - Duration: ${Date.now() - crisis.detectedAt.getTime()} ms
        - Timeline: ${JSON.stringify(crisis.timeline)}
        
        Response Strategy Used:
        ${JSON.stringify(crisis.responseStrategy)}
        
        Generate comprehensive lessons learned:
        1. What worked well in the response
        2. What could have been done better
        3. Preventive measures for the future
        4. Process improvements
        5. Training recommendations
        
        Return structured analysis as JSON.
      `;

      const response = await claudeAI.generateContent(prompt, 'analysis', {
        maxTokens: 1200,
        temperature: 0.4
      });

      const lessonsLearned = JSON.parse(response.content);
      
      // Store lessons for future reference
      await this.storeLessonsLearned(crisisId, lessonsLearned);
      
      return lessonsLearned;

    } catch (error) {
      console.error('Error generating lessons learned:', error);
      return null;
    }
  }

  private async establishSentimentBaseline(pageId: string): Promise<void> {
    // Analyze historical data to establish normal sentiment patterns
    const historicalData = await this.getHistoricalSentimentData(pageId, 30); // 30 days
    
    const baseline = {
      averageSentiment: this.calculateAverageSentiment(historicalData),
      typicalVolume: this.calculateTypicalVolume(historicalData),
      normalNegativePercentage: this.calculateNormalNegativePercentage(historicalData)
    };

    this.sentimentBaselines.set(pageId, {
      pageId,
      baseline,
      current: {
        sentiment: baseline.averageSentiment,
        volume: baseline.typicalVolume,
        negativePercentage: baseline.normalNegativePercentage,
        lastUpdated: new Date()
      },
      alerts: {
        sentimentThreshold: baseline.averageSentiment + this.escalationThresholds.sentiment,
        volumeThreshold: baseline.typicalVolume * this.escalationThresholds.volumeSpike,
        negativePercentageThreshold: this.escalationThresholds.negativePercentage
      }
    });
  }

  private async analyzeCrisisIndicators(pageId: string, monitoring: SentimentMonitoring): Promise<any> {
    const currentData = await this.getCurrentSentimentData(pageId);
    
    const indicators = {
      sentimentDrop: monitoring.baseline.averageSentiment - currentData.sentiment,
      volumeSpike: currentData.volume / monitoring.baseline.typicalVolume,
      negativeSpike: currentData.negativePercentage - monitoring.baseline.normalNegativePercentage
    };

    const isCrisis = 
      indicators.sentimentDrop > Math.abs(this.escalationThresholds.sentiment) ||
      indicators.volumeSpike > this.escalationThresholds.volumeSpike ||
      currentData.negativePercentage > this.escalationThresholds.negativePercentage;

    return {
      isCrisis,
      indicators,
      currentData,
      severity: this.calculateCrisisSeverity(indicators)
    };
  }

  private async createCrisisEvent(pageId: string, indicators: any): Promise<CrisisEvent> {
    const crisisType = this.determineCrisisType(indicators);
    const severity = indicators.severity;
    
    const responseStrategy = await this.generateResponseStrategy(crisisType, severity);

    return {
      id: `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: crisisType,
      severity,
      status: 'detected',
      detectedAt: new Date(),
      title: `${crisisType.replace('_', ' ').toUpperCase()} detected`,
      description: `Crisis detected on page ${pageId} with ${severity} severity`,
      affectedChannels: [pageId],
      sentimentScore: indicators.currentData.sentiment,
      volumeIncrease: indicators.indicators.volumeSpike,
      keyMetrics: {
        negativeComments: indicators.currentData.negativeCount || 0,
        neutralComments: indicators.currentData.neutralCount || 0,
        positiveComments: indicators.currentData.positiveCount || 0,
        shareVelocity: indicators.currentData.shareVelocity || 0,
        reachImpact: indicators.currentData.reach || 0,
        brandMentions: indicators.currentData.mentions || 0
      },
      responseStrategy,
      timeline: [{
        timestamp: new Date(),
        action: 'Crisis detected by monitoring system',
        result: 'Alert generated and response strategy created',
        actor: 'system'
      }]
    };
  }

  private async generateResponseStrategy(
    crisisType: string,
    severity: string
  ): Promise<ResponseStrategy> {
    const prompt = `
      Generate a crisis response strategy for:
      Crisis Type: ${crisisType}
      Severity: ${severity}
      
      Create a comprehensive response plan including:
      1. Immediate actions to take
      2. Communication plan with tone and key messages
      3. Containment measures
      4. Recovery plan (short and long term)
      
      Return structured strategy as JSON.
    `;

    try {
      const response = await claudeAI.generateContent(prompt, 'strategy', {
        maxTokens: 1000,
        temperature: 0.3
      });

      return JSON.parse(response.content);
    } catch (error) {
      // Fallback strategy
      return {
        immediateActions: [
          {
            type: 'monitor_escalation',
            priority: 1,
            automated: true,
            description: 'Monitor situation escalation',
            completed: false
          }
        ],
        communicationPlan: {
          channels: ['facebook'],
          tone: 'transparent',
          keyMessages: ['We are aware of the situation', 'We are investigating'],
          approvalRequired: true
        },
        containmentMeasures: [
          {
            action: 'Increase monitoring frequency',
            timeframe: 'Immediate',
            expectedImpact: 'Better situation awareness'
          }
        ],
        recoveryPlan: {
          shortTerm: ['Address immediate concerns'],
          longTerm: ['Implement preventive measures'],
          successMetrics: ['Sentiment recovery', 'Volume normalization']
        }
      };
    }
  }

  private async executeImmediateResponse(crisis: CrisisEvent): Promise<any> {
    const results = [];
    
    for (const action of crisis.responseStrategy.immediateActions) {
      if (action.automated) {
        try {
          const result = await this.executeAutomatedAction(action, crisis);
          action.completed = true;
          action.completedAt = new Date();
          results.push({ action: action.type, success: true, result });
        } catch (error) {
          results.push({ action: action.type, success: false, error: error.message });
        }
      }
    }

    return results;
  }

  private async executeAutomatedAction(action: any, crisis: CrisisEvent): Promise<string> {
    switch (action.type) {
      case 'pause_ads':
        return await this.pauseRelatedAds(crisis.affectedChannels);
      case 'monitor_escalation':
        return await this.increaseMonitoringFrequency(crisis.id);
      case 'activate_response_team':
        return await this.notifyResponseTeam(crisis);
      default:
        return `Action ${action.type} queued for manual execution`;
    }
  }

  private async deployCommunicationResponse(crisis: CrisisEvent): Promise<any> {
    const plan = crisis.responseStrategy.communicationPlan;
    
    if (plan.approvalRequired) {
      return { status: 'pending_approval', message: 'Communication requires human approval' };
    }

    // Auto-deploy for low severity issues
    if (crisis.severity === 'low') {
      const statement = await this.generateCrisisStatement(crisis.id, {});
      return { status: 'deployed', statement, channels: plan.channels };
    }

    return { status: 'queued', message: 'Communication prepared for review' };
  }

  private calculateCrisisSeverity(indicators: any): 'low' | 'medium' | 'high' | 'critical' {
    const { sentimentDrop, volumeSpike, negativeSpike } = indicators;
    
    if (sentimentDrop > 0.7 || volumeSpike > 10 || negativeSpike > 0.8) {
      return 'critical';
    } else if (sentimentDrop > 0.5 || volumeSpike > 5 || negativeSpike > 0.6) {
      return 'high';
    } else if (sentimentDrop > 0.3 || volumeSpike > 3 || negativeSpike > 0.4) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private determineCrisisType(indicators: any): CrisisEvent['type'] {
    if (indicators.indicators.negativeSpike > 0.5) {
      return 'negative_review_surge';
    } else if (indicators.indicators.volumeSpike > 5) {
      return 'social_media_backlash';
    } else {
      return 'sentiment_spike';
    }
  }

  private startRealTimeMonitoring(): void {
    setInterval(async () => {
      if (this.monitoringActive) {
        await this.detectCrisisEvents();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // Helper methods for data collection and analysis
  private async getHistoricalSentimentData(pageId: string, days: number): Promise<any[]> {
    // In production, this would fetch actual historical sentiment data
    return [];
  }

  private async getCurrentSentimentData(pageId: string): Promise<any> {
    // In production, this would fetch real-time sentiment data
    return {
      sentiment: 0.2,
      volume: 100,
      negativePercentage: 0.3,
      negativeCount: 30,
      neutralCount: 50,
      positiveCount: 20
    };
  }

  private calculateAverageSentiment(data: any[]): number {
    return 0.3; // Baseline positive sentiment
  }

  private calculateTypicalVolume(data: any[]): number {
    return 50; // Baseline volume
  }

  private calculateNormalNegativePercentage(data: any[]): number {
    return 0.2; // 20% negative is normal
  }

  private async pauseRelatedAds(channels: string[]): Promise<string> {
    return `Paused ads for channels: ${channels.join(', ')}`;
  }

  private async increaseMonitoringFrequency(crisisId: string): Promise<string> {
    return `Increased monitoring frequency for crisis: ${crisisId}`;
  }

  private async notifyResponseTeam(crisis: CrisisEvent): Promise<string> {
    return `Response team notified of ${crisis.severity} crisis`;
  }

  private async implementContainmentMeasures(crisis: CrisisEvent): Promise<any> {
    return { status: 'implemented', measures: crisis.responseStrategy.containmentMeasures.length };
  }

  private async generateNextSteps(crisis: CrisisEvent): Promise<string[]> {
    return [
      'Monitor sentiment trends closely',
      'Prepare detailed response if escalation continues',
      'Review and adjust containment measures'
    ];
  }

  private async calculateResolutionMetrics(crisis: CrisisEvent): Promise<any> {
    return {
      sentimentRecovery: 0.1,
      volumeNormalization: 0.8,
      negativeCommentReduction: 0.6
    };
  }

  private async assessCrisisContainment(crisis: CrisisEvent): Promise<boolean> {
    // Check if crisis indicators have returned to normal levels
    return crisis.sentimentScore > -0.2 && crisis.volumeIncrease < 2.0;
  }

  private async initiatRecoveryPhase(crisis: CrisisEvent): Promise<void> {
    crisis.timeline.push({
      timestamp: new Date(),
      action: 'Recovery phase initiated',
      result: 'Crisis contained, beginning recovery activities',
      actor: 'system'
    });
  }

  private async getRecoveryProgress(crisis: CrisisEvent): Promise<any> {
    return {
      phase: 'early_recovery',
      completedActions: 3,
      totalActions: 8,
      estimatedTimeToResolution: '2-4 hours'
    };
  }

  private async storeLessonsLearned(crisisId: string, lessons: any): Promise<void> {
    // Store lessons learned for future crisis management improvement
    console.log(`Lessons learned stored for crisis: ${crisisId}`);
  }
}

export const crisisManagement = new CrisisManagementSystem();