"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useDeferredValue, useState } from "react";
import { toast } from "sonner";
import {
	type CampaignRecipient,
	type DeliverabilityCategory,
	listCampaignRecipients,
} from "../campaigns-api";

type CategoryTab = "unsubscribed" | "bounced" | "suppressed" | "complained";

const TABS: Array<{
	id: CategoryTab;
	label: string;
}> = [
	{ id: "unsubscribed", label: "Unsubscribed" },
	{ id: "bounced", label: "Bounced" },
	{ id: "suppressed", label: "Suppressed" },
	{ id: "complained", label: "Complained" },
];

function getCategoryBadge(category?: DeliverabilityCategory | string) {
	switch (category) {
		case "unsubscribed":
			return {
				label: "Unsubscribed",
				className:
					"bg-rose-50 text-rose-600 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
			};
		case "bounced":
			return {
				label: "Bounced",
				className:
					"bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
			};
		case "suppressed":
			return {
				label: "Suppressed",
				className:
					"bg-neutral-100 text-neutral-600 border border-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700/80",
			};
		case "complained":
			return {
				label: "Complained",
				className:
					"bg-red-50 text-red-600 border border-red-200/70 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40",
			};
		default:
			return {
				label: category || "Issue",
				className:
					"bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300",
			};
	}
}

function getInitial(email: string, name?: string): string {
	if (name && name.trim()) return name.trim().charAt(0).toUpperCase();
	if (email && email.trim()) return email.trim().charAt(0).toUpperCase();
	return "?";
}

interface CampaignRecipientIssuesCardProps {
	campaignId: string;
	className?: string;
}

