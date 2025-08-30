import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { StartupManager } from "./services/startupManager";
import path from "path";
import fs from "fs";

// Simple log function that works in all environments
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  console.log("🚀 Starting AIForecast Hub (Professional Edition) - FIXED v1.0.2");
  console.log("🔧 FIXED: Removed vite import causing production errors");
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}, Port: ${parseInt(process.env.PORT || '3000', 10)}`);
  
  // Initialize startup manager
  const startupManager = new StartupManager(storage);
  
  try {
    // Phase 1: Critical startup (must succeed)
    await startupManager.initializeCritical();
    console.log("✅ Critical initialization complete");
  } catch (error) {
    console.error("❌ Critical startup failed:", error);
    process.exit(1);
  }
  
  // Phase 2: Register routes and setup server
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup based on environment
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`🔧 Environment detection: NODE_ENV=${process.env.NODE_ENV}, isProduction=${isProduction}`);
  
  if (isProduction) {
    // Production static serving - no vite dependencies
    const distPath = path.resolve(process.cwd(), "dist", "public");
    console.log(`📁 Looking for frontend files at: ${distPath}`);
    
    if (!fs.existsSync(distPath)) {
      console.error(`❌ Frontend build not found at: ${distPath}`);
      console.log("📋 Current working directory:", process.cwd());
      console.log("📋 Directory contents:", fs.readdirSync(process.cwd()));
      if (fs.existsSync(path.join(process.cwd(), "dist"))) {
        console.log("📋 Dist directory contents:", fs.readdirSync(path.join(process.cwd(), "dist")));
      }
      throw new Error(`Frontend build not found at: ${distPath}`);
    }
    
    // Log files in dist/public for debugging
    console.log("📁 Frontend files found:", fs.readdirSync(distPath));
    
    // Serve static files with proper cache headers
    app.use(express.static(distPath, {
      maxAge: '1h',
      etag: true,
      index: false
    }));
    
    // Serve index.html for all non-API routes (SPA routing)
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        console.log(`📄 Serving index.html for: ${req.path}`);
        res.sendFile(path.resolve(distPath, "index.html"));
      }
    });
    
    console.log("✅ Production static file serving configured");
  } else {
    // Only import vite in development
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
    console.log("✅ Vite development server configured");
  }

  // Start server
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Server running on port ${port}`);
    console.log("🎯 Application ready - all systems operational");
    
    // Phase 3: Heavy initialization (background, non-blocking)
    startupManager.initializeHeavy().catch(error => {
      console.error("⚠️ Background initialization failed (non-critical):", error);
    });
  });
})();