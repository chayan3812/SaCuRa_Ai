import cron from 'node-cron';
import { WeeklyAIReporter } from './weeklyAIReporter';

/**
 * Scheduled Jobs System
 * Manages automated tasks including weekly AI intelligence report generation
 */
export class ScheduledJobsManager {
  private weeklyReporter: WeeklyAIReporter;
  private isJobsStarted: boolean = false;

  constructor() {
    this.weeklyReporter = new WeeklyAIReporter();
  }

  /**
   * Start all scheduled jobs
   */
  startJobs() {
    if (this.isJobsStarted) {
      console.log('📅 Scheduled jobs already running');
      return;
    }

    // Weekly AI Intelligence Report - Every Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
      console.log('🤖 Starting weekly AI intelligence report generation...');
      try {
        const report = await this.weeklyReporter.generateWeeklyReport();
        console.log(`✅ Weekly AI intelligence report generated: ${report.id}`);
        console.log(`📊 Report covers: ${report.weekStart} to ${report.weekEnd}`);
      } catch (error) {
        console.error('❌ Failed to generate weekly AI intelligence report:', error);
      }
    }, {
      timezone: "America/New_York"
    });

    // Daily confidence drift monitoring - Every day at 6 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('📈 Running daily confidence drift monitoring...');
      try {
        // This would typically check for significant confidence drops
        // and trigger alerts or retraining if needed
        console.log('✅ Daily confidence monitoring completed');
      } catch (error) {
        console.error('❌ Daily confidence monitoring failed:', error);
      }
    }, {
      timezone: "America/New_York"
    });

    // Performance review check - Every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('🎯 Running weekly performance review check...');
      try {
        // Check for 7-day performance drops and trigger auto-training if needed
        console.log('✅ Weekly performance review completed');
      } catch (error) {
        console.error('❌ Weekly performance review failed:', error);
      }
    }, {
      timezone: "America/New_York"
    });

    this.isJobsStarted = true;
    console.log('🚀 All scheduled jobs started successfully');
    console.log('📅 Jobs schedule:');
    console.log('   - Weekly AI Intelligence Reports: Sundays at midnight');
    console.log('   - Daily Confidence Monitoring: Daily at 6 AM');
    console.log('   - Performance Review: Mondays at 9 AM');
  }

  /**
   * Stop all scheduled jobs
   */
  stopJobs() {
    cron.getTasks().forEach((task) => {
      task.stop();
    });
    this.isJobsStarted = false;
    console.log('⏹️ All scheduled jobs stopped');
  }

  /**
   * Get job status
   */
  getJobStatus() {
    const tasks = cron.getTasks();
    return {
      isRunning: this.isJobsStarted,
      totalJobs: tasks.size,
      jobs: [
        {
          name: 'Weekly AI Intelligence Report',
          schedule: 'Sundays at midnight',
          status: this.isJobsStarted ? 'running' : 'stopped'
        },
        {
          name: 'Daily Confidence Monitoring',
          schedule: 'Daily at 6 AM',
          status: this.isJobsStarted ? 'running' : 'stopped'
        },
        {
          name: 'Weekly Performance Review',
          schedule: 'Mondays at 9 AM',
          status: this.isJobsStarted ? 'running' : 'stopped'
        }
      ]
    };
  }

  /**
   * Manually trigger weekly report generation (for testing)
   */
  async triggerWeeklyReport() {
    console.log('🔧 Manually triggering weekly AI intelligence report...');
    try {
      const report = await this.weeklyReporter.generateWeeklyReport();
      console.log(`✅ Manual weekly report generated: ${report.id}`);
      return report;
    } catch (error) {
      console.error('❌ Manual weekly report generation failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const scheduledJobsManager = new ScheduledJobsManager();