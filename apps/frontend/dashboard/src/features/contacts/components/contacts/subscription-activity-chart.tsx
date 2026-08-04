"use client";

import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export type SubscriptionActivityPoint = {
	date: string;
	subscribed: number;
	unsubscribed: number;
};

/** Dual-series area chart for audience subscribe / unsubscribe activity. */
export function SubscriptionActivityChart({
	data,
}: {
	data: SubscriptionActivityPoint[];
}) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id="subscribedGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#1868DF" stopOpacity={0.28} />
						<stop offset="95%" stopColor="#1868DF" stopOpacity={0} />
					</linearGradient>
					<linearGradient id="unsubscribedGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#A1A1AA" stopOpacity={0.22} />
						<stop offset="95%" stopColor="#A1A1AA" stopOpacity={0} />
					</linearGradient>
				</defs>
				{/* Compact sparkline — axes hidden; details via tooltip */}
				<XAxis dataKey="date" hide />
				<YAxis hide domain={[0, "auto"]} />
				<Tooltip
					contentStyle={{
						background: "#18181b",
						borderColor: "#27272a",
						borderRadius: "8px",
						color: "#ffffff",
						fontSize: "12px",
					}}
					labelStyle={{ color: "#a1a1aa", marginBottom: 4 }}
				/>
				<Area
					type="monotone"
					dataKey="subscribed"
					name="Subscribed"
					stroke="#1868DF"
					strokeWidth={2}
					fillOpacity={1}
					fill="url(#subscribedGradient)"
					isAnimationActive
				/>
				<Area
					type="monotone"
					dataKey="unsubscribed"
					name="Unsubscribed"
					stroke="#A1A1AA"
					strokeWidth={2}
					fillOpacity={1}
					fill="url(#unsubscribedGradient)"
					isAnimationActive
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
