import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables!");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export { pool };
export const db = drizzle(pool);
