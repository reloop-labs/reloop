import { Skeleton } from "@reloop/ui/skeleton";
import type { VisibilityState } from "@tanstack/react-table";
import { getWorkflowTableGridStyle } from "./constants";

export function WorkflowTableSkeleton({
	rows = 3,
	columnVisibility = {},
}: {
	rows?: number;
	columnVisibility?: VisibilityState;
}) {
	const gridStyle = getWorkflowTableGridStyle(columnVisibility);
	const visibleCount = Object.entries({
		name: true,
		trigger: true,
		steps: true,
		updatedAt: true,
		status: true,
		...columnVisibility,
	}).filter(([, visible]) => visible !== false).length;

	return (
		<>
			{Array.from({ length: rows }).map((_, index) => (
				<div
					key={`skeleton-${index}`}
					style={gridStyle}
					className="grid items-center px-4 py-2"
				>
					<Skeleton className="h-4 w-4 rounded" />
					{Array.from({ length: visibleCount }).map((__, colIndex) => (
						<Skeleton
							key={`skeleton-${index}-${colIndex}`}
							className={
								colIndex === visibleCount - 1
									? "h-5 w-16 rounded-full"
									: colIndex === 0
										? "h-4 w-32"
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
