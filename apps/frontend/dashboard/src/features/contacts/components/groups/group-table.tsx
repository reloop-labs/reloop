import Link from "next/link";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import type { Group } from "#/features/contacts/hooks/use-contacts-query";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { EditGroupRowPanel } from "./edit-group-row-panel";
import { GroupDropdown } from "./group-dropdown";
import { GroupsEmptyState } from "./groups-empty-state";

interface GroupTableProps {
	groups: Group[];
	total?: number;
	currentPage?: number;
	pageSize?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (size: number) => void;
	isLoading?: boolean;
	loadingRows?: number;
	onAddGroup?: () => void;
	searchQuery?: string;
	onClearSearch?: () => void;
}

const GroupSkeleton = () => (
	<div className="grid grid-cols-[1fr_100px_150px_80px] items-center px-4 py-2">
		<div className="flex items-center gap-3">
			<Skeleton className="h-4 w-4 rounded-md" />
			<Skeleton className="h-4 w-40" />
		</div>
		<Skeleton className="h-4 w-12" />
		<Skeleton className="h-4 w-28" />
		<div className="flex items-center justify-end">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

const GroupContactsCount = ({ groupId }: { groupId: string }) => {
	const { data, isPending: isLoading } = useQuery({
		queryKey: ["contacts", "group-count", groupId],
		queryFn: async () => {
			const res = await fetch(
				`/api/contacts/v1/groups/${groupId}/contacts?limit=1`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ total: number }>;
		},
	});

	if (isLoading) return <Skeleton className="h-4 w-8" />;
	return (
		<span className="font-medium text-label-sm text-text-strong-950">
			{data?.total ?? "---"}
		</span>
	);
};

export const GroupTable = ({
	groups,
	total = 0,
	currentPage = 1,
	pageSize = 10,
	onPageChange,
	onPageSizeChange,
	isLoading,
	loadingRows = 6,
	onAddGroup,
	searchQuery,
	onClearSearch,
}: GroupTableProps) => {
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

	const handleEdit = (group: Group) => {
		setEditingGroupId((prev) => (prev === group.id ? null : group.id));
	};

	const handleDelete = (group: Group) => {
		void setModal("delete-group");
		void setId(group.id);
	};

	const totalPages = Math.ceil(total / pageSize);
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, total);

	return (
		<div className="w-full text-paragraph-sm">
			{/* Table Header */}
			<div className="grid grid-cols-[1fr_100px_150px_80px] items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40">
				<div className="flex items-center gap-1">
					<Icon name="modules" className="h-3 w-3" />
					<span className="text-xs">Name</span>
				</div>
				<div className="flex items-center gap-1">
					<Icon name="users" className="h-3 w-3" />
					<span className="text-xs">Contacts</span>
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
						<GroupSkeleton key={`skeleton-${i}`} />
					))
				) : groups.length === 0 ? (
					<GroupsEmptyState
						onAddGroup={onAddGroup}
						searchQuery={searchQuery}
						onClearSearch={onClearSearch}
					/>
				) : (
					<AnimatePresence mode="popLayout" initial={false}>
						{groups.map((group) => {
							const isEditing = editingGroupId === group.id;
							const isRowActive = activeDropdownId === group.id || isEditing;
							return (
								<motion.div
									key={group.id}
									layout
									initial={{ opacity: 1, height: "auto" }}
									exit={{
										opacity: 0,
										height: 0,
										scale: 0.98,
										transition: {
											height: {
												duration: 0.22,
												ease: [0.32, 0.72, 0, 1],
											},
											opacity: { duration: 0.15, ease: "easeOut" },
											scale: { duration: 0.15, ease: "easeOut" },
											layout: {
												duration: 0.25,
												ease: [0.32, 0.72, 0, 1],
											},
										},
									}}
									className="overflow-hidden"
								>
									<div
										className={cn(
											"group/row grid w-full grid-cols-[1fr_100px_150px_80px] items-center px-4 py-2 text-left transition-colors",
											"hover:bg-bg-weak-50/50",
											isRowActive && "bg-bg-weak-50/50",
											isEditing && "bg-bg-weak-50/70",
										)}
									>
										{/* Name Column */}
										<div className="flex items-center gap-2">
											<Icon
												name="modules"
												className="h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<Link href={`/contacts/groups/${group.id}`} className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400">
												{group.name}
											</Link>
											{isEditing && (
												<span className="rounded-md bg-bg-white-0 px-1.5 py-0.5 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100">
													Editing
												</span>
											)}
										</div>

										{/* Contacts Column */}
										<div className="flex items-center">
											<GroupContactsCount groupId={group.id} />
										</div>

										{/* Created At Column */}
										<div className="flex items-center">
											<span className="whitespace-nowrap font-medium text-[13px]">
												{group.createdAt
													? formatRelativeTime(group.createdAt)
													: "—"}
											</span>
										</div>

										{/* Actions Column */}
										<div
											className="flex items-center justify-end"
											onClick={(e) => e.stopPropagation()}
										>
											<GroupDropdown
												group={group}
												onEdit={handleEdit}
												onDelete={handleDelete}
												onOpenChange={(open) =>
													setActiveDropdownId(open ? group.id : null)
												}
											/>
										</div>
									</div>

									<AnimatePresence initial={false}>
										{isEditing ? (
											<motion.div
												key={`edit-${group.id}`}
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{
													height: {
														duration: 0.28,
														ease: [0.32, 0.72, 0, 1],
													},
													opacity: { duration: 0.2, ease: "easeOut" },
												}}
												className="overflow-hidden"
											>
												<EditGroupRowPanel
													group={group}
													onClose={() => setEditingGroupId(null)}
												/>
											</motion.div>
										) : null}
									</AnimatePresence>
								</motion.div>
							);
						})}
					</AnimatePresence>
				)}

				{/* Pagination Footer */}
				{!isLoading && (total ?? 0) > 0 && (
					<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
						<div className="flex items-center gap-3">
							<span>
								Showing {startIndex}–{endIndex} of {total} group
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
		</div>
	);
};
