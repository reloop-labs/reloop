"use client";

/**
 * Adapted from Dice UI / tablecn DataTableFacetedFilter:
 * https://diceui.com/docs/components/radix/data-table
 * https://github.com/sadmann7/tablecn
 */

import { cn } from "@reloop/ui/cn";
import * as Popover from "@reloop/ui/popover";
import { Check, PlusCircle, XCircle } from "lucide-react";
import * as React from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "./data-table-command";
import { dataTableToolbarControlClassName } from "./toolbar-control";

export type DataTableFacetedFilterOption = {
	label: string;
	value: string;
	icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
	count?: number;
};

type DataTableFacetedFilterProps = {
	title?: string;
	options: DataTableFacetedFilterOption[];
	selectedValues: string[];
	onSelectedValuesChange: (values: string[]) => void;
	multiple?: boolean;
	showSearch?: boolean;
};

export function DataTableFacetedFilter({
	title,
	options,
	selectedValues: selectedValuesProp,
	onSelectedValuesChange,
	multiple = true,
	showSearch = false,
}: DataTableFacetedFilterProps) {
	const [open, setOpen] = React.useState(false);
	const [hoverIdx, setHoverIdx] = React.useState<number | undefined>(undefined);
	const itemRefs = React.useRef<HTMLElement[]>([]);

	const currentTab = itemRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) {
			setHoverIdx(undefined);
		}
	};

	const selectedValues = new Set(selectedValuesProp);

	const onItemSelect = React.useCallback(
		(option: DataTableFacetedFilterOption, isSelected: boolean) => {
			if (multiple) {
				const next = new Set(selectedValues);
				if (isSelected) next.delete(option.value);
				else next.add(option.value);
				onSelectedValuesChange(Array.from(next));
				return;
			}

			onSelectedValuesChange(isSelected ? [] : [option.value]);
			setOpen(false);
		},
		[multiple, onSelectedValuesChange, selectedValues],
	);

	const onReset = React.useCallback(
		(event?: React.MouseEvent) => {
			event?.stopPropagation();
			onSelectedValuesChange([]);
		},
		[onSelectedValuesChange],
	);

	return (
		<Popover.Root open={open} onOpenChange={handleOpenChange}>
			<Popover.Trigger asChild>
				<button type="button" className={dataTableToolbarControlClassName}>
					{selectedValues.size > 0 ? (
						<span
							aria-hidden
							className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
							onPointerDown={(event) => {
								event.preventDefault();
								event.stopPropagation();
								onReset();
							}}
						>
							<XCircle className="size-4" />
						</span>
					) : (
						<PlusCircle className="size-4" />
					)}
					{title}
					{selectedValues.size > 0 ? (
						<>
							<span
								aria-hidden
								className="mx-0.5 h-4 w-px shrink-0 bg-stroke-soft-200 dark:bg-stroke-soft-100/50"
							/>
							<span className="rounded-sm bg-bg-weak-50 px-1 font-normal text-[10px] text-text-strong-950 lg:hidden dark:bg-bg-weak-50/40">
								{selectedValues.size}
							</span>
							<span className="hidden items-center gap-1 lg:flex">
								{selectedValues.size > 2 ? (
									<span className="rounded-sm bg-bg-weak-50 px-1 font-normal text-[10px] text-text-strong-950 dark:bg-bg-weak-50/40">
										{selectedValues.size} selected
									</span>
								) : (
									options
										.filter((option) => selectedValues.has(option.value))
										.map((option) => (
											<span
												key={option.value}
												className="rounded-sm bg-bg-weak-50 px-1 font-normal text-[10px] text-text-strong-950 dark:bg-bg-weak-50/40"
											>
												{option.label}
											</span>
										))
								)}
							</span>
						</>
					) : null}
				</button>
			</Popover.Trigger>
			<Popover.Content
				align="start"
				sideOffset={8}
				showArrow={false}
				className="w-50 overflow-hidden p-1.5"
			>
				<Command className="overflow-visible bg-transparent">
					{showSearch ? <CommandInput placeholder={title} /> : null}
					<CommandList className="max-h-full overflow-visible">
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup className="max-h-75 scroll-py-1 overflow-y-auto overflow-x-hidden p-0">
							<div className="relative">
								{options.map((option, idx) => {
									const isSelected = selectedValues.has(option.value);

									return (
										<CommandItem
											key={option.value}
											ref={(el) => {
												if (el) itemRefs.current[idx] = el;
											}}
											onPointerEnter={() => setHoverIdx(idx)}
											onPointerLeave={() => setHoverIdx(undefined)}
											onSelect={() => onItemSelect(option, isSelected)}
											className={cn(
												"relative z-10 data-[selected=true]:bg-transparent",
												!currentRect &&
													hoverIdx === idx &&
													"bg-neutral-alpha-10",
											)}
										>
											<div
												className={cn(
													"flex size-4 items-center justify-center rounded-sm border border-text-strong-950",
													isSelected
														? "bg-text-strong-950 text-bg-white-0"
														: "opacity-50 [&_svg]:invisible",
												)}
											>
												<Check className="size-3" />
											</div>
											{option.icon
												? React.isValidElement(option.icon)
													? option.icon
													: (() => {
															const OptionIcon =
																option.icon as React.ComponentType<{
																	className?: string;
																}>;
															return (
																<OptionIcon className="size-4 shrink-0 text-text-sub-600" />
															);
														})()
												: null}
											<span className="truncate">{option.label}</span>
											{option.count != null ? (
												<span className="ml-auto font-mono text-text-sub-600 text-xs">
													{option.count}
												</span>
											) : null}
										</CommandItem>
									);
								})}
								{selectedValues.size > 0 ? (
									<>
										<CommandSeparator />
										<CommandItem
											ref={(el) => {
												if (el) itemRefs.current[options.length] = el;
											}}
											onPointerEnter={() => setHoverIdx(options.length)}
											onPointerLeave={() => setHoverIdx(undefined)}
											onSelect={() => onSelectedValuesChange([])}
											className={cn(
												"relative z-10 justify-center text-center data-[selected=true]:bg-transparent",
												!currentRect &&
													hoverIdx === options.length &&
													"bg-neutral-alpha-10",
											)}
										>
											Clear filters
										</CommandItem>
									</>
								) : null}
								<AnimatedHoverBackground
									rect={currentRect}
									tabElement={currentTab}
								/>
							</div>
						</CommandGroup>
					</CommandList>
				</Command>
			</Popover.Content>
		</Popover.Root>
	);
}
