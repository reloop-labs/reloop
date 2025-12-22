"use client";
import { getAnimationProps } from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { TopicDropdown } from "./topic-dropdown";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	autoEnroll?: "enrolled" | "unenrolled";
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
}

// Badge styles matching the "Admin"/"Member" style from the image
const getEnrollmentBadgeStyle = (autoEnroll?: "enrolled" | "unenrolled") => {
	if (autoEnroll === "enrolled") {
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

export const TopicTable = ({
	topics,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 4,
	onToggleVisibility,
	onEdit,
}: TopicTableProps) => {
	const [, setDeleteId] = useQueryState("delete");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleViewDetails = (topicId: string) => {
		window.location.href = `/dashboard/${activeOrganizationSlug}/topics/${topicId}`;
	};

	const handleDelete = (topicId: string) => {
		setDeleteId(topicId);
	};

	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				{/* Table Header */}
				<div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] items-center px-4 py-3.5 text-text-sub-600">
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
				<div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px]">
					{isLoading
						? // Skeleton loading state
							Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}`} className="contents">
									<div className="flex items-center gap-2 border-stroke-soft-100 border-t py-2 pl-4">
										<Skeleton className="h-4 w-4 rounded" />
										<Skeleton className="h-4 w-32" />
									</div>
									<div className="flex items-center border-stroke-soft-100 border-t py-2">
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>
									<div className="flex items-center border-stroke-soft-100 border-t py-2">
										<Skeleton className="h-5 w-14 rounded-full" />
									</div>
									<div className="flex items-center border-stroke-soft-100 border-t py-2">
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex items-center justify-center border-stroke-soft-100 border-t py-2 pr-4">
										<Skeleton className="h-4 w-4 rounded" />
									</div>
								</div>
							))
						: topics.map((topic, index) => {
								const isRowActive = activeDropdownId === topic.id;
								const enrollmentValue = topic.autoEnroll || "unenrolled";
								const visibilityValue = topic.visibility || "private";

								return (
									<div key={topic.id} className="group/row contents">
										{/* Name Column (clickable link) */}
										<Link
											href={`/${activeOrganizationSlug}/topics/${topic.id}`}
											className="group/row contents"
										>
											<div
												className={cn(
													"flex items-center gap-2 border-stroke-soft-100 border-t py-2 pl-4 transition-colors group-hover/row:bg-bg-weak-50/50",
													isRowActive && "bg-bg-weak-50/50",
												)}
											>
												<motion.div
													{...getAnimationProps(index + 1, 0)}
													className="flex items-center gap-2"
												>
													<Icon
														name="notification-indicator"
														className="h-4 w-4 shrink-0 text-text-sub-600"
													/>
													<div className="truncate text-label-sm text-text-strong-950">
														{topic.name}
													</div>
												</motion.div>
											</div>

											{/* Enrollment Column */}
											<div
												className={cn(
													"flex items-center border-stroke-soft-100 border-t py-2 transition-colors group-hover/row:bg-bg-weak-50/50",
													isRowActive && "bg-bg-weak-50/50",
												)}
											>
												<motion.div
													{...getAnimationProps(index + 1, 1)}
													className="flex items-center"
												>
													<span
														className={cn(
															"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-[11px] capitalize",
															getEnrollmentBadgeStyle(topic.autoEnroll),
														)}
													>
														<Icon
															name={
																topic.autoEnroll === "enrolled"
																	? "user-plus"
																	: "user-minus"
															}
															className="h-3 w-3"
														/>
														{enrollmentValue}
													</span>
												</motion.div>
											</div>

											{/* Visibility Column */}
											<div
												className={cn(
													"flex items-center border-stroke-soft-100 border-t py-2 transition-colors group-hover/row:bg-bg-weak-50/50",
													isRowActive && "bg-bg-weak-50/50",
												)}
											>
												<motion.div
													{...getAnimationProps(index + 1, 2)}
													className="flex items-center"
												>
													<span
														className={cn(
															"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-[11px] capitalize",
															getVisibilityBadgeStyle(topic.visibility),
														)}
													>
														<Icon
															name={
																topic.visibility === "public" ? "globe" : "lock"
															}
															className="h-3 w-3"
														/>
														{visibilityValue}
													</span>
												</motion.div>
											</div>

											{/* Created Column */}
											<div
												className={cn(
													"flex items-center border-stroke-soft-100 border-t py-2 transition-colors group-hover/row:bg-bg-weak-50/50",
													isRowActive && "bg-bg-weak-50/50",
												)}
											>
												<motion.div
													{...getAnimationProps(index + 1, 3)}
													className="flex items-center"
												>
													<span className="whitespace-nowrap text-label-sm text-text-sub-600">
														{formatRelativeTime(topic.createdAt)}
													</span>
												</motion.div>
											</div>
										</Link>

										{/* Actions Column - outside Link to prevent navigation on dropdown click */}
										<div
											className={cn(
												"flex items-center justify-center border-stroke-soft-100 border-t py-2 pr-4 transition-colors group-hover/row:bg-bg-weak-50/50",
												isRowActive && "bg-bg-weak-50/50",
											)}
										>
											<motion.div
												{...getAnimationProps(index + 1, 4)}
												className="flex items-center justify-center"
											>
												<TopicDropdown
													topicId={topic.id}
													topicName={topic.name}
													visibility={topic.visibility}
													onViewDetails={handleViewDetails}
													onEdit={onEdit}
													onDelete={handleDelete}
													onToggleVisibility={onToggleVisibility}
													onOpenChange={(open: boolean) =>
														setActiveDropdownId(open ? topic.id : null)
													}
												/>
											</motion.div>
										</div>
									</div>
								);
							})}
				</div>
			</div>
		</AnimatePresence>
	);
};
