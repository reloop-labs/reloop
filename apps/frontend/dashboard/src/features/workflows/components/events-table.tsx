"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { CustomEvent } from "../hooks/use-custom-events-api";
import { WorkflowEmptyState } from "./workflow-empty-state";

const GRID =
	"grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_88px_108px] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_88px_108px]";

interface EventsTableProps {
	events: CustomEvent[];
	isLoading?: boolean;
	isTotalEmpty?: boolean;
	isFilteredEmpty?: boolean;
	onCreate: () => void;
	onClearFilters?: () => void;
}

export function EventsTable({
	events,
	isLoading,
	isTotalEmpty,
	isFilteredEmpty,
	onCreate,
	onClearFilters,
}: EventsTableProps) {
	return (
		<div className="w-full text-paragraph-sm">
			<div
				className={cn(
					"grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40",
					GRID,
				)}
			>
				<div className="flex items-center gap-1">
					<Icon name="route" className="h-3 w-3" />
					<span>Name</span>
				</div>
				<span>Key</span>
				<span>Properties</span>
				<span className="hidden sm:block">Updated</span>
			</div>

			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{isLoading && events.length === 0 ? (
					[1, 2, 3, 4].map((i) => (
						<div key={i} className={cn("grid items-center px-4 py-3", GRID)}>
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-4 w-10" />
							<Skeleton className="hidden h-4 w-16 sm:block" />
						</div>
					))
				) : isTotalEmpty ? (
					<WorkflowEmptyState
						title="No events yet"
						description="Create an event to use as a trigger on the canvas."
						createLabel="Create event"
						onCreate={onCreate}
					/>
				) : isFilteredEmpty || events.length === 0 ? (
					<WorkflowEmptyState
						title="No events found"
						description="Try a different name or key."
						isFiltered
						onCreate={onCreate}
						onClearFilters={onClearFilters}
					/>
				) : (
					events.map((event) => (
						<div
							key={event.id}
							className={cn("grid w-full items-center px-4 py-2.5", GRID)}
						>
							<p className="truncate font-semibold text-label-sm text-text-strong-950">
								{event.name}
							</p>
							<p className="truncate font-mono text-text-sub-600 text-xs">
								{event.key}
							</p>
							<p className="text-text-sub-600 text-xs tabular-nums">
								{event.properties.length}
							</p>
							<p className="hidden text-text-sub-600 text-xs sm:block">
								{formatRelativeTime(event.updatedAt)}
							</p>
						</div>
					))
				)}
			</div>
		</div>
	);
}
