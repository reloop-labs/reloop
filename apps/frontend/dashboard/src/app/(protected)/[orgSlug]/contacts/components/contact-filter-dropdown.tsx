"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type ContactFilterOption = "subscribed" | "unsubscribed";
export type ContactFilters = ContactFilterOption[];

interface ContactFilterDropdownProps {
	value: ContactFilters;
	onChange: (value: ContactFilters) => void;
}

const filterOptions: { id: ContactFilterOption; label: string }[] = [
	{ id: "subscribed", label: "Subscribed" },
	{ id: "unsubscribed", label: "Unsubscribed" },
];

export const ContactFilterDropdown = ({
	value,
	onChange,
}: ContactFilterDropdownProps) => {
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

	const handleToggle = (optionId: ContactFilterOption) => {
		if (value.includes(optionId)) {
			onChange(value.filter((v) => v !== optionId));
		} else {
			onChange([...value, optionId]);
		}
	};

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root variant="neutral" mode="stroke" size="xsmall">
					<Icon name="filter" className="h-4 w-4" />
					<span>Filter</span>
					{hasActiveFilter && (
						<span className="-top-1.5 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
							{activeFilterCount}
						</span>
					)}
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-44 p-3">
				{/* Header */}
				<div className="flex items-center justify-between border-stroke-soft-200 border-b px-1 pb-2">
					<span className="font-medium text-text-sub-600 text-xs">
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
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 font-normal text-xs transition-colors",
									"text-text-strong-950",
									!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
								)}
							>
								{/* Checkbox */}
								<div
									className={cn(
										"flex h-3.5 w-3.5 items-center justify-center rounded border p-[1px] transition-colors",
										isChecked
											? "border-stroke-soft-900 bg-neutral-900"
											: "border-stroke-soft-200",
									)}
								>
									{isChecked && (
										<Icon name="check" className="h-3 w-3 text-white" />
									)}
								</div>
								<span>{option.label}</span>
							</button>
						);
					})}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
