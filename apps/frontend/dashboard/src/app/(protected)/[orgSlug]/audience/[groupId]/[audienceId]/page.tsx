"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { Audience, AudienceGroupListResponse } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { AudienceActions } from "./components/audience-actions";
import { AudienceDetails } from "./components/audience-details";
import { AudienceHeader } from "./components/audience-header";

const AudienceDetailPage = () => {
	const { audienceId, groupId } = useParams();
	const { activeOrganization } = useUserOrganization();
	const router = useRouter();

	const {
		data: audienceData,
		error: audienceError,
		isLoading: audienceLoading,
	} = useSWR<Audience>(`/api/audience/v1/get/${audienceId}`, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const { data: groupsData } = useSWR<AudienceGroupListResponse>(
		activeOrganization?.id
			? `/api/audience/v1/groups/list?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	);

	const handleDelete = () => {
		router.push(`/${activeOrganization.slug}/audience/${groupId}`);
	};

	if (audienceError) {
		return (
			<div className="mx-auto max-w-3xl">
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
					<p className="text-center text-sm text-text-sub-600">
						Failed to load audience details
					</p>
				</div>
			</div>
		);
	}

	if (audienceLoading) {
		return (
			<div className="mx-auto max-w-3xl">
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
				<div className="space-y-6">
					<div className="rounded-lg border border-stroke-soft-200 p-6">
						<Skeleton className="mb-4 h-6 w-32" />
						<div className="space-y-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="rounded-lg border border-stroke-soft-200 p-6">
							<Skeleton className="mb-4 h-6 w-40" />
							<Skeleton className="h-10 w-32" />
						</div>
						<div className="rounded-lg border border-stroke-soft-200 p-6">
							<Skeleton className="mb-4 h-6 w-36" />
							<Skeleton className="h-10 w-32" />
						</div>
						<div className="rounded-lg border border-red-200 bg-red-50 p-6">
							<Skeleton className="mb-4 h-6 w-24" />
							<Skeleton className="h-10 w-32" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl">
			<AudienceHeader
				audience={audienceData || null}
				isLoading={audienceLoading}
			/>

			<div className="space-y-6">
				<AudienceDetails audience={audienceData || null} onUpdate={() => {}} />

				<AudienceActions
					audience={audienceData || null}
					audienceGroups={groupsData?.audienceGroups || []}
					onUpdate={() => {}}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	);
};

export default AudienceDetailPage;
