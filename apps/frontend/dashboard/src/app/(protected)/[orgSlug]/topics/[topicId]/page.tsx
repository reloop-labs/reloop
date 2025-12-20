"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { TopicHeader } from "./components/topic-header";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	autoEnroll?: "enrolled" | "unenrolled";
	visibility?: "private" | "public";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

const TopicDetailPage = () => {
	const { topicId, orgSlug } = useParams();
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();
	const [showAddContact, setShowAddContact] = useState(false);

	const {
		data: topicData,
		error: topicError,
		isLoading: topicLoading,
	} = useSWR<Topic>(`/api/contacts/v1/topics/${topicId}`, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	if (topicLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (topicError) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
					<p className="text-center text-sm text-text-sub-600">
						Failed to load topic
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<TopicHeader
				topic={topicData || null}
				isLoading={topicLoading}
				isFailed={!!topicError}
				onOpenAddContact={() => setShowAddContact(true)}
				onOpenBulkImport={() =>
					router.push(`/${orgSlug}/topics/${topicId}/bulk-import`)
				}
			/>
		</div>
	);
};

export default TopicDetailPage;
