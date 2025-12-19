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
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface TopicTableProps {
	topics: Topic[];
	activeOrganizationSlug: string;
	isLoading?: boolean;
	loadingRows?: number;
}

export const TopicTable = ({
	topics,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 4,
}: TopicTableProps) => {
	const [, setDeleteId] = useQueryState("delete");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleViewDetails = (topicId: string) => {
		window.location.href = `/${activeOrganizationSlug}/topics/${topicId}`;
	};

	const handleDelete = (topicId: string) => {
		setDeleteId(topicId);
	};

	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[1fr_minmax(120px,auto)_minmax(40px,auto)]">
					{/* Headers */}
					<div className="pl-5 text-text-sub-600">
						<div className="flex items-center gap-2 py-3">
							<Icon name="notification-indicator" className="h-4 w-4" />
							<span className="text-[13px]">Topic</span>
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

					{/* Loading State */}
					{isLoading
						? Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200/70 border-t py-2">
										<div className="my-1 flex items-center gap-2 pl-5">
											<Skeleton className="h-4 w-4" />
											<Skeleton className="h-4 w-32" />
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
						: topics.map((topic, index) => {
								const isRowActive = activeDropdownId === topic.id;
								return (
									<div key={topic.id} className="group/row contents">
										{/* Topic Column */}
										<Link
											href={`/${activeOrganizationSlug}/topics/${topic.id}`}
											className={cn(
												"flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
												isRowActive && "bg-bg-weak-50/50",
											)}
										>
											<motion.div
												{...getAnimationProps(index + 1, 0)}
												className="flex items-center gap-2 pl-5"
											>
												<Icon
													name="notification-indicator"
													className="h-4 w-4 text-text-sub-600"
												/>
												<span className="font-medium text-label-sm text-text-strong-950">
													{topic.name}
												</span>
											</motion.div>
										</Link>

										{/* Created At Column */}
										<Link
											href={`/${activeOrganizationSlug}/topics/${topic.id}`}
											className={cn(
												"flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
												isRowActive && "bg-bg-weak-50/50",
											)}
										>
											<motion.span
												{...getAnimationProps(index + 1, 1)}
												className="text-label-sm text-text-strong-950"
											>
												{formatRelativeTime(topic.createdAt)}
											</motion.span>
										</Link>

										{/* Actions Column */}
										<div
											className={cn(
												"flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
												isRowActive && "bg-bg-weak-50/50",
											)}
										>
											<motion.div
												{...getAnimationProps(index + 1, 2)}
												className="flex items-center justify-center"
											>
												<TopicDropdown
													topicId={topic.id}
													topicName={topic.name}
													onViewDetails={handleViewDetails}
													onDelete={handleDelete}
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
