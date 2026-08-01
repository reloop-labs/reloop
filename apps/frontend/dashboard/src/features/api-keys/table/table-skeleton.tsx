import { Skeleton } from "@reloop/ui/skeleton";
import type { VisibilityState } from "@tanstack/react-table";
import { getApiKeyTableGridStyle } from "./constants";

export function TableSkeleton({
	rows = 3,
	columnVisibility = {},
}: {
	rows?: number;
	columnVisibility?: VisibilityState;
}) {
	const gridStyle = getApiKeyTableGridStyle(columnVisibility);
	const visibleCount = Object.entries({
		name: true,
		prefix: true,
		lastUsed: true,
		status: true,
		createdBy: true,
		createdAt: true,
		...columnVisibility,
	}).filter(([, visible]) => visible !== false).length;

	return (
		<>
			{Array.from({ length: rows }).map((_, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
					key={`skeleton-${index}`}
					style={gridStyle}
					className="grid items-center px-4 py-2"
				>
					<Skeleton className="h-4 w-4 rounded" />
					{Array.from({ length: visibleCount }).map((__, colIndex) => (
						<Skeleton
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
							key={`skeleton-${index}-${colIndex}`}
							className={
								colIndex === visibleCount - 1
									? "h-5 w-16 rounded-full"
									: "h-4 w-20"
							}
						/>
					))}
					<div className="flex justify-end">
						<Skeleton className="h-4 w-4 rounded" />
					</div>
				</div>
			))}
		</>
	);
}
