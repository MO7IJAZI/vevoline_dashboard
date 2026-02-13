import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


export function serveStatic(app: Express) {
  // In production, we expect to be running from the project root
  // The client build is in dist/public
  // We try multiple paths to be robust across different deployment structures
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "public"),
  ];

  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    console.error("Checked paths:", possiblePaths);
    throw new Error(
      `Could not find the build directory. Checked: ${possiblePaths.join(", ")}`,
    );
  }

  console.log(`[Static] Serving files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
