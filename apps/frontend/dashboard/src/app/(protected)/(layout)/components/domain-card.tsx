"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { ArrowRight, MoreHorizontal, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
	<svg className="h-5 w-24 text-blue-500 dark:text-blue-400" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function DomainCard() {
	const { activeOrganization } = useUserOrganization();

	const { data: domainData } = useSWR<DomainListResponse>(
		activeOrganization?.id ? "/api/domain/v1/list?limit=5&page=1" : null,
	);

	const [starredDomains, setStarredDomains] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (domainData?.domains) {
			const initial: Record<string, boolean> = {};
			if (domainData.domains[0]) {
				initial[domainData.domains[0].id] = true;
			}
			setStarredDomains(initial);
		}
	}, [domainData?.domains]);

	const toggleStar = (domainId: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setStarredDomains((prev) => ({ ...prev, [domainId]: !prev[domainId] }));
	};

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
					<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1.5 text-[11px] font-semibold text-text-sub-600 dark:bg-white/10 dark:text-white/40">
						{domainData?.total ?? 0}
					</span>
				</Link>

				{/* Header Actions */}
				<div className="flex items-center gap-1.5">
					<button className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60">
						<Star className="h-3.5 w-3.5" />
					</button>
					<Button.Root variant="neutral" mode="stroke" size="xsmall" asChild className="p-0 border-stroke-soft-100 bg-white dark:border-white/5 dark:bg-white/[0.02]">
						<Link href="/domain/add" className="flex h-7 w-7 items-center justify-center text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white">
							<Plus className="h-3.5 w-3.5" />
						</Link>
					</Button.Root>
					<button className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60">
						<MoreHorizontal className="h-3.5 w-3.5" />
					</button>
					<Link
						href="/domain"
						className="flex h-7 w-7 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>

			{/* Body */}
			{domainData?.domains && domainData.domains.length > 0 ? (
				<div className="-mt-2.5 h-[200px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
						{domainData.domains.slice(0, 5).map((d, index) => (
							<div
								key={d.id}
								className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
							>
								{/* Left column: Status indicator + Domain name + Star Toggle */}
								<div className="flex min-w-0 items-center gap-2">
									<Tooltip.Provider delayDuration={0}>
										<Tooltip.Root>
											<Tooltip.Trigger asChild>
												<button className="flex shrink-0 items-center cursor-help">
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
													? d.verificationFailedReason || "Verification failed"
													: d.status === "active"
														? "Domain verified and active"
														: "Verification pending"}
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>

									<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
										{d.domain}
									</span>

									<button
										onClick={(e) => toggleStar(d.id, e)}
										className="flex items-center justify-center p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
									>
										<Star
											className={cn(
												"h-3.5 w-3.5 transition-colors",
												starredDomains[d.id]
													? "fill-amber-400 text-amber-400"
													: "text-zinc-300 dark:text-zinc-600 hover:text-amber-400",
											)}
										/>
									</button>
								</div>

								{/* Middle column: Custom charts depending on index */}
								<div className="hidden sm:flex items-center justify-center flex-1 px-8">
									{index === 0 && <FadingGradientBar />}
									{index === 1 && <WaveSparkline />}
									{index === 2 && <FadingGradientBar />}
								</div>

								{/* Right column: Metric value or More ellipsis action */}
								<div className="flex shrink-0 items-center justify-end w-12 text-right">
									{index >= 3 ? (
										<button className="text-text-sub-600 hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white transition-colors">
											<MoreHorizontal className="h-4 w-4" />
										</button>
									) : (
										<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
											{formatCount(d.sentCount || 0)}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="-mt-2.5 flex h-[200px] flex-1 flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					{/* Icon outline without pill wrapper */}
					<Icon
						name="globe"
						className="h-6 w-6 text-text-sub-600 dark:text-white/40"
					/>

					{/* Heading */}
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Verify sending domains without the overhead
					</h4>

					{/* Description */}
					<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						Set up SPF, DKIM, and DMARC verification to scale globally in
						minutes.
					</p>

					{/* Button */}
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href="/domain">Configure domain</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
