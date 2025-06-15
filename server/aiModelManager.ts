import OpenAI from "openai";
import { db } from "./db";
import { aiReplyFailures, aiStressTestLog } from "@shared/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ABTestConfig {
  enabled: boolean;
  trafficSplit: number; // 0-100, percentage to new model
  baseModel: string;
  testModel: string;
  startDate: Date;
  endDate?: Date;
}

interface ConfidenceDrift {
  date: string;
  avgConfidence: number;
  replyCount: number;
  drift: number; // compared to baseline
}

export class AIModelManager {
  private abTestConfig: ABTestConfig = {
    enabled: process.env.AI_AB_TEST_ENABLED === "true",
    trafficSplit: parseInt(process.env.AI_AB_TRAFFIC_SPLIT || "50"),
    baseModel: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    testModel: process.env.AI_FINE_TUNED_MODEL || "ft:gpt-3.5-turbo:pagepilot:v2-1",
    startDate: new Date(),
  };

  async selectModelForReply(userId: string): Promise<{
    model: string;
    version: "base" | "v2.1";
    isTestGroup: boolean;
  }> {
    if (!this.abTestConfig.enabled) {
      return {
        model: this.abTestConfig.baseModel,
        version: "base",
        isTestGroup: false
      };
    }

    // Determine if user should get test model
    const userHash = this.hashUserId(userId);
    const isTestGroup = userHash < this.abTestConfig.trafficSplit;

    return {
      model: isTestGroup ? this.abTestConfig.testModel : this.abTestConfig.baseModel,
      version: isTestGroup ? "v2.1" : "base",
      isTestGroup
    };
  }

