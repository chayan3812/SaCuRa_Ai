import { aiSelfOptimizer } from "./aiSelfOptimizer";
import { storage } from "./storage";
import { db } from "./db";
import { aiReplyFailures, aiAssistantVersions } from "@shared/schema";

interface FailureTestCase {
  customerMessage: string;
  badAiReply: string;
  expectedGoodReply: string;
  category: string;
  severity: "low" | "medium" | "high";
}

// Simulated failure scenarios for stress testing
const simulatedFailures: FailureTestCase[] = [
  {
    customerMessage: "My payment failed three times and I'm really frustrated!",
    badAiReply: "Thank you for contacting us.",
    expectedGoodReply: "I understand your frustration with the payment failures. Let me check your account immediately and resolve this for you right now.",
    category: "empathy",
    severity: "high"
  },
  {
    customerMessage: "How do I cancel my subscription?",
    badAiReply: "You can cancel in settings.",
    expectedGoodReply: "I can help you cancel your subscription. Go to Account Settings > Billing > Cancel Subscription. Would you like me to walk you through each step?",
    category: "specificity",
    severity: "medium"
  },
  {
    customerMessage: "Your app keeps crashing when I try to upload photos",
    badAiReply: "Sorry about that issue.",
    expectedGoodReply: "I apologize for the photo upload crashes. This is a known issue we're actively fixing. As a workaround, try reducing photo size to under 5MB or use our web uploader.",
    category: "completeness",
    severity: "high"
  },
  {
    customerMessage: "I was charged twice for the same order",
    badAiReply: "Please check your billing.",
    expectedGoodReply: "I see you were charged twice for order #12345. I've immediately flagged this for refund processing. You'll see the duplicate charge reversed within 3-5 business days.",
    category: "accuracy",
    severity: "high"
  },
  {
    customerMessage: "Can you help me understand your pricing?",
    badAiReply: "We have different plans available.",
    expectedGoodReply: "I'd be happy to explain our pricing. We offer three plans: Basic ($9/month), Pro ($19/month), and Enterprise ($49/month). Each includes different features. What specific use case are you considering?",
    category: "specificity",
    severity: "medium"
  },
  {
    customerMessage: "The new update broke my workflow completely",
    badAiReply: "Updates can sometimes cause issues.",
    expectedGoodReply: "I understand how disruptive workflow changes can be. Let me help you restore your previous setup or find equivalent features in the new version. What specific workflow was affected?",
    category: "empathy",
    severity: "high"
  },
  {
    customerMessage: "How long does shipping take?",
    badAiReply: "It depends on your location.",
    expectedGoodReply: "Shipping times vary by location: US domestic 2-3 business days, Canada 3-5 days, International 7-14 days. Express options available. What's your zip code for exact timing?",
    category: "specificity",
    severity: "low"
  },
  {
    customerMessage: "I need a refund for my recent purchase",
    badAiReply: "We process refunds according to our policy.",
    expectedGoodReply: "I can help with your refund request. Our policy allows full refunds within 30 days. I see your recent purchase was made 5 days ago, so you're eligible. I'll process this now.",
    category: "completeness",
    severity: "medium"
  },
  {
    customerMessage: "Your competitor offers this feature, why don't you?",
    badAiReply: "We're always working on new features.",
    expectedGoodReply: "Great question! While we don't have that exact feature yet, we offer [similar functionality] that might meet your needs. I'd love to understand your use case better to suggest the best solution.",
    category: "tone",
    severity: "medium"
  },
  {
    customerMessage: "I can't log into my account after password reset",
    badAiReply: "Try resetting your password again.",
    expectedGoodReply: "Let me troubleshoot this login issue. First, check if the reset email went to spam. If not, I can send a new reset link or manually verify your account. What email address are you using?",
    category: "completeness",
    severity: "high"
  }
];

export class AITestHarness {
  private testResults: Array<{
    testCase: FailureTestCase;
    correctedReply: string;
    scoreImprovement: number;
    processingTime: number;
    timestamp: Date;
  }> = [];

  async runFailureStressTest(batchSize: number = 10): Promise<{
    totalProcessed: number;
    averageImprovement: number;
    categoriesProcessed: Record<string, number>;
    averageProcessingTime: number;
    testResults: typeof this.testResults;
  }> {
    console.log(`🚀 Starting AI failure stress test with ${batchSize} cases...`);
    
    const selectedCases = simulatedFailures.slice(0, batchSize);
    const categoryCounts: Record<string, number> = {};
    let totalImprovement = 0;
    let totalProcessingTime = 0;

    for (const testCase of selectedCases) {
      const startTime = Date.now();
      
      try {
        // Store the failure in database
        await db.insert(aiReplyFailures).values({
          message: testCase.customerMessage,
          aiReply: testCase.badAiReply,
          agentReply: testCase.expectedGoodReply,
          explanation: `Simulated failure - ${testCase.category} issue`,
        });

        // Generate corrected reply using AI self-optimizer
        const correctedReply = await aiSelfOptimizer.generateCorrectedReply({
          originalPrompt: testCase.customerMessage,
          aiReply: testCase.badAiReply,
          agentReply: testCase.expectedGoodReply,
          failureExplanation: `Simulated failure - ${testCase.category} issue`,
        });

        const processingTime = Date.now() - startTime;
        
        // Calculate improvement score (simplified)
        const scoreImprovement = this.calculateImprovementScore(
          testCase.badAiReply,
          correctedReply,
          testCase.expectedGoodReply
        );

        this.testResults.push({
          testCase,
          correctedReply,
          scoreImprovement,
          processingTime,
          timestamp: new Date()
        });

        // Update category counts
        categoryCounts[testCase.category] = (categoryCounts[testCase.category] || 0) + 1;
        totalImprovement += scoreImprovement;
        totalProcessingTime += processingTime;

        console.log(`✅ Processed ${testCase.category} case - Score gain: +${scoreImprovement}`);

        // Rate limiting to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Failed to process test case:`, error);
      }
    }

    const results = {
      totalProcessed: this.testResults.length,
      averageImprovement: Math.round((totalImprovement / this.testResults.length) * 100) / 100,
      categoriesProcessed: categoryCounts,
      averageProcessingTime: Math.round(totalProcessingTime / this.testResults.length),
      testResults: this.testResults
    };

    console.log(`🎯 Stress test complete:`, results);
    return results;
  }

