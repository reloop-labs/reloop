"use client";

import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";
import { statsApi } from "../lib/stats";

interface UserStatsData {
	totalUsers: number;
	timestamp: string;
	error?: string;
}

export default function UserStats() {
	const [stats, setStats] = useState<UserStatsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUserStats = async () => {
			try {
				setLoading(true);
				setError(null);

				// Type-safe API call with Eden
				const { data, error } = await statsApi.getUsers();

				if (error) {
					throw new Error(`API error: ${error.value}`);
				}

				setStats(data as UserStatsData);
			} catch (err) {
				console.error("Error fetching user stats:", err);
				setError(
					err instanceof Error ? err.message : "Failed to fetch user stats",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchUserStats();

		// Refresh stats every 30 seconds
		const interval = setInterval(fetchUserStats, 30000);

		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 animate-pulse rounded-lg bg-gray-700" />
					<div className="space-y-2">
						<div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
						<div className="h-6 w-16 animate-pulse rounded bg-gray-700" />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
				<div className="flex items-center gap-3">
					<Icon name="alert-circle" className="h-10 w-10 text-red-400" />
					<div>
						<h3 className="font-medium text-red-400">Error Loading Stats</h3>
						<p className="text-red-300 text-sm">{error}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
					<Icon name="users" className="h-5 w-5 text-blue-400" />
				</div>
				<div>
					<h3 className="font-medium text-gray-300">Total Users</h3>
					<p className="font-bold text-2xl text-white">
						{stats?.totalUsers?.toLocaleString() || 0}
					</p>
					{stats?.timestamp && (
						<p className="text-gray-400 text-xs">
							Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