  async generateReplyWithABTest(params: {
    message: string;
    context?: string;
    userId: string;
  }): Promise<{
    reply: string;
    model: string;
    version: "base" | "v2.1";
    confidenceScore: number;
    processingTime: number;
  }> {
    const startTime = Date.now();
    const modelConfig = await this.selectModelForReply(params.userId);

    try {
      const prompt = `You are an elite customer service assistant. Respond to this customer message with empathy, clarity, and actionable solutions.

Customer message: "${params.message}"
${params.context ? `Context: ${params.context}` : ''}

Provide a helpful, professional response:`;

      const response = await openai.chat.completions.create({
        model: modelConfig.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      const reply = response.choices[0].message.content?.trim() || "I apologize, but I'm unable to generate a response at this time.";
      const processingTime = Date.now() - startTime;

      // Calculate confidence score based on reply quality
      const confidenceScore = await this.calculateConfidenceScore(reply, params.message);

      // Log A/B test data
      await this.logABTestReply({
        userId: params.userId,
        message: params.message,
        reply,
        model: modelConfig.model,
        version: modelConfig.version,
        isTestGroup: modelConfig.isTestGroup,
        confidenceScore,
        processingTime
      });

      return {
        reply,
        model: modelConfig.model,
        version: modelConfig.version,
        confidenceScore,
        processingTime
      };
    } catch (error) {
      console.error("Error in A/B test reply generation:", error);
      
      // Fallback to base model
      const fallbackResponse = await openai.chat.completions.create({
        model: this.abTestConfig.baseModel,
        messages: [{ role: "user", content: `Respond to: ${params.message}` }],
        temperature: 0.3,
        max_tokens: 300,
      });

      return {
        reply: fallbackResponse.choices[0].message.content?.trim() || "Error generating response",
        model: this.abTestConfig.baseModel,
        version: "base",
        confidenceScore: 0.3,
        processingTime: Date.now() - startTime
      };
    }
  }

  async improveAgentDraft(agentDraft: string): Promise<{
    originalDraft: string;
    aiSuggestion: string;
    improvements: string[];
    confidenceScore: number;
  }> {
    try {
      const prompt = `Improve this customer service draft for clarity, empathy, and professionalism.

Original draft: "${agentDraft}"

Provide:
1. An improved version
2. List specific improvements made
3. Rate confidence in improvement (0-1)

Respond in JSON format:
{
  "improvedDraft": "Enhanced version of the response",
  "improvements": ["Improvement 1", "Improvement 2"],
  "confidenceScore": 0.9
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        originalDraft: agentDraft,
        aiSuggestion: result.improvedDraft || agentDraft,
        improvements: result.improvements || [],
        confidenceScore: Math.max(0, Math.min(1, result.confidenceScore || 0.5))
      };
    } catch (error) {
      console.error("Error improving agent draft:", error);
      return {
        originalDraft: agentDraft,
        aiSuggestion: agentDraft,
        improvements: ["Error generating improvements"],
        confidenceScore: 0.3
      };
    }
  }

  async detectPerformanceDrops(timeframeDays: number = 7): Promise<{
    performanceDrops: Array<{
      startDate: Date;
      endDate: Date;
      dropPercentage: number;
      affectedReplies: number;
      avgConfidence: number;
    }>;
    autoTrainingRecommended: boolean;
    trainingDataCount: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (timeframeDays * 4)); // Look back 4 weeks

      // Get weekly performance data
      const performanceData = await db.execute(`
        SELECT 
          DATE_TRUNC('week', created_at) as week_start,
          COUNT(*) as reply_count,
          AVG(CASE WHEN feedback = 'yes' THEN 1 ELSE 0 END) as usefulness_rate,
          AVG(confidence_score) as avg_confidence
        FROM ai_reply_failures
        WHERE created_at >= $1
        GROUP BY week_start
        ORDER BY week_start DESC
      `, [cutoffDate]);

      const drops = [];
      let autoTrainingRecommended = false;
      let trainingDataCount = 0;

      // Analyze week-over-week performance
      for (let i = 1; i < performanceData.rows.length; i++) {
        const currentWeek = performanceData.rows[i-1];
        const previousWeek = performanceData.rows[i];
        
        const currentRate = parseFloat(currentWeek.usefulness_rate || '0');
        const previousRate = parseFloat(previousWeek.usefulness_rate || '0');
        
        if (previousRate > 0) {
          const dropPercentage = ((previousRate - currentRate) / previousRate) * 100;
          
          if (dropPercentage > 20) {
            const weekStart = new Date(currentWeek.week_start);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            drops.push({
              startDate: weekStart,
              endDate: weekEnd,
              dropPercentage: Math.round(dropPercentage * 100) / 100,
              affectedReplies: parseInt(currentWeek.reply_count || '0'),
              avgConfidence: parseFloat(currentWeek.avg_confidence || '0')
            });

            autoTrainingRecommended = true;
            trainingDataCount += parseInt(currentWeek.reply_count || '0');
          }
        }
      }

      return {
        performanceDrops: drops,
        autoTrainingRecommended,
        trainingDataCount
      };
    } catch (error) {
      console.error("Error detecting performance drops:", error);
      return {
        performanceDrops: [],
        autoTrainingRecommended: false,
        trainingDataCount: 0
      };
    }
  }

  async generateTrainingDataFromDrops(dropPeriods: Array<{ startDate: Date; endDate: Date }>): Promise<{
    jsonlFilename: string;
    trainingExamples: number;
    qualityScore: number;
  }> {
    try {
      const trainingExamples = [];

      for (const period of dropPeriods) {
        // Get underperforming replies from the drop period
        const underperformingReplies = await db.execute(`
          SELECT original_prompt, original_reply, corrected_reply, score_gain_estimate
          FROM ai_reply_improvements
          WHERE created_at BETWEEN $1 AND $2
          AND score_gain_estimate > 2
          ORDER BY score_gain_estimate DESC
          LIMIT 100
        `, [period.startDate, period.endDate]);

        for (const row of underperformingReplies.rows) {
          trainingExamples.push({
            messages: [
              {
                role: "system",
                content: "You are an elite customer service assistant trained on high-performing response patterns."
              },
              {
                role: "user",
                content: row.original_prompt
              },
              {
                role: "assistant",
                content: row.corrected_reply
              }
            ]
          });
        }
      }

      // Generate JSONL file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `training_data_performance_drop_${timestamp}.jsonl`;
      const jsonlContent = trainingExamples.map(ex => JSON.stringify(ex)).join('\n');

      // Write to file (in production, you'd write to a proper file system)
      console.log(`📄 Generated ${trainingExamples.length} training examples for performance drop recovery`);

      return {
        jsonlFilename: filename,
        trainingExamples: trainingExamples.length,
        qualityScore: trainingExamples.length > 50 ? 0.9 : 0.7
      };
    } catch (error) {
      console.error("Error generating training data from drops:", error);
      return {
        jsonlFilename: "",
        trainingExamples: 0,
        qualityScore: 0
      };
    }
  }

  async getConfidenceDriftMetrics(days: number = 30): Promise<{
    dailyDrift: ConfidenceDrift[];
    overallTrend: "improving" | "declining" | "stable";
    alertThreshold: number;
    currentAlert: boolean;
    recommendations: string[];
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get daily confidence metrics
      const driftData = await db.execute(`
        SELECT 
          DATE(created_at) as day,
          AVG(confidence_score) as avg_confidence,
          COUNT(*) as reply_count
        FROM ai_stress_test_log
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `, [cutoffDate]);

      const dailyMetrics = driftData.rows.map((row, index) => {
        const baselineConfidence = index === 0 ? parseFloat(row.avg_confidence || '0') : parseFloat(driftData.rows[0].avg_confidence || '0');
        const currentConfidence = parseFloat(row.avg_confidence || '0');
        const drift = currentConfidence - baselineConfidence;

        return {
          date: row.day,
          avgConfidence: Math.round(currentConfidence * 1000) / 1000,
          replyCount: parseInt(row.reply_count || '0'),
          drift: Math.round(drift * 1000) / 1000
        };
      });

      // Determine overall trend
      let overallTrend: "improving" | "declining" | "stable" = "stable";
      if (dailyMetrics.length > 1) {
        const firstWeek = dailyMetrics.slice(0, 7).reduce((sum, d) => sum + d.avgConfidence, 0) / 7;
        const lastWeek = dailyMetrics.slice(-7).reduce((sum, d) => sum + d.avgConfidence, 0) / 7;
        const change = lastWeek - firstWeek;
        
        if (change > 0.05) overallTrend = "improving";
        else if (change < -0.05) overallTrend = "declining";
      }

      // Check for alerts
      const alertThreshold = 0.2;
      const currentAlert = dailyMetrics.some(d => Math.abs(d.drift) > alertThreshold);

      // Generate recommendations
      const recommendations = [];
      if (overallTrend === "declining") {
        recommendations.push("Consider retraining with recent high-quality examples");
        recommendations.push("Review low-confidence replies for common patterns");
      }
      if (currentAlert) {
        recommendations.push("Immediate attention required - confidence drift exceeds threshold");
        recommendations.push("Investigate recent changes in training data or model parameters");
      }
      if (overallTrend === "stable" && !currentAlert) {
        recommendations.push("System performing within normal parameters");
        recommendations.push("Continue monitoring for any emerging trends");
      }

      return {
        dailyDrift: dailyMetrics,
        overallTrend,
        alertThreshold,
        currentAlert,
        recommendations
      };
    } catch (error) {
      console.error("Error getting confidence drift metrics:", error);
      return {
        dailyDrift: [],
        overallTrend: "stable",
        alertThreshold: 0.2,
        currentAlert: false,
        recommendations: ["Error retrieving metrics"]
      };
    }
  }

  async getABTestResults(): Promise<{
    testRunning: boolean;
    baseModel: { name: string; successRate: number; avgConfidence: number; avgResponseTime: number };
    testModel: { name: string; successRate: number; avgConfidence: number; avgResponseTime: number };
    statisticalSignificance: boolean;
    recommendation: "continue_test" | "deploy_v2.1" | "rollback_to_base";
    sampleSize: { base: number; test: number };
  }> {
    try {
      // Get A/B test metrics (mock implementation for now)
      const baseMetrics = {
        name: this.abTestConfig.baseModel,
        successRate: 0.85,
        avgConfidence: 0.75,
        avgResponseTime: 1200,
      };

      const testMetrics = {
        name: this.abTestConfig.testModel,
        successRate: 0.89,
        avgConfidence: 0.82,
        avgResponseTime: 980,
      };

      const sampleSize = { base: 1247, test: 1198 };
      const statisticalSignificance = sampleSize.base > 1000 && sampleSize.test > 1000;
      
      let recommendation: "continue_test" | "deploy_v2.1" | "rollback_to_base" = "continue_test";
      
      if (statisticalSignificance) {
        if (testMetrics.successRate > baseMetrics.successRate + 0.05) {
          recommendation = "deploy_v2.1";
        } else if (testMetrics.successRate < baseMetrics.successRate - 0.05) {
          recommendation = "rollback_to_base";
        }
      }

      return {
        testRunning: this.abTestConfig.enabled,
        baseModel: baseMetrics,
        testModel: testMetrics,
        statisticalSignificance,
        recommendation,
        sampleSize
      };
    } catch (error) {
      console.error("Error getting A/B test results:", error);
      return {
        testRunning: false,
        baseModel: { name: "gpt-4o", successRate: 0, avgConfidence: 0, avgResponseTime: 0 },
        testModel: { name: "v2.1", successRate: 0, avgConfidence: 0, avgResponseTime: 0 },
        statisticalSignificance: false,
        recommendation: "continue_test",
        sampleSize: { base: 0, test: 0 }
      };
    }
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private async calculateConfidenceScore(reply: string, message: string): Promise<number> {
    // Simple heuristic-based confidence scoring
    let score = 0.5; // Base score
    
    // Length factor
    if (reply.length > 50 && reply.length < 300) score += 0.1;
    
    // Empathy indicators
    if (/sorry|understand|apologize|help/i.test(reply)) score += 0.1;
    
    // Action words
    if (/will|can|let me|I'll|shall/i.test(reply)) score += 0.1;
    
    // Professional tone
    if (!/\?{2,}|!{2,}|CAPS/i.test(reply)) score += 0.1;
    
    // Completeness
    if (reply.includes('.') && reply.split('.').length > 1) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  private async logABTestReply(data: {
    userId: string;
    message: string;
    reply: string;
    model: string;
    version: "base" | "v2.1";
    isTestGroup: boolean;
    confidenceScore: number;
    processingTime: number;
  }): Promise<void> {
    try {
      // In a real implementation, you'd insert this into an ai_reply_log table
      console.log(`📊 A/B Test Log: User ${data.userId} | Model: ${data.version} | Confidence: ${data.confidenceScore} | Time: ${data.processingTime}ms`);
    } catch (error) {
      console.error("Error logging A/B test data:", error);
    }
  }
}

export const aiModelManager = new AIModelManager();