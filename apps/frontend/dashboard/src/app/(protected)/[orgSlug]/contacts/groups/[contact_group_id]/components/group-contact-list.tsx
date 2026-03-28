"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import { ContactTable } from "../../../components/contact-table";
import { EmptyState } from "./empty-state";

interface Contact {
	id: string;
	email: string;
	status: string;
	firstName: string | null;
	lastName: string | null;
	organizationId: string;
	properties: Record<string, string | number>;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface GroupContactsResponse {
	group: {
		contacts: Contact[];
	};
	total: number;
	page: number;
	limit: number;
}

export const GroupContactList = ({ groupId }: { groupId: string }) => {
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);
	const [, setModal] = useQueryState("modal");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const buildUrl = () => {
		if (!groupId) return null;
		let url = `/api/contacts/v1/groups/${groupId}/contacts?limit=${pageSize}&page=${currentPage}`;
		return url;
	};

	const { data, error, isLoading } = useSWR<GroupContactsResponse>(buildUrl(), {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const filteredContacts =
		data?.group?.contacts?.filter((contact) => {
			const matchesStatus =
				statusFilter === "all" || contact.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				contact.email.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load related contacts
				</p>
			</div>
		);
	}

	return (
		<div className="mt-12">
		

			{data?.group?.contacts &&
			data.group.contacts.length === 0 &&
			!isLoading ? (
				<div className="pt-8">
					<EmptyState onAddContact={() => setModal("add-contact-to-group")} />
				</div>
			) : (
				<>
					<div className="mb-6 flex items-center justify-between gap-3">
						<div className="flex w-full items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search contacts..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="w-48">
								<Select.Root
									size="small"
									value={statusFilter}
									onValueChange={setStatusFilter}
									disabled={isLoading}
								>
									<Select.Trigger className="rounded-xl">
										<Select.Value placeholder="Status" />
									</Select.Trigger>
									<Select.Content className="w-48">
										<Select.Item value="all">
											<div className="flex items-center gap-2 text-sm">
												<Icon name="users" className="h-4 w-4" />
												All Status
											</div>
										</Select.Item>
										<Select.Item value="subscribed">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name="bell-plus"
													className="h-4 w-4 text-success-base"
												/>
												Subscribed
											</div>
										</Select.Item>
										<Select.Item value="unsubscribed">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name="bell-minus"
													className="h-4 w-4 text-text-sub-600"
												/>
												Unsubscribed
											</div>
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					</div>

					<ContactTable
						contacts={filteredContacts}
						isLoading={isLoading}
						loadingRows={5}
						onAddContact={() => setModal("add-contact-to-group")}
					/>
				</>
			)}

			{/* Pagination */}
			{data && data.total > 0 && (
				<div className="mt-4 flex items-center justify-between pb-8 text-paragraph-sm text-text-sub-600">
					<div className="flex items-center gap-3">
						<span>
							Showing {startIndex}–{endIndex} of {data.total} contact
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
		</div>
	);
};
