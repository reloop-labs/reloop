"use client";

import { MetricGrid } from "@fe/console/components/ui/metric-grid";
import { PageFrame, PageHeading } from "@fe/console/components/ui/page-frame";
import { SectionCard } from "@fe/console/components/ui/section-card";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { CONSOLE_QUICK_ACTIONS } from "@fe/console/constants/quick-actions";
import { adminGet } from "@fe/console/lib/admin-api";
import {
	formatNumber,
	formatRelativeTime,
	truncateId,
} from "@fe/console/lib/format";
import {
	readQuickActionUsage,
	sortByUsage,
	trackQuickAction,
} from "@fe/console/lib/quick-action-usage";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type Overview = {
	users: number;
	organizations: { total: number; active: number; suspended: number };
	domains: {
		total: number;
		active: number;
		failed: number;
		suspended: number;
	};
	emails: { sentToday: number; bouncedToday: number; failedToday: number };
	credits: { totalRemaining: number };
	support: { openConversations: number; unreadMessages: number };
	attention: Array<{
		id: string;
		severity: "critical" | "warning" | "info";
		title: string;
		description: string;
		href: string;
		count: number;
	}>;
	recentAudit: Array<{
		id: string;
		actorUserId: string;
		actorEmail: string | null;
		actorName: string | null;
		action: string;
		resourceType: string;
		resourceId: string | null;
		organizationId: string | null;
		createdAt: string;
	}>;
};

function openCommandPalette() {
	window.dispatchEvent(new Event("console:open-command-palette"));
}

function severityDot(severity: Overview["attention"][number]["severity"]) {
	if (severity === "critical") return "bg-error-base";
	if (severity === "warning") return "bg-orange-500";
	return "bg-text-sub-600";
}

