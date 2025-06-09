import {
  users,
  type User,
  type UpsertUser,
  facebookPages,
  type FacebookPage,
  type InsertFacebookPage,
  adMetrics,
  type AdMetrics,
  type InsertAdMetrics,
  customerInteractions,
  type CustomerInteraction,
  type InsertCustomerInteraction,
  employees,
  type Employee,
  type InsertEmployee,
  restrictionAlerts,
  type RestrictionAlert,
  type InsertRestrictionAlert,
  aiRecommendations,
  type AIRecommendation,
  type InsertAIRecommendation,
  competitorData,
  aiLearningData,
  facebookAdAccounts,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Facebook Pages
  createFacebookPage(page: InsertFacebookPage): Promise<FacebookPage>;
  getFacebookPagesByUser(userId: string): Promise<FacebookPage[]>;
  getFacebookPageById(pageId: string): Promise<FacebookPage | undefined>;
  updateFacebookPageToken(pageId: string, accessToken: string): Promise<void>;
  
  // Ad Metrics
  createAdMetrics(metrics: InsertAdMetrics): Promise<AdMetrics>;
  getAdMetricsByAccount(adAccountId: string, days: number): Promise<AdMetrics[]>;
  getLatestAdMetrics(userId: string): Promise<AdMetrics[]>;
  
  // Customer Interactions
  createCustomerInteraction(interaction: InsertCustomerInteraction): Promise<CustomerInteraction>;
  getCustomerInteractionsByPage(pageId: string, limit: number): Promise<CustomerInteraction[]>;
  updateCustomerInteractionResponse(id: string, response: string, respondedBy: string, responseTime: number): Promise<void>;
  getPendingInteractions(pageId: string): Promise<CustomerInteraction[]>;
  
  // Employees
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployeesByUser(userId: string): Promise<Employee[]>;
  updateEmployeePerformance(employeeId: string, avgResponseTime: number, totalResponses: number): Promise<void>;
  updateEmployeeActivity(employeeId: string, isActive: boolean): Promise<void>;
  
  // Restriction Alerts
  createRestrictionAlert(alert: InsertRestrictionAlert): Promise<RestrictionAlert>;
  getRestrictionAlertsByUser(userId: string): Promise<RestrictionAlert[]>;
  markRestrictionAlertResolved(alertId: string): Promise<void>;
  
  // AI Recommendations
  createAIRecommendation(recommendation: InsertAIRecommendation): Promise<AIRecommendation>;
  getAIRecommendationsByUser(userId: string): Promise<AIRecommendation[]>;
  markRecommendationImplemented(recommendationId: string): Promise<void>;
  
  // Dashboard Analytics
  getDashboardMetrics(userId: string): Promise<{
    totalSpend: number;
    totalResponses: number;
    preventedRestrictions: number;
    avgResponseTime: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Facebook Pages
  async createFacebookPage(page: InsertFacebookPage): Promise<FacebookPage> {
    const [newPage] = await db.insert(facebookPages).values(page).returning();
    return newPage;
  }

  async getFacebookPagesByUser(userId: string): Promise<FacebookPage[]> {
    return await db.select().from(facebookPages).where(eq(facebookPages.userId, userId));
  }

  async getFacebookPageById(pageId: string): Promise<FacebookPage | undefined> {
    const [page] = await db.select().from(facebookPages).where(eq(facebookPages.pageId, pageId));
    return page;
  }

  async updateFacebookPageToken(pageId: string, accessToken: string): Promise<void> {
    await db
      .update(facebookPages)
      .set({ accessToken, updatedAt: new Date() })
      .where(eq(facebookPages.pageId, pageId));
  }

  // Ad Metrics
  async createAdMetrics(metrics: InsertAdMetrics): Promise<AdMetrics> {
    const [newMetrics] = await db.insert(adMetrics).values(metrics).returning();
    return newMetrics;
  }

  async getAdMetricsByAccount(adAccountId: string, days: number): Promise<AdMetrics[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return await db
      .select()
      .from(adMetrics)
      .where(and(
        eq(adMetrics.adAccountId, adAccountId),
        gte(adMetrics.date, since)
      ))
      .orderBy(desc(adMetrics.date));
  }

  async getLatestAdMetrics(userId: string): Promise<AdMetrics[]> {
    return await db
      .select({
        id: adMetrics.id,
        adAccountId: adMetrics.adAccountId,
        campaignId: adMetrics.campaignId,
        campaignName: adMetrics.campaignName,
        spend: adMetrics.spend,
        impressions: adMetrics.impressions,
        clicks: adMetrics.clicks,
        conversions: adMetrics.conversions,
        cpm: adMetrics.cpm,
        cpc: adMetrics.cpc,
        ctr: adMetrics.ctr,
        date: adMetrics.date,
        createdAt: adMetrics.createdAt,
      })
      .from(adMetrics)
      .innerJoin(facebookAdAccounts, eq(adMetrics.adAccountId, facebookAdAccounts.id))
      .where(eq(facebookAdAccounts.userId, userId))
      .orderBy(desc(adMetrics.date))
      .limit(10);
  }

  // Customer Interactions
  async createCustomerInteraction(interaction: InsertCustomerInteraction): Promise<CustomerInteraction> {
    const [newInteraction] = await db.insert(customerInteractions).values(interaction).returning();
    return newInteraction;
  }

  async getCustomerInteractionsByPage(pageId: string, limit: number): Promise<CustomerInteraction[]> {
    return await db
      .select()
      .from(customerInteractions)
      .where(eq(customerInteractions.pageId, pageId))
      .orderBy(desc(customerInteractions.createdAt))
      .limit(limit);
  }

  async updateCustomerInteractionResponse(
    id: string, 
    response: string, 
    respondedBy: string, 
    responseTime: number
  ): Promise<void> {
    await db
      .update(customerInteractions)
      .set({ 
        response, 
        respondedBy, 
        responseTime, 
        status: 'responded',
        updatedAt: new Date() 
      })
      .where(eq(customerInteractions.id, id));
  }

  async getPendingInteractions(pageId: string): Promise<CustomerInteraction[]> {
    return await db
      .select()
      .from(customerInteractions)
      .where(and(
        eq(customerInteractions.pageId, pageId),
        eq(customerInteractions.status, 'pending')
      ))
      .orderBy(customerInteractions.createdAt);
  }

  // Employees
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async getEmployeesByUser(userId: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.userId, userId));
  }

  async updateEmployeePerformance(
    employeeId: string, 
    avgResponseTime: number, 
    totalResponses: number
  ): Promise<void> {
    await db
      .update(employees)
      .set({ 
        avgResponseTime, 
        totalResponses, 
        updatedAt: new Date() 
      })
      .where(eq(employees.id, employeeId));
  }

  async updateEmployeeActivity(employeeId: string, isActive: boolean): Promise<void> {
    await db
      .update(employees)
      .set({ 
        isActive, 
        lastActive: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(employees.id, employeeId));
  }

  // Restriction Alerts
  async createRestrictionAlert(alert: InsertRestrictionAlert): Promise<RestrictionAlert> {
    const [newAlert] = await db.insert(restrictionAlerts).values(alert).returning();
    return newAlert;
  }

  async getRestrictionAlertsByUser(userId: string): Promise<RestrictionAlert[]> {
    return await db
      .select({
        id: restrictionAlerts.id,
        pageId: restrictionAlerts.pageId,
        adAccountId: restrictionAlerts.adAccountId,
        alertType: restrictionAlerts.alertType,
        severity: restrictionAlerts.severity,
        message: restrictionAlerts.message,
        isResolved: restrictionAlerts.isResolved,
        aiSuggestion: restrictionAlerts.aiSuggestion,
        createdAt: restrictionAlerts.createdAt,
        resolvedAt: restrictionAlerts.resolvedAt,
      })
      .from(restrictionAlerts)
      .innerJoin(facebookPages, eq(restrictionAlerts.pageId, facebookPages.id))
      .where(eq(facebookPages.userId, userId))
      .orderBy(desc(restrictionAlerts.createdAt));
  }

  async markRestrictionAlertResolved(alertId: string): Promise<void> {
    await db
      .update(restrictionAlerts)
      .set({ 
        isResolved: true, 
        resolvedAt: new Date() 
      })
      .where(eq(restrictionAlerts.id, alertId));
  }

  // AI Recommendations
  async createAIRecommendation(recommendation: InsertAIRecommendation): Promise<AIRecommendation> {
    const [newRecommendation] = await db.insert(aiRecommendations).values(recommendation).returning();
    return newRecommendation;
  }

  async getAIRecommendationsByUser(userId: string): Promise<AIRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .orderBy(desc(aiRecommendations.createdAt))
      .limit(10);
  }

  async markRecommendationImplemented(recommendationId: string): Promise<void> {
    await db
      .update(aiRecommendations)
      .set({ 
        isImplemented: true, 
        implementedAt: new Date() 
      })
      .where(eq(aiRecommendations.id, recommendationId));
  }

  // Dashboard Analytics
  async getDashboardMetrics(userId: string): Promise<{
    totalSpend: number;
    totalResponses: number;
    preventedRestrictions: number;
    avgResponseTime: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's ad spend
    const spendResult = await db
      .select({ totalSpend: sql<number>`COALESCE(SUM(${adMetrics.spend}), 0)` })
      .from(adMetrics)
      .innerJoin(facebookAdAccounts, eq(adMetrics.adAccountId, facebookAdAccounts.adAccountId))
      .where(and(
        eq(facebookAdAccounts.userId, userId),
        gte(adMetrics.date, today)
      ));

    // Get total responses today
    const responseResult = await db
      .select({ totalResponses: sql<number>`COUNT(*)` })
      .from(customerInteractions)
      .innerJoin(facebookPages, eq(customerInteractions.pageId, facebookPages.pageId))
      .where(and(
        eq(facebookPages.userId, userId),
        gte(customerInteractions.createdAt, today)
      ));

    // Get prevented restrictions this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const restrictionResult = await db
      .select({ preventedRestrictions: sql<number>`COUNT(*)` })
      .from(restrictionAlerts)
      .innerJoin(facebookPages, eq(restrictionAlerts.pageId, facebookPages.pageId))
      .where(and(
        eq(facebookPages.userId, userId),
        eq(restrictionAlerts.isResolved, true),
        gte(restrictionAlerts.createdAt, monthStart)
      ));

    // Get average AI response time
    const avgResponseResult = await db
      .select({ avgResponseTime: sql<number>`COALESCE(AVG(${customerInteractions.responseTime}), 0)` })
      .from(customerInteractions)
      .innerJoin(facebookPages, eq(customerInteractions.pageId, facebookPages.pageId))
      .where(and(
        eq(facebookPages.userId, userId),
        eq(customerInteractions.isAutoResponse, true),
        gte(customerInteractions.createdAt, today)
      ));

    return {
      totalSpend: spendResult[0]?.totalSpend || 0,
      totalResponses: Number(responseResult[0]?.totalResponses) || 0,
      preventedRestrictions: Number(restrictionResult[0]?.preventedRestrictions) || 0,
      avgResponseTime: avgResponseResult[0]?.avgResponseTime || 0,
    };
  }
}

export const storage = new DatabaseStorage();
