"use client";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/audience";
import type { Audience } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";

interface AudienceHeaderProps {
	audience: Audience | null;
	isLoading: boolean;
}

export const AudienceHeader = ({
	audience,
	isLoading,
}: AudienceHeaderProps) => {
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
				</div>
			</div>
		);
	}

	if (!audience) {
		return (
			<div className="mb-8">
				<div className="flex items-center gap-2 text-red-600">
					<Icon name="alert-circle" className="h-5 w-5" />
					<h1 className="font-medium text-xl">Audience not found</h1>
				</div>
				<p className="text-text-sub-600">
					The requested audience could not be found.
				</p>
			</div>
		);
	}

	return (
		<div className="mb-8">
			<div className="mb-4 flex items-center gap-4">
				<div className="flex items-center gap-2">
					<Icon name="user" className="h-6 w-6 text-text-sub-600" />
					<h1 className="font-medium text-2xl">{audience.email}</h1>
				</div>
				<div
					className={`flex items-center gap-2.5 rounded-lg py-0.5 pl-3 font-medium text-label-xs capitalize ${getStatusColorClass(audience.status)}`}
				>
					<Icon name={getStatusIcon(audience.status)} className="h-3.5 w-3.5" />
					{getStatusLabel(audience.status)}
				</div>
			</div>

			<div className="flex gap-6">
				<div className="flex items-center gap-2">
					<Icon name="users" className="h-4 w-4 text-text-sub-600" />
					<span className="text-sm text-text-sub-600">
						Group: {audience.audienceGroupName}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Icon name="calendar" className="h-4 w-4 text-text-sub-600" />
					<span className="text-sm text-text-sub-600">
						Added {new Date(audience.addedAt).toLocaleDateString()}
					</span>
				</div>
				{audience.unsubscribedAt && (
					<div className="flex items-center gap-2">
						<Icon name="minus-circle" className="h-4 w-4 text-text-sub-600" />
						<span className="text-sm text-text-sub-600">
							Unsubscribed{" "}
							{new Date(audience.unsubscribedAt).toLocaleDateString()}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};
