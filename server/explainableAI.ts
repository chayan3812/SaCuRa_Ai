import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ExplainableAIEngine {
  async explainReply(params: {
    message: string;
    reply: string;
    context?: string;
  }): Promise<{
    explanation: string;
    confidenceScore: number;
    reasoningFactors: {
      toneMatch: number;
      contentRelevance: number;
      helpfulness: number;
      empathy: number;
      completeness: number;
    };
    keyDecisionPoints: string[];
    alternatives?: string[];
  }> {
    try {
      const prompt = `
As an AI assistant explainer, analyze why this specific reply was chosen for the customer message.

Customer Message: "${params.message}"
AI Reply: "${params.reply}"
${params.context ? `Context: ${params.context}` : ''}

Provide a detailed explanation covering:
1. Why this tone was chosen
2. What content elements were prioritized
3. How empathy was demonstrated
4. What made this response helpful
5. Key decision points in crafting the reply

Also rate each factor 1-10:
- Tone Match: How well the tone matches customer urgency/emotion
- Content Relevance: How directly the reply addresses the inquiry
- Helpfulness: How actionable and useful the response is
- Empathy: How well emotional needs are acknowledged
- Completeness: How thoroughly concerns are addressed

Respond in JSON format:
{
  "explanation": "Detailed explanation of the reply choice",
  "confidenceScore": 0.85,
  "reasoningFactors": {
    "toneMatch": 8,
    "contentRelevance": 9,
    "helpfulness": 7,
    "empathy": 8,
    "completeness": 8
  },
  "keyDecisionPoints": ["Point 1", "Point 2", "Point 3"],
  "alternatives": ["Alternative approach 1", "Alternative approach 2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        explanation: analysis.explanation || "Unable to generate explanation",
        confidenceScore: Math.max(0, Math.min(1, analysis.confidenceScore || 0.5)),
        reasoningFactors: {
          toneMatch: Math.max(1, Math.min(10, analysis.reasoningFactors?.toneMatch || 5)),
          contentRelevance: Math.max(1, Math.min(10, analysis.reasoningFactors?.contentRelevance || 5)),
          helpfulness: Math.max(1, Math.min(10, analysis.reasoningFactors?.helpfulness || 5)),
          empathy: Math.max(1, Math.min(10, analysis.reasoningFactors?.empathy || 5)),
          completeness: Math.max(1, Math.min(10, analysis.reasoningFactors?.completeness || 5)),
        },
        keyDecisionPoints: analysis.keyDecisionPoints || [],
        alternatives: analysis.alternatives || [],
      };
    } catch (error) {
      console.error("Error explaining AI reply:", error);
      return {
        explanation: "Unable to generate explanation due to processing error",
        confidenceScore: 0.3,
        reasoningFactors: {
          toneMatch: 5,
          contentRelevance: 5,
          helpfulness: 5,
          empathy: 5,
          completeness: 5,
        },
        keyDecisionPoints: [],
        alternatives: [],
      };
    }
  }

  async calculateConfidenceScore(params: {
    message: string;
    reply: string;
    context?: string;
  }): Promise<{
    score: number;
    factors: {
      clarity: number;
      relevance: number;
      completeness: number;
      confidence: number;
    };
    shouldSnooze: boolean;
    snoozeReason?: string;
  }> {
    try {
      const prompt = `
Analyze the confidence level of this AI reply and determine if it should be auto-snoozed.

Customer: "${params.message}"
AI Reply: "${params.reply}"

Rate confidence factors (0-1):
- Clarity: How clear and understandable is the response?
- Relevance: How well does it address the customer's specific question?
- Completeness: Does it provide sufficient information?
- Confidence: How certain can we be this is the right response?

Threshold for auto-snooze: Overall confidence < 0.3
If confidence is low, explain why (vague response, irrelevant, incomplete, etc.)

Respond in JSON:
{
  "score": 0.85,
  "factors": {
    "clarity": 0.9,
    "relevance": 0.8,
    "completeness": 0.85,
    "confidence": 0.8
  },
  "shouldSnooze": false,
  "snoozeReason": "Optional reason if shouldSnooze is true"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      const score = Math.max(0, Math.min(1, analysis.score || 0.5));
      const shouldSnooze = score < 0.3 || analysis.shouldSnooze;

      return {
        score,
        factors: {
          clarity: Math.max(0, Math.min(1, analysis.factors?.clarity || 0.5)),
          relevance: Math.max(0, Math.min(1, analysis.factors?.relevance || 0.5)),
          completeness: Math.max(0, Math.min(1, analysis.factors?.completeness || 0.5)),
          confidence: Math.max(0, Math.min(1, analysis.factors?.confidence || 0.5)),
        },
        shouldSnooze,
        snoozeReason: shouldSnooze ? (analysis.snoozeReason || "Low confidence score") : undefined,
      };
    } catch (error) {
      console.error("Error calculating confidence score:", error);
      return {
        score: 0.2,
        factors: {
          clarity: 0.2,
          relevance: 0.2,
          completeness: 0.2,
          confidence: 0.2,
        },
        shouldSnooze: true,
        snoozeReason: "Error in confidence calculation",
      };
    }
  }

  async generateImprovedReply(params: {
    message: string;
    originalReply: string;
    issues: string[];
    context?: string;
  }): Promise<{
    improvedReply: string;
    improvements: string[];
    confidenceScore: number;
  }> {
    try {
      const prompt = `
Generate an improved customer service reply based on the issues identified.

Customer Message: "${params.message}"
Original Reply: "${params.originalReply}"
Issues to Address: ${params.issues.join(', ')}
${params.context ? `Context: ${params.context}` : ''}

Create an improved reply that:
- Addresses all identified issues
- Maintains professional, empathetic tone
- Provides specific, actionable solutions
- Shows genuine understanding of customer needs
- Is clear and complete

Also list the specific improvements made and rate your confidence (0-1).

Respond in JSON:
{
  "improvedReply": "The enhanced customer service response",
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
  "confidenceScore": 0.9
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        improvedReply: result.improvedReply || "Unable to generate improved reply",
        improvements: result.improvements || [],
        confidenceScore: Math.max(0, Math.min(1, result.confidenceScore || 0.5)),
      };
    } catch (error) {
      console.error("Error generating improved reply:", error);
      return {
        improvedReply: "Error generating improved response",
        improvements: [],
        confidenceScore: 0.2,
      };
    }
  }
}

export const explainableAI = new ExplainableAIEngine();