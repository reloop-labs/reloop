"use client";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import * as Button from "@reloop/ui/button";

interface PageSizeDropdownProps {
    value: number;
    onValueChange: (value: number) => void;
    options?: number[];
}

const defaultOptions = [10, 20, 50, 100];

export const PageSizeDropdown = ({
    value,
    onValueChange,
    options = defaultOptions,
}: PageSizeDropdownProps) => {
    const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const buttonRefs = useRef<HTMLButtonElement[]>([]);

    // Use hoverIdx if hovering, otherwise use the selected item's index
    const selectedIdx = options.findIndex((size) => size === value);
    const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;

    const currentTab = buttonRefs.current[activeIdx];
    const currentRect = currentTab?.getBoundingClientRect();

    const handleItemClick = (size: number) => {
        onValueChange(size);
        setDropdownOpen(false);
    };

    return (
        <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <Dropdown.Trigger asChild>
                <Button.Root
                    variant="neutral"
                    mode="stroke"
                    type="button"
                    size="xxsmall"
                    className={cn(dropdownOpen && "bg-bg-weak-50 ring-transparent hover:border-transparent")}
                >
                    {value}
                    <Icon name="chevron-down" className="h-3 w-3 text-text-sub-600" />
                </Button.Root>
            </Dropdown.Trigger>
            <Dropdown.Content align="start" className="w-20 p-1.5 rounded-xl">
                <div className="relative">
                    {options.map((size, idx) => (
                        <button
                            key={size}
                            ref={(el) => {
                                if (el) buttonRefs.current[idx] = el;
                            }}
                            type="button"
                            onPointerEnter={() => setHoverIdx(idx)}
                            onPointerLeave={() => setHoverIdx(undefined)}
                            onClick={() => handleItemClick(size)}
                            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs font-normal text-text-strong-950 transition-colors"
                        >
                            {size}
                            {value === size && (
                                <Icon name="check-circle" className="h-3 w-3" />
                            )}
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
