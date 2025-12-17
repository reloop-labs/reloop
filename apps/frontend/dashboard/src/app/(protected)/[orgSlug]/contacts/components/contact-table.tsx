"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Dropdown from "@reloop/ui/dropdown";
import * as Button from "@reloop/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Contact {
    id: string;
    email: string;
    status: string;
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
            return "border border-feature-base text-feature-base bg-feature-light/20";
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
    <div className="grid grid-cols-[1fr_120px_140px_40px] items-center py-2 px-4">
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
                <div className="grid grid-cols-[1fr_120px_140px_40px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
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
        <AnimatePresence mode="wait">
            <div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_120px_140px_40px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
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
                                "group/row grid grid-cols-[1fr_120px_140px_40px] items-center py-2 px-4 transition-colors",
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
                                <Dropdown.Root>
                                    <Dropdown.Trigger asChild>
                                        <Button.Root variant="neutral" mode="ghost" size="xxsmall" disabled={deletingId === contact.id}>
                                            <Icon name="more-vertical" className="w-3 h-3" />
                                        </Button.Root>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="end" className="w-52 text-xs">
                                        <Dropdown.Item
                                            className="text-error-base"
                                            onClick={() => handleDelete(contact)}
                                        >
                                            <Icon name="trash" className="h-3 w-3" />
                                            Delete contact
                                        </Dropdown.Item>
                                    </Dropdown.Content>
                                </Dropdown.Root>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </AnimatePresence>
    );
};
