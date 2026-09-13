"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { CustomEvent } from "../hooks/use-custom-events-api";
import { DeleteEventModal } from "./delete-event-modal";
import { EditEventModal } from "./edit-event-modal";
import {
	type EventActionsHandlers,
	EventDropdown,
	EventRowContextMenu,
} from "./event-dropdown";
import { WorkflowEmptyState } from "./workflow-empty-state";

const GRID =
	"grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_88px_40px] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_88px_108px_40px]";

interface EventsTableProps {
	events: CustomEvent[];
	allEvents?: CustomEvent[];
	isLoading?: boolean;
	isTotalEmpty?: boolean;
	isFilteredEmpty?: boolean;
	onCreate: () => void;
	onClearFilters?: () => void;
}

export function EventsTable({
	events,
	allEvents,
	isLoading,
	isTotalEmpty,
	isFilteredEmpty,
	onCreate,
	onClearFilters,
}: EventsTableProps) {
	const modalEvents = allEvents ?? events;
	const [, setEditId] = useQueryState("edit");
	const [, setDeleteId] = useQueryState("delete");
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleEdit = useCallback(
		(id: string) => {
			void setEditId(id);
		},
		[setEditId],
	);

	const handleDelete = useCallback(
		(id: string) => {
			void setDeleteId(id);
		},
		[setDeleteId],
	);

	const handleOpenChange = useCallback((open: boolean, id: string) => {
		setActiveDropdownId(open ? id : null);
	}, []);

	const actionsHandlers = useMemo<EventActionsHandlers>(
		() => ({
			onEdit: handleEdit,
			onDelete: handleDelete,
			onOpenChange: handleOpenChange,
		}),
		[handleEdit, handleDelete, handleOpenChange],
	);

	return (
		<>
			<div className="w-full text-paragraph-sm">
				<div
					className={cn(
						"grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40",
						GRID,
					)}
				>
					<div className="flex items-center gap-1">
						<Icon name="zap" className="h-3 w-3" />
						<span>Name</span>
					</div>
					<span>Key</span>
					<span>Properties</span>
					<span className="hidden sm:block">Updated</span>
					<div />
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoading && events.length === 0 ? (
						[1, 2, 3, 4].map((i) => (
							<div key={i} className={cn("grid items-center px-4 py-3", GRID)}>
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-4 w-10" />
								<Skeleton className="hidden h-4 w-16 sm:block" />
								<Skeleton className="h-4 w-4 justify-self-end" />
							</div>
						))
					) : isTotalEmpty ? (
						<WorkflowEmptyState
							icon="zap"
							title="No triggers yet"
							description="Create a trigger to start automations on the canvas."
							createLabel="Create trigger"
							onCreate={onCreate}
						/>
					) : isFilteredEmpty || events.length === 0 ? (
						<WorkflowEmptyState
							icon="zap"
							title="No triggers found"
							description="Try a different name or key."
							isFiltered
							onCreate={onCreate}
							onClearFilters={onClearFilters}
						/>
					) : (
						events.map((event) => {
							const isRowActive = activeDropdownId === event.id;
							return (
								<EventRowContextMenu
									key={event.id}
									event={event}
									handlers={actionsHandlers}
								>
									<div
										className={cn(
											"group/row grid w-full items-center px-4 py-2.5",
											GRID,
											"hover:bg-bg-weak-50",
											isRowActive && "bg-bg-weak-50/50",
										)}
									>
										<button
											type="button"
											onClick={() => handleEdit(event.id)}
											className="truncate text-left font-semibold text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
										>
											{event.name}
										</button>
										<p className="truncate font-mono text-text-sub-600 text-xs">
											{event.key}
										</p>
										<p className="text-text-sub-600 text-xs tabular-nums">
											{event.properties.length}
										</p>
										<p className="hidden text-text-sub-600 text-xs sm:block">
											{formatRelativeTime(event.updatedAt)}
										</p>
										<div
											className="flex justify-end"
											onClick={(e) => e.stopPropagation()}
											onKeyDown={(e) => e.stopPropagation()}
										>
											<EventDropdown event={event} handlers={actionsHandlers} />
										</div>
									</div>
								</EventRowContextMenu>
							);
						})
					)}
				</div>
			</div>

			<EditEventModal events={modalEvents} />
			<DeleteEventModal events={modalEvents} />
		</>
	);
}
