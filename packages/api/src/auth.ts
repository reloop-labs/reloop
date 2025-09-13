import { treaty } from "@elysiajs/eden";
import type { StatsRoutes } from "./types.js";

const port = process.env.PORT || 3010;

const statsClient = treaty<StatsRoutes>(`http://localhost:${port}/api/auth`);

export const statsApi = {
	async getUsers() {
		const { data, error } = await statsClient.stats.totalUsers.get();
		return { data, error };
	},
};

export interface UserStatsProps {
	totalUsers: number;
	timestamp: string;
	error?: string;
}
