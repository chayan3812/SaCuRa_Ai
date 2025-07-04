import cron from 'node-cron';
import { storage } from './storage';
import { generateFacebookPost, checkPolicyCompliance } from './openai';
import { FacebookAPIService } from './facebook';
import { websocketService } from './websocket';

interface SchedulerConfig {
  enabled: boolean;
  checkInterval: string; // cron expression
  maxRetries: number;
  retryDelay: number; // minutes
}

export class ContentScheduler {
  private isRunning: boolean = false;
  private schedulerTask: any = null;
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig = {
    enabled: true,
    checkInterval: '*/5 * * * *', // Every 5 minutes
    maxRetries: 3,
    retryDelay: 30
  }) {
    this.config = config;
  }

  public start(): void {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    console.log('Starting Content Scheduler...');
    this.isRunning = true;

    this.schedulerTask = cron.schedule(this.config.checkInterval, async () => {
      await this.processScheduledContent();
    });

    this.schedulerTask.start();
    console.log(`Content Scheduler started with interval: ${this.config.checkInterval}`);
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping Content Scheduler...');
    this.isRunning = false;

    if (this.schedulerTask) {
      this.schedulerTask.stop();
      this.schedulerTask = null;
    }

    console.log('Content Scheduler stopped');
  }

  public getStatus(): { isRunning: boolean; config: SchedulerConfig; lastRun?: Date } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastRun: new Date() // Would track actual last run in production
    };
  }

  // 👁️ Enhanced by AI on 2025-06-15 — Feature: ContentScheduler
  private async processScheduledContent(): Promise<void> {
    try {
      console.log('Processing scheduled content...');
      
      // Get all posts due for publishing
      const duePosts = await storage.getPostsDueForPublishing();
      
      if (duePosts.length === 0) {
        console.log('Found 0 posts due for publishing');
        return;
      }

      console.log(`Found ${duePosts.length} posts due for publishing`);
      
      for (const post of duePosts) {
        await this.publishPost(post);
        // Add delay between posts to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error processing scheduled content:', error);
      websocketService.broadcast('scheduler-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  // 👁️ Enhanced by AI on 2025-06-15 — Feature: ContentScheduler
  private async publishPost(post: any): Promise<void> {
    try {
      // Get the Facebook page details for this post
      const page = await storage.getFacebookPageById(post.pageId);
      
      if (!page || !page.accessToken) {
        console.warn(`No access token for page ${post.pageId}, skipping post ${post.id}`);
        return;
      }

      console.log(`Publishing post "${post.title}" to page ${page.pageName || 'Unknown Page'}`);
      
      // Publish to Facebook
      const api = new FacebookAPIService('demo_token_123'); // Initialize with token
      const result = await api.publishToPage(page.pageId, post.content, page.accessToken);
      
      // Mark as published in database
      await storage.markPostAsPublished(post.id, result.id);
      
      console.log(`Successfully published post ${post.id} to Facebook (${result.id})`);
      
      // Emit real-time notification
      websocketService.broadcast('post-published', {
        type: 'success',
        title: 'Post Published Successfully',
        message: `Published "${post.title}" to ${page.pageName || 'Facebook Page'}`,
        facebookPostId: result.id
      });
      
    } catch (error) {
      console.error(`Failed to publish post ${post.id}:`, error);
      
      // Emit error notification
      websocketService.broadcast('post-publish-failed', {
        type: 'error',
        title: 'Post Publishing Failed',
        message: `Failed to publish "${post.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async processPost(post: any): Promise<void> {
    try {
      console.log(`Processing post: ${post.id} - ${post.title}`);

      // Update post status to "publishing"
      await storage.updatePostStatus(post.id, "publishing");

      // Get the Facebook page details
      const page = await storage.getFacebookPageById(post.pageId);
      if (!page) {
        throw new Error(`Facebook page not found: ${post.pageId}`);
      }

      // Check policy compliance before posting
      const complianceCheck = await checkPolicyCompliance(
        post.content,
        JSON.stringify(post.targetAudience || {}),
        "general"
      );

      if (!complianceCheck.isCompliant && complianceCheck.riskLevel === 'critical') {
        await this.handlePolicyViolation(post, complianceCheck);
        return;
      }

      // Publish the post
      const result = await this.publishToFacebook(post, page);

      if (result.success) {
        await storage.updatePostStatus(
          post.id, 
          "published", 
          new Date(),
          result.reach,
          result.engagement
        );

        // Send real-time notification
        websocketService?.sendAlert(post.userId, {
          type: "success",
          title: "Post Published",
          message: `"${post.title}" has been successfully published to ${page.pageName || 'Facebook Page'}`
        });

        console.log(`Successfully published post: ${post.id}`);
      } else {
        throw new Error(result.error || "Failed to publish post");
      }

    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error);
      await this.handlePostError(post, error as Error);
    }
  }

  private async publishToFacebook(post: any, page: any): Promise<{
    success: boolean;
    reach?: number;
    engagement?: any;
    error?: string;
  }> {
    try {
      const facebookAPI = new FacebookAPIService(page.accessToken);
      
      // In a real implementation, this would use Facebook Graph API
      // For now, simulating successful post
      const postResult = {
        id: `post_${Date.now()}`,
        created_time: new Date().toISOString(),
      };

      // Simulate engagement metrics
      const simulatedMetrics = {
        reach: Math.floor(Math.random() * 1000) + 100,
        engagement: {
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 10),
          shares: Math.floor(Math.random() * 5)
        }
      };

      return {
        success: true,
        reach: simulatedMetrics.reach,
        engagement: simulatedMetrics.engagement
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async handlePolicyViolation(post: any, complianceCheck: any): Promise<void> {
    console.log(`Policy violation detected for post ${post.id}`);

    await storage.updatePostStatus(
      post.id, 
      "failed", 
      undefined, 
      undefined, 
      undefined
    );

    // Send policy violation alert
    websocketService?.sendAlert(post.userId, {
      type: "error",
      title: "Policy Violation Detected",
      message: `Post "${post.title}" violates Facebook policies and was not published`,
      data: { 
        postId: post.id, 
        violations: complianceCheck.violations,
        suggestions: complianceCheck.suggestions
      }
    });
  }

  private async handlePostError(post: any, error: Error): Promise<void> {
    const currentRetries = post.retryCount || 0;

    if (currentRetries < this.config.maxRetries) {
      // Schedule retry
      const retryTime = new Date();
      retryTime.setMinutes(retryTime.getMinutes() + this.config.retryDelay);

      await storage.updatePostStatus(post.id, "scheduled");
      console.log(`Scheduled retry for post ${post.id} at ${retryTime}`);

    } else {
      // Mark as failed
      await storage.updatePostStatus(
        post.id, 
        "failed", 
        undefined, 
        undefined, 
        undefined
      );

      // Send failure notification
      websocketService?.sendAlert(post.userId, {
        type: "error",
        title: "Post Publishing Failed",
        message: `Failed to publish "${post.title}" after ${this.config.maxRetries} attempts`,
        data: { postId: post.id, error: error.message }
      });
    }
  }

  private async processAutoGeneratedContent(): Promise<void> {
    try {
      // Get active schedules that auto-generate content
      const activeSchedules = await storage.getActiveSchedules();
      const autoGenSchedules = activeSchedules.filter(schedule => schedule.autoGenerate);

      for (const schedule of autoGenSchedules) {
        await this.generateContentForSchedule(schedule);
      }

    } catch (error) {
      console.error('Error processing auto-generated content:', error);
    }
  }

  private async generateContentForSchedule(schedule: any): Promise<void> {
    try {
      // Check if we need to generate content for upcoming time slots
      const now = new Date();
      const nextSlots = this.getUpcomingTimeSlots(schedule, now);

      for (const slot of nextSlots) {
        // Check if content already exists for this slot
        const existingPosts = await storage.getContentQueueByPage(schedule.pageId);
        const hasContentForSlot = existingPosts.some(post => 
          Math.abs(new Date(post.scheduledFor).getTime() - slot.getTime()) < 60000 // Within 1 minute
        );

        if (!hasContentForSlot) {
          await this.generateAndScheduleContent(schedule, slot);
        }
      }

    } catch (error) {
      console.error(`Error generating content for schedule ${schedule.id}:`, error);
    }
  }

  private getUpcomingTimeSlots(schedule: any, now: Date): Date[] {
    const slots: Date[] = [];
    const timeSlots = schedule.timeSlots || [];

    // Look ahead for the next 24 hours
    const lookAhead = new Date(now);
    lookAhead.setHours(lookAhead.getHours() + 24);

    for (const slot of timeSlots) {
      const slotTime = new Date(now);
      slotTime.setHours(slot.hour, slot.minute, 0, 0);

      // If slot time has passed today, schedule for tomorrow
      if (slotTime <= now) {
        slotTime.setDate(slotTime.getDate() + 1);
      }

      // Only include slots within our look-ahead window
      if (slotTime <= lookAhead) {
        slots.push(slotTime);
      }
    }

    return slots;
  }

  private async generateAndScheduleContent(schedule: any, scheduledTime: Date): Promise<void> {
    try {
      console.log(`Generating content for schedule ${schedule.name} at ${scheduledTime}`);

      // Get the page for context
      const page = await storage.getFacebookPageById(schedule.pageId);
      if (!page) {
        throw new Error(`Page not found: ${schedule.pageId}`);
      }

      // Generate content based on schedule type
      const topic = this.getTopicForContentType(schedule.contentType);
      const generatedPost = await generateFacebookPost(
        topic,
        `Business page: ${page.name}`,
        schedule.contentType
      );

      // Create the scheduled post
      const postData = {
        userId: schedule.userId,
        pageId: schedule.pageId,
        title: `Auto-generated: ${schedule.contentType}`,
        content: generatedPost.content,
        hashtags: generatedPost.hashtags,
        scheduledFor: scheduledTime,
        postType: 'text' as const,
        seoScore: generatedPost.seoScore,
        estimatedReach: generatedPost.estimatedReach,
        status: 'scheduled' as const
      };

      await storage.createContentPost(postData);

      console.log(`Auto-generated content scheduled for ${scheduledTime}`);

    } catch (error) {
      console.error('Error generating and scheduling content:', error);
    }
  }

  private getTopicForContentType(contentType: string): string {
    const topics = {
      promotional: "Special offer or product highlight",
      educational: "Industry tips and best practices",
      engagement: "Question to engage community",
      mixed: "Business update or company news"
    };

    return topics[contentType as keyof typeof topics] || topics.mixed;
  }
}

// Global scheduler instance
let contentScheduler: ContentScheduler;

export function initializeContentScheduler(config?: Partial<SchedulerConfig>): void {
  if (contentScheduler) {
    contentScheduler.stop();
  }

  contentScheduler = new ContentScheduler(config as SchedulerConfig);
  contentScheduler.start();
}

export function getContentScheduler(): ContentScheduler {
  if (!contentScheduler) {
    throw new Error('Content scheduler not initialized');
  }
  return contentScheduler;
}

export function stopContentScheduler(): void {
  if (contentScheduler) {
    contentScheduler.stop();
  }
}