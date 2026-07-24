import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import type { AudienceStatus } from "#/features/contacts/audience";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "#/features/contacts/audience";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { ContactDropdown } from "./contact-dropdown";
import { ContactsEmptyState } from "./contacts-empty-state";
import { EditContactRowPanel } from "./edit-contact-row-panel";

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

interface ContactTableProps {
	contacts: Contact[];
	total: number;
	isLoading?: boolean;
	loadingRows?: number;
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

const ContactSkeleton = () => (
	<div className="grid grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center px-4 py-2">
		<div className="flex items-center gap-3">
			<Skeleton className="h-4 w-4 rounded-full" />
			<Skeleton className="h-4 w-40" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-2 w-2 rounded-full" />
			<Skeleton className="h-4 w-16" />
		</div>
		<div className="flex items-center">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center justify-center">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

export const ContactTable = ({
	contacts,
	total,
	isLoading,
	loadingRows = 6,
	onAddContact,
	searchQuery,
	onClearSearch,
	emptyStateTitle,
	emptyStateDescription,
	emptyStateButtonText,
	emptyStateShortcut: _emptyStateShortcut,
	emptyStateDocsText: _emptyStateDocsText,
	emptyStateDocsLink: _emptyStateDocsLink,
}: ContactTableProps) => {
	const navigate = useNavigate();
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [editingContactId, setEditingContactId] = useState<string | null>(null);

	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));
	const startIndex =
		total === 0 ? 0 : ((currentPage ?? 1) - 1) * (pageSize ?? 10) + 1;
	const endIndex = Math.min((currentPage ?? 1) * (pageSize ?? 10), total);

	const handleRowClick = (contact: Contact) => {
		if (editingContactId === contact.id) return;
		void navigate({
			to: "/contacts/detail/$contactId",
			params: { contactId: contact.id },
		});
	};

	const handleEdit = (contact: Contact) => {
		setEditingContactId((prev) => (prev === contact.id ? null : contact.id));
	};

	const handleDelete = (contact: Contact) => {
		void setModal("delete-contact");
		void setId(contact.id);
	};

	return (
		<div className="w-full text-paragraph-sm">
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center px-4 pt-3 pb-2.5 font-medium text-text-sub-600 dark:text-text-sub-600">
					<div className="flex items-center gap-1">
						<Icon name="mail-single" className="h-3 w-3" />
						<span className="text-xs">Email</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="activity" className="h-3 w-3" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="clock" className="h-3 w-3" />
						<span className="text-xs">Created At</span>
					</div>
					<div />
				</div>

				{/* Rows Inner White Card */}
				<div className="m-0.5 divide-y divide-stroke-soft-100 overflow-visible rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40 dark:bg-bg-white-0">
					{isLoading ? (
						Array.from({ length: loadingRows }).map((_, i) => (
							<ContactSkeleton key={`skeleton-${i}`} />
						))
					) : contacts.length === 0 ? (
						<ContactsEmptyState
							onAddContact={onAddContact}
							searchQuery={searchQuery}
							onClearSearch={onClearSearch}
							title={emptyStateTitle}
							description={emptyStateDescription}
							buttonText={emptyStateButtonText}
						/>
					) : (
						contacts.map((contact) => {
							const isRowActive =
								activeDropdownId === contact.id ||
								editingContactId === contact.id;
							const isEditing = editingContactId === contact.id;

							return (
								<div key={contact.id}>
									<div
										onClick={() => handleRowClick(contact)}
										className={cn(
											"group/row grid cursor-pointer grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center px-4 py-2 text-left transition-colors",
											"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
											isRowActive && "bg-bg-weak-50/50",
											isEditing && "bg-bg-weak-50/70",
										)}
									>
										{/* Email Column */}
										<div className="flex items-center gap-2">
											<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-[10px] text-white uppercase tracking-wide shadow-sm">
												{contact.email.charAt(0).toUpperCase()}
											</div>
											<span className="truncate font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors group-hover/row:text-[#1868DF] dark:group-hover/row:text-blue-400">
												{contact.email}
											</span>
											{isEditing && (
												<span className="rounded-md bg-bg-white-0 px-1.5 py-0.5 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100">
													Editing
												</span>
											)}
										</div>

										{/* Status Column */}
										<div className="flex items-center">
											<div
												className={cn(
													"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
													getStatusColorClass(contact.status),
												)}
											>
												<Icon
													name={getStatusIcon(contact.status)}
													className="h-3.5 w-3.5"
												/>
												{getStatusLabel(contact.status)}
											</div>
										</div>

										{/* Created Column */}
										<div>
											<span className="whitespace-nowrap font-medium text-[13px]">
												{formatRelativeTime(contact.createdAt)}
											</span>
										</div>

										{/* Actions Column */}
										<div
											className="flex items-center justify-center text-text-soft-400"
											onClick={(e) => e.stopPropagation()}
										>
											<ContactDropdown
												contact={contact}
												onEdit={handleEdit}
												onDelete={handleDelete}
												isDeleting={false}
												onOpenChange={(open) =>
													setActiveDropdownId(open ? contact.id : null)
												}
											/>
										</div>
									</div>

									<AnimatePresence initial={false}>
										{isEditing ? (
											<motion.div
												key={`edit-${contact.id}`}
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{
													height: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
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
				</div>

				{/* Pagination Footer */}
				{total > 0 && (
					<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
						<div className="flex items-center">
							<span>
								Showing {startIndex}–{endIndex} of {total} contact
								{total !== 1 ? "s" : ""}
							</span>
							<PageSizeDropdown
								value={pageSize ?? 10}
								onValueChange={(value) => {
									void setPageSize(value);
									void setCurrentPage(1);
								}}
							/>
						</div>
						<PaginationControls
							currentPage={currentPage ?? 1}
							totalPages={totalPages}
							onPageChange={(p) => void setCurrentPage(p)}
							isLoading={isLoading}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
