import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { ContactExportModal } from "#/features/contacts/components/contacts/contact-export-modal";
import {
	ContactFilterDropdown,
	type ContactFilterOption,
} from "#/features/contacts/components/contacts/contact-filter-dropdown";
import { ContactTable } from "#/features/contacts/components/contacts/contact-table";
import { useGroupContactsQuery } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnSolidClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export const GroupContactList = ({ groupId }: { groupId: string }) => {
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [statusFilter, setStatusFilter] = useState<ContactFilterOption>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [exportOpen, setExportOpen] = useState(false);

	const {
		data,
		error,
		isPending: isLoading,
	} = useGroupContactsQuery({
		groupId,
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
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

	const hasContacts = !!data?.group?.contacts && data.group.contacts.length > 0;

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
		<div className="mt-4">
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
									void setCurrentPage(1);
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
					onClick={() => setExportOpen(true)}
					disabled={!hasContacts}
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
				groupId={groupId}
				groupName={data?.group?.name}
				onAddContact={() => void setModal("add-contact-to-group")}
				searchQuery={searchQuery}
				onClearSearch={() => setSearchQuery("")}
				emptyStateTitle="No contacts in this group"
				emptyStateDescription="This group doesn't have any contacts yet. Add contacts to start segmenting your audience."
				emptyStateButtonText="Add contact to group"
				emptyStateShortcut={
					<span className="inline-flex items-center gap-0.5">
						<ActionKbd className={actionKbdOnSolidClassName}>A</ActionKbd>
						<ActionKbd className={actionKbdOnSolidClassName}>C</ActionKbd>
					</span>
				}
			/>

			<ContactExportModal
				open={exportOpen}
				onOpenChange={setExportOpen}
				scope={{
					groupId,
					groupName: data?.group?.name,
					search: searchQuery || undefined,
				}}
				counts={{
					total: data?.total ?? 0,
					subscribed: data?.subscribedContacts ?? 0,
					unsubscribed: data?.unsubscribedContacts ?? 0,
				}}
				defaultStatus={statusFilter ?? "all"}
			/>
		</div>
	);
};
