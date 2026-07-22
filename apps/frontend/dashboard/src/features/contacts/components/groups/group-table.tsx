import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { GroupDropdown } from "./group-dropdown";
import { GroupsEmptyState } from "./groups-empty-state";

interface Group {
	id: string;
	name: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

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
}: GroupTableProps) => {
	const navigate = useNavigate();
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleRowClick = (group: Group) => {
		void navigate({
			to: "/contacts/groups/$groupId",
			params: { groupId: group.id },
		});
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
					<GroupsEmptyState onAddGroup={onAddGroup} />
				) : (
					groups.map((group) => {
						const isRowActive = activeDropdownId === group.id;
						return (
							<div
								key={group.id}
								onClick={() => handleRowClick(group)}
								className={cn(
									"group/row grid w-full cursor-pointer grid-cols-[1fr_100px_150px_80px] items-center px-4 py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base focus-visible:outline-offset-[-1px]",
									isRowActive && "bg-bg-weak-50/50",
								)}
							>
								{/* Name Column */}
								<div className="flex items-center gap-2">
									<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white shadow-sm">
										<Icon name="modules" className="h-2.5 w-2.5" />
									</div>
									<span className="truncate font-medium text-label-sm text-text-strong-950">
										{group.name}
									</span>
								</div>

								{/* Contacts Column */}
								<div className="flex items-center">
									<GroupContactsCount groupId={group.id} />
								</div>

								{/* Created At Column */}
								<div className="flex items-center">
									<span className="whitespace-nowrap font-medium text-[13px]">
										{formatRelativeTime(group.createdAt)}
									</span>
								</div>

								{/* Actions Column */}
								<div
									className="flex items-center justify-end"
									onClick={(e) => e.stopPropagation()}
								>
									<GroupDropdown
										group={group}
										onDelete={handleDelete}
										onOpenChange={(open) =>
											setActiveDropdownId(open ? group.id : null)
										}
									/>
								</div>
							</div>
						);
					})
				)}

				{/* Pagination Footer */}
				{!isLoading && total > 0 && (
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
