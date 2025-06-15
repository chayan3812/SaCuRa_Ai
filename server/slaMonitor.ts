import { db } from "./db";
import { 
  aiSuggestionFeedback, 
  aiReplyFailures,
  customerInteractions,
  type InsertAiReplyFailure 
} from "@shared/schema";
import { eq, desc, and, gte, sql, lt } from "drizzle-orm";
import { generateSuggestedReply } from "./openai";
import { AI_CONFIG } from "./config";
import { v4 as uuidv4 } from "uuid";

/**
 * SLA Monitoring & Auto-Explanation System
 * Tracks AI performance against SLA metrics and explains failures
 */
export class SLAMonitor {
  
  /**
   * Get current SLA metrics
   */
  async getSLAMetrics(timeframeDays: number = 7) {
    try {
      const timeframe = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
      
      // Get response time metrics
      const responseTimeQuery = await db
        .select({
          avgResponseTime: sql<number>`avg(${aiSuggestionFeedback.responseTime})`,
          maxResponseTime: sql<number>`max(${aiSuggestionFeedback.responseTime})`,
          slowResponseCount: sql<number>`count(*) filter (where ${aiSuggestionFeedback.responseTime} > ${AI_CONFIG.MAX_RESPONSE_TIME})`
        })
        .from(aiSuggestionFeedback)
        .where(gte(aiSuggestionFeedback.createdAt, timeframe));
      
      // Get confidence metrics
      const confidenceQuery = await db
        .select({
          avgConfidence: sql<number>`avg(${aiSuggestionFeedback.confidence})`,
          lowConfidenceCount: sql<number>`count(*) filter (where ${aiSuggestionFeedback.confidence} < ${AI_CONFIG.TARGET_CONFIDENCE})`,
          totalReplies: sql<number>`count(*)`
        })
        .from(aiSuggestionFeedback)
        .where(gte(aiSuggestionFeedback.createdAt, timeframe));
      
      // Get approval rate metrics
      const approvalQuery = await db
        .select({
          approvedCount: sql<number>`count(*) filter (where ${aiSuggestionFeedback.isAccepted} = true)`,
          rejectedCount: sql<number>`count(*) filter (where ${aiSuggestionFeedback.isAccepted} = false)`,
          totalFeedback: sql<number>`count(*) filter (where ${aiSuggestionFeedback.isAccepted} is not null)`
        })
        .from(aiSuggestionFeedback)
        .where(gte(aiSuggestionFeedback.createdAt, timeframe));
      
      const responseMetrics = responseTimeQuery[0];
      const confidenceMetrics = confidenceQuery[0];
      const approvalMetrics = approvalQuery[0];
      
      // Calculate SLA compliance
      const approvalRate = approvalMetrics.totalFeedback > 0 
        ? approvalMetrics.approvedCount / approvalMetrics.totalFeedback 
        : 0;
      
      const confidenceCompliance = confidenceMetrics.totalReplies > 0
        ? (confidenceMetrics.totalReplies - confidenceMetrics.lowConfidenceCount) / confidenceMetrics.totalReplies
        : 0;
      
      const responseTimeCompliance = confidenceMetrics.totalReplies > 0
        ? (confidenceMetrics.totalReplies - responseMetrics.slowResponseCount) / confidenceMetrics.totalReplies
        : 0;
      
      return {
        timeframeDays,
        responseTime: {
          avg: responseMetrics.avgResponseTime || 0,
          max: responseMetrics.maxResponseTime || 0,
          slaCompliance: responseTimeCompliance,
          target: AI_CONFIG.MAX_RESPONSE_TIME,
          status: responseTimeCompliance >= 0.95 ? 'healthy' : 'warning'
        },
        confidence: {
          avg: confidenceMetrics.avgConfidence || 0,
          slaCompliance: confidenceCompliance,
          target: AI_CONFIG.TARGET_CONFIDENCE,
          status: confidenceCompliance >= 0.80 ? 'healthy' : 'warning'
        },
        approvalRate: {
          rate: approvalRate,
          approved: approvalMetrics.approvedCount || 0,
          rejected: approvalMetrics.rejectedCount || 0,
          total: approvalMetrics.totalFeedback || 0,
          target: AI_CONFIG.TARGET_APPROVAL_RATE,
          status: approvalRate >= AI_CONFIG.TARGET_APPROVAL_RATE ? 'healthy' : 'warning'
        },
        overallStatus: this.calculateOverallStatus(responseTimeCompliance, confidenceCompliance, approvalRate)
      };
    } catch (error) {
      console.error("Error getting SLA metrics:", error);
      throw error;
    }
  }
  
