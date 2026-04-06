"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export type StatusFilterOption = string;

interface StatusFilterDropdownProps {
	value: StatusFilterOption | null;
	onChange: (value: StatusFilterOption | null) => void;
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

	const hasActiveFilter = !!value;

	const handleReset = () => {
		onChange(null);
		setIsOpen(false);
	};

	const handleToggle = (optionId: StatusFilterOption | null) => {
		onChange(optionId);
		setIsOpen(false);
	};

	const displayLabel =
		value === null
			? "Status"
			: statusOptions.find((o) => o.id === value)?.label || "Status";

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
							"border-primary-base/30 bg-primary-alpha-10 text-primary-base",
					)}
				>
					{displayLabel}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-[280px] p-2">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-stroke-soft-200 px-1 pb-2">
					<span className="text-xs font-medium text-text-sub-600">
						Filter by status
					</span>
					{hasActiveFilter && (
						<button
							type="button"
							onClick={handleReset}
							className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-xs text-text-sub-600 transition-colors hover:bg-bg-weak-50"
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
							<span className={cn(!value && "font-medium")}>All Statuses</span>
						</div>
						{!value && (
							<Icon name="check" className="h-4 w-4 text-text-strong-950" />
						)}
					</button>

					{/* Divider between All and Groups */}
					<div className="my-1 border-t border-stroke-soft-200" />

					{statusOptions.slice(0, 2).map((option, idx) => {
						const isChecked = value === option.id;
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
										className={cn(isChecked && "font-medium text-primary-base")}
									>
										{option.label}
									</span>
								</div>
								{isChecked && (
									<Icon name="check" className="h-4 w-4 text-primary-base" />
								)}
							</button>
						);
					})}

					{/* Divider between Groups and Specific Statuses */}
					<div className="my-1 border-t border-stroke-soft-200" />

					{/* Specific Statuses */}
					<div className="max-h-[240px] overflow-y-auto pr-1">
						{statusOptions.slice(2).map((option, idx) => {
							const isChecked = value === option.id;
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
												isChecked && "font-medium text-primary-base",
											)}
										>
											{option.label}
										</span>
									</div>
									{isChecked && (
										<Icon name="check" className="h-4 w-4 text-primary-base" />
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
