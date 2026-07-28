import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export type ActivityChartPoint = {
	date: string;
	count: number;
};

/** Isolated so Recharts stays out of the home critical path until the chart mounts. */
export function ActivityAreaChart({ data }: { data: ActivityChartPoint[] }) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart
				data={data}
				margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
			>
				<defs>
					<linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
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
					type="linear"
					dataKey="count"
					name="Emails Sent"
					stroke="#F97316"
					strokeWidth={2}
					strokeLinejoin="miter"
					strokeLinecap="butt"
					fillOpacity={1}
					fill="url(#activityGradient)"
					isAnimationActive={true}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
