"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { Audience, AudienceGroupListResponse } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
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
