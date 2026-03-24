"use client";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { Domain } from "@reloop/api/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DomainDropdown } from "./domain-dropdown";
import { EmptyState } from "./empty-state";

interface DomainTableProps {
	domains: Domain[];
	activeOrganizationSlug: string;
	currentDomainId?: string;
	isLoading?: boolean;
	loadingRows?: number;
	onAddDomain?: () => void;
}

const DomainSkeleton = () => (
	<div className="grid grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_minmax(40px,auto)] items-center px-5 py-2">
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-32" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-2 w-2 rounded-full" />
			<Skeleton className="h-4 w-16" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center justify-center">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

export const DomainTable = ({
	domains,
	activeOrganizationSlug,
	currentDomainId,
	isLoading,
	loadingRows = 3,
	onAddDomain,
}: DomainTableProps) => {
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleRowClick = (domainName: string) => {
		router.push(`/${activeOrganizationSlug}/domain/${domainName}`);
	};

	const handleDeleteDomain = (domainId: string) => {
		// Handled via query state in list if needed
	};

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_minmax(40px,auto)] border-stroke-soft-100 border-b px-5 py-3 text-text-sub-600">
					<div className="flex items-center gap-2">
						<Icon name="globe" className="h-4 w-4" />
						<span className="text-[13px]">Domain</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="activity" className="h-4 w-4" />
						<span className="text-[13px]">Status</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-[13px]">Created At</span>
					</div>
					<div />
				</div>
				<div className="divide-y divide-stroke-soft-100">
					{Array.from({ length: loadingRows }).map((_, i) => (
						<DomainSkeleton key={`skeleton-${i}`} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
			{/* Table Header */}
			<div className="grid grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_minmax(40px,auto)] border-stroke-soft-100 border-b px-5 py-3 text-text-sub-600">
				<div className="flex items-center gap-2">
					<Icon name="globe" className="h-4 w-4" />
					<span className="text-[13px]">Domain</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="activity" className="h-4 w-4" />
					<span className="text-[13px]">Status</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="clock" className="h-4 w-4" />
					<span className="text-[13px]">Created At</span>
				</div>
				<div />
			</div>

			{/* Table Body */}
			<div className="divide-y divide-stroke-soft-100">
				{domains.length === 0 ? (
					<EmptyState onAddDomain={onAddDomain} />
				) : (
					domains.map((domain) => {
						const isRowActive = activeDropdownId === domain.id;
						const isSelected = currentDomainId === domain.domain;

						return (
							<div
								key={domain.id}
								onClick={() => handleRowClick(domain.domain)}
								className={cn(
									"group/row grid cursor-pointer grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_minmax(40px,auto)] items-center px-5 py-2 text-left transition-colors",
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
								<div className="flex items-center text-text-soft-400">
									<span className="text-label-sm">
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
										onViewDetails={() => handleRowClick(domain.domain)}
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
		</div>
	);
};
