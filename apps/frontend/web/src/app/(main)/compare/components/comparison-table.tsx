import { Icon } from "@reloop/ui/icon";

export interface ComparisonFeatureRow {
	label: string;
	reloop: string;
	competitor: string;
}

function CellValue({
	value,
	highlight,
}: {
	value: string;
	highlight?: boolean;
}) {
	const normalized = value.toLowerCase();
	const isPositive =
		normalized === "yes" ||
		normalized.startsWith("yes ") ||
		normalized.includes("3,000");

	if (isPositive) {
		return (
			<span className="flex items-center gap-2 font-medium text-text-strong-950 dark:text-white">
				<Icon name="check" className="size-4 shrink-0 text-primary-base" />
				<span>{value === "Yes" ? null : value}</span>
			</span>
		);
	}

	if (normalized === "no" || normalized === "no (diy)") {
		return (
			<span className="text-text-sub-600 dark:text-white/30">
				{value === "No" ? "—" : value}
			</span>
		);
	}

	return (
		<span
			className={
				highlight
					? "font-medium text-primary-base"
					: "font-medium text-text-strong-950 dark:text-white"
			}
		>
			{value}
		</span>
	);
}

export function ComparisonTable({
	competitorName,
	features,
}: {
	competitorName: string;
	features: ComparisonFeatureRow[];
}) {
	return (
		<div className="overflow-hidden rounded-3xl border border-stroke-soft-200 dark:border-white/10">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[640px] text-left text-[14px]">
					<thead>
						<tr className="border-stroke-soft-200 border-b bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03]">
							<th className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white">
								Feature
							</th>
							<th className="px-5 py-4 font-semibold text-primary-base">
								Reloop
							</th>
							<th className="px-5 py-4 font-semibold text-text-strong-950 dark:text-white">
								{competitorName}
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/10">
						{features.map((row) => (
							<tr key={row.label}>
								<td className="px-5 py-4 text-text-sub-600 dark:text-white/50">
									{row.label}
								</td>
								<td className="px-5 py-4">
									<CellValue value={row.reloop} highlight />
								</td>
								<td className="px-5 py-4">
									<CellValue value={row.competitor} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
