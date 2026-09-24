"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import type { DomainListResponse } from "#/features/domain/types";
import type { Campaign } from "../campaign-types";
import { listCampaignRecipients } from "../campaigns-api";
import type { CategoryTab } from "./campaign-recipient-issues-card";

function pct2(numerator: number, denominator: number): string {
	if (!denominator || denominator <= 0) return "0.00%";
	return `${((numerator / denominator) * 100).toFixed(2)}%`;
}

function BreakdownRow({
	icon,
	iconClass,
	name,
	count,
	rate,
	muted,
	onClick,
}: {
	icon: string;
	iconClass: string;
	name: string;
	count: number;
	rate: string;
	muted?: boolean;
	onClick?: () => void;
}) {
	const className = cn(
		"flex w-full items-center border-stroke-soft-100 border-b py-2.5 last:border-b-0 dark:border-stroke-soft-100/50",
		onClick && "cursor-pointer text-left",
	);
	const content = (
		<>
			<span className="flex min-w-0 flex-1 items-center gap-2">
				<Icon name={icon} className={cn("h-3.5 w-3.5 shrink-0", iconClass)} />
				<span
					className={cn(
						"truncate text-paragraph-sm",
						muted ? "text-text-sub-600" : "text-text-strong-950",
						onClick &&
							"underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400",
					)}
				>
					{name}
				</span>
			</span>
			<span className="w-12 shrink-0 text-right text-paragraph-sm text-text-sub-600 tabular-nums">
				{count.toLocaleString()}
			</span>
			<span className="w-16 shrink-0 text-right font-medium text-paragraph-sm text-text-strong-950 tabular-nums">
				{rate}
			</span>
		</>
	);

	if (onClick) {
		return (
			<button type="button" onClick={onClick} className={className}>
				{content}
			</button>
		);
	}

	return <div className={className}>{content}</div>;
}

function MetricTable({
	label,
	value,
	helper,
	children,
}: {
	label: string;
	value: string;
	helper?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex h-full w-full flex-col text-paragraph-sm">
			<div className="flex items-center justify-between gap-3 rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40">
				<span>{label}</span>
				<span className="font-semibold text-text-strong-950 tabular-nums tracking-tight">
					{value}
				</span>
			</div>
			<div className="-mt-2.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0">
				{helper ? (
					<p className="px-4 pt-2 text-paragraph-xs text-text-soft-400">
						{helper}
					</p>
				) : null}
				<div className="flex min-h-0 flex-1 flex-col px-4">{children}</div>
			</div>
		</div>
	);
}

export function CampaignMetricsCards({
	campaign,
	onSelectCategory,
}: {
	campaign: Campaign;
	onSelectCategory: (tab: CategoryTab) => void;
}) {
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

	const base = sent > 0 ? sent : delivered + failed + skipped;
	const safeBase = base > 0 ? base : 1;

	const deliverabilityPct = pct2(delivered, safeBase);
	const bouncedPct = pct2(failed, safeBase);
	const suppressedPct = pct2(suppressedCount, safeBase);
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
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-800/40 dark:bg-amber-950/30">
					<div className="flex items-start gap-2.5">
						<Icon
							name="chart-pie"
							className="mt-0.5 h-4 w-4 shrink-0 text-amber-800 dark:text-amber-200"
						/>
						<div className="min-w-0 flex-1">
							<p className="text-amber-800 text-xs leading-relaxed dark:text-amber-200">
								{bannerMessage}{" "}
								<a
									href={settingsHref}
									className="font-medium underline underline-offset-2 hover:opacity-80"
								>
									Open the settings.
								</a>
							</p>
						</div>
						<button
							type="button"
							aria-label="Dismiss"
							onClick={() => setBannerDismissed(true)}
							className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-amber-800 hover:bg-amber-900/10 dark:text-amber-200 dark:hover:bg-white/10"
						>
							<Icon name="cross" className="h-3 w-3" />
						</button>
					</div>
				</div>
			) : null}

			<div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-3">
				<MetricTable label="Deliverability" value={deliverabilityPct}>
					<BreakdownRow
						icon="check-circle"
						iconClass="text-emerald-700 dark:text-emerald-500"
						name="Delivered"
						count={delivered}
						rate={deliverabilityPct}
					/>
					<BreakdownRow
						icon="bounce"
						iconClass="text-red-800 dark:text-red-500"
						name="Bounced"
						count={failed}
						rate={bouncedPct}
						onClick={() => onSelectCategory("bounced")}
					/>
					<BreakdownRow
						icon="slash"
						iconClass="text-text-sub-600"
						name="Suppressed"
						count={suppressedCount}
						rate={suppressedPct}
						muted
						onClick={() => onSelectCategory("suppressed")}
					/>
				</MetricTable>

				<MetricTable label="Opt-out" value={unsubPct}>
					<BreakdownRow
						icon="user-minus"
						iconClass="text-red-800 dark:text-red-500"
						name="Unsubscribed"
						count={unsubCount}
						rate={unsubPct}
						onClick={() => onSelectCategory("unsubscribed")}
					/>
					<BreakdownRow
						icon="alert-triangle"
						iconClass="text-amber-500"
						name="Complained"
						count={complaintCount}
						rate={complaintPct}
						onClick={() => onSelectCategory("complained")}
					/>
				</MetricTable>

				<MetricTable
					label="Engagement"
					value={openRatePct}
					helper={
						trackingOff
							? "Tracking disabled — enable in domain settings"
							: undefined
					}
				>
					<BreakdownRow
						icon="eye-outline"
						iconClass="text-blue-500"
						name="Unique opens"
						count={opened}
						rate={openRatePct}
					/>
					<BreakdownRow
						icon="cursor-click"
						iconClass="text-violet-500"
						name="Clicks"
						count={clicked}
						rate={clickRatePct}
						onClick={() => onSelectCategory("clicked")}
					/>
				</MetricTable>
			</div>
		</div>
	);
}
