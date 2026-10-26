import { cn } from "@reloop/ui/cn";
import { creditPack, pricingPlans } from "@reloop/web/lib/pricing";
import Link from "next/link";
import { Fragment } from "react";
import {
	type CostMode,
	costsCheckedAt,
	formatUsd,
	getCostSpotlight,
	marketingSendsPerContact,
	quoteCosts,
} from "../compare-hero-costs";
import { getCompareSource } from "../compare-sources";
import {
	ComparisonGridFrame,
	GridRow,
	GridSectionTitle,
	GridSpacerRow,
} from "./compare-feature-grid";

/** The volumes each comparison walks through, from a small sender up to a large one. */
const ROW_VOLUMES: Record<CostMode, number[]> = {
	transactional: [10_000, 50_000, 100_000, 500_000, 1_000_000],
	marketing: [5_000, 10_000, 25_000, 50_000, 100_000],
};

const freeMonthlyEmails = Number(
	(
		pricingPlans.find((plan) => plan.id === "free")?.comparison.monthlyEmails ??
		"6000"
	).replace(/,/g, ""),
);

const cheapestPaidPlan = Math.min(
	...pricingPlans.flatMap((plan) =>
		plan.monthlyPrice ? [plan.monthlyPrice] : [],
	),
);

/** Emails a month for a row: the volume itself, or contacts × weekly sends. */
function monthlySends(mode: CostMode, volume: number) {
	return mode === "marketing"
		? Math.round(volume * marketingSendsPerContact)
		: volume;
}

/** Pay as you go: the free monthly allowance, then credits for the rest. */
function creditsCost(sends: number) {
	const paid = Math.max(0, sends - freeMonthlyEmails);
	return (paid / 1000) * creditPack.usdPerThousand;
}

const count = (value: number) => new Intl.NumberFormat("en-US").format(value);

function diffNote(reloopUsd: number, competitorUsd: number, name: string) {
	const gap = Math.round((competitorUsd - reloopUsd) * 100) / 100;
	if (gap > 0) return `${formatUsd(gap)} a month less with Reloop.`;
	if (gap < 0) return `${formatUsd(-gap)} a month less on ${name}.`;
	return "Same price.";
}

function PriceCell({
	usd,
	label,
	max,
	strong,
	note,
}: {
	usd: number;
	label: string;
	max: number;
	strong?: boolean;
	note?: string;
}) {
	const width = usd === 0 ? 0 : Math.max(3, (usd / max) * 100);
	return (
		<div>
			<p className="flex items-baseline gap-2">
				<span className="font-semibold text-[1.35rem] text-text-strong-950 tabular-nums leading-none tracking-tight dark:text-white">
					{usd === 0 ? "Free" : formatUsd(usd)}
				</span>
				<span className="text-[13px] text-text-sub-600 dark:text-white/50">
					{label}
				</span>
			</p>
			<span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/[0.07]">
				<span
					className={cn(
						"block h-full rounded-full",
						strong
							? "bg-text-strong-950 dark:bg-white"
							: "bg-text-soft-400 dark:bg-white/30",
					)}
					style={{ width: `${width}%` }}
				/>
			</span>
			{note ? (
				<p className="mt-2.5 text-[13px] text-text-sub-600 dark:text-white/45">
					{note}
				</p>
			) : null}
		</div>
	);
}

type CostRowData = {
	volume: number;
	/** Optional line under Reloop's bar, e.g. how long credits last. */
	reloop: { usd: number; label: string; note?: string };
	competitor: { usd: number; label: string };
};

function volumeLabel(mode: CostMode, volume: number) {
	return mode === "marketing"
		? `${count(volume)} contacts`
		: `${count(volume)} emails`;
}

/**
 * "02 · Price": the same /pricing-style grid as the feature table, with a
 * Monthly plans group and a Credits group. Prices are verified list prices.
 */
