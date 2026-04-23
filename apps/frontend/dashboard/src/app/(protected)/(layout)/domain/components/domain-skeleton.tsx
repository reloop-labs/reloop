"use client";
import { Skeleton } from "@reloop/ui/skeleton";

export const DomainSkeleton = () => (
	<div className="grid grid-cols-[1fr_minmax(200px,auto)_140px_minmax(40px,auto)] items-center px-4 py-2">
		<div className="flex items-center gap-2">
			<Skeleton className="h-4 w-32" />
		</div>
		<div className="flex items-center gap-2">
			<Skeleton className="h-2 w-2 rounded-full" />
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
