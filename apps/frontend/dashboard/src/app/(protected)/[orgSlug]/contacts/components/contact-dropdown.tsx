"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Button from "@reloop/ui/button";
import { useRef, useState } from "react";

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

export interface ContactDropdownProps {
    contact: Contact;
    onEdit: (contact: Contact) => void;
    onDelete: (contact: Contact) => void;
    isDeleting: boolean;
}

const menuItems = [
    { id: "edit", label: "Edit contact", icon: "edit" as const, isDanger: false },
    { id: "delete", label: "Delete contact", icon: "trash" as const, isDanger: true },
];

export const ContactDropdown = ({
    contact,
    onEdit,
    onDelete,
    isDeleting,
}: ContactDropdownProps) => {
    const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const buttonRefs = useRef<HTMLButtonElement[]>([]);

    const currentTab = buttonRefs.current[hoverIdx ?? -1];
    const currentRect = currentTab?.getBoundingClientRect();
    const hoveredItem = menuItems[hoverIdx ?? -1];
    const isDanger = hoveredItem?.isDanger ?? false;

    const handleItemClick = (itemId: string) => {
        if (itemId === "edit") {
            setDropdownOpen(false);
            onEdit(contact);
        } else if (itemId === "delete") {
            setDropdownOpen(false);
            onDelete(contact);
        }
    };

    return (
        <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <Dropdown.Trigger asChild>
                <Button.Root variant="neutral" mode="ghost" size="xxsmall" disabled={isDeleting}>
                    <Icon name="more-vertical" className="w-3 h-3" />
                </Button.Root>
            </Dropdown.Trigger>
            <Dropdown.Content align="end" className="w-40 p-1.5">
                <div className="relative">
                    {menuItems.map((item, idx) => (
                        <button
                            key={item.id}
                            ref={(el) => {
                                if (el) buttonRefs.current[idx] = el;
                            }}
                            type="button"
                            onPointerEnter={() => setHoverIdx(idx)}
                            onPointerLeave={() => setHoverIdx(undefined)}
                            onClick={() => handleItemClick(item.id)}
                            disabled={item.id === "delete" && isDeleting}
                            className={cn(
                                "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal transition-colors",
                                item.isDanger ? "text-error-base" : "text-text-strong-950",
                                !currentRect && hoverIdx === idx && (item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
                                isDeleting && item.id === "delete" && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Icon
                                name={item.icon}
                                className={cn("h-3.5 w-3.5", item.isDanger ? "" : "text-text-sub-600")}
                            />
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <AnimatedHoverBackground
                        rect={currentRect}
                        tabElement={currentTab}
                        isDanger={isDanger}
                    />
                </div>
            </Dropdown.Content>
        </Dropdown.Root>
    );
};

