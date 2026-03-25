"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteGroupModal } from "./delete-group";
import { EditGroupModal } from "./edit-group-modal";
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
	activeOrganizationSlug: string;
	isLoading?: boolean;
	loadingRows?: number;
	onEdit?: (contact_group_id: string) => void;
	onAddGroup?: () => void;
	onDelete?: (contact_group_id: string) => void;
}

const GroupSkeleton = () => (
	<div className="grid grid-cols-[1fr_200px_80px] items-center px-4 py-2">
		<div className="flex items-center gap-3">
			<Skeleton className="h-4 w-4" />
			<Skeleton className="h-4 w-40" />
		</div>
		<Skeleton className="h-4 w-32" />
		<div className="flex items-center justify-end">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

export const GroupTable = ({
	groups,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 4,
	onEdit,
	onAddGroup,
	onDelete,
}: GroupTableProps) => {
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm">
				<div className="grid grid-cols-[1fr_200px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 font-medium text-text-sub-600">
					<div className="flex items-center gap-2">
						<Icon name="modules" className="h-3.5 w-3.5" />
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-3.5 w-3.5" />
						<span className="text-xs">Created at</span>
					</div>
					<div />
				</div>
				<div className="divide-y divide-stroke-soft-100">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<GroupSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 bg-white text-paragraph-sm">
			<div className="grid grid-cols-[1fr_200px_80px] items-center border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-3.5 font-medium text-text-sub-600">
				<div className="flex items-center gap-2">
					<Icon name="modules" className="h-3.5 w-3.5" />
					<span className="text-xs uppercase tracking-wider">Name</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="clock" className="h-3.5 w-3.5" />
					<span className="text-xs uppercase tracking-wider">Created at</span>
				</div>
				<div />
			</div>

			<div className="divide-y divide-stroke-soft-100">
				{groups.length === 0 ? (
					<GroupsEmptyState onAddGroup={onAddGroup} />
				) : (
					groups.map((group) => {
						const isRowActive = activeDropdownId === group.id;
						return (
							<div
								key={group.id}
								className={cn(
									"group/row grid w-full grid-cols-[1fr_200px_80px] items-center px-4 py-3 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
									isRowActive && "bg-bg-weak-50/50",
								)}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-weak-100 text-text-sub-600">
										<Icon name="modules" className="h-3.5 w-3.5" />
									</div>
									<span className="truncate font-medium text-text-strong-950">
										{group.name}
									</span>
								</div>

								<div className="flex items-center text-text-sub-600">
									<span>{formatRelativeTime(group.createdAt)}</span>
								</div>

								<div className="flex items-center justify-end">
									<GroupDropdown
										group={group}
										onEdit={() => onEdit?.(group.id)}
										onDelete={() => onDelete?.(group.id)}
										onOpenChange={(open) =>
											setActiveDropdownId(open ? group.id : null)
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
