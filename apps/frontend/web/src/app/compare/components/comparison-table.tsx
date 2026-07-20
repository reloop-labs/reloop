import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";

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
	const competitorIcon = competitorBrands.find(
		(brand) => brand.name === competitorName,
	)?.icon;

	return (
		<div className="mx-auto max-w-3xl overflow-x-auto pb-2">
			<div className="grid min-w-[560px] grid-cols-[minmax(140px,1.1fr)_minmax(140px,1fr)_minmax(140px,1fr)]">
				{/* Header */}
				<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="p-4 font-medium text-[15px] text-text-strong-950 dark:text-white">
						Feature
					</div>
				</div>
				<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex items-center gap-2.5 rounded-t-2xl border-x border-t border-stroke-soft-200 bg-bg-weak-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
						<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
							<Logo className="size-full text-text-strong-950" />
						</span>
						<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
							Reloop
						</span>
					</div>
				</div>
				<div className="sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex items-center gap-2.5 p-4">
						{competitorIcon ? (
							<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
								<BrandIcon icon={competitorIcon} className="size-4" />
							</span>
						) : null}
						<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
							{competitorName}
						</span>
					</div>
				</div>

				{/* Rows */}
				{features.map((row) => (
					<div key={row.label} className="contents">
						<div className="flex items-center border-b border-stroke-soft-200 py-3.5 pr-4 dark:border-white/10">
							<span className="text-[14px] text-text-sub-600 dark:text-white/50">
								{row.label}
							</span>
						</div>
						<div className="flex items-center border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]">
							<CellValue cell={row.reloop} />
						</div>
						<div className="flex items-center border-b border-stroke-soft-200 px-4 py-3.5 dark:border-white/10">
							<CellValue cell={row.competitor} />
						</div>
					</div>
				))}

				{/* Column footers */}
				<div />
				<div className="h-6 rounded-b-2xl border-x border-b border-stroke-soft-200 bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
				<div />
			</div>
		</div>
	);
}
