import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import {
	FeatureHintCard,
	FeatureHintLabel,
} from "@reloop/ui/pricing/feature-hint";
import { PlanCheckmark, PlanCrossIcon } from "@reloop/ui/pricing/marks";
import { Fragment, type ReactNode } from "react";
import { getFeatureHint } from "../compare-feature-hints";
import type {
	ComparisonCategory,
	ComparisonCell,
	ComparisonFeatureRow,
} from "../compare-types";
import { competitorBrands } from "../competitor-brands";
import { BrandIcon, type BrandMark } from "./brand-icon";
import { CompareTitleIcon } from "./compare-title-icon";

/**
 * Same column rhythm as the /pricing "Compare every plan" table, with two value columns.
 * On phones the label takes its own full-width line and the two values sit side by side under it.
 */
const GRID_COLS =
	"grid-cols-2 sm:grid-cols-[minmax(200px,1.45fr)_repeat(2,minmax(150px,1fr))]";

const DASH = "—";

/** Plain values that describe something missing or do-it-yourself, shown with a cross. */
const MISSING =
	/^(not\b|none\b|n\/a\b|unavailable|limited\b|hosted (saas )?only|build it yourself|separate product)|\bdiy\b/i;

function normalizeCell(cell: ComparisonCell): { value: string; note?: string } {
	return typeof cell === "string" ? { value: cell } : cell;
}

/** "Yes (Apache 2.0)" -> check + "Apache 2.0"; "No" -> cross; anything else is text. */
function GridCell({ cell }: { cell: ComparisonCell }) {
	const { value, note } = normalizeCell(cell);
	const lower = value.toLowerCase();
	const bare = value === "-" || value === DASH || lower === "n/a";
	const explicitYes = /^yes(\b|$)/.test(lower);
	const no = bare || /^no(\b|$)/.test(lower) || MISSING.test(value);
	// Any other value describes something on offer ("Scale+", "1 included"), so it gets a check too.
	const yes = explicitYes || !no;
	// "Yes (Apache 2.0)" -> "Apache 2.0": what is left once the Yes / No is dropped.
	const qualifier = value
		.replace(new RegExp(`^(yes|no)[\\s${DASH}:,-]*`, "i"), "")
		.replace(/^\((.*)\)$/, "$1")
		.trim();
	const usableNote = note && note !== "-" && note !== DASH ? note : undefined;
	// A check or cross says yes/no already, so the text after it is the detail:
	// the qualifier ("Apache 2.0"), else the note, else a plain Yes / No.
	const markedText = qualifier || usableNote || (explicitYes ? "Yes" : "No");
	const text = bare
		? usableNote || "Not available"
		: explicitYes || /^no(\b|$)/.test(lower)
			? markedText
			: value;
	const shownNote = text === usableNote ? undefined : usableNote;

	return (
		<div className="flex items-start gap-2.5 text-left sm:gap-3">
			<span className="flex h-5 w-5 shrink-0 items-center justify-center">
				{yes ? (
					<PlanCheckmark className="size-5" />
				) : no ? (
					<PlanCrossIcon className="size-5" />
				) : null}
			</span>
			<span className="min-w-0">
				<span
					className={cn(
						"block text-[14px] leading-5",
						no
							? "text-text-sub-600 dark:text-white/50"
							: "text-text-strong-950 dark:text-white/90",
					)}
				>
					{text}
				</span>
				{shownNote ? (
					<span className="mt-1 block text-[12.5px] text-text-sub-600 leading-snug dark:text-white/40">
						{shownNote}
					</span>
				) : null}
			</span>
		</div>
	);
}

/** Wavy-underlined label with a hover definition, like /pricing; plain text when we have no definition. */
function RowLabel({ label, icon }: { label: string; icon?: string }) {
	const hint = getFeatureHint(label);
	if (!hint) return <>{label}</>;
	return (
		<FeatureHintLabel label={label}>
			<FeatureHintCard
				label={label}
				description={hint}
				icon={
					icon ? (
						<CompareTitleIcon
							title={label}
							icon={icon}
							className="size-4 text-text-strong-950 dark:text-white"
						/>
					) : undefined
				}
			/>
		</FeatureHintLabel>
	);
}

/** Empty hairline row between groups, as on /pricing. */
export function GridSpacerRow() {
	return (
		<>
			<div className="col-span-full h-10 border-stroke-soft-100 border-b sm:col-span-1 sm:h-14 dark:border-white/10" />
			<div className="hidden h-14 border-stroke-soft-100 border-b border-l sm:block dark:border-white/10" />
			<div className="hidden h-14 border-stroke-soft-100 border-b border-l sm:block dark:border-white/10" />
		</>
	);
}

/** Group title row with its icon, e.g. "Sending & Receiving" or "Monthly plans". */
export function GridSectionTitle({
	label,
	icon,
}: {
	label: string;
	icon?: string;
}) {
	return (
		<>
			<div className="col-span-full flex items-center gap-2.5 border-stroke-soft-100 border-b px-4 py-4 sm:col-span-1 sm:px-7 sm:py-5 lg:px-9 dark:border-white/[0.07]">
				<CompareTitleIcon
					title={label}
					icon={icon}
					className="size-4 text-text-strong-950 dark:text-white/80"
				/>
				<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
					{label}
				</span>
			</div>
			<div className="hidden border-stroke-soft-100 border-b border-l py-5 sm:block dark:border-white/[0.07]" />
			<div className="hidden border-stroke-soft-100 border-b border-l py-5 sm:block dark:border-white/[0.07]" />
		</>
	);
}

