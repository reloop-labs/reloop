"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
	ContactFilterDropdown,
	type ContactFilters,
} from "./contact-filter-dropdown";
import { ContactTable } from "./contact-table";
import { ContactsEmptyState } from "./contacts-empty-state";

interface Contact {
	id: string;
	email: string;
	status: string;
	firstName: string | null;
	lastName: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface ContactListResponse {
	contacts: Contact[];
	total: number;
	page: number;
	limit: number;
}

interface ContactListProps {
	onAddContact?: () => void;
}

export const ContactList = ({ onAddContact }: ContactListProps) => {
	const { activeOrganization } = useUserOrganization();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [filters, setFilters] = useState<ContactFilters>([]);
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	// Convert filters array to status filter string for API
	const statusFilter = useMemo(() => {
		if (filters.length === 0 || filters.length === 2) return "";
		if (filters.includes("subscribed")) return "subscribed";
		if (filters.includes("unsubscribed")) return "unsubscribed";
		return "";
	}, [filters]);

	const buildUrl = () => {
		if (!activeOrganization?.id) return null;
		let url = `/api/contacts/v1/contacts/list?limit=${pageSize}&page=${currentPage}`;
		if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
		if (statusFilter) url += `&status=${statusFilter}`;
		return url;
	};

	const { data, error, isLoading } = useSWR<ContactListResponse>(buildUrl(), {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	const handleDownloadCSV = async () => {
		try {
			// Fetch all contacts for export
			const response = await fetch(
				"/api/contacts/v1/contacts/list?limit=10000",
			);
			const allData = (await response.json()) as ContactListResponse;

			if (!allData.contacts || allData.contacts.length === 0) {
				toast.error("No contacts to export");
				return;
			}

			// Create CSV content
			const headers = ["Email", "Status", "Created At"];
			const csvRows = allData.contacts.map((contact) => [
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
			link.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
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
					Failed to load contacts
				</p>
			</div>
		);
	}

	if (
		!isLoading &&
		data?.contacts &&
		data.contacts.length === 0 &&
		!searchQuery &&
		filters.length === 0
	) {
		return <ContactsEmptyState onAddContact={onAddContact} />;
	}

	return (
		<div>
			<div className="flex items-center gap-3">
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

				<ContactFilterDropdown value={filters} onChange={setFilters} />

				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={handleDownloadCSV}
					disabled={!data?.contacts || data.contacts.length === 0}
					title="Export CSV"
				>
					<Icon name="file-download" className="h-4 w-4" />
				</Button.Root>
			</div>

			<div className="mt-4">
				<ContactTable
					contacts={data?.contacts || []}
					isLoading={isLoading}
					loadingRows={4}
				/>
			</div>

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
