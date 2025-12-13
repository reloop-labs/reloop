"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

interface ContactDropdownProps {
    contactId: string;
    contactEmail: string;
    onDelete: (id: string) => void;
    onOpenChange?: (open: boolean) => void;
}

export const ContactDropdown = ({
    contactId,
    contactEmail,
    onDelete,
    onOpenChange,
}: ContactDropdownProps) => {
    const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const buttonRefs = useRef<HTMLButtonElement[]>([]);

    const currentTab = buttonRefs.current[hoverIdx ?? -1];
    const currentRect = currentTab?.getBoundingClientRect();

    const handleOpenChange = (open: boolean) => {
        setDropdownOpen(open);
        onOpenChange?.(open);
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(contactEmail);
        setDropdownOpen(false);
    };

    const handleDelete = () => {
        onDelete(contactId);
        setDropdownOpen(false);
    };

    const menuItems = [
        {
            icon: "copy" as const,
            label: "Copy Email",
            onClick: handleCopyEmail,
        },
        {
            icon: "delete" as const,
            label: "Delete",
            onClick: handleDelete,
            className: "text-error-base",
        },
    ];

    return (
        <Dropdown.Root open={dropdownOpen} onOpenChange={handleOpenChange}>
            <Dropdown.Trigger asChild>
                <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-bg-weak-50"
                >
                    <Icon name="more-horizontal" className="h-4 w-4 text-text-sub-600" />
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="end" className="w-40 p-1.5 rounded-xl">
                <div className="relative">
                    {menuItems.map((item, idx) => (
                        <button
                            key={item.label}
                            ref={(el) => {
                                if (el) buttonRefs.current[idx] = el;
                            }}
                            type="button"
                            onPointerEnter={() => setHoverIdx(idx)}
                            onPointerLeave={() => setHoverIdx(undefined)}
                            onClick={item.onClick}
                            className={cn(
                                "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal text-text-strong-950 transition-colors",
                                !currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
                                item.className
                            )}
                        >
                            <Icon name={item.icon} className="h-3.5 w-3.5" />
                            {item.label}
                        </button>
                    ))}
                    <AnimatedHoverBackground
                        rect={currentRect}
                        tabElement={currentTab}
                    />
                </div>
            </Dropdown.Content>
        </Dropdown.Root>
    );
};
