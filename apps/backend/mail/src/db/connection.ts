import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// PostgreSQL connection pool
const pool = new Pool({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: parseInt(process.env.PGPORT || "5432"),
});

// Test DB connection
pool.on("connect", () => {
	console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
	console.error("Error connecting to PostgreSQL:", err);
	process.exit(1);
});

// Drizzle ORM instance
export const db = drizzle(pool, { schema });

export { pool };
