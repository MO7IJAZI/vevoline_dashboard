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
const isProduction = process.env.NODE_ENV === "production";

console.log(`[Session] Config: secure=${isProduction}, maxAge=${SESSION_MAX_AGE}ms`);

const databaseUrl = process.env.DATABASE_URL;
const sessionConnection = databaseUrl ? new URL(databaseUrl) : null;

app.use(
  session({
    store: new MySqlSession({
      host: sessionConnection?.hostname,
      port: sessionConnection?.port ? Number(sessionConnection.port) : undefined,
      user: sessionConnection?.username,
      password: sessionConnection?.password,
      database: sessionConnection?.pathname ? sessionConnection.pathname.slice(1) : undefined,
      createDatabaseTable: true,
      schema: {
        tableName: "session",
        columnNames: {
          session_id: "sid",
          expires: "expire",
          data: "sess",
        },
      },
    }),
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
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

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
  await initializeEmailTransporter();
  
  registerAuthRoutes(app);
  registerWorkTrackingRoutes(app);
  registerClientPortalRoutes(app);
  
  await seedAdminUser();
  
  await registerRoutes(httpServer, app);

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
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
