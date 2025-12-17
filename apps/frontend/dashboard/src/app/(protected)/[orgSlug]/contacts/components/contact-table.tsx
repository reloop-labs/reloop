"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { ContactDropdown } from "./contact-dropdown";
import { EditContactModal } from "./edit-contact-modal";

interface Contact {
    id: string;
    email: string;
    status: string;
    firstName?: string;
    lastName?: string;
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
            return "border border-neutral-base text-neutral-base bg-neutral-light/20";
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
    <div className="grid grid-cols-[1fr_180px_100px_80px] items-center py-2 px-4">
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
    const { mutate } = useSWRConfig();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (contact: Contact) => {
        setDeletingId(contact.id);
        try {
            const response = await fetch(`/api/contacts/v1/contacts/${contact.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete contact");
            }

            toast.success("Contact deleted");
            await mutate((key: string) => typeof key === "string" && key.includes("/api/contacts/v1/contacts/list"));
            onDelete?.(contact.id);
        } catch (error) {
            console.error("Failed to delete contact:", error);
            toast.error("Failed to delete contact");
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1fr_180px_100px_80px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
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
                <div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_180px_100px_80px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
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
                        {contacts.map((contact, index) => (
                            <div
                                key={contact.id}
                                className={cn(
                                    "group/row grid grid-cols-[1fr_180px_100px_80px] items-center py-2 px-4 transition-colors",
                                    "hover:bg-bg-weak-50/50"
                                )}
                            >
                                {/* Email Column */}
                                <motion.div
                                    {...getAnimationProps(index + 1, 0)}
                                    className="flex items-center gap-3"
                                >
                                    <Icon name="mail-single" className="h-4 w-4 text-text-sub-600 flex-shrink-0" />
                                    <span className="truncate font-medium text-label-sm text-text-strong-950">
                                        {contact.email}
                                    </span>
                                </motion.div>

                                {/* Status Column */}
                                <motion.div {...getAnimationProps(index + 1, 1)} className="flex items-center">
                                    <span className={cn(
                                        "inline-flex rounded-md px-[6px] py-0.5 text-[10px] font-medium border-[1px]",
                                        getStatusBadgeStyles(contact.status)
                                    )}>
                                        {formatStatusLabel(contact.status)}
                                    </span>
                                </motion.div>

                                {/* Created At Column */}
                                <motion.div {...getAnimationProps(index + 1, 2)} className="flex items-center">
                                    <span className="text-label-sm text-text-strong-950">
                                        {formatRelativeTime(contact.createdAt)}
                                    </span>
                                </motion.div>

                                {/* Actions Column */}
                                <motion.div
                                    {...getAnimationProps(index + 1, 3)}
                                    className="flex items-center justify-end"
                                >
                                    <ContactDropdown
                                        contact={contact}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isDeleting={deletingId === contact.id}
                                    />
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatePresence>

            {/* Edit Contact Modal */}
            <EditContactModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                contact={editingContact}
            />
        </>
    );
};

