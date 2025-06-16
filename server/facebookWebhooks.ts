/**
 * Facebook Webhooks Integration for SaCuRa AI
 * Real-time updates from Facebook Graph API
 */
import crypto from 'crypto';
import { storage } from './storage';
import { conversionsAPI } from './conversionsAPIService';

export interface FacebookWebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: any;
    }>;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text: string;
      };
      postback?: {
        title: string;
        payload: string;
      };
    }>;
    feeds?: Array<{
      item: string;
      verb: string;
      object_id: string;
      created_time: number;
    }>;
  }>;
}

export interface WebhookSubscription {
  id: string;
  pageId: string;
  subscriptions: string[];
  isActive: boolean;
  createdAt: Date;
  lastActivity?: Date;
}

export class FacebookWebhookService {
  private appSecret: string;
  private verifyToken: string;
  private pageAccessTokens: Map<string, string> = new Map();

  constructor() {
    this.appSecret = process.env.FACEBOOK_APP_SECRET || '';
    this.verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'sacura_ai_webhook_verify_2024';
    
    if (!this.appSecret) {
      console.warn('Facebook App Secret not configured for webhook verification');
    }
  }

  /**
   * Verify webhook signature for security
   */
  verifySignature(payload: string, signature: string): boolean {
    if (!this.appSecret || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.appSecret)
      .update(payload, 'utf8')
      .digest('hex');

    const signatureHash = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signatureHash, 'hex')
    );
  }

  /**
   * Handle webhook verification challenge
   */
  handleVerification(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('Facebook webhook verification successful');
      return challenge;
    }
    console.log('Facebook webhook verification failed');
    return null;
  }

  /**
   * Process incoming webhook events
   */
  async processWebhookEvent(event: FacebookWebhookEvent): Promise<void> {
    console.log('Processing Facebook webhook event:', event.object);

    for (const entry of event.entry) {
      await this.processEntry(entry, event.object);
    }
  }

  /**
   * Process individual webhook entry
   */
  private async processEntry(entry: any, objectType: string): Promise<void> {
    const pageId = entry.id;
    
    // Update last activity
    await this.updateSubscriptionActivity(pageId);

    switch (objectType) {
      case 'page':
        await this.handlePageEvents(entry);
        break;
      case 'user':
        await this.handleUserEvents(entry);
        break;
      case 'permissions':
        await this.handlePermissionEvents(entry);
        break;
      case 'application':
        await this.handleApplicationEvents(entry);
        break;
      default:
        console.log(`Unhandled webhook object type: ${objectType}`);
    }
  }

  /**
   * Handle page-related webhook events
   */
  private async handlePageEvents(entry: any): Promise<void> {
    const pageId = entry.id;

    // Handle messaging events (customer messages)
    if (entry.messaging) {
      for (const messageEvent of entry.messaging) {
        await this.handleCustomerMessage(pageId, messageEvent);
      }
    }

    // Handle feed changes (posts, comments, reactions)
    if (entry.changes) {
      for (const change of entry.changes) {
        await this.handlePageChange(pageId, change);
      }
    }

    // Handle feed events (new posts)
    if (entry.feeds) {
      for (const feedEvent of entry.feeds) {
        await this.handleFeedEvent(pageId, feedEvent);
      }
    }
  }

  /**
   * Handle customer messages from Facebook Messenger
   */
  private async handleCustomerMessage(pageId: string, messageEvent: any): Promise<void> {
    try {
      const senderId = messageEvent.sender.id;
      const timestamp = new Date(messageEvent.timestamp);

      // Store customer interaction
      if (messageEvent.message?.text) {
        const interaction = await storage.createCustomerInteraction({
          pageId,
          customerId: senderId,
          type: 'message',
          content: messageEvent.message.text,
          metadata: {
            messageId: messageEvent.message.mid,
            platform: 'facebook_messenger',
            timestamp: messageEvent.timestamp
          },
          createdAt: timestamp
        });

        // Track as conversion event
        await conversionsAPI.trackCustomEvent(
          {
            external_id: senderId,
            client_user_agent: 'Facebook Messenger'
          },
          'CustomerMessage',
          {
            content_name: 'Customer Message',
            content_category: 'Customer Service',
            value: 1
          }
        );

        console.log(`Customer message processed: ${interaction.id}`);
      }

      // Handle postbacks (button clicks)
      if (messageEvent.postback) {
        await storage.createCustomerInteraction({
          pageId,
          customerId: senderId,
          type: 'postback',
          content: messageEvent.postback.title,
          metadata: {
            payload: messageEvent.postback.payload,
            platform: 'facebook_messenger',
            timestamp: messageEvent.timestamp
          },
          createdAt: timestamp
        });

        // Track postback as conversion
        await conversionsAPI.trackCustomEvent(
          {
            external_id: senderId,
            client_user_agent: 'Facebook Messenger'
          },
          'CustomerInteraction',
          {
            content_name: messageEvent.postback.title,
            content_category: 'Button Click',
            value: 2
          }
        );
      }
    } catch (error) {
      console.error('Error handling customer message:', error);
    }
  }

  /**
   * Handle page changes (posts, comments, reactions)
   */
  private async handlePageChange(pageId: string, change: any): Promise<void> {
    try {
      console.log(`Page change detected: ${change.field}`, change.value);

      switch (change.field) {
        case 'feed':
          await this.handleFeedChange(pageId, change.value);
          break;
        case 'comments':
          await this.handleCommentChange(pageId, change.value);
          break;
        case 'reactions':
          await this.handleReactionChange(pageId, change.value);
          break;
        case 'ratings':
          await this.handleRatingChange(pageId, change.value);
          break;
        case 'live_videos':
          await this.handleLiveVideoChange(pageId, change.value);
          break;
        default:
          console.log(`Unhandled page change: ${change.field}`);
      }
    } catch (error) {
      console.error('Error handling page change:', error);
    }
  }

  /**
   * Handle feed changes (new posts, post updates)
   */
  private async handleFeedChange(pageId: string, feedData: any): Promise<void> {
    const { item, verb, post_id, created_time } = feedData;

    if (verb === 'add' && item === 'status') {
      // New post created
      console.log(`New post detected: ${post_id}`);
      
      // Track post creation as conversion
      await conversionsAPI.trackCustomEvent(
        {
          external_id: pageId,
          client_user_agent: 'Facebook Page'
        },
        'ContentPublished',
        {
          content_name: 'Facebook Post',
          content_category: 'Content Marketing',
          content_ids: [post_id],
          value: 5
        }
      );
    }
  }

  /**
   * Handle comment changes
   */
  private async handleCommentChange(pageId: string, commentData: any): Promise<void> {
    const { item, verb, comment_id, from, message, created_time } = commentData;

    if (verb === 'add') {
      // New comment received
      await storage.createCustomerInteraction({
        pageId,
        customerId: from?.id || 'unknown',
        type: 'comment',
        content: message,
        metadata: {
          commentId: comment_id,
          platform: 'facebook_page',
          parentId: item // post or parent comment ID
        },
        createdAt: new Date(created_time * 1000)
      });

      // Track comment as conversion
      await conversionsAPI.trackCustomEvent(
        {
          external_id: from?.id || pageId,
          client_user_agent: 'Facebook Page'
        },
        'CustomerComment',
        {
          content_name: 'Page Comment',
          content_category: 'Engagement',
          value: 3
        }
      );
    }
  }

  /**
   * Handle reaction changes (likes, loves, etc.)
   */
  private async handleReactionChange(pageId: string, reactionData: any): Promise<void> {
    const { item, verb, reaction_type, from } = reactionData;

    if (verb === 'add') {
      // Track reaction as conversion
      await conversionsAPI.trackCustomEvent(
        {
          external_id: from?.id || pageId,
          client_user_agent: 'Facebook Page'
        },
        'CustomerReaction',
        {
          content_name: `Page ${reaction_type}`,
          content_category: 'Engagement',
          value: 1
        }
      );
    }
  }

  /**
   * Handle rating changes
   */
  private async handleRatingChange(pageId: string, ratingData: any): Promise<void> {
    const { verb, rating, review_text, from, created_time } = ratingData;

    if (verb === 'add') {
      // Store review as customer interaction
      await storage.createCustomerInteraction({
        pageId,
        customerId: from?.id || 'unknown',
        type: 'review',
        content: review_text || '',
        metadata: {
          rating: rating,
          platform: 'facebook_page'
        },
        createdAt: new Date(created_time * 1000)
      });

      // Track review as high-value conversion
      await conversionsAPI.trackCustomEvent(
        {
          external_id: from?.id || pageId,
          client_user_agent: 'Facebook Page'
        },
        'CustomerReview',
        {
          content_name: `${rating}-Star Review`,
          content_category: 'Reviews',
          value: rating * 2 // Higher value for better ratings
        }
      );
    }
  }

  /**
   * Handle live video events
   */
  private async handleLiveVideoChange(pageId: string, videoData: any): Promise<void> {
    const { status, video_id } = videoData;

    // Track live video events as conversions
    await conversionsAPI.trackCustomEvent(
      {
        external_id: pageId,
        client_user_agent: 'Facebook Page'
      },
      'LiveVideo',
      {
        content_name: `Live Video ${status}`,
        content_category: 'Live Content',
        content_ids: [video_id],
        value: 10
      }
    );
  }

  /**
   * Handle user events
   */
  private async handleUserEvents(entry: any): Promise<void> {
    console.log('User event received:', entry);
    // Handle user-level events if needed
  }

  /**
   * Handle permission events
   */
  private async handlePermissionEvents(entry: any): Promise<void> {
    console.log('Permission event received:', entry);
    // Handle permission changes
  }

  /**
   * Handle application events
   */
  private async handleApplicationEvents(entry: any): Promise<void> {
    console.log('Application event received:', entry);
    // Handle app-level events
  }

  /**
   * Update subscription activity timestamp
   */
  private async updateSubscriptionActivity(pageId: string): Promise<void> {
    try {
      // Update the last activity timestamp for this page's webhook subscription
      // This would be implemented based on your storage schema
      console.log(`Updated webhook activity for page: ${pageId}`);
    } catch (error) {
      console.error('Error updating subscription activity:', error);
    }
  }

  /**
   * Subscribe to Facebook webhooks for a page
   */
  async subscribeToWebhooks(pageId: string, accessToken: string, fields: string[]): Promise<boolean> {
    try {
      const subscribeUrl = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps`;
      
      const response = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscribed_fields: fields.join(','),
          access_token: accessToken
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Successfully subscribed to webhooks for page: ${pageId}`);
        this.pageAccessTokens.set(pageId, accessToken);
        return true;
      } else {
        console.error('Failed to subscribe to webhooks:', result);
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to webhooks:', error);
      return false;
    }
  }

  /**
   * Get webhook subscription status
   */
  async getSubscriptionStatus(pageId: string, accessToken: string): Promise<any> {
    try {
      const statusUrl = `https://graph.facebook.com/v19.0/${pageId}/subscribed_apps?access_token=${accessToken}`;
      
      const response = await fetch(statusUrl);
      const result = await response.json();
      
      return result.data || [];
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return [];
    }
  }
}

export const facebookWebhooks = new FacebookWebhookService();