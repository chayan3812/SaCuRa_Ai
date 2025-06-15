import { storage } from "./storage";
import OpenAI from "openai";
import { db } from "./db";
import { aiReplyFailures, aiReplyImprovements } from "@shared/schema";
import { desc, sql, eq } from "drizzle-orm";
import fs from "fs/promises";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ReplyImprovement {
  id: string;
  promptId: string;
  originalPrompt: string;
  originalReply: string;
  correctedReply: string;
  scoreGainEstimate: number;
  failureCategory: string;
  createdAt: Date;
}

export interface TrainingData {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export class AISelfOptimizer {
  private isProcessing = false;
  private improvementQueue: Array<{ failureId: string; priority: number }> = [];

  // Step 1: Auto-Correction Retraining Scripts
  async generateCorrectedReply({
    originalPrompt,
    aiReply,
    agentReply,
    failureExplanation,
  }: {
    originalPrompt: string;
    aiReply: string;
    agentReply: string;
    failureExplanation: string;
  }): Promise<string> {
    const prompt = `
An AI assistant gave the following reply:

Original Prompt:
"${originalPrompt}"

AI Reply:
"${aiReply}"

An agent corrected it to:
"${agentReply}"

The failure explanation was:
"${failureExplanation}"

Rewrite the AI reply to match the agent's tone, accuracy, and completeness — without copying it. Improve the original reply to avoid the same failure.

Only return the improved reply.
`;

    try {
      const result = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return result.choices[0].message.content?.trim() || "Unable to generate improved reply";
    } catch (error) {
      console.error('Error generating corrected reply:', error);
      return "Error generating improved reply";
    }
  }

