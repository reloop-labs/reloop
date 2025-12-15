"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	getAnimationProps,
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { Domain } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { DomainDropdown } from "./domain-dropdown";

interface DomainTableProps {
	domains: Domain[];
	activeOrganizationSlug: string;
	currentDomainId?: string;
	isLoading?: boolean;
	loadingRows?: number;
}

export const DomainTable = ({
	domains,
	activeOrganizationSlug,
	currentDomainId,
	isLoading,
	loadingRows = 3,
}: DomainTableProps) => {
	const { push } = useUserOrganization();
	const [, setDeleteId] = useQueryState("delete");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleDeleteDomain = (domainId: string) => {
		setDeleteId(domainId);
	};

	const handleViewDetails = (domainName: string) => {
		push(`/domain/${domainName}`);
	};

	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_minmax(40px,auto)]">
					<div className="pl-5 text-text-sub-600">
						<div className="flex items-center gap-2 py-3">
							<Icon name="globe" className="h-4 w-4" />
							<span className="text-[13px]">Domain</span>
						</div>
					</div>
					<div className="text-text-sub-600">
						<div className="flex items-center gap-2 py-3">
							<Icon name="activity" className="h-4 w-4" />
							<span className="text-[13px]">Status</span>
						</div>
					</div>
					<div className="text-text-sub-600">
						<div className="flex items-center gap-2 py-3">
							<Icon name="clock" className="h-4 w-4" />
							<span className="text-[13px]">Created At</span>
						</div>
					</div>
					<div>
						<div className="py-3" />
					</div>
					{isLoading
						? Array.from({ length: loadingRows }).map((_, index) => (
							<div key={`skeleton-${index}`} className="group/row contents">
								<div className="flex items-center border-stroke-soft-200/70 border-t py-2">
									<div className="my-1 pl-5">
										<Skeleton className="h-4 w-32" />
									</div>
								</div>
								<div className="flex items-center border-stroke-soft-200/70 border-t py-2">
									<div className="flex items-center gap-2">
										<Skeleton className="h-2 w-2 rounded-full" />
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
								<div className="flex items-center border-stroke-soft-200/70 border-t py-2">
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center border-stroke-soft-200/70 border-t py-2">
									<Skeleton className="h-4 w-4" />
								</div>
							</div>
						))
						: domains.map((domain, index) => {
							const isRowActive = activeDropdownId === domain.id;
							return (
								<div key={`domain-${index}`} className="group/row contents">
									<div className="group/row-item contents">
										<Link
											href={`/${activeOrganizationSlug}/domain/${domain.domain}`}
											className={`group/row contents items-center gap-2 transition-colors hover:text-blue-600 ${currentDomainId === domain.domain ? "text-blue-600" : ""
												}`}
										>
											<div className={cn(
												"flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
												isRowActive && "bg-bg-weak-50/50"
											)}>
												<motion.div
													{...getAnimationProps(index + 1, 0)}
													className="flex items-center gap-2 pl-5"
												>
													<Icon
														name="globe"
														className={cn(
															"h-4 w-4",
															getStatusColorClass(domain.status),
														)}
													/>
													<span className="font-medium text-label-sm text-text-strong-950">
														{domain.domain}
													</span>
												</motion.div>
											</div>
											<div className={cn(
												"flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
												isRowActive && "bg-bg-weak-50/50"
											)}>
												<motion.div
													{...getAnimationProps(index + 1, 1)}
													className="flex items-center gap-2"
												>
													<div
														className={cn(
															"flex items-center gap-2.5 rounded-lg py-0.5 font-medium text-[13px] capitalize",
															getStatusColorClass(domain.status),
														)}
													>
														<Icon
															name={getStatusIcon(domain.status)}
															className="h-3.5 w-3.5"
														/>
														{getStatusLabel(domain.status)}
													</div>
												</motion.div>
											</div>
											<div className={cn(
												"flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
												isRowActive && "bg-bg-weak-50/50"
											)}>
												<motion.span
													{...getAnimationProps(index + 1, 2)}
													className="text-label-sm text-text-strong-950"
												>
													{formatRelativeTime(domain.createdAt)}
												</motion.span>
											</div>
										</Link>
									</div>
									<div className={cn(
										"flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
										isRowActive && "bg-bg-weak-50/50"
									)}>
										<motion.div
											{...getAnimationProps(index + 1, 3)}
											className="flex items-center justify-center"
										>
											<DomainDropdown
												domainId={domain.id}
												domainName={domain.domain}
												onViewDetails={handleViewDetails}
												onDelete={handleDeleteDomain}
												onOpenChange={(open) => setActiveDropdownId(open ? domain.id : null)}
											/>
										</motion.div>
									</div>
								</div>
							)
						})}
				</div>
			</div>
		</AnimatePresence>
	);
};
