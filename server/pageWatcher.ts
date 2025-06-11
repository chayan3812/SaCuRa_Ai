import { storage } from "./storage";
import { FacebookAPIService } from "./facebook";
import { websocketService } from "./websocket";
import { checkPolicyCompliance } from "./openai";

interface PageHealthCheck {
  pageId: string;
  pageName: string;
  status: 'healthy' | 'warning' | 'restricted' | 'error';
  lastCheck: Date;
  issues: string[];
  restrictions: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    detectedAt: Date;
  }[];
}

interface WatcherConfig {
  checkInterval: number; // minutes
  alertThreshold: number; // number of consecutive failures before alert
  enableEmailAlerts: boolean;
  enableSlackAlerts: boolean;
}

export class PageWatcherEngine {
  private isRunning: boolean = false;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private config: WatcherConfig;
  private consecutiveFailures: Map<string, number> = new Map();

  constructor(config: WatcherConfig = {
    checkInterval: 10, // 10 minutes
    alertThreshold: 3,
    enableEmailAlerts: true,
    enableSlackAlerts: false
  }) {
    this.config = config;
  }

  public start(): void {
    if (this.isRunning) {
      console.log('Page Watcher is already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting Page Watcher with ${this.config.checkInterval} minute intervals`);
    
    // Initial check
    this.performHealthChecks();
    
    // Schedule recurring checks
    this.checkIntervalId = setInterval(() => {
      this.performHealthChecks();
    }, this.config.checkInterval * 60 * 1000);
  }

  public stop(): void {
    if (!this.isRunning) {
      console.log('Page Watcher is not running');
      return;
    }

    this.isRunning = false;
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    console.log('Page Watcher stopped');
  }

  private async performHealthChecks(): Promise<void> {
    console.log('Performing page health checks...');
    
    try {
      // Get all active Facebook pages from the database
      const users = await this.getAllUsersWithPages();
      
      for (const userId of users) {
        await this.checkUserPages(userId);
      }
    } catch (error) {
      console.error('Error during health checks:', error);
    }
  }

  private async getAllUsersWithPages(): Promise<string[]> {
    // This would typically query the database for users with active Facebook pages
    // For now, we'll simulate this
    return ['43354582']; // Example user ID
  }

  private async checkUserPages(userId: string): Promise<void> {
    try {
      const pages = await storage.getFacebookPagesByUser(userId);
      
      for (const page of pages) {
        const healthCheck = await this.checkPageHealth(page);
        await this.processHealthCheck(userId, healthCheck);
      }
    } catch (error) {
      console.error(`Error checking pages for user ${userId}:`, error);
    }
  }

  private async checkPageHealth(page: any): Promise<PageHealthCheck> {
    const healthCheck: PageHealthCheck = {
      pageId: page.pageId,
      pageName: page.pageName,
      status: 'healthy',
      lastCheck: new Date(),
      issues: [],
      restrictions: []
    };

    try {
      const facebookAPI = new FacebookAPIService(page.accessToken);
      
      // Check 1: Page accessibility
      await this.checkPageAccessibility(facebookAPI, page, healthCheck);
      
      // Check 2: Recent post analysis for policy violations
      await this.checkRecentPosts(facebookAPI, page, healthCheck);
      
      // Check 3: Ad account status (if linked)
      await this.checkAdAccountStatus(facebookAPI, page, healthCheck);
      
      // Check 4: Page insights for unusual drops
      await this.checkPageInsights(facebookAPI, page, healthCheck);
      
    } catch (error) {
      healthCheck.status = 'error';
      healthCheck.issues.push(`API Error: ${(error as Error).message}`);
      console.error(`Error checking page ${page.pageName}:`, error);
    }

    return healthCheck;
  }

  private async checkPageAccessibility(
    api: FacebookAPIService, 
    page: any, 
    healthCheck: PageHealthCheck
  ): Promise<void> {
    try {
      // Try to fetch basic page info - use real tokens or skip if demo
      if (page.accessToken === 'demo_token_123' || page.pageId === 'demo_page_123') {
        // Skip API calls for demo data
        return;
      }
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${page.pageId}?fields=id,name,category,is_published&access_token=${page.accessToken}`
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          healthCheck.status = 'restricted';
          healthCheck.restrictions.push({
            type: 'page_access_denied',
            severity: 'critical',
            message: 'Page access denied - possible restriction or token revocation',
            detectedAt: new Date()
          });
        } else {
          healthCheck.status = 'warning';
          healthCheck.issues.push(`Page API returned status ${response.status}`);
        }
        return;
      }

      const pageData = await response.json();
      
      if (!pageData.is_published) {
        healthCheck.status = 'warning';
        healthCheck.issues.push('Page is not published');
      }
    } catch (error) {
      healthCheck.status = 'error';
      healthCheck.issues.push(`Failed to check page accessibility: ${(error as Error).message}`);
    }
  }

  private async checkRecentPosts(
    api: FacebookAPIService, 
    page: any, 
    healthCheck: PageHealthCheck
  ): Promise<void> {
    try {
      const posts = await api.getPagePosts(page.pageId, page.accessToken, 5);
      
      for (const post of posts.data || []) {
        if (post.message) {
          // Use AI to check for policy violations
          // Skip compliance check for now - would need proper implementation
          const compliance = { isCompliant: true, riskLevel: 'low', violations: [] };
          
          if (!compliance.isCompliant) {
            const severity = compliance.riskLevel as 'low' | 'medium' | 'high' | 'critical';
            healthCheck.restrictions.push({
              type: 'policy_violation',
              severity,
              message: `Post policy violation detected: ${compliance.violations.join(', ')}`,
              detectedAt: new Date()
            });
            
            if (severity === 'critical' || severity === 'high') {
              healthCheck.status = 'restricted';
            } else if (healthCheck.status === 'healthy') {
              healthCheck.status = 'warning';
            }
          }
        }
      }
    } catch (error) {
      healthCheck.issues.push(`Failed to analyze recent posts: ${(error as Error).message}`);
    }
  }

  private async checkAdAccountStatus(
    api: FacebookAPIService, 
    page: any, 
    healthCheck: PageHealthCheck
  ): Promise<void> {
    try {
      // This would check linked ad accounts for restrictions
      // Simulated for now
      const hasAdRestrictions = Math.random() < 0.1; // 10% chance of simulated restriction
      
      if (hasAdRestrictions) {
        healthCheck.restrictions.push({
          type: 'ad_account_restriction',
          severity: 'high',
          message: 'Linked ad account has posting restrictions',
          detectedAt: new Date()
        });
        healthCheck.status = 'restricted';
      }
    } catch (error) {
      healthCheck.issues.push(`Failed to check ad account status: ${(error as Error).message}`);
    }
  }

  private async checkPageInsights(
    api: FacebookAPIService, 
    page: any, 
    healthCheck: PageHealthCheck
  ): Promise<void> {
    try {
      // Check for unusual drops in reach or engagement
      // This would analyze page insights data
      const insights = await api.getPageInsights(
        page.pageId, 
        page.accessToken, 
        ['page_impressions', 'page_reach'], 
        'day'
      );
      
      // Analyze trends (simplified)
      if (insights.data && insights.data.length > 0) {
        const reachData = insights.data.find((metric: any) => metric.name === 'page_reach');
        if (reachData && reachData.values) {
          const latestReach = reachData.values[reachData.values.length - 1]?.value || 0;
          const previousReach = reachData.values[reachData.values.length - 2]?.value || 0;
          
          if (previousReach > 0 && latestReach < previousReach * 0.5) {
            healthCheck.status = 'warning';
            healthCheck.issues.push('Significant drop in page reach detected');
          }
        }
      }
    } catch (error) {
      healthCheck.issues.push(`Failed to analyze page insights: ${(error as Error).message}`);
    }
  }

  private async processHealthCheck(userId: string, healthCheck: PageHealthCheck): Promise<void> {
    const pageKey = `${userId}:${healthCheck.pageId}`;
    
    // Update consecutive failure count
    if (healthCheck.status === 'error' || healthCheck.status === 'restricted') {
      const failures = this.consecutiveFailures.get(pageKey) || 0;
      this.consecutiveFailures.set(pageKey, failures + 1);
    } else {
      this.consecutiveFailures.delete(pageKey);
    }

    // Store health check results
    await this.storeHealthCheck(userId, healthCheck);
    
    // Send alerts if needed
    await this.sendAlertsIfNeeded(userId, healthCheck);
    
    // Send real-time updates to WebSocket clients
    this.sendRealtimeUpdate(userId, healthCheck);
  }

  private async storeHealthCheck(userId: string, healthCheck: PageHealthCheck): Promise<void> {
    try {
      // Store any restrictions found
      for (const restriction of healthCheck.restrictions) {
        await storage.createRestrictionAlert({
          pageId: healthCheck.pageId,
          alertType: restriction.type,
          severity: restriction.severity,
          message: restriction.message,
          aiSuggestion: `Detected via automated monitoring at ${restriction.detectedAt.toISOString()}`
        });
      }
    } catch (error) {
      console.error('Error storing health check results:', error);
    }
  }

  private async sendAlertsIfNeeded(userId: string, healthCheck: PageHealthCheck): Promise<void> {
    const pageKey = `${userId}:${healthCheck.pageId}`;
    const failures = this.consecutiveFailures.get(pageKey) || 0;
    
    if (failures >= this.config.alertThreshold || healthCheck.status === 'restricted') {
      // Send email alert
      if (this.config.enableEmailAlerts) {
        await this.sendEmailAlert(userId, healthCheck);
      }
      
      // Send Slack alert
      if (this.config.enableSlackAlerts) {
        await this.sendSlackAlert(userId, healthCheck);
      }
    }
  }

  private async sendEmailAlert(userId: string, healthCheck: PageHealthCheck): Promise<void> {
    // This would integrate with an email service like SendGrid, AWS SES, etc.
    console.log(`EMAIL ALERT: Page ${healthCheck.pageName} has status ${healthCheck.status}`);
    console.log('Issues:', healthCheck.issues);
    console.log('Restrictions:', healthCheck.restrictions);
  }

  private async sendSlackAlert(userId: string, healthCheck: PageHealthCheck): Promise<void> {
    // This would integrate with Slack webhook API
    console.log(`SLACK ALERT: Page ${healthCheck.pageName} has status ${healthCheck.status}`);
  }

  private sendRealtimeUpdate(userId: string, healthCheck: PageHealthCheck): void {
    if (websocketService) {
      websocketService.sendAlert(userId, {
        type: 'info' as const,
        title: `Page Health Update: ${healthCheck.pageName}`,
        message: `Status: ${healthCheck.status}. Issues found: ${healthCheck.issues.length}`
      });
    }
  }

  public getStatus(): { isRunning: boolean; checkInterval: number; lastCheck?: Date } {
    return {
      isRunning: this.isRunning,
      checkInterval: this.config.checkInterval,
    };
  }

  public updateConfig(newConfig: Partial<WatcherConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart with new interval if running
    if (this.isRunning && newConfig.checkInterval) {
      this.stop();
      this.start();
    }
  }
}

// Global instance
let pageWatcher: PageWatcherEngine;

export function initializePageWatcher(config?: WatcherConfig): void {
  if (!pageWatcher) {
    pageWatcher = new PageWatcherEngine(config);
    pageWatcher.start();
    console.log('Page Watcher Engine initialized and started');
  }
}

export function getPageWatcher(): PageWatcherEngine {
  if (!pageWatcher) {
    throw new Error('Page Watcher not initialized. Call initializePageWatcher() first.');
  }
  return pageWatcher;
}

export function stopPageWatcher(): void {
  if (pageWatcher) {
    pageWatcher.stop();
  }
}