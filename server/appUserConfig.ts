/**
 * App User Configuration for Facebook Conversions API
 * Centralizes App User ID management for proper attribution
 */

export interface AppUserConfiguration {
  appUserId: string;
  pixelId: string;
  accessToken: string;
  conversionsToken: string;
  appId: string;
}

export const APP_USER_CONFIG: AppUserConfiguration = {
  appUserId: '1493601725381462',
  pixelId: '1230928114675791',
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
  conversionsToken: process.env.FACEBOOK_CONVERSIONS_TOKEN || '',
  appId: process.env.FACEBOOK_APP_ID || '1230928114675791',
};

/**
 * Enhanced user data builder that includes App User ID for proper attribution
 */
export function buildUserDataWithAppUser(baseUserData: any = {}): any {
  return {
    ...baseUserData,
    fb_login_id: APP_USER_CONFIG.appUserId,
    external_id: baseUserData.external_id || APP_USER_CONFIG.appUserId,
  };
}

/**
 * Get standardized conversion event configuration
 */
export function getConversionEventConfig() {
  return {
    appUserId: APP_USER_CONFIG.appUserId,
    pixelId: APP_USER_CONFIG.pixelId,
    partner_agent: 'PagePilot AI',
    namespace_id: APP_USER_CONFIG.appUserId,
    upload_tag: 'pagepilot_ai',
    upload_source: 'website',
  };
}

export default APP_USER_CONFIG;