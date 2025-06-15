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

export interface CompetitorAnalysis {
  strategy: string;
  contentStyle: string;
  audienceEngagement: string;
  postingFrequency: string;
  keyInsights: string[];
  recommendations: string[];
  strengths: string[];
  opportunities: string[];
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

// 👁️ Enhanced by AI on 2025-06-15 — Feature: CompetitorAnalysis
export async function analyzeCompetitorPosts(posts: any[]): Promise<CompetitorAnalysis> {
  try {
    if (!posts || posts.length === 0) {
      return {
        strategy: 'No recent posts available for analysis',
        contentStyle: 'Unable to determine content style',
        audienceEngagement: 'No engagement data available',
        postingFrequency: 'No posting pattern data',
        keyInsights: ['No data available for analysis'],
        recommendations: ['Gather more data to provide meaningful insights'],
        strengths: ['Unable to identify strengths without data'],
        opportunities: ['More data needed to identify opportunities']
      };
    }

    // Prepare post data for AI analysis
    const postAnalysisData = posts.map(post => ({
      message: post.message || 'No message content',
      reactions: post.reactions?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      created_time: post.created_time,
    }));

    const analysisText = postAnalysisData.map(p => 
      `Post: "${p.message.substring(0, 200)}"
      Reactions: ${p.reactions}, Comments: ${p.comments}, Shares: ${p.shares}
      Date: ${p.created_time}`
    ).join('\n\n');

    const systemPrompt = `You are a social media strategist and competitor analysis expert. Analyze Facebook post data to provide strategic insights about content strategy, audience engagement patterns, and marketing opportunities.`;

    const userPrompt = `Analyze the following Facebook post data from a competitor page and provide comprehensive strategic insights:

${analysisText}

Provide analysis in JSON format with:
- strategy: Overall content and marketing strategy (2-3 sentences)
- contentStyle: Description of their content style and approach
- audienceEngagement: Analysis of how their audience responds
- postingFrequency: Assessment of their posting patterns
- keyInsights: Array of 3-4 key strategic insights
- recommendations: Array of 3-4 actionable recommendations for competing
- strengths: Array of 2-3 competitor strengths identified
- opportunities: Array of 2-3 opportunities to exploit`;

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
      strategy: result.strategy || 'Unable to determine strategy from available data',
      contentStyle: result.contentStyle || 'Content style analysis unavailable',
      audienceEngagement: result.audienceEngagement || 'Engagement pattern analysis unavailable',
      postingFrequency: result.postingFrequency || 'Posting frequency analysis unavailable',
      keyInsights: result.keyInsights || ['Analysis incomplete due to limited data'],
      recommendations: result.recommendations || ['Gather more competitor data for better insights'],
      strengths: result.strengths || ['Unable to identify competitor strengths'],
      opportunities: result.opportunities || ['More data needed to identify opportunities']
    };

  } catch (error) {
    console.error('Error analyzing competitor posts:', error);
    return {
      strategy: 'Analysis failed due to technical error',
      contentStyle: 'Unable to analyze content style',
      audienceEngagement: 'Engagement analysis unavailable',
      postingFrequency: 'Posting frequency analysis failed',
      keyInsights: ['Technical error prevented analysis'],
      recommendations: ['Retry analysis with valid data'],
      strengths: ['Analysis error occurred'],
      opportunities: ['Technical issues prevented opportunity identification']
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
    throw new Error("Failed to generate Facebook post: " + (error as Error).message);
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
    throw new Error("Failed to analyze post content: " + (error as Error).message);
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
      url: response.data?.[0]?.url || '',
      prompt: prompt,
      style: 'realistic',
      dimensions: '1024x1024'
    };
  } catch (error) {
    throw new Error("Failed to generate image: " + (error as Error).message);
  }
}

// Add missing function stubs for compatibility
export async function generateContentIdeas(): Promise<any[]> {
  return [];
}

export async function optimizeAdCopy(): Promise<any> {
  return {};
}

export async function analyzeAudience(): Promise<any> {
  return {};
}

export async function generateSocialMediaContent(): Promise<any> {
  return {};
}

export async function generateMarketingStrategy(): Promise<any> {
  return {};
}

export async function analyzeCompetitors(): Promise<any> {
  return {};
}

export async function generateContentCalendar(): Promise<any> {
  return {};
}

// Multi-Page Benchmarking Analysis
export interface PagePosts {
  pageId: string;
  pageName: string;
  profilePicture: string;
  posts: Array<{
    message: string;
    likes: number;
    comments: number;
    shares: number;
    timestamp: string;
    mediaType?: string;
  }>;
}

