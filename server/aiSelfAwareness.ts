import { storage } from "./storage";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Self-Awareness: Explain why a reply failed
export async function explainReplyFailure({
  userMessage,
  aiReply,
  agentReply,
}: {
  userMessage: string;
  aiReply: string;
  agentReply?: string;
}): Promise<string> {
  const prompt = `
A user received the following AI reply and marked it as "Not Useful". Please explain WHY it likely failed, and how it could be improved.

User Message:
"${userMessage}"

AI's Reply:
"${aiReply}"

${agentReply ? `Agent's Actual Reply:\n"${agentReply}"` : ""}

Respond with a clear explanation of what the AI got wrong, and how to improve future responses.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "system", content: prompt }],
      temperature: 0.4,
    });

    return completion.choices[0].message.content || "Unable to analyze failure reason.";
  } catch (error) {
    console.error('Error analyzing reply failure:', error);
    return "Unable to analyze failure reason due to technical error.";
  }
}

// Enhanced feedback processing pipeline with AI self-awareness
export async function processFailedReplyFeedback({
  userMessage,
  aiReply,
  agentReply,
  feedback
}: {
  userMessage: string;
  aiReply: string;
  agentReply?: string;
  feedback: string;
}) {
  if (feedback === "no") {
    try {
      // Generate AI self-awareness explanation
      const explanation = await explainReplyFailure({
        userMessage,
        aiReply,
        agentReply,
      });

      // Store failure explanation for learning
      await storage.storeFailureExplanation({
        message: userMessage,
        aiReply,
        agentReply,
        explanation,
      });

      console.log('🧠 AI Self-Awareness: Stored failure explanation for learning');
      return explanation;
    } catch (error) {
      console.error('Error processing failed reply feedback:', error);
      return null;
    }
  }
  return null;
}

// Get AI failure insights for training dashboard
export async function getAIFailureInsights(): Promise<{
  totalFailures: number;
  recentFailures: any[];
  commonFailurePatterns: string[];
}> {
  try {
    const failures = await storage.getFailureExplanations();
    
    // Analyze common failure patterns
    const commonPatterns = failures
      .slice(0, 20) // Recent 20 failures
      .map(f => f.explanation)
      .join('\n\n');

    const patternAnalysis = await analyzeFailurePatterns(commonPatterns);

    return {
      totalFailures: failures.length,
      recentFailures: failures.slice(0, 10),
      commonFailurePatterns: patternAnalysis,
    };
  } catch (error) {
    console.error('Error getting AI failure insights:', error);
    return {
      totalFailures: 0,
      recentFailures: [],
      commonFailurePatterns: [],
    };
  }
}

// Analyze failure patterns to identify common AI mistakes
async function analyzeFailurePatterns(explanations: string): Promise<string[]> {
  if (!explanations.trim()) return [];

  try {
    const prompt = `
Analyze these AI failure explanations and identify the top 5 most common failure patterns:

${explanations}

Return only a JSON array of strings, each describing a common failure pattern.
Example: ["Tone mismatch", "Missing context", "Too generic", "Incorrect assumptions", "Poor empathy"]
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

export { getAIFailureInsights as getFailureInsights };