"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContactDropdown } from "./contact-dropdown";
import { DeleteContactModal } from "./delete-contact-modal";
import { EditContactModal } from "./edit-contact-modal";

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

interface ContactTableProps {
	contacts: Contact[];
	isLoading?: boolean;
	loadingRows?: number;
	onDelete?: (contactId: string) => void;
}

const getAnimationProps = (row: number, column: number) => {
	return {
		initial: { opacity: 0, y: "-100%" },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: "100%" },
		transition: {
			duration: 0.5,
			delay: row * 0.07 + column * 0.1,
			ease: [0.65, 0, 0.35, 1] as const,
		},
	};
};

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
	<div className="grid grid-cols-[1fr_180px_100px_80px] items-center px-4 py-2">
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
	loadingRows = 4,
	onDelete,
}: ContactTableProps) => {
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();
	const [editingContact, setEditingContact] = useState<Contact | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleRowClick = (contact: Contact) => {
		if (activeOrganization?.slug) {
			router.push(`/${activeOrganization.slug}/contacts/detail/${contact.id}`);
		}
	};

	const handleEdit = (contact: Contact) => {
		setEditingContact(contact);
		setIsEditModalOpen(true);
	};

	const handleDelete = (contact: Contact) => {
		setDeletingContact(contact);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteSuccess = () => {
		if (deletingContact) {
			onDelete?.(deletingContact.id);
		}
		setDeletingContact(null);
	};

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm">
				{/* Header */}
				<div className="grid grid-cols-[1fr_180px_100px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
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
				<div className="divide-y divide-stroke-soft-100">
					{Array.from({ length: loadingRows }).map((_, index) => (
						<ContactSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	return (
		<>
			<AnimatePresence mode="wait">
				<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-100 text-paragraph-sm">
					{/* Table Header */}
					<div className="grid grid-cols-[1fr_180px_100px_80px] items-center border-stroke-soft-100 border-b px-4 py-3.5 text-text-sub-600">
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
					<div className="divide-y divide-stroke-soft-100">
						{contacts.map((contact, index) => {
							const isRowActive = activeDropdownId === contact.id;
							return (
								<div
									key={contact.id}
									onClick={() => handleRowClick(contact)}
									className={cn(
										"group/row grid w-full cursor-pointer grid-cols-[1fr_180px_100px_80px] items-center px-4 py-2 text-left transition-colors",
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-1",
										isRowActive && "bg-bg-weak-50/50",
									)}
								>
									{/* Email Column */}
									<motion.div
										{...getAnimationProps(index + 1, 0)}
										className="flex items-center gap-2"
									>
										<div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white text-xs uppercase tracking-wide shadow-sm">
											{contact.email.charAt(0).toUpperCase()}
										</div>
										<span className="truncate font-medium text-label-sm text-text-strong-950">
											{contact.email}
										</span>
									</motion.div>

									{/* Status Column */}
									<motion.div
										{...getAnimationProps(index + 1, 1)}
										className="flex items-center"
									>
										<span
											className={cn(
												"inline-flex rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
												getStatusBadgeStyles(contact.status),
											)}
										>
											{formatStatusLabel(contact.status)}
										</span>
									</motion.div>

									{/* Created At Column */}
									<motion.div
										{...getAnimationProps(index + 1, 2)}
										className="flex items-center"
									>
										<span className="whitespace-nowrap text-label-sm text-text-strong-950">
											{formatRelativeTime(contact.createdAt)}
										</span>
									</motion.div>

									{/* Actions Column */}
									<motion.div
										{...getAnimationProps(index + 1, 3)}
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
									</motion.div>
								</div>
							);
						})}
					</div>
				</div>
			</AnimatePresence>

			{/* Edit Contact Modal */}
			<EditContactModal
				open={isEditModalOpen}
				onOpenChange={setIsEditModalOpen}
				contact={editingContact}
			/>

			{/* Delete Contact Modal */}
			<DeleteContactModal
				contact={deletingContact}
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
				onDeleteSuccess={handleDeleteSuccess}
			/>
		</>
	);
};
