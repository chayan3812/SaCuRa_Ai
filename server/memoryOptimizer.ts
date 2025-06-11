import { EventEmitter } from 'events';

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  percentage: number;
}

interface OptimizationConfig {
  maxMemoryThreshold: number; // Percentage
  criticalMemoryThreshold: number; // Percentage
  gcInterval: number; // Milliseconds
  cacheCleanupInterval: number; // Milliseconds
}

export class MemoryOptimizer extends EventEmitter {
  private config: OptimizationConfig;
  private memoryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private gcTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isOptimizing = false;

  constructor(config: Partial<OptimizationConfig> = {}) {
    super();
    this.config = {
      maxMemoryThreshold: 70, // Reduced from 85 to 70
      criticalMemoryThreshold: 80, // Reduced from 95 to 80
      gcInterval: 15000, // Reduced from 30s to 15s for more frequent monitoring
      cacheCleanupInterval: 30000, // Reduced from 60s to 30s for more frequent cleanup
      ...config
    };

    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Memory monitoring with garbage collection
    this.gcTimer = setInterval(() => {
      this.performMemoryCheck();
    }, this.config.gcInterval);

    // Cache cleanup
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredCache();
    }, this.config.cacheCleanupInterval);
  }

  private performMemoryCheck(): void {
    const memStats = this.getMemoryStats();
    
    if (memStats.percentage > this.config.criticalMemoryThreshold) {
      this.performCriticalOptimization();
    } else if (memStats.percentage > this.config.maxMemoryThreshold) {
      this.performStandardOptimization();
    }

    this.emit('memoryStats', memStats);
  }

  private getMemoryStats(): MemoryStats {
    const usage = process.memoryUsage();
    const percentage = (usage.heapUsed / usage.heapTotal) * 100;

    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      percentage
    };
  }

  private async performCriticalOptimization(): Promise<void> {
    if (this.isOptimizing) return;
    this.isOptimizing = true;

    try {
      console.log('🚨 Critical memory usage detected - performing emergency optimization');
      
      // Clear all non-essential caches
      this.memoryCache.clear();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Clear any large data structures
      this.clearLargeDataStructures();
      
      // Emit warning
      this.emit('criticalMemory', this.getMemoryStats());
      
    } finally {
      this.isOptimizing = false;
    }
  }

  private async performStandardOptimization(): Promise<void> {
    if (this.isOptimizing) return;
    this.isOptimizing = true;

    try {
      console.log('⚡ High memory usage - performing optimization');
      
      // Cleanup expired cache entries
      this.cleanupExpiredCache();
      
      // Trigger gentle garbage collection
      if (global.gc) {
        global.gc();
      }
      
      this.emit('optimization', this.getMemoryStats());
      
    } finally {
      this.isOptimizing = false;
    }
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    // Convert to array to avoid iterator issues
    const entries = Array.from(this.memoryCache.entries());
    
    for (const [key, value] of entries) {
      if (now - value.timestamp > value.ttl) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned ${cleanedCount} expired cache entries`);
    }
  }

  private clearLargeDataStructures(): void {
    // Clear any large in-memory structures that can be regenerated
    // This would be customized based on the application's data structures
    console.log('🗑️ Clearing large data structures for memory optimization');
  }

  // Public methods for cache management
  public cacheSet(key: string, data: any, ttl: number = 300000): void { // 5 minutes default TTL
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public cacheGet(key: string): any | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  public getCacheStats(): { size: number; keys: number } {
    const values = Array.from(this.memoryCache.values());
    return {
      size: JSON.stringify(values).length,
      keys: this.memoryCache.size
    };
  }

  public getCurrentMemoryStats(): MemoryStats {
    return this.getMemoryStats();
  }

  public forceOptimization(): void {
    this.performStandardOptimization();
  }

  public shutdown(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.memoryCache.clear();
    this.removeAllListeners();
  }
}

// Singleton instance
export const memoryOptimizer = new MemoryOptimizer({
  maxMemoryThreshold: 80,
  criticalMemoryThreshold: 90,
  gcInterval: 30000,
  cacheCleanupInterval: 60000
});

// Export memory optimization utilities
export function optimizeDataStructure<T>(data: T[]): T[] {
  // Remove duplicates and optimize array structure
  return Array.from(new Set(data.map(item => JSON.stringify(item))))
    .map(item => JSON.parse(item))
    .slice(0, 1000); // Limit to 1000 items for memory efficiency
}

export function createMemoryEfficientMap<K, V>(maxSize: number = 1000): Map<K, V> {
  const map = new Map<K, V>();
  
  const originalSet = map.set.bind(map);
  map.set = function(key: K, value: V) {
    if (this.size >= maxSize) {
      const keys = Array.from(this.keys());
      const firstKey = keys[0];
      if (firstKey !== undefined) {
        this.delete(firstKey);
      }
    }
    return originalSet(key, value);
  };
  
  return map;
}