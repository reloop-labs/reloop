"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
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
	const { data, isLoading } = useSWR<{ total: number }>(
		`/api/contacts/v1/groups/${groupId}/contacts?limit=1`,
	);

	if (isLoading) return <Skeleton className="h-4 w-8" />;
	return (
		<span className="text-label-sm text-text-strong-950">
			{data?.total ?? "---"}
		</span>
	);
};

export const GroupTable = ({
	groups,
	activeOrganizationSlug,
	isLoading,
	loadingRows = 6,
	onEdit,
	onAddGroup,
	onDelete,
}: GroupTableProps) => {
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleRowClick = (groupId: string) => {
		router.push(`/${activeOrganizationSlug}/contacts/groups/${groupId}`);
	};

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm">
				<div className="grid grid-cols-[1fr_100px_150px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
					<div className="flex items-center gap-2">
						<Icon name="modules" className="h-4 w-4" />
						<span className="text-xs">Name</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="users" className="h-4 w-4" />
						<span className="text-xs">Contacts</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
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
		<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm">
			<div className="grid grid-cols-[1fr_100px_150px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
				<div className="flex items-center gap-2">
					<Icon name="modules" className="h-4 w-4" />
					<span className="text-xs">Name</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="users" className="h-4 w-4" />
					<span className="text-xs">Contacts</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="clock" className="h-4 w-4" />
					<span className="text-xs">Created At</span>
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
								onClick={() => handleRowClick(group.id)}
								className={cn(
									"group/row grid w-full cursor-pointer grid-cols-[1fr_100px_150px_80px] items-center px-4 py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
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
									<span className="whitespace-nowrap text-label-sm text-text-strong-950">
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
