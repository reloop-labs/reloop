"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

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
		<ResponsiveContainer
			width="100%"
			height="100%"
			className="pointer-events-none text-text-strong-950"
		>
			<AreaChart data={data} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
				<defs>
					<linearGradient id="subscribedGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
						<stop offset="95%" stopColor="#10B981" stopOpacity={0} />
					</linearGradient>
					<linearGradient id="unsubscribedGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
						<stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
					</linearGradient>
				</defs>
				{/* Static sparkline: no axes, tooltip or hover state; the card links to the metrics page */}
				<XAxis dataKey="date" hide />
				<YAxis hide domain={[0, "auto"]} />
				<Area
					type="monotone"
					dataKey="subscribed"
					name="Subscribed"
					stroke="#10B981"
					strokeWidth={1}
					fillOpacity={1}
					fill="url(#subscribedGradient)"
					activeDot={false}
					isAnimationActive
				/>
				<Area
					type="monotone"
					dataKey="unsubscribed"
					name="Unsubscribed"
					stroke="#EF4444"
					strokeWidth={1}
					fillOpacity={1}
					fill="url(#unsubscribedGradient)"
					activeDot={false}
					isAnimationActive
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
