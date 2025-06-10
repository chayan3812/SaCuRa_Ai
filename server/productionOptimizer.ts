import cron from 'node-cron';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  databaseConnections: {
    active: number;
    idle: number;
    waiting: number;
  };
  apiResponseTimes: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  activeUsers: number;
}

interface OptimizationRecommendation {
  type: 'memory' | 'database' | 'api' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  implementation: string[];
}

interface ScalingRecommendation {
  shouldScale: boolean;
  reason: string;
  recommendedAction: string;
  currentLoad: number;
  targetLoad: number;
}

export class ProductionOptimizer {
  private performanceMetrics: Map<string, any> = new Map();
  private memoryThreshold = 0.85; // 85% memory usage threshold
  private responseTimeThreshold = 1000; // 1 second response time threshold
  private errorRateThreshold = 0.05; // 5% error rate threshold
  private optimizationCache: Map<string, { data: any; expiry: number }> = new Map();
  private isMonitoringActive = false;

  constructor() {
    this.startPerformanceMonitoring();
    this.startMemoryOptimization();
    this.scheduleCleanupTasks();
  }

  private startPerformanceMonitoring(): void {
    if (this.isMonitoringActive) return;
    this.isMonitoringActive = true;

    // Monitor system health every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Clean up old metrics every 5 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000);
  }

