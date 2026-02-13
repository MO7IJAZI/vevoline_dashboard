import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectMySql from "express-mysql-session";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { registerAuthRoutes, seedAdminUser } from "./auth";
import { registerWorkTrackingRoutes } from "./workTracking";
import { registerClientPortalRoutes } from "./clientPortal";
import { initializeEmailTransporter } from "./email";
import { pool } from "./db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Trust proxy is required for secure cookies to work properly behind load balancers/proxies
app.set("trust proxy", 1);

const MySqlSession = connectMySql(session as any);

const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || String(8 * 60 * 60 * 1000)); // Default 8 hours
// In some hosting environments like Hostinger, NODE_ENV might not be set correctly in the shell.
// We can also check if we're running from the bundled dist directory.
const isProduction = process.env.NODE_ENV === "production" || process.argv[1].includes("dist");

console.log(`[Server] Environment: ${isProduction ? "production" : "development"}`);
console.log(`[Session] Config: secure=${isProduction}, maxAge=${SESSION_MAX_AGE}ms`);

const databaseUrl = process.env.DATABASE_URL;
let sessionConfig: any = {
  host: "localhost",
  port: 3306,
  user: "",
  password: "",
  database: ""
};

if (databaseUrl) {
  try {
    // Try standard URL parsing
    const url = new URL(databaseUrl);
    sessionConfig = {
      host: url.hostname || "localhost",
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username) || "",
      password: decodeURIComponent(url.password) || "",
      database: url.pathname ? url.pathname.slice(1) : ""
    };
  } catch (err) {
    log("[Session] Standard URL parsing failed, attempting manual regex parsing for DATABASE_URL");
    // Manual parsing for complex passwords with special characters like '?'
    const regex = /mysql:\/\/([^:]+):(.*)@([^:/]+)(?::(\d+))?\/(.+)/;
    const match = databaseUrl.match(regex);
    if (match) {
      sessionConfig = {
        user: decodeURIComponent(match[1]),
        password: decodeURIComponent(match[2]),
        host: match[3],
        port: match[4] ? Number(match[4]) : 3306,
        database: match[5]
      };
      log("[Session] Manual regex parsing successful");
    } else {
      console.error("[Session] All DATABASE_URL parsing attempts failed");
    }
  }
}

const sessionStore = new MySqlSession({
  ...sessionConfig,
  createDatabaseTable: true,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "vevoline-dashboard-secret-key",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset session expiry on each request (inactivity timeout)
    cookie: {
      secure: "auto",
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      sameSite: "lax",
    },
  })
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toISOString();
  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log("Starting server initialization...");
    
    // Test database connection early
    try {
      log("Testing database connection...");
      const connection = await pool.getConnection();
      log("✅ Database connection successful");
      connection.release();
    } catch (dbErr) {
      console.error("❌ DATABASE CONNECTION FAILED:", dbErr);
      // In production (Hostinger), we don't necessarily want to kill the process immediately
      // if the DB is just temporarily down, but it's a critical error.
    }

    await initializeEmailTransporter();
    
    registerAuthRoutes(app);
    registerWorkTrackingRoutes(app);
    registerClientPortalRoutes(app);
    
    log("Seeding admin user...");
    try {
      await seedAdminUser();
      log("✅ Admin user seeding checked");
    } catch (seedErr) {
      console.error("⚠️ Seeding admin user failed (continuing anyway):", seedErr);
    }
    
    log("Registering routes...");
    try {
      await registerRoutes(httpServer, app);
      log("✅ Routes registered");
    } catch (routeErr) {
      console.error("❌ CRITICAL: Failed to register routes:", routeErr);
      throw routeErr;
    }

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Internal Server Error:", err);

      if (res.headersSent) {
        return next(err);
      }

      return res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (isProduction) {
      log("Setting up static file serving (Production Mode)");
      serveStatic(app);
    } else {
      log("Setting up Vite development server (Development Mode)");
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const PORT = Number(process.env.PORT) || 5000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });
  } catch (err) {
    console.error("CRITICAL ERROR DURING STARTUP:", err);
    // Log process details to help debug environment issues
    console.error("Process Details:", {
      cwd: process.cwd(),
      nodeVersion: process.version,
      platform: process.platform,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL
      }
    });
    process.exit(1);
  }
})();
