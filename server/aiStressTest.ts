import { db } from "./db";
import { customerInteractions, aiSuggestionFeedback } from "@shared/schema";
import { openaiService } from "./openai";
import { v4 as uuidv4 } from "uuid";

interface StressTestConfig {
  messageCount: number;
  rejectionRate: number;
  neutralRate: number;
  approvalRate: number;
  includeEdgeCases: boolean;
}

interface StressTestResult {
  totalGenerated: number;
  messagesCreated: number;
  feedbackCreated: number;
  approvals: number;
  rejections: number;
  neutral: number;
  executionTime: number;
  categories: { [key: string]: number };
}

export class AIStressTestInjector {
  private readonly edgeCaseMessages = [
    "I want my money back NOW!!!",
    "Your service is absolutely terrible and I'm never using it again",
    "Can you help me with something completely unrelated to your business?",
    "I need to speak to your manager immediately",
    "This is the worst customer service I've ever experienced",
    "I'm going to leave a 1-star review everywhere",
    "I demand a full refund plus compensation for my time",
    "Your website is broken and nothing works",
    "I've been waiting for hours and no one has helped me",
    "I want to cancel everything right now",
    "Why is your product so expensive compared to competitors?",
    "I accidentally ordered 100 items instead of 1, help!",
    "My account was hacked and I see charges I didn't make",
    "I'm reporting you to the Better Business Bureau",
    "Can I get a discount if I threaten to leave?",
    "I lost my receipt but I want to return this item",
    "Your terms of service are too long, summarize them",
    "I want to speak to someone who actually knows what they're doing",
    "I'm disabled and need special accommodation",
    "I'm calling from overseas and this is costing me a fortune",
    "I have a complaint about your employee's behavior",
    "I want to partner with your company, who should I contact?",
    "I'm a lawyer and this looks like false advertising",
    "I want to order 10,000 units for my business",
    "I think there's a bug in your system",
    "I'm confused about your pricing structure",
    "I need help setting up my account",
    "I forgot my password and can't reset it",
    "I want to update my billing information",
    "When will my order arrive?",
    "I received the wrong item",
    "The item I received is damaged",
    "I want to exchange this for a different size",
    "Do you offer price matching?",
    "I have a suggestion for improving your service",
    "I'm interested in your premium plan",
    "I need technical support for integration",
    "I want to downgrade my subscription",
    "I'm moving and need to change my address",
    "I have a question about your privacy policy"
  ];

  private readonly normalMessages = [
    "Hi, I have a question about my recent order",
    "Can you help me understand my bill?",
    "I'm interested in learning more about your services",
    "I'd like to update my account information",
    "What are your hours of operation?",
    "Do you offer customer support via phone?",
    "I'm having trouble accessing my account",
    "Can you walk me through the setup process?",
    "I'd like to know more about your return policy",
    "How long does shipping typically take?",
    "I'm interested in your premium features",
    "Can you help me choose the right plan?",
    "I have a billing question",
    "I need help with product configuration",
    "What payment methods do you accept?",
    "I'd like to schedule a demo",
    "Can you send me more information?",
    "I'm comparing your service to competitors",
    "I have a technical question",
    "I'd like to provide feedback on your service"
  ];

