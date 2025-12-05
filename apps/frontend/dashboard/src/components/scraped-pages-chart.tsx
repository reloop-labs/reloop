"use client";

import * as Badge from "@reloop/ui/badge";
import * as Select from "@reloop/ui/select";
import { Icon } from "@reloop/ui/icon";
import React from "react";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	type TooltipProps,
} from "recharts";

interface ChartDataPoint {
	date: string;
	sent: number;
	failed: number;
	bounced: number;
}

interface EmailStatsChartProps {
	data?: ChartDataPoint[];
	isLoading?: boolean;
}

// Mock data for last 15 days - email statistics
const mockData: ChartDataPoint[] = [
	{ date: "11/21", sent: 523, failed: 16, bounced: 10 },
	{ date: "11/22", sent: 689, failed: 22, bounced: 14 },
	{ date: "11/23", sent: 412, failed: 14, bounced: 8 },
	{ date: "11/24", sent: 756, failed: 25, bounced: 16 },
	{ date: "11/25", sent: 598, failed: 19, bounced: 12 },
	{ date: "11/26", sent: 834, failed: 31, bounced: 20 },
	{ date: "11/27", sent: 467, failed: 13, bounced: 9 },
	{ date: "11/28", sent: 721, failed: 27, bounced: 17 },
	{ date: "11/29", sent: 342, failed: 12, bounced: 8 },
	{ date: "11/30", sent: 876, failed: 24, bounced: 15 },
	{ date: "12/01", sent: 512, failed: 18, bounced: 11 },
	{ date: "12/02", sent: 629, failed: 21, bounced: 9 },
	{ date: "12/03", sent: 458, failed: 15, bounced: 7 },
	{ date: "12/04", sent: 781, failed: 28, bounced: 19 },
	{ date: "12/05", sent: 394, failed: 10, bounced: 6 },
];

const chartConfig = {
	sent: {
		label: "Sent",
		color: "#00BD7C", // green-500 / success-base
	},
	failed: {
		label: "Failed",
		color: "#FD9A00", // red-500 / error-base
	},
	bounced: {
		label: "Bounced",
		color: "#1447E6", // orange-500 / warning-base
	},
} satisfies Record<string, { label: string; color: string }>;

type ActiveProperty = keyof typeof chartConfig | "all";

const CustomTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 shadow-regular-md">
				<p className="text-label-xs text-text-sub-600 mb-2">{label}</p>
				{payload.map((entry, index) => (
					<div key={index} className="flex items-center gap-2">
						<div
							className="size-2 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-paragraph-xs text-text-sub-600">
							{chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}:
						</span>
						<span className="text-label-xs text-text-strong-950">
							{entry.value?.toLocaleString() ?? 0}
						</span>
					</div>
				))}
			</div>
		);
	}
	return null;
};

const CustomGradientBar = (
	props: React.SVGProps<SVGRectElement> & {
		dataKey?: string;
		activeProperty?: ActiveProperty | null;
		glowOpacity?: number;
	},
) => {
	const { x, y, width, height, dataKey, activeProperty, radius } = props;

	const isActive = activeProperty === "all" ? true : activeProperty === dataKey;
	const numericRadius = typeof radius === "number" ? radius : 4;

	// Get fill color from chartConfig based on dataKey
	const fillColor = dataKey && dataKey in chartConfig
		? chartConfig[dataKey as keyof typeof chartConfig].color
		: "var(--color-gray-400)";

	return (
		<>
			<rect
				x={x}
				y={y}
				rx={numericRadius}
				width={width}
				height={height}
				stroke="none"
				fill={fillColor}
				opacity={isActive ? 1 : 0.1}
				filter={
					isActive && activeProperty !== "all"
						? `url(#glow-chart-${dataKey})`
						: undefined
				}
			/>
			<defs>
				<filter
					id={`glow-chart-${dataKey}`}
					x="-200%"
					y="-200%"
					width="600%"
					height="600%"
				>
					<feGaussianBlur stdDeviation="10" result="blur" />
					<feComposite in="SourceGraphic" in2="blur" operator="over" />
				</filter>
			</defs>
		</>
	);
};

export const EmailStatsChart = ({
	data = mockData,
	isLoading = false,
}: EmailStatsChartProps) => {
	const [activeProperty, setActiveProperty] =
		React.useState<ActiveProperty>("all");

	const totalSent = data.reduce((sum, d) => sum + d.sent, 0);
	const totalFailed = data.reduce((sum, d) => sum + d.failed, 0);
	const totalBounced = data.reduce((sum, d) => sum + d.bounced, 0);
	const totalEmails = totalSent + totalFailed + totalBounced;

	// Calculate delivery rate
	const deliveryRate = totalEmails > 0
		? ((totalSent / totalEmails) * 100).toFixed(1)
		: "0";
	const isGoodRate = Number(deliveryRate) >= 95;

	return (
		<div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h3 className="text-label-lg text-text-strong-950">
							Email Statistics
						</h3>
						<Badge.Root
							variant="light"
							color={isGoodRate ? "green" : "orange"}
							size="medium"
						>
							<Badge.Icon
								as={() => (
									<Icon
										name={isGoodRate ? "graph-up" : "graph-down"}
										className="size-3.5"
									/>
								)}
							/>
							{deliveryRate}% delivered
						</Badge.Root>
					</div>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Last 15 days • {totalEmails.toLocaleString()} total emails
					</p>
				</div>
				<Select.Root
					size="xsmall"
					variant="compact"
					value={activeProperty}
					onValueChange={(value: ActiveProperty) => {
						setActiveProperty(value);
					}}
				>
					<Select.Trigger>
						<Select.Value placeholder="Select a property" />
					</Select.Trigger>
					<Select.Content align="end">
						<Select.Group>
							<Select.GroupLabel>Email Status</Select.GroupLabel>
							<Select.Item value="all">All</Select.Item>
							<Select.Item value="sent">Sent</Select.Item>
							<Select.Item value="failed">Failed</Select.Item>
							<Select.Item value="bounced">Bounced</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			{isLoading ? (
				<div className="flex h-48 items-center justify-center">
					<div className="text-text-sub-600">Loading chart data...</div>
				</div>
			) : (
				<div className="h-48">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
							<XAxis
								dataKey="date"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								tick={{ fill: "#a3a3a3", fontSize: 12 }}
							/>
							<Tooltip content={<CustomTooltip />} cursor={false} />
							<Bar
								stackId="a"
								dataKey="sent"
								fill={chartConfig.sent.color}
								radius={[0, 0, 4, 4]}
								barSize={8}
								className="text-[#292929]"
								shape={<CustomGradientBar activeProperty={activeProperty} />}
								background={{ fill: "currentColor", radius: 4 }}
							/>
							<Bar
								stackId="a"
								dataKey="failed"
								fill={chartConfig.failed.color}
								radius={0}
								barSize={8}
								shape={<CustomGradientBar activeProperty={activeProperty} />}
							/>
							<Bar
								stackId="a"
								dataKey="bounced"
								fill={chartConfig.bounced.color}
								radius={[4, 4, 0, 0]}
								barSize={8}
								shape={<CustomGradientBar activeProperty={activeProperty} />}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}

			{/* Legend */}
			<div className="mt-4 flex items-center justify-center gap-6">
				{Object.entries(chartConfig).map(([key, config]) => (
					<div key={key} className="flex items-center gap-2">
						<div
							className="size-2.5 rounded-full"
							style={{ backgroundColor: config.color }}
						/>
						<span className="text-paragraph-xs text-text-sub-600">
							{config.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

// Keep the old export name for backwards compatibility
export const ScrapedPagesChart = EmailStatsChart;
