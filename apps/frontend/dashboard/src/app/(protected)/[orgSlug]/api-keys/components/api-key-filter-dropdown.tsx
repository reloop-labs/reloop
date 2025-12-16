"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type ApiKeyStatusFilterOption = "enabled" | "disabled";
export type ApiKeyStatusFilters = ApiKeyStatusFilterOption[];

export interface CreatedByUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface ApiKeyFilters {
  status: ApiKeyStatusFilters;
  createdBy: string[]; // User IDs
}

interface ApiKeyFilterDropdownProps {
  value: ApiKeyFilters;
  onChange: (value: ApiKeyFilters) => void;
  availableCreators: CreatedByUser[];
}

const statusFilterOptions: { id: ApiKeyStatusFilterOption; label: string; icon: string; colorClass: string }[] = [
  { id: "enabled", label: "Enabled", icon: "check-circle", colorClass: "text-green-500" },
  { id: "disabled", label: "Disabled", icon: "cross-circle", colorClass: "text-red-500" },
];

export const ApiKeyFilterDropdown = ({ value, onChange, availableCreators }: ApiKeyFilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const currentTab = buttonRefs.current[hoverIdx ?? -1];
  const currentRect = currentTab?.getBoundingClientRect();

  const activeFilterCount = value.status.length + value.createdBy.length;
  const hasActiveFilter = activeFilterCount > 0;

  const handleReset = () => {
    onChange({ status: [], createdBy: [] });
  };

  const handleStatusToggle = (optionId: ApiKeyStatusFilterOption) => {
    if (value.status.includes(optionId)) {
      onChange({ ...value, status: value.status.filter(v => v !== optionId) });
    } else {
      onChange({ ...value, status: [...value.status, optionId] });
    }
  };

  const handleCreatorToggle = (userId: string) => {
    if (value.createdBy.includes(userId)) {
      onChange({ ...value, createdBy: value.createdBy.filter(v => v !== userId) });
    } else {
      onChange({ ...value, createdBy: [...value.createdBy, userId] });
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
      <Dropdown.Content align="end" className="w-52 p-2 max-h-80 overflow-y-auto">
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

        {/* All Filter Options in a single relative container */}
        <div className="relative">
          {/* Status Section */}
          <div className="pt-2">
            <span className="text-[10px] font-medium text-text-soft-400 uppercase tracking-wide px-1">Status</span>
            <div className="mt-1">
              {statusFilterOptions.map((option, idx) => {
                const isChecked = value.status.includes(option.id);
                return (
                  <button
                    key={option.id}
                    ref={(el) => {
                      if (el) buttonRefs.current[idx] = el;
                    }}
                    type="button"
                    onPointerEnter={() => setHoverIdx(idx)}
                    onPointerLeave={() => setHoverIdx(undefined)}
                    onClick={() => handleStatusToggle(option.id)}
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
                      name={option.icon as any}
                      className={cn(
                        "h-3.5 w-3.5",
                        option.colorClass
                      )}
                    />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Created By Section */}
          {availableCreators.length > 0 && (
            <div className="pt-3 mt-2 border-t border-stroke-soft-200">
              <span className="text-[10px] font-medium text-text-soft-400 uppercase tracking-wide px-1">Created by</span>
              <div className="mt-1">
                {availableCreators.map((creator, idx) => {
                  const globalIdx = statusFilterOptions.length + idx;
                  const isChecked = value.createdBy.includes(creator.id);
                  return (
                    <button
                      key={creator.id}
                      ref={(el) => {
                        if (el) buttonRefs.current[globalIdx] = el;
                      }}
                      type="button"
                      onPointerEnter={() => setHoverIdx(globalIdx)}
                      onPointerLeave={() => setHoverIdx(undefined)}
                      onClick={() => handleCreatorToggle(creator.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-xs font-normal transition-colors",
                        "text-text-strong-950",
                        !currentRect && hoverIdx === globalIdx && "bg-neutral-alpha-10"
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
                      {/* User Avatar */}
                      <Avatar.Root size="16">
                        {creator.image ? (
                          <Avatar.Image src={creator.image} alt={creator.name || "User"} />
                        ) : null}
                      </Avatar.Root>
                      <span className="truncate">{creator.name || "Unknown"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Single AnimatedHoverBackground for all options */}
          <AnimatedHoverBackground
            rect={currentRect}
            tabElement={currentTab}
          />
        </div>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
