"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type PropertyFilterOption = "string" | "number" | null;
export type PropertyFilters = PropertyFilterOption;

interface PropertyFilterDropdownProps {
	value: PropertyFilters;
	onChange: (value: PropertyFilters) => void;
}

const filterOptions: { id: PropertyFilterOption; label: string; icon: any }[] =
	[
		{ id: null, label: "All types", icon: "activity" },
		{ id: "string", label: "String", icon: "file-text" },
		{ id: "number", label: "Number", icon: "hash" },
	];

export const PropertyFilterDropdown = ({
	value,
	onChange,
}: PropertyFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const selectedIdx = filterOptions.findIndex((o) => o.id === value);
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;

	const currentTab = buttonRefs.current[activeIdx];
	const currentRect = currentTab?.getBoundingClientRect();

	const displayLabel =
		filterOptions.find((o) => o.id === value)?.label || "Type";

	const displayIcon = value
		? filterOptions.find((o) => o.id === value)?.icon || "activity"
		: "activity";

	const handleToggle = (optionId: PropertyFilterOption) => {
		onChange(optionId);
		setIsOpen(false);
	};

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"w-44 justify-between gap-1.5 whitespace-nowrap rounded-[10px]",
					)}
				>
					<div className="flex items-center gap-1.5 overflow-hidden">
						<Icon name={displayIcon} className="h-3.5 w-3.5 shrink-0" />
						<span className="truncate">{displayLabel}</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-44 p-1.5">
				{/* Filter Options */}
				<div className="relative">
					{filterOptions.map((option, idx) => {
						const isChecked =
							option.id === null ? value === null : value === option.id;
						return (
							<button
								key={option.id ?? "all"}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleToggle(option.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
									"text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-1.5 overflow-hidden">
									<Icon name={option.icon} className="h-3.5 w-3.5 shrink-0" />
									<span className="truncate">{option.label}</span>
								</div>
								{isChecked && (
									<Icon
										name="check"
										className="h-3.5 w-3.5 text-text-strong-950"
									/>
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
