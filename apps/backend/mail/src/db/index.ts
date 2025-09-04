import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
  max: 10,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
export { schema };
