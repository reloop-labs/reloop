import { useGroupQuery } from "#/features/contacts/hooks/use-contacts-query";
import { GroupContactList } from "./group-contact-list";
import { GroupHeader } from "./group-header";

export function GroupDetailContent({ groupId }: { groupId: string }) {
	const {
		data: groupData,
		error: groupError,
		isPending: groupLoading,
		isFetching,
	} = useGroupQuery(groupId);

	const isLoading = groupLoading || (isFetching && !groupData);

	if (groupError && !groupData) {
		return (
			<div className="py-12 text-center">
				<p className="text-sm text-text-sub-600">Failed to load group</p>
			</div>
		);
	}

	if (!groupData && !isLoading) {
		return (
			<div className="py-12 text-center">
				<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
					Group not found
				</h2>
				<p className="text-text-sub-600">
					The group you&apos;re looking for doesn&apos;t exist or has been
					deleted.
				</p>
			</div>
		);
	}

	return (
		<>
			<GroupHeader group={groupData} isLoading={isLoading} />
			<GroupContactList groupId={groupId} />
		</>
	);
}
