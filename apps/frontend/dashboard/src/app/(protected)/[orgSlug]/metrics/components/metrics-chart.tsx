"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const data = [
	{ name: "Mon", sent: 4000, opened: 2400, clicked: 1200 },
	{ name: "Tue", sent: 3000, opened: 1398, clicked: 800 },
	{ name: "Wed", sent: 2000, opened: 2800, clicked: 2290 },
	{ name: "Thu", sent: 2780, opened: 3908, clicked: 2000 },
	{ name: "Fri", sent: 1890, opened: 4800, clicked: 2181 },
	{ name: "Sat", sent: 2390, opened: 3800, clicked: 2500 },
	{ name: "Sun", sent: 3490, opened: 4300, clicked: 2100 },
];

export function MetricsChart() {
	return (
		<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 shadow-black/5 shadow-sm">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-text-strong-950">
						Active Engagement
					</h3>
					<p className="font-medium text-paragraph-sm text-text-soft-400">
						Tracking email performance across the last 7 days.
					</p>
				</div>
			</div>
			<div className="h-[350px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data}
						margin={{
							top: 10,
							right: 10,
							left: 0,
							bottom: 0,
						}}
					>
						<defs>
							<linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#335cff" stopOpacity={0.1} />
								<stop offset="95%" stopColor="#335cff" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#7d52f4" stopOpacity={0.1} />
								<stop offset="95%" stopColor="#7d52f4" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="rgba(0,0,0,0.05)"
						/>
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#99a0ae", fontSize: 12, fontWeight: 500 }}
							dy={10}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#99a0ae", fontSize: 12, fontWeight: 500 }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "#fff",
								borderRadius: "12px",
								border: "1px solid #e1e4ea",
								boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
							}}
						/>
						<Area
							type="monotone"
							dataKey="sent"
							stroke="#335cff"
							strokeWidth={2}
							fillOpacity={1}
							fill="url(#colorSent)"
						/>
						<Area
							type="monotone"
							dataKey="opened"
							stroke="#7d52f4"
							strokeWidth={2}
							fillOpacity={1}
							fill="url(#colorOpened)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