export interface BenchmarkingResult {
  aiSummary: string;
  stats: Array<{
    pageId: string;
    pageName: string;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    postFrequency: string;
    engagementRate: number;
  }>;
  topPosts: Array<{
    pageId: string;
    pageName: string;
    message: string;
    likes: number;
    comments: number;
    shares: number;
    timestamp: string;
  }>;
  generatedAt: string;
}

export async function analyzePagesComparison(pages: PagePosts[]): Promise<BenchmarkingResult> {
  const prompt = `
Analyze and compare these Facebook Pages as a marketing intelligence expert. Provide a comprehensive comparison across:

1. Post frequency and timing patterns
2. Writing style (formal, casual, emotional, emoji usage)
3. Content focus (promotions, education, testimonials, entertainment, etc.)
4. Engagement strategies and performance
5. Visual content usage (images, videos, carousels)
6. Audience interaction approaches

Pages Data:
${JSON.stringify(pages, null, 2)}

Return a detailed strategic analysis that reveals:
- Key differentiators between pages
- What each page does exceptionally well
- Engagement patterns and why they work
- Content strategies and their effectiveness
- Actionable insights for competitive positioning

Focus on tactical, actionable insights that a marketing team can immediately implement.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing intelligence analyst specializing in competitive social media analysis. Provide detailed, actionable insights based on data patterns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const aiSummary = response.choices[0].message.content || "Analysis completed";

    // Calculate statistics
    const stats = pages.map(page => {
      const totalLikes = page.posts.reduce((sum, post) => sum + post.likes, 0);
      const totalComments = page.posts.reduce((sum, post) => sum + post.comments, 0);
      const totalShares = page.posts.reduce((sum, post) => sum + post.shares, 0);
      const postCount = page.posts.length;

      const avgLikes = postCount > 0 ? Math.round(totalLikes / postCount) : 0;
      const avgComments = postCount > 0 ? Math.round(totalComments / postCount) : 0;
      const avgShares = postCount > 0 ? Math.round(totalShares / postCount) : 0;

      // Calculate engagement rate
      const totalEngagement = totalLikes + totalComments + totalShares;
      const engagementRate = postCount > 0 ? Number((totalEngagement / postCount).toFixed(2)) : 0;

      // Estimate post frequency
      const postFrequency = postCount >= 7 ? "Daily+" : postCount >= 3 ? "Regular" : "Sporadic";

      return {
        pageId: page.pageId,
        pageName: page.pageName,
        avgLikes,
        avgComments,
        avgShares,
        postFrequency,
        engagementRate
      };
    });

    // Get top 2 posts per page
    const topPosts = pages.flatMap(page => {
      const sortedPosts = page.posts
        .sort((a, b) => ((b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)))
        .slice(0, 2);

      return sortedPosts.map(post => ({
        pageId: page.pageId,
        pageName: page.pageName,
        message: post.message.substring(0, 150) + (post.message.length > 150 ? "..." : ""),
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        timestamp: post.timestamp
      }));
    });

    return {
      aiSummary,
      stats,
      topPosts,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw new Error('Failed to analyze pages comparison');
  }
}

// Export openaiService object for compatibility with other modules
export const openaiService = {
  generateCustomerServiceResponse,
  generateAdOptimizationSuggestions,
  checkPolicyCompliance,
  generateContentIdeas,
  optimizeAdCopy,
  analyzeAudience,
  generateSocialMediaContent,
  analyzeSentiment,
  generateMarketingStrategy,
  analyzeCompetitors,
  generateContentCalendar,
  analyzePostContent,
  generateSEOOptimizedContent,
  generateImage,
  analyzePagesComparison
};

// Keyword Extraction from Facebook Posts with Frequency Tracking
export async function extractKeywordsFromPosts(posts: string[]): Promise<Record<string, number>> {
  if (!posts || posts.length === 0) {
    return {};
  }

  const prompt = `Extract the most common keywords, hashtags, trending phrases, and marketing slogans from these Facebook posts. Return as a JSON object where keys are keywords and values are frequency counts (how often they appear). Focus on actionable marketing insights.`;
  const textBlock = posts.filter(p => p && p.trim()).join("\n\n");

  if (!textBlock.trim()) {
    return {};
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are a social media marketing analyst specializing in keyword extraction and frequency analysis. Return only valid JSON objects with keyword-frequency pairs." 
        },
        { 
          role: "user", 
          content: `${prompt}\n\nPosts:\n${textBlock}` 
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);
    
    // Ensure we have a valid object with numeric values
    const keywordCounts: Record<string, number> = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof key === 'string' && (typeof value === 'number' || !isNaN(Number(value)))) {
        keywordCounts[key] = Number(value);
      }
    });
    
    // Limit to top 50 keywords by frequency
    const sortedKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    return sortedKeywords;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return {};
  }
}

// AI Content Theme Generation
export async function generateContentThemes(keywords: string[]): Promise<string[]> {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  const prompt = `Based on these trending keywords from competitor analysis, generate 5-7 specific content themes and post ideas that a marketing team should create this week. Focus on actionable, engaging content suggestions.

Keywords: ${keywords.join(', ')}

Return as a JSON array of content theme strings.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a creative social media strategist. Generate specific, actionable content themes based on keyword trends." 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '{"themes": []}';
    const parsed = JSON.parse(content);
    const themes = parsed.themes || parsed || [];
    
    return Array.isArray(themes) ? themes.slice(0, 7) : [];
  } catch (error) {
    console.error('Error generating content themes:', error);
    return [];
  }
}

