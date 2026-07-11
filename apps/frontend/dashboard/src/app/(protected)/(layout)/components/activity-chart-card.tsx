"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import useSWR from "swr";

interface EmailStatsResponse {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	rate: number[];
}

export function ActivityChartCard() {
	const { activeOrganization } = useUserOrganization();
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const [hasSize, setHasSize] = useState(false);

	// Only render the chart once the container has real (non-zero) dimensions,
	// otherwise recharts' ResponsiveContainer measures 0x0 and warns.
	useEffect(() => {
		const el = chartContainerRef.current;
		if (!el) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				setHasSize(width > 0 && height > 0);
			}
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	// Date range for the 7-day activity graph
	const { start_date, end_date } = useMemo(() => {
		const now = new Date();
		const toDate = new Date(now);
		toDate.setHours(23, 59, 59, 999);
		const fromDate = new Date(now);
		fromDate.setDate(now.getDate() - 6); // 7 days inclusive
		fromDate.setHours(0, 0, 0, 0);
		return {
			start_date: fromDate.toISOString(),
			end_date: toDate.toISOString(),
		};
	}, []);

	const { data: emailStatsData } = useSWR<EmailStatsResponse>(
		activeOrganization?.id
			? `/api/logs/v1/emails/stats?start_date=${start_date}&end_date=${end_date}`
			: null,
	);

	// Calculate chart data from API stats, aligning to a continuous 7-day timeline in UTC
	const chartData = useMemo(() => {
		const days: { key: string; label: string }[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setUTCDate(d.getUTCDate() - i);
			const year = d.getUTCFullYear();
			const monthStr = String(d.getUTCMonth() + 1).padStart(2, "0");
			const dayStr = String(d.getUTCDate()).padStart(2, "0");
			days.push({
				key: `${year}-${monthStr}-${dayStr}`,
				label: `${monthStr}/${dayStr}`,
			});
		}

		// Map API dates/values to a lookup map of YYYY-MM-DD -> sent count
		const statsMap = new Map<string, number>();
		if (emailStatsData?.dates && emailStatsData?.sent) {
			emailStatsData.dates.forEach((dateStr, idx) => {
				const date = new Date(dateStr);
				const year = date.getUTCFullYear();
				const monthStr = String(date.getUTCMonth() + 1).padStart(2, "0");
				const dayStr = String(date.getUTCDate()).padStart(2, "0");
				const key = `${year}-${monthStr}-${dayStr}`;
				statsMap.set(key, emailStatsData.sent[idx] || 0);
			});
		}

		// Reconstruct the 7 points, filling with 0 if no data exists
		return days.map((day) => ({
			date: day.label,
			count: statsMap.get(day.key) || 0,
		}));
	}, [emailStatsData]);

	const totalActivityCount = useMemo(() => {
		return chartData.reduce((sum, item) => sum + item.count, 0);
	}, [chartData]);

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href="/emails"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="fat-row" className="h-4 w-4 shrink-0" />
					<span>Activity</span>
				</Link>

				<div className="flex items-center gap-1.5">
					<Link
						href="/emails"
						className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>

			{/* Body Container */}
			<div className="-mt-1.5 flex h-[250px] flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white p-5 dark:border-white/5 dark:bg-white/[0.01]">
				<div className="flex items-center justify-between pb-4">
					<div>
						<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
							Emails Sent - Last 7 Days
						</h3>
						<p className="text-text-sub-600 text-xs dark:text-white/50">
							Total emails sent by this organization
						</p>
					</div>
					<div className="text-right">
						<span className="font-bold text-text-strong-950 text-xl dark:text-white">
							{totalActivityCount}
						</span>
						<p className="font-medium text-[10px] text-text-soft-400 uppercase dark:text-white/40">
							Total Sent
						</p>
					</div>
				</div>

				{/* Area Chart Container */}
				<div ref={chartContainerRef} className="h-[150px] w-full">
					{hasSize && (
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={chartData}
								margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
							>
								<defs>
									<linearGradient
										id="activityGradient"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
										<stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="currentColor"
									strokeOpacity={0.04}
									vertical={false}
								/>
								<XAxis
									dataKey="date"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#888888", opacity: 0.6, fontSize: 10 }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#888888", opacity: 0.6, fontSize: 10 }}
								/>
								<Tooltip
									contentStyle={{
										background: "#18181b",
										borderColor: "#27272a",
										borderRadius: "8px",
										color: "#ffffff",
										fontSize: "12px",
									}}
								/>
								<Area
									type="monotone"
									dataKey="count"
									name="Emails Sent"
									stroke="#F97316"
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#activityGradient)"
									isAnimationActive={true}
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>
		</div>
	);
}
