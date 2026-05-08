"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type TeamFilterOption = "invited" | "suspended" | "active";
export type TeamFilterValue = TeamFilterOption | "all";

interface TeamFilterDropdownProps {
	value: TeamFilterValue;
	onChange: (value: TeamFilterValue) => void;
}

const filterOptions: { id: TeamFilterValue; label: string }[] = [
	{ id: "all", label: "All Statuses" },
	{ id: "active", label: "Active" },
	{ id: "suspended", label: "Suspended" },
	{ id: "invited", label: "Invited" },
];

export const TeamFilterDropdown = ({
	value,
	onChange,
}: TeamFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedOption = filterOptions.find((o) => o.id === value);
	const displayLabel =
		selectedOption?.id === "all" ? "Status" : selectedOption?.label || "Status";

	const handleSelect = (optionId: TeamFilterValue) => {
		onChange(optionId);
		setIsOpen(false);
	};

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild className="w-32">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className="flex justify-between rounded-[10px] transition-transform duration-100 ease-out active:scale-[0.98]"
				>
					{displayLabel}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-32 p-1">
				{/* Filter Options */}
				<div className="relative">
					{filterOptions.map((option, idx) => {
						return (
							<button
								key={option.id}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleSelect(option.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-[12px] px-2 py-1.5 font-medium text-[13px] transition-all duration-100 ease-out active:scale-[0.97]",
									"text-text-strong-950",
									!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
									option.id === value && "bg-neutral-alpha-10/50",
								)}
							>
								<span
									className={cn(
										option.id === value && "font-medium text-text-strong-950",
									)}
								>
									{option.label}
								</span>
								{option.id === value && (
									<Icon
										name="check"
										className="h-3.5 w-3.5 text-text-strong-950"
									/>
								)}
							</button>
						);
					})}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						className="rounded-[12px]"
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
