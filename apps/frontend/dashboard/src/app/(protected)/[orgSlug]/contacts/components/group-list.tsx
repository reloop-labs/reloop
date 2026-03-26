"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import { DeleteGroupModal } from "./delete-group";
import { EditGroupModal } from "./edit-group-modal";
import { GroupTable } from "./group-table";

interface Group {
	id: string;
	name: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface GroupListResponse {
	groups: Group[];
	total: number;
	page: number;
	limit: number;
}

export const GroupList = () => {
	const { activeOrganization } = useUserOrganization();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [, setModal] = useQueryState("modal");
	const [editGroupId, setEditGroupId] = useState<string | null>(null);
	const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const { data, error, isLoading } = useSWR<GroupListResponse>(
		activeOrganization?.id
			? `/api/contacts/v1/groups/list?limit=${pageSize}&page=${currentPage}${searchQuery ? `&search=${searchQuery}` : ""}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-12 text-center">
				<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-error-light/10">
					<Icon name="alert-circle" className="h-5 w-5 text-error-base" />
				</div>
				<h3 className="font-semibold text-text-strong-950">
					Failed to load groups
				</h3>
				<p className="mx-auto max-w-xs text-sm text-text-sub-600">
					Something went wrong while fetching the groups list. Please try again.
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall" className="rounded-[10px]">
						<Input.Wrapper>
							<Input.Icon
								as={Icon}
								name="search"
								size="xsmall"
								className="h-3.5 w-3.5"
							/>
							<Input.Input
								placeholder="Search groups..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
			</div>

			<div className="mt-4">
				<GroupTable
					groups={data?.groups || []}
					activeOrganizationSlug={activeOrganization.slug}
					isLoading={isLoading}
					onEdit={(contact_group_id) => setEditGroupId(contact_group_id)}
					onAddGroup={() => setModal("create-group")}
					onDelete={(contact_group_id) => setDeleteGroupId(contact_group_id)}
				/>
			</div>

			{/* Pagination */}
			{data && data.total > 0 && (
				<div className="mt-4 flex items-center justify-between pb-8 font-medium text-paragraph-sm text-text-sub-600">
					<div className="flex items-center gap-3">
						<span>
							Showing {startIndex}–{endIndex} of {data.total} group
							{data.total !== 1 ? "s" : ""}
						</span>
						<PageSizeDropdown
							value={pageSize}
							onValueChange={(value) => {
								setPageSize(value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isLoading={isLoading}
					/>
				</div>
			)}

			<EditGroupModal
				open={!!editGroupId}
				onOpenChange={(open) => !open && setEditGroupId(null)}
				group={data?.groups?.find((g) => g.id === editGroupId) || null}
			/>

			<DeleteGroupModal
				open={!!deleteGroupId}
				onOpenChange={(open) => !open && setDeleteGroupId(null)}
				group={data?.groups?.find((g) => g.id === deleteGroupId) || null}
			/>
		</div>
	);
};
