"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { AudienceStatus } from "@fe/dashboard/utils/audience";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/audience";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { ContactDropdown } from "./contact-dropdown";
import { ContactsEmptyState } from "./contacts-empty-state";

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
	emptyStateTitle,
	emptyStateDescription,
	emptyStateButtonText,
	emptyStateShortcut,
	emptyStateDocsText,
	emptyStateDocsLink,
}: ContactTableProps) => {
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const totalPages = Math.ceil(total / pageSize);
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, total);

	const handleRowClick = (contact: Contact) => {
		if (activeOrganization?.slug) {
			router.push(`/contacts/detail/${contact.id}`);
		}
	};

	const handleEdit = (contact: Contact) => {
		setModal("edit-contact");
		setId(contact.id);
	};

	const handleDelete = (contact: Contact) => {
		setModal("delete-contact");
		setId(contact.id);
	};

	return (
		<div className="w-full text-paragraph-sm">
			{/* Table Header */}
			<div className="grid grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40">
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

			{/* Table Body */}
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{isLoading ? (
					Array.from({ length: loadingRows }).map((_, i) => (
						<ContactSkeleton key={`skeleton-${i}`} />
					))
				) : contacts.length === 0 ? (
					<ContactsEmptyState
						onAddContact={onAddContact}
						title={emptyStateTitle}
						description={emptyStateDescription}
						buttonText={emptyStateButtonText}
						shortcut={emptyStateShortcut}
						docsText={emptyStateDocsText}
						docsLink={emptyStateDocsLink}
					/>
				) : (
					contacts.map((contact) => {
						const isRowActive = activeDropdownId === contact.id;

						return (
							<div
								key={contact.id}
								onClick={() => handleRowClick(contact)}
								className={cn(
									"group/row grid cursor-pointer grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center px-4 py-2 text-left transition-colors",
									"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
									isRowActive && "bg-bg-weak-50/50",
								)}
							>
								{/* Email Column */}
								<div className="flex items-center gap-2">
									<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-[10px] text-white uppercase tracking-wide shadow-sm">
										{contact.email.charAt(0).toUpperCase()}
									</div>
									<span className="font-medium text-label-sm text-text-strong-950">
										{contact.email}
									</span>
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
						);
					})
				)}

				{/* Pagination */}
				{total > 0 && (
					<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
						<div className="flex items-center">
							<span>
								Showing {startIndex}–{endIndex} of {total} contact
								{total !== 1 ? "s" : ""}
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
		</div>
	);
};
