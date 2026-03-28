"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "./empty-state";
import { TopicDropdown } from "./topic-dropdown";

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
	activeOrganizationSlug: string;
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
	activeOrganizationSlug,
	isLoading,
	loadingRows = 4,
	onToggleVisibility,
	onEdit,
	onAddTopic,
}: TopicTableProps) => {
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleRowClick = (topicId: string) => {
		router.push(`/${activeOrganizationSlug}/contacts/topics/${topicId}`);
	};

	const handleDelete = (_topicId: string) => {
		// Topic deletion handled through query state in TopicList if needed
	};

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
					<div className="flex items-center gap-2">
						<Icon name="notification-indicator" className="h-4 w-4" />
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="users" className="h-4 w-4" />
						<span className="text-xs">Enrollment</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="eye-outline" className="h-4 w-4" />
						<span className="text-xs">Visibility</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Created</span>
					</div>
					<div />
				</div>
				<div className="divide-y divide-stroke-soft-100">
					{Array.from({ length: loadingRows }).map((_, i) => (
						<TopicSkeleton key={`skeleton-${i}`} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
			{/* Table Header */}
			<div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
				<div className="flex items-center gap-2">
					<Icon name="notification-indicator" className="h-4 w-4" />
					<span className="text-xs">Name</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="users" className="h-4 w-4" />
					<span className="text-xs">Enrollment</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="eye-outline" className="h-4 w-4" />
					<span className="text-xs">Visibility</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="clock" className="h-4 w-4" />
					<span className="text-xs">Created</span>
				</div>
				<div />
			</div>

			{/* Table Body */}
			<div className="divide-y divide-stroke-soft-100">
				{topics.length === 0 ? (
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
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
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
									<span className="truncate text-label-sm text-text-strong-950">
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
								<div className="flex items-center text-text-sub-600">
									<span className="whitespace-nowrap text-label-sm">
										{formatRelativeTime(topic.createdAt)}
									</span>
								</div>

								{/* Actions Column */}
								<div
									className="flex items-center justify-center"
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
		</div>
	);
};
