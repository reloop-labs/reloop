"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "./empty-state";
import { TopicDropdown } from "./topic-dropdown";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface TopicTableProps {
	topics: Topic[];
	total?: number;
	currentPage?: number;
	pageSize?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	isLoading?: boolean;
	loadingRows?: number;
	onToggleVisibility?: (
		topicId: string,
		currentValue: "private" | "public",
	) => void;
	onEdit?: (topicId: string) => void;
	onDelete?: (topicId: string) => void;
	onAddTopic?: () => void;
}

// Badge styles matching the "Admin"/"Member" style from the image
const getEnrollmentBadgeStyle = (
	defaultSubscription?: "opt_in" | "opt_out",
) => {
	if (defaultSubscription === "opt_in") {
		return "text-success-base border-success-base/40 bg-success-base/5";
	}
	return "text-text-sub-600 border-stroke-soft-200 bg-bg-white-0";
};

const getVisibilityBadgeStyle = (visibility?: "private" | "public") => {
	if (visibility === "public") {
		return "text-primary-base border-primary-base/30 bg-primary-base/5";
	}
	return "text-text-sub-600 border-stroke-soft-200 bg-bg-white-0";
};

const TopicSkeleton = () => (
	<div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] items-center px-4 py-2">
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-4 rounded" />
			<Skeleton className="h-4 w-32" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-5 w-16 rounded-full" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-5 w-14 rounded-full" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center justify-center">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

export const TopicTable = ({
	topics,
	total = 0,
	currentPage = 1,
	pageSize = 10,
	onPageChange,
	onPageSizeChange,
	isLoading,
	loadingRows = 4,
	onToggleVisibility,
	onEdit,
	onDelete,
	onAddTopic,
}: TopicTableProps) => {
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleRowClick = (topicId: string) => {
		router.push(`/contacts/topics/${topicId}`);
	};

	const handleDelete = (topicId: string) => {
		onDelete?.(topicId);
	};

	const totalPages = Math.ceil(total / pageSize);
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, total);

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/40">
			{/* Table Header */}
			<div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] items-center border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-2.5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40">
				<div className="flex items-center gap-1">
					<Icon name="notification-indicator" className="h-3 w-3" />
					<span className="text-xs">Name</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="users" className="h-3 w-3" />
					<span className="text-xs">Enrollment</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="eye-outline" className="h-3 w-3" />
					<span className="text-xs">Visibility</span>
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
						<TopicSkeleton key={`skeleton-${i}`} />
					))
				) : topics.length === 0 ? (
					<EmptyState onCreateClick={onAddTopic} />
				) : (
					topics.map((topic) => {
						const isRowActive = activeDropdownId === topic.id;
						const enrollmentValue = topic.defaultSubscription || "opt_out";
						const visibilityValue = topic.visibility || "private";

						return (
							<div
								key={topic.id}
								onClick={() => handleRowClick(topic.id)}
								className={cn(
									"group/row grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr_48px] items-center px-4 py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base focus-visible:outline-offset-[-1px]",
									isRowActive && "bg-bg-weak-50/50",
								)}
							>
								{/* Name Column */}
								<div className="flex items-center gap-2">
									<div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 text-white shadow-sm">
										<Icon
											name="notification-indicator"
											className="h-2.5 w-2.5"
										/>
									</div>
									<span className="truncate font-medium text-label-sm text-text-strong-950">
										{topic.name}
									</span>
								</div>

								{/* Enrollment Column */}
								<div className="flex items-center">
									<span
										className={cn(
											"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-[11px] capitalize",
											getEnrollmentBadgeStyle(topic.defaultSubscription),
										)}
									>
										<Icon
											name={
												topic.defaultSubscription === "opt_in"
													? "user-plus"
													: "user-minus"
											}
											className="h-3 w-3"
										/>
										{enrollmentValue}
									</span>
								</div>

								{/* Visibility Column */}
								<div className="flex items-center">
									<span
										className={cn(
											"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-[11px] capitalize",
											getVisibilityBadgeStyle(topic.visibility),
										)}
									>
										<Icon
											name={topic.visibility === "public" ? "globe" : "lock"}
											className="h-3 w-3"
										/>
										{visibilityValue}
									</span>
								</div>

								{/* Created Column */}
								<div className="flex items-center">
									<span className="whitespace-nowrap font-medium text-[13px]">
										{formatRelativeTime(topic.createdAt)}
									</span>
								</div>

								{/* Actions Column */}
								<div
									className="flex items-center justify-center text-text-soft-400"
									onClick={(e) => e.stopPropagation()}
								>
									<TopicDropdown
										topicId={topic.id}
										topicName={topic.name}
										visibility={topic.visibility}
										onViewDetails={() => handleRowClick(topic.id)}
										onEdit={onEdit}
										onDelete={handleDelete}
										onToggleVisibility={onToggleVisibility}
										onOpenChange={(open: boolean) =>
											setActiveDropdownId(open ? topic.id : null)
										}
									/>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Pagination Footer */}
			{!isLoading && total > 0 && (
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-4 py-2 text-label-xs text-text-sub-600 dark:border-stroke-soft-100/40">
					<div className="flex items-center gap-3">
						<span>
							Showing {startIndex}–{endIndex} of {total} topic
							{total !== 1 ? "s" : ""}
						</span>
						<PageSizeDropdown
							value={pageSize}
							onValueChange={(value) => onPageSizeChange?.(value)}
						/>
					</div>
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={(page) => onPageChange?.(page)}
						isLoading={isLoading}
					/>
				</div>
			)}
		</div>
	);
};
