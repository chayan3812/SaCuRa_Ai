import axios from "axios";

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

export const adCampaignService = {
  async boostExistingPost({ pagePostId, dailyBudget, durationDays, targeting = null }) {
    if (!ACCESS_TOKEN || !AD_ACCOUNT_ID || !PAGE_ID) {
      throw new Error('Missing required Facebook advertising configuration. Please check FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID, and FACEBOOK_PAGE_ID environment variables.');
    }

    const now = new Date();
    const startTime = Math.floor(now.getTime() / 1000);
    const endTime = Math.floor(now.setDate(now.getDate() + durationDays) / 1000);

    try {
      // Create Campaign
      const campaignRes = await axios.post(
        `https://graph.facebook.com/v17.0/act_${AD_ACCOUNT_ID}/campaigns`,
        {
          name: `Boost ${pagePostId}`,
          objective: "POST_ENGAGEMENT",
          status: "PAUSED",
          access_token: ACCESS_TOKEN,
        }
      );

      const campaignId = campaignRes.data.id;

      // Create Ad Set
      const adSetRes = await axios.post(
        `https://graph.facebook.com/v17.0/act_${AD_ACCOUNT_ID}/adsets`,
        {
          name: `AdSet ${pagePostId}`,
          campaign_id: campaignId,
          daily_budget: dailyBudget * 100, // Convert to cents
          billing_event: "IMPRESSIONS",
          optimization_goal: "POST_ENGAGEMENT",
          start_time: startTime,
          end_time: endTime,
          targeting: targeting || {
            geo_locations: { countries: ["US"] },
            age_min: 18,
            age_max: 65
          },
          status: "PAUSED",
          access_token: ACCESS_TOKEN,
        }
      );

      const adSetId = adSetRes.data.id;

      // Create Ad Creative
      const creativeRes = await axios.post(
        `https://graph.facebook.com/v17.0/act_${AD_ACCOUNT_ID}/adcreatives`,
        {
          name: `Creative ${pagePostId}`,
          object_story_id: `${PAGE_ID}_${pagePostId}`,
          access_token: ACCESS_TOKEN,
        }
      );

      const creativeId = creativeRes.data.id;

      // Create Ad
      const adRes = await axios.post(
        `https://graph.facebook.com/v17.0/act_${AD_ACCOUNT_ID}/ads`,
        {
          name: `Ad ${pagePostId}`,
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: "PAUSED",
          access_token: ACCESS_TOKEN,
        }
      );

      return {
        campaignId,
        adSetId,
        adId: adRes.data.id,
        status: 'created',
        message: 'Ad campaign created successfully. Campaign is paused - activate it in Facebook Ads Manager.',
        totalBudget: dailyBudget * durationDays,
        duration: durationDays
      };
    } catch (error) {
      console.error('Facebook Ads API Error:', error.response?.data || error.message);
      throw new Error(`Failed to create ad campaign: ${error.response?.data?.error?.message || error.message}`);
    }
  },

  async getCampaignStatus(campaignId) {
    if (!ACCESS_TOKEN) {
      throw new Error('Missing FACEBOOK_ACCESS_TOKEN for campaign status retrieval.');
    }

    try {
      const insightsUrl = `https://graph.facebook.com/v17.0/${campaignId}/insights`;
      const campaignUrl = `https://graph.facebook.com/v17.0/${campaignId}`;
      
      const [insightsRes, campaignRes] = await Promise.all([
        axios.get(insightsUrl, {
          params: {
            access_token: ACCESS_TOKEN,
            fields: 'reach,impressions,spend,clicks,actions,cost_per_action_type'
          }
        }),
        axios.get(campaignUrl, {
          params: {
            access_token: ACCESS_TOKEN,
            fields: 'name,status,objective,created_time,updated_time'
          }
        })
      ]);

      const insights = insightsRes.data.data[0] || {};
      const campaign = campaignRes.data;

      return {
        campaignId,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        createdTime: campaign.created_time,
        updatedTime: campaign.updated_time,
        metrics: {
          reach: parseInt(insights.reach) || 0,
          impressions: parseInt(insights.impressions) || 0,
          spend: parseFloat(insights.spend) || 0,
          clicks: parseInt(insights.clicks) || 0,
          engagement: insights.actions?.find(action => 
            action.action_type === 'post_engagement'
          )?.value || 0,
          costPerEngagement: insights.cost_per_action_type?.find(cost => 
            cost.action_type === 'post_engagement'
          )?.value || 0
        }
      };
    } catch (error) {
      console.error('Campaign Status Error:', error.response?.data || error.message);
      throw new Error(`Failed to get campaign status: ${error.response?.data?.error?.message || error.message}`);
    }
  },

  async activateCampaign(campaignId) {
    if (!ACCESS_TOKEN) {
      throw new Error('Missing FACEBOOK_ACCESS_TOKEN for campaign activation.');
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v17.0/${campaignId}`,
        {
          status: 'ACTIVE',
          access_token: ACCESS_TOKEN
        }
      );

      return {
        campaignId,
        status: 'ACTIVE',
        message: 'Campaign activated successfully'
      };
    } catch (error) {
      console.error('Campaign Activation Error:', error.response?.data || error.message);
      throw new Error(`Failed to activate campaign: ${error.response?.data?.error?.message || error.message}`);
    }
  },

  async pauseCampaign(campaignId) {
    if (!ACCESS_TOKEN) {
      throw new Error('Missing FACEBOOK_ACCESS_TOKEN for campaign management.');
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v17.0/${campaignId}`,
        {
          status: 'PAUSED',
          access_token: ACCESS_TOKEN
        }
      );

      return {
        campaignId,
        status: 'PAUSED',
        message: 'Campaign paused successfully'
      };
    } catch (error) {
      console.error('Campaign Pause Error:', error.response?.data || error.message);
      throw new Error(`Failed to pause campaign: ${error.response?.data?.error?.message || error.message}`);
    }
  }
};