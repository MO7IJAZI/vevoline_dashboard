import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment variables!");
}

function getPoolConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return { uri: "" };

  try {
    // Try standard URI parsing first
    new URL(databaseUrl);
    return { 
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
  } catch (err) {
    console.log("[DB] Standard URI parsing failed, attempting manual regex parsing for DATABASE_URL");
    // Manual parsing for complex passwords with special characters like '?'
    const regex = /mysql:\/\/([^:]+):(.*)@([^:/]+)(?::(\d+))?\/(.+)/;
    const match = databaseUrl.match(regex);
    if (match) {
      return {
        user: decodeURIComponent(match[1]),
        password: decodeURIComponent(match[2]),
        host: match[3],
        port: match[4] ? Number(match[4]) : 3306,
        database: match[5],
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      };
    }
    return { uri: databaseUrl }; // Fallback to raw URI
  }
}

const pool = mysql.createPool(getPoolConfig());

export { pool };
export const db = drizzle(pool);
