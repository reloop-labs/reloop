"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { getAnimationProps } from "@fe/dashboard/utils/audience";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { AudienceGroup } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";

interface AudienceGroupTableProps {
	audienceGroups: AudienceGroup[];
	activeOrganizationSlug: string;
	currentGroupId?: string;
	isLoading?: boolean;
	loadingRows?: number;
}

export const AudienceGroupTable = ({
	audienceGroups,
	activeOrganizationSlug,
	currentGroupId,
	isLoading,
	loadingRows = 3,
}: AudienceGroupTableProps) => {
	const { push } = useUserOrganization();
	const [, setDeleteId] = useQueryState("delete");

	const handleDeleteGroup = (groupId: string) => {
		setDeleteId(groupId);
	};

	const handleViewDetails = (groupId: string) => {
		push(`/audience/${groupId}`);
	};

	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[1fr_minmax(200px,auto)_minmax(150px,auto)_minmax(100px,auto)_minmax(40px,auto)]">
					<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
						<div className="py-2.5">Group Name</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Audiences</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Subscribed</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Created At</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5" />
					</div>
					{isLoading
						? // Skeleton loading state
							Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="my-1 pl-5">
											<Skeleton className="h-4 w-32" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-16" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-12" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-4" />
									</div>
								</div>
							))
						: audienceGroups.map((group, index) => (
								<div key={`group-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 0)}
											className="flex items-center gap-2 pl-5"
										>
											<Link
												href={`/${activeOrganizationSlug}/audience/${group.id}`}
												className={`flex items-center gap-2 transition-colors hover:text-blue-600 ${
													currentGroupId === group.id ? "text-blue-600" : ""
												}`}
											>
												<Icon
													name="users"
													className="h-4 w-4 text-text-sub-600"
												/>
												<div className="flex flex-col">
													<span className="font-medium text-label-sm text-text-strong-950">
														{group.name}
													</span>
													{group.description && (
														<span className="text-label-xs text-text-sub-600">
															{group.description}
														</span>
													)}
												</div>
											</Link>
										</motion.div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 1)}
											className="flex items-center gap-2"
										>
											<span className="text-label-sm text-text-strong-950">
												{group.audienceCount}
											</span>
										</motion.div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 2)}
											className="flex items-center gap-2"
										>
											<span className="text-label-sm text-text-strong-950">
												{group.subscribedCount}
											</span>
										</motion.div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.span
											{...getAnimationProps(index + 1, 3)}
											className="text-label-sm text-text-strong-950"
										>
											{formatRelativeTime(group.createdAt)}
										</motion.span>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 4)}
											className="flex items-center justify-center"
										>
											<PopoverRoot>
												<PopoverTrigger asChild>
													<Button.Root
														variant="neutral"
														mode="ghost"
														size="xxsmall"
														className="rounded p-1"
													>
														<Icon
															name="more-vertical"
															className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
														/>
													</Button.Root>
												</PopoverTrigger>
												<PopoverContent align="end" className="w-48 p-2">
													<div className="flex flex-col gap-1">
														<Button.Root
															variant="neutral"
															mode="ghost"
															size="small"
															onClick={() => handleViewDetails(group.id)}
															className="w-full justify-start"
														>
															<Icon name="eye-outline" className="h-4 w-4" />
															View Audiences
														</Button.Root>
														<Button.Root
															variant="error"
															mode="ghost"
															size="small"
															onClick={() => handleDeleteGroup(group.id)}
															className="w-full justify-start text-red-600 hover:bg-red-50"
														>
															<Icon name="trash" className="h-4 w-4" />
															Delete Group
														</Button.Root>
													</div>
												</PopoverContent>
											</PopoverRoot>
										</motion.div>
									</div>
								</div>
							))}
				</div>
			</div>
		</AnimatePresence>
	);
};
