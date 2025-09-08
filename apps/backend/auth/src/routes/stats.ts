import { count } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "../db/pg";
import { user } from "../db/schema/auth";

export const statsRoutes = new Elysia({ prefix: "/stats" }).get(
	"/totalUsers",
	async () => {
		try {
			const result = await db.select({ total: count() }).from(user);

			const totalUsers = result[0]?.total || 0;

			return {
				totalUsers,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("❌ Error fetching user count:", error);
			console.error("🔍 Error details:", {
				message: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return {
				error: "Failed to fetch user count",
				totalUsers: 0,
				timestamp: new Date().toISOString(),
			};
		}
	},
);

export type StatsRoutes = typeof statsRoutes;
