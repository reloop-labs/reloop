"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { GroupContactList } from "./components/group-contact-list";
import { GroupHeader } from "./components/group-header";

interface GroupData {
	id: string;
	name: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export const GroupDetailContent = () => {
	const params = useParams();
	const contact_group_id = params.contact_group_id as string;

	const {
		data: groupData,
		error: groupError,
		isLoading: groupLoading,
	} = useSWR<GroupData>(
		contact_group_id ? `/api/contacts/v1/groups/${contact_group_id}` : null,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		},
	);

	const isLoading = groupLoading;

	if (groupError) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<SomethingWentWrong />
			</div>
		);
	}

	if (!groupData && !isLoading) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-gray-900">
						Group not found
					</h2>
					<p className="text-gray-500">
						The group you're looking for doesn't exist or has been deleted.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<GroupHeader group={groupData} isLoading={isLoading} />
			{groupData && <GroupContactList groupId={groupData.id} />}
		</div>
	);
};
