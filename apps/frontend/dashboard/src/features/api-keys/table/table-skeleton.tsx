import { Skeleton } from "@reloop/ui/skeleton";
import { API_KEY_TABLE_GRID } from "./constants";

export function TableSkeleton({ rows = 3 }: { rows?: number }) {
	return (
		<>
			{Array.from({ length: rows }).map((_, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
					key={`skeleton-${index}`}
					className={`grid ${API_KEY_TABLE_GRID} items-center px-4 py-2`}
				>
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-5 w-16 rounded-full" />
					<div className="flex justify-end">
						<Skeleton className="h-4 w-4 rounded" />
					</div>
				</div>
			))}
		</>
	);
}
