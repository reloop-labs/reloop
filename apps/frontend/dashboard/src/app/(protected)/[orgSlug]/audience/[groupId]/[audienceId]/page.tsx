"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { Audience, AudienceGroupListResponse } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { AudienceActions } from "./components/audience-actions";
import { AudienceDetails } from "./components/audience-details";
import { AudienceHeader } from "./components/audience-header";
import { AudienceMetadata } from "./components/audience-metadata";

interface AudienceDetailPageProps {
	params: {
		groupId: string;
		audienceId: string;
	};
}

const AudienceDetailPage = ({ params }: AudienceDetailPageProps) => {
	const { activeOrganization } = useUserOrganization();
	const router = useRouter();
	const [audience, setAudience] = useState<Audience | null>(null);

	// Fetch audience details
	const {
		data: audienceData,
		error: audienceError,
		isLoading: audienceLoading,
	} = useSWR<Audience>(`/api/audience/v1/audience/${params.audienceId}`, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	// Fetch audience groups for move functionality
	const { data: groupsData } = useSWR<AudienceGroupListResponse>(
		activeOrganization?.id
			? `/api/audience/v1/audience-groups?organizationId=${activeOrganization.id}&limit=100`
			: null,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	);

	// Update local state when data changes
	useState(() => {
		if (audienceData) {
			setAudience(audienceData);
		}
	});

	const handleUpdate = (updatedAudience: Audience) => {
		setAudience(updatedAudience);
	};

	const handleDelete = () => {
		// Navigate back to the audience group page
		router.push(`/${activeOrganization.slug}/audience/${params.groupId}`);
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
				audience={audience || audienceData || null}
				isLoading={audienceLoading}
			/>

			<div className="space-y-6">
				<AudienceDetails
					audience={audience || audienceData || null}
					onUpdate={handleUpdate}
				/>

				<AudienceMetadata
					audience={audience || audienceData || null}
					onUpdate={handleUpdate}
				/>

				<AudienceActions
					audience={audience || audienceData || null}
					audienceGroups={groupsData?.audienceGroups || []}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	);
};

export default AudienceDetailPage;
