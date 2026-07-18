import { Icon } from "@reloop/ui/icon";

export type ComparisonCell =
	| string
	| {
			value: string;
			note?: string;
	  };

export interface ComparisonFeatureRow {
	label: string;
	reloop: ComparisonCell;
	competitor: ComparisonCell;
}

function normalizeCell(cell: ComparisonCell): { value: string; note?: string } {
	if (typeof cell === "string") {
		return { value: cell };
	}
	return cell;
}

function CellValue({
	cell,
	highlight,
}: {
	cell: ComparisonCell;
	highlight?: boolean;
}) {
	const { value, note } = normalizeCell(cell);
	const normalized = value.toLowerCase();
	const isYes =
		normalized === "yes" ||
		normalized.startsWith("yes ") ||
		normalized.startsWith("yes(") ||
		normalized.startsWith("yes—") ||
		normalized.startsWith("yes-");
	const isNeutralDash = normalized === "—" || normalized === "-";
	const isNo =
		normalized === "no" ||
		normalized.startsWith("no ") ||
		normalized.startsWith("no(") ||
		normalized.startsWith("no—") ||
		normalized.startsWith("no-");

	if (isYes) {
		const label = value === "Yes" ? null : value.replace(/^Yes[\s—-]*/i, "");
		return (
			<span className="flex flex-col gap-1">
				<span className="flex items-start gap-2 font-medium text-text-strong-950 dark:text-white">
					<Icon
						name="check"
						className="mt-0.5 size-4 shrink-0 text-primary-base"
					/>
					{label ? <span>{label}</span> : <span className="sr-only">Yes</span>}
				</span>
				{note ? (
					<span className="pl-6 text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</span>
		);
	}

	if (isNeutralDash) {
		return (
			<span className="flex flex-col gap-1">
				<span className="text-text-sub-600 dark:text-white/30">—</span>
				{note ? (
					<span className="text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</span>
		);
	}

	if (isNo) {
		const label = value === "No" ? null : value.replace(/^No[\s—-]*/i, "");
		return (
			<span className="flex flex-col gap-1">
				<span className="flex items-start gap-2 text-text-sub-600 dark:text-white/35">
					<Icon name="cross" className="mt-0.5 size-4 shrink-0 opacity-50" />
					{label ? <span>{label}</span> : <span className="sr-only">No</span>}
				</span>
				{note ? (
					<span className="pl-6 text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</span>
		);
	}

	return (
		<span className="flex flex-col gap-1">
			<span
				className={
					highlight
						? "font-medium text-primary-base"
						: "font-medium text-text-strong-950 dark:text-white"
				}
			>
				{value}
			</span>
			{note ? (
				<span className="text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
					{note}
				</span>
			) : null}
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
									<CellValue cell={row.reloop} highlight />
								</td>
								<td className="px-5 py-4">
									<CellValue cell={row.competitor} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
