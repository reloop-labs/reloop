"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useDeferredValue, useRef, useState } from "react";
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
	icon: string;
}> = [
	{ id: "unsubscribed", label: "Unsubscribed", icon: "user-minus" },
	{ id: "bounced", label: "Bounced", icon: "bounce" },
	{ id: "suppressed", label: "Suppressed", icon: "slash" },
	{ id: "complained", label: "Complained", icon: "alert-triangle" },
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
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const deferredSearch = useDeferredValue(searchQuery);

	const { data, isLoading, refetch } = useQuery({
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
	const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx];
	const rect = currentTab?.getBoundingClientRect();

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
			const blob = new Blob([header + rows], {
				type: "text/csv;charset=utf-8;",
			});
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
		<div className={cn("w-full text-paragraph-sm", className)}>
			<div className="rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 pt-1 pr-2 pb-5 pl-2 dark:border-[#101010] dark:bg-bg-weak-50/40">
				<TabMenu.Root
					value={activeTab}
					onValueChange={(val) => setActiveTab(val as CategoryTab)}
				>
					<TabMenu.List className="relative h-11 gap-0 border-b-0 py-0">
						{TABS.map((tab, index) => {
							const count = counts?.[tab.id];
							return (
								<TabMenu.Trigger
									key={tab.id}
									value={tab.id}
									ref={(el) => {
										if (el) buttonRefs.current[index] = el;
									}}
									onPointerEnter={() => setHoveredIdx(index)}
									onPointerLeave={() => setHoveredIdx(undefined)}
									className={cn(
										"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
										hoveredIdx === undefined &&
											activeIndex === index &&
											"text-text-strong-950",
									)}
								>
									<Icon name={tab.icon} className="h-4 w-4" />
									{tab.label}
									{typeof count === "number" && count > 0 ? (
										<span className="text-text-soft-400 text-xs tabular-nums">
											{count}
										</span>
									) : null}
								</TabMenu.Trigger>
							);
						})}
						<AnimatePresence>
							{rect && activeIndex !== -1 ? (
								<motion.div
									className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
									initial={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 14,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											7,
										opacity: 0,
									}}
									animate={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 14,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											7,
										opacity: 1,
									}}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
						<div className="ml-auto flex items-center">
							<Dropdown.Root>
								<Dropdown.Trigger asChild>
									<Button.Root
										type="button"
										variant="neutral"
										mode="ghost"
										size="xxsmall"
										className="aspect-square h-7 w-7 rounded-lg p-0 text-text-sub-600 hover:text-text-strong-950"
										aria-label="More options"
									>
										<Icon name="more-horizontal" className="h-3.5 w-3.5" />
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
										<Icon
											name="refresh"
											className="h-4 w-4 text-text-sub-600"
										/>
										Refresh list
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>
						</div>
					</TabMenu.List>
				</TabMenu.Root>
			</div>

			<div className="-mt-2.5 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
				<div className="border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/50">
					<Input.Root
						size="small"
						className="w-full max-w-72 rounded-xl shadow-none!"
					>
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="small" />
							<Input.Input
								value={searchQuery}
								placeholder="Search..."
								aria-label="Search recipients"
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							{searchQuery ? (
								<button
									type="button"
									aria-label="Clear search"
									onClick={() => setSearchQuery("")}
									className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-soft-400 hover:bg-neutral-alpha-10 hover:text-text-strong-950"
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							) : null}
						</Input.Wrapper>
					</Input.Root>
				</div>

				<div className="max-h-[420px] min-h-[140px] overflow-y-auto">
					{isLoading ? (
						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between px-4 py-2.5"
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
						<ul className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
							{recipients.map((recipient) => {
								const badge = getCategoryBadge(recipient.category || activeTab);
								const initial = getInitial(
									recipient.email,
									recipient.contactName,
								);

								return (
									<li
										key={recipient.id}
										className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-bg-weak-50"
									>
										<div className="flex min-w-0 items-center gap-3">
											<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-weak-50 font-medium text-text-sub-600 text-xs dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
												{initial}
											</div>
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
						<div className="flex flex-col items-center px-6 py-12 text-center">
							<Icon
								name={searchQuery ? "search" : "users"}
								className="mb-4 h-8 w-8 text-text-sub-600"
							/>
							<p className="font-semibold text-text-strong-950 text-xl">
								No {activeTab} recipients
							</p>
							<p className="mt-2 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
								{searchQuery
									? `No recipients matching "${searchQuery}" in ${activeTab}.`
									: `There are currently no recipients recorded as ${activeTab} for this campaign.`}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
