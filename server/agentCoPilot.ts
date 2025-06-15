import { db } from "./db";
import { 
  aiReplyImprovements, 
  customerInteractions, 
  aiSuggestionFeedback,
  type InsertAiReplyImprovement 
} from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { generateSuggestedReply } from "./openai";
import { getActiveModel, AI_CONFIG } from "./config";
import { v4 as uuidv4 } from "uuid";

/**
 * Agent Co-Pilot System
 * Enables agents to edit AI suggestions with one-click improvements and automatic retraining
 */
export class AgentCoPilot {
  
  /**
   * Generate AI suggestion for agent review
   */
  async generateAISuggestion(messageId: string, customerMessage: string, context?: any) {
    try {
      const model = getActiveModel();
      const startTime = Date.now();
      
      // Generate reply using current active model
      const aiReply = await generateSuggestedReply(customerMessage, context);
      
      const responseTime = Date.now() - startTime;
      
      // Store the AI suggestion for tracking
      await db.insert(aiSuggestionFeedback).values({
        id: uuidv4(),
        interactionId: messageId,
        aiSuggestion: aiReply,
        agentFeedback: null,
        isAccepted: null,
        confidence: this.calculateConfidence(aiReply),
        modelUsed: model,
        responseTime,
        createdAt: new Date()
      });
      
      return {
        suggestionId: uuidv4(),
        aiReply,
        confidence: this.calculateConfidence(aiReply),
        model,
        responseTime
      };
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      throw error;
    }
  }
  
  /**
   * Store agent's improved reply for retraining
   */
  async storeImprovedReply(
    messageId: string, 
    originalAI: string, 
    agentEdit: string, 
    customerMessage: string,
    agentId: string
  ) {
    try {
      const improvementId = uuidv4();
      
      // Calculate improvement metrics
      const scoreGain = this.estimateImprovementScore(originalAI, agentEdit);
      const category = this.categorizeImprovement(originalAI, agentEdit);
      
      // Store the improvement
      const improvement: InsertAiReplyImprovement = {
        id: improvementId,
        interactionId: messageId,
        originalReply: originalAI,
        improvedReply: agentEdit,
        improvementCategory: category,
        scoreGainEstimate: scoreGain,
        agentId,
        isTrainingReady: true,
        qualityScore: this.calculateQualityScore(agentEdit),
        createdAt: new Date()
      };
      
      await db.insert(aiReplyImprovements).values(improvement);
      
      // Update the original feedback record
      await db.update(aiSuggestionFeedback)
        .set({
          agentFeedback: agentEdit,
          isAccepted: false, // Agent edited = not fully accepted
          improvementNotes: `Agent improved: ${category}`
        })
        .where(eq(aiSuggestionFeedback.interactionId, messageId));
      
      // Check if we should trigger auto-training
      await this.checkAutoTrainingTrigger();
      
      return {
        improvementId,
        scoreGain,
        category,
        trainingReady: true,
        message: "Agent improvement stored successfully"
      };
    } catch (error) {
      console.error("Error storing improved reply:", error);
      throw error;
    }
  }
  
  /**
   * Accept AI suggestion as-is (positive feedback)
   */
  async acceptAISuggestion(messageId: string, suggestionId: string, agentId: string) {
    try {
      await db.update(aiSuggestionFeedback)
        .set({
          isAccepted: true,
          agentFeedback: "Accepted as-is",
          updatedAt: new Date()
        })
        .where(eq(aiSuggestionFeedback.interactionId, messageId));
      
      return {
        message: "AI suggestion accepted",
        status: "positive_feedback"
      };
    } catch (error) {
      console.error("Error accepting AI suggestion:", error);
      throw error;
    }
  }
  
  /**
   * Get agent improvement statistics
   */
  async getAgentImprovementStats(agentId?: string, timeframeDays: number = 7) {
    try {
      const timeframe = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
      
      const query = db
        .select({
          totalImprovements: sql<number>`count(*)`,
          avgScoreGain: sql<number>`avg(${aiReplyImprovements.scoreGainEstimate})`,
          topCategory: sql<string>`mode() within group (order by ${aiReplyImprovements.improvementCategory})`,
          avgQuality: sql<number>`avg(${aiReplyImprovements.qualityScore})`
        })
        .from(aiReplyImprovements)
        .where(
          and(
            gte(aiReplyImprovements.createdAt, timeframe),
            agentId ? eq(aiReplyImprovements.agentId, agentId) : undefined
          )
        );
      
      const [stats] = await query;
      
      // Get recent improvements
      const recentImprovements = await db
        .select()
        .from(aiReplyImprovements)
        .where(
          and(
            gte(aiReplyImprovements.createdAt, timeframe),
            agentId ? eq(aiReplyImprovements.agentId, agentId) : undefined
          )
        )
        .orderBy(desc(aiReplyImprovements.createdAt))
        .limit(10);
      
      return {
        stats: {
          totalImprovements: stats?.totalImprovements || 0,
          avgScoreGain: stats?.avgScoreGain || 0,
          topCategory: stats?.topCategory || "No data",
          avgQuality: stats?.avgQuality || 0
        },
        recentImprovements,
        timeframeDays
      };
    } catch (error) {
      console.error("Error getting improvement stats:", error);
      throw error;
    }
  }
  
