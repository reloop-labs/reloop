"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type PropertyFilterOption = "string" | "number";
export type PropertyFilters = PropertyFilterOption[];

interface PropertyFilterDropdownProps {
	value: PropertyFilters;
	onChange: (value: PropertyFilters) => void;
}

const filterOptions: { id: PropertyFilterOption; label: string }[] = [
	{ id: "string", label: "String" },
	{ id: "number", label: "Number" },
];

export const PropertyFilterDropdown = ({
	value,
	onChange,
}: PropertyFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const activeFilterCount = value.length;
	const hasActiveFilter = activeFilterCount > 0;

	const displayLabel =
		activeFilterCount === 0
			? "Type"
			: activeFilterCount === 1
				? filterOptions.find((o) => o.id === value[0])?.label || "Type"
				: `${activeFilterCount} Types`;

	const handleReset = () => {
		onChange([]);
	};

	const handleToggle = (optionId: PropertyFilterOption) => {
		if (value.includes(optionId)) {
			onChange(value.filter((v) => v !== optionId));
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
					className={cn(
						"gap-1.5 whitespace-nowrap",
						hasActiveFilter &&
							"border-stroke-soft-900 bg-neutral-alpha-10 text-text-strong-950",
					)}
				>
					<Button.Icon>
						<Icon name="filter" className="h-3.5 w-3.5" />
					</Button.Icon>
					{displayLabel}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-44 p-3">
				{/* Header */}
				<div className="flex items-center justify-between border-stroke-soft-200 border-b px-1 pb-2">
					<span className="whitespace-nowrap font-medium text-text-sub-600 text-xs">
						Filter by
					</span>
					<button
						type="button"
						onClick={handleReset}
						className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50"
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
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
									"text-text-strong-950",
									!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
								)}
							>
								<span className={cn(isChecked && "font-medium text-text-strong-950")}>
									{option.label}
								</span>
								{isChecked && (
									<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
								)}
							</button>
						);
					})}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
