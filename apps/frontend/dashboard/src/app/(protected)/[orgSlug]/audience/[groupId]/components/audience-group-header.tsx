"use client";
import type { AudienceGroup } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";

interface AudienceGroupHeaderProps {
	group: AudienceGroup | null;
	isLoading: boolean;
}

export const AudienceGroupHeader = ({
	group,
	isLoading,
}: AudienceGroupHeaderProps) => {
	if (isLoading) {
		return (
			<div className="mb-8">
				<div className="mb-4 flex items-center gap-4">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-6 w-32" />
				</div>
				<Skeleton className="mb-4 h-4 w-96" />
				<div className="flex gap-4">
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-6 w-24" />
				</div>
			</div>
		);
	}

	if (!group) {
		return (
			<div className="mb-8">
				<div className="flex items-center gap-2 text-red-600">
					<Icon name="alert-circle" className="h-5 w-5" />
					<h1 className="font-medium text-xl">Group not found</h1>
				</div>
				<p className="text-text-sub-600">
					The requested audience group could not be found.
				</p>
			</div>
		);
	}

	return (
		<div className="mb-8">
			<div className="mb-4 flex items-center gap-4">
				<div className="flex items-center gap-2">
					<Icon name="users" className="h-6 w-6 text-text-sub-600" />
					<h1 className="font-medium text-2xl">{group.name}</h1>
				</div>
				<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
					{group.audienceCount} audiences
				</span>
			</div>

			{group.description && (
				<p className="mb-4 text-text-sub-600">{group.description}</p>
			)}

			<div className="flex gap-6">
				<div className="flex items-center gap-2">
					<Icon name="check-circle" className="h-4 w-4 text-success-base" />
					<span className="font-medium text-sm text-text-strong-950">
						{group.subscribedCount} subscribed
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="minus-circle" className="h-4 w-4 text-text-sub-600" />
					<span className="font-medium text-sm text-text-strong-950">
						{group.unsubscribedCount} unsubscribed
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="calendar" className="h-4 w-4 text-text-sub-600" />
					<span className="text-sm text-text-sub-600">
						Created {new Date(group.createdAt).toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
};
