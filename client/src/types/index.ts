export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacebookPage {
  id: string;
  userId: string;
  pageId: string;
  pageName: string;
  accessToken: string;
  category?: string;
  followerCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalSpend: number;
  totalResponses: number;
  preventedRestrictions: number;
  avgResponseTime: number;
}

export interface CustomerInteraction {
  id: string;
  pageId: string;
  customerId?: string;
  customerName?: string;
  message: string;
  response?: string;
  respondedBy?: string;
  responseTime?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  status: 'pending' | 'responded' | 'escalated';
  isAutoResponse: boolean;
  context?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  avgResponseTime?: number;
  totalResponses: number;
  isActive: boolean;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'budget' | 'timing' | 'content' | 'audience';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: any;
  isImplemented: boolean;
  createdAt: string;
  implementedAt?: string;
}

export interface RestrictionAlert {
  id: string;
  pageId?: string;
  adAccountId?: string;
  alertType: 'policy_violation' | 'ad_rejected' | 'account_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  isResolved: boolean;
  aiSuggestion?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdMetrics {
  id: string;
  adAccountId: string;
  campaignId?: string;
  campaignName?: string;
  spend: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cpm: string;
  cpc: string;
  ctr: string;
  date: string;
  createdAt: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface AlertData {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}
