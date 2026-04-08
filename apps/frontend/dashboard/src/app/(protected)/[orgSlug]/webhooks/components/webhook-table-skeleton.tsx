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
					className="grid grid-cols-[2fr_1.5fr_1fr_1fr_96px] items-center px-6 py-4"
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
