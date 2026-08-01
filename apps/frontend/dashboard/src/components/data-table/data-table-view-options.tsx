"use client";

/**
 * Adapted from Dice UI / tablecn DataTableViewOptions:
 * https://diceui.com/docs/components/radix/data-table
 * https://github.com/sadmann7/tablecn
 */

import { cn } from "@reloop/ui/cn";
import * as Popover from "@reloop/ui/popover";
import { Check, Settings2 } from "lucide-react";
import * as React from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "./data-table-command";
import { dataTableToolbarControlClassName } from "./toolbar-control";

export type DataTableViewColumn = {
	id: string;
	label: string;
	/** When true, column cannot be hidden. */
	locked?: boolean;
	icon?: React.ReactNode;
};

type DataTableViewOptionsProps = {
	columns: DataTableViewColumn[];
	visibility: Record<string, boolean | undefined>;
	onVisibilityChange: (id: string, visible: boolean) => void;
	disabled?: boolean;
	align?: "start" | "center" | "end";
	className?: string;
};

export function DataTableViewOptions({
	columns,
	visibility,
	onVisibilityChange,
	disabled,
	align = "end",
	className,
}: DataTableViewOptionsProps) {
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

	return (
		<Popover.Root open={open} onOpenChange={handleOpenChange}>
			<Popover.Trigger asChild>
				<button
					type="button"
					aria-label="Toggle columns"
					aria-expanded={open}
					aria-haspopup="listbox"
					role="combobox"
					disabled={disabled}
					className={cn(
						dataTableToolbarControlClassName,
						"disabled:pointer-events-none disabled:opacity-50",
					)}
				>
					<Settings2 className="size-4 text-text-soft-400" />
					View
				</button>
			</Popover.Trigger>
			<Popover.Content
				align={align}
				sideOffset={8}
				showArrow={false}
				className={cn("w-48 overflow-hidden rounded-xl p-1.5", className)}
			>
				<Command className="overflow-visible bg-transparent">
					<CommandList className="overflow-visible">
						<CommandGroup className="p-0">
							<div className="relative">
								{columns.map((column, idx) => {
									const isVisible = visibility[column.id] !== false;
									return (
										<CommandItem
											key={column.id}
											ref={(el) => {
												if (el) itemRefs.current[idx] = el;
											}}
											disabled={column.locked}
											data-checked={isVisible}
											onPointerEnter={() => setHoverIdx(idx)}
											onPointerLeave={() => setHoverIdx(undefined)}
											onSelect={() => {
												if (column.locked) return;
												onVisibilityChange(column.id, !isVisible);
											}}
											className={cn(
												"relative z-10 justify-between data-[selected=true]:bg-transparent",
												!currentRect &&
													hoverIdx === idx &&
													"bg-neutral-alpha-10",
											)}
										>
											<div className="flex min-w-0 items-center gap-2">
												{column.icon && (
													<span className="shrink-0 text-text-sub-600 [&_svg]:size-3.5">
														{column.icon}
													</span>
												)}
												<span className="truncate font-normal text-text-strong-950 text-xs">
													{column.label}
												</span>
											</div>
											<Check
												className={cn(
													"ml-auto size-3.5 shrink-0 text-text-strong-950 transition-opacity",
													isVisible ? "opacity-100" : "opacity-0",
												)}
											/>
										</CommandItem>
									);
								})}
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
