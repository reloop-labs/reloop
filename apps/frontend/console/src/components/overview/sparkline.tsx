"use client";

import { formatNumber } from "@fe/console/lib/format";
import { useId } from "react";
import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
} from "recharts";
import { formatChartDate } from "./email-volume-chart";

type Point = { date: string; value: number };

function SparkTooltip({
	active,
	payload,
	unit,
}: TooltipProps<number, string> & { unit: string }) {
	if (!active || !payload?.length) return null;
	const point = payload[0]?.payload as Point;
	return (
		<div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1.5 text-[11px] shadow-md dark:border-white/10 dark:bg-[#141414]">
			<span className="text-text-sub-600">{formatChartDate(point.date)}</span>
			<span className="ml-2 font-medium text-text-strong-950 tabular-nums">
				{formatNumber(point.value)} {unit}
			</span>
		</div>
	);
}

export function Sparkline({ data, unit }: { data: Point[]; unit: string }) {
	const gradientId = `spark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="0%"
							stopColor="var(--chart-delivered)"
							stopOpacity={0.14}
						/>
						<stop
							offset="100%"
							stopColor="var(--chart-delivered)"
							stopOpacity={0}
						/>
					</linearGradient>
				</defs>
				<Tooltip
					cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
					content={<SparkTooltip unit={unit} />}
					allowEscapeViewBox={{ x: false, y: true }}
				/>
				<Area
					type="monotone"
					dataKey="value"
					stroke="var(--chart-delivered)"
					strokeWidth={1.5}
					fill={`url(#${gradientId})`}
					activeDot={{
						r: 3,
						fill: "var(--chart-delivered)",
						stroke: "var(--chart-surface)",
						strokeWidth: 2,
					}}
					isAnimationActive={false}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
