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

export interface GeneratedPost {
  content: string;
  hashtags: string[];
  callToAction: string;
  suggestedImages: string[];
  seoScore: number;
  bestPostTime: string;
  estimatedReach: string;
}

export interface PostAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  readabilityScore: number;
  engagementPrediction: string;
  improvementSuggestions: string[];
}

export async function generateFacebookPost(
  topic: string,
  audience: string,
  postType: string
): Promise<GeneratedPost> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a Facebook marketing expert. Generate optimized social media content based on the given parameters. 
          Create engaging, platform-appropriate content that drives engagement and conversions.
          
          Respond with JSON in this exact format:
          {
            "content": "the main post text (150-300 words, engaging and platform-optimized)",
            "hashtags": ["array", "of", "relevant", "hashtags", "without", "hash", "symbol"],
            "callToAction": "specific call to action suggestion",
            "suggestedImages": ["array of image type suggestions like 'product showcase', 'behind the scenes', etc"],
            "seoScore": 85,
            "bestPostTime": "time suggestion like '2-4 PM weekdays'",
            "estimatedReach": "reach estimate like '500-1,200 users'"
          }`,
        },
        {
          role: "user",
          content: `Generate a Facebook post for:
          Topic: ${topic}
          Target Audience: ${audience}
          Post Type: ${postType}
          
          Make it engaging, relevant, and optimized for Facebook's algorithm.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    throw new Error("Failed to generate Facebook post: " + error.message);
  }
}

export async function analyzePostContent(content: string): Promise<PostAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a social media analytics expert. Analyze the given post content for engagement potential, readability, and provide improvement suggestions.
          
          Respond with JSON in this exact format:
          {
            "sentiment": "positive" | "negative" | "neutral",
            "readabilityScore": 85,
            "engagementPrediction": "High" | "Medium" | "Low",
            "improvementSuggestions": ["array of specific suggestions to improve the post"]
          }`,
        },
        {
          role: "user",
          content: `Analyze this Facebook post content:
          
          ${content}
          
          Provide detailed analysis and actionable improvement suggestions.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    throw new Error("Failed to analyze post content: " + error.message);
  }
}

export async function generateSEOOptimizedContent(
  originalContent: string,
  keywords: string[]
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Optimize the given content for better search visibility while maintaining readability and engagement. Include relevant keywords naturally.",
        },
        {
          role: "user",
          content: `Optimize this content for SEO:
          
          Original: ${originalContent}
          Keywords to include: ${keywords.join(', ')}
          
          Return only the optimized content, maintaining the original tone and message.`,
        },
      ],
    });

    return response.choices[0].message.content || originalContent;
  } catch (error) {
    throw new Error("Failed to optimize content for SEO: " + (error as Error).message);
  }
}

export async function generateImage(prompt: string): Promise<{ url: string; prompt: string; style: string; dimensions: string }> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return {
      url: response.data[0].url || '',
      prompt: prompt,
      style: 'realistic',
      dimensions: '1024x1024'
    };
  } catch (error) {
    throw new Error("Failed to generate image: " + (error as Error).message);
  }
}