  async runStressTest(config: StressTestConfig): Promise<StressTestResult> {
    const startTime = Date.now();
    const result: StressTestResult = {
      totalGenerated: 0,
      messagesCreated: 0,
      feedbackCreated: 0,
      approvals: 0,
      rejections: 0,
      neutral: 0,
      executionTime: 0,
      categories: {}
    };

    console.log(`🧪 Starting AI Stress Test: ${config.messageCount} messages with ${(config.rejectionRate * 100).toFixed(0)}% rejection rate`);

    // Generate messages and AI responses
    const messages = this.generateTestMessages(config.messageCount, config.includeEdgeCases);
    
    for (const message of messages) {
      try {
        // Create customer interaction
        const interaction = await db.insert(customerInteractions).values({
          id: uuidv4(),
          pageId: "stress_test_page",
          customerId: `stress_customer_${Math.floor(Math.random() * 1000)}`,
          customerName: this.generateCustomerName(),
          message: message.content,
          response: null,
          responseTime: null,
          confidence: null,
          category: message.category,
          sentiment: message.sentiment,
          priority: message.priority,
          isTestData: true,
          createdAt: new Date()
        }).returning();

        result.messagesCreated++;

        // Generate AI response
        const aiResponse = await this.generateAIResponse(message.content);
        
        // Update interaction with AI response
        await db.update(customerInteractions)
          .set({
            response: aiResponse.text,
            confidence: aiResponse.confidence,
            responseTime: aiResponse.responseTime
          })
          .where({ id: interaction[0].id });

        // Simulate feedback based on configured rates
        const feedbackType = this.simulateFeedback(config);
        
        if (feedbackType !== 'none') {
          const feedback = await db.insert(aiSuggestionFeedback).values({
            id: uuidv4(),
            interactionId: interaction[0].id,
            aiSuggestion: aiResponse.text,
            agentFeedback: feedbackType,
            rejectionReason: feedbackType === 'rejected' ? this.generateRejectionReason() : null,
            rejectionAnalysis: feedbackType === 'rejected' ? this.generateRejectionAnalysis() : null,
            agentOverride: feedbackType === 'rejected' ? this.generateAgentOverride(message.content) : null,
            confidence: aiResponse.confidence,
            responseTime: aiResponse.responseTime,
            createdAt: new Date()
          });

          result.feedbackCreated++;
          
          if (feedbackType === 'approved') result.approvals++;
          else if (feedbackType === 'rejected') result.rejections++;
          else result.neutral++;
        }

        // Track categories
        const category = message.category;
        result.categories[category] = (result.categories[category] || 0) + 1;
        result.totalGenerated++;

        // Log progress every 25 messages
        if (result.totalGenerated % 25 === 0) {
          console.log(`📊 Progress: ${result.totalGenerated}/${config.messageCount} messages processed`);
        }

      } catch (error) {
        console.error(`❌ Error processing message: ${error}`);
      }
    }

    result.executionTime = Date.now() - startTime;
    
    console.log(`✅ Stress test completed: ${result.totalGenerated} messages, ${result.feedbackCreated} feedback entries in ${result.executionTime}ms`);
    
    return result;
  }

  private generateTestMessages(count: number, includeEdgeCases: boolean): Array<{
    content: string;
    category: string;
    sentiment: string;
    priority: string;
  }> {
    const messages = [];
    const edgeCaseRatio = includeEdgeCases ? 0.4 : 0.1; // 40% edge cases if enabled, 10% otherwise

    for (let i = 0; i < count; i++) {
      const isEdgeCase = Math.random() < edgeCaseRatio;
      const messagePool = isEdgeCase ? this.edgeCaseMessages : this.normalMessages;
      const content = messagePool[Math.floor(Math.random() * messagePool.length)];
      
      messages.push({
        content,
        category: this.categorizeMessage(content),
        sentiment: this.analyzeSentiment(content),
        priority: isEdgeCase ? 'high' : 'medium'
      });
    }

    return messages;
  }

