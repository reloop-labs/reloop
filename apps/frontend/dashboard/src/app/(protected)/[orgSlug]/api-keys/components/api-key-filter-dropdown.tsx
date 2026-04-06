"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
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

const statusFilterOptions: {
	id: ApiKeyStatusFilterOption;
	label: string;
	icon: string;
	colorClass: string;
}[] = [
	{
		id: "enabled",
		label: "Enabled",
		icon: "check-circle",
		colorClass: "text-green-500",
	},
	{
		id: "disabled",
		label: "Disabled",
		icon: "cross-circle",
		colorClass: "text-red-500",
	},
];

export const ApiKeyFilterDropdown = ({
	value,
	onChange,
	availableCreators,
}: ApiKeyFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const activeFilterCount = value.status.length + value.createdBy.length;
	const hasActiveFilter = activeFilterCount > 0;

	const displayLabel =
		activeFilterCount === 0
			? "Filter"
			: activeFilterCount === 1
				? value.status.length === 1
					? statusFilterOptions.find((o) => o.id === value.status[0])?.label || "1 Filter"
					: availableCreators.find((c) => c.id === value.createdBy[0])?.name || "1 Filter"
				: `${activeFilterCount} Filters`;

	const handleReset = () => {
		onChange({ status: [], createdBy: [] });
	};

	const handleStatusToggle = (optionId: ApiKeyStatusFilterOption) => {
		if (value.status.includes(optionId)) {
			onChange({
				...value,
				status: value.status.filter((v) => v !== optionId),
			});
		} else {
			onChange({ ...value, status: [...value.status, optionId] });
		}
	};

	const handleCreatorToggle = (userId: string) => {
		if (value.createdBy.includes(userId)) {
			onChange({
				...value,
				createdBy: value.createdBy.filter((v) => v !== userId),
			});
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
			<Dropdown.Content
				align="end"
				className="max-h-80 w-52 overflow-y-auto p-2"
			>
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

				{/* All Filter Options in a single relative container */}
				<div className="relative">
					{/* Status Section */}
					<div className="pt-2">
						<span className="px-1 font-medium text-[10px] text-text-soft-400 uppercase tracking-wide">
							Status
						</span>
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
											"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
											"text-text-strong-950",
											!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
										)}
									>
										<div className="flex items-center gap-2">
											<Icon
												name={option.icon as any}
												className={cn("h-3.5 w-3.5", option.colorClass)}
											/>
											<span className={cn(isChecked && "font-medium text-text-strong-950")}>
												{option.label}
											</span>
										</div>
										{isChecked && (
											<Icon name="check" className="h-3.5 w-3.5 text-text-strong-950" />
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Created By Section */}
					{availableCreators.length > 0 && (
						<div className="mt-2 border-stroke-soft-200 border-t pt-3">
							<span className="px-1 font-medium text-[10px] text-text-soft-400 uppercase tracking-wide">
								Created by
							</span>
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
												"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
												"text-text-strong-950",
												!currentRect &&
													hoverIdx === globalIdx &&
													"bg-neutral-alpha-10",
											)}
										>
											<div className="flex min-w-0 items-center gap-2">
												<Avatar.Root size="16">
													{creator.image ? (
														<Avatar.Image
															src={creator.image}
															alt={creator.name || "User"}
														/>
													) : null}
												</Avatar.Root>
												<span className={cn("truncate", isChecked && "font-medium text-text-strong-950")}>
													{creator.name || "Unknown"}
												</span>
											</div>
											{isChecked && (
												<Icon name="check" className="h-3.5 w-3.5 shrink-0 text-text-strong-950" />
											)}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* Single AnimatedHoverBackground for all options */}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
