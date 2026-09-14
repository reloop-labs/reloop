"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { DomainListResponse } from "#/features/domain/types";
import type { Campaign } from "../campaign-types";
import { listCampaignRecipients } from "../campaigns-api";

function pct2(numerator: number, denominator: number): string {
	if (!denominator || denominator <= 0) return "0.00%";
	return `${((numerator / denominator) * 100).toFixed(2)}%`;
}

function BreakdownRow({
	dot,
	name,
	count,
	rate,
	muted,
}: {
	dot?: string;
	name: string;
	count: number;
	rate: string;
	muted?: boolean;
}) {
	return (
		<div className="flex items-center justify-between gap-3 border-stroke-soft-100 border-b py-3 last:border-b-0 dark:border-neutral-800">
			<span className="flex min-w-0 items-center gap-2">
				{dot ? (
					<span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
				) : null}
				<span
					className={cn(
						"truncate text-[13px]",
						muted ? "text-text-sub-600" : "text-text-strong-950",
					)}
				>
					{name}
				</span>
			</span>
			<span className="flex shrink-0 items-baseline gap-2 tabular-nums">
				<span className="text-[13px] text-text-sub-600">
					{count.toLocaleString()}
				</span>
				<span className="min-w-[52px] text-right font-medium text-[13px] text-text-strong-950">
					{rate}
				</span>
			</span>
		</div>
	);
}

