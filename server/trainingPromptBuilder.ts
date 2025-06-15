/**
 * Training Prompt Builder - Closed-Loop AI Learning System
 * Converts agent feedback into training data for AI improvement
 */

export interface TrainingData {
  message: string;
  aiReply: string;
  feedback: "yes" | "no";
  agentReply?: string;
  customerContext?: string;
  urgencyLevel?: string;
  classification?: string;
}

export interface TrainingPrompt {
  messageId: string;
  prompt: string;
  rating: number;
  feedbackType: 'positive' | 'negative' | 'correction';
  contextData: Record<string, any>;
}

export class TrainingPromptBuilder {
  /**
   * Builds a comprehensive training prompt from feedback data
   */
  static buildTrainingPrompt(data: TrainingData): string {
    const { message, aiReply, feedback, agentReply, customerContext, urgencyLevel, classification } = data;
    
    let prompt = `
=== AI TRAINING DATA ===

Customer Message:
${message}

${customerContext ? `Customer Context: ${customerContext}` : ''}
${urgencyLevel ? `Urgency Level: ${urgencyLevel}` : ''}
${classification ? `Message Type: ${classification}` : ''}

AI Suggested Reply:
${aiReply}

Agent Feedback: ${feedback === "yes" ? "✅ HELPFUL - This response was useful" : "❌ NOT HELPFUL - This response needs improvement"}

${feedback === "no" && agentReply ? `
Agent's Better Response:
${agentReply}

LEARNING OBJECTIVE: Compare the AI reply with the agent's response to understand:
- What made the AI response inadequate
- How the agent's approach was more effective
- What context or tone the AI missed
` : ''}

${feedback === "yes" ? `
REINFORCEMENT: This response demonstrates good:
- Tone and empathy
- Problem-solving approach
- Customer service best practices
- Contextual understanding
` : ''}

---
Training Goal: Use this feedback to improve AI response quality and customer satisfaction.
`.trim();

    return prompt;
  }

  /**
   * Builds a specialized training prompt for specific scenarios
   */
  static buildScenarioTrainingPrompt(scenario: string, data: TrainingData): string {
    const basePrompt = this.buildTrainingPrompt(data);
    
    const scenarioContext = {
      'complaint': 'Focus on empathy, acknowledgment, and solution-oriented responses',
      'inquiry': 'Prioritize clear information delivery and helpful guidance',
      'support': 'Emphasize technical accuracy and step-by-step assistance',
      'billing': 'Balance sensitivity with policy adherence and clarity',
      'urgent': 'Demonstrate immediate attention and escalation awareness'
    };

    const context = scenarioContext[scenario as keyof typeof scenarioContext] || 'General customer service excellence';

    return `${basePrompt}

SCENARIO FOCUS: ${scenario.toUpperCase()}
Context: ${context}
`;
  }

  /**
   * Analyzes feedback patterns to generate meta-learning insights
   */
  static generateMetaLearningPrompt(feedbackBatch: TrainingData[]): string {
    const totalFeedback = feedbackBatch.length;
    const positiveFeedback = feedbackBatch.filter(f => f.feedback === 'yes').length;
    const negativeFeedback = totalFeedback - positiveFeedback;
    const successRate = Math.round((positiveFeedback / totalFeedback) * 100);

    const commonIssues = this.identifyCommonIssues(feedbackBatch.filter(f => f.feedback === 'no'));
    const successPatterns = this.identifySuccessPatterns(feedbackBatch.filter(f => f.feedback === 'yes'));

    return `
=== META LEARNING ANALYSIS ===

Performance Summary:
- Total Responses Evaluated: ${totalFeedback}
- Success Rate: ${successRate}% (${positiveFeedback}/${totalFeedback})
- Improvement Needed: ${negativeFeedback} responses

Common Issues in Failed Responses:
${commonIssues.map(issue => `- ${issue}`).join('\n')}

Successful Response Patterns:
${successPatterns.map(pattern => `- ${pattern}`).join('\n')}

SYSTEM IMPROVEMENT RECOMMENDATIONS:
1. Focus training on identified weak areas
2. Reinforce successful response patterns
3. Adjust response generation parameters
4. Update knowledge base with agent corrections

Training Priority: ${successRate < 70 ? 'HIGH' : successRate < 85 ? 'MEDIUM' : 'LOW'}
`.trim();
  }

  private static identifyCommonIssues(negativeFeedback: TrainingData[]): string[] {
    const issues = [];
    
    // Analyze patterns in negative feedback
    const hasGenericResponses = negativeFeedback.some(f => 
      f.aiReply.length < 50 || f.aiReply.includes('Hello.') || f.aiReply.includes('Thank you.')
    );
    
    const hasLengthIssues = negativeFeedback.some(f => f.aiReply.length > 500);
    
    const hasToneIssues = negativeFeedback.some(f => 
      f.agentReply && f.agentReply.includes('sorry') && !f.aiReply.includes('sorry')
    );

    if (hasGenericResponses) issues.push('Generic or overly brief responses');
    if (hasLengthIssues) issues.push('Responses too long or verbose');
    if (hasToneIssues) issues.push('Insufficient empathy or apologetic tone');
    
    return issues.length > 0 ? issues : ['Requires detailed analysis of specific feedback'];
  }

  private static identifySuccessPatterns(positiveFeedback: TrainingData[]): string[] {
    const patterns = [];
    
    const hasEmpathy = positiveFeedback.some(f => 
      f.aiReply.includes('understand') || f.aiReply.includes('sorry') || f.aiReply.includes('apologize')
    );
    
    const hasSpecificity = positiveFeedback.some(f => f.aiReply.length > 100 && f.aiReply.length < 300);
    
    const hasActionItems = positiveFeedback.some(f => 
      f.aiReply.includes('will') || f.aiReply.includes('let me') || f.aiReply.includes('I can')
    );

    if (hasEmpathy) patterns.push('Empathetic and understanding tone');
    if (hasSpecificity) patterns.push('Balanced response length with specific details');
    if (hasActionItems) patterns.push('Clear action items and next steps');
    
    return patterns.length > 0 ? patterns : ['Consistent with customer service best practices'];
  }

  /**
   * Creates a feedback summary for storage
   */
  static createFeedbackSummary(data: TrainingData): {
    summary: string;
    category: string;
    priority: number;
  } {
    const category = data.feedback === 'yes' ? 'positive_reinforcement' : 'improvement_needed';
    const priority = data.feedback === 'no' ? (data.urgencyLevel === 'high' ? 3 : 2) : 1;
    
    const summary = data.feedback === 'yes' 
      ? `Successful AI response for ${data.classification || 'customer inquiry'}`
      : `AI response needs improvement: ${data.agentReply ? 'Agent provided better alternative' : 'Marked as unhelpful'}`;

    return { summary, category, priority };
  }
}