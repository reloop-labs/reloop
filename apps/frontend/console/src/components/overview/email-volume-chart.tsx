"use client";

import { formatNumber } from "@fe/console/lib/format";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from "recharts";

export type EmailVolumePoint = {
	date: string;
	delivered: number;
	bounced: number;
	failed: number;
	other: number;
};

export const EMAIL_SERIES = [
	{ key: "delivered", label: "Delivered", color: "var(--chart-delivered)" },
	{ key: "bounced", label: "Bounced", color: "var(--chart-bounced)" },
	{ key: "failed", label: "Failed", color: "var(--chart-failed)" },
	{ key: "other", label: "Pending / other", color: "var(--chart-other)" },
] as const;

export function formatChartDate(date: string, withYear = false) {
	return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: withYear ? "numeric" : undefined,
		timeZone: "UTC",
	});
}

function compactNumber(n: number) {
	return Intl.NumberFormat(undefined, {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(n);
}

function VolumeTooltip({
	active,
	payload,
	label,
}: TooltipProps<number, string>) {
	if (!active || !payload?.length) return null;
	const point = payload[0]?.payload as EmailVolumePoint;
	const total = point.delivered + point.bounced + point.failed + point.other;
	return (
		<div className="min-w-[180px] rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-[12px] shadow-lg dark:border-white/10 dark:bg-[#141414]">
			<p className="font-medium text-text-strong-950">
				{formatChartDate(String(label), true)}
			</p>
			<div className="mt-2 space-y-1">
				{EMAIL_SERIES.map((series) => (
					<div key={series.key} className="flex items-center gap-2">
						<span
							className="h-2 w-2 shrink-0 rounded-[2px]"
							style={{ background: series.color }}
						/>
						<span className="flex-1 text-text-sub-600">{series.label}</span>
						<span className="text-text-strong-950 tabular-nums">
							{formatNumber(point[series.key])}
						</span>
					</div>
				))}
			</div>
			<div className="mt-2 flex justify-between border-stroke-soft-100 border-t pt-2 dark:border-white/10">
				<span className="text-text-sub-600">Total</span>
				<span className="font-medium text-text-strong-950 tabular-nums">
					{formatNumber(total)}
				</span>
			</div>
		</div>
	);
}

/** Daily email outcomes, stacked. Kept in its own module so Recharts loads lazily. */
export function EmailVolumeChart({ data }: { data: EmailVolumePoint[] }) {
	// Fewer bars → wider bars; keep a 2px surface gap between neighbours.
	const barGap = data.length > 45 ? 1 : 2;
	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart
				data={data}
				margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
				barCategoryGap={barGap}
			>
				<CartesianGrid stroke="var(--chart-grid)" vertical={false} />
				<XAxis
					dataKey="date"
					axisLine={false}
					tickLine={false}
					minTickGap={24}
					tickFormatter={(value: string) => formatChartDate(value)}
					tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					width={40}
					allowDecimals={false}
					tickFormatter={compactNumber}
					tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
				/>
				<Tooltip
					cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
					content={<VolumeTooltip />}
				/>
				{EMAIL_SERIES.map((series) => (
					<Bar
						key={series.key}
						dataKey={series.key}
						name={series.label}
						stackId="emails"
						fill={series.color}
						stroke="var(--chart-surface)"
						strokeWidth={1}
						isAnimationActive={false}
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
}
