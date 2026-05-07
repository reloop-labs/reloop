"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type StatusFilterOption = string;

interface StatusFilterDropdownProps {
	value: StatusFilterOption[];
	onChange: (value: StatusFilterOption[]) => void;
}

const statusOptions: {
	id: StatusFilterOption;
	label: string;
	colorClass?: string;
}[] = [
	{ id: "successes", label: "Successes", colorClass: "bg-success-base" },
	{ id: "errors", label: "Errors", colorClass: "bg-error-base" },
	{ id: "200", label: "200 - Ok", colorClass: "bg-success-base" },
	{ id: "201", label: "201 - Created", colorClass: "bg-success-base" },
	{ id: "400", label: "400 - Bad Request", colorClass: "bg-error-base" },
	{ id: "401", label: "401 - Unauthorized", colorClass: "bg-error-base" },
	{ id: "403", label: "403 - Forbidden", colorClass: "bg-error-base" },
	{ id: "404", label: "404 - Not Found", colorClass: "bg-error-base" },
	{
		id: "422",
		label: "422 - Unprocessable Content",
		colorClass: "bg-error-base",
	},
	{ id: "429", label: "429 - Too Many Requests", colorClass: "bg-error-base" },
	{
		id: "500",
		label: "500 - Internal Server Error",
		colorClass: "bg-error-base",
	},
];

export const StatusFilterDropdown = ({
	value,
	onChange,
}: StatusFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const hasActiveFilter = value.length > 0;

	const handleReset = () => {
		onChange([]);
		setIsOpen(false);
	};

	const handleToggle = (optionId: StatusFilterOption | null) => {
		if (optionId === null) {
			onChange([]);
			setIsOpen(false);
			return;
		}

		if (value.includes(optionId)) {
			onChange(value.filter((v) => v !== optionId));
		} else {
			onChange([...value, optionId]);
		}
	};

	const displayLabel =
		value.length === 0
			? "Status"
			: value.length === 1
				? statusOptions.find((o) => o.id === value[0])?.label || "Status"
				: `${value.length} Statuses`;

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
						<Icon name="check-circle" className="h-3.5 w-3.5" />
					</Button.Icon>
					{displayLabel}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-[280px] p-2">
				{/* Header */}
				<div className="flex items-center justify-between border-stroke-soft-200 border-b px-1 pb-2">
					<span className="font-medium text-text-sub-600 text-xs">
						Filter by status
					</span>
					{hasActiveFilter && (
						<button
							type="button"
							onClick={handleReset}
							className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50"
						>
							Reset filter
						</button>
					)}
				</div>

				<div className="relative mt-2">
					{/* All Statuses option */}
					<button
						ref={(el) => {
							if (el) buttonRefs.current[0] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(0)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => handleToggle(null)}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
							"text-text-strong-950",
							!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
						)}
					>
						<div className="flex items-center gap-3">
							<div className="flex h-3.5 w-3.5 items-center justify-center">
								<div className="h-2 w-2 rounded-full border-2 border-text-strong-950" />
							</div>
							<span className={cn(value.length === 0 && "font-medium")}>
								All Statuses
							</span>
						</div>
						{value.length === 0 && (
							<Icon name="check" className="h-4 w-4 text-text-strong-950" />
						)}
					</button>

					{/* Divider between All and Groups */}
					<div className="my-1 border-stroke-soft-200 border-t" />

					{statusOptions.slice(0, 2).map((option, idx) => {
						const isChecked = value.includes(option.id);
						const index = idx + 1; // offset by 1 because of "All Statuses"
						return (
							<button
								key={option.id}
								ref={(el) => {
									if (el) buttonRefs.current[index] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(index)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleToggle(option.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
									"text-text-strong-950",
									!currentRect && hoverIdx === index && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-3.5 w-3.5 items-center justify-center">
										<div
											className={cn("h-2 w-2 rounded-full", option.colorClass)}
										/>
									</div>
									<span
										className={cn(
											isChecked && "font-medium text-text-strong-950",
										)}
									>
										{option.label}
									</span>
								</div>
								{isChecked && (
									<Icon name="check" className="h-4 w-4 text-text-strong-950" />
								)}
							</button>
						);
					})}

					{/* Divider between Groups and Specific Statuses */}
					<div className="my-1 border-stroke-soft-200 border-t" />

					{/* Specific Statuses */}
					<div className="max-h-[240px] overflow-y-auto pr-1">
						{statusOptions.slice(2).map((option, idx) => {
							const isChecked = value.includes(option.id);
							const index = idx + 3; // offset by 3 ("All Statuses" + 2 groups)
							return (
								<button
									key={option.id}
									ref={(el) => {
										if (el) buttonRefs.current[index] = el;
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(index)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => handleToggle(option.id)}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
										"text-text-strong-950",
										!currentRect && hoverIdx === index && "bg-neutral-alpha-10",
									)}
								>
									<div className="flex items-center gap-3">
										<div className="flex h-3.5 w-3.5 items-center justify-center">
											<div
												className={cn(
													"h-2 w-2 rounded-full",
													option.colorClass,
												)}
											/>
										</div>
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
											className="h-4 w-4 text-text-strong-950"
										/>
									)}
								</button>
							);
						})}
					</div>

					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