export function CampaignRecipientIssuesCard({
	campaignId,
	className,
}: CampaignRecipientIssuesCardProps) {
	const [activeTab, setActiveTab] = useState<CategoryTab>("unsubscribed");
	const [searchQuery, setSearchQuery] = useState("");

	const deferredSearch = useDeferredValue(searchQuery);

	const {
		data,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: [
			"campaign-recipients-card",
			campaignId,
			activeTab,
			deferredSearch,
		],
		queryFn: () =>
			listCampaignRecipients(campaignId, {
				category: activeTab,
				search: deferredSearch.trim() || undefined,
				page: 1,
				limit: 50,
			}),
		placeholderData: (prev) => prev,
	});

	const counts = data?.counts;
	const recipients = data?.recipients ?? [];

	const handleCopyEmails = useCallback((list: CampaignRecipient[]) => {
		if (!list.length) {
			toast.info("No recipients to copy");
			return;
		}
		const text = list.map((r) => r.email).join("\n");
		void navigator.clipboard.writeText(text);
		toast.success(`Copied ${list.length} email${list.length === 1 ? "" : "s"}`);
	}, []);

	const handleExportCsv = useCallback(
		(list: CampaignRecipient[]) => {
			if (!list.length) {
				toast.info("No recipients to export");
				return;
			}
			const header = "Email,Status,Category,Error,Contact Name\n";
			const rows = list
				.map((r) =>
					[
						`"${r.email}"`,
						`"${r.status || ""}"`,
						`"${r.category || activeTab}"`,
						`"${(r.error || "").replace(/"/g, '""')}"`,
						`"${(r.contactName || "").replace(/"/g, '""')}"`,
					].join(","),
				)
				.join("\n");
			const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `campaign-${campaignId}-${activeTab}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success("CSV downloaded");
		},
		[activeTab, campaignId],
	);

	return (
		<div
			className={cn(
				"overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 dark:border-stroke-soft-100/50 dark:bg-neutral-950",
				className,
			)}
		>
			{/* Top bar: Tabs on left, Actions menu on right */}
			<div className="flex items-center justify-between gap-3">
				{/* Tabs */}
				<div className="flex items-center gap-1">
					{TABS.map((tab) => {
						const isActive = activeTab === tab.id;
						const count = counts?.[tab.id];

						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-paragraph-sm transition-all",
									isActive
										? "bg-neutral-alpha-10 text-text-strong-950 dark:bg-neutral-800/80"
										: "text-text-sub-600 hover:bg-neutral-alpha-6 hover:text-text-strong-950 dark:hover:bg-neutral-900",
								)}
							>
								<span>{tab.label}</span>
								{typeof count === "number" && count > 0 && (
									<span
										className={cn(
											"rounded-full px-1.5 py-0.2 text-[10px] tabular-nums",
											isActive
												? "bg-bg-white-0 text-text-strong-950 shadow-xs dark:bg-neutral-700"
												: "bg-neutral-alpha-10 text-text-sub-600 dark:bg-neutral-800",
										)}
									>
										{count}
									</span>
								)}
							</button>
						);
					})}
				</div>

				{/* Right ... menu */}
				<Dropdown.Root>
					<Dropdown.Trigger asChild>
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							className="aspect-square h-8 w-8 rounded-xl p-0 text-text-sub-600 hover:text-text-strong-950"
							aria-label="More options"
						>
							<Icon name="more-horizontal" className="h-4 w-4" />
						</Button.Root>
					</Dropdown.Trigger>
					<Dropdown.Content align="end" className="w-52">
						<Dropdown.Item
							onClick={() => handleCopyEmails(recipients)}
							disabled={recipients.length === 0}
						>
							<Icon name="copy" className="h-4 w-4 text-text-sub-600" />
							Copy emails in view
						</Dropdown.Item>
						<Dropdown.Item
							onClick={() => handleExportCsv(recipients)}
							disabled={recipients.length === 0}
						>
							<Icon
								name="arrow-down-tray"
								className="h-4 w-4 text-text-sub-600"
							/>
							Export as CSV
						</Dropdown.Item>
						<Dropdown.Item
							onClick={() => {
								void refetch();
								toast.success("Refreshed");
							}}
						>
							<Icon name="refresh" className="h-4 w-4 text-text-sub-600" />
							Refresh list
						</Dropdown.Item>
					</Dropdown.Content>
				</Dropdown.Root>
			</div>

			{/* Search input bar */}
			<div className="mt-3.5">
				<div className="relative flex items-center">
					<Icon
						name="search"
						className="pointer-events-none absolute left-3.5 h-4 w-4 text-text-soft-400"
					/>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search..."
						className="h-10 w-full rounded-xl border border-stroke-soft-100/60 bg-bg-weak-50/70 pl-9 pr-8 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:border-stroke-soft-200 focus:bg-bg-white-0 focus:outline-none dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:focus:bg-neutral-900"
					/>
					{searchQuery ? (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-text-soft-400 hover:bg-neutral-alpha-10 hover:text-text-strong-950"
						>
							<Icon name="cross" className="h-3 w-3" />
						</button>
					) : null}
				</div>
			</div>

			{/* Recipient list */}
			<div className="mt-2 min-h-[140px] max-h-[420px] overflow-y-auto">
				{isLoading ? (
					<div className="space-y-3 py-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between border-stroke-soft-100/60 border-b py-2.5 last:border-b-0 dark:border-stroke-soft-100/30"
							>
								<div className="flex items-center gap-3">
									<Skeleton className="h-7 w-7 rounded-full" />
									<Skeleton className="h-4 w-40" />
								</div>
								<Skeleton className="h-5 w-20 rounded-full" />
							</div>
						))}
					</div>
				) : recipients.length > 0 ? (
					<ul className="divide-y divide-stroke-soft-100/60 dark:divide-stroke-soft-100/30">
						{recipients.map((recipient) => {
							const badge = getCategoryBadge(
								recipient.category || activeTab,
							);
							const initial = getInitial(
								recipient.email,
								recipient.contactName,
							);

							return (
								<li
									key={recipient.id}
									className="group flex items-center justify-between gap-3 py-3 transition-colors"
								>
									<div className="flex min-w-0 items-center gap-3">
										{/* Avatar */}
										<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-weak-50 font-medium text-text-sub-600 text-xs dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
											{initial}
										</div>

										{/* Email & Contact Info */}
										<div className="min-w-0">
											<p className="truncate font-medium text-paragraph-sm text-text-strong-950">
												{recipient.email}
											</p>
											{recipient.contactName ? (
												<p className="truncate text-paragraph-xs text-text-soft-400">
													{recipient.contactName}
												</p>
											) : null}
										</div>
									</div>

									{/* Category Badge */}
									<span
										className={cn(
											"rounded-full px-2.5 py-0.5 font-medium text-[11px] tracking-wide",
											badge.className,
										)}
									>
										{badge.label}
									</span>
								</li>
							);
						})}
					</ul>
				) : (
					<div className="flex flex-col items-center justify-center py-10 text-center">
						<p className="font-medium text-paragraph-sm text-text-strong-950">
							No {activeTab} recipients
						</p>
						<p className="mt-1 max-w-sm text-paragraph-xs text-text-sub-600">
							{searchQuery
								? `No recipients matching "${searchQuery}" in ${activeTab}.`
								: `There are currently no recipients recorded as ${activeTab} for this campaign.`}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
