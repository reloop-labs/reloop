"use client";

import { Icon } from "@reloop/ui/icon";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { CustomTooltip } from "./custom-tooltip";

interface BreakdownItem {
	label: string;
	color: string;
	count: number;
	percentage: number;
}

interface RateChartProps {
	title: string;
	rate: number;
	data: {
		date: string;
		rate: number;
		sent?: number;
		bounced?: number;
		deliveryRate?: number;
	}[];
	breakdown: BreakdownItem[];
	color: string;
	yAxisDomain?: [number, number];
	riskValue?: number;
}

export const RateChart = ({
	title,
	rate,
	data,
	breakdown,
	color,
	yAxisDomain = [0, 10],
	riskValue,
}: RateChartProps) => {
	let ticks: number[] | undefined;
	if (riskValue === 4) {
		ticks = [0, 2, 4, 6, 8, 10];
	} else if (riskValue === 0.08) {
		ticks = [0, 0.04, 0.08, 0.12, 0.16, 0.2];
	}

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
					<BarChart
						data={data}
						margin={{ top: 20, right: 0, left: 0, bottom: 15 }}
					>
						<CartesianGrid
							vertical={false}
							stroke="currentColor"
							strokeOpacity={0.06}
							strokeDasharray="3 3"
						/>
						<XAxis
							dataKey="date"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#888888", opacity: 0.8, fontSize: 10 }}
							dy={10}
						/>
						<YAxis
							domain={yAxisDomain}
							ticks={ticks}
							orientation="right"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#888888", opacity: 0.8, fontSize: 10 }}
							width={30}
							tickFormatter={(val) => `${val}%`}
							interval="preserveStartEnd"
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
						/>
						{riskValue !== undefined && (
							<ReferenceLine
								y={riskValue}
								stroke="#FDB022"
								strokeDasharray="3 3"
								label={{
									value: "RISK",
									position: "insideBottomLeft",
									fill: "#FDB022",
									fontSize: 10,
									fontWeight: 500,
									offset: 6,
								}}
							/>
						)}
						<Bar
							dataKey="rate"
							name={title}
							fill={color}
							radius={[4, 4, 0, 0]}
							maxBarSize={16}
							isAnimationActive={false}
						>
							<LabelList
								dataKey="rate"
								position="top"
								formatter={(val: unknown) => {
									if (val === undefined || val === null) return "";
									const num = Number(val);
									return num === 0 ? "" : `${Number(num.toFixed(2))}%`;
								}}
								style={{
									fill: "#888888",
									opacity: 0.8,
									fontSize: 9,
									fontWeight: 500,
								}}
							/>
						</Bar>
					</BarChart>
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
