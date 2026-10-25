import { Skeleton } from "@reloop/ui/skeleton";
import type { VisibilityState } from "@tanstack/react-table";
import { getApiKeyTableGridStyle } from "./constants";

/** Placeholder per data column, sized like the real cell content. */
const COLUMN_SKELETONS: Record<string, string> = {
	name: "h-4 w-28",
	domains: "h-4 w-24",
	prefix: "h-5 w-16 rounded-md",
	lastUsed: "h-4 w-16",
	status: "h-4 w-14",
	createdAt: "h-4 w-16",
};

export function TableSkeleton({
	rows = 3,
	columnVisibility = {},
}: {
	rows?: number;
	columnVisibility?: VisibilityState;
}) {
	const gridStyle = getApiKeyTableGridStyle(columnVisibility);
	const visibleColumns = Object.entries(COLUMN_SKELETONS).filter(
		([id]) => columnVisibility[id] !== false,
	);

	return (
		<>
			{Array.from({ length: rows }).map((_, index) => (
				<div
					key={`skeleton-${index}`}
					style={gridStyle}
					className="grid items-center px-4 py-2"
				>
					{/* Matches DataTableCheckbox (size-4 rounded-sm) */}
					<Skeleton className="size-4 rounded-sm" />
					{visibleColumns.map(([id, className]) => (
						<Skeleton key={`skeleton-${index}-${id}`} className={className} />
					))}
					{/* Matches the actions trigger (h-7 w-7 rounded-lg) */}
					<Skeleton className="h-7 w-7 rounded-lg" />
				</div>
			))}
		</>
	);
}
