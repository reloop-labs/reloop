"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import {
  getStatusColorClass,
  getStatusIcon,
  getStatusLabel,
} from "@fe/dashboard/utils/domain";
import type { DomainStatus } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type DomainStatusFilterOption = DomainStatus;
export type DomainStatusFilters = DomainStatusFilterOption[];

interface DomainFilterDropdownProps {
  value: DomainStatusFilters;
  onChange: (value: DomainStatusFilters) => void;
}

const filterOptions: { id: DomainStatusFilterOption; label: string }[] = [
  { id: "start-verify", label: "Not Started" },
  { id: "verifying", label: "Verifying" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
  { id: "failed", label: "Failed" },
];

export const DomainFilterDropdown = ({ value, onChange }: DomainFilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const currentTab = buttonRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();

  const activeFilterCount = value.length;
  const hasActiveFilter = activeFilterCount > 0;

  const handleReset = () => {
    onChange([]);
  };

  const handleToggle = (optionId: DomainStatusFilterOption) => {
    if (value.includes(optionId)) {
      onChange(value.filter(v => v !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  return (
    <Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Trigger asChild>
        <Button.Root
          variant="neutral"
          mode="stroke"
          size="xsmall"

        >
          <Icon name="filter" className="h-4 w-4" />
          <span>Filter</span>
          {hasActiveFilter && (
            <span className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="start" className="w-48 p-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stroke-soft-200 px-1">
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
          {filterOptions.map((option, idx) => {
            const isChecked = value.includes(option.id);
            return (
              <button
                key={option.id}
                ref={(el) => {
                  if (el) buttonRefs.current[idx] = el;
                }}
                type="button"
                onPointerEnter={() => setHoverIdx(idx)}
                onPointerLeave={() => setHoverIdx(undefined)}
                onClick={() => handleToggle(option.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-xs font-normal transition-colors",
                  "text-text-strong-950",
                  !currentRect && hoverIdx === idx && "bg-neutral-alpha-10"
                )}
              >
                {/* Checkbox */}
                <div className={cn(
                  "flex h-3.5 w-3.5 p-[1px] items-center justify-center rounded border transition-colors",
                  isChecked
                    ? "border-stroke-soft-900 bg-neutral-900"
                    : "border-stroke-soft-200"
                )}>
                  {isChecked && (
                    <Icon name="check" className="h-3 w-3 text-white" />
                  )}
                </div>
                {/* Status Icon */}
                <Icon
                  name={getStatusIcon(option.id)}
                  className={cn(
                    "h-3.5 w-3.5",
                    getStatusColorClass(option.id)
                  )}
                />
                <span>{option.label}</span>
              </button>
            );
          })}
          <AnimatedHoverBackground
            rect={currentRect}
            tabElement={currentTab}
          />
        </div>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