  private calculateImprovementScore(
    originalReply: string,
    correctedReply: string,
    targetReply: string
  ): number {
    // Simple scoring based on length, keywords, and similarity to target
    const originalScore = this.scoreReply(originalReply, targetReply);
    const correctedScore = this.scoreReply(correctedReply, targetReply);
    
    return Math.max(0, correctedScore - originalScore);
  }

  private scoreReply(reply: string, target: string): number {
    const replyWords = reply.toLowerCase().split(' ');
    const targetWords = target.toLowerCase().split(' ');
    
    // Calculate word overlap
    const overlap = replyWords.filter(word => targetWords.includes(word)).length;
    const lengthScore = Math.min(reply.length / target.length, 1);
    
    return (overlap / targetWords.length) * 5 + lengthScore * 5;
  }

  async runModelDriftTest(): Promise<{
    driftDetected: boolean;
    confidenceChange: number;
    recommendRetraining: boolean;
  }> {
    console.log('🔍 Running model drift detection...');
    
    // Get recent performance metrics
    const recentStats = await aiSelfOptimizer.getOptimizationStats();
    
    // Simple drift detection based on average score gain
    const driftThreshold = 2.0;
    const driftDetected = recentStats.avgScoreGain < driftThreshold;
    
    return {
      driftDetected,
      confidenceChange: recentStats.avgScoreGain,
      recommendRetraining: driftDetected || recentStats.totalImprovements > 100
    };
  }

  generateTestReport(): string {
    if (this.testResults.length === 0) {
      return "No test results available. Run a stress test first.";
    }

    const report = `
AI Test Harness Report
=====================

Total Test Cases: ${this.testResults.length}
Average Score Improvement: +${this.testResults.reduce((sum, r) => sum + r.scoreImprovement, 0) / this.testResults.length}
Average Processing Time: ${this.testResults.reduce((sum, r) => sum + r.processingTime, 0) / this.testResults.length}ms

Category Breakdown:
${Object.entries(this.testResults.reduce((acc, r) => {
  acc[r.testCase.category] = (acc[r.testCase.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>)).map(([cat, count]) => `- ${cat}: ${count} cases`).join('\n')}

Top Improvements:
${this.testResults
  .sort((a, b) => b.scoreImprovement - a.scoreImprovement)
  .slice(0, 3)
  .map((r, i) => `${i + 1}. ${r.testCase.category}: +${r.scoreImprovement} (${r.processingTime}ms)`)
  .join('\n')}
`;

    return report;
  }
}

// AI Assistant Version Management
export class AIVersionManager {
  async createNewVersion(config: {
    versionTag: string;
    description: string;
    fineTuneId?: string;
    modelConfig?: any;
  }): Promise<string> {
    console.log(`📦 Creating AI assistant version ${config.versionTag}...`);
    
    // Deactivate current active version
    await db.update(aiAssistantVersions).set({ isActive: false });
    
    // Create new version
    const [newVersion] = await db.insert(aiAssistantVersions).values({
      versionTag: config.versionTag,
      description: config.description,
      fineTuneId: config.fineTuneId,
      modelConfig: config.modelConfig || {},
      isActive: true,
    }).returning();

    console.log(`✅ Version ${config.versionTag} created and activated`);
    return newVersion.id;
  }

  async getActiveVersion() {
    const [activeVersion] = await db
      .select()
      .from(aiAssistantVersions)
      .where(eq(aiAssistantVersions.isActive, true))
      .limit(1);

    return activeVersion || null;
  }

  async getAllVersions() {
    return await db
      .select()
      .from(aiAssistantVersions)
      .orderBy(desc(aiAssistantVersions.createdAt));
  }

  async updateVersionMetrics(versionId: string, metrics: {
    trainingDataCount?: number;
    performanceMetrics?: any;
  }) {
    await db
      .update(aiAssistantVersions)
      .set({
        trainingDataCount: metrics.trainingDataCount,
        performanceMetrics: metrics.performanceMetrics,
        updatedAt: new Date(),
      })
      .where(eq(aiAssistantVersions.id, versionId));
  }
}

export const aiTestHarness = new AITestHarness();
export const aiVersionManager = new AIVersionManager();