  /**
   * Generate JSONL training data from improvements
   */
  async generateTrainingData(limit: number = 100) {
    try {
      const improvements = await db
        .select({
          originalMessage: customerInteractions.message,
          improvedReply: aiReplyImprovements.improvedReply,
          context: customerInteractions.customerContext,
          category: aiReplyImprovements.improvementCategory
        })
        .from(aiReplyImprovements)
        .leftJoin(
          customerInteractions, 
          eq(aiReplyImprovements.interactionId, customerInteractions.id)
        )
        .where(eq(aiReplyImprovements.isTrainingReady, true))
        .orderBy(desc(aiReplyImprovements.qualityScore))
        .limit(limit);
      
      // Convert to JSONL format for OpenAI fine-tuning
      const trainingData = improvements.map(item => ({
        messages: [
          {
            role: "system",
            content: "You are a helpful customer service AI assistant. Provide professional, empathetic, and solution-focused responses."
          },
          {
            role: "user", 
            content: `Customer message: ${item.originalMessage}\n\nContext: ${item.context || 'No additional context'}`
          },
          {
            role: "assistant",
            content: item.improvedReply
          }
        ]
      }));
      
      return {
        trainingData,
        totalSamples: improvements.length,
        format: "jsonl",
        message: "Training data generated from agent improvements"
      };
    } catch (error) {
      console.error("Error generating training data:", error);
      throw error;
    }
  }
  
  /**
   * Check if auto-training should be triggered
   */
  private async checkAutoTrainingTrigger() {
    if (!AI_CONFIG.AUTO_TRAINING_ENABLED) return;
    
    const recentImprovements = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiReplyImprovements)
      .where(
        and(
          eq(aiReplyImprovements.isTrainingReady, true),
          gte(aiReplyImprovements.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      );
    
    const count = recentImprovements[0]?.count || 0;
    
    if (count >= AI_CONFIG.MIN_TRAINING_SAMPLES) {
      console.log(`🚀 Auto-training triggered: ${count} improvements ready`);
      // Here you would trigger the fine-tuning process
      // This could call the OpenAI fine-tuning service
    }
  }
  
  /**
   * Calculate confidence score for AI reply
   */
  private calculateConfidence(reply: string): number {
    // Simple heuristic - could be improved with ML model
    const factors = {
      length: Math.min(reply.length / 200, 1), // Longer replies often more confident
      specificity: (reply.match(/\b(specific|exactly|precisely|definitely)\b/gi) || []).length * 0.1,
      uncertainty: (reply.match(/\b(maybe|perhaps|might|could|possibly)\b/gi) || []).length * -0.1,
      structure: reply.includes('\n') ? 0.1 : 0 // Structured replies
    };
    
    const confidence = Math.max(0.1, Math.min(0.95, 
      0.5 + factors.length * 0.2 + factors.specificity + factors.uncertainty + factors.structure
    ));
    
    return Math.round(confidence * 100) / 100;
  }
  
  /**
   * Estimate improvement score
   */
  private estimateImprovementScore(original: string, improved: string): number {
    const lengthDiff = improved.length / original.length;
    const wordCountDiff = improved.split(' ').length / original.split(' ').length;
    
    // Simple scoring - could be enhanced with sentiment analysis
    let score = 0.5; // Base score
    
    if (lengthDiff > 1.2) score += 0.2; // More detailed
    if (improved.includes('sorry') && !original.includes('sorry')) score += 0.1; // More empathetic
    if (improved.match(/\d+/g)?.length > (original.match(/\d+/g)?.length || 0)) score += 0.1; // More specific
    
    return Math.min(1.0, score);
  }
  
  /**
   * Categorize improvement type
   */
  private categorizeImprovement(original: string, improved: string): string {
    if (improved.length > original.length * 1.5) return "detail_enhancement";
    if (improved.includes("sorry") && !original.includes("sorry")) return "empathy_improvement";
    if (improved.match(/\d+/g)?.length > (original.match(/\d+/g)?.length || 0)) return "specificity_boost";
    if (improved.includes("?") && !original.includes("?")) return "clarification_added";
    return "general_improvement";
  }
  
  /**
   * Calculate quality score for reply
   */
  private calculateQualityScore(reply: string): number {
    const factors = {
      length: reply.length > 50 ? 0.2 : 0,
      politeness: (reply.match(/\b(please|thank you|sorry|appreciate)\b/gi) || []).length * 0.1,
      structure: reply.includes('\n') ? 0.1 : 0,
      actionable: (reply.match(/\b(will|can|please|contact|check|send)\b/gi) || []).length * 0.05
    };
    
    const quality = Math.min(1.0, 
      0.3 + factors.length + factors.politeness + factors.structure + factors.actionable
    );
    
    return Math.round(quality * 100) / 100;
  }
}

export const agentCoPilot = new AgentCoPilot();