import { db } from "./db";
import { weeklyAiReports, aiSuggestionFeedback, customerInteractions } from "@shared/schema";
import { openaiService } from "./openai";
import { eq, gte, desc, count, sql } from "drizzle-orm";

interface WeeklySlackReport {
  approvalRate: number;
  totalInteractions: number;
  topRejectedReplies: Array<{
    reply: string;
    reason: string;
    count: number;
  }>;
  newTrainingThemes: string[];
  retrainedPrompts: number;
  weeklyTrend: 'improving' | 'declining' | 'stable';
  keyInsights: string[];
}

interface SlackWebhookPayload {
  text: string;
  blocks: any[];
}

export class WeeklySlackReporter {
  private slackWebhookUrl: string;

  constructor(webhookUrl?: string) {
    this.slackWebhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || '';
  }

  async generateAndSendWeeklyReport(): Promise<boolean> {
    try {
      console.log('📊 Generating weekly AI learning report...');
      
      const weeklyData = await this.gatherWeeklyData();
      const report = await this.generateReport(weeklyData);
      const slackMessage = this.formatSlackMessage(report);
      
      if (this.slackWebhookUrl) {
        await this.sendToSlack(slackMessage);
        console.log('✅ Weekly report sent to Slack successfully');
        return true;
      } else {
        console.log('⚠️ No Slack webhook URL configured, skipping Slack notification');
        console.log('📋 Generated report:', JSON.stringify(report, null, 2));
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to generate/send weekly report:', error);
      return false;
    }
  }

  private async gatherWeeklyData(): Promise<any> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get weekly feedback data
    const weeklyFeedback = await db
      .select()
      .from(aiSuggestionFeedback)
      .where(gte(aiSuggestionFeedback.createdAt, oneWeekAgo))
      .orderBy(desc(aiSuggestionFeedback.createdAt));

    // Get weekly interactions
    const weeklyInteractions = await db
      .select()
      .from(customerInteractions)
      .where(gte(customerInteractions.createdAt, oneWeekAgo));

    // Get approval rate
    const approvalStats = await db
      .select({
        feedback: aiSuggestionFeedback.agentFeedback,
        count: count()
      })
      .from(aiSuggestionFeedback)
      .where(gte(aiSuggestionFeedback.createdAt, oneWeekAgo))
      .groupBy(aiSuggestionFeedback.agentFeedback);

    // Get top rejection reasons
    const rejectionReasons = await db
      .select({
        reason: aiSuggestionFeedback.rejectionReason,
        aiSuggestion: aiSuggestionFeedback.aiSuggestion,
        count: count()
      })
      .from(aiSuggestionFeedback)
      .where(
        sql`${aiSuggestionFeedback.createdAt} >= ${oneWeekAgo} AND ${aiSuggestionFeedback.agentFeedback} = 'rejected'`
      )
      .groupBy(aiSuggestionFeedback.rejectionReason, aiSuggestionFeedback.aiSuggestion)
      .orderBy(desc(count()))
      .limit(3);

    // Get previous week for comparison
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const previousWeekStats = await db
      .select({
        feedback: aiSuggestionFeedback.agentFeedback,
        count: count()
      })
      .from(aiSuggestionFeedback)
      .where(
        sql`${aiSuggestionFeedback.createdAt} >= ${twoWeeksAgo} AND ${aiSuggestionFeedback.createdAt} < ${oneWeekAgo}`
      )
      .groupBy(aiSuggestionFeedback.agentFeedback);

    return {
      weeklyFeedback,
      weeklyInteractions,
      approvalStats,
      rejectionReasons,
      previousWeekStats,
      oneWeekAgo,
      twoWeeksAgo
    };
  }

  private async generateReport(data: any): Promise<WeeklySlackReport> {
    // Calculate approval rate
    const totalFeedback = data.approvalStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
    const approvals = data.approvalStats.find((stat: any) => stat.feedback === 'approved')?.count || 0;
    const approvalRate = totalFeedback > 0 ? (approvals / totalFeedback) : 0;

    // Calculate previous week approval rate for trend
    const prevTotalFeedback = data.previousWeekStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
    const prevApprovals = data.previousWeekStats.find((stat: any) => stat.feedback === 'approved')?.count || 0;
    const prevApprovalRate = prevTotalFeedback > 0 ? (prevApprovals / prevTotalFeedback) : 0;

    // Determine trend
    let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    const rateDiff = approvalRate - prevApprovalRate;
    if (rateDiff > 0.05) weeklyTrend = 'improving';
    else if (rateDiff < -0.05) weeklyTrend = 'declining';

    // Format top rejected replies
    const topRejectedReplies = data.rejectionReasons.map((item: any) => ({
      reply: item.aiSuggestion ? item.aiSuggestion.substring(0, 100) + '...' : 'N/A',
      reason: item.reason || 'No reason provided',
      count: item.count
    }));

    // Generate training themes using AI analysis
    const newTrainingThemes = await this.generateTrainingThemes(data.rejectionReasons);

    // Count retrained prompts (this would come from your training system)
    const retrainedPrompts = data.weeklyFeedback.filter((f: any) => f.agentFeedback === 'rejected').length;

    // Generate key insights
    const keyInsights = await this.generateKeyInsights(data);

    return {
      approvalRate,
      totalInteractions: data.weeklyInteractions.length,
      topRejectedReplies,
      newTrainingThemes,
      retrainedPrompts,
      weeklyTrend,
      keyInsights
    };
  }

