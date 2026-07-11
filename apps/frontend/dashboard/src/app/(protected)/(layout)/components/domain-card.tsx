"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { getStatusColorClass, getStatusIcon } from "@fe/dashboard/utils/domain";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DeleteDomainModal } from "../domain/components/delete-domain";

interface DomainData {
	id: string;
	domain: string;
	status: "pending" | "verifying" | "active" | "suspended" | "failed";
	createdAt: string;
	sentCount?: number;
	verificationFailedReason?: string | null;
}

interface DomainListResponse {
	domains: DomainData[];
	total: number;
}

interface EmailStatsResponse {
	dates: string[];
	sent: number[];
	delivered: number[];
	bounced: number[];
	complaint: number[];
	rate: number[];
}

const DomainSparkline = ({ domainId }: { domainId: string }) => {
	// Date range for the 7-day activity graph
	const { start_date, end_date } = useMemo(() => {
		const now = new Date();
		const toDate = new Date(now);
		toDate.setHours(23, 59, 59, 999);
		const fromDate = new Date(now);
		fromDate.setDate(now.getDate() - 6); // 7 days inclusive
		fromDate.setHours(0, 0, 0, 0);
		return {
			start_date: fromDate.toISOString(),
			end_date: toDate.toISOString(),
		};
	}, []);

	const { data: statsData } = useSWR<EmailStatsResponse>(
		domainId
			? `/api/logs/v1/emails/stats?domain_id=${domainId}&start_date=${start_date}&end_date=${end_date}`
			: null,
	);

	// Generate SVG path based on the statsData.sent array
	const pathData = useMemo(() => {
		// Generate list of 7 YYYY-MM-DD date strings in UTC for the past 7 days
		const days: string[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setUTCDate(d.getUTCDate() - i);
			const year = d.getUTCFullYear();
			const month = String(d.getUTCMonth() + 1).padStart(2, "0");
			const day = String(d.getUTCDate()).padStart(2, "0");
			days.push(`${year}-${month}-${day}`);
		}

		// Map API dates/values to a lookup map of YYYY-MM-DD -> sent count
		const statsMap = new Map<string, number>();
		if (statsData?.dates && statsData?.sent) {
			statsData.dates.forEach((dateStr, idx) => {
				const date = new Date(dateStr);
				const year = date.getUTCFullYear();
				const month = String(date.getUTCMonth() + 1).padStart(2, "0");
				const day = String(date.getUTCDate()).padStart(2, "0");
				const key = `${year}-${month}-${day}`;
				statsMap.set(key, statsData.sent[idx] || 0);
			});
		}

		// Reconstruct the 7 points, filling with 0 if no data exists
		const points = days.map((key) => statsMap.get(key) || 0);

		if (!statsData) {
			// Fallback placeholder/default path if no data is loaded yet
			return {
				line: "M0 14 C 10 10, 15 18, 25 10 C 35 4, 40 16, 50 12 C 60 8, 65 4, 75 14 C 85 20, 90 8, 100 11",
				fill: "M0 14 C 10 10, 15 18, 25 10 C 35 4, 40 16, 50 12 C 60 8, 65 4, 75 14 C 85 20, 90 8, 100 11 L 100 24 L 0 24 Z",
			};
		}

		const n = points.length;
		const width = 100;
		const height = 24;
		const padding = 3; // padding top/bottom to prevent clipping
		const usableHeight = height - padding * 2;

		const maxVal = Math.max(...points, 1); // avoid division by zero

		// Map each point to (x, y) coordinates
		const coords = points.map((val, idx) => {
			const x = n > 1 ? (idx / (n - 1)) * width : width / 2;
			// invert y so higher count is closer to top (0 is top, height is bottom)
			const y = height - padding - (val / maxVal) * usableHeight;
			return { x, y };
		});

		if (coords.length === 0 || !coords[0]) {
			return { line: "", fill: "" };
		}

		// Build a smooth cubic bezier line using coordinate interpolation
		let linePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
		for (let i = 0; i < coords.length - 1; i++) {
			const p0 = coords[i];
			const p1 = coords[i + 1];
			if (!p0 || !p1) continue;
			// Control points in the middle
			const cp1x = p0.x + (p1.x - p0.x) / 3;
			const cp1y = p0.y;
			const cp2x = p0.x + (2 * (p1.x - p0.x)) / 3;
			const cp2y = p1.y;
			linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
		}

		const fillPath = `${linePath} L 100 24 L 0 24 Z`;
		return { line: linePath, fill: fillPath };
	}, [statsData]);

	// Unique gradient ID for each sparkline to avoid conflicts in page DOM
	const gradientId = useMemo(() => `sparkline-grad-${domainId}`, [domainId]);

	return (
		<svg
			className="h-5 w-24 text-blue-500 dark:text-blue-400"
			viewBox="0 0 100 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
					<stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
				</linearGradient>
			</defs>
			<path
				d={pathData.line}
				fill="none"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d={pathData.fill} fill={`url(#${gradientId})`} />
		</svg>
	);
};

