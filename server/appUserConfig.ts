/**
 * App User Configuration for Facebook Conversions API
 * Centralizes App User ID management for proper attribution
 */

export interface AppUserConfiguration {
  appUserId: string;
  pixelId: string;
  accessToken: string;
  conversionsToken: string;
  marketingApiToken: string;
  appId: string;
  appSecret: string;
}

export const APP_USER_CONFIG: AppUserConfiguration = {
  appUserId: '4026499934285415',
  pixelId: '1311177013673064',
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN || process.env.FB_PIXEL_ACCESS_TOKEN || '',
  conversionsToken: process.env.FB_PIXEL_ACCESS_TOKEN || '',
  marketingApiToken: process.env.FB_PIXEL_ACCESS_TOKEN || '',
  appId: '4026499934285415',
  appSecret: '0426b1ae64c6f5951bd8f974e9492ec4',
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