"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Tooltip from "@reloop/ui/tooltip";
import type { VisibilityState } from "@tanstack/react-table";
import { Circle, PauseCircle, PlayCircle } from "lucide-react";
import { useCallback, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";
import {
	type DataTableViewColumn,
	DataTableViewOptions,
} from "#/components/data-table/data-table-view-options";
import { dataTableToolbarControlClassName } from "#/components/data-table/toolbar-control";
import { useToolbarRefresh } from "#/components/data-table/use-toolbar-refresh";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { WorkflowStatus } from "../workflow-types";

const SEARCH_INPUT_ID = "automation-list-search";

const STATUS_VALUES: WorkflowStatus[] = ["draft", "paused", "active"];

const statusOptions = [
	{ label: "Draft", value: "draft", icon: Circle },
	{ label: "Paused", value: "paused", icon: PauseCircle },
	{ label: "Active", value: "active", icon: PlayCircle },
] as const;

const VIEW_COLUMNS: DataTableViewColumn[] = [
	{
		id: "name",
		label: "Name",
		locked: true,
		icon: <Icon name="workflow" className="h-3.5 w-3.5" />,
	},
	{
		id: "trigger",
		label: "Trigger",
		icon: <Icon name="zap" className="h-3.5 w-3.5" />,
	},
	{
		id: "steps",
		label: "Steps",
		icon: <Icon name="layers" className="h-3.5 w-3.5" />,
	},
	{
		id: "updatedAt",
		label: "Updated",
		icon: <Icon name="history" className="h-3.5 w-3.5" />,
	},
	{
		id: "status",
		label: "Status",
		icon: <Icon name="activity" className="h-3.5 w-3.5" />,
	},
];

export function AutomationListToolbar({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusChange,
	onRefresh,
	searchPlaceholder = "Search automations...",
	searchLabel = "Search automations",
	showStatusFilter = true,
	columnVisibility,
	onColumnVisibleChange,
}: {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: string[];
	onStatusChange: (value: string[]) => void;
	onRefresh: () => void;
	searchPlaceholder?: string;
	searchLabel?: string;
	showStatusFilter?: boolean;
	columnVisibility?: VisibilityState;
	onColumnVisibleChange?: (id: string, visible: boolean) => void;
}) {
	const searchInputRef = useRef<HTMLInputElement>(null);
	const { isRefreshing, refresh } = useToolbarRefresh(onRefresh);

	const focusSearch = useCallback(() => {
		const input =
			searchInputRef.current ?? document.getElementById(SEARCH_INPUT_ID);
		if (!(input instanceof HTMLInputElement)) return;
		input.focus();
		input.select();
	}, []);

	useHotkeys(
		"r",
		(e) => {
			e.preventDefault();
			refresh();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"slash",
		(e) => {
			e.preventDefault();
			focusSearch();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	return (
		<div
			role="toolbar"
			aria-orientation="horizontal"
			className="flex w-full items-start justify-between gap-2"
		>
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
				<Input.Root
					size="small"
					className="w-40 rounded-xl shadow-none! lg:w-56"
				>
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							id={SEARCH_INPUT_ID}
							ref={searchInputRef}
							placeholder={searchPlaceholder}
							value={searchQuery}
							aria-keyshortcuts="/"
							aria-label={searchLabel}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
						<button
							type="button"
							tabIndex={-1}
							aria-label="Focus search"
							onMouseDown={(e) => {
								e.preventDefault();
								focusSearch();
							}}
							className="shrink-0 cursor-pointer rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950"
						>
							<ActionKbd>/</ActionKbd>
						</button>
					</Input.Wrapper>
				</Input.Root>

				{showStatusFilter ? (
					<DataTableFacetedFilter
						title="Status"
						multiple
						options={[...statusOptions]}
						selectedValues={STATUS_VALUES.filter((value) =>
							statusFilter.includes(value),
						)}
						onSelectedValuesChange={(values) => {
							onStatusChange(
								STATUS_VALUES.filter((value) => values.includes(value)),
							);
						}}
					/>
				) : null}
			</div>

			<div className="flex shrink-0 items-center gap-2">
				{columnVisibility && onColumnVisibleChange ? (
					<DataTableViewOptions
						columns={VIEW_COLUMNS}
						visibility={columnVisibility}
						onVisibilityChange={onColumnVisibleChange}
					/>
				) : null}

				<Tooltip.Provider delayDuration={200}>
					<Tooltip.Root>
						<Tooltip.Trigger asChild>
							<button
								type="button"
								onClick={refresh}
								disabled={isRefreshing}
								className={cn(
									dataTableToolbarControlClassName,
									"gap-2 px-1.5",
									isRefreshing ? "pointer-events-none" : "cursor-pointer",
								)}
								aria-label="Refresh automations"
								aria-keyshortcuts="r"
								aria-busy={isRefreshing}
							>
								<Icon
									name="rotate-cw"
									className={cn(
										"h-3.5 w-3.5 shrink-0",
										isRefreshing && "animate-spin",
									)}
								/>
								<ActionKbd>R</ActionKbd>
							</button>
						</Tooltip.Trigger>
						<Tooltip.Content side="top" size="small" variant="light">
							Refresh list
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		</div>
	);
}
