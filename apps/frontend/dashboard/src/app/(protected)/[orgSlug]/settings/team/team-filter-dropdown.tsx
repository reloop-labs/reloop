"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type TeamFilterType = "all" | "invited" | "suspended" | "active";

interface TeamFilterDropdownProps {
  value: TeamFilterType;
  onChange: (value: TeamFilterType) => void;
}

const filterOptions: { id: TeamFilterType; label: string }[] = [
  { id: "invited", label: "Invited" },
  { id: "suspended", label: "Suspended" },
  { id: "active", label: "Active" },
];

export const TeamFilterDropdown = ({ value, onChange }: TeamFilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const currentTab = buttonRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();

  const hasActiveFilter = value !== "all";

  const handleReset = () => {
    onChange("all");
  };

  return (
    <Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Trigger asChild>
        <Button.Root
          variant="neutral"
          mode="stroke"
          size="xsmall"
          className={cn(hasActiveFilter && "border-primary-base text-primary-base")}
        >
          <Icon name="filter" className="h-4 w-4" />
          <span>Filter</span>
          {hasActiveFilter && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-base text-[10px] text-white">
              1
            </span>
          )}
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="start" className="w-52 p-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-stroke-soft-200">
          <span className="text-xs text-text-sub-600 font-medium">Filter by</span>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-xs text-text-sub-600 transition-colors hover:bg-bg-weak-50"
          >
            Reset filters
          </button>
        </div>

        {/* Filter Options */}
        <div className="relative">
          {filterOptions.map((option, idx) => (
            <button
              key={option.id}
              ref={(el) => {
                if (el) buttonRefs.current[idx] = el;
              }}
              type="button"
              onPointerEnter={() => setHoverIdx(idx)}
              onPointerLeave={() => setHoverIdx(undefined)}
              onClick={() => {
                onChange(option.id === value ? "all" : option.id);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-normal transition-colors",
                "text-text-strong-950",
                !currentRect && hoverIdx === idx && "bg-neutral-alpha-10"
              )}
            >
              {/* Radio circle */}
              <div className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                value === option.id
                  ? "border-primary-base"
                  : "border-stroke-soft-200"
              )}>
                {value === option.id && (
                  <div className="h-2 w-2 rounded-full bg-primary-base" />
                )}
              </div>
              <span>{option.label}</span>
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
