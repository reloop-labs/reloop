"use client";
import {
	ContactFilterDropdown,
	type ContactFilterOption,
} from "@fe/dashboard/app/(protected)/(layout)/contacts/components/contacts/contact-filter-dropdown";
import { ContactTable } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/contacts/contact-table";
import type { AudienceStatus } from "@fe/dashboard/utils/audience";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface Contact {
	id: string;
	email: string;
	status: AudienceStatus;
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
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [statusFilter, setStatusFilter] = useState<ContactFilterOption>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const buildUrl = () => {
		if (!groupId) return null;
		const url = `/api/contacts/v1/groups/${groupId}/contacts?limit=${pageSize}&page=${currentPage}`;
		return url;
	};

	const { data, error, isLoading } = useSWR<GroupContactsResponse>(buildUrl(), {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const filteredContacts =
		data?.group?.contacts?.filter((contact) => {
			const matchesStatus =
				statusFilter === null || contact.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				contact.email.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	const handleDownloadCSV = async () => {
		try {
			// Fetch all contacts for export
			const response = await fetch(
				`/api/contacts/v1/groups/${groupId}/contacts?limit=10000`,
			);
			const allData = (await response.json()) as GroupContactsResponse;

			if (!allData.group?.contacts || allData.group.contacts.length === 0) {
				toast.error("No contacts to export");
				return;
			}

			// Create CSV content
			const headers = ["Email", "Status", "Created At"];
			const csvRows = allData.group.contacts.map((contact) => [
				contact.email,
				contact.status,
				new Date(contact.createdAt).toISOString(),
			]);

			const csvContent = [
				headers.join(","),
				...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
			].join("\n");

			// Download file
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `group_contacts_${new Date().toISOString().split("T")[0]}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);

			toast.success("Contacts exported successfully");
		} catch (error) {
			console.error("Failed to download CSV:", error);
			toast.error("Failed to export contacts");
		}
	};

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
		<div>
			<div className="mb-4 flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" />
							<Input.Input
								placeholder="Search by email"
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<ContactFilterDropdown
					value={statusFilter}
					onChange={setStatusFilter}
				/>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={handleDownloadCSV}
					disabled={!data?.group?.contacts || data.group.contacts.length === 0}
					title="Export CSV"
				>
					<Icon name="file-download" className="h-4 w-4" />
				</Button.Root>
			</div>

			<ContactTable
				contacts={filteredContacts}
				total={data?.total || 0}
				isLoading={isLoading}
				loadingRows={5}
				onAddContact={() => setModal("add-contact-to-group")}
				emptyStateTitle="No contacts in this group"
				emptyStateDescription="This group doesn't have any contacts yet. Add contacts to start segmenting your audience."
				emptyStateButtonText="Add Contact to Group"
				emptyStateShortcut={
					<span className="inline-flex items-center gap-0.5">
						<KbdKeyOutline>a</KbdKeyOutline>
						<KbdKeyOutline>c</KbdKeyOutline>
					</span>
				}
				emptyStateDocsText="Learn about groups"
			/>
		</div>
	);
};
