import OpenAI from "openai";
import { db } from "./db";
import { customerInteractions, aiReplyFailures, aiStressTestLog, weeklyAiReports } from "@shared/schema";
import { desc, eq, gte, lte, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WeeklyStats {
  topAcceptedReplies: Array<{
    reply: string;
    usageCount: number;
    successRate: number;
  }>;
  topRejectedReplies: Array<{
    reply: string;
    rejectionCount: number;
    rejectionReasons: string[];
  }>;
  confidenceDrift: {
    weekStart: number;
    weekEnd: number;
    change: number;
    trend: "improving" | "declining" | "stable";
  };
  trendingTopics: Array<{
    keyword: string;
    frequency: number;
    context: string;
  }>;
  retrainingEvents: Array<{
    date: Date;
    category: string;
    improvementsCount: number;
    description: string;
  }>;
}

interface EvolutionSummary {
  mainImprovements: string[];
  messageTypeChanges: Array<{
    messageType: string;
    beforeExample: string;
    afterExample: string;
    reason: string;
  }>;
  overallEvolution: string;
}

interface CoachingTips {
  tips: Array<{
    title: string;
    description: string;
    basedOn: string;
    priority: "high" | "medium" | "low";
  }>;
  agentPerformanceInsights: Array<{
    pattern: string;
    recommendation: string;
    impact: string;
  }>;
}

export class WeeklyAIReporter {
  private weekStartDate: Date;
  private weekEndDate: Date;

  constructor() {
    // Set week boundaries (Sunday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    this.weekEndDate = new Date(now);
    this.weekEndDate.setDate(now.getDate() - dayOfWeek);
    this.weekEndDate.setHours(23, 59, 59, 999);
    
    this.weekStartDate = new Date(this.weekEndDate);
    this.weekStartDate.setDate(this.weekEndDate.getDate() - 6);
    this.weekStartDate.setHours(0, 0, 0, 0);
  }

  async generateWeeklyReport(): Promise<{
    reportId: string;
    summary: string;
    stats: WeeklyStats;
    evolution: EvolutionSummary;
    coaching: CoachingTips;
    weekPeriod: { start: Date; end: Date };
  }> {
    try {
      console.log(`📊 Generating weekly AI report for ${this.weekStartDate.toDateString()} - ${this.weekEndDate.toDateString()}`);

      // Gather weekly statistics
      const stats = await this.gatherWeeklyStats();
      
      // Generate evolution summary
      const evolution = await this.generateEvolutionSummary(stats);
      
      // Generate coaching tips
      const coaching = await this.generateCoachingTips(stats);
      
      // Generate overall narrative summary
      const summary = await this.generateNarrativeSummary(stats, evolution, coaching);
      
      // Store report in database
      const reportId = await this.storeWeeklyReport({
        summary,
        stats,
        evolution,
        coaching,
        weekStart: this.weekStartDate,
        weekEnd: this.weekEndDate
      });

      console.log(`✅ Weekly AI report generated successfully: ${reportId}`);

      return {
        reportId,
        summary,
        stats,
        evolution,
        coaching,
        weekPeriod: {
          start: this.weekStartDate,
          end: this.weekEndDate
        }
      };
    } catch (error) {
      console.error("Error generating weekly AI report:", error);
      throw new Error(`Failed to generate weekly report: ${error.message}`);
    }
  }

  private async gatherWeeklyStats(): Promise<WeeklyStats> {
    // Get top accepted replies
    const topAcceptedReplies = await this.getTopAcceptedReplies();
    
    // Get top rejected replies
    const topRejectedReplies = await this.getTopRejectedReplies();
    
    // Calculate confidence drift
    const confidenceDrift = await this.calculateConfidenceDrift();
    
    // Extract trending topics
    const trendingTopics = await this.extractTrendingTopics();
    
    // Get retraining events
    const retrainingEvents = await this.getRetrainingEvents();

    return {
      topAcceptedReplies,
      topRejectedReplies,
      confidenceDrift,
      trendingTopics,
      retrainingEvents
    };
  }

  private async getTopAcceptedReplies(): Promise<WeeklyStats['topAcceptedReplies']> {
    try {
      const results = await db.execute(`
        SELECT 
          response as reply,
          COUNT(*) as usage_count,
          AVG(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as success_rate
        FROM customer_interactions 
        WHERE created_at BETWEEN $1 AND $2
        AND response IS NOT NULL
        AND sentiment IN ('positive', 'neutral')
        GROUP BY response
        ORDER BY usage_count DESC, success_rate DESC
        LIMIT 10
      `, [this.weekStartDate, this.weekEndDate]);

      return results.rows.map(row => ({
        reply: row.reply || "No response recorded",
        usageCount: parseInt(row.usage_count || '0'),
        successRate: Math.round((parseFloat(row.success_rate || '0')) * 100) / 100
      }));
    } catch (error) {
      console.error("Error getting top accepted replies:", error);
      return [];
    }
  }

  private async getTopRejectedReplies(): Promise<WeeklyStats['topRejectedReplies']> {
    try {
      const results = await db.execute(`
        SELECT 
          original_reply as reply,
          COUNT(*) as rejection_count,
          ARRAY_AGG(DISTINCT failure_category) as rejection_reasons
        FROM ai_reply_improvements
        WHERE created_at BETWEEN $1 AND $2
        AND original_reply IS NOT NULL
        GROUP BY original_reply
        ORDER BY rejection_count DESC
        LIMIT 10
      `, [this.weekStartDate, this.weekEndDate]);

      return results.rows.map(row => ({
        reply: row.reply || "No reply recorded",
        rejectionCount: parseInt(row.rejection_count || '0'),
        rejectionReasons: row.rejection_reasons || []
      }));
    } catch (error) {
      console.error("Error getting top rejected replies:", error);
      return [];
    }
  }

  private async calculateConfidenceDrift(): Promise<WeeklyStats['confidenceDrift']> {
    try {
      const weekStartConfidence = await db.execute(`
        SELECT AVG(confidence_score) as avg_confidence
        FROM ai_stress_test_log
        WHERE created_at BETWEEN $1 AND $2
      `, [this.weekStartDate, new Date(this.weekStartDate.getTime() + 2 * 24 * 60 * 60 * 1000)]);

      const weekEndConfidence = await db.execute(`
        SELECT AVG(confidence_score) as avg_confidence
        FROM ai_stress_test_log
        WHERE created_at BETWEEN $1 AND $2
      `, [new Date(this.weekEndDate.getTime() - 2 * 24 * 60 * 60 * 1000), this.weekEndDate]);

      const weekStart = parseFloat(weekStartConfidence.rows[0]?.avg_confidence || '0.5');
      const weekEnd = parseFloat(weekEndConfidence.rows[0]?.avg_confidence || '0.5');
      const change = weekEnd - weekStart;

      let trend: "improving" | "declining" | "stable" = "stable";
      if (Math.abs(change) > 0.05) {
        trend = change > 0 ? "improving" : "declining";
      }

      return {
        weekStart: Math.round(weekStart * 1000) / 1000,
        weekEnd: Math.round(weekEnd * 1000) / 1000,
        change: Math.round(change * 1000) / 1000,
        trend
      };
    } catch (error) {
      console.error("Error calculating confidence drift:", error);
      return {
        weekStart: 0.5,
        weekEnd: 0.5,
        change: 0,
        trend: "stable"
      };
    }
  }

  private async extractTrendingTopics(): Promise<WeeklyStats['trendingTopics']> {
    try {
      const results = await db.execute(`
        SELECT 
          message,
          COUNT(*) as frequency
        FROM customer_interactions
        WHERE created_at BETWEEN $1 AND $2
        AND message IS NOT NULL
        GROUP BY message
        ORDER BY frequency DESC
        LIMIT 20
      `, [this.weekStartDate, this.weekEndDate]);

      // Use GPT to extract trending keywords and topics
      const messages = results.rows.map(row => row.message).join('\n');
      
      if (!messages.trim()) {
        return [];
      }

      const topicsResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Analyze customer messages and extract the top 5 trending topics/keywords. Return as JSON array with objects containing 'keyword', 'frequency', and 'context'."
          },
          {
            role: "user",
            content: `Customer messages from this week:\n${messages}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const topics = JSON.parse(topicsResponse.choices[0].message.content || '{"topics": []}');
      return topics.topics || [];
    } catch (error) {
      console.error("Error extracting trending topics:", error);
      return [];
    }
  }

  private async getRetrainingEvents(): Promise<WeeklyStats['retrainingEvents']> {
    try {
      const results = await db.execute(`
        SELECT 
          created_at,
          failure_category,
          COUNT(*) as improvements_count,
          'AI Reply Improvement' as description
        FROM ai_reply_improvements
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY DATE(created_at), failure_category
        ORDER BY created_at DESC
      `, [this.weekStartDate, this.weekEndDate]);

      return results.rows.map(row => ({
        date: new Date(row.created_at),
        category: row.failure_category || "General Improvement",
        improvementsCount: parseInt(row.improvements_count || '0'),
        description: row.description || "AI system improvement"
      }));
    } catch (error) {
      console.error("Error getting retraining events:", error);
      return [];
    }
  }

  private async generateEvolutionSummary(stats: WeeklyStats): Promise<EvolutionSummary> {
    try {
      const evolutionPrompt = `
Analyze this AI assistant's weekly performance and explain how it evolved.

Data:
- Top accepted replies: ${JSON.stringify(stats.topAcceptedReplies.slice(0, 3))}
- Top rejected replies: ${JSON.stringify(stats.topRejectedReplies.slice(0, 3))}
- Confidence trend: ${stats.confidenceDrift.trend} (${stats.confidenceDrift.change > 0 ? '+' : ''}${stats.confidenceDrift.change})
- Retraining events: ${stats.retrainingEvents.length}

Explain:
1. What were the main improvements this week?
2. Which types of messages had the biggest changes and why?
3. How did the AI's overall approach evolve?

Respond in JSON format with 'mainImprovements', 'messageTypeChanges', and 'overallEvolution'.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: evolutionPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const evolution = JSON.parse(response.choices[0].message.content || '{}');
      return {
        mainImprovements: evolution.mainImprovements || [],
        messageTypeChanges: evolution.messageTypeChanges || [],
        overallEvolution: evolution.overallEvolution || "The AI system maintained stable performance this week."
      };
    } catch (error) {
      console.error("Error generating evolution summary:", error);
      return {
        mainImprovements: ["Maintained baseline performance"],
        messageTypeChanges: [],
        overallEvolution: "The AI system continued operating with consistent performance patterns."
      };
    }
  }

  private async generateCoachingTips(stats: WeeklyStats): Promise<CoachingTips> {
    try {
      const coachingPrompt = `
Based on AI performance data, generate coaching tips for human agents.

Successful AI patterns:
${JSON.stringify(stats.topAcceptedReplies.slice(0, 5))}

Failed AI patterns:
${JSON.stringify(stats.topRejectedReplies.slice(0, 5))}

Generate 3-5 actionable coaching tips for human agents to improve their responses.
Focus on what worked well for AI and what agents should avoid.

Respond in JSON format with:
- 'tips': array of {title, description, basedOn, priority}
- 'agentPerformanceInsights': array of {pattern, recommendation, impact}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: coachingPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const coaching = JSON.parse(response.choices[0].message.content || '{}');
      return {
        tips: coaching.tips || [],
        agentPerformanceInsights: coaching.agentPerformanceInsights || []
      };
    } catch (error) {
      console.error("Error generating coaching tips:", error);
      return {
        tips: [
          {
            title: "Maintain Consistency",
            description: "Follow established response patterns that have proven successful",
            basedOn: "System analysis",
            priority: "medium" as const
          }
        ],
        agentPerformanceInsights: []
      };
    }
  }

  private async generateNarrativeSummary(
    stats: WeeklyStats, 
    evolution: EvolutionSummary, 
    coaching: CoachingTips
  ): Promise<string> {
    try {
      const summaryPrompt = `
Write a comprehensive 5-paragraph weekly summary for AI performance.

Include:
1. Overall performance and key metrics
2. Major improvements and learning highlights
3. Trending topics and customer patterns
4. Training and evolution updates
5. Recommendations for next week

Data:
- Confidence drift: ${stats.confidenceDrift.trend} (${stats.confidenceDrift.change})
- Top performing replies: ${stats.topAcceptedReplies.length}
- Retraining events: ${stats.retrainingEvents.length}
- Main improvements: ${evolution.mainImprovements.join(', ')}
- Coaching tips generated: ${coaching.tips.length}

Write in a professional but engaging tone, as if reporting to a team lead.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: summaryPrompt }],
        temperature: 0.4,
      });

      return response.choices[0].message.content?.trim() || "Weekly AI performance summary generated successfully.";
    } catch (error) {
      console.error("Error generating narrative summary:", error);
      return `Weekly AI Report Summary: The AI system processed customer interactions with ${stats.confidenceDrift.trend} confidence trends and completed ${stats.retrainingEvents.length} improvement cycles this week.`;
    }
  }

  private async storeWeeklyReport(reportData: {
    summary: string;
    stats: WeeklyStats;
    evolution: EvolutionSummary;
    coaching: CoachingTips;
    weekStart: Date;
    weekEnd: Date;
  }): Promise<string> {
    try {
      const reportId = uuidv4();
      
      await db.insert(weeklyAiReports).values({
        id: reportId,
        weekStart: reportData.weekStart,
        weekEnd: reportData.weekEnd,
        summary: reportData.summary,
        stats: reportData.stats,
        evolution: reportData.evolution,
        coaching: reportData.coaching,
        createdAt: new Date()
      });

      return reportId;
    } catch (error) {
      console.error("Error storing weekly report:", error);
      throw new Error("Failed to store weekly report in database");
    }
  }

  async getLatestReport(): Promise<any> {
    try {
      const [report] = await db.select()
        .from(weeklyAiReports)
        .orderBy(desc(weeklyAiReports.createdAt))
        .limit(1);

      return report;
    } catch (error) {
      console.error("Error getting latest report:", error);
      return null;
    }
  }

  async getAllReports(limit: number = 10): Promise<any[]> {
    try {
      const reports = await db.select()
        .from(weeklyAiReports)
        .orderBy(desc(weeklyAiReports.createdAt))
        .limit(limit);

      return reports;
    } catch (error) {
      console.error("Error getting all reports:", error);
      return [];
    }
  }
}

export const weeklyAIReporter = new WeeklyAIReporter();