  private async generateAIResponse(message: string): Promise<{
    text: string;
    confidence: number;
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await openaiService.generateResponse({
        prompt: `You are a helpful customer service AI. Respond professionally to this customer message: "${message}"`,
        maxTokens: 150,
        temperature: 0.7
      });

      const responseTime = Date.now() - startTime;
      const confidence = Math.random() * 0.3 + 0.6; // Random confidence between 0.6-0.9

      return {
        text: response,
        confidence,
        responseTime
      };
    } catch (error) {
      // Fallback response for testing
      return {
        text: "Thank you for contacting us. We'll look into your request and get back to you soon.",
        confidence: 0.5,
        responseTime: Date.now() - startTime
      };
    }
  }

  private simulateFeedback(config: StressTestConfig): 'approved' | 'rejected' | 'neutral' | 'none' {
    const random = Math.random();
    
    if (random < config.rejectionRate) {
      return 'rejected';
    } else if (random < config.rejectionRate + config.approvalRate) {
      return 'approved';
    } else if (random < config.rejectionRate + config.approvalRate + config.neutralRate) {
      return 'neutral';
    }
    
    return 'none';
  }

  private generateRejectionReason(): string {
    const reasons = [
      "Response too generic and unhelpful",
      "Failed to address customer's specific concern",
      "Tone too robotic and impersonal",
      "Missed important details in customer message",
      "Response not appropriate for customer's emotion level",
      "Provided incorrect information",
      "Response too long and confusing",
      "Failed to show empathy for customer's situation",
      "Didn't offer concrete next steps",
      "Response doesn't match company policy"
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private generateRejectionAnalysis(): string {
    const analyses = [
      "AI failed to recognize customer frustration level and respond appropriately",
      "Response lacked personalization and human touch needed for this situation",
      "AI missed key context clues that would inform a better response",
      "Template response used when custom solution was needed",
      "AI didn't escalate when human intervention was clearly required",
      "Response tone didn't match severity of customer's concern",
      "AI provided generic policy response instead of problem-solving",
      "Failed to acknowledge customer's specific pain points",
      "Response showed lack of understanding of customer journey",
      "AI didn't offer appropriate urgency level for time-sensitive issue"
    ];
    
    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  private generateAgentOverride(originalMessage: string): string {
    // Generate a more human, empathetic response
    const templates = [
      "I understand your frustration, and I'm here to help resolve this for you personally.",
      "Thank you for bringing this to our attention. Let me look into this right away.",
      "I sincerely apologize for the inconvenience. Here's how we'll make this right:",
      "I can see why this would be concerning. Let me connect you with someone who can help immediately.",
      "I really appreciate your patience. Let me walk you through exactly what we can do for you."
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private categorizeMessage(message: string): string {
    const categories = ['billing', 'technical', 'general', 'complaint', 'refund', 'account'];
    
    if (message.toLowerCase().includes('money') || message.toLowerCase().includes('refund') || message.toLowerCase().includes('bill')) {
      return 'billing';
    } else if (message.toLowerCase().includes('broken') || message.toLowerCase().includes('bug') || message.toLowerCase().includes('technical')) {
      return 'technical';
    } else if (message.toLowerCase().includes('terrible') || message.toLowerCase().includes('worst') || message.toLowerCase().includes('complaint')) {
      return 'complaint';
    } else if (message.toLowerCase().includes('account') || message.toLowerCase().includes('password') || message.toLowerCase().includes('login')) {
      return 'account';
    } else if (message.toLowerCase().includes('return') || message.toLowerCase().includes('refund')) {
      return 'refund';
    }
    
    return 'general';
  }

  private analyzeSentiment(message: string): string {
    const negative = ['terrible', 'worst', 'awful', 'hate', 'angry', 'frustrated', 'disappointed'];
    const positive = ['great', 'love', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    
    const lowerMessage = message.toLowerCase();
    
    if (negative.some(word => lowerMessage.includes(word))) {
      return 'negative';
    } else if (positive.some(word => lowerMessage.includes(word))) {
      return 'positive';
    }
    
    return 'neutral';
  }

  private generateCustomerName(): string {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  async clearTestData(): Promise<void> {
    console.log('🧹 Clearing previous stress test data...');
    
    // Delete feedback for test interactions
    await db.delete(aiSuggestionFeedback)
      .where(sql`interaction_id IN (SELECT id FROM customer_interactions WHERE is_test_data = true)`);
    
    // Delete test interactions
    await db.delete(customerInteractions)
      .where(eq(customerInteractions.isTestData, true));
    
    console.log('✅ Test data cleared');
  }
}

export const aiStressTestInjector = new AIStressTestInjector();