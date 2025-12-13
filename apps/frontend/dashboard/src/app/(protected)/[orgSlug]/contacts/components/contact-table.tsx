"use client";
import { getAnimationProps } from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { ContactDropdown } from "./contact-dropdown";

interface Contact {
    id: string;
    email: string;
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
}

export const ContactTable = ({
    contacts,
    isLoading,
    loadingRows = 4,
}: ContactTableProps) => {
    const [, setDeleteId] = useQueryState("delete");
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    const handleDeleteContact = (contactId: string) => {
        setDeleteId(contactId);
    };

    const getDisplayName = (contact: Contact) => {
        if (contact.firstName || contact.lastName) {
            return `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
        }
        return "—";
    };

    return (
        <AnimatePresence mode="wait">
            <div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200/70 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
                <div className="grid grid-cols-[1fr_minmax(180px,auto)_minmax(120px,auto)_minmax(40px,auto)]">
                    {/* Headers */}
                    <div className="pl-5 text-text-sub-600">
                        <div className="flex items-center gap-2 py-3">
                            <Icon name="mail-single" className="h-4 w-4" />
                            <span className="text-[13px]">Email</span>
                        </div>
                    </div>
                    <div className="text-text-sub-600">
                        <div className="flex items-center gap-2 py-3">
                            <Icon name="user" className="h-4 w-4" />
                            <span className="text-[13px]">Name</span>
                        </div>
                    </div>
                    <div className="text-text-sub-600">
                        <div className="flex items-center gap-2 py-3">
                            <Icon name="clock" className="h-4 w-4" />
                            <span className="text-[13px]">Created At</span>
                        </div>
                    </div>
                    <div>
                        <div className="py-3" />
                    </div>

                    {/* Loading State */}
                    {isLoading
                        ? Array.from({ length: loadingRows }).map((_, index) => (
                            <div key={`skeleton-${index}`} className="group/row contents">
                                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                                    <div className="my-1 pl-5">
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                                    <Skeleton className="h-4 w-28" />
                                </div>
                                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="flex items-center border-stroke-soft-200/70 border-t py-2">
                                    <Skeleton className="h-4 w-4" />
                                </div>
                            </div>
                        ))
                        : contacts.map((contact, index) => {
                            const isRowActive = activeDropdownId === contact.id;
                            return (
                                <div key={contact.id} className="group/row contents">
                                    {/* Email Column */}
                                    <div className={cn(
                                        "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                                        isRowActive && "bg-bg-weak-50/50"
                                    )}>
                                        <motion.div
                                            {...getAnimationProps(index + 1, 0)}
                                            className="flex items-center gap-2 pl-5"
                                        >
                                            <Icon name="mail-single" className="h-4 w-4 text-text-sub-600" />
                                            <span className="font-medium text-label-sm text-text-strong-950">
                                                {contact.email}
                                            </span>
                                        </motion.div>
                                    </div>

                                    {/* Name Column */}
                                    <div className={cn(
                                        "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                                        isRowActive && "bg-bg-weak-50/50"
                                    )}>
                                        <motion.span
                                            {...getAnimationProps(index + 1, 1)}
                                            className="text-label-sm text-text-sub-600"
                                        >
                                            {getDisplayName(contact)}
                                        </motion.span>
                                    </div>

                                    {/* Created At Column */}
                                    <div className={cn(
                                        "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                                        isRowActive && "bg-bg-weak-50/50"
                                    )}>
                                        <motion.span
                                            {...getAnimationProps(index + 1, 2)}
                                            className="text-label-sm text-text-strong-950"
                                        >
                                            {formatRelativeTime(contact.createdAt)}
                                        </motion.span>
                                    </div>

                                    {/* Actions Column */}
                                    <div className={cn(
                                        "flex items-center border-stroke-soft-200/70 border-t py-2 group-hover/row:bg-bg-weak-50/50",
                                        isRowActive && "bg-bg-weak-50/50"
                                    )}>
                                        <motion.div
                                            {...getAnimationProps(index + 1, 3)}
                                            className="flex items-center justify-center"
                                        >
                                            <ContactDropdown
                                                contactId={contact.id}
                                                contactEmail={contact.email}
                                                onDelete={handleDeleteContact}
                                                onOpenChange={(open: boolean) => setActiveDropdownId(open ? contact.id : null)}
                                            />
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </AnimatePresence>
    );
};
