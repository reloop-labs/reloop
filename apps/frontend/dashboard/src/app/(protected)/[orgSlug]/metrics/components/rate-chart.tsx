"use client";

import { Icon } from "@reloop/ui/icon";
import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface BreakdownItem {
	label: string;
	color: string;
	count: number;
	percentage: number;
}

interface RateChartProps {
	title: string;
	rate: number;
	data: { date: string; rate: number }[];
	breakdown: BreakdownItem[];
	color: string;
	yAxisDomain?: [number, number];
}

export const RateChart = ({
	title,
	rate,
	data,
	breakdown,
	color,
	yAxisDomain = [0, 10],
}: RateChartProps) => {
	return (
		<div className="flex flex-col gap-6 rounded-2xl border border-stroke-soft-100 bg-transparent p-6 dark:border-stroke-soft-100/50">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-1.5">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							{title}
						</span>
						<Icon
							name="help-circle"
							className="h-3.5 w-3.5 text-text-disabled-300"
						/>
					</div>
					<span className="font-medium text-4xl tracking-tight">{rate}%</span>
				</div>
			</div>

			{/* Chart */}
			<div className="h-[200px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data}>
						<defs>
							<linearGradient
								id={`gradient-${title}`}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="5%" stopColor={color} stopOpacity={0.15} />
								<stop offset="95%" stopColor={color} stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis hide dataKey="date" />
						<YAxis
							domain={yAxisDomain}
							orientation="right"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#888888", opacity: 0.8, fontSize: 10 }}
							width={30}
							tickFormatter={(val) => `${val}%`}
							interval="preserveStartEnd"
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "var(--bg-white-0)",
								border: "1px solid var(--stroke-soft-100)",
								borderRadius: "12px",
							}}
						/>
						<Area
							type="monotone"
							dataKey="rate"
							stroke={color}
							strokeWidth={2}
							fillOpacity={1}
							fill={`url(#gradient-${title})`}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			{/* Breakdown */}
			<div className="flex flex-col border-stroke-soft-100 border-t pt-4 dark:border-stroke-soft-100/50">
				{breakdown.map((item, i) => (
					<div
						key={item.label}
						className={`flex items-center justify-between py-2 ${
							i !== breakdown.length - 1
								? "border-bottom border-stroke-soft-100 dark:border-stroke-soft-100/50"
								: ""
						}`}
					>
						<div className="flex items-center gap-2">
							<div
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							<span className="text-text-sub-600 text-xs">{item.label}</span>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-right text-text-disabled-300 text-xs">
								{item.count}
							</span>
							<span className="w-8 text-right text-xs">{item.percentage}%</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
