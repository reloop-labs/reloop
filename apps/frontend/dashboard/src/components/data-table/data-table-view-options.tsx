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

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
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
				className={cn("w-44 overflow-hidden p-1.5", className)}
			>
				<Command>
					<CommandList>
						<CommandGroup>
							{columns.map((column) => {
								const isVisible = visibility[column.id] !== false;
								return (
									<CommandItem
										key={column.id}
										disabled={column.locked}
										data-checked={isVisible}
										onSelect={() => {
											if (column.locked) return;
											onVisibilityChange(column.id, !isVisible);
										}}
										className="justify-between"
									>
										<span className="truncate">{column.label}</span>
										<Check
											className={cn(
												"ml-auto size-4",
												isVisible ? "opacity-100" : "opacity-0",
											)}
										/>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</Popover.Content>
		</Popover.Root>
	);
}
