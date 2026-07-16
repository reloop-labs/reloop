import { Skeleton } from "@reloop/ui/skeleton";

interface WebhookTableSkeletonProps {
	rows?: number;
}

export const WebhookTableSkeleton = ({
	rows = 3,
}: WebhookTableSkeletonProps) => {
	return (
		<>
			{Array.from({ length: rows }).map((_, index) => (
				<div
					key={`skeleton-${index}`}
					className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_120px_140px_32px] items-center px-4 py-2"
				>
					<div className="flex flex-col gap-1.5">
						<Skeleton className="h-4 w-32 rounded" />
						<Skeleton className="h-3 w-48 rounded" />
					</div>
					<div>
						<Skeleton className="h-4 w-24 rounded" />
					</div>
					<div className="flex items-center">
						<Skeleton className="h-4 w-16 rounded" />
					</div>
					<div>
						<Skeleton className="h-4 w-20 rounded" />
					</div>
					<div className="flex justify-end gap-2">
						<Skeleton className="h-8 w-10 rounded-lg" />
						<Skeleton className="h-8 w-10 rounded-lg" />
					</div>
				</div>
			))}
		</>
	);
};
