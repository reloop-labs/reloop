"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Select from "@reloop/ui/select";
import { useMemo, useState } from "react";
import {
	Area,
	CartesianGrid,
	ComposedChart,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import useSWR from "swr";

import {
	formatDateLabel,
	generateContinuousDateList,
	getLocalKey,
	getYearMonthDayKey,
} from "../utils";

interface EmailStatsResponse {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	rate: number[];
}

interface DeliverabilityChartProps {
	startDate: string;
	endDate: string;
	domain: string;
}

export const DeliverabilityChart = ({
	startDate,
	endDate,
	domain,
}: DeliverabilityChartProps) => {
	const { activeOrganization } = useUserOrganization();
	const [eventType, setEventType] = useState("all");

	const buildApiUrl = () => {
		if (!activeOrganization?.id) return null;

		const params = new URLSearchParams();
		if (startDate) params.set("start_date", startDate);
		if (endDate) params.set("end_date", endDate);
		if (domain && domain !== "all") params.set("domain_id", domain);

		return `/api/logs/v1/emails/stats?${params.toString()}`;
	};

	const { data, isLoading } = useSWR<EmailStatsResponse>(buildApiUrl());

	const chartData = useMemo(() => {
		if (!data) return [];

		const statsMap = new Map<
			string,
			{
				sent: number;
				delivered: number;
				bounced: number;
				complaint: number;
				rate: number;
			}
		>();

		for (let i = 0; i < data.dates.length; i++) {
			const dateStr = data.dates[i];
			if (!dateStr) continue;
			const key = getLocalKey(dateStr);
			if (key) {
				statsMap.set(key, {
					sent: data.sent[i] ?? 0,
					delivered: data.delivered[i] ?? 0,
					bounced: data.bounced[i] ?? 0,
					complaint: data.complaint[i] ?? 0,
					rate: data.rate[i] ?? 0,
				});
			}
		}

		const datesList = generateContinuousDateList(data, startDate, endDate);

		return datesList.map((date) => {
			const key = getYearMonthDayKey(date);
			const formattedDate = formatDateLabel(date);
			const existing = statsMap.get(key);

			return {
				date: formattedDate,
				sent: existing?.sent ?? 0,
				delivered: existing?.delivered ?? 0,
				bounced: existing?.bounced ?? 0,
				complaint: existing?.complaint ?? 0,
				rate: existing?.rate ?? 0,
			};
		});
	}, [data, startDate, endDate]);

	const maxSentValue = useMemo(() => {
		if (!data || data.sent.length === 0) return 10;
		const max = Math.max(...data.sent);
		return max > 0 ? max : 10;
	}, [data]);

	if (isLoading) {
		return (
			<div className="w-full animate-pulse rounded-2xl border border-stroke-soft-100 bg-transparent p-6 dark:border-stroke-soft-100/50">
				<div className="mb-8 flex justify-between">
					<div className="flex gap-12">
						<div className="h-12 w-32 rounded bg-neutral-alpha-5" />
						<div className="h-12 w-32 rounded bg-neutral-alpha-5" />
					</div>
					<div className="h-8 w-32 rounded bg-neutral-alpha-5" />
				</div>
				<div className="h-[300px] w-full rounded bg-neutral-alpha-5" />
			</div>
		);
	}

	const totalEmails = data?.sent.reduce((a, b) => a + b, 0) || 0;
	const totalBounced = data?.bounced.reduce((a, b) => a + b, 0) || 0;
	const avgRate = data
		? data.rate.reduce((a, b) => a + b, 0) / data.rate.length
		: 0;

	return (
		<div className="w-full overflow-hidden rounded-2xl border border-stroke-soft-100 bg-transparent p-6 dark:border-stroke-soft-100/50">
			{/* Header */}
			<div className="mb-8 flex items-start justify-between">
				<div className="flex gap-12">
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Emails
						</span>
						<span className="font-medium text-4xl tracking-tight">
							{totalEmails.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Deliverability Rate
						</span>
						<span className="font-medium text-4xl tracking-tight">
							{totalEmails > 0 ? `${Math.round(avgRate)}%` : "0%"}
						</span>
					</div>
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Bounces
						</span>
						<span className="font-medium text-4xl tracking-tight">
							{totalBounced.toLocaleString()}
						</span>
					</div>
				</div>

				<div className="flex items-center">
					<Select.Root
						value={eventType}
						onValueChange={setEventType}
						size="xsmall"
						variant="compact"
					>
						<Select.Trigger className="min-w-[120px] rounded-xl border-stroke-soft-100 bg-bg-weak-50 hover:bg-bg-weak-100">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">All Events</Select.Item>
							<Select.Item value="delivered">Delivered</Select.Item>
							<Select.Item value="bounced">Bounced</Select.Item>
							<Select.Item value="spam">Complaints</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			{/* Chart */}
			<div className="h-[300px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
					>
						<defs>
							<linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#888888" stopOpacity={0.15} />
								<stop offset="95%" stopColor="#888888" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="currentColor"
							strokeOpacity={0.05}
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#888888", opacity: 0.8, fontSize: 10 }}
							dy={10}
						/>
						<YAxis yAxisId="left" hide />
						<YAxis
							yAxisId="right"
							orientation="right"
							domain={[0, maxSentValue]}
							ticks={[0, Math.round(maxSentValue / 2), maxSentValue]}
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#888888", opacity: 0.8, fontSize: 10 }}
							width={35}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "var(--bg-white-0)",
								border: "1px solid var(--stroke-soft-100)",
								borderRadius: "12px",
							}}
						/>
						<Area
							yAxisId="left"
							type="monotone"
							dataKey="rate"
							name="Deliverability Rate"
							stroke="#888888"
							strokeWidth={2}
							fillOpacity={1}
							fill="url(#colorRate)"
							isAnimationActive={false}
						/>
						<Line
							yAxisId="right"
							type="monotone"
							dataKey="bounced"
							name="Bounces"
							stroke="#F04438"
							strokeWidth={2}
							dot={{ r: 3, fill: "#F04438" }}
							activeDot={{ r: 5 }}
							isAnimationActive={false}
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};
