"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { Domain } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useParams, useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { DomainDropdown } from "./domain-dropdown";
import { DomainSkeleton } from "./domain-skeleton";
import { EmptyState } from "./empty-state";

interface DomainTableProps {
	domains: Domain[];
	total: number;
	isLoading?: boolean;
	loadingRows?: number;
}

export const DomainTable = ({
	domains,
	total,
	isLoading,
	loadingRows = 4,
}: DomainTableProps) => {
	const router = useRouter();
	const { domainId } = useParams();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [, setDeleteId] = useQueryState("delete");

	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const totalPages = Math.ceil(total / pageSize);
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, total);

	const handleRowClick = (domainId: string) => {
		router.push(`/domain/${domainId}`);
	};

	const handleDeleteDomain = (domainId: string) => {
		setDeleteId(domainId);
	};

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/40">
			{/* Table Header */}
			<div className="grid grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-2.5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40">
				<div className="flex items-center gap-1">
					<Icon name="globe" className="h-3 w-3" />
					<span className="text-xs">Domain</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="activity" className="h-3 w-3" />
					<span className="text-xs">Status</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="clock" className="h-3 w-3" />
					<span className="text-xs">Created At</span>
				</div>
				<div />
			</div>

			{/* Table Body */}
			<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						<DomainSkeleton key={`skeleton-${i}`} />
					))
				) : domains.length === 0 ? (
					<EmptyState />
				) : (
					domains.map((domain) => {
						const isRowActive = activeDropdownId === domain.id;
						const isSelected = domainId === domain.id;

						return (
							<div
								key={domain.id}
								onClick={() => handleRowClick(domain.id)}
								className={cn(
									"group/row grid cursor-pointer grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center px-4 py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
									(isRowActive || isSelected) && "bg-bg-weak-50/50",
								)}
							>
								{/* Name Column */}
								<div className="flex items-center gap-2">
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
								</div>

								{/* Status Column */}
								<div className="flex items-center">
									<div
										className={cn(
											"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
											getStatusColorClass(domain.status),
										)}
									>
										<Icon
											name={getStatusIcon(domain.status)}
											className="h-3.5 w-3.5"
										/>
										{getStatusLabel(domain.status)}
									</div>
								</div>

								{/* Created Column */}
								<div>
									<span className="whitespace-nowrap font-medium text-[13px]">
										{formatRelativeTime(domain.createdAt)}
									</span>
								</div>

								{/* Actions Column */}
								<div
									className="flex items-center justify-center text-text-soft-400"
									onClick={(e) => e.stopPropagation()}
								>
									<DomainDropdown
										domainId={domain.id}
										domainName={domain.domain}
										onViewDetails={() => handleRowClick(domain.id)}
										onDelete={handleDeleteDomain}
										onOpenChange={(open) =>
											setActiveDropdownId(open ? domain.id : null)
										}
									/>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Pagination */}
			{total > 0 && (
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-4 py-2 text-label-xs text-text-sub-600 dark:border-stroke-soft-100/40">
					<div className="flex items-center">
						<span>
							Showing {startIndex}–{endIndex} of {total} domain
							{total !== 1 ? "s" : ""}
						</span>
						<PageSizeDropdown
							value={pageSize}
							onValueChange={(value) => {
								setPageSize(value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isLoading={isLoading}
					/>
				</div>
			)}
		</div>
	);
};
