import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR 
});

export interface CustomerServiceResponse {
  response: string;
  confidence: number;
  requiresHuman: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AdOptimizationSuggestion {
  type: 'budget' | 'timing' | 'content' | 'audience';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  expectedImpact: string;
}

export interface PolicyComplianceCheck {
  isCompliant: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: string[];
  suggestions: string[];
}

// Customer Service AI
export async function generateCustomerServiceResponse(
  customerMessage: string,
  customerHistory: string[],
  businessContext: string
): Promise<CustomerServiceResponse> {
  try {
    const systemPrompt = `You are SaCuRa AI, a professional customer service assistant for ${businessContext}. 
    Respond helpfully, professionally, and concisely. Keep responses under 150 words.
    If the query requires technical support, account access, or complex issues, set requiresHuman to true.
    Analyze the sentiment of the customer's message and respond appropriately.`;

    const userPrompt = `Customer message: "${customerMessage}"
    
    Previous interactions: ${customerHistory.slice(-3).join(' | ')}
    
    Provide a JSON response with:
    - response: your helpful reply
    - confidence: 0-1 confidence score
    - requiresHuman: boolean if human intervention needed
    - sentiment: customer's sentiment (positive/negative/neutral)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      response: result.response || "I'll connect you with a human representative shortly.",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      requiresHuman: result.requiresHuman || false,
      sentiment: result.sentiment || 'neutral'
    };
  } catch (error) {
    console.error('Error generating customer service response:', error);
    return {
      response: "Thank you for reaching out. A team member will assist you shortly.",
      confidence: 0.1,
      requiresHuman: true,
      sentiment: 'neutral'
    };
  }
}

// Ad Optimization AI
export async function generateAdOptimizationSuggestions(
  adData: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpm: number;
    cpc: number;
  },
  campaignObjective: string,
  targetAudience: string
): Promise<AdOptimizationSuggestion[]> {
  try {
    const systemPrompt = `You are an expert Facebook ads optimization AI. Analyze the provided ad performance data and generate actionable optimization suggestions.`;

    const userPrompt = `Ad Performance Data:
    - Spend: $${adData.spend}
    - Impressions: ${adData.impressions}
    - Clicks: ${adData.clicks}
    - Conversions: ${adData.conversions}
    - CTR: ${adData.ctr}%
    - CPM: $${adData.cpm}
    - CPC: $${adData.cpc}
    
    Campaign Objective: ${campaignObjective}
    Target Audience: ${targetAudience}
    
    Generate 3-5 optimization suggestions in JSON format as an array with:
    - type: budget/timing/content/audience
    - title: brief title
    - description: detailed suggestion
    - priority: low/medium/high
    - expectedImpact: expected improvement`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"suggestions": []}');
    return result.suggestions || [];
  } catch (error) {
    console.error('Error generating ad optimization suggestions:', error);
    return [];
  }
}

// Policy Compliance Checker
export async function checkPolicyCompliance(
  adContent: string,
  targetAudience: string,
  productCategory: string
): Promise<PolicyComplianceCheck> {
  try {
    const systemPrompt = `You are a Facebook advertising policy compliance expert. 
    Analyze the provided ad content for potential policy violations based on Facebook's current advertising policies.
    Consider prohibited content, restricted industries, targeting restrictions, and content guidelines.`;

    const userPrompt = `Ad Content: "${adContent}"
    Target Audience: ${targetAudience}
    Product Category: ${productCategory}
    
    Analyze for Facebook policy compliance and respond in JSON format with:
    - isCompliant: boolean
    - riskLevel: low/medium/high/critical
    - violations: array of potential violations
    - suggestions: array of improvement suggestions`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      isCompliant: result.isCompliant || false,
      riskLevel: result.riskLevel || 'medium',
      violations: result.violations || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('Error checking policy compliance:', error);
    return {
      isCompliant: false,
      riskLevel: 'medium',
      violations: ['Unable to analyze content'],
      suggestions: ['Please review content manually']
    };
  }
}

// Content Generation
export async function generateAdCopy(
  productDescription: string,
  targetAudience: string,
  campaignObjective: string,
  tone: string = 'professional'
): Promise<{
  headlines: string[];
  descriptions: string[];
  ctaButtons: string[];
}> {
  try {
    const systemPrompt = `You are a creative Facebook ads copywriter. Generate compelling, policy-compliant ad copy that drives conversions.`;

    const userPrompt = `Product: ${productDescription}
    Target Audience: ${targetAudience}
    Campaign Objective: ${campaignObjective}
    Tone: ${tone}
    
    Generate ad copy in JSON format with:
    - headlines: 3 compelling headlines (max 40 characters each)
    - descriptions: 3 ad descriptions (max 125 characters each)
    - ctaButtons: 3 call-to-action suggestions`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      headlines: result.headlines || ['Great Product'],
      descriptions: result.descriptions || ['Check out our amazing product'],
      ctaButtons: result.ctaButtons || ['Learn More']
    };
  } catch (error) {
    console.error('Error generating ad copy:', error);
    return {
      headlines: ['Quality Products'],
      descriptions: ['Discover our latest offerings'],
      ctaButtons: ['Shop Now']
    };
  }
}

// Sentiment Analysis
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment and emotions in the provided text. Respond with JSON containing sentiment (positive/negative/neutral), confidence (0-1), and emotions array."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      sentiment: result.sentiment || 'neutral',
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      emotions: result.emotions || []
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      emotions: []
    };
  }
}
