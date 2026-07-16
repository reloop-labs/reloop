import { Skeleton } from "@reloop/ui/skeleton";

const GRID =
	"grid-cols-[minmax(0,1fr)_100px_110px_120px_minmax(40px,auto)]";

interface WebhookTableSkeletonProps {
	rows?: number;
}

export const WebhookTableSkeleton = ({
	rows = 5,
}: WebhookTableSkeletonProps) => {
	return (
		<>
			{Array.from({ length: rows }).map((_, index) => (
				<div
					key={`skeleton-${index}`}
					className={`grid ${GRID} items-center px-4 py-2.5`}
				>
					<div className="min-w-0 pr-3">
						<Skeleton className="h-3.5 w-64 max-w-full rounded" />
					</div>
					<div className="flex items-center gap-1.5">
						<Skeleton className="h-3.5 w-3.5 rounded-full" />
						<Skeleton className="h-3.5 w-12 rounded" />
					</div>
					<div className="flex flex-col gap-1">
						<Skeleton className="h-3.5 w-10 rounded" />
						<Skeleton className="h-2.5 w-14 rounded" />
					</div>
					<div>
						<Skeleton className="h-3.5 w-16 rounded" />
					</div>
					<div className="flex justify-center">
						<Skeleton className="h-7 w-7 rounded-md" />
					</div>
				</div>
			))}
		</>
	);
};