export function CompareCostSection({
	providerId,
	competitorName,
}: {
	providerId: string;
	competitorName: string;
}) {
	const spotlight = getCostSpotlight(providerId);
	if (!spotlight) return null;
	const { mode } = spotlight;

	const quoted = ROW_VOLUMES[mode].flatMap((volume) => {
		const quotes = quoteCosts(mode, volume);
		const plan = quotes.find((quote) => quote.id === "reloop");
		const competitor = quotes.find((quote) => quote.id === providerId);
		if (!plan || !competitor) return [];
		return [
			{
				volume,
				plan,
				credits: creditsCost(monthlySends(mode, volume)),
				competitor: { usd: competitor.usd, label: competitor.plan },
			},
		];
	});
	const max = Math.max(
		1,
		...quoted.flatMap((row) => [row.plan.usd, row.credits, row.competitor.usd]),
	);
	const groups: {
		id: string;
		label: string;
		icon: string;
		rows: CostRowData[];
	}[] = [
		{
			id: "plans",
			label: "Monthly plans",
			icon: "refresh",
			rows: quoted.map((row) => ({
				volume: row.volume,
				reloop: { usd: row.plan.usd, label: row.plan.plan },
				competitor: row.competitor,
			})),
		},
		{
			id: "credits",
			label: "Pay as you go",
			icon: "invoice",
			rows: quoted.map((row) => ({
				volume: row.volume,
				reloop: {
					usd: row.credits,
					label: "Pay as you go",
					note: `Credits, valid for ${creditPack.validityMonths} months`,
				},
				competitor: row.competitor,
			})),
		},
	];
	const source = getCompareSource(competitorName);
	const sourceLabel = source?.href
		.replace(/^https?:\/\/(www\.)?/, "")
		.replace(/\/$/, "");
	const linkClass =
		"text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/25";

	return (
		<section className="border-stroke-soft-100 border-b dark:border-white/10">
			<div className="px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
				<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					02 · Price
				</span>
				<h2 className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white">
					What it costs a month
				</h2>
				<p className="mt-3 max-w-2xl text-pretty text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					{mode === "marketing"
						? `Sending one campaign a week, about ${marketingSendsPerContact} emails per contact a month. Reloop counts emails sent, not contacts.`
						: "The cheapest way to pay for each monthly volume, in US dollars."}{" "}
					Plans start at {formatUsd(cheapestPaidPlan)} a month. Or pay as you
					go, with no subscription: the first {count(freeMonthlyEmails)} emails
					each month are free, then ${creditPack.usdPerThousand.toFixed(2)} per
					1,000 you send. Prepaid emails last {creditPack.validityMonths}{" "}
					months.
				</p>
				<p className="mt-3 text-[13px] text-text-sub-600 dark:text-white/45">
					Source:{" "}
					{source ? (
						<a
							href={source.href}
							target="_blank"
							rel="noreferrer"
							className={linkClass}
						>
							{sourceLabel}
						</a>
					) : (
						`${competitorName}'s pricing page`
					)}
					, checked {costsCheckedAt}. Reloop:{" "}
					<Link href="/pricing" className={linkClass}>
						pricing
					</Link>
					.
				</p>
			</div>

			<ComparisonGridFrame
				competitorName={competitorName}
				eyebrow="Price"
				title={`Reloop vs ${competitorName}`}
			>
				{groups.map((group, groupIndex) => (
					<Fragment key={group.id}>
						{groupIndex > 0 ? <GridSpacerRow /> : null}
						<GridSectionTitle label={group.label} icon={group.icon} />
						{group.rows.map((row) => (
							<GridRow
								key={row.volume}
								label={
									<span className="font-medium tabular-nums">
										{volumeLabel(mode, row.volume)}
									</span>
								}
								reloop={
									<div className="w-full py-1">
										<PriceCell
											usd={row.reloop.usd}
											label={row.reloop.label}
											max={max}
											strong
											note={row.reloop.note}
										/>
									</div>
								}
								competitor={
									<div className="w-full py-1">
										<PriceCell
											usd={row.competitor.usd}
											label={row.competitor.label}
											max={max}
											note={diffNote(
												row.reloop.usd,
												row.competitor.usd,
												competitorName,
											)}
										/>
									</div>
								}
							/>
						))}
					</Fragment>
				))}
			</ComparisonGridFrame>
		</section>
	);
}
