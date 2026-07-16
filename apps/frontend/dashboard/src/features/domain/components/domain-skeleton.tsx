import { Skeleton } from "@reloop/ui/skeleton";

export function DomainSkeleton() {
	return (
		<div className="grid grid-cols-[minmax(0,1fr)_120px_140px_32px] items-center px-4 py-2">
			<div className="flex items-center gap-2">
				<Skeleton className="h-4 w-32" />
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-4 w-16" />
			</div>
			<div className="flex items-center">
				<Skeleton className="h-4 w-20" />
			</div>
			<div className="flex items-center justify-center">
				<Skeleton className="h-4 w-4 rounded" />
			</div>
		</div>
	);
}
