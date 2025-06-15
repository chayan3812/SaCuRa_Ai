export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  timezone?: string;
  language?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  campaignAlerts: boolean;
  budgetWarnings: boolean;
  performanceReports: boolean;
  systemUpdates: boolean;
}

export interface APIKeySettings {
  facebookAccessToken?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  sendgridApiKey?: string;
}

export interface UserSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  apiKeys: APIKeySettings;
}