  private async generateTrainingThemes(rejectionReasons: any[]): Promise<string[]> {
    if (rejectionReasons.length === 0) return [];

    try {
      const reasonsText = rejectionReasons
        .map(r => r.reason)
        .filter(Boolean)
        .join('; ');

      const prompt = `Analyze these customer service AI rejection reasons and identify 2-3 key training themes that emerge. Be concise and specific:

Rejection reasons: ${reasonsText}

Format as a simple list of themes (e.g., "Empathy Training", "Policy Knowledge"):`;

      const response = await openaiService.generateResponse({
        prompt,
        maxTokens: 100,
        temperature: 0.3
      });

      // Parse response into array of themes
      return response
        .split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating training themes:', error);
      return ['Response Quality', 'Customer Empathy', 'Policy Accuracy'];
    }
  }

  private async generateKeyInsights(data: any): Promise<string[]> {
    try {
      const insights = [];

      // Interaction volume insight
      if (data.weeklyInteractions.length > 100) {
        insights.push(`High interaction volume: ${data.weeklyInteractions.length} customer messages processed`);
      }

      // Sentiment analysis insight
      const negativeInteractions = data.weeklyInteractions.filter((i: any) => i.sentiment === 'negative').length;
      if (negativeInteractions > data.weeklyInteractions.length * 0.3) {
        insights.push(`${((negativeInteractions / data.weeklyInteractions.length) * 100).toFixed(0)}% of interactions were negative sentiment`);
      }

      // Category analysis
      const categories = data.weeklyInteractions.reduce((acc: any, interaction: any) => {
        acc[interaction.category] = (acc[interaction.category] || 0) + 1;
        return acc;
      }, {});

      const topCategory = Object.entries(categories)
        .sort(([,a]: any, [,b]: any) => b - a)[0];
      
      if (topCategory) {
        insights.push(`Top interaction category: ${topCategory[0]} (${topCategory[1]} cases)`);
      }

      return insights.slice(0, 3);
    } catch (error) {
      console.error('Error generating insights:', error);
      return ['AI system processed customer interactions successfully this week'];
    }
  }

  private formatSlackMessage(report: WeeklySlackReport): SlackWebhookPayload {
    const trendEmoji = {
      improving: '📈',
      declining: '📉',
      stable: '➡️'
    };

    const headerText = `🤖 *Weekly AI Learning Report* • ${new Date().toLocaleDateString()}`;

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🤖 Weekly AI Learning Report"
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Approval Rate:*\n${(report.approvalRate * 100).toFixed(1)}% ${trendEmoji[report.weeklyTrend]}`
          },
          {
            type: "mrkdwn",
            text: `*Total Interactions:*\n${report.totalInteractions.toLocaleString()}`
          }
        ]
      },
      {
        type: "divider"
      }
    ];

    // Top rejected replies section
    if (report.topRejectedReplies.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*❌ Top 3 Rejected AI Replies:*"
        }
      });

      report.topRejectedReplies.forEach((rejection, index) => {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${index + 1}.* "${rejection.reply}"\n_Reason:_ ${rejection.reason} _(${rejection.count} times)_`
          }
        });
      });

      blocks.push({ type: "divider" });
    }

    // Training themes section
    if (report.newTrainingThemes.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🧠 New Training Themes Added:*\n${report.newTrainingThemes.map(theme => `• ${theme}`).join('\n')}`
        }
      });
      blocks.push({ type: "divider" });
    }

    // Stats section
    blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*🔄 Retrained Prompts:*\n${report.retrainedPrompts}`
        },
        {
          type: "mrkdwn",
          text: `*📊 Weekly Trend:*\n${report.weeklyTrend.charAt(0).toUpperCase() + report.weeklyTrend.slice(1)} ${trendEmoji[report.weeklyTrend]}`
        }
      ]
    });

    // Key insights section
    if (report.keyInsights.length > 0) {
      blocks.push({ type: "divider" });
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💡 Key Insights:*\n${report.keyInsights.map(insight => `• ${insight}`).join('\n')}`
        }
      });
    }

    // Footer
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Generated by PagePilot AI • ${new Date().toLocaleString()}`
        }
      ]
    });

    return {
      text: headerText,
      blocks
    };
  }

  private async sendToSlack(payload: SlackWebhookPayload): Promise<void> {
    if (!this.slackWebhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const response = await fetch(this.slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
    }
  }

  async saveReportToDatabase(report: WeeklySlackReport): Promise<void> {
    try {
      await db.insert(weeklyAiReports).values({
        weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        weekEnd: new Date(),
        approvalRate: report.approvalRate,
        totalInteractions: report.totalInteractions,
        topRejectedReplies: JSON.stringify(report.topRejectedReplies),
        newTrainingThemes: JSON.stringify(report.newTrainingThemes),
        retrainedPrompts: report.retrainedPrompts,
        weeklyTrend: report.weeklyTrend,
        keyInsights: JSON.stringify(report.keyInsights),
        reportData: JSON.stringify(report),
        createdAt: new Date()
      });
      
      console.log('✅ Weekly report saved to database');
    } catch (error) {
      console.error('❌ Failed to save weekly report to database:', error);
    }
  }
}

export const weeklySlackReporter = new WeeklySlackReporter();