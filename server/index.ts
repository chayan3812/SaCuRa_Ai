import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializePageWatcher } from "./pageWatcher";
import { initializeContentScheduler } from "./contentScheduler";
import { productionOptimizer } from "./productionOptimizer";
import { systemOptimizer } from "./systemOptimizer";
import cron from "node-cron";
import { autoBoostRunnerWithRetry } from "./cron/autoBoostRunner";

const app = express();

// Security headers middleware
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HTTPS enforcement (will be enforced by Replit in production)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://graph.facebook.com; " +
    "frame-ancestors 'none';"
  );
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Production optimization monitoring (no middleware needed)
// productionOptimizer runs automatically in the background

// Disable system optimizer temporarily to resolve startup issues
// systemOptimizer.on('optimization', (event) => {
//   console.log(`System optimization executed: ${event.type} at ${event.timestamp}`);
// });

// systemOptimizer.on('memory-leak-detected', (event) => {
//   console.warn(`Memory leak detected: ${event.trend * 100}% growth, current heap: ${(event.currentHeap / 1024 / 1024).toFixed(2)}MB`);
// });

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Production error handling
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Production error:', err);
    res.status(500).json({ message: 'Internal server error' });
  });

  // Initialize Page Watcher Engine
  try {
    initializePageWatcher({
      checkInterval: 10, // 10 minutes
      alertThreshold: 3,
      enableEmailAlerts: true,
      enableSlackAlerts: false
    });
    log("Page Watcher Engine started successfully");
  } catch (error) {
    log("Failed to start Page Watcher Engine: " + error);
  }

  // Initialize Content Scheduler
  try {
    initializeContentScheduler({
      enabled: true,
      checkInterval: '*/5 * * * *', // Every 5 minutes
      maxRetries: 3,
      retryDelay: 30
    });
    log("Content Scheduler started successfully");
  } catch (error) {
    log("Failed to start Content Scheduler: " + error);
  }

  // Initialize AutoContentRunner - AI content generation and posting
  try {
    const { autoContentRunnerWithRetry } = await import('./cron/autoContentRunner');
    
    // Run every 4 hours for users with autopilot enabled
    cron.schedule('0 */4 * * *', async () => {
      log("🤖 AutoContentRunner executing AI content generation...");
      try {
        await autoContentRunnerWithRetry(3);
        log("✅ AutoContentRunner completed successfully");
      } catch (error) {
        log("❌ AutoContentRunner failed: " + error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
    log("🚀 AutoContentRunner scheduled for execution every 4 hours");
  } catch (error) {
    log("Failed to initialize AutoContentRunner: " + error);
  }

  // Initialize Automated Boost Runner - Daily execution at 9am
  try {
    cron.schedule('0 9 * * *', async () => {
      log("🔁 AutoBoost Runner executing daily boost checks...");
      try {
        await autoBoostRunnerWithRetry(3);
        log("✅ AutoBoost Runner completed successfully");
      } catch (error) {
        log("❌ AutoBoost Runner failed: " + error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
    log("🚀 AutoBoost Runner scheduled for daily execution at 9:00 AM EST");
  } catch (error) {
    log("Failed to initialize AutoBoost Runner: " + error);
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