export default function OverviewPage() {
	const [usageTick, setUsageTick] = useState(0);
	const { data, isLoading, error } = useSWR<Overview>(
		"/api/console/v1/overview",
		() => adminGet<Overview>("/overview"),
		{ refreshInterval: 30_000 },
	);

	useEffect(() => {
		setUsageTick((n) => n + 1);
	}, []);

	const rankedQuickActions = useMemo(() => {
		void usageTick;
		return sortByUsage(CONSOLE_QUICK_ACTIONS, readQuickActionUsage()).slice(
			0,
			6,
		);
	}, [usageTick]);

	return (
		<PageFrame>
			<PageHeading
				title="Overview"
				description="Platform health and queues — open full hubs from any signal, not thin lists."
				actions={
					<button
						type="button"
						onClick={openCommandPalette}
						className="inline-flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-[13px] text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:bg-transparent dark:hover:bg-white/5"
					>
						<Icon name="search" className="h-4 w-4" />
						<span>Search platform</span>
						<span className="ml-1 hidden items-center gap-0.5 sm:inline-flex">
							<KbdKeyOutline className="h-[18px] w-auto min-w-[18px] px-1 font-sans text-[10px] text-text-soft-400">
								⌘
							</KbdKeyOutline>
							<KbdKeyOutline className="h-[18px] w-auto min-w-[18px] px-1 font-sans text-[10px] text-text-soft-400">
								K
							</KbdKeyOutline>
						</span>
					</button>
				}
			/>

			{error ? (
				<p className="text-error-base text-paragraph-sm">
					Failed to load overview. Ensure the admin API is running and you are a
					platform super-admin.
				</p>
			) : null}

			{isLoading || !data ? (
				<p className="text-paragraph-sm text-text-sub-600">Loading…</p>
			) : (
				<div className="space-y-6">
					<section className="space-y-3">
						<div className="flex items-center justify-between gap-2">
							<h2 className="font-semibold text-[13px] text-text-strong-950">
								Needs attention
							</h2>
							{data.attention.length === 0 ? (
								<span className="text-[12px] text-text-sub-600">All clear</span>
							) : null}
						</div>
						{data.attention.length === 0 ? (
							<div className="rounded-2xl border border-stroke-soft-200 border-dashed px-4 py-8 text-center text-[13px] text-text-sub-600">
								No critical queues. Use ⌘K or quick actions when a ticket comes
								in.
							</div>
						) : (
							<div className="grid gap-2">
								{data.attention.map((item) => (
									<Link
										key={item.id}
										href={item.href}
										className="flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-3.5 transition-colors hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c] dark:hover:bg-white/[0.03]"
									>
										<span
											className={cn(
												"mt-0.5 h-2 w-2 shrink-0 rounded-full",
												severityDot(item.severity),
											)}
										/>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<p className="font-medium text-[13px] text-text-strong-950">
													{item.title}
												</p>
												<span className="rounded-full bg-bg-weak-50 px-2 py-0.5 font-semibold text-[10px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
													{item.count}
												</span>
											</div>
											<p className="mt-0.5 text-[12px] text-text-sub-600">
												{item.description}
											</p>
										</div>
										<span className="shrink-0 text-[12px] text-text-sub-600">
											Investigate →
										</span>
									</Link>
								))}
							</div>
						)}
					</section>

					<section className="space-y-3">
						<div className="flex items-center justify-between gap-2">
							<h2 className="font-semibold text-[13px] text-text-strong-950">
								Quick actions
							</h2>
							<span className="text-[11px] text-text-sub-600">
								Ranked by your recent use
							</span>
						</div>
						<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
							{rankedQuickActions.map((action) => {
								const className =
									"flex items-start gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left transition-colors hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c] dark:hover:bg-white/[0.03]";
								const body = (
									<>
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-weak-50 dark:bg-white/[0.06]">
											<Icon
												name={action.iconName}
												className="h-4 w-4 text-text-sub-600"
											/>
										</span>
										<span className="min-w-0">
											<span className="block font-medium text-[13px] text-text-strong-950">
												{action.label}
											</span>
											<span className="mt-0.5 block text-[12px] text-text-sub-600">
												{action.description}
											</span>
										</span>
									</>
								);
								if (action.isSearch) {
									return (
										<button
											key={action.id}
											type="button"
											onClick={() => {
												trackQuickAction(action.id);
												setUsageTick((n) => n + 1);
												openCommandPalette();
											}}
											className={className}
										>
											{body}
										</button>
									);
								}
								return (
									<Link
										key={action.id}
										href={action.href}
										className={className}
										onClick={() => {
											trackQuickAction(action.id);
											setUsageTick((n) => n + 1);
										}}
									>
										{body}
									</Link>
								);
							})}
						</div>
					</section>

					<section className="space-y-3">
						<h2 className="font-semibold text-[13px] text-text-strong-950">
							Platform health
						</h2>
						<MetricGrid
							items={[
								{
									label: "Users",
									value: formatNumber(data.users),
									href: "/users",
								},
								{
									label: "Organizations",
									value: formatNumber(data.organizations.total),
									hint: `${data.organizations.active} active · ${data.organizations.suspended} suspended`,
									href: "/organizations",
								},
								{
									label: "Domains",
									value: formatNumber(data.domains.total),
									hint: `${data.domains.failed} failed · ${data.domains.suspended} suspended`,
									href: "/domains",
									tone: data.domains.failed > 0 ? "danger" : "default",
								},
								{
									label: "Emails today",
									value: formatNumber(data.emails.sentToday),
									hint: `${data.emails.failedToday} failed · ${data.emails.bouncedToday} bounced`,
									href: "/emails",
									tone:
										data.emails.failedToday > 0 || data.emails.bouncedToday > 0
											? "warning"
											: "default",
								},
								{
									label: "Credits remaining",
									value: formatNumber(data.credits.totalRemaining),
									hint: "Sum across all orgs · open an org hub to top up",
									href: "/organizations",
								},
								{
									label: "Support unread",
									value: formatNumber(data.support.unreadMessages),
									hint: `${data.support.openConversations} open threads`,
									href: "/support",
									tone: data.support.unreadMessages > 0 ? "warning" : "default",
								},
								{
									label: "Failed domains",
									value: formatNumber(data.domains.failed),
									href: "/domains?status=failed",
									tone: data.domains.failed > 0 ? "danger" : "success",
								},
								{
									label: "Failed emails today",
									value: formatNumber(data.emails.failedToday),
									href: "/emails?status=failed",
									tone: data.emails.failedToday > 0 ? "danger" : "success",
								},
							]}
						/>
					</section>

					<SectionCard
						title="Recent admin activity"
						action={
							<Link
								href="/audit"
								className="text-[12px] text-primary-base hover:underline"
							>
								Full audit log →
							</Link>
						}
					>
						{data.recentAudit.length === 0 ? (
							<p className="px-4 py-8 text-center text-[13px] text-text-sub-600">
								No admin actions recorded yet.
							</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full min-w-[640px] text-left text-[13px]">
									<thead>
										<tr className="border-stroke-soft-100 border-b text-[11px] text-text-sub-600 uppercase tracking-wide dark:border-stroke-soft-100/40">
											<th className="px-4 py-2.5 font-medium">When</th>
											<th className="px-4 py-2.5 font-medium">Actor</th>
											<th className="px-4 py-2.5 font-medium">Action</th>
											<th className="px-4 py-2.5 font-medium">Resource</th>
										</tr>
									</thead>
									<tbody>
										{data.recentAudit.map((row) => (
											<tr
												key={row.id}
												className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
											>
												<td className="whitespace-nowrap px-4 py-3 text-text-sub-600">
													{formatRelativeTime(row.createdAt)}
												</td>
												<td className="px-4 py-3">
													{row.actorEmail ?? row.actorName ?? row.actorUserId}
												</td>
												<td className="px-4 py-3">
													<span className="font-medium">{row.action}</span>
												</td>
												<td className="px-4 py-3 text-text-sub-600">
													{row.organizationId ? (
														<Link
															href={`/organizations/${row.organizationId}`}
															className="inline-flex items-center gap-1.5 hover:underline"
														>
															{row.resourceType}
															{row.resourceId
																? ` · ${truncateId(row.resourceId)}`
																: ""}
															<StatusPill status="org" tone="blue" />
														</Link>
													) : (
														<span>
															{row.resourceType}
															{row.resourceId
																? ` · ${truncateId(row.resourceId)}`
																: ""}
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</SectionCard>
				</div>
			)}
		</PageFrame>
	);
}