export function CampaignMetricsCards({ campaign }: { campaign: Campaign }) {
	const campaignId = campaign.id;
	const [bannerDismissed, setBannerDismissed] = useState(false);

	const countsQuery = useQuery({
		queryKey: ["campaign-recipient-counts", campaignId],
		queryFn: () => listCampaignRecipients(campaignId, { page: 1, limit: 1 }),
		enabled: campaign.status !== "draft",
		staleTime: 30_000,
	});

	const domainsQuery = useQuery({
		queryKey: ["campaign-metrics-domains"],
		queryFn: async (): Promise<DomainListResponse> => {
			const res = await fetch("/api/domain/v1/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to load domains");
			return (await res.json()) as DomainListResponse;
		},
		enabled: campaign.status !== "draft",
		staleTime: 60_000,
		retry: false,
	});

	const counts = countsQuery.data?.counts;
	const unsubCount = counts?.unsubscribed ?? 0;
	const complaintCount = counts?.complained ?? 0;
	const suppressedCount = counts?.suppressed ?? 0;

	const sent = campaign.sentCount ?? 0;
	const delivered = campaign.deliveredCount ?? 0;
	const opened = campaign.openedCount ?? 0;
	const clicked = campaign.clickedCount ?? 0;
	const failed = campaign.failedCount ?? 0;
	const skipped = campaign.skippedCount ?? 0;

	const openRatePct = pct2(opened, delivered);
	const clickRatePct = pct2(clicked, delivered);

	// Breakdown base: prefer sent, fall back to delivery totals
	const base = sent > 0 ? sent : delivered + failed + suppressedCount + skipped;
	const safeBase = base > 0 ? base : 1;
	const suppressedTotal = suppressedCount > 0 ? suppressedCount : skipped;

	const deliverabilityPct = pct2(delivered, safeBase);
	const bouncedPct = pct2(failed, safeBase);
	const suppressedPct = pct2(suppressedTotal, safeBase);
	const unsubPct = pct2(unsubCount, safeBase);
	const complaintPct = pct2(complaintCount, safeBase);

	// Domain tracking detection for banner + per-card states
	const fromDomain = campaign.fromEmail?.split("@")[1]?.toLowerCase() ?? "";
	const matchedDomain = domainsQuery.data?.domains?.find((d) => {
		const name = d.domain.toLowerCase();
		return fromDomain === name || fromDomain.endsWith(`.${name}`);
	});
	const openTrackingOff = matchedDomain
		? !matchedDomain.isOpenTrackingEnabled
		: false;
	const clickTrackingOff = matchedDomain
		? !matchedDomain.isClickTrackingEnabled
		: false;
	const trackingOff = openTrackingOff && clickTrackingOff;
	const showBanner = (openTrackingOff || clickTrackingOff) && !bannerDismissed;
	const settingsHref = matchedDomain
		? `/domain/${matchedDomain.id}`
		: "/domain";

	const bannerMessage = trackingOff
		? "You are currently unable to view click and open metrics because tracking has not been enabled on the domain."
		: openTrackingOff
			? "You are currently unable to view open metrics because open tracking has not been enabled on the domain."
			: "You are currently unable to view click metrics because click tracking has not been enabled on the domain.";

	return (
		<div className="space-y-3">
			{showBanner ? (
				<div className="flex items-start gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50 px-4 py-3.5 dark:border-neutral-800 dark:bg-neutral-900">
					<Icon
						name="chart-pie"
						className="mt-0.5 h-4 w-4 shrink-0 text-text-sub-600"
					/>
					<div className="min-w-0 flex-1">
						<p className="text-[13px] text-text-strong-950 leading-5">
							{bannerMessage}
						</p>
						<a
							href={settingsHref}
							className="mt-0.5 inline-block text-[13px] text-text-sub-600 underline-offset-2 hover:underline"
						>
							Open the settings.
						</a>
					</div>
					<button
						type="button"
						aria-label="Dismiss"
						onClick={() => setBannerDismissed(true)}
						className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-strong-950 hover:bg-neutral-alpha-10"
					>
						<Icon name="cross" className="h-3.5 w-3.5" />
					</button>
				</div>
			) : null}

			{/* Metric cards: deliverability + opt-out + engagement */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950">
					<p className="font-medium text-[13px] text-text-sub-600 uppercase tracking-wide">
						Deliverability
					</p>
					<p className="mt-2 font-medium text-[28px] text-text-strong-950 tabular-nums leading-9 tracking-tight">
						{deliverabilityPct}
					</p>
					<div className="mt-3">
						<BreakdownRow
							dot="bg-emerald-700 dark:bg-emerald-500"
							name="Delivered"
							count={delivered}
							rate={deliverabilityPct}
						/>
						<BreakdownRow
							dot="bg-red-800 dark:bg-red-500"
							name="Bounced"
							count={failed}
							rate={bouncedPct}
						/>
						<BreakdownRow
							name="Suppressed"
							count={suppressedTotal}
							rate={suppressedPct}
							muted
						/>
					</div>
				</div>

				<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950">
					<p className="font-medium text-[13px] text-text-sub-600 uppercase tracking-wide">
						Opt-out
					</p>
					<p className="mt-2 font-medium text-[28px] text-text-strong-950 tabular-nums leading-9 tracking-tight">
						{unsubPct}
					</p>
					<div className="mt-3">
						<BreakdownRow
							dot="bg-red-800 dark:bg-red-500"
							name="Unsubscribed"
							count={unsubCount}
							rate={unsubPct}
						/>
						<BreakdownRow
							dot="bg-amber-500"
							name="Complained"
							count={complaintCount}
							rate={complaintPct}
						/>
					</div>
				</div>

				<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950">
					<p className="font-medium text-[13px] text-text-sub-600 uppercase tracking-wide">
						Engagement
					</p>
					<p className="mt-2 font-medium text-[28px] text-text-strong-950 tabular-nums leading-9 tracking-tight">
						{openRatePct}
					</p>
					{trackingOff ? (
						<p className="mt-1 text-[13px] text-text-sub-600 leading-5">
							Tracking disabled — enable in domain settings
						</p>
					) : null}
					<div className="mt-3">
						<BreakdownRow
							dot="bg-blue-500"
							name="Unique opens"
							count={opened}
							rate={openRatePct}
						/>
						<BreakdownRow
							dot="bg-violet-500"
							name="Clicks"
							count={clicked}
							rate={clickRatePct}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
