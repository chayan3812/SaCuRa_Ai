import { performance } from 'perf_hooks';
import { db } from './db';

interface PerformanceMetrics {
  timestamp: Date;
  route: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
}

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

export class ProductionOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private errorCounts: Map<string, number> = new Map();
  private responseTimes: number[] = [];
  private activeConnections = 0;
  
  constructor() {
    // Initialize monitoring
    this.startHealthMonitoring();
    this.setupGracefulShutdown();
    this.optimizeMemoryUsage();
  }

  // Performance Monitoring Middleware
  public performanceMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = performance.now();
      const route = req.route?.path || req.path;
      const method = req.method;

      res.on('finish', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.recordMetric({
          timestamp: new Date(),
          route,
          method,
          responseTime,
          statusCode: res.statusCode,
          memoryUsage: process.memoryUsage().heapUsed,
          cpuUsage: process.cpuUsage().user,
          errorCount: res.statusCode >= 400 ? 1 : 0
        });

        // Log slow queries
        if (responseTime > 1000) {
          console.warn(`Slow response: ${method} ${route} - ${responseTime.toFixed(2)}ms`);
        }
      });

      next();
    };
  }

  // Error Handling Middleware
  public errorHandlingMiddleware() {
    return (error: any, req: any, res: any, next: any) => {
      const errorKey = `${req.method}:${req.path}`;
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

      // Log critical errors
      if (error.status >= 500 || !error.status) {
        console.error('Critical error:', {
          error: error.message,
          stack: error.stack,
          route: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }

      // Return standardized error response
      const isDevelopment = process.env.NODE_ENV === 'development';
      res.status(error.status || 500).json({
        message: error.message || 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
      });
    };
  }

  // Rate Limiting
  public rateLimitMiddleware(maxRequests: number = 100, windowMs: number = 60000) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: any, res: any, next: any) => {
      const clientId = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      const clientRequests = requests.get(clientId) || { count: 0, resetTime: now + windowMs };

      if (now > clientRequests.resetTime) {
        clientRequests.count = 0;
        clientRequests.resetTime = now + windowMs;
      }

      if (clientRequests.count >= maxRequests) {
        return res.status(429).json({
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((clientRequests.resetTime - now) / 1000)
        });
      }

      clientRequests.count++;
      requests.set(clientId, clientRequests);
      next();
    };
  }

  // Database Connection Monitoring
  public async monitorDatabaseHealth(): Promise<{
    status: 'connected' | 'disconnected' | 'slow';
    responseTime: number;
    activeConnections: number;
  }> {
    try {
      const startTime = performance.now();
      await db.execute('SELECT 1');
      const responseTime = performance.now() - startTime;

      return {
        status: responseTime > 1000 ? 'slow' : 'connected',
        responseTime,
        activeConnections: this.activeConnections
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'disconnected',
        responseTime: -1,
        activeConnections: 0
      };
    }
  }

  // System Health Check
  public async getSystemHealth(): Promise<SystemHealth> {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    const dbHealth = await this.monitorDatabaseHealth();
    
    // Calculate metrics
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;
    
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);
    
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    const totalRequests = this.metrics.length;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    // Determine system status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (errorRate > 10 || memUsage.heapUsed / memUsage.heapTotal > 0.9 || dbHealth.status === 'disconnected') {
      status = 'critical';
    } else if (errorRate > 5 || avgResponseTime > 1000 || memUsage.heapUsed / memUsage.heapTotal > 0.7) {
      status = 'warning';
    }

    return {
      status,
      uptime,
      memoryUsage: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      databaseConnections: {
        active: dbHealth.activeConnections,
        idle: 0,
        waiting: 0
      },
      apiResponseTimes: {
        average: avgResponseTime,
        p95: sortedTimes[p95Index] || 0,
        p99: sortedTimes[p99Index] || 0
      },
      errorRate,
      activeUsers: this.getActiveUserCount()
    };
  }

  // Auto-scaling simulation
  public async checkAutoScaling(): Promise<{
    shouldScale: boolean;
    reason: string;
    recommendedAction: string;
  }> {
    const health = await this.getSystemHealth();
    
    if (health.memoryUsage.percentage > 85) {
      return {
        shouldScale: true,
        reason: 'High memory usage detected',
        recommendedAction: 'Scale up server resources or optimize memory usage'
      };
    }
    
    if (health.apiResponseTimes.average > 2000) {
      return {
        shouldScale: true,
        reason: 'High response times detected',
        recommendedAction: 'Scale up server instances or optimize database queries'
      };
    }
    
    if (health.errorRate > 5) {
      return {
        shouldScale: true,
        reason: 'High error rate detected',
        recommendedAction: 'Investigate errors and consider horizontal scaling'
      };
    }

    return {
      shouldScale: false,
      reason: 'System performance within normal parameters',
      recommendedAction: 'Continue monitoring'
    };
  }

  // Performance optimization recommendations
  public generateOptimizationRecommendations(): {
    category: string;
    issue: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }[] {
    const recommendations = [];
    
    // Check response times
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;
    
    if (avgResponseTime > 500) {
      recommendations.push({
        category: 'Performance',
        issue: 'High average response time',
        recommendation: 'Implement caching, optimize database queries, or consider CDN',
        priority: 'high' as const
      });
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    if (memPercentage > 70) {
      recommendations.push({
        category: 'Memory',
        issue: 'High memory usage',
        recommendation: 'Optimize data structures, implement garbage collection tuning',
        priority: 'medium' as const
      });
    }

    // Check error patterns
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    if (totalErrors > 10) {
      recommendations.push({
        category: 'Reliability',
        issue: 'High error count',
        recommendation: 'Implement better error handling and monitoring',
        priority: 'high' as const
      });
    }

    return recommendations;
  }

  // Private helper methods
  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    this.responseTimes.push(metric.responseTime);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  private getActiveUserCount(): number {
    // Estimate based on recent requests (last 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > fiveMinutesAgo
    );
    
    // Rough estimate: unique routes accessed in last 5 minutes
    const uniqueRoutes = new Set(recentMetrics.map(m => m.route));
    return uniqueRoutes.size;
  }

  private startHealthMonitoring() {
    // Monitor system health every 30 seconds
    setInterval(async () => {
      const health = await this.getSystemHealth();
      
      if (health.status === 'critical') {
        console.error('CRITICAL: System health degraded', health);
      } else if (health.status === 'warning') {
        console.warn('WARNING: System performance issues detected', health);
      }
      
      // Auto-scaling check
      const scalingCheck = await this.checkAutoScaling();
      if (scalingCheck.shouldScale) {
        console.log('SCALING RECOMMENDATION:', scalingCheck);
      }
    }, 30000);
  }

  private setupGracefulShutdown() {
    const gracefulShutdown = (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      
      // Allow existing requests to complete
      setTimeout(() => {
        console.log('Graceful shutdown completed');
        process.exit(0);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  private optimizeMemoryUsage() {
    // Force garbage collection every 5 minutes
    setInterval(() => {
      if (global.gc) {
        global.gc();
        console.log('Garbage collection executed');
      }
    }, 5 * 60 * 1000);
  }

  // Cache management
  private cache = new Map<string, { data: any; expiry: number }>();
  
  public setCache(key: string, data: any, ttlMs: number = 300000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  public getCache(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  public clearExpiredCache() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const productionOptimizer = new ProductionOptimizer();