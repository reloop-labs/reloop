"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import * as Popover from "@reloop/ui/popover";
import { Icon } from "@reloop/ui/icon";
import * as Button from "@reloop/ui/button";
import { useRef, useState } from "react";

export interface DomainDropdownProps {
  domainId: string;
  domainName: string;
  onViewDetails: (name: string) => void;
  onDelete: (id: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const domainMenuItems = [
  { id: "view", label: "View Details", icon: "eye-outline" as const, isDanger: false },
  { id: "delete", label: "Delete", icon: "trash" as const, isDanger: true },
];

export const DomainDropdown = ({
  domainId,
  domainName,
  onViewDetails,
  onDelete,
  onOpenChange,
}: DomainDropdownProps) => {
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const currentTab = buttonRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();
  const hoveredItem = domainMenuItems[hoverIdx ?? -1];
  const isDanger = hoveredItem?.isDanger ?? false;

  const handleOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    onOpenChange?.(open);
  };

  const handleItemClick = (itemId: string) => {
    if (itemId === "delete") {
      handleOpenChange(false);
      onDelete(domainId);
    } else if (itemId === "view") {
      handleOpenChange(false);
      onViewDetails(domainName);
    }
  };

  return (
    <Popover.Root open={popoverOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="xxsmall"
          className="rounded p-1"
        >
          <Icon
            name="more-vertical"
            className="h-3 w-3 text-text-sub-600 hover:text-text-strong-950"
          />
        </Button.Root>
      </Popover.Trigger>
      <Popover.Content align="end" sideOffset={-8} className="w-40 p-1.5 rounded-xl" showArrow>
        <div className="relative">
          {domainMenuItems.map((item, idx) => (
            <button
              key={item.id}
              ref={(el) => {
                if (el) buttonRefs.current[idx] = el;
              }}
              type="button"
              onPointerEnter={() => setHoverIdx(idx)}
              onPointerLeave={() => setHoverIdx(undefined)}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-normal transition-colors",
                item.isDanger ? "text-error-base" : "text-text-strong-950",
                !currentRect && hoverIdx === idx && (item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10")
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
      </Popover.Content>
    </Popover.Root>
  );
};
