import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializePageWatcher } from "./pageWatcher";
import { initializeContentScheduler } from "./contentScheduler";
import { productionOptimizer } from "./productionOptimizer";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Production optimization middleware
app.use(productionOptimizer.performanceMiddleware());
app.use(productionOptimizer.rateLimitMiddleware(1000, 60000)); // 1000 requests per minute

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

  // Production error handling middleware
  app.use(productionOptimizer.errorHandlingMiddleware());

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