/** One row: label, the tinted Reloop cell, then the competitor cell. */
export function GridRow({
	label,
	reloop,
	competitor,
}: {
	label: ReactNode;
	reloop: ReactNode;
	competitor: ReactNode;
}) {
	return (
		<div className="group/row col-span-full grid grid-cols-subgrid">
			<div className="col-span-full flex items-end px-4 pt-7 pb-2.5 font-medium text-[14px] text-text-strong-950 group-hover/row:bg-bg-weak-50/70 sm:col-span-1 sm:min-h-[60px] sm:items-center sm:border-stroke-soft-100 sm:border-b sm:px-7 sm:py-4 sm:font-normal lg:px-9 dark:text-white sm:dark:border-white/[0.07] dark:group-hover/row:bg-white/[0.03]">
				{label}
			</div>
			<div className="flex items-start border-stroke-soft-100 border-t border-b px-4 py-3.5 group-hover/row:bg-bg-weak-50/70 sm:min-h-[60px] sm:items-center sm:border-t-0 sm:border-l sm:px-8 sm:py-4 dark:border-white/[0.07] dark:group-hover/row:bg-white/[0.03]">
				{reloop}
			</div>
			<div className="flex items-start border-stroke-soft-100 border-t border-b border-l px-4 py-3.5 group-hover/row:bg-bg-weak-50/70 sm:min-h-[60px] sm:items-center sm:border-t-0 sm:px-8 sm:py-4 dark:border-white/[0.07] dark:group-hover/row:bg-white/[0.03]">
				{competitor}
			</div>
		</div>
	);
}

/**
 * The /pricing "Compare every plan" frame with two value columns: an
 * eyebrow + title cell, the highlighted Reloop column and the competitor
 * column, then a spacer row. Groups and rows go in as children.
 */
export function ComparisonGridFrame({
	competitorName,
	eyebrow,
	title,
	icon = competitorBrands.find((brand) => brand.name === competitorName)?.icon,
	children,
}: {
	competitorName: string;
	eyebrow: string;
	title: string;
	icon?: BrandMark;
	children: ReactNode;
}) {
	return (
		<div className="-mb-px sm:overflow-x-auto lg:overflow-visible">
			<div
				className={cn(
					"grid w-full border-stroke-soft-100 border-t sm:min-w-[560px] dark:border-white/10",
					GRID_COLS,
				)}
			>
				<div className="z-30 hidden flex-col gap-3 border-stroke-soft-100 border-b bg-bg-white-0/95 px-5 py-7 backdrop-blur-md sm:flex sm:px-7 lg:sticky lg:top-16 lg:px-9 dark:border-white/10 dark:bg-black/95">
					<p className="font-medium text-[12px] text-text-strong-950 uppercase dark:text-white">
						{eyebrow}
					</p>
					<h3 className="font-medium text-text-strong-950 leading-none dark:text-white">
						{title}
					</h3>
				</div>
				<div className="z-30 flex flex-col justify-center border-stroke-soft-100 border-b bg-bg-white-0/95 px-4 py-5 backdrop-blur-md max-sm:sticky max-sm:top-14 sm:border-l sm:px-8 sm:py-7 lg:sticky lg:top-16 dark:border-white/10 dark:bg-black/95">
					<span className="flex items-center gap-2 font-semibold text-[16px] text-text-strong-950 leading-none tracking-tight sm:gap-2.5 sm:text-[18px] dark:text-white">
						<span className="flex size-7 items-center justify-center overflow-hidden">
							<Logo className="size-10 shrink-0" />
						</span>
						Reloop
					</span>
				</div>
				<div className="z-30 flex flex-col justify-center border-stroke-soft-100 border-b border-l bg-bg-white-0/95 px-4 py-5 backdrop-blur-md max-sm:sticky max-sm:top-14 sm:px-8 sm:py-7 lg:sticky lg:top-16 dark:border-white/10 dark:bg-black/95">
					<span className="flex items-center gap-2 font-semibold text-[16px] text-text-strong-950 leading-none tracking-tight sm:gap-2.5 sm:text-[18px] dark:text-white">
						{icon ? (
							<BrandIcon
								icon={icon}
								fill="currentColor"
								className="size-6 text-text-strong-950 dark:text-white"
							/>
						) : null}
						{competitorName}
					</span>
				</div>
				<GridSpacerRow />
				{children}
			</div>
		</div>
	);
}

/** Feature comparison laid out like the /pricing comparison table, with check / cross marks. */
export function CompareFeatureGrid({
	competitorName,
	categories: categoriesProp,
	features,
	icon,
}: {
	competitorName: string;
	categories?: ComparisonCategory[];
	/** Flat list for pages without categories; rendered as one untitled section. */
	features?: ComparisonFeatureRow[];
	icon?: BrandMark;
}) {
	// Pricing rows live in the "02 · Price" section, so the feature table skips them.
	// The data keeps them for the .md twins and agent content.
	const categories = (
		categoriesProp ??
		(features ? [{ id: "features", label: "Features", features }] : [])
	).filter((category) => !category.id.startsWith("pricing"));
	const showSectionTitles = categories.length > 1;

	return (
		<ComparisonGridFrame
			competitorName={competitorName}
			eyebrow="Features"
			title={`Reloop vs ${competitorName}`}
			icon={icon}
		>
			{categories.map((category, categoryIndex) => (
				<Fragment key={category.id}>
					{categoryIndex > 0 ? <GridSpacerRow /> : null}
					{showSectionTitles ? (
						<GridSectionTitle label={category.label} icon={category.icon} />
					) : null}
					{category.features.map((row) => (
						<GridRow
							key={row.label}
							label={<RowLabel label={row.label} icon={row.icon} />}
							reloop={<GridCell cell={row.reloop} />}
							competitor={<GridCell cell={row.competitor} />}
						/>
					))}
				</Fragment>
			))}
		</ComparisonGridFrame>
	);
}
