import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";
import {
	type CostSpotlight,
	costsCheckedAt,
	formatUsd,
} from "../compare-hero-costs";
import type { CompareSource } from "../compare-sources";
import type { ComparisonFeatureRow } from "../compare-types";
import { comparisonCellText } from "../compare-types";
import { BrandIcon } from "./brand-icon";

function isDarkBrandHex(hex: string) {
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
}

function BrandPill({ children }: { children: ReactNode }) {
	return (
		<span className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3.5 font-semibold text-[15px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
			{children}
		</span>
	);
}

function planNote(plan: string) {
	return /plan|pay as you go/i.test(plan) ? plan : `${plan} plan`;
}

/** Two prices side by side with a vs badge on the seam. */
function SpotlightCard({
	competitorName,
	spotlight,
	source,
}: {
	competitorName: string;
	spotlight: CostSpotlight;
	source?: CompareSource | null;
}) {
	return (
		<div>
			<p className="text-center font-mono text-[12px] text-text-sub-600 dark:text-white/45">
				{spotlight.volumeLabel}
			</p>
			<div className="relative mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-white/10">
				<div className="bg-bg-white-0 p-6 sm:p-8 dark:bg-white/[0.03]">
					<p className="font-medium text-[15px] text-text-strong-950 dark:text-white">
						Reloop
					</p>
					<p className="mt-5 font-semibold text-[2.75rem] text-text-strong-950 tabular-nums leading-none tracking-[-0.04em] sm:text-[3.5rem] dark:text-white">
						{formatUsd(spotlight.reloop.usd)}
					</p>
					<p className="mt-3 text-[14px] text-text-sub-600 dark:text-white/50">
						a month
					</p>
					<p className="mt-6 text-[13px] text-text-sub-600 leading-snug dark:text-white/45">
						{planNote(spotlight.reloop.plan)}, API, SMTP and inbox included
					</p>
				</div>
				<div className="border-stroke-soft-100 border-l bg-bg-weak-50 p-6 sm:p-8 dark:border-white/10 dark:bg-white/[0.06]">
					<p className="font-medium text-[15px] text-text-strong-950 dark:text-white">
						{competitorName}
					</p>
					<p className="mt-5 font-semibold text-[2.75rem] text-text-sub-600 tabular-nums leading-none tracking-[-0.04em] sm:text-[3.5rem] dark:text-white/55">
						{formatUsd(spotlight.competitor.usd)}
					</p>
					<p className="mt-3 text-[14px] text-text-sub-600 dark:text-white/50">
						a month
					</p>
					<p className="mt-6 text-[13px] text-text-sub-600 leading-snug dark:text-white/45">
						{planNote(spotlight.competitor.plan)}
					</p>
				</div>
				<span
					aria-hidden
					className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex size-10 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 font-medium text-[12px] text-text-sub-600 dark:border-white/10 dark:bg-black dark:text-white/50"
				>
					vs
				</span>
			</div>
			<p className="mt-4 text-center text-[12.5px] text-text-sub-600 dark:text-white/40">
				Monthly billing in US dollars. {competitorName}&apos;s price from{" "}
				{source ? (
					<a
						href={source.href}
						target="_blank"
						rel="noreferrer"
						className="underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:text-text-strong-950 dark:decoration-white/20 dark:hover:text-white"
					>
						its pricing page
					</a>
				) : (
					"its pricing page"
				)}
				, {costsCheckedAt}.
			</p>
		</div>
	);
}

/** Without verified prices, show the first rows of the written comparison instead. */
function HighlightsCard({
	competitorName,
	rows,
}: {
	competitorName: string;
	rows: ComparisonFeatureRow[];
}) {
	return (
		<div>
			<p className="text-center font-mono text-[12px] text-text-sub-600 dark:text-white/45">
				At a glance
			</p>
			<div className="mt-4 overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-white/10">
				<table className="w-full text-left text-[13.5px]">
					<thead className="bg-bg-weak-50 dark:bg-white/[0.04]">
						<tr>
							<th scope="col" className="px-4 py-3 font-normal">
								<span className="sr-only">Feature</span>
							</th>
							<th
								scope="col"
								className="px-4 py-3 font-medium text-text-strong-950 dark:text-white"
							>
								Reloop
							</th>
							<th
								scope="col"
								className="px-4 py-3 font-medium text-text-strong-950 dark:text-white"
							>
								{competitorName}
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr
								key={row.label}
								className="border-stroke-soft-100 border-t align-top dark:border-white/10"
							>
								<th
									scope="row"
									className="px-4 py-3 font-normal text-text-sub-600 dark:text-white/50"
								>
									{row.label}
								</th>
								<td className="px-4 py-3 font-medium text-text-strong-950 dark:text-white">
									{comparisonCellText(row.reloop)}
								</td>
								<td className="px-4 py-3 text-text-sub-600 dark:text-white/60">
									{comparisonCellText(row.competitor)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/** Compare top fold: copy and actions on the left, the price (or key facts) on the right. */
export function CompareHero({
	titleLines,
	competitorName,
	icon,
	description,
	spotlight,
	source,
	highlights,
	migrationHref,
}: {
	titleLines: string[];
	competitorName?: string;
	icon?: Pick<SimpleIcon, "hex" | "path">;
	description?: string;
	spotlight?: CostSpotlight | null;
	source?: CompareSource | null;
	highlights?: ComparisonFeatureRow[];
	migrationHref?: string;
}) {
	const name =
		competitorName ??
		titleLines
			.join(" ")
			.match(/\bvs\s+(.+)$/i)?.[1]
			?.trim() ??
		"Competitor";
	const title = titleLines.join(" ");
	const competitorIsDark = icon ? isDarkBrandHex(icon.hex) : false;

	return (
		<section className="w-full border-stroke-soft-100 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="grid gap-12 px-4 pt-28 pb-16 sm:px-10 sm:pt-36 sm:pb-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-12">
				<div className="min-w-0">
					<nav
						aria-label="Breadcrumb"
						className="flex items-center gap-2 text-[14px] text-text-sub-600 dark:text-white/50"
					>
						<Link
							href="/compare"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							Compare
						</Link>
						<span aria-hidden className="text-text-soft-400 dark:text-white/25">
							/
						</span>
						<span className="text-text-strong-950 dark:text-white">{name}</span>
					</nav>

					<div className="mt-7 flex items-center gap-3">
						<BrandPill>
							<span className="flex size-6 items-center justify-center overflow-hidden">
								<Logo className="size-8 shrink-0" />
							</span>
							Reloop
						</BrandPill>
						<span className="text-[14px] text-text-sub-600 dark:text-white/40">
							vs
						</span>
						<BrandPill>
							{icon ? (
								<BrandIcon
									icon={icon}
									fill={competitorIsDark ? "currentColor" : `#${icon.hex}`}
									className={cn(
										"size-5",
										competitorIsDark && "text-text-strong-950 dark:text-white",
									)}
								/>
							) : null}
							{name}
						</BrandPill>
					</div>

					<h1 className="mt-6 text-balance font-semibold text-[2.5rem] text-text-strong-950 leading-[1.04] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
						{title}
					</h1>
					{description ? (
						<p className="mt-5 max-w-[40rem] text-pretty text-[15px] text-text-sub-600 leading-relaxed sm:text-[18px] dark:text-white/60">
							{description}
						</p>
					) : null}

					<div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
						>
							<a href={hostedSignupHref}>
								Get started
								<Icon name="arrow-right" className="size-4" />
							</a>
						</FancyButton.Root>
						{migrationHref ? (
							<FancyButton.Root
								asChild
								variant="basic"
								size="medium"
								className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
							>
								<Link href={migrationHref}>Migration guide</Link>
							</FancyButton.Root>
						) : null}
					</div>
				</div>

				{spotlight ? (
					<SpotlightCard
						competitorName={name}
						spotlight={spotlight}
						source={source}
					/>
				) : highlights && highlights.length > 0 ? (
					<HighlightsCard competitorName={name} rows={highlights} />
				) : null}
			</div>
		</section>
	);
}
