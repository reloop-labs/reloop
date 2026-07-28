import Link from "next/link";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useEmailStatsQuery } from "#/features/metrics/hooks/use-email-stats-query";
import {
	HomeCardBody,
	HomeCardHeader,
	HomeCardShell,
} from "./home-card-shell";

const ActivityAreaChart = lazy(() =>
	import("./activity-area-chart").then((m) => ({
		default: m.ActivityAreaChart,
	})),
);

function sum(values: number[] | undefined) {
	if (!values?.length) return 0;
	return values.reduce((a, b) => a + b, 0);
}

function MetricStat({
	label,
	value,
	hint,
	tone = "default",
}: {
	label: string;
	value: string;
	hint?: string;
	tone?: "default" | "success" | "warning" | "error";
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<span className="font-medium text-[10px] text-text-soft-400 uppercase tracking-wider">
				{label}
			</span>
			<span
				className={cn(
					"font-semibold text-title-h6 tracking-tight tabular-nums",
					tone === "success" && "text-success-base",
					tone === "warning" && "text-warning-base",
					tone === "error" && "text-error-base",
					tone === "default" && "text-text-strong-950",
				)}
			>
				{value}
			</span>
			{hint ? (
				<span className="text-paragraph-xs text-text-soft-400">{hint}</span>
			) : null}
		</div>
	);
}

export function SendHealthCard({ enabled }: { enabled: boolean }) {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const [hasSize, setHasSize] = useState(false);

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

	const { startDate, endDate } = useMemo(() => {
		const now = new Date();
		const toDate = new Date(now);
		toDate.setHours(23, 59, 59, 999);
		const fromDate = new Date(now);
		fromDate.setDate(now.getDate() - 6);
		fromDate.setHours(0, 0, 0, 0);
		return {
			startDate: fromDate.toISOString(),
			endDate: toDate.toISOString(),
		};
	}, []);

	const { data, isPending } = useEmailStatsQuery({
		startDate,
		endDate,
		domain: "",
		enabled,
	});

	const totals = useMemo(() => {
		const sent = sum(data?.sent);
		const delivered = sum(data?.delivered);
		const bounced = sum(data?.bounced);
		const complaint = sum(data?.complaint);
		const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
		const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0;
		const complaintRate = sent > 0 ? (complaint / sent) * 100 : 0;
		return {
			sent,
			delivered,
			bounced,
			complaint,
			deliveryRate,
			bounceRate,
			complaintRate,
		};
	}, [data]);

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

		const statsMap = new Map<string, number>();
		if (data?.dates && data.sent) {
			data.dates.forEach((dateStr, idx) => {
				const date = new Date(dateStr);
				const year = date.getUTCFullYear();
				const monthStr = String(date.getUTCMonth() + 1).padStart(2, "0");
				const dayStr = String(date.getUTCDate()).padStart(2, "0");
				statsMap.set(
					`${year}-${monthStr}-${dayStr}`,
					data.sent[idx] ?? 0,
				);
			});
		}

		return days.map((day) => ({
			date: day.label,
			count: statsMap.get(day.key) || 0,
		}));
	}, [data]);

	const bounceTone =
		totals.bounceRate >= 8
			? "error"
			: totals.bounceRate >= 4
				? "warning"
				: "default";

	return (
		<HomeCardShell
			header={
				<HomeCardHeader>
					<div className="flex items-center gap-2">
						<Icon name="fat-row" className="h-4 w-4 text-text-sub-600" />
						<h2 className="font-medium text-label-md text-text-strong-950">
							Send health
						</h2>
						<span className="rounded-full bg-bg-white-0 px-2 py-0.5 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
							Last 7 days
						</span>
					</div>
					<Link
						href="/metrics"
						className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
					>
						View metrics
						<Icon name="arrow-right" className="h-3.5 w-3.5" />
					</Link>
				</HomeCardHeader>
			}
		>
			<HomeCardBody className="p-5">
				{isPending ? (
					<div className="space-y-6">
						<div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-7 w-20" />
								</div>
							))}
						</div>
						<Skeleton className="h-[140px] w-full rounded-xl" />
					</div>
				) : (
					<div className="space-y-6">
						<div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
							<MetricStat
								label="Sent"
								value={totals.sent.toLocaleString()}
							/>
							<MetricStat
								label="Delivered"
								value={
									totals.sent > 0
										? `${Math.round(totals.deliveryRate)}%`
										: "—"
								}
								hint={
									totals.sent > 0
										? `${totals.delivered.toLocaleString()} delivered`
										: undefined
								}
								tone={
									totals.sent > 0 && totals.deliveryRate >= 95
										? "success"
										: "default"
								}
							/>
							<MetricStat
								label="Bounce rate"
								value={
									totals.sent > 0
										? `${totals.bounceRate.toFixed(1)}%`
										: "—"
								}
								hint={
									totals.sent > 0
										? `${totals.bounced.toLocaleString()} bounced`
										: undefined
								}
								tone={bounceTone}
							/>
							<MetricStat
								label="Complaints"
								value={
									totals.sent > 0
										? `${totals.complaintRate.toFixed(2)}%`
										: "—"
								}
								hint={
									totals.sent > 0
										? `${totals.complaint.toLocaleString()} complaints`
										: undefined
								}
								tone={
									totals.complaintRate >= 0.08
										? "warning"
										: "default"
								}
							/>
						</div>

						<div ref={chartContainerRef} className="h-[140px] w-full">
							{hasSize ? (
								<Suspense fallback={<Skeleton className="h-full w-full" />}>
									<ActivityAreaChart data={chartData} />
								</Suspense>
							) : null}
						</div>
					</div>
				)}
			</HomeCardBody>
		</HomeCardShell>
	);
}

export function useSendHealthTotals(enabled: boolean) {
	const { startDate, endDate } = useMemo(() => {
		const now = new Date();
		const toDate = new Date(now);
		toDate.setHours(23, 59, 59, 999);
		const fromDate = new Date(now);
		fromDate.setDate(now.getDate() - 6);
		fromDate.setHours(0, 0, 0, 0);
		return {
			startDate: fromDate.toISOString(),
			endDate: toDate.toISOString(),
		};
	}, []);

	const query = useEmailStatsQuery({
		startDate,
		endDate,
		domain: "",
		enabled,
	});

	const bounceRate = useMemo(() => {
		if (!query.data) return null;
		const sent = sum(query.data.sent);
		const bounced = sum(query.data.bounced);
		if (sent === 0) return 0;
		return (bounced / sent) * 100;
	}, [query.data]);

	const hasSent = sum(query.data?.sent) > 0;

	return { bounceRate, hasSent, isPending: query.isPending };
}
