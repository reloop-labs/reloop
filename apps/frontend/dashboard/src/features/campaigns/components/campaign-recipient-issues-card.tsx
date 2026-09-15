"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import * as Tooltip from "@reloop/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
	useCallback,
	useDeferredValue,
	useEffect,
	useRef,
	useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	type DeliverabilityCategory,
	listCampaignRecipients,
} from "../campaigns-api";

/** How long the rotate icon spins after a refresh is triggered. */
const REFRESH_SPIN_MS = 2000;

export type CategoryTab =
	| "unsubscribed"
	| "bounced"
	| "suppressed"
	| "complained"
	| "clicked";

const TABS: Array<{
	id: CategoryTab;
	label: string;
	icon: string;
}> = [
	{ id: "unsubscribed", label: "Unsubscribed", icon: "user-minus" },
	{ id: "bounced", label: "Bounced", icon: "bounce" },
	{ id: "suppressed", label: "Suppressed", icon: "slash" },
	{ id: "complained", label: "Complained", icon: "alert-triangle" },
	{ id: "clicked", label: "Clicks", icon: "cursor-click" },
];

function getCategoryBadge(category?: DeliverabilityCategory | string) {
	switch (category) {
		case "unsubscribed":
			return {
				label: "Unsubscribed",
				icon: "user-minus",
				className: "text-error-base",
			};
		case "bounced":
			return {
				label: "Bounced",
				icon: "minus-circle",
				className: "text-error-base",
			};
		case "suppressed":
			return {
				label: "Suppressed",
				icon: "slash",
				className: "text-text-sub-600",
			};
		case "complained":
			return {
				label: "Complained",
				icon: "minus-circle",
				className: "text-error-base",
			};
		case "clicked":
			return {
				label: "Clicked",
				icon: "cursor-click",
				className: "text-feature-base",
			};
		default:
			return {
				label: category || "Issue",
				icon: "minus-circle",
				className: "text-text-sub-600",
			};
	}
}

function getInitial(email: string, name?: string): string {
	if (name && name.trim()) return name.trim().charAt(0).toUpperCase();
	if (email && email.trim()) return email.trim().charAt(0).toUpperCase();
	return "?";
}

function formatClicks(count: number): string {
	return `${count.toLocaleString()} ${count === 1 ? "click" : "clicks"}`;
}

interface CampaignRecipientIssuesCardProps {
	campaignId: string;
	className?: string;
	activeTab: CategoryTab;
	onActiveTabChange: (tab: CategoryTab) => void;
}

