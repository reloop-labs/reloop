"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useEffect, useMemo, useState } from "react";
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
import { CustomTooltip } from "./custom-tooltip";
import { EVENTS, EventSelector } from "./event-selector";

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
	const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

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
				fullDate: formatDateLabel(date),
				sent: existing?.sent ?? 0,
				delivered: existing?.delivered ?? 0,
				bounced: existing?.bounced ?? 0,
				complaint: existing?.complaint ?? 0,
				rate: existing?.rate ?? 0,
				received: 0,
				opened: 0,
				clicked: 0,
				unsubscribed: 0,
				delivery_delayed: 0,
				failed: 0,
				suppressed: 0,
			};
		});
	}, [data, startDate, endDate]);

	const isAllSelected = useMemo(() => {
		return (
			selectedEvents.length === 0 ||
			selectedEvents.includes("all") ||
			selectedEvents.length === EVENTS.length
		);
	}, [selectedEvents]);

	const maxSentValue = useMemo(() => {
		if (!data) return 10;
		const keysToPlot: string[] = isAllSelected
			? ["delivered", "bounced", "complaint"]
			: selectedEvents.map((id) => (id === "complained" ? "complaint" : id));

		let max = 10;
		for (const key of keysToPlot) {
			const array = data[key as keyof EmailStatsResponse] as
				| number[]
				| undefined;
			if (array && array.length > 0) {
				const m = Math.max(...array);
				if (m > max) max = m;
			}
		}
		return max > 0 ? max : 10;
	}, [data, selectedEvents, isAllSelected]);

	if (isLoading) {
		return (
			<div className="group flex w-full flex-col">
				{/* Header */}
				<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
					<div className="h-5 w-28 animate-pulse rounded bg-neutral-alpha-5" />
				</div>

				{/* Body Container */}
				<div className="-mt-1.5 flex flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-5 pt-4 pb-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.01]">
					<div className="mb-8 flex justify-between">
						<div className="flex gap-12">
							<div className="h-12 w-32 animate-pulse rounded bg-neutral-alpha-5" />
							<div className="h-12 w-32 animate-pulse rounded bg-neutral-alpha-5" />
						</div>
						<div className="h-8 w-32 animate-pulse rounded bg-neutral-alpha-5" />
					</div>
					<div className="h-[300px] w-full animate-pulse rounded bg-neutral-alpha-5" />
				</div>
			</div>
		);
	}

	const totalEmails = data?.sent.reduce((a, b) => a + b, 0) || 0;
	const totalBounced = data?.bounced.reduce((a, b) => a + b, 0) || 0;
	const avgRate = data
		? data.rate.reduce((a, b) => a + b, 0) / data.rate.length
		: 0;

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-2 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<span className="font-medium text-lg text-text-strong-950 dark:text-white">
					Deliverability
				</span>
			</div>

			{/* Body Container */}
			<div className="-mt-1.5 flex flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-5 pt-4 pb-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.01]">
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex flex-wrap gap-8 sm:gap-12">
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Emails
							</span>
							<span className="font-bold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
								{totalEmails.toLocaleString()}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Deliverability Rate
							</span>
							<span className="font-bold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
								{totalEmails > 0 ? `${Math.round(avgRate)}%` : "0%"}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								Bounces
							</span>
							<span className="font-bold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
								{totalBounced.toLocaleString()}
							</span>
						</div>
					</div>

					<div className="flex items-center">
						<EventSelector
							value={selectedEvents}
							onChange={setSelectedEvents}
						/>
					</div>
				</div>

				{/* Chart */}
				<div className="h-[300px] w-full">
					{isMounted && (
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart
								data={chartData}
								margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
							>
								<defs>
									<linearGradient
										id="colorDelivered"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
										<stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
								<YAxis
									orientation="right"
									domain={[0, maxSentValue]}
									ticks={[0, Math.round(maxSentValue / 2), maxSentValue]}
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#888888", opacity: 0.8, fontSize: 10 }}
									width={35}
								/>
								<Tooltip content={<CustomTooltip />} />
								{(isAllSelected || selectedEvents.includes("delivered")) && (
									<Area
										type="monotone"
										dataKey="delivered"
										name="Delivered"
										stroke="#10B981"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorDelivered)"
										isAnimationActive={false}
									/>
								)}
								{(isAllSelected || selectedEvents.includes("bounced")) && (
									<Line
										type="monotone"
										dataKey="bounced"
										name="Bounces"
										stroke="#EF4444"
										strokeWidth={2}
										dot={false}
										activeDot={{ r: 5 }}
										isAnimationActive={false}
									/>
								)}
								{(isAllSelected || selectedEvents.includes("complained")) && (
									<Line
										type="monotone"
										dataKey="complaint"
										name="Complained"
										stroke="#D97706"
										strokeWidth={2}
										dot={false}
										activeDot={{ r: 5 }}
										isAnimationActive={false}
									/>
								)}
								{!isAllSelected &&
									selectedEvents
										.filter(
											(id) =>
												id !== "delivered" &&
												id !== "bounced" &&
												id !== "complained",
										)
										.map((eventId) => {
											const event = EVENTS.find((e) => e.id === eventId);
											if (!event) return null;
											const key =
												event.id === "complained" ? "complaint" : event.id;
											return (
												<Line
													key={event.id}
													type="monotone"
													dataKey={key}
													name={event.label}
													stroke={event.color}
													strokeWidth={2}
													dot={false}
													activeDot={{ r: 5 }}
													isAnimationActive={false}
												/>
											);
										})}
							</ComposedChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>
		</div>
	);
};
