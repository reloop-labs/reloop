interface PayloadEntry {
	name?: string;
	value?: number;
	color?: string;
	stroke?: string;
	fill?: string;
	dataKey?: string;
	payload?: {
		date?: string;
		[key: string]: unknown;
	};
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: PayloadEntry[];
	label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (!active || !payload || !payload.length) return null;

	const date = payload[0]?.payload?.date ?? label ?? "";

	return (
		<div className="flex min-w-[190px] flex-col gap-3 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 pt-3 pb-4 shadow-lg dark:border-stroke-soft-100/50 dark:bg-zinc-950">
			{/* Date Header */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2 dark:border-stroke-soft-100/30">
				<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider">
					{date}
				</span>
			</div>

			{/* Dynamic Metrics */}
			<div className="flex flex-col gap-2">
				{payload.map((entry, i) => {
					const seriesColor = entry.stroke ?? entry.color ?? entry.fill ?? "#888";
					const seriesName = entry.name ?? entry.dataKey ?? "Value";
					const value = entry.value ?? 0;

					// Format: if value looks like a percentage rate (has decimals or came from "rate" key)
					const isRate =
						entry.dataKey === "rate" ||
						entry.dataKey === "bounceRate" ||
						entry.dataKey === "complaintRate" ||
						entry.dataKey === "deliveryRate";
					const displayValue = isRate
						? `${Number(value.toFixed(2))}%`
						: value.toLocaleString();

					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: tooltip entries are positional
						<div key={i} className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-2">
								<div
									className="h-2 w-2 rounded-full flex-shrink-0"
									style={{ backgroundColor: seriesColor }}
								/>
								<span className="text-text-sub-600 text-xs">{seriesName}</span>
							</div>
							<span className="font-semibold text-text-main-900 text-xs">
								{displayValue}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};
