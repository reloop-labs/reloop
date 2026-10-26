import { cn } from "@reloop/ui/cn";
import { pricingPlans } from "@reloop/web/lib/pricing";
import Link from "next/link";
import {
	type CostMode,
	type CostRow,
	costsCheckedAt,
	formatUsd,
	getCostSpotlight,
	marketingSendsPerContact,
	quoteCosts,
} from "../compare-hero-costs";
import { getCompareSource } from "../compare-sources";

/** The volumes each table walks through, from a small sender up to a large one. */
const ROW_VOLUMES: Record<CostMode, number[]> = {
	transactional: [10_000, 50_000, 100_000, 500_000, 1_000_000],
	marketing: [5_000, 10_000, 25_000, 50_000, 100_000],
};

const VOLUME_HEADER: Record<CostMode, string> = {
	transactional: "Emails a month",
	marketing: "Contacts",
};

const cheapestPaidReloop = Math.min(
	...pricingPlans.flatMap((plan) =>
		plan.monthlyPrice ? [plan.monthlyPrice] : [],
	),
);

const INTRO: Record<CostMode, string[]> = {
	transactional: [
		"The cheapest plan that covers your monthly volume. Monthly billing, in US dollars.",
		"Every Reloop plan includes the API, the SMTP relay and agent inboxes. Past the included volume, extra email is $0.50 per 1,000.",
	],
	marketing: [
		`The cheapest plan with room for your list, sending one campaign a week: about ${marketingSendsPerContact} emails per contact a month. Monthly billing, in US dollars.`,
		"Reloop counts emails sent, not contacts, so every plan holds an unlimited list.",
	],
};

function diffNote(reloop: CostRow, competitor: CostRow, name: string): string {
	const gap = Math.round((competitor.usd - reloop.usd) * 100) / 100;
	if (gap > 0) return `${formatUsd(gap)} a month less with Reloop.`;
	if (gap < 0) return `${formatUsd(-gap)} a month less on ${name}.`;
	return "Same price.";
}

function PriceCell({
	row,
	max,
	strong,
}: {
	row: CostRow;
	max: number;
	strong?: boolean;
}) {
	const width = row.usd === 0 ? 0 : Math.max(3, (row.usd / max) * 100);
	return (
		<div>
			<p className="flex items-baseline gap-2">
				<span className="font-semibold text-[1.4rem] text-text-strong-950 tabular-nums tracking-tight dark:text-white">
					{formatUsd(row.usd)}
				</span>
				<span className="text-[14px] text-text-sub-600 dark:text-white/50">
					{row.plan}
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
		</div>
	);
}

/** "02 · Price": Reloop vs one competitor across a range of volumes, from verified list prices. */
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

	const rows = ROW_VOLUMES[mode].flatMap((volume) => {
		const quotes = quoteCosts(mode, volume);
		const reloop = quotes.find((quote) => quote.id === "reloop");
		const competitor = quotes.find((quote) => quote.id === providerId);
		return reloop && competitor ? [{ volume, reloop, competitor }] : [];
	});
	const max = Math.max(
		1,
		...rows.flatMap((row) => [row.reloop.usd, row.competitor.usd]),
	);
	const source = getCompareSource(competitorName);
	const sourceLabel = source?.href
		.replace(/^https?:\/\/(www\.)?/, "")
		.replace(/\/$/, "");

	return (
		<section className="grid gap-10 border-stroke-soft-100 border-b px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:px-12 dark:border-white/10">
			<div>
				<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					02 · Price
				</span>
				<h2 className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white">
					What it costs a month
				</h2>
				<div className="mt-4 space-y-4 text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					{INTRO[mode].map((line) => (
						<p key={line}>{line}</p>
					))}
				</div>
			</div>

			<div className="min-w-0">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[520px] text-left">
						<thead>
							<tr className="border-text-strong-950 border-b text-[14px] dark:border-white/80">
								<th
									scope="col"
									className="pb-3 font-medium text-text-strong-950 dark:text-white"
								>
									{VOLUME_HEADER[mode]}
								</th>
								<th
									scope="col"
									className="pb-3 font-medium text-text-strong-950 dark:text-white"
								>
									Reloop
								</th>
								<th
									scope="col"
									className="pb-3 font-medium text-text-strong-950 dark:text-white"
								>
									{competitorName}
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr
									key={row.volume}
									className="border-stroke-soft-100 border-b align-top dark:border-white/10"
								>
									<th
										scope="row"
										className="w-[26%] py-6 pr-6 font-medium text-[1.6rem] text-text-strong-950 tabular-nums tracking-tight dark:text-white"
									>
										{new Intl.NumberFormat("en-US").format(row.volume)}
									</th>
									<td className="w-[37%] py-6 pr-8">
										<PriceCell row={row.reloop} max={max} strong />
									</td>
									<td className="w-[37%] py-6">
										<PriceCell row={row.competitor} max={max} />
										<p className="mt-3 text-[13px] text-text-sub-600 dark:text-white/45">
											{diffNote(row.reloop, row.competitor, competitorName)}
										</p>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<p className="mt-8 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
					Source:{" "}
					{source ? (
						<a
							href={source.href}
							target="_blank"
							rel="noreferrer"
							className="text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/25"
						>
							{sourceLabel}
						</a>
					) : (
						`${competitorName}'s pricing page`
					)}
					, checked {costsCheckedAt}. Reloop:{" "}
					<Link
						href="/pricing"
						className="text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/25"
					>
						pricing
					</Link>
					, from {formatUsd(cheapestPaidReloop)} a month.
				</p>
			</div>
		</section>
	);
}
