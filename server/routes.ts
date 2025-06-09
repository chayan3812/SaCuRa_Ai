import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  FacebookAPIService, 
  getFacebookOAuthUrl, 
  exchangeCodeForToken, 
  getLongLivedToken 
} from "./facebook";
import { 
  generateCustomerServiceResponse,
  generateAdOptimizationSuggestions,
  checkPolicyCompliance,
  generateAdCopy,
  analyzeSentiment
} from "./openai";
import { initializeWebSocket } from "./websocket";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Facebook OAuth routes
  app.get('/api/facebook/auth', isAuthenticated, (req: any, res) => {
    const clientId = process.env.FACEBOOK_APP_ID;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/facebook/callback`;
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_messaging',
      'business_management',
      'ads_read',
      'ads_management'
    ];

    if (!clientId) {
      return res.status(500).json({ message: 'Facebook App ID not configured' });
    }

    const authUrl = getFacebookOAuthUrl(clientId, redirectUri, scopes);
    res.redirect(authUrl);
  });

  app.get('/api/facebook/callback', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.query;
      const clientId = process.env.FACEBOOK_APP_ID;
      const clientSecret = process.env.FACEBOOK_APP_SECRET;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/facebook/callback`;

      if (!code || !clientId || !clientSecret) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }

      // Exchange code for access token
      const tokenData = await exchangeCodeForToken(clientId, clientSecret, redirectUri, code);
      
      // Get long-lived token
      const longLivedToken = await getLongLivedToken(clientId, clientSecret, tokenData.access_token);

      // Get user's pages and store them
      const fbService = new FacebookAPIService(longLivedToken.access_token);
      const pages = await fbService.getUserPages();
      const userId = req.user.claims.sub;

      for (const page of pages) {
        await storage.createFacebookPage({
          userId,
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
          category: page.category,
          followerCount: page.follower_count || 0
        });
      }

      res.redirect('/?connected=true');
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      res.status(500).json({ message: 'Failed to connect Facebook account' });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await storage.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
    }
  });

  app.get('/api/dashboard/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pages = await storage.getFacebookPagesByUser(userId);
      res.json(pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ message: 'Failed to fetch Facebook pages' });
    }
  });

  app.get('/api/dashboard/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getAIRecommendationsByUser(userId);
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch AI recommendations' });
    }
  });

  // Customer service routes
  app.get('/api/customer-service/interactions/:pageId', isAuthenticated, async (req, res) => {
    try {
      const { pageId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const interactions = await storage.getCustomerInteractionsByPage(pageId, limit);
      res.json(interactions);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      res.status(500).json({ message: 'Failed to fetch customer interactions' });
    }
  });

  app.post('/api/customer-service/respond', isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        interactionId: z.string(),
        response: z.string(),
        responseTime: z.number().optional()
      });

      const { interactionId, response, responseTime } = schema.parse(req.body);
      const employeeId = req.user.claims.sub;

      await storage.updateCustomerInteractionResponse(
        interactionId,
        response,
        employeeId,
        responseTime || 0
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error saving response:', error);
      res.status(500).json({ message: 'Failed to save response' });
    }
  });

  app.post('/api/customer-service/ai-response', isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        message: z.string(),
        history: z.array(z.string()).optional(),
        businessContext: z.string().optional()
      });

      const { message, history = [], businessContext = 'business' } = schema.parse(req.body);

      const aiResponse = await generateCustomerServiceResponse(message, history, businessContext);
      res.json(aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      res.status(500).json({ message: 'Failed to generate AI response' });
    }
  });

  // Employee management routes
  app.get('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employees = await storage.getEmployeesByUser(userId);
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.string(),
        profileImageUrl: z.string().optional()
      });

      const employeeData = schema.parse(req.body);
      const userId = req.user.claims.sub;

      const employee = await storage.createEmployee({
        ...employeeData,
        userId
      });

      res.json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ message: 'Failed to create employee' });
    }
  });

  // Ad optimization routes
  app.post('/api/ads/optimize', isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        adData: z.object({
          spend: z.number(),
          impressions: z.number(),
          clicks: z.number(),
          conversions: z.number(),
          ctr: z.number(),
          cpm: z.number(),
          cpc: z.number()
        }),
        campaignObjective: z.string(),
        targetAudience: z.string()
      });

      const { adData, campaignObjective, targetAudience } = schema.parse(req.body);

      const suggestions = await generateAdOptimizationSuggestions(
        adData,
        campaignObjective,
        targetAudience
      );

      res.json(suggestions);
    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
      res.status(500).json({ message: 'Failed to generate optimization suggestions' });
    }
  });

  app.post('/api/ads/check-compliance', isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        adContent: z.string(),
        targetAudience: z.string(),
        productCategory: z.string()
      });

      const { adContent, targetAudience, productCategory } = schema.parse(req.body);

      const complianceCheck = await checkPolicyCompliance(
        adContent,
        targetAudience,
        productCategory
      );

      res.json(complianceCheck);
    } catch (error) {
      console.error('Error checking compliance:', error);
      res.status(500).json({ message: 'Failed to check policy compliance' });
    }
  });

  app.post('/api/ads/generate-copy', isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        productDescription: z.string(),
        targetAudience: z.string(),
        campaignObjective: z.string(),
        tone: z.string().optional()
      });

      const { productDescription, targetAudience, campaignObjective, tone } = schema.parse(req.body);

      const adCopy = await generateAdCopy(
        productDescription,
        targetAudience,
        campaignObjective,
        tone
      );

      res.json(adCopy);
    } catch (error) {
      console.error('Error generating ad copy:', error);
      res.status(500).json({ message: 'Failed to generate ad copy' });
    }
  });

  // Restriction monitoring routes
  app.get('/api/restrictions/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getRestrictionAlertsByUser(userId);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching restriction alerts:', error);
      res.status(500).json({ message: 'Failed to fetch restriction alerts' });
    }
  });

  app.post('/api/restrictions/resolve/:alertId', isAuthenticated, async (req, res) => {
    try {
      const { alertId } = req.params;
      await storage.markRestrictionAlertResolved(alertId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({ message: 'Failed to resolve alert' });
    }
  });

  // AI analysis routes
  app.post('/api/ai/analyze-sentiment', isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        text: z.string()
      });

      const { text } = schema.parse(req.body);
      const sentiment = await analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      res.status(500).json({ message: 'Failed to analyze sentiment' });
    }
  });

  // AI Content Generation Routes
  app.post("/api/ai/generate-post", isAuthenticated, async (req, res) => {
    try {
      const { topic, audience, postType } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const { generateFacebookPost } = await import("./openai");
      const generatedPost = await generateFacebookPost(topic, audience || "", postType || "promotional");
      
      res.json(generatedPost);
    } catch (error) {
      console.error("Error generating post:", error);
      res.status(500).json({ message: "Failed to generate post content" });
    }
  });

  app.post("/api/ai/analyze-post", isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const { analyzePostContent } = await import("./openai");
      const analysis = await analyzePostContent(content);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing post:", error);
      res.status(500).json({ message: "Failed to analyze post content" });
    }
  });

  // Facebook Publishing Routes
  app.post("/api/facebook/publish-post", isAuthenticated, async (req, res) => {
    try {
      const { pageId, content, scheduledTime } = req.body;
      const userId = (req.user as any)?.claims?.sub;
      
      if (!pageId || !content) {
        return res.status(400).json({ message: "Page ID and content are required" });
      }

      // Get the Facebook page details
      const page = await storage.getFacebookPageById(pageId);
      if (!page || page.userId !== userId) {
        return res.status(404).json({ message: "Facebook page not found" });
      }

      // In a real implementation, this would use Facebook Graph API
      // For now, we'll simulate a successful post
      const postResult = {
        id: `post_${Date.now()}`,
        message: "Post published successfully",
        created_time: new Date().toISOString(),
        link: `https://facebook.com/${page.pageId}/posts/12345`
      };
      
      res.json(postResult);
    } catch (error) {
      console.error("Error publishing post:", error);
      res.status(500).json({ message: "Failed to publish post" });
    }
  });

  // Webhook route for Facebook messages
  app.get('/api/facebook/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'sacura_webhook_token';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Facebook webhook verified');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  });

  app.post('/api/facebook/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
      body.entry.forEach((entry: any) => {
        const webhookEvent = entry.messaging[0];
        console.log('Received webhook event:', webhookEvent);

        // Handle incoming messages here
        // This would trigger the real-time customer service flow
      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket service
  initializeWebSocket(httpServer);

  return httpServer;
}
