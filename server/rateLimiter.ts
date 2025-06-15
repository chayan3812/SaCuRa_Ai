/**
 * SaCuRa AI Platform - Rate Limiting Middleware
 * Protects API endpoints from abuse and DoS attacks
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Store for tracking rate limit violations
const violationStore = new Map<string, { count: number, lastViolation: Date }>();

/**
 * Custom rate limit handler with logging and enhanced security
 */
const rateLimitHandler = (req: Request, res: Response) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const endpoint = req.path;
  
  // Track violations for security monitoring
  const violation = violationStore.get(clientIP) || { count: 0, lastViolation: new Date() };
  violation.count++;
  violation.lastViolation = new Date();
  violationStore.set(clientIP, violation);
  
  console.log(`Rate limit exceeded - IP: ${clientIP}, Endpoint: ${endpoint}, Violations: ${violation.count}`);
  
  // Enhanced response for rate limiting
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'API rate limit exceeded. Please try again later.',
    retryAfter: '60 seconds',
    timestamp: new Date().toISOString(),
    endpoint: endpoint
  });
};

/**
 * Generate unique key for rate limiting based on IP
 */
const keyGenerator = (req: Request) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// General API rate limiter - applies to all API routes
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skipSuccessfulRequests: false
});

// Heavy operation limiter for AI and processing endpoints
export const aiProcessingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 AI requests per 5 minutes
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator
});

// Facebook API limiter to prevent excessive calls
export const facebookApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 Facebook API calls per 10 minutes
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator
});

// Webhook limiter for incoming webhooks
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 webhook requests per minute
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const signature = req.get('X-Hub-Signature-256') || 'no-signature';
    return `webhook-${clientIP}-${signature.slice(0, 10)}`;
  },
  skipSuccessfulRequests: false
});

// Database operation limiter
export const databaseLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 50, // 50 database operations per 2 minutes
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator
});

// Very strict limiter for admin operations
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 admin operations per hour
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skipSuccessfulRequests: false
});

/**
 * Get rate limit violation statistics
 */
export const getRateLimitStats = () => {
  const stats = {
    totalViolations: 0,
    uniqueIPs: violationStore.size,
    recentViolations: 0,
    topViolators: [] as Array<{ip: string, count: number, lastViolation: Date}>
  };
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Convert Map entries to array for iteration
  const entries = Array.from(violationStore.entries());
  
  for (const [ip, violation] of entries) {
    stats.totalViolations += violation.count;
    
    if (violation.lastViolation > oneDayAgo) {
      stats.recentViolations += violation.count;
    }
    
    stats.topViolators.push({
      ip,
      count: violation.count,
      lastViolation: violation.lastViolation
    });
  }
  
  // Sort by violation count (top violators first)
  stats.topViolators.sort((a, b) => b.count - a.count);
  stats.topViolators = stats.topViolators.slice(0, 10);
  
  return stats;
};

/**
 * Clean up old violation records (run periodically)
 */
export const cleanupViolationStore = () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Convert Map entries to array for iteration
  const entries = Array.from(violationStore.entries());
  
  for (const [ip, violation] of entries) {
    if (violation.lastViolation < oneWeekAgo) {
      violationStore.delete(ip);
    }
  }
  
  console.log(`Cleaned up old rate limit violations. Current tracked IPs: ${violationStore.size}`);
};

// Clean up violations weekly
setInterval(cleanupViolationStore, 7 * 24 * 60 * 60 * 1000);

export default {
  generalApiLimiter,
  authLimiter,
  aiProcessingLimiter,
  facebookApiLimiter,
  webhookLimiter,
  databaseLimiter,
  adminLimiter,
  getRateLimitStats,
  cleanupViolationStore
};