  /**
   * Analyze and explain why an AI reply failed
   */
  async explainFailure(
    originalMessage: string, 
    aiReply: string, 
    agentOverride: string,
    interactionId: string
  ) {
    try {
      const failureId = uuidv4();
      
      // Generate failure explanation using GPT-4o
      const explanationPrompt = `You are an AI coach analyzing why an AI reply was rejected by a human agent.

Original Customer Message: "${originalMessage}"

AI Reply (Rejected): "${aiReply}"

Agent's Preferred Reply: "${agentOverride}"

Analyze why the AI reply was rejected and provide:
1. Primary failure reason (choose one): tone_mismatch, insufficient_detail, incorrect_information, empathy_lacking, too_generic, policy_violation, other
2. Specific issues (2-3 bullet points)
3. Improvement suggestions (2-3 actionable recommendations)

Format your response as JSON:
{
  "primaryReason": "category",
  "specificIssues": ["issue1", "issue2", "issue3"],
  "improvements": ["suggestion1", "suggestion2", "suggestion3"],
  "confidenceScore": 0.85
}`;
      
      const explanation = await generateSuggestedReply(explanationPrompt, { type: "failure_analysis" });
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(explanation);
      } catch {
        // Fallback if JSON parsing fails
        analysisResult = {
          primaryReason: "analysis_error",
          specificIssues: ["Could not parse AI analysis"],
          improvements: ["Manual review needed"],
          confidenceScore: 0.1
        };
      }
      
      // Store the failure analysis
      const failureRecord: InsertAiReplyFailure = {
        id: failureId,
        interactionId,
        originalMessage,
        aiReply,
        agentOverride,
        failureReason: analysisResult.primaryReason,
        specificIssues: JSON.stringify(analysisResult.specificIssues),
        improvements: JSON.stringify(analysisResult.improvements),
        analysisConfidence: analysisResult.confidenceScore,
        createdAt: new Date()
      };
      
      await db.insert(aiReplyFailures).values(failureRecord);
      
      return {
        failureId,
        analysis: analysisResult,
        message: "Failure analysis completed and stored"
      };
    } catch (error) {
      console.error("Error explaining failure:", error);
      throw error;
    }
  }
  
  /**
   * Get failure pattern analysis
   */
  async getFailurePatterns(timeframeDays: number = 30) {
    try {
      const timeframe = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
      
      // Get failure reason distribution
      const reasonDistribution = await db
        .select({
          reason: aiReplyFailures.failureReason,
          count: sql<number>`count(*)`
        })
        .from(aiReplyFailures)
        .where(gte(aiReplyFailures.createdAt, timeframe))
        .groupBy(aiReplyFailures.failureReason)
        .orderBy(desc(sql`count(*)`));
      
      // Get recent failures with details
      const recentFailures = await db
        .select()
        .from(aiReplyFailures)
        .where(gte(aiReplyFailures.createdAt, timeframe))
        .orderBy(desc(aiReplyFailures.createdAt))
        .limit(10);
      
      // Calculate improvement opportunity score
      const totalFailures = reasonDistribution.reduce((sum, item) => sum + item.count, 0);
      const topFailureReason = reasonDistribution[0];
      
      return {
        timeframeDays,
        totalFailures,
        reasonDistribution,
        recentFailures,
        insights: {
          topFailureReason: topFailureReason?.reason || "No data",
          impactPercentage: topFailureReason ? (topFailureReason.count / totalFailures * 100) : 0,
          improvementOpportunity: this.calculateImprovementOpportunity(reasonDistribution)
        }
      };
    } catch (error) {
      console.error("Error getting failure patterns:", error);
      throw error;
    }
  }
  
  /**
   * Monitor confidence drift over time
   */
  async getConfidenceDrift(timeframeDays: number = 14) {
    try {
      const timeframe = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
      
      // Get daily confidence averages
      const dailyConfidence = await db
        .select({
          date: sql<string>`date(${aiSuggestionFeedback.createdAt})`,
          avgConfidence: sql<number>`avg(${aiSuggestionFeedback.confidence})`,
          replyCount: sql<number>`count(*)`
        })
        .from(aiSuggestionFeedback)
        .where(gte(aiSuggestionFeedback.createdAt, timeframe))
        .groupBy(sql`date(${aiSuggestionFeedback.createdAt})`)
        .orderBy(sql`date(${aiSuggestionFeedback.createdAt})`);
      
      // Calculate drift
      const driftAnalysis = this.calculateDrift(dailyConfidence);
      
      return {
        timeframeDays,
        dailyTrend: dailyConfidence,
        drift: driftAnalysis,
        alerts: this.generateDriftAlerts(driftAnalysis)
      };
    } catch (error) {
      console.error("Error getting confidence drift:", error);
      throw error;
    }
  }
  
  /**
   * Calculate overall SLA status
   */
  private calculateOverallStatus(
    responseTimeCompliance: number, 
    confidenceCompliance: number, 
    approvalRate: number
  ): string {
    const scores = [responseTimeCompliance, confidenceCompliance, approvalRate];
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (avgScore >= 0.90) return 'excellent';
    if (avgScore >= 0.80) return 'good';
    if (avgScore >= 0.70) return 'warning';
    return 'critical';
  }
  
  /**
   * Calculate improvement opportunity from failure patterns
   */
  private calculateImprovementOpportunity(reasonDistribution: any[]): string {
    if (reasonDistribution.length === 0) return "No data available";
    
    const topReason = reasonDistribution[0];
    const totalFailures = reasonDistribution.reduce((sum, item) => sum + item.count, 0);
    const impact = (topReason.count / totalFailures * 100);
    
    if (impact > 40) return "High - Focus on " + topReason.reason;
    if (impact > 25) return "Medium - Address " + topReason.reason;
    return "Low - Distributed issues";
  }
  
  /**
   * Calculate confidence drift analysis
   */
  private calculateDrift(dailyData: any[]) {
    if (dailyData.length < 2) return { trend: "insufficient_data", drift: 0 };
    
    const recent = dailyData.slice(-3).reduce((sum, day) => sum + day.avgConfidence, 0) / 3;
    const baseline = dailyData.slice(0, 3).reduce((sum, day) => sum + day.avgConfidence, 0) / 3;
    
    const drift = recent - baseline;
    const driftPercentage = Math.abs(drift / baseline) * 100;
    
    return {
      trend: drift > 0.05 ? "improving" : drift < -0.05 ? "declining" : "stable",
      drift: Math.round(drift * 1000) / 1000,
      driftPercentage: Math.round(driftPercentage * 100) / 100,
      recent,
      baseline
    };
  }
  
  /**
   * Generate drift alerts
   */
  private generateDriftAlerts(driftAnalysis: any) {
    const alerts = [];
    
    if (driftAnalysis.trend === "declining" && driftAnalysis.driftPercentage > 15) {
      alerts.push({
        severity: "high",
        message: `Confidence declined by ${driftAnalysis.driftPercentage}% - Retraining recommended`,
        action: "trigger_retraining"
      });
    }
    
    if (driftAnalysis.recent < AI_CONFIG.TARGET_CONFIDENCE) {
      alerts.push({
        severity: "medium",
        message: `Current confidence (${driftAnalysis.recent}) below target (${AI_CONFIG.TARGET_CONFIDENCE})`,
        action: "monitor_closely"
      });
    }
    
    return alerts;
  }
}

export const slaMonitor = new SLAMonitor();