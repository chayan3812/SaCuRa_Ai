import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  json,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Facebook Pages connected to user accounts
export const facebookPages = pgTable("facebook_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  pageId: varchar("page_id").notNull(),
  pageName: varchar("page_name").notNull(),
  accessToken: text("access_token").notNull(),
  category: varchar("category"),
  followerCount: integer("follower_count"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Facebook Ad Accounts
export const facebookAdAccounts = pgTable("facebook_ad_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  adAccountId: varchar("ad_account_id").notNull(),
  adAccountName: varchar("ad_account_name").notNull(),
  accessToken: text("access_token").notNull(),
  currency: varchar("currency"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ad Performance Metrics
export const adMetrics = pgTable("ad_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  adAccountId: uuid("ad_account_id").notNull().references(() => facebookAdAccounts.id),
  campaignId: varchar("campaign_id"),
  campaignName: varchar("campaign_name"),
  spend: decimal("spend", { precision: 10, scale: 2 }),
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  conversions: integer("conversions"),
  cpm: decimal("cpm", { precision: 10, scale: 2 }),
  cpc: decimal("cpc", { precision: 10, scale: 2 }),
  ctr: decimal("ctr", { precision: 5, scale: 4 }),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer Interactions
export const customerInteractions = pgTable("customer_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").notNull().references(() => facebookPages.id),
  customerId: varchar("customer_id"),
  customerName: varchar("customer_name"),
  message: text("message").notNull(),
  response: text("response"),
  respondedBy: varchar("responded_by"), // 'ai' or employee id
  responseTime: integer("response_time"), // in seconds
  sentiment: varchar("sentiment"), // 'positive', 'negative', 'neutral'
  status: varchar("status").default("pending"), // 'pending', 'responded', 'escalated'
  isAutoResponse: boolean("is_auto_response").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // SmartInboxAI enhancements
  urgencyScore: decimal("urgency_score", { precision: 5, scale: 2 }), // 0-100 AI-calculated urgency
  aiClassification: varchar("ai_classification"), // AI message classification
  aiSuggestedReplies: jsonb("ai_suggested_replies"), // Array of AI-generated reply suggestions
  aiAnalyzedAt: timestamp("ai_analyzed_at"), // When AI analysis was performed
  // AI Feedback Loop for model improvement
  aiFeedbackScore: integer("ai_feedback_score"), // 1-5 rating of AI suggestion quality
  aiFeedbackNotes: text("ai_feedback_notes"), // Optional feedback comments
  aiFeedbackAt: timestamp("ai_feedback_at"), // When feedback was provided
  // AgentAssistChat - GPT-powered reply suggestions
  agentSuggestedReply: text("agent_suggested_reply"), // AI-generated reply suggestion
  agentReplyUsed: boolean("agent_reply_used").default(false), // Whether agent used the suggested reply
  agentReplyFeedback: varchar("agent_reply_feedback"), // 'useful' | 'not_useful' | null
});

// Employee Performance Tracking
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  role: varchar("role").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  avgResponseTime: integer("avg_response_time"), // in seconds
  totalResponses: integer("total_responses").default(0),
  isActive: boolean("is_active").default(true),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Learning Data
export const aiLearningData = pgTable("ai_learning_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  interactionId: uuid("interaction_id").references(() => customerInteractions.id),
  inputText: text("input_text").notNull(),
  outputText: text("output_text").notNull(),
  feedback: varchar("feedback"), // 'positive', 'negative', 'neutral'
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  category: varchar("category"), // 'customer_service', 'ad_copy', 'policy_check'
  createdAt: timestamp("created_at").defaultNow(),
});

// Training prompts for closed-loop AI learning
export const trainingPrompts = pgTable("training_prompts", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  messageId: varchar("message_id").notNull(),
  customerMessage: text("customer_message").notNull(),
  aiReply: text("ai_reply").notNull(),
  agentReply: text("agent_reply"),
  feedbackType: varchar("feedback_type").notNull(), // 'positive', 'negative', 'correction'
  prompt: text("prompt").notNull(),
  rating: integer("rating").notNull(), // 1 = useful, 0 = not useful
  category: varchar("category").notNull(), // 'positive_reinforcement', 'improvement_needed'
  priority: integer("priority").default(1), // 1-3, higher = more important
  contextData: jsonb("context_data"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Restriction Monitoring
export const restrictionAlerts = pgTable("restriction_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").references(() => facebookPages.id),
  adAccountId: uuid("ad_account_id").references(() => facebookAdAccounts.id),
  alertType: varchar("alert_type").notNull(), // 'policy_violation', 'ad_rejected', 'account_warning'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").default(false),
  aiSuggestion: text("ai_suggestion"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// 👁️ Enhanced by AI on 2025-06-15 — Feature: SaveAndTrackCompetitor
// Watched Competitors - Pages users want to track over time
export const watchedCompetitors = pgTable("watched_competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  pageId: varchar("page_id").notNull(),
  pageName: varchar("page_name"),
  category: varchar("category"),
  addedAt: timestamp("added_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Competitor Snapshots - Weekly snapshots of top posts for trend analysis
export const competitorSnapshots = pgTable("competitor_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: varchar("page_id").notNull(),
  snapshotDate: timestamp("snapshot_date").defaultNow(),
  postData: jsonb("post_data").notNull(), // Array of top posts with engagement data
  totalEngagement: integer("total_engagement").default(0),
  avgEngagementPerPost: decimal("avg_engagement_per_post", { precision: 10, scale: 2 }),
  topKeywords: jsonb("top_keywords"), // Array of extracted keywords
  createdAt: timestamp("created_at").defaultNow(),
});

// Competitor Analysis Data
export const competitorData = pgTable("competitor_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  competitorName: varchar("competitor_name").notNull(),
  competitorPageId: varchar("competitor_page_id"),
  adData: jsonb("ad_data"),
  engagement: jsonb("engagement_data"),
  lastScanned: timestamp("last_scanned"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Recommendations
export const aiRecommendations = pgTable("ai_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'budget', 'timing', 'content', 'audience'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").notNull(), // 'low', 'medium', 'high'
  actionable: jsonb("actionable_data"),
  isImplemented: boolean("is_implemented").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  implementedAt: timestamp("implemented_at"),
});

// Content Queue and Scheduled Posts
export const contentQueue = pgTable("content_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull(),
  pageId: varchar("page_id").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  hashtags: text("hashtags").array(),
  images: text("images").array(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  status: varchar("status", { enum: ["draft", "scheduled", "published", "failed", "cancelled"] }).notNull().default("draft"),
  postType: varchar("post_type", { enum: ["text", "image", "video", "link", "carousel"] }).notNull().default("text"),
  targetAudience: jsonb("target_audience"),
  seoScore: integer("seo_score"),
  estimatedReach: varchar("estimated_reach"),
  actualReach: integer("actual_reach"),
  engagement: jsonb("engagement"),
  publishedAt: timestamp("published_at"),
  externalPostId: varchar("external_post_id"), // Facebook post ID after publishing
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentTemplates = pgTable("content_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  category: varchar("category", { enum: ["promotion", "engagement", "educational", "seasonal", "announcement"] }).notNull(),
  content: text("content").notNull(),
  hashtags: text("hashtags").array(),
  variables: text("variables").array(), // Placeholders like {product_name}, {discount}
  isPublic: boolean("is_public").default(false),
  useCount: integer("use_count").default(0),
  avgPerformance: jsonb("avg_performance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled Posts Table (for actual posting)
export const scheduledPosts = pgTable("scheduled_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  pageId: uuid("page_id").notNull().references(() => facebookPages.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  // 👁️ Enhanced by AI on 2025-06-15 — Feature: ContentScheduler
  facebookPostId: varchar("facebook_post_id"), // Store the actual Facebook post ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const postingSchedules = pgTable("posting_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull(),
  pageId: varchar("page_id").notNull(),
  name: varchar("name").notNull(),
  timezone: varchar("timezone").notNull().default("UTC"),
  frequency: varchar("frequency", { enum: ["daily", "weekly", "monthly", "custom"] }).notNull(),
  timeSlots: jsonb("time_slots").notNull(), // Array of {day: number, hour: number, minute: number}
  isActive: boolean("is_active").default(true),
  autoGenerate: boolean("auto_generate").default(false), // Auto-generate content for slots
  contentType: varchar("content_type", { enum: ["mixed", "promotional", "educational", "engagement"] }).default("mixed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Keyword Snapshot Tracking Table
export const competitorKeywordSnapshots = pgTable("competitor_keyword_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull(),
  pageIds: text("page_ids").array().notNull(),
  keywordCounts: jsonb("keyword_counts").notNull(),
  postsAnalyzed: integer("posts_analyzed").default(0),
  capturedAt: timestamp("captured_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type CompetitorKeywordSnapshot = typeof competitorKeywordSnapshots.$inferSelect;
export type InsertCompetitorKeywordSnapshot = typeof competitorKeywordSnapshots.$inferInsert;

export const insertTrainingPromptSchema = createInsertSchema(trainingPrompts).omit({
  id: true,
  createdAt: true,
});

export type InsertTrainingPrompt = z.infer<typeof insertTrainingPromptSchema>;
export type TrainingPrompt = typeof trainingPrompts.$inferSelect;

// SmartFeedback - AI suggestion feedback tracking for self-improvement
export const aiSuggestionFeedback = pgTable("ai_suggestion_feedback", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  messageId: varchar("message_id").notNull(), // references customer_interactions.id
  aiSuggestion: text("ai_suggestion").notNull(), // the AI-generated reply
  feedback: boolean("feedback"), // true = 👍, false = 👎, null = not rated
  createdAt: timestamp("created_at").defaultNow(),
  reviewedBy: varchar("reviewed_by"), // agent who gave feedback (references users.id)
  platformContext: text("platform_context"), // "inbox", "ads", etc. for multi-context AI use
  usageCount: integer("usage_count").default(0), // how many times this suggestion was used
  modelVersion: varchar("model_version"), // track which AI model version generated this
  responseTime: integer("response_time"), // milliseconds to generate suggestion
});

export const insertFacebookPageSchema = createInsertSchema(facebookPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdMetricsSchema = createInsertSchema(adMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerInteractionSchema = createInsertSchema(customerInteractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRestrictionAlertSchema = createInsertSchema(restrictionAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertAIRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertContentQueueSchema = createInsertSchema(contentQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertContentTemplateSchema = createInsertSchema(contentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostingScheduleSchema = createInsertSchema(postingSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 👁️ Enhanced by AI on 2025-06-15 — Feature: SaveAndTrackCompetitor
export const insertWatchedCompetitorSchema = createInsertSchema(watchedCompetitors).omit({
  id: true,
  addedAt: true,
});

export const insertCompetitorSnapshotSchema = createInsertSchema(competitorSnapshots).omit({
  id: true,
  snapshotDate: true,
  createdAt: true,
});

export type FacebookPage = typeof facebookPages.$inferSelect;
export type InsertFacebookPage = z.infer<typeof insertFacebookPageSchema>;
export type AdMetrics = typeof adMetrics.$inferSelect;
export type InsertAdMetrics = z.infer<typeof insertAdMetricsSchema>;
export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type InsertCustomerInteraction = z.infer<typeof insertCustomerInteractionSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type RestrictionAlert = typeof restrictionAlerts.$inferSelect;
export type InsertRestrictionAlert = z.infer<typeof insertRestrictionAlertSchema>;
export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = z.infer<typeof insertAIRecommendationSchema>;
export type ContentQueue = typeof contentQueue.$inferSelect;
export type InsertContentQueue = z.infer<typeof insertContentQueueSchema>;
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type InsertContentTemplate = z.infer<typeof insertContentTemplateSchema>;
export type PostingSchedule = typeof postingSchedules.$inferSelect;
export type InsertPostingSchedule = z.infer<typeof insertPostingScheduleSchema>;
export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type WatchedCompetitor = typeof watchedCompetitors.$inferSelect;
export type InsertWatchedCompetitor = z.infer<typeof insertWatchedCompetitorSchema>;
export type CompetitorSnapshot = typeof competitorSnapshots.$inferSelect;
export type InsertCompetitorSnapshot = z.infer<typeof insertCompetitorSnapshotSchema>;

// Advanced Feedback Replay System for AI vs Agent Comparison
export const feedbackReplayLog = pgTable("feedback_replay_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  aiReply: text("ai_reply").notNull(),
  agentReply: text("agent_reply"),
  feedback: varchar("feedback", { enum: ["yes", "no"] }).notNull(),
  improvementNotes: text("improvement_notes"),
  sessionId: varchar("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Training Log for Model Fine-tuning Pipeline
export const trainingLog = pgTable("training_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  prompt: text("prompt").notNull(),
  completion: text("completion").notNull(),
  feedbackScore: integer("feedback_score").default(0),
  trainingBatch: varchar("training_batch"),
  exported: boolean("exported").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiSuggestionFeedbackSchema = createInsertSchema(aiSuggestionFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackReplayLogSchema = createInsertSchema(feedbackReplayLog).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingLogSchema = createInsertSchema(trainingLog).omit({
  id: true,
  createdAt: true,
});

// AI Self-Awareness: Failure Analysis System
export const aiReplyFailures = pgTable("ai_reply_failures", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message").notNull(),
  aiReply: text("ai_reply").notNull(),
  agentReply: text("agent_reply"),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiReplyFailureSchema = createInsertSchema(aiReplyFailures).omit({
  id: true,
  createdAt: true,
});

// AI Reply Improvements for Self-Optimizing System
export const aiReplyImprovements = pgTable("ai_reply_improvements", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: varchar("prompt_id").notNull(),
  originalPrompt: text("original_prompt").notNull(),
  originalReply: text("original_reply").notNull(),
  correctedReply: text("corrected_reply").notNull(),
  scoreGainEstimate: integer("score_gain_estimate").default(0),
  failureCategory: varchar("failure_category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiReplyImprovementSchema = createInsertSchema(aiReplyImprovements).omit({
  id: true,
  createdAt: true,
});

// AI Assistant Versions for Upgrade Tracking
export const aiAssistantVersions = pgTable("ai_assistant_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  versionTag: varchar("version_tag").notNull(), // e.g. v1.0, v2.0
  fineTuneId: varchar("fine_tune_id"), // from OpenAI
  description: text("description"),
  modelConfig: jsonb("model_config"), // model parameters, temperature, etc.
  trainingDataCount: integer("training_data_count").default(0),
  performanceMetrics: jsonb("performance_metrics"), // accuracy, response time, etc.
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiAssistantVersionSchema = createInsertSchema(aiAssistantVersions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI Stress Test Log for Elite Orchestration
export const aiStressTestLog = pgTable("ai_stress_test_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  interactionId: varchar("interaction_id").notNull(),
  originalReply: text("original_reply").notNull(),
  improvedReply: text("improved_reply").notNull(),
  evalScore: integer("eval_score").notNull(),
  improvement: integer("improvement").notNull(),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 3 }).notNull(),
  categories: jsonb("categories"), // empathy, clarity, completeness, etc.
  comments: text("comments"),
  processingTime: integer("processing_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiStressTestLogSchema = createInsertSchema(aiStressTestLog).omit({
  id: true,
  createdAt: true,
});

// Weekly AI Intelligence Reports
export const weeklyAiReports = pgTable("weekly_ai_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  summary: text("summary").notNull(),
  stats: jsonb("stats").notNull(),
  evolution: jsonb("evolution").notNull(),
  coaching: jsonb("coaching").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWeeklyAiReportSchema = createInsertSchema(weeklyAiReports).omit({
  id: true,
  createdAt: true,
});

export type AiSuggestionFeedback = typeof aiSuggestionFeedback.$inferSelect;
export type InsertAiSuggestionFeedback = z.infer<typeof insertAiSuggestionFeedbackSchema>;
export type FeedbackReplayLog = typeof feedbackReplayLog.$inferSelect;
export type InsertFeedbackReplayLog = z.infer<typeof insertFeedbackReplayLogSchema>;
export type TrainingLog = typeof trainingLog.$inferSelect;
export type InsertTrainingLog = z.infer<typeof insertTrainingLogSchema>;
export type AiReplyFailure = typeof aiReplyFailures.$inferSelect;
export type InsertAiReplyFailure = z.infer<typeof insertAiReplyFailureSchema>;
