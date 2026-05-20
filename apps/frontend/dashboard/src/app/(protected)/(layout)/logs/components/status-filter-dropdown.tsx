"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type StatusFilterOption = string | null;

interface StatusFilterDropdownProps {
	value: StatusFilterOption;
	onChange: (value: StatusFilterOption) => void;
}

const statusFilterOptions: {
	id: StatusFilterOption;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{
		id: null,
		label: "All Statuses",
		icon: "activity",
		colorClass: "",
	},
	{
		id: "200",
		label: "200 - Ok",
		icon: "check-circle",
		colorClass: "text-green-500",
	},
	{
		id: "201",
		label: "201 - Created",
		icon: "check-circle",
		colorClass: "text-green-500",
	},
	{
		id: "400",
		label: "400 - Bad Request",
		icon: "cross-circle",
		colorClass: "text-red-500",
	},
	{
		id: "403",
		label: "403 - Forbidden",
		icon: "cross-circle",
		colorClass: "text-red-500",
	},
	{
		id: "404",
		label: "404 - Not Found",
		icon: "cross-circle",
		colorClass: "text-red-500",
	},
	{
		id: "422",
		label: "422 - Unprocessable Content",
		icon: "cross-circle",
		colorClass: "text-red-500",
	},
	{
		id: "429",
		label: "429 - Too Many Requests",
		icon: "cross-circle",
		colorClass: "text-red-500",
	},
	{
		id: "500",
		label: "500 - Internal Server Error",
		icon: "cross-circle",
		colorClass: "text-red-500",
	},
];

export const StatusFilterDropdown = ({
	value,
	onChange,
}: StatusFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIdx = hoverIdx;

	const currentTab =
		activeIdx !== undefined ? buttonRefs.current[activeIdx] : undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedOption =
		statusFilterOptions.find((o) => o.id === value) || statusFilterOptions[0];

	const displayLabel = selectedOption?.label || "All Statuses";
	const displayIcon = selectedOption?.icon || "activity";
	const displayIconColor = selectedOption?.colorClass || "";

	const handleToggle = (optionId: StatusFilterOption) => {
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
					className="w-44 justify-between gap-1.5 whitespace-nowrap rounded-[10px]"
				>
					<div className="flex items-center gap-1.5 overflow-hidden">
						<Icon
							name={displayIcon as any}
							className={cn("h-3.5 w-3.5 shrink-0", displayIconColor)}
						/>
						<span className="truncate">{displayLabel}</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="start"
				className="scrollbar-hide max-h-[320px] w-60 overflow-y-auto p-2"
			>
				<div className="relative">
					{statusFilterOptions.map((option, idx) => {
						const isChecked = value === option.id;
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
									"flex w-full cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
									"text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-2">
									<Icon
										name={option.icon as any}
										className={cn("h-3.5 w-3.5", option.colorClass)}
									/>
									<span
										className={cn(
											isChecked && "font-medium text-text-strong-950",
										)}
									>
										{option.label}
									</span>
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
