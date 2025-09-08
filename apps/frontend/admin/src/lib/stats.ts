import { treaty } from "@elysiajs/eden";
import type { StatsRoutes } from "../../../../backend/auth/src/routes/stats";

const statsClient = treaty<StatsRoutes>("http://localhost:3010/api/auth");

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
