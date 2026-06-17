"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { getStatusColorClass, getStatusIcon } from "@fe/dashboard/utils/domain";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import useSWR from "swr";

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

const WaveSparkline = () => (
	<svg
		className="h-5 w-24 text-blue-500 dark:text-blue-400"
		viewBox="0 0 100 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
				<stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
			</linearGradient>
		</defs>
		<path
			d="M0 16 C 10 12, 15 20, 25 10 C 35 4, 40 18, 50 14 C 60 10, 65 2, 75 16 C 85 24, 90 8, 100 12"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.25"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M0 16 C 10 12, 15 20, 25 10 C 35 4, 40 18, 50 14 C 60 10, 65 2, 75 16 C 85 24, 90 8, 100 12 L 100 24 L 0 24 Z"
			fill="url(#sparkline-grad)"
		/>
	</svg>
);

const FadingGradientBar = () => (
	<div className="h-4.5 w-24 rounded bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/30 dark:from-blue-500/0 dark:via-blue-500/5 dark:to-blue-500/20" />
);

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

export function DomainCard() {
	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState<DomainData["status"] | null>(
		null,
	);
	const [filterOpen, setFilterOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const selectedIdx = filterOptions.findIndex((o) => o.id === statusFilter);
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;

	const currentTab = buttonRefs.current[activeIdx];
	const currentRect = currentTab?.getBoundingClientRect();

	const { data: domainData } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?limit=5&page=1${statusFilter ? `&status=${statusFilter}` : ""}`
			: null,
	);

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-5 dark:border-white/5 dark:bg-white/[0.02]">
				{/* Title and Count Badge */}
				<Link
					href="/domain"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<span>Domains</span>
					<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1.5 font-semibold text-[11px] text-text-sub-600 dark:bg-white/10 dark:text-white/40">
						{domainData?.total ?? 0}
					</span>
				</Link>

				{/* Header Actions */}
				<div className="flex items-center gap-1.5">
					<Link
						href="/domain/add"
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
							sideOffset={4}
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
						className="-mt-2.5 h-[200px] overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]"
					>
						<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
							<AnimatePresence initial={false}>
								{domainData.domains.slice(0, 5).map((d, index) => (
									<motion.div
										key={d.id}
										layout
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -6 }}
										transition={{ duration: 0.2 }}
										className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
									>
										{/* Left column: Status indicator + Domain name */}
										<div className="flex min-w-0 items-center gap-2">
											<Tooltip.Provider delayDuration={0}>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button className="flex shrink-0 cursor-help items-center">
															{d.status === "active" ? (
																<Icon
																	name="check-circle"
																	className="h-4.5 w-4.5 text-green-600 dark:text-green-500"
																/>
															) : d.status === "failed" ? (
																<Icon
																	name="cross-circle"
																	className="h-4.5 w-4.5 text-red-500 dark:text-red-400"
																/>
															) : (
																<Icon
																	name="hourglass"
																	className="h-4.5 w-4.5 text-amber-500 dark:text-amber-400"
																/>
															)}
														</button>
													</Tooltip.Trigger>
													<Tooltip.Content
														side="top"
														variant="light"
														className="max-w-[220px] text-xs"
													>
														{d.status === "failed"
															? d.verificationFailedReason ||
																"Verification failed"
															: d.status === "active"
																? "Domain verified and active"
																: "Verification pending"}
													</Tooltip.Content>
												</Tooltip.Root>
											</Tooltip.Provider>

											<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
												{d.domain}
											</span>
										</div>

										{/* Middle column: Custom charts depending on index */}
										<div className="hidden flex-1 items-center justify-center px-8 sm:flex">
											{index === 0 && <FadingGradientBar />}
											{index === 1 && <WaveSparkline />}
											{index === 2 && <FadingGradientBar />}
										</div>

										{/* Right column: Metric value or simple ellipsis icon */}
										<div className="flex w-12 shrink-0 items-center justify-end text-right">
											{index >= 3 ? (
												<button className="text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white">
													<MoreHorizontal className="h-4 w-4" />
												</button>
											) : (
												<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
													{formatCount(d.sentCount || 0)}
												</span>
											)}
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</motion.div>
				) : (
					<motion.div
						key="empty-state"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="-mt-2.5 flex flex-1 flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]"
					>
						{/* Icon outline without pill wrapper */}
						<Icon
							name="globe"
							className="h-5 w-5 text-text-sub-600 dark:text-white/40"
						/>

						{/* Heading */}
						<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
							Send emails from your own domain
						</h4>

						{/* Description */}
						<p className="mt-2 max-w-[340px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
							Configure SPF, DKIM, and DMARC to protect deliverability and your
							domain reputation.
						</p>

						{/* Button */}
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							asChild
							className="mt-3 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
						>
							<Link href="/domain">Add your domain</Link>
						</Button.Root>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
