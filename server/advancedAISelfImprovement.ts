import { storage } from "./storage";
import OpenAI from "openai";
import { db } from "./db";
import { aiReplyFailures } from "@shared/schema";
import { desc, sql } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FailurePattern {
  pattern: string;
  frequency: number;
  examples: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  improvementSuggestion: string;
}

export interface LearningInsight {
  category: string;
  insight: string;
  confidence: number;
  actionable: boolean;
  implementation: string;
}

export interface AIPerformanceMetrics {
  totalInteractions: number;
  successRate: number;
  failureRate: number;
  improvementTrend: number;
  avgConfidenceScore: number;
  topFailureReasons: string[];
  learningVelocity: number;
}

export class AdvancedAISelfImprovement {
  private analysisCache: Map<string, any> = new Map();
  private learningQueue: Array<{ type: string; data: any; timestamp: Date }> = [];

  // Comprehensive failure pattern analysis
  async analyzeFailurePatterns(): Promise<FailurePattern[]> {
    try {
      const failures = await db
        .select()
        .from(aiReplyFailures)
        .orderBy(desc(aiReplyFailures.createdAt))
        .limit(100);

      if (failures.length === 0) {
        return [];
      }

      // Group explanations for pattern analysis
      const explanationsText = failures
        .map(f => f.explanation)
        .join('\n\n--- FAILURE EXPLANATION ---\n\n');

      const prompt = `
Analyze these AI failure explanations and identify distinct failure patterns. Group similar failures together and provide actionable insights.

${explanationsText}

Return a JSON array of failure patterns with this structure:
{
  "patterns": [
    {
      "pattern": "Brief description of the failure pattern",
      "frequency": estimated_frequency_percentage,
      "examples": ["example1", "example2"],
      "severity": "low|medium|high|critical", 
      "improvementSuggestion": "Specific actionable improvement"
    }
  ]
}

Focus on identifying:
- Tone and empathy issues
- Missing context or information
- Generic vs specific responses
- Technical understanding gaps
- Communication style mismatches
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"patterns": []}');
      return result.patterns || [];
    } catch (error) {
      console.error('Error analyzing failure patterns:', error);
      return [];
    }
  }

  // Generate learning insights from interaction data
  async generateLearningInsights(): Promise<LearningInsight[]> {
    try {
      const failures = await db
        .select()
        .from(aiReplyFailures)
        .orderBy(desc(aiReplyFailures.createdAt))
        .limit(50);

      if (failures.length === 0) {
        return [];
      }

      const analysisData = failures.map(f => ({
        userMessage: f.message,
        aiReply: f.aiReply,
        agentReply: f.agentReply,
        explanation: f.explanation
      }));

      const prompt = `
As an AI training specialist, analyze these failure cases and generate specific learning insights that can improve AI performance.

Data: ${JSON.stringify(analysisData, null, 2)}

Generate insights in JSON format:
{
  "insights": [
    {
      "category": "empathy|context|specificity|technical|communication",
      "insight": "Specific learning insight",
      "confidence": 0.95,
      "actionable": true,
      "implementation": "How to implement this improvement"
    }
  ]
}

Focus on:
- Behavioral improvements
- Context awareness enhancement
- Response personalization
- Technical accuracy improvement
- Communication optimization
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"insights": []}');
      return result.insights || [];
    } catch (error) {
      console.error('Error generating learning insights:', error);
      return [];
    }
  }

  // Calculate comprehensive AI performance metrics
  async calculatePerformanceMetrics(): Promise<AIPerformanceMetrics> {
    try {
      // Get failure data
      const totalFailures = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiReplyFailures);

      const recentFailures = await db
        .select()
        .from(aiReplyFailures)
        .orderBy(desc(aiReplyFailures.createdAt))
        .limit(20);

      // Calculate metrics (simplified for demo)
      const totalInteractions = 1000; // Would come from interaction logs
      const failureCount = totalFailures[0]?.count || 0;
      const successRate = Math.max(0, (totalInteractions - failureCount) / totalInteractions);
      const failureRate = failureCount / totalInteractions;

      // Analyze top failure reasons
      const failureReasons = await this.extractTopFailureReasons(recentFailures);

      return {
        totalInteractions,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
        improvementTrend: this.calculateImprovementTrend(),
        avgConfidenceScore: 0.78, // Would be calculated from actual confidence scores
        topFailureReasons: failureReasons,
        learningVelocity: this.calculateLearningVelocity()
      };
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return {
        totalInteractions: 0,
        successRate: 0,
        failureRate: 0,
        improvementTrend: 0,
        avgConfidenceScore: 0,
        topFailureReasons: [],
        learningVelocity: 0
      };
    }
  }

  // Extract top failure reasons from explanations
  private async extractTopFailureReasons(failures: any[]): Promise<string[]> {
    if (failures.length === 0) return [];

    try {
      const explanations = failures.map(f => f.explanation).join('\n');
      
      const prompt = `
Extract the top 5 most common failure reasons from these explanations:

${explanations}

Return only a JSON array of strings, each being a concise failure reason.
Example: ["Lack of empathy", "Too generic", "Missing context", "Poor tone", "Incomplete information"]
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"reasons": []}');
      return result.reasons || [];
    } catch (error) {
      console.error('Error extracting failure reasons:', error);
      return ["Analysis error"];
    }
  }

  // Calculate improvement trend (simplified)
  private calculateImprovementTrend(): number {
    // In a real implementation, this would analyze historical data
    // For demo, return a positive trend
    return 0.15; // 15% improvement
  }

  // Calculate learning velocity (simplified)
  private calculateLearningVelocity(): number {
    // In a real implementation, this would measure learning rate
    // For demo, return a learning velocity score
    return 0.73; // 73% learning efficiency
  }

  // Generate optimization recommendations
  async generateOptimizationRecommendations(): Promise<string[]> {
    try {
      const patterns = await this.analyzeFailurePatterns();
      const insights = await this.generateLearningInsights();

      const prompt = `
Based on these failure patterns and learning insights, generate specific optimization recommendations:

Failure Patterns: ${JSON.stringify(patterns, null, 2)}
Learning Insights: ${JSON.stringify(insights, null, 2)}

Return a JSON array of actionable optimization recommendations.
Each recommendation should be specific, measurable, and implementable.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      return [];
    }
  }

  // Continuous learning system
  async processLearningQueue(): Promise<void> {
    if (this.learningQueue.length === 0) return;

    console.log(`Processing ${this.learningQueue.length} learning items...`);
    
    // Process learning items in batches
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < this.learningQueue.length; i += batchSize) {
      batches.push(this.learningQueue.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await this.processBatch(batch);
    }

    // Clear processed items
    this.learningQueue = [];
  }

  private async processBatch(batch: any[]): Promise<void> {
    // Process learning batch (simplified for demo)
    console.log(`Processing batch of ${batch.length} learning items`);
    // In a real implementation, this would update model weights or training data
  }

  // Add learning item to queue
  addLearningItem(type: string, data: any): void {
    this.learningQueue.push({
      type,
      data,
      timestamp: new Date()
    });

    // Process queue if it gets too large
    if (this.learningQueue.length > 100) {
      this.processLearningQueue();
    }
  }

  // Get comprehensive AI status
  async getAIStatus(): Promise<{
    isLearning: boolean;
    queueSize: number;
    lastAnalysis: Date;
    performance: AIPerformanceMetrics;
    recentInsights: LearningInsight[];
  }> {
    const performance = await this.calculatePerformanceMetrics();
    const insights = await this.generateLearningInsights();

    return {
      isLearning: this.learningQueue.length > 0,
      queueSize: this.learningQueue.length,
      lastAnalysis: new Date(),
      performance,
      recentInsights: insights.slice(0, 5)
    };
  }
}

export const advancedAISelfImprovement = new AdvancedAISelfImprovement();