// SmartInboxAI Functions
export async function classifyCustomerMessage(message: string): Promise<string> {
  if (!message || message.trim() === '') {
    return 'Unknown';
  }

  const prompt = `Classify this customer message into one of these categories: Question, Complaint, Urgent Issue, Positive Feedback, Product Inquiry, Support Request, Billing Issue, Feature Request, Bug Report, or General.

Message: "${message}"

Return only the classification category.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are a customer service classification expert. Analyze messages and categorize them accurately based on customer intent and urgency." 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const classification = response.choices[0].message.content?.trim() || 'General';
    return classification;
  } catch (error) {
    console.error('Error classifying customer message:', error);
    return 'General';
  }
}

export async function calculateUrgencyScore(message: string, classification: string): Promise<number> {
  if (!message || message.trim() === '') {
    return 0;
  }

  const prompt = `Rate the urgency of this customer message on a scale of 0-100, where:
- 0-25: Low urgency (general inquiries, positive feedback)
- 26-50: Medium urgency (product questions, feature requests)
- 51-75: High urgency (complaints, billing issues)
- 76-100: Critical urgency (urgent issues, angry customers, system problems)

Message: "${message}"
Classification: ${classification}

Return only the urgency score as a number.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert at assessing customer service urgency. Analyze messages and provide accurate urgency scores." 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      temperature: 0.2,
      max_tokens: 10,
    });

    const scoreText = response.choices[0].message.content?.trim() || '0';
    const score = parseInt(scoreText, 10);
    return Math.max(0, Math.min(100, isNaN(score) ? 0 : score));
  } catch (error) {
    console.error('Error calculating urgency score:', error);
    return 0;
  }
}

export async function suggestReply(message: string, classification: string): Promise<string[]> {
  if (!message || message.trim() === '') {
    return [];
  }

  const prompt = `Generate 2-3 professional, helpful reply suggestions for this customer message. Make them contextually appropriate for the classification type.

Message: "${message}"
Classification: ${classification}

Requirements:
- Be helpful and professional
- Address the customer's specific concern
- Vary the tone (formal, friendly, empathetic)
- Keep responses concise but complete

Return as a JSON array of reply strings.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a customer service expert. Generate professional, helpful reply suggestions that address customer concerns effectively." 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const content = response.choices[0].message.content || '{"replies": []}';
    const parsed = JSON.parse(content);
    const replies = parsed.replies || parsed || [];
    
    return Array.isArray(replies) ? replies.slice(0, 3) : [];
  } catch (error) {
    console.error('Error generating reply suggestions:', error);
    return [];
  }
}

// AgentAssistChat - Enterprise-grade GPT-powered reply suggestion
export async function generateSuggestedReply(messageText: string, customerName?: string, previousContext?: string): Promise<string> {
  if (!messageText || messageText.trim() === '') {
    return 'Thank you for reaching out. How can I assist you today?';
  }

  const contextPrompt = previousContext 
    ? `Previous conversation context: ${previousContext}\n\n`
    : '';

  const customerPrefix = customerName ? `Customer ${customerName}` : 'Customer';

  const prompt = `You are an expert customer service agent. Generate a single, professional, helpful response to this customer message.

${contextPrompt}${customerPrefix} says: "${messageText}"

Requirements:
- Be empathetic and understanding
- Address their specific concern directly
- Offer concrete help or next steps
- Use a friendly but professional tone
- Keep it concise (2-3 sentences max)
- If it's a complaint, acknowledge their frustration
- If it's a question, provide helpful guidance
- If it's urgent, show urgency in your response

Return only the suggested reply text, no quotes or formatting.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are an expert customer service representative with years of experience handling customer inquiries with empathy and professionalism." 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const suggestedReply = response.choices[0].message.content?.trim() || 'Thank you for reaching out. I\'ll help you resolve this right away.';
    return suggestedReply;
  } catch (error) {
    console.error('Error generating suggested reply:', error);
    return 'Thank you for your message. I\'ll look into this and get back to you shortly.';
  }
}
