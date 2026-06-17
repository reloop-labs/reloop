"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

interface DomainData {
	id: string;
	domain: string;
	status: "pending" | "verifying" | "active" | "suspended" | "failed";
	createdAt: string;
}

interface DomainListResponse {
	domains: DomainData[];
	total: number;
}

export function DomainCard() {
	const { activeOrganization } = useUserOrganization();

	const { data: domainData } = useSWR<DomainListResponse>(
		activeOrganization?.id ? "/api/domain/v1/list?limit=5&page=1" : null,
	);

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<Link
				href="/domain"
				className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-3 pb-5 dark:border-white/5 dark:bg-white/[0.02]"
			>
				<span className="flex items-center gap-2 font-medium text-sm text-text-strong-950 dark:text-white">
					<Icon
						name="globe"
						className="h-4 w-4 text-text-sub-600 dark:text-white/60"
					/>
					<span>Domains</span>
				</span>
				<ArrowRight className="h-4 w-4 text-text-sub-600 transition-transform group-hover:translate-x-0.5 dark:text-white/60" />
			</Link>

			{/* Body */}
			{domainData?.domains && domainData.domains.length > 0 ? (
				<div className="-mt-2.5 min-h-[175px] divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
						{domainData.domains.slice(0, 3).map((d) => (
							<div
								key={d.id}
								className="grid grid-cols-3 items-center px-4 py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
							>
								<div className="flex min-w-0 items-center gap-1.5 pr-2">
									<Icon
										name="globe"
										className="h-3.5 w-3.5 shrink-0 text-text-sub-600 dark:text-white/60"
									/>
									<span className="truncate font-semibold text-orange-500 text-xs hover:underline dark:text-orange-400">
										{d.domain}
									</span>
								</div>
								<div className="flex items-center justify-center">
									<span
										className={cn(
											"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
											d.status === "active"
												? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
												: d.status === "verifying"
													? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
													: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
										)}
									>
										{d.status}
									</span>
								</div>
								<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
									{new Date(d.createdAt).toLocaleDateString([], {
										month: "short",
										day: "numeric",
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="-mt-2.5 flex min-h-[175px] flex-1 flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
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