  // Process all failed replies and generate improvements
  async processAllFailedReplies(): Promise<number> {
    if (this.isProcessing) {
      console.log('Already processing failures...');
      return 0;
    }

    this.isProcessing = true;
    let processedCount = 0;

    try {
      console.log('🔄 Starting auto-correction retraining...');

      // Get all unprocessed failures
      const failures = await db
        .select()
        .from(aiReplyFailures)
        .orderBy(desc(aiReplyFailures.createdAt))
        .limit(50);

      for (const failure of failures) {
        // Check if already processed
        const existingImprovement = await db
          .select()
          .from(aiReplyImprovements)
          .where(eq(aiReplyImprovements.originalReply, failure.aiReply))
          .limit(1);

        if (existingImprovement.length > 0) {
          continue;
        }

        // Generate improved reply
        const correctedReply = await this.generateCorrectedReply({
          originalPrompt: failure.message,
          aiReply: failure.aiReply,
          agentReply: failure.agentReply || "",
          failureExplanation: failure.explanation,
        });

        // Estimate score gain
        const scoreGain = await this.estimateScoreGain(failure.aiReply, correctedReply);
        
        // Categorize failure
        const failureCategory = await this.categorizeFailure(failure.explanation);

        // Store improvement
        await db.insert(aiReplyImprovements).values({
          promptId: failure.id,
          originalPrompt: failure.message,
          originalReply: failure.aiReply,
          correctedReply,
          scoreGainEstimate: scoreGain,
          failureCategory,
        });

        processedCount++;
        console.log(`✅ Processed improvement ${processedCount}/${failures.length}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`🎯 Auto-correction complete: ${processedCount} improvements generated`);
    } catch (error) {
      console.error('Error processing failed replies:', error);
    } finally {
      this.isProcessing = false;
    }

    return processedCount;
  }

  // Step 2: Get leaderboard of most improved replies
  async getImprovementLeaderboard(limit: number = 20): Promise<ReplyImprovement[]> {
    try {
      const improvements = await db
        .select()
        .from(aiReplyImprovements)
        .orderBy(desc(aiReplyImprovements.scoreGainEstimate))
        .limit(limit);

      return improvements.map(imp => ({
        id: imp.id,
        promptId: imp.promptId,
        originalPrompt: imp.originalPrompt,
        originalReply: imp.originalReply,
        correctedReply: imp.correctedReply,
        scoreGainEstimate: imp.scoreGainEstimate,
        failureCategory: imp.failureCategory,
        createdAt: imp.createdAt
      }));
    } catch (error) {
      console.error('Error getting improvement leaderboard:', error);
      return [];
    }
  }

  // Step 3: Export JSONL for OpenAI Fine-Tuning
  async exportTrainingDataJSONL(filename: string = 'training_data.jsonl'): Promise<{
    filename: string;
    recordCount: number;
    fileSize: string;
  }> {
    try {
      const improvements = await db
        .select()
        .from(aiReplyImprovements)
        .orderBy(desc(aiReplyImprovements.scoreGainEstimate));

      const lines = improvements.map(improvement => {
        return JSON.stringify({
          messages: [
            { role: "user", content: improvement.originalPrompt },
            { role: "assistant", content: improvement.correctedReply },
          ],
        });
      });

      const content = lines.join('\n');
      await fs.writeFile(filename, content);

      const stats = await fs.stat(filename);
      
      console.log(`📄 Exported ${improvements.length} training examples to ${filename}`);
      
      return {
        filename,
        recordCount: improvements.length,
        fileSize: `${(stats.size / 1024).toFixed(2)} KB`
      };
    } catch (error) {
      console.error('Error exporting JSONL:', error);
      throw new Error('Failed to export training data');
    }
  }

  // Step 4: Generate context-aware training prompts
  async generateContextAwarePrompt(customerMessage: string): Promise<string> {
    try {
      // Analyze message for potential failure patterns
      const failureCategory = await this.predictFailureCategory(customerMessage);
      
      if (!failureCategory) {
        return `You are replying to a customer support message.

Customer message:
"${customerMessage}"

Reply as a helpful assistant.`;
      }

      return `You are replying to a customer support message.
Based on past failures, this type of query often fails due to: "${failureCategory}"

So be especially careful to avoid issues in that area.

Customer message:
"${customerMessage}"

Reply as a helpful assistant.`;
    } catch (error) {
      console.error('Error generating context-aware prompt:', error);
      return `You are replying to a customer support message.

Customer message:
"${customerMessage}"

Reply as a helpful assistant.`;
    }
  }

  // Estimate score improvement
  private async estimateScoreGain(originalReply: string, correctedReply: string): Promise<number> {
    try {
      const prompt = `
Rate these two customer service replies on a scale of 1-10:

Original Reply:
"${originalReply}"

Improved Reply:
"${correctedReply}"

Return only a JSON object with scores:
{"original_score": X, "improved_score": Y}
`;

      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const scores = JSON.parse(result.choices[0].message.content || '{"original_score": 5, "improved_score": 5}');
      return Math.max(0, scores.improved_score - scores.original_score);
    } catch (error) {
      console.error('Error estimating score gain:', error);
      return 1; // Default improvement
    }
  }

  // Categorize failure type
  private async categorizeFailure(explanation: string): Promise<string> {
    try {
      const prompt = `
Categorize this AI failure explanation into one category:

"${explanation}"

Choose from: empathy, specificity, accuracy, tone, completeness, context

Return only the category name.
`;

      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });

      return result.choices[0].message.content?.trim() || "general";
    } catch (error) {
      console.error('Error categorizing failure:', error);
      return "general";
    }
  }

  // Predict potential failure category for new messages
  private async predictFailureCategory(message: string): Promise<string | null> {
    try {
      // Get common failure patterns
      const failureCategories = await db
        .select({
          category: aiReplyImprovements.failureCategory,
          count: sql<number>`count(*)`
        })
        .from(aiReplyImprovements)
        .groupBy(aiReplyImprovements.failureCategory)
        .orderBy(desc(sql`count(*)`))
        .limit(5);

      if (failureCategories.length === 0) {
        return null;
      }

      const categoriesText = failureCategories
        .map(fc => fc.category)
        .join(', ');

      const prompt = `
Based on this customer message, which failure category is most likely to occur?

Message: "${message}"

Common failure categories: ${categoriesText}

If none apply, return "none". Otherwise return the most likely category.
`;

      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const category = result.choices[0].message.content?.trim();
      return category === "none" ? null : category;
    } catch (error) {
      console.error('Error predicting failure category:', error);
      return null;
    }
  }

  // Get optimization statistics
  async getOptimizationStats(): Promise<{
    totalImprovements: number;
    avgScoreGain: number;
    topFailureCategories: Array<{ category: string; count: number }>;
    totalTrainingExamples: number;
    lastProcessed: Date | null;
  }> {
    try {
      const totalImprovements = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiReplyImprovements);

      const avgScoreGain = await db
        .select({ avg: sql<number>`avg(score_gain_estimate)` })
        .from(aiReplyImprovements);

      const topCategories = await db
        .select({
          category: aiReplyImprovements.failureCategory,
          count: sql<number>`count(*)`
        })
        .from(aiReplyImprovements)
        .groupBy(aiReplyImprovements.failureCategory)
        .orderBy(desc(sql`count(*)`))
        .limit(5);

      const lastProcessed = await db
        .select({ date: aiReplyImprovements.createdAt })
        .from(aiReplyImprovements)
        .orderBy(desc(aiReplyImprovements.createdAt))
        .limit(1);

      return {
        totalImprovements: totalImprovements[0]?.count || 0,
        avgScoreGain: Math.round((avgScoreGain[0]?.avg || 0) * 100) / 100,
        topFailureCategories: topCategories,
        totalTrainingExamples: totalImprovements[0]?.count || 0,
        lastProcessed: lastProcessed[0]?.date || null
      };
    } catch (error) {
      console.error('Error getting optimization stats:', error);
      return {
        totalImprovements: 0,
        avgScoreGain: 0,
        topFailureCategories: [],
        totalTrainingExamples: 0,
        lastProcessed: null
      };
    }
  }

  // Force reprocessing of all failures
  async forceReprocessing(): Promise<number> {
    console.log('🔄 Force reprocessing all failures...');
    
    // Clear existing improvements
    await db.delete(aiReplyImprovements);
    
    // Process all failures
    return await this.processAllFailedReplies();
  }
}

export const aiSelfOptimizer = new AISelfOptimizer();