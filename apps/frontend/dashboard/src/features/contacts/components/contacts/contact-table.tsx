import { cn } from "@reloop/ui/cn";
import {
	flexRender,
	getCoreRowModel,
	type RowSelectionState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { Contact } from "../../hooks/use-contacts-query";
import { type ContactTableMeta, contactColumns } from "./columns";
import { getContactTableGridStyle } from "./constants";
import { ContactDropdown, ContactRowContextMenu } from "./contact-dropdown";
import { ContactSelectionActionBar } from "./contact-selection-action-bar";
import { ContactsEmptyState } from "./contacts-empty-state";
import { DeleteContactConfirmModal } from "./delete-contact-confirm-modal";
import { EditContactRowPanel } from "./edit-contact-row-panel";
import { RemoveContactFromGroupModal } from "./remove-contact-from-group-modal";
import { ContactTableFooter } from "./table-footer";
import { ContactTableSkeleton } from "./table-skeleton";

interface ContactTableProps {
	contacts: Contact[];
	total: number;
	columnVisibility?: VisibilityState;
	isLoading?: boolean;
	loadingRows?: number;
	/** When set, row menus show "Remove from group" for this group. */
	groupId?: string;
	groupName?: string;
	onAddContact?: () => void;
	searchQuery?: string;
	onClearSearch?: () => void;
	emptyStateTitle?: string;
	emptyStateDescription?: string;
	emptyStateButtonText?: string;
	emptyStateShortcut?: React.ReactNode;
	emptyStateDocsText?: string;
	emptyStateDocsLink?: string;
}

export const ContactTable = ({
	contacts,
	total,
	columnVisibility = {},
	isLoading,
	loadingRows = 6,
	groupId,
	groupName,
	onAddContact,
	searchQuery,
	onClearSearch,
	emptyStateTitle,
	emptyStateDescription,
	emptyStateButtonText,
	emptyStateShortcut,
}: ContactTableProps) => {
	const [, setDeleteId] = useQueryState("delete");
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [editingContactId, setEditingContactId] = useState<string | null>(null);
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	const [modalId, setModalId] = useQueryState("id", { history: "replace" });
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));

	const handleEdit = useCallback((contact: Contact) => {
		setEditingContactId((prev) => (prev === contact.id ? null : contact.id));
	}, []);

	const handleDelete = useCallback(
		(contact: Contact) => {
			void setDeleteId(contact.id);
		},
		[setDeleteId],
	);

	// Resolved from the loaded rows by id; the last match is cached so the
	// modal stays open through its success state after the row is removed.
	const isRemoveModal = modal === "remove-from-group" && !!modalId;
	const lastContactToRemoveRef = useRef<Contact | null>(null);
	const currentContactToRemove = isRemoveModal
		? contacts.find((c) => c.id === modalId)
		: undefined;
	if (currentContactToRemove) {
		lastContactToRemoveRef.current = currentContactToRemove;
	}
	const contactToRemove =
		isRemoveModal && lastContactToRemoveRef.current?.id === modalId
			? lastContactToRemoveRef.current
			: null;

	const handleRemoveFromGroup = useCallback(
		(contact: Contact) => {
			void setModal("remove-from-group");
			void setModalId(contact.id);
		},
		[setModal, setModalId],
	);

	const handleOpenChange = useCallback((open: boolean, id: string) => {
		setActiveDropdownId(open ? id : null);
	}, []);

	const table = useReactTable({
		data: contacts,
		columns: contactColumns,
		state: { columnVisibility, rowSelection },
		onColumnVisibilityChange: () => {},
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: totalPages,
		meta: {
			editingContactId,
		} satisfies ContactTableMeta,
	});

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (contacts.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		const handler = () => {
			if (contacts.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		};
		window.addEventListener("contacts:select-all", handler);
		return () => window.removeEventListener("contacts:select-all", handler);
	}, [contacts.length, table]);

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getContactTableGridStyle(columnVisibility);
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const selectedContacts = selectedRows.map((row) => row.original);
	const handleClearSelection = useCallback(() => {
		table.resetRowSelection();
	}, [table]);

	return (
		<>
			{/* Phones and tablets: the card (border drawn here) holds a sideways
			    scroller for the columns, and the footer below it stays put */}
			<div className="w-full text-paragraph-sm max-md:overflow-hidden max-md:rounded-[14px] max-md:border max-md:border-stroke-soft-100 dark:max-md:border-stroke-soft-100/70">
				<div className="w-full overflow-x-auto">
					{/* 750px = the column minimums, so the ⋯ column never spills out */}
					<div className="min-w-[750px]">
						<div
							style={gridStyle}
							className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs max-md:rounded-none max-md:border-0 max-md:pb-2.5 dark:border-[#101010] dark:bg-bg-weak-50/40"
						>
							{headerGroup?.headers.map((header) => (
								<div key={header.id} className="flex items-center gap-1">
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</div>
							))}
							{/* spacer matches actions column */}
							<div />
						</div>

						<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 max-md:mt-0 max-md:rounded-none max-md:border-0 max-md:border-t dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40 [&>*:first-child]:rounded-t-[11px] max-md:[&>*:first-child]:rounded-none">
							{isLoading && contacts.length === 0 ? (
								<ContactTableSkeleton
									rows={loadingRows}
									columnVisibility={columnVisibility}
								/>
							) : rows.length === 0 ? (
								<ContactsEmptyState
									onAddContact={onAddContact}
									searchQuery={searchQuery}
									onClearSearch={onClearSearch}
									title={emptyStateTitle}
									description={emptyStateDescription}
									buttonText={emptyStateButtonText}
									shortcut={emptyStateShortcut}
								/>
							) : (
								rows.map((row) => {
									const contact = row.original;
									const isEditing = editingContactId === contact.id;
									const isRowActive =
										activeDropdownId === contact.id || isEditing;
									return (
										<div key={row.id}>
											<ContactRowContextMenu
												contact={contact}
												onEdit={handleEdit}
												onDelete={handleDelete}
												onRemoveFromGroup={
													groupId ? handleRemoveFromGroup : undefined
												}
												isDeleting={false}
												onOpenChange={(open) =>
													handleOpenChange(open, contact.id)
												}
											>
												<div
													style={gridStyle}
													data-state={
														row.getIsSelected() ? "selected" : undefined
													}
													className={cn(
														"group/row grid w-full items-center px-4 py-2 text-left",
														"hover:bg-bg-weak-50",
														(isRowActive || row.getIsSelected()) &&
															"bg-bg-weak-50/50",
														isEditing && "bg-bg-weak-50/70",
													)}
												>
													{row.getVisibleCells().map((cell) => (
														<div key={cell.id}>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext(),
															)}
														</div>
													))}
													<div
														onClick={(e) => e.stopPropagation()}
														onKeyDown={(e) => e.stopPropagation()}
													>
														<ContactDropdown
															contact={contact}
															onEdit={handleEdit}
															onDelete={handleDelete}
															onRemoveFromGroup={
																groupId ? handleRemoveFromGroup : undefined
															}
															isDeleting={false}
															onOpenChange={(open) =>
																handleOpenChange(open, contact.id)
															}
														/>
													</div>
												</div>
											</ContactRowContextMenu>

											<AnimatePresence initial={false}>
												{isEditing ? (
													<motion.div
														key={`edit-${contact.id}`}
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
														<EditContactRowPanel
															contactId={contact.id}
															onClose={() => setEditingContactId(null)}
														/>
													</motion.div>
												) : null}
											</AnimatePresence>
										</div>
									);
								})
							)}

							{/* Desktop: footer inside the rows card, as before */}
							<div className="max-md:hidden">
								<ContactTableFooter
									total={total}
									selectedCount={selectedCount}
									pageRowCount={rows.length}
									isLoading={isLoading}
								/>
							</div>
						</div>
					</div>
				</div>
				{/* Phones/tablets: outside the scroller, so it never scrolls sideways. No top
				    border: divide-y already draws one under the last row (the hidden desktop
				    footer above is still the last child). */}
				<div className="bg-bg-white-0 md:hidden dark:bg-black">
					<ContactTableFooter
						total={total}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
				</div>
			</div>
			<ContactSelectionActionBar table={table} />
			<DeleteContactConfirmModal
				contacts={contacts}
				selectedContacts={selectedContacts}
				onClearSelection={handleClearSelection}
			/>
			{groupId ? (
				<RemoveContactFromGroupModal
					open={!!contactToRemove}
					onOpenChange={(open) => {
						if (!open) {
							void setModal(null);
							void setModalId(null);
						}
					}}
					contact={contactToRemove}
					groupId={groupId}
					groupName={groupName}
				/>
			) : null}
		</>
	);
};