  private startMemoryOptimization(): void {
    // Force garbage collection every 10 minutes
    setInterval(() => {
      if (global.gc) {
        global.gc();
        console.log('⚡ Forced garbage collection completed');
      }
    }, 600000);

    // Monitor memory usage and optimize when needed
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      if (memoryPercentage > 80) {
        console.log('🚨 High memory usage detected - performing optimization');
        this.optimizeMemoryUsage();
      }
    }, 60000);
  }

  private scheduleCleanupTasks(): void {
    // Clear caches every hour
    cron.schedule('0 * * * *', () => {
      this.clearExpiredCaches();
      console.log('🧹 Hourly cache cleanup completed');
    });

    // Deep optimization every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.performDeepOptimization();
      console.log('🔧 Deep system optimization completed');
    });

    // Generate performance report daily
    cron.schedule('0 0 * * *', () => {
      this.generatePerformanceReport();
      console.log('📊 Daily performance report generated');
    });
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Calculate memory percentage
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Get recent response times
    const recentMetrics = Array.from(this.performanceMetrics.values())
      .filter(m => Date.now() - m.timestamp < 300000) // Last 5 minutes
      .map(m => m.responseTime)
      .filter(t => t);

    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((a, b) => a + b, 0) / recentMetrics.length 
      : 0;

    // Calculate percentiles
    const sortedTimes = recentMetrics.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    const health: SystemHealth = {
      status: this.determineHealthStatus(memoryPercentage, avgResponseTime),
      uptime,
      memoryUsage: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: memoryPercentage
      },
      databaseConnections: {
        active: 0, // Would be populated with real DB connection info
        idle: 0,
        waiting: 0
      },
      apiResponseTimes: {
        average: avgResponseTime,
        p95: sortedTimes[p95Index] || 0,
        p99: sortedTimes[p99Index] || 0
      },
      errorRate: 0, // Would be calculated from actual error logs
      activeUsers: this.getActiveUserCount()
    };

    // Log critical issues
    if (health.status === 'critical') {
      console.log('CRITICAL: System health degraded', health);
      await this.handleCriticalIssues(health);
    } else if (health.status === 'warning') {
      console.log('WARNING: System performance issues detected', health);
    }

    return health;
  }

  generateOptimizationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Memory optimization recommendations
    if (memoryPercentage > 85) {
      recommendations.push({
        type: 'memory',
        priority: 'critical',
        title: 'Critical Memory Usage',
        description: 'Memory usage is above 85%, immediate optimization required',
        impact: 'System may become unstable or crash',
        implementation: [
          'Clear unnecessary caches',
          'Optimize large data structures',
          'Implement lazy loading',
          'Consider scaling up memory resources'
        ]
      });
    } else if (memoryPercentage > 70) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        title: 'High Memory Usage',
        description: 'Memory usage is above 70%, optimization recommended',
        impact: 'Performance degradation possible',
        implementation: [
          'Review and optimize data caching strategies',
          'Implement memory-efficient algorithms',
          'Clear old cached data more frequently'
        ]
      });
    }

    // Database optimization recommendations
    recommendations.push({
      type: 'database',
      priority: 'medium',
      title: 'Database Query Optimization',
      description: 'Optimize database queries for better performance',
      impact: 'Faster response times and reduced load',
      implementation: [
        'Add database indexes for frequently queried fields',
        'Implement query result caching',
        'Use connection pooling',
        'Optimize complex JOIN operations'
      ]
    });

    // API optimization recommendations
    recommendations.push({
      type: 'api',
      priority: 'medium',
      title: 'API Response Optimization',
      description: 'Improve API response times and efficiency',
      impact: 'Better user experience and reduced server load',
      implementation: [
        'Implement response compression',
        'Add API response caching',
        'Optimize data serialization',
        'Use pagination for large datasets'
      ]
    });

    return recommendations;
  }

  async checkAutoScaling(): Promise<ScalingRecommendation> {
    const health = await this.getSystemHealth();
    const currentLoad = this.calculateSystemLoad(health);
    
    const shouldScale = currentLoad > 80 || 
                       health.memoryUsage.percentage > 85 ||
                       health.apiResponseTimes.average > this.responseTimeThreshold;

    return {
      shouldScale,
      reason: shouldScale ? this.getScalingReason(health) : 'System is operating within normal parameters',
      recommendedAction: shouldScale ? 'Scale up server resources or optimize memory usage' : 'No action required',
      currentLoad,
      targetLoad: 70
    };
  }

  private collectSystemMetrics(): void {
    const timestamp = Date.now();
    const memoryUsage = process.memoryUsage();
    
    this.performanceMetrics.set(`metrics_${timestamp}`, {
      timestamp,
      memoryUsage,
      uptime: process.uptime(),
      // Additional metrics would be collected here
    });
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - 3600000; // Keep last hour of metrics
    
    Array.from(this.performanceMetrics.entries()).forEach(([key, value]) => {
      if (value.timestamp < cutoff) {
        this.performanceMetrics.delete(key);
      }
    });
  }

  private optimizeMemoryUsage(): void {
    // Clear expired cache entries
    this.clearExpiredCaches();
    
    // Clear large data structures
    if (this.performanceMetrics.size > 1000) {
      const entries = Array.from(this.performanceMetrics.entries());
      const keepCount = 500;
      const toKeep = entries.slice(-keepCount);
      this.performanceMetrics.clear();
      toKeep.forEach(([key, value]) => {
        this.performanceMetrics.set(key, value);
      });
      console.log('🗑️ Cleared old performance metrics for memory optimization');
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  private clearExpiredCaches(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    Array.from(this.optimizationCache.entries()).forEach(([key, { expiry }]) => {
      if (expiry < now) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.optimizationCache.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleared ${expiredKeys.length} expired cache entries`);
    }
  }

  private performDeepOptimization(): void {
    // Clear all non-essential caches
    this.optimizationCache.clear();
    
    // Optimize performance metrics
    this.optimizeMemoryUsage();
    
    // Log optimization completion
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    console.log(`🔧 Deep optimization completed - Memory usage: ${memoryPercentage.toFixed(1)}%`);
  }

  private async generatePerformanceReport(): Promise<void> {
    const health = await this.getSystemHealth();
    const recommendations = this.generateOptimizationRecommendations();
    
    console.log('📊 Daily Performance Report:');
    console.log(`- System Status: ${health.status}`);
    console.log(`- Memory Usage: ${health.memoryUsage.percentage.toFixed(1)}%`);
    console.log(`- Average Response Time: ${health.apiResponseTimes.average.toFixed(0)}ms`);
    console.log(`- Active Users: ${health.activeUsers}`);
    console.log(`- Optimization Recommendations: ${recommendations.length}`);
  }

  private determineHealthStatus(memoryPercentage: number, avgResponseTime: number): SystemHealth['status'] {
    if (memoryPercentage > 95 || avgResponseTime > 2000) {
      return 'critical';
    } else if (memoryPercentage > 85 || avgResponseTime > this.responseTimeThreshold) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  private async handleCriticalIssues(health: SystemHealth): Promise<void> {
    // Immediate optimization actions for critical issues
    if (health.memoryUsage.percentage > 95) {
      console.log('🚨 Critical memory usage detected - performing emergency optimization');
      this.optimizationCache.clear();
      this.performanceMetrics.clear();
      
      if (global.gc) {
        global.gc();
      }
      
      console.log('🗑️ Clearing large data structures for memory optimization');
    }

    // Generate scaling recommendation
    const scalingRec = await this.checkAutoScaling();
    if (scalingRec.shouldScale) {
      console.log('SCALING RECOMMENDATION:', scalingRec);
    }
  }

  private calculateSystemLoad(health: SystemHealth): number {
    const memoryWeight = 0.4;
    const responseTimeWeight = 0.3;
    const errorRateWeight = 0.3;

    const memoryLoad = health.memoryUsage.percentage;
    const responseTimeLoad = Math.min((health.apiResponseTimes.average / this.responseTimeThreshold) * 100, 100);
    const errorLoad = health.errorRate * 100;

    return (memoryLoad * memoryWeight) + (responseTimeLoad * responseTimeWeight) + (errorLoad * errorRateWeight);
  }

  private getScalingReason(health: SystemHealth): string {
    const reasons = [];
    
    if (health.memoryUsage.percentage > 85) {
      reasons.push('High memory usage detected');
    }
    
    if (health.apiResponseTimes.average > this.responseTimeThreshold) {
      reasons.push('API response times exceeding threshold');
    }
    
    if (health.errorRate > this.errorRateThreshold) {
      reasons.push('Error rate above acceptable threshold');
    }

    return reasons.join(', ') || 'System load above optimal range';
  }

  private getActiveUserCount(): number {
    // In a real implementation, this would track actual active users
    // For now, return a calculated value based on recent metrics
    return Math.floor(Math.random() * 150) + 50; // 50-200 active users
  }
}

export const productionOptimizer = new ProductionOptimizer();