export function CampaignRecipientIssuesCard({
	campaignId,
	className,
	activeTab,
	onActiveTabChange,
}: CampaignRecipientIssuesCardProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
	const pillInsetY = 7;
	const pill =
		currentTab && activeIndex !== -1
			? {
					width: currentTab.offsetWidth,
					height: currentTab.offsetHeight - pillInsetY * 2,
					left: currentTab.offsetLeft,
					top: currentTab.offsetTop + pillInsetY,
				}
			: null;

	const canExport = recipients.length > 0;

	const handleExportCsv = useCallback(() => {
		if (!recipients.length) {
			toast.info("No recipients to export");
			return;
		}
		const isClicks = activeTab === "clicked";
		const header = isClicks
			? "Email,Clicks,Unique Clicks,Status,Contact Name\n"
			: "Email,Status,Category,Error,Contact Name\n";
		const rows = recipients
			.map((r) =>
				(isClicks
					? [
							`"${r.email}"`,
							`"${r.clickCount ?? 0}"`,
							`"${r.uniqueClickCount ?? 0}"`,
							`"${r.status || ""}"`,
							`"${(r.contactName || "").replace(/"/g, '""')}"`,
						]
					: [
							`"${r.email}"`,
							`"${r.status || ""}"`,
							`"${r.category || activeTab}"`,
							`"${(r.error || "").replace(/"/g, '""')}"`,
							`"${(r.contactName || "").replace(/"/g, '""')}"`,
						]
				).join(","),
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
	}, [activeTab, campaignId, recipients]);

	const refresh = useCallback(() => {
		void refetch();
		setIsRefreshing(true);
		if (spinTimeoutRef.current != null) {
			clearTimeout(spinTimeoutRef.current);
		}
		spinTimeoutRef.current = setTimeout(() => {
			setIsRefreshing(false);
			spinTimeoutRef.current = null;
		}, REFRESH_SPIN_MS);
	}, [refetch]);

	useEffect(() => {
		return () => {
			if (spinTimeoutRef.current != null) {
				clearTimeout(spinTimeoutRef.current);
			}
		};
	}, []);

	useHotkeys(
		"r",
		(e) => {
			e.preventDefault();
			refresh();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"e",
		(e) => {
			e.preventDefault();
			if (canExport) handleExportCsv();
		},
		{ enableOnFormTags: false, preventDefault: true, enabled: canExport },
	);

	return (
		<div
			id="campaign-recipients"
			className={cn("w-full text-paragraph-sm", className)}
		>
			<div className="rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 pt-1 pr-2 pb-2.5 pl-2 dark:border-[#101010] dark:bg-bg-weak-50/40">
				<TabMenu.Root
					value={activeTab}
					onValueChange={(val) => onActiveTabChange(val as CategoryTab)}
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
										"flex h-full cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
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
							{pill ? (
								<motion.div
									className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
									initial={{
										pointerEvents: "none",
										...pill,
										opacity: 0,
									}}
									animate={{
										pointerEvents: "none",
										...pill,
										opacity: 1,
									}}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
					</TabMenu.List>
				</TabMenu.Root>
			</div>

			<div className="-mt-2.5 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
				<div className="flex items-center justify-between gap-2 border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/50">
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
					<div className="flex shrink-0 items-center gap-2">
						<Tooltip.Provider delayDuration={200}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										onClick={handleExportCsv}
										disabled={!canExport}
										className={cn(
											dataTableToolbarControlClassName,
											"gap-2 px-1.5",
											canExport
												? "cursor-pointer"
												: "pointer-events-none opacity-50",
										)}
										aria-label="Export recipients CSV"
										aria-keyshortcuts="e"
									>
										<Icon
											name="file-download"
											className="h-3.5 w-3.5 shrink-0"
										/>
										<ActionKbd>E</ActionKbd>
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content
									side="top"
									sideOffset={-1}
									size="medium"
									variant="light"
									className="max-w-63 p-2.5"
								>
									<div className="flex items-start gap-2.5">
										<div
											className={cn(
												"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
												"bg-bg-weak-50 ring-1 ring-stroke-soft-200",
											)}
											aria-hidden
										>
											<Icon
												name="file-download"
												className="h-3.5 w-3.5 text-text-sub-600"
											/>
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-3">
												<p className="font-medium text-label-sm text-text-strong-950">
													Export CSV
												</p>
												<ActionKbd>E</ActionKbd>
											</div>
											<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
												Download this list as a CSV file.
											</p>
										</div>
									</div>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
						<Tooltip.Provider delayDuration={200}>
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										onClick={refresh}
										disabled={isRefreshing}
										className={cn(
											dataTableToolbarControlClassName,
											"gap-2 px-1.5",
											isRefreshing ? "pointer-events-none" : "cursor-pointer",
										)}
										aria-label="Refresh recipients"
										aria-keyshortcuts="r"
										aria-busy={isRefreshing}
									>
										<Icon
											name="rotate-cw"
											className={cn(
												"h-3.5 w-3.5 shrink-0",
												isRefreshing && "animate-spin",
											)}
										/>
										<ActionKbd>R</ActionKbd>
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content
									side="top"
									sideOffset={-1}
									size="medium"
									variant="light"
									className="max-w-63 p-2.5"
								>
									<div className="flex items-start gap-2.5">
										<div
											className={cn(
												"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
												"bg-bg-weak-50 ring-1 ring-stroke-soft-200",
											)}
											aria-hidden
										>
											<Icon
												name="rotate-cw"
												className={cn(
													"h-3.5 w-3.5 text-text-sub-600",
													isRefreshing && "animate-spin",
												)}
											/>
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-3">
												<p className="font-medium text-label-sm text-text-strong-950">
													{isRefreshing ? "Refreshing…" : "Refresh"}
												</p>
												<ActionKbd>R</ActionKbd>
											</div>
											<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
												{isRefreshing
													? "Fetching the latest recipients."
													: "Reload recipients from the server."}
											</p>
										</div>
									</div>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				</div>

				{activeTab === "clicked" ? (
					<div className="flex items-center gap-6 border-stroke-soft-100 border-b px-4 py-2.5 dark:border-stroke-soft-100/50">
						<div className="flex items-baseline gap-2">
							<span className="text-paragraph-xs text-text-sub-600">
								Unique clicks
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950 tabular-nums">
								{(counts?.clicked ?? 0).toLocaleString()}
							</span>
						</div>
						<div className="flex items-baseline gap-2">
							<span className="text-paragraph-xs text-text-sub-600">
								Total clicks
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950 tabular-nums">
								{(counts?.clickedTotal ?? 0).toLocaleString()}
							</span>
						</div>
					</div>
				) : null}

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
										className="flex items-center justify-between gap-3 px-4 py-2.5"
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
										{activeTab === "clicked" ? (
											<div className="flex shrink-0 items-center gap-2 text-paragraph-sm tabular-nums">
												<span className="font-medium text-text-strong-950">
													{formatClicks(recipient.clickCount ?? 0)}
												</span>
												<span className="text-text-soft-400">
													{(recipient.uniqueClickCount ?? 0).toLocaleString()}{" "}
													unique
												</span>
											</div>
										) : (
											<div
												className={cn(
													"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
													badge.className,
												)}
											>
												<Icon
													name={badge.icon}
													className="h-3.5 w-3.5 shrink-0"
												/>
												{badge.label}
											</div>
										)}
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
								{activeTab === "clicked"
									? "No clicks"
									: `No ${activeTab} recipients`}
							</p>
							<p className="mt-2 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
								{searchQuery
									? `No recipients matching "${searchQuery}" in ${activeTab}.`
									: activeTab === "clicked"
										? "No one has clicked a link in this campaign yet."
										: `There are currently no recipients recorded as ${activeTab} for this campaign.`}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
