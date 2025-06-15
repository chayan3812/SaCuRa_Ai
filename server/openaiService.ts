import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIService {
  private model = "gpt-4o";

  async generateContent(prompt: string, options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}): Promise<string> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      
      if (options.systemPrompt) {
        messages.push({
          role: "system",
          content: options.systemPrompt
        });
      }
      
      messages.push({
        role: "user",
        content: prompt
      });

      const response = await openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI content generation error:", error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeSentiment(text: string): Promise<{
    rating: number;
    confidence: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }"
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || "{}");

      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      };
    } catch (error) {
      console.error("OpenAI sentiment analysis error:", error);
      throw new Error(`OpenAI sentiment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateReply(customerMessage: string, context: {
    customerName?: string;
    previousInteractions?: string[];
    businessContext?: string;
  } = {}): Promise<{
    reply: string;
    confidence: number;
    tone: string;
  }> {
    try {
      const systemPrompt = `You are a professional customer service AI assistant. Generate helpful, empathetic, and solution-focused replies to customer messages. 
      
Business Context: ${context.businessContext || 'General customer service'}
Customer Name: ${context.customerName || 'Customer'}
Previous Interactions: ${context.previousInteractions?.join('\n') || 'None'}

Respond with JSON in this format: 
{
  "reply": "Your professional response",
  "confidence": 0.85,
  "tone": "professional|friendly|empathetic|solution-focused"
}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: customerMessage
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || "{}");

      return {
        reply: result.reply || "Thank you for your message. We'll get back to you soon.",
        confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
        tone: result.tone || "professional"
      };
    } catch (error) {
      console.error("OpenAI reply generation error:", error);
      throw new Error(`OpenAI reply generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeImage(base64Image: string, prompt?: string): Promise<string> {
    try {
      const visionResponse = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt || "Analyze this image in detail and describe its key elements, context, and any notable aspects."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 500,
      });

      return visionResponse.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI image analysis error:", error);
      throw new Error(`OpenAI image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateImage(prompt: string): Promise<{ url: string }> {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return { url: response.data[0]?.url || "" };
    } catch (error) {
      console.error("OpenAI image generation error:", error);
      throw new Error(`OpenAI image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async improvePrompt(originalPrompt: string, feedback: string): Promise<{
    improvedPrompt: string;
    improvements: string[];
    expectedImpact: string;
  }> {
    try {
      const systemPrompt = `You are an AI prompt optimization expert. Analyze the original prompt and feedback to create an improved version.

Provide response in JSON format:
{
  "improvedPrompt": "The enhanced prompt",
  "improvements": ["List of specific improvements made"],
  "expectedImpact": "Description of expected performance improvement"
}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Original Prompt: ${originalPrompt}\n\nFeedback: ${feedback}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || "{}");

      return {
        improvedPrompt: result.improvedPrompt || originalPrompt,
        improvements: result.improvements || [],
        expectedImpact: result.expectedImpact || "Minor improvements expected"
      };
    } catch (error) {
      console.error("OpenAI prompt improvement error:", error);
      throw new Error(`OpenAI prompt improvement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openaiService = new OpenAIService();