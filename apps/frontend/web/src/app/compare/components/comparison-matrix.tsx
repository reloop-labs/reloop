import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon } from "./brand-icon";
import type { ComparisonCell, ComparisonFeatureRow } from "./comparison-table";

export type ComparisonCategory = {
	id: string;
	label: string;
	intro?: string;
	features: ComparisonFeatureRow[];
};

const GRID_COLS =
	"grid-cols-[minmax(140px,1.1fr)_minmax(140px,1fr)_minmax(140px,1fr)]";

function normalizeCell(cell: ComparisonCell): { value: string; note?: string } {
	if (typeof cell === "string") {
		return { value: cell };
	}
	return cell;
}

function MatrixCell({ cell }: { cell: ComparisonCell }) {
	const { value, note } = normalizeCell(cell);
	const normalized = value.toLowerCase();
	const dash = "\u2014";
	const isYes =
		normalized === "yes" ||
		normalized.startsWith("yes ") ||
		normalized.startsWith("yes(") ||
		normalized.startsWith(`yes${dash}`) ||
		normalized.startsWith("yes-");
	const isNo =
		normalized === "no" ||
		normalized === dash ||
		normalized === "-" ||
		normalized.startsWith("no ") ||
		normalized.startsWith("no(") ||
		normalized.startsWith(`no${dash}`) ||
		normalized.startsWith("no-");

	if (isNo) {
		const isDash = value === dash || value === "-";
		const label =
			isDash || value.toLowerCase() === "no"
				? null
				: value.replace(new RegExp(`^No[\\s${dash}-]*`, "i"), "");
		return (
			<div className="flex flex-col gap-1">
				<span className="inline-flex items-center gap-2 font-medium text-[14px] text-text-strong-950 dark:text-white">
					<Icon
						name="cross"
						className="size-3.5 shrink-0 stroke-[2px] text-red-500/70 dark:text-red-400/70"
					/>
					{label ? <span>{label}</span> : null}
				</span>
				{note ? (
					<span className="pl-5 text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</div>
		);
	}

	if (isYes) {
		const label =
			value === "Yes"
				? null
				: value.replace(new RegExp(`^Yes[\\s${dash}-]*`, "i"), "");
		return (
			<div className="flex flex-col gap-1">
				<span className="inline-flex items-center gap-2 font-medium text-[14px] text-text-strong-950 dark:text-white">
					<Icon
						name="check-mark"
						className="size-3.5 shrink-0 text-text-sub-600 dark:text-white/55"
					/>
					{label ? <span>{label}</span> : null}
				</span>
				{note ? (
					<span className="pl-5 text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
						{note}
					</span>
				) : null}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1">
			<span className="inline-flex items-center gap-2 font-medium text-[14px] text-text-strong-950 dark:text-white">
				<Icon
					name="check-mark"
					className="size-3.5 shrink-0 text-text-sub-600 dark:text-white/55"
				/>
				{value}
			</span>
			{note ? (
				<span className="pl-5 text-[12px] text-text-sub-600 leading-snug dark:text-white/40">
					{note}
				</span>
			) : null}
		</div>
	);
}

export function ComparisonMatrix({
	competitorName,
	categories,
}: {
	competitorName: string;
	categories: ComparisonCategory[];
}) {
	const competitorIcon = competitorBrands.find(
		(brand) => brand.name === competitorName,
	)?.icon;

	return (
		<div className="mx-auto max-w-3xl overflow-x-auto pb-2">
			<div className={cn("grid min-w-[560px]", GRID_COLS)}>
				{/* Header */}
				<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95" />
				<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex items-center gap-2.5 rounded-t-2xl border-stroke-soft-200 border-x border-t bg-bg-weak-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
						<span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm dark:bg-white">
							<Logo className="size-full text-text-strong-950" />
						</span>
						<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
							Reloop
						</span>
					</div>
				</div>
				<div className="sticky top-0 z-10 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
					<div className="flex items-center gap-2.5 p-4">
						{competitorIcon ? (
							<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-white">
								<BrandIcon icon={competitorIcon} className="size-4" />
							</span>
						) : null}
						<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
							{competitorName}
						</span>
					</div>
				</div>

				{categories.map((section) => (
					<div key={section.id} className="contents">
						<div className="pt-8 pb-3">
							<span className="font-medium text-[14px] text-text-strong-950 dark:text-white">
								{section.label}
							</span>
						</div>
						<div className="border-stroke-soft-200 border-x bg-bg-weak-50/60 pt-8 pb-3 dark:border-white/10 dark:bg-white/[0.03]" />
						<div className="pt-8 pb-3" />

						{section.features.map((row) => (
							<div key={`${section.id}-${row.label}`} className="contents">
								<div className="flex items-center border-stroke-soft-200 border-b py-3.5 pr-4 dark:border-white/10">
									<span className="text-[14px] text-text-sub-600 dark:text-white/50">
										{row.label}
									</span>
								</div>
								<div className="flex items-center border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]">
									<MatrixCell cell={row.reloop} />
								</div>
								<div className="flex items-center border-stroke-soft-200 border-b px-4 py-3.5 dark:border-white/10">
									<MatrixCell cell={row.competitor} />
								</div>
							</div>
						))}
					</div>
				))}

				{/* Column footers */}
				<div />
				<div className="h-6 rounded-b-2xl border-stroke-soft-200 border-x border-b bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]" />
				<div />
			</div>
		</div>
	);
}
