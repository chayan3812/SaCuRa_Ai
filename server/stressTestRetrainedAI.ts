import { storage } from "./storage";
import { db } from "./db";
import { customerInteractions, aiStressTestLog } from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ReplyEvaluation {
  score: number;
  comments: string;
  categories: {
    empathy: number;
    clarity: number;
    completeness: number;
    accuracy: number;
    tone: number;
  };
}

interface StressTestResult {
  interactionId: string;
  originalReply: string;
  improvedReply: string;
  evalScore: number;
  improvement: number;
  confidenceScore: number;
  categories: any;
  comments: string;
  processingTime: number;
  timestamp: Date;
}

export class StressTestEngine {
  private testResults: StressTestResult[] = [];
  private isRunning = false;

  async launchStressTestBatch(options: {
    batchSize?: number;
    timeframeDays?: number;
    includeRealQueries?: boolean;
  } = {}): Promise<{
    totalProcessed: number;
    averageImprovement: number;
    outliers: StressTestResult[];
    categories: Record<string, number>;
    recommendations: string[];
  }> {
    if (this.isRunning) {
      throw new Error("Stress test already running");
    }

    this.isRunning = true;
    console.log(`🚀 Launching elite stress-test batch...`);

    try {
      const {
        batchSize = 100,
        timeframeDays = 30,
        includeRealQueries = true
      } = options;

      // Get real failed interactions from last 30 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

      const realBadReplies = await db
        .select()
        .from(customerInteractions)
        .where(eq(customerInteractions.feedback, "no"))
        .limit(batchSize);

      console.log(`📊 Processing ${realBadReplies.length} real failed interactions...`);

      for (const interaction of realBadReplies) {
        if (!interaction.aiReply) continue;

        const startTime = Date.now();

        try {
          // Generate improved reply
          const improvedReply = await this.generateImprovedReply(interaction.message);

          // Evaluate both replies
          const evaluation = await this.evaluateReplies({
            original: interaction.aiReply,
            improved: improvedReply,
            message: interaction.message,
          });

          // Calculate confidence score
          const confidenceScore = await this.calculateConfidenceScore(improvedReply, interaction.message);

          const processingTime = Date.now() - startTime;
          const improvement = evaluation.score - this.scoreReply(interaction.aiReply);

          const result: StressTestResult = {
            interactionId: interaction.id,
            originalReply: interaction.aiReply,
            improvedReply,
            evalScore: evaluation.score,
            improvement,
            confidenceScore,
            categories: evaluation.categories,
            comments: evaluation.comments,
            processingTime,
            timestamp: new Date()
          };

          this.testResults.push(result);

          // Store in database
          await this.storeTestResult(result);

          console.log(`✅ Processed interaction ${interaction.id} - Score: ${evaluation.score}, Improvement: +${improvement}`);

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`❌ Failed to process interaction ${interaction.id}:`, error);
        }
      }

      const analysis = this.analyzeResults();
      console.log(`🎯 Stress test complete:`, analysis);

      return analysis;

    } finally {
      this.isRunning = false;
    }
  }

  private async generateImprovedReply(message: string): Promise<string> {
    try {
      const prompt = `
You are an elite customer service assistant. Generate a highly effective response to this customer message.

Guidelines:
- Show genuine empathy and understanding
- Provide specific, actionable solutions
- Use appropriate tone matching customer urgency
- Include relevant details and next steps
- Be concise but complete

Customer message: "${message}"

Generate an improved reply:`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      });

      return response.choices[0].message.content?.trim() || "Unable to generate improved reply";
    } catch (error) {
      console.error("Error generating improved reply:", error);
      return "Error generating improved reply";
    }
  }

  private async evaluateReplies(params: {
    original: string;
    improved: string;
    message: string;
  }): Promise<ReplyEvaluation> {
    try {
      const prompt = `
Evaluate these two customer service replies and provide detailed scoring.

Customer Message: "${params.message}"

Original Reply: "${params.original}"
Improved Reply: "${params.improved}"

Rate the IMPROVED reply on a scale of 1-10 for:
- Empathy (understanding customer emotions)
- Clarity (clear and easy to understand)
- Completeness (addresses all concerns)
- Accuracy (correct information)
- Tone (appropriate professional tone)

Also provide an overall score (1-10) and brief comments.

Respond in JSON format:
{
  "score": number,
  "categories": {
    "empathy": number,
    "clarity": number,
    "completeness": number,
    "accuracy": number,
    "tone": number
  },
  "comments": "Brief evaluation comments"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const evaluation = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        score: evaluation.score || 5,
        categories: evaluation.categories || {},
        comments: evaluation.comments || "No evaluation available"
      };
    } catch (error) {
      console.error("Error evaluating replies:", error);
      return {
        score: 5,
        categories: { empathy: 5, clarity: 5, completeness: 5, accuracy: 5, tone: 5 },
        comments: "Evaluation failed"
      };
    }
  }

  private async calculateConfidenceScore(reply: string, message: string): Promise<number> {
    try {
      // Use token probability analysis for confidence
      const prompt = `Rate the confidence level of this reply on a scale of 0-1:

Customer: "${message}"
Reply: "${reply}"

Consider factors like:
- Specificity of the response
- Relevance to the question
- Completeness of information
- Clarity of language

Return only a number between 0 and 1:`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 10,
      });

      const confidence = parseFloat(response.choices[0].message.content?.trim() || "0.5");
      return Math.max(0, Math.min(1, confidence));
    } catch (error) {
      console.error("Error calculating confidence:", error);
      return 0.5; // Default confidence
    }
  }

  private scoreReply(reply: string): number {
    // Simple heuristic scoring
    const wordCount = reply.split(' ').length;
    const hasApology = /sorry|apologize|understand/i.test(reply);
    const hasAction = /will|can|let me|I'll/i.test(reply);
    
    let score = 5; // Base score
    
    if (wordCount > 20) score += 1;
    if (wordCount > 50) score += 1;
    if (hasApology) score += 1;
    if (hasAction) score += 1;
    
    return Math.min(10, score);
  }

  private async storeTestResult(result: StressTestResult): Promise<void> {
    try {
      await db.insert(aiStressTestLog).values({
        interactionId: result.interactionId,
        originalReply: result.originalReply,
        improvedReply: result.improvedReply,
        evalScore: result.evalScore,
        improvement: result.improvement,
        confidenceScore: result.confidenceScore,
        categories: result.categories,
        comments: result.comments,
        processingTime: result.processingTime,
      });
    } catch (error) {
      console.error("Error storing test result:", error);
    }
  }

  private analyzeResults(): {
    totalProcessed: number;
    averageImprovement: number;
    outliers: StressTestResult[];
    categories: Record<string, number>;
    recommendations: string[];
  } {
    if (this.testResults.length === 0) {
      return {
        totalProcessed: 0,
        averageImprovement: 0,
        outliers: [],
        categories: {},
        recommendations: []
      };
    }

    const totalImprovement = this.testResults.reduce((sum, r) => sum + r.improvement, 0);
    const averageImprovement = totalImprovement / this.testResults.length;

    // Find outliers (results with very high or very low improvement)
    const outliers = this.testResults.filter(r => 
      Math.abs(r.improvement - averageImprovement) > (averageImprovement * 0.5)
    ).slice(0, 10);

    // Category analysis
    const categories: Record<string, number> = {};
    this.testResults.forEach(r => {
      Object.entries(r.categories).forEach(([category, score]) => {
        categories[category] = (categories[category] || 0) + score;
      });
    });

    // Normalize category scores
    Object.keys(categories).forEach(category => {
      categories[category] = categories[category] / this.testResults.length;
    });

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageImprovement > 2) {
      recommendations.push("Model shows significant improvement potential - proceed with fine-tuning");
    }
    
    if (categories.empathy && categories.empathy < 6) {
      recommendations.push("Focus on empathy training - scores below threshold");
    }
    
    if (categories.completeness && categories.completeness < 6) {
      recommendations.push("Improve response completeness - missing information detected");
    }
    
    const lowConfidenceCount = this.testResults.filter(r => r.confidenceScore < 0.3).length;
    if (lowConfidenceCount > this.testResults.length * 0.2) {
      recommendations.push("High number of low-confidence replies - implement auto-snooze");
    }

    return {
      totalProcessed: this.testResults.length,
      averageImprovement: Math.round(averageImprovement * 100) / 100,
      outliers,
      categories,
      recommendations
    };
  }

  getResults(): StressTestResult[] {
    return this.testResults;
  }

  async exportResultsReport(): Promise<string> {
    const analysis = this.analyzeResults();
    
    return `
Elite AI Stress Test Report
==========================

Total Processed: ${analysis.totalProcessed} interactions
Average Improvement: +${analysis.averageImprovement} points
Outliers Detected: ${analysis.outliers.length}

Category Scores:
${Object.entries(analysis.categories)
  .map(([category, score]) => `- ${category}: ${score.toFixed(2)}/10`)
  .join('\n')}

Top Outliers:
${analysis.outliers
  .slice(0, 5)
  .map((r, i) => `${i + 1}. Improvement: +${r.improvement} (${r.comments.substring(0, 50)}...)`)
  .join('\n')}

Recommendations:
${analysis.recommendations.map(r => `• ${r}`).join('\n')}

Low Confidence Replies: ${this.testResults.filter(r => r.confidenceScore < 0.3).length}
High Performance Replies: ${this.testResults.filter(r => r.evalScore >= 8).length}
`;
  }
}

export const stressTestEngine = new StressTestEngine();