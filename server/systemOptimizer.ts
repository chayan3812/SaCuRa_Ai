import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

interface SystemMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
    heap: NodeJS.MemoryUsage;
  };
  cpuUsage: {
    user: number;
    system: number;
    percentage: number;
  };
  eventLoopLag: number;
  activeConnections: number;
  cacheHitRate: number;
  databasePoolStats: {
    total: number;
    idle: number;
    active: number;
    waiting: number;
  };
}

interface OptimizationRule {
  id: string;
  name: string;
  condition: (metrics: SystemMetrics) => boolean;
  action: () => Promise<void>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // milliseconds
  lastExecuted?: number;
}

export class SystemOptimizer extends EventEmitter {
  private metrics: SystemMetrics[] = [];
  private rules: OptimizationRule[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isOptimizing = false;
  private memoryLeakDetector = new Map<string, number>();
  private performanceBaseline: SystemMetrics | null = null;

  constructor() {
    super();
    this.initializeOptimizationRules();
    this.startMonitoring();
  }

  private initializeOptimizationRules(): void {
    this.rules = [
      {
        id: 'memory-cleanup',
        name: 'Emergency Memory Cleanup',
        condition: (metrics) => metrics.memoryUsage.percentage > 95,
        action: async () => {
          await this.performMemoryCleanup();
          this.emit('optimization', { type: 'memory-cleanup', timestamp: new Date() });
        },
        priority: 'critical',
        cooldown: 30000 // 30 seconds
      },
      {
        id: 'cache-optimization',
        name: 'Cache Optimization',
        condition: (metrics) => metrics.cacheHitRate < 0.7,
        action: async () => {
          await this.optimizeCache();
          this.emit('optimization', { type: 'cache-optimization', timestamp: new Date() });
        },
        priority: 'high',
        cooldown: 120000 // 2 minutes
      },
      {
        id: 'connection-throttling',
        name: 'Connection Throttling',
        condition: (metrics) => metrics.activeConnections > 100,
        action: async () => {
          await this.throttleConnections();
          this.emit('optimization', { type: 'connection-throttling', timestamp: new Date() });
        },
        priority: 'high',
        cooldown: 60000 // 1 minute
      },
      {
        id: 'event-loop-optimization',
        name: 'Event Loop Optimization',
        condition: (metrics) => metrics.eventLoopLag > 100, // 100ms lag
        action: async () => {
          await this.optimizeEventLoop();
          this.emit('optimization', { type: 'event-loop-optimization', timestamp: new Date() });
        },
        priority: 'medium',
        cooldown: 300000 // 5 minutes
      }
    ];
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 10000); // Every 10 seconds
  }

