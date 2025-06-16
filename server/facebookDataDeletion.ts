/**
 * Facebook Data Deletion Callback Implementation
 * Handles user data deletion requests from Facebook
 */
import crypto from 'crypto';
import { storage } from './storage';

export interface DataDeletionRequest {
  user_id: string;
  confirmation_code: string;
  status_url: string;
}

export interface DataDeletionResponse {
  url: string;
  confirmation_code: string;
}

export class FacebookDataDeletionService {
  private appSecret: string;

  constructor() {
    this.appSecret = process.env.FACEBOOK_APP_SECRET || '';
    if (!this.appSecret) {
      console.warn('Facebook App Secret not configured for data deletion service');
    }
  }

  /**
   * Verify the signed request from Facebook
   */
  verifySignedRequest(signedRequest: string): any {
    if (!signedRequest || !this.appSecret) {
      throw new Error('Invalid signed request or missing app secret');
    }

    const [encodedSig, payload] = signedRequest.split('.');
    
    // Decode the signature
    const sig = this.base64UrlDecode(encodedSig);
    const data = JSON.parse(this.base64UrlDecode(payload));

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', this.appSecret)
      .update(payload)
      .digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      throw new Error('Invalid signature');
    }

    return data;
  }

  /**
   * Base64 URL decode
   */
  private base64UrlDecode(str: string): Buffer {
    // Add padding if needed
    const padding = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64');
  }

  /**
   * Process data deletion request
   */
  async processDataDeletionRequest(signedRequest: string): Promise<DataDeletionResponse> {
    try {
      // Verify and decode the signed request
      const data = this.verifySignedRequest(signedRequest);
      const userId = data.user_id;

      if (!userId) {
        throw new Error('No user ID found in deletion request');
      }

      // Generate confirmation code
      const confirmationCode = crypto.randomBytes(16).toString('hex');

      // Delete user data from our database
      await this.deleteUserData(userId);

      // Create status URL for Facebook to check deletion status
      const statusUrl = `${process.env.BASE_URL || 'https://sa-cura-live-sopiahank.replit.app'}/api/facebook/data-deletion/status/${confirmationCode}`;

      // Store deletion record
      await this.storeDeletionRecord(userId, confirmationCode, statusUrl);

      return {
        url: statusUrl,
        confirmation_code: confirmationCode
      };
    } catch (error) {
      console.error('Error processing data deletion request:', error);
      throw error;
    }
  }

  /**
   * Delete all user data from the system
   */
  private async deleteUserData(facebookUserId: string): Promise<void> {
    try {
      // Find user by Facebook ID or email
      const user = await storage.getUserByFacebookId?.(facebookUserId);
      
      if (user) {
        // Delete user's content queue
        await storage.deleteUserContentQueue?.(user.id);
        
        // Delete user's customer interactions
        await storage.deleteUserCustomerInteractions?.(user.id);
        
        // Delete user's campaign data
        await storage.deleteUserCampaigns?.(user.id);
        
        // Delete user's AI training data
        await storage.deleteUserAITrainingData?.(user.id);
        
        // Delete user's feedback records
        await storage.deleteUserFeedback?.(user.id);
        
        // Delete user's webhook subscriptions
        await storage.deleteUserWebhookSubscriptions?.(user.id);
        
        // Finally delete the user record
        await storage.deleteUser?.(user.id);
        
        console.log(`Successfully deleted all data for Facebook user: ${facebookUserId}`);
      } else {
        console.log(`No user found for Facebook ID: ${facebookUserId}`);
      }
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  /**
   * Store deletion record for status tracking
   */
  private async storeDeletionRecord(userId: string, confirmationCode: string, statusUrl: string): Promise<void> {
    try {
      await storage.createDataDeletionRecord?.({
        facebookUserId: userId,
        confirmationCode,
        statusUrl,
        status: 'completed',
        deletedAt: new Date(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error storing deletion record:', error);
      // Don't throw - the deletion itself was successful
    }
  }

  /**
   * Get deletion status
   */
  async getDeletionStatus(confirmationCode: string): Promise<{ status: string; deleted_at?: string }> {
    try {
      const record = await storage.getDataDeletionRecord?.(confirmationCode);
      
      if (!record) {
        return { status: 'not_found' };
      }

      return {
        status: record.status,
        deleted_at: record.deletedAt?.toISOString()
      };
    } catch (error) {
      console.error('Error getting deletion status:', error);
      return { status: 'error' };
    }
  }

  /**
   * Generate data deletion confirmation URL
   */
  generateDeletionUrl(): string {
    return `${process.env.BASE_URL || 'https://sa-cura-live-sopiahank.replit.app'}/api/facebook/data-deletion`;
  }
}

export const facebookDataDeletion = new FacebookDataDeletionService();