const formatCount = (count: number) => {
	if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
	if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
	return count.toString();
};

const filterOptions: { id: DomainData["status"] | null; label: string }[] = [
	{ id: null, label: "All Status" },
	{ id: "pending", label: "Not Started" },
	{ id: "verifying", label: "Verifying" },
	{ id: "active", label: "Active" },
	{ id: "suspended", label: "Suspended" },
	{ id: "failed", label: "Failed" },
];

const getTooltipText = (
	status: DomainData["status"],
	reason?: string | null,
) => {
	switch (status) {
		case "active":
			return "You're all set! Your domain is ready to send emails.";
		case "verifying":
			return "Your domain is being verified — this can take a few hours depending on your DNS provider.";
		case "pending":
			return "Almost there! Add the DNS records shown below, then click Verify — and you'll be ready to send.";
		case "failed":
		case "suspended":
			return (
				reason ||
				"We couldn't verify your domain. Double-check your DNS records and try again."
			);
		default:
			return "Checking your domain authentication — this will just take a moment…";
	}
};

interface RowActionsDropdownProps {
	domain: DomainData;
	onDelete: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
}

const RowActionsDropdown = ({
	domain,
	onDelete,
	onOpenChange,
}: RowActionsDropdownProps) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const getBackToUrl = useGetBackToUrl();
	const router = useRouter();

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const menuItems = [
		{
			id: "configure",
			label:
				domain.status === "active" ? "View Configure DNS" : "Configure DNS",
			icon: "globe" as const,
			isDanger: false,
		},
		{
			id: "copy-id",
			label: "Copy Domain ID",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "copy-domain",
			label: "Copy Domain Name",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete Domain",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = async (itemId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setPopoverOpen(false);
		if (itemId === "configure") {
			router.push(getBackToUrl(`/domain/${domain.id}`));
		} else if (itemId === "copy-id") {
			navigator.clipboard.writeText(domain.id);
			toast.success("Domain ID copied to clipboard");
		} else if (itemId === "copy-domain") {
			navigator.clipboard.writeText(domain.domain);
			toast.success("Domain name copied to clipboard");
		} else if (itemId === "delete") {
			onDelete(domain.id);
		}
	};

	const handleOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	return (
		<div onClick={(e) => e.stopPropagation()}>
			<Popover.Root open={popoverOpen} onOpenChange={handleOpenChange}>
				<Popover.Trigger asChild>
					<button
						type="button"
						className="flex h-5 w-5 shrink-0 items-center justify-end text-text-sub-600 transition-colors hover:text-text-strong-950 focus:outline-none dark:text-white/40 dark:hover:text-white"
					>
						<MoreHorizontal className="h-4 w-4" />
					</button>
				</Popover.Trigger>
				<Popover.Content
					align="end"
					sideOffset={-7}
					className="w-48 p-2"
					showArrow={true}
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<button
								key={item.id}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={(e) => handleItemClick(item.id, e)}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								)}
							>
								<Icon
									name={item.icon}
									className={cn(
										"h-3.5 w-3.5",
										item.isDanger ? "" : "text-text-sub-600",
									)}
								/>
								<span>{item.label}</span>
							</button>
						))}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	);
};

export function DomainCard() {
	const getBackToUrl = useGetBackToUrl();
	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState<DomainData["status"] | null>(
		null,
	);
	const [filterOpen, setFilterOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const selectedIdx = filterOptions.findIndex((o) => o.id === statusFilter);
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;

	const currentTab = buttonRefs.current[activeIdx];
	const currentRect = currentTab?.getBoundingClientRect();
	const { data: domainData, mutate } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?limit=5&page=1${statusFilter ? `&status=${statusFilter}` : ""}`
			: null,
		{
			refreshInterval: (latest) =>
				latest?.domains?.some((d) => d.status === "verifying") ? 3000 : 0,
		},
	);

	const [_, setDeleteId] = useQueryState("delete");

	const handleDeleteDomain = (id: string) => {
		setDeleteId(id);
	};

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				{/* Title and Count Badge */}
				<Link
					href="/domain"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="globe" className="h-4 w-4 shrink-0" />
					Domains
					<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1.5 font-semibold text-[11px] text-text-sub-600 dark:bg-white/10 dark:text-white/40">
						{domainData?.total ?? 0}
					</span>
				</Link>

				{/* Header Actions */}
				<div className="flex items-center gap-1.5">
					<Link
						href={getBackToUrl("/domain/add")}
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
					>
						<Plus className="h-3.5 w-3.5" />
					</Link>

					{/* Status Filter Popover */}
					<Popover.Root open={filterOpen} onOpenChange={setFilterOpen}>
						<Popover.Trigger asChild>
							<button
								type="button"
								className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
							>
								<MoreHorizontal className="h-3.5 w-3.5" />
							</button>
						</Popover.Trigger>
						<Popover.Content
							align="end"
							sideOffset={-1}
							className="w-48 p-2"
							showArrow={true}
						>
							<div className="px-2 py-1.5 font-medium text-[10px] text-text-sub-600 dark:text-white/40">
								Filter by status
							</div>
							<div className="relative">
								{filterOptions.map((option, idx) => {
									const isChecked = statusFilter === option.id;
									return (
										<button
											key={option.id ?? "all"}
											ref={(el) => {
												if (el) buttonRefs.current[idx] = el;
											}}
											type="button"
											onPointerEnter={() => setHoverIdx(idx)}
											onPointerLeave={() => setHoverIdx(undefined)}
											onClick={() => {
												setStatusFilter(option.id);
												setFilterOpen(false);
											}}
											className={cn(
												"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-text-strong-950 text-xs transition-colors",
												isChecked && "bg-neutral-alpha-10",
											)}
										>
											<div className="flex items-center gap-2">
												{option.id ? (
													<Icon
														name={getStatusIcon(option.id)}
														className={cn(
															"h-3.5 w-3.5",
															getStatusColorClass(option.id),
														)}
													/>
												) : (
													<Icon name="activity" className="h-3.5 w-3.5" />
												)}
												<span className={cn(isChecked && "font-medium")}>
													{option.label}
												</span>
											</div>
											{isChecked && (
												<Icon
													name="check"
													className="h-3.5 w-3.5 text-text-strong-950"
												/>
											)}
										</button>
									);
								})}
								<AnimatedHoverBackground
									rect={currentRect}
									tabElement={currentTab}
								/>
							</div>
						</Popover.Content>
					</Popover.Root>

					<Link
						href="/domain"
						className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>

			{/* Body */}
			<AnimatePresence mode="wait">
				{domainData?.domains && domainData.domains.length > 0 ? (
					<motion.div
						key="list-container"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="-mt-1.5 h-[250px] overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]"
					>
						<div className="px-4">
							<AnimatePresence initial={false}>
								{domainData.domains.slice(0, 5).map((d, _index) => (
									<motion.div
										key={d.id}
										layout
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -6 }}
										transition={{ duration: 0.2 }}
										className="group/row flex items-center justify-between border-stroke-soft-100 border-b py-2.5 dark:border-white/5"
									>
										{/* Left column: Status indicator + Domain name */}
										<div className="flex min-w-0 items-center gap-2">
											<Tooltip.Provider delayDuration={0}>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button
															type="button"
															className="flex shrink-0 cursor-help items-center"
														>
															<Icon
																name={getStatusIcon(d.status)}
																className={cn(
																	"h-4.5 w-4.5",
																	getStatusColorClass(d.status),
																)}
															/>
														</button>
													</Tooltip.Trigger>
													<Tooltip.Content
														side="top"
														sideOffset={-5}
														variant="light"
														className="max-w-[220px] text-xs"
													>
														{getTooltipText(
															d.status,
															d.verificationFailedReason,
														)}
													</Tooltip.Content>
												</Tooltip.Root>
											</Tooltip.Provider>

											<Link
												href={getBackToUrl(`/domain/${d.id}`)}
												className="truncate font-semibold text-text-strong-950 text-xs group-hover/row:underline dark:text-white"
											>
												{d.domain}
											</Link>
										</div>

										{/* Middle column: Custom charts depending on index */}
										<div className="hidden flex-1 items-center justify-center px-8 sm:flex">
											{d.status === "active" && (d.sentCount || 0) > 0 && (
												<DomainSparkline domainId={d.id} />
											)}
										</div>

										{/* Right column: Metric value or simple ellipsis icon */}
										<div className="flex w-12 shrink-0 items-center justify-end text-right">
											{d.status === "active" ? (
												<div className="relative flex h-5 w-12 items-center justify-end">
													<span
														className={cn(
															"font-semibold text-text-strong-950 text-xs dark:text-white",
															activeDropdownId === d.id
																? "hidden"
																: "block group-hover/row:hidden",
														)}
													>
														{formatCount(d.sentCount || 0)}
													</span>
													<div
														className={cn(
															activeDropdownId === d.id
																? "block"
																: "hidden group-hover/row:block",
														)}
													>
														<RowActionsDropdown
															domain={d}
															onDelete={handleDeleteDomain}
															onOpenChange={(open) => {
																if (open) {
																	setActiveDropdownId(d.id);
																} else {
																	setTimeout(() => {
																		setActiveDropdownId((curr) =>
																			curr === d.id ? null : curr,
																		);
																	}, 150);
																}
															}}
														/>
													</div>
												</div>
											) : (
												<div className="relative flex h-5 w-12 items-center justify-end">
													<RowActionsDropdown
														domain={d}
														onDelete={handleDeleteDomain}
														onOpenChange={(open) => {
															if (open) {
																setActiveDropdownId(d.id);
															} else {
																setTimeout(() => {
																	setActiveDropdownId((curr) =>
																		curr === d.id ? null : curr,
																	);
																}, 150);
															}
														}}
													/>
												</div>
											)}
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</motion.div>
				) : statusFilter ? (
					/* Filtered empty state — domains exist but none match the chosen filter */
					<motion.div
						key="filtered-empty"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="-mt-1.5 flex h-[250px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]"
					>
						<Icon
							name={getStatusIcon(statusFilter)}
							className={cn("h-6 w-6", getStatusColorClass(statusFilter))}
						/>
						<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
							No {filterOptions.find((o) => o.id === statusFilter)?.label}{" "}
							domains
						</h4>
						<p className="mt-2 mb-4 max-w-[280px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
							{statusFilter === "active" &&
								"You don't have any verified domains yet."}
							{statusFilter === "verifying" &&
								"No domains are currently being verified."}
							{statusFilter === "pending" &&
								"No domains are waiting for DNS setup."}
							{(statusFilter === "failed" || statusFilter === "suspended") &&
								"No domains have a verification error right now."}
						</p>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => setStatusFilter(null)}
							className="mt-6 shrink-0 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
						>
							Clear filter
						</Button.Root>
					</motion.div>
				) : (
					/* Truly empty — no domains at all */
					<motion.div
						key="empty-state"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="-mt-1.5 flex h-[250px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]"
					>
						<Icon
							name="globe"
							className="h-6 w-6 text-text-sub-600 dark:text-white/40"
						/>
						<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
							Send emails from your own domain
						</h4>
						<p className="mt-2 max-w-[340px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
							Configure SPF, DKIM, and DMARC to protect deliverability and your
							domain reputation.
						</p>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							asChild
							className="mt-6 shrink-0 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
						>
							<Link href={getBackToUrl("/domain/add")}>Add your domain</Link>
						</Button.Root>
					</motion.div>
				)}
			</AnimatePresence>

			<DeleteDomainModal
				domains={(domainData?.domains as any) || []}
				mutate={mutate}
			/>
		</div>
	);
}
