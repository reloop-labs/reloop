import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useNavigate } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { Domain } from "../types";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "../utils";
import { DomainDropdown } from "./domain-dropdown";
import { DomainSkeleton } from "./domain-skeleton";
import { EmptyState } from "./empty-state";

export function DomainTable({
	domains,
	total,
	isLoading,
	loadingRows = 4,
}: {
	domains: Domain[];
	total: number;
	isLoading?: boolean;
	loadingRows?: number;
}) {
	const navigate = useNavigate();
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

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));
	const startIndex =
		total === 0 ? 0 : ((currentPage ?? 1) - 1) * (pageSize ?? 10) + 1;
	const endIndex = Math.min((currentPage ?? 1) * (pageSize ?? 10), total);

	const goToDomain = (id: string) => {
		void navigate({ to: "/domain/$domainId", params: { domainId: id } });
	};

	return (
		<div className="w-full text-paragraph-sm">
			<div className="grid grid-cols-[minmax(0,1fr)_120px_140px_32px] items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-white/[0.03]">
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

			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<DomainSkeleton key={`skeleton-${i}`} />
					))
				) : domains.length === 0 ? (
					<EmptyState />
				) : (
					domains.map((domain) => {
						const isRowActive = activeDropdownId === domain.id;
						return (
							<div
								key={domain.id}
								role="link"
								tabIndex={0}
								onClick={() => goToDomain(domain.id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										goToDomain(domain.id);
									}
								}}
								className={cn(
									"group/row grid cursor-pointer grid-cols-[minmax(0,1fr)_120px_140px_32px] items-center px-4 py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
									isRowActive && "bg-bg-weak-50/50",
								)}
							>
								<div className="flex min-w-0 items-center gap-2">
									<Icon
										name="globe"
										className={cn(
											"h-4 w-4",
											getStatusColorClass(domain.status),
										)}
									/>
									<span className="truncate font-medium text-label-sm text-text-strong-950">
										{domain.domain}
									</span>
								</div>
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
								<div>
									<span className="whitespace-nowrap font-medium text-[13px]">
										{formatRelativeTime(domain.createdAt)}
									</span>
								</div>
								<div className="flex items-center justify-center text-text-soft-400">
									<DomainDropdown
										domainId={domain.id}
										domainName={domain.domain}
										onViewDetails={() => goToDomain(domain.id)}
										onDelete={(id) => void setDeleteId(id)}
										onOpenChange={(open) =>
											setActiveDropdownId(open ? domain.id : null)
										}
									/>
								</div>
							</div>
						);
					})
				)}

				{total > 0 && (
					<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
						<div className="flex items-center">
							<span>
								Showing {startIndex}–{endIndex} of {total} domain
								{total !== 1 ? "s" : ""}
							</span>
							<PageSizeDropdown
								value={pageSize ?? 10}
								onValueChange={(value) => {
									void setPageSize(value);
									void setCurrentPage(1);
								}}
							/>
						</div>
						<PaginationControls
							currentPage={currentPage ?? 1}
							totalPages={totalPages}
							onPageChange={(p) => void setCurrentPage(p)}
							isLoading={isLoading}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
