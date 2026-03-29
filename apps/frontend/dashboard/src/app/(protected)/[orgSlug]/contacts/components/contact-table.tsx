"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { ContactDropdown } from "./contact-dropdown";
import { ContactsEmptyState } from "./contacts-empty-state";

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

interface ContactTableProps {
	contacts: Contact[];
	isLoading?: boolean;
	loadingRows?: number;
	onAddContact?: () => void;
	emptyStateTitle?: string;
	emptyStateDescription?: string;
	emptyStateButtonText?: string;
}

const getStatusBadgeStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "border border-success-base text-success-base bg-success-light/20";
		case "unsubscribed":
			return "border border-error-base text-error-base bg-error-light/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};

const formatStatusLabel = (status: string) => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "Subscribed";
		case "unsubscribed":
			return "Unsubscribed";
		default:
			return status;
	}
};

const ContactSkeleton = () => (
	<div className="grid grid-cols-[1fr_150px_100px_80px] items-center px-4 py-2">
		<div className="flex items-center gap-3">
			<Skeleton className="h-4 w-4" />
			<Skeleton className="h-4 w-40" />
		</div>
		<Skeleton className="h-5 w-20 rounded-md" />
		<Skeleton className="h-4 w-20" />
		<div className="flex items-center justify-end">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

export const ContactTable = ({
	contacts,
	isLoading,
	loadingRows = 6,
	onAddContact,
	emptyStateTitle,
	emptyStateDescription,
	emptyStateButtonText,
}: ContactTableProps) => {
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleRowClick = (contact: Contact) => {
		if (activeOrganization?.slug) {
			router.push(`/${activeOrganization.slug}/contacts/detail/${contact.id}`);
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

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				{/* Header */}
				<div className="grid grid-cols-[1fr_150px_100px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50">
					<div className="flex items-center gap-2">
						<Icon name="mail-single" className="h-4 w-4" />
						<span className="text-xs">Email</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="check-circle" className="h-4 w-4" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Created At</span>
					</div>
					<div />
				</div>
				{/* Skeleton rows */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<ContactSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm dark:border-stroke-soft-100/50">
				<div className="grid grid-cols-[1fr_150px_100px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600 dark:border-stroke-soft-100/50">
					<div className="flex items-center gap-2">
						<Icon name="mail-single" className="h-4 w-4" />
						<span className="text-xs">Email</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="check-circle" className="h-4 w-4" />
						<span className="text-xs">Status</span>
					</div>
					<div className="flex items-center gap-2">
						<Icon name="clock" className="h-4 w-4" />
						<span className="text-xs">Created At</span>
					</div>
					<div />
				</div>

				{/* Rows */}
				<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/50">
					{contacts.length === 0 && !isLoading ? (
						<ContactsEmptyState
							onAddContact={onAddContact}
							title={emptyStateTitle}
							description={emptyStateDescription}
							buttonText={emptyStateButtonText}
						/>
					) : (
						contacts.map((contact) => {
							const isRowActive = activeDropdownId === contact.id;
							return (
								<div
									key={contact.id}
									onClick={() => handleRowClick(contact)}
									className={cn(
										"group/row grid w-full cursor-pointer grid-cols-[1fr_150px_100px_80px] items-center px-4 py-2 text-left transition-colors",
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
										isRowActive && "bg-bg-weak-50/50",
									)}
								>
									{/* Email Column */}
									<div className="flex items-center gap-2">
										<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white text-xs uppercase tracking-wide shadow-sm">
											{contact.email.charAt(0).toUpperCase()}
										</div>
										<span className="truncate font-medium text-label-sm text-text-strong-950">
											{contact.email}
										</span>
									</div>

									{/* Status Column */}
									<div className="flex items-center">
										<span
											className={cn(
												"inline-flex rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
												getStatusBadgeStyles(contact.status),
											)}
										>
											{formatStatusLabel(contact.status)}
										</span>
									</div>

									{/* Created At Column */}
									<div className="flex items-center">
										<span className="whitespace-nowrap text-label-sm text-text-strong-950">
											{formatRelativeTime(contact.createdAt)}
										</span>
									</div>

									{/* Actions Column */}
									<div
										className="flex items-center justify-end"
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
				</div>
			</div>
		</>
	);
};