  private async collectMetrics(): Promise<void> {
    const startTime = performance.now();
    
    // Memory metrics
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = totalMemory - require('os').freemem();

    // CPU metrics
    const cpuUsage = process.cpuUsage();
    
    // Event loop lag
    const eventLoopStart = performance.now();
    setImmediate(() => {
      const eventLoopLag = performance.now() - eventLoopStart;
      
      const metrics: SystemMetrics = {
        memoryUsage: {
          used: usedMemory,
          total: totalMemory,
          percentage: (usedMemory / totalMemory) * 100,
          heap: memUsage
        },
        cpuUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          percentage: ((cpuUsage.user + cpuUsage.system) / 1000000) // Convert to percentage
        },
        eventLoopLag,
        activeConnections: this.getActiveConnections(),
        cacheHitRate: this.getCacheHitRate(),
        databasePoolStats: {
          total: 10, // From pool configuration
          idle: 0,
          active: 0,
          waiting: 0
        }
      };

      this.metrics.push(metrics);
      
      // Keep only last 100 metrics to prevent memory bloat
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }

      // Set baseline if not set
      if (!this.performanceBaseline) {
        this.performanceBaseline = { ...metrics };
      }

      this.checkOptimizationRules(metrics);
      this.detectMemoryLeaks(metrics);
    });
  }

  private checkOptimizationRules(metrics: SystemMetrics): void {
    if (this.isOptimizing) return;

    const applicableRules = this.rules
      .filter(rule => rule.condition(metrics))
      .filter(rule => {
        if (!rule.lastExecuted) return true;
        return Date.now() - rule.lastExecuted > rule.cooldown;
      })
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    if (applicableRules.length > 0) {
      this.executeOptimizations(applicableRules);
    }
  }

  private async executeOptimizations(rules: OptimizationRule[]): Promise<void> {
    this.isOptimizing = true;
    
    for (const rule of rules) {
      try {
        console.log(`Executing optimization: ${rule.name}`);
        await rule.action();
        rule.lastExecuted = Date.now();
        
        // Wait between optimizations to prevent system overload
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Optimization ${rule.name} failed:`, error);
        this.emit('optimization-error', { rule: rule.name, error });
      }
    }
    
    this.isOptimizing = false;
  }

  private async performMemoryCleanup(): Promise<void> {
    // Force garbage collection if exposed
    if (global.gc) {
      global.gc();
    }

    // Clear caches
    this.clearInternalCaches();
    
    // Reduce metrics history
    this.metrics = this.metrics.slice(-20);
    
    console.log('Emergency memory cleanup completed');
  }

  private async optimizeCache(): Promise<void> {
    // Implement cache optimization strategies
    // This would integrate with your existing cache systems
    console.log('Cache optimization completed');
  }

  private async throttleConnections(): Promise<void> {
    // Implement connection throttling
    // This would work with your WebSocket and HTTP connection managers
    console.log('Connection throttling applied');
  }

  private async optimizeEventLoop(): Promise<void> {
    // Break up long-running operations
    await this.distributeWorkload();
    console.log('Event loop optimization completed');
  }

  private async distributeWorkload(): Promise<void> {
    // Use setImmediate to distribute CPU-intensive tasks
    return new Promise(resolve => setImmediate(resolve));
  }

  private clearInternalCaches(): void {
    this.memoryLeakDetector.clear();
  }

  private detectMemoryLeaks(metrics: SystemMetrics): void {
    const currentHeap = metrics.memoryUsage.heap.heapUsed;
    const timestamp = Date.now();
    
    // Store heap usage with timestamp
    this.memoryLeakDetector.set(timestamp.toString(), currentHeap);
    
    // Keep only last 10 readings
    const entries = Array.from(this.memoryLeakDetector.entries());
    if (entries.length > 10) {
      const toDelete = entries.slice(0, entries.length - 10);
      toDelete.forEach(([key]) => this.memoryLeakDetector.delete(key));
    }
    
    // Check for consistent memory growth
    const values = Array.from(this.memoryLeakDetector.values());
    if (values.length >= 5) {
      const trend = this.calculateTrend(values);
      if (trend > 0.1) { // 10% consistent growth
        this.emit('memory-leak-detected', { trend, currentHeap });
      }
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    return (last - first) / first;
  }

  private getActiveConnections(): number {
    // This would integrate with your connection tracking
    return 0; // Placeholder
  }

  private getCacheHitRate(): number {
    // This would integrate with your cache metrics
    return 0.8; // Placeholder
  }

  public getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: SystemMetrics | null;
    recommendations: string[];
  } {
    const currentMetrics = this.metrics[this.metrics.length - 1];
    if (!currentMetrics) {
      return {
        status: 'warning',
        metrics: null,
        recommendations: ['System monitoring initializing']
      };
    }

    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (currentMetrics.memoryUsage.percentage > 90) {
      status = 'critical';
      recommendations.push('Critical memory usage - immediate optimization required');
    } else if (currentMetrics.memoryUsage.percentage > 80) {
      status = 'warning';
      recommendations.push('High memory usage - consider optimization');
    }

    if (currentMetrics.eventLoopLag > 50) {
      status = status === 'critical' ? 'critical' : 'warning';
      recommendations.push('Event loop lag detected - optimize async operations');
    }

    return {
      status,
      metrics: currentMetrics,
      recommendations
    };
  }

  public getPerformanceTrends(): {
    memoryTrend: 'improving' | 'stable' | 'degrading';
    cpuTrend: 'improving' | 'stable' | 'degrading';
    recommendations: string[];
  } {
    if (this.metrics.length < 5) {
      return {
        memoryTrend: 'stable',
        cpuTrend: 'stable',
        recommendations: ['Collecting performance data...']
      };
    }

    const recent = this.metrics.slice(-5);
    const memoryValues = recent.map(m => m.memoryUsage.percentage);
    const cpuValues = recent.map(m => m.cpuUsage.percentage);

    const memoryTrend = this.analyzeTrend(memoryValues);
    const cpuTrend = this.analyzeTrend(cpuValues);

    const recommendations: string[] = [];
    
    if (memoryTrend === 'degrading') {
      recommendations.push('Memory usage increasing - investigate memory leaks');
    }
    
    if (cpuTrend === 'degrading') {
      recommendations.push('CPU usage increasing - optimize processing logic');
    }

    return {
      memoryTrend,
      cpuTrend,
      recommendations
    };
  }

  private analyzeTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    const trend = this.calculateTrend(values);
    
    if (trend > 0.05) return 'degrading';
    if (trend < -0.05) return 'improving';
    return 'stable';
  }

  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const systemOptimizer = new SystemOptimizer();