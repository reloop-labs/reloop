"use client";
import { Icon } from "@reloop/ui/icon";
import { useParams } from "next/navigation";
import useSWR from "swr";

interface Group {
	id: string;
	name: string;
}

export const GroupDetailContent = () => {
	const params = useParams();
	const contact_group_id = params.contact_group_id as string;

	const {
		data: group,
		error,
		isLoading,
	} = useSWR<Group>(
		contact_group_id ? `/api/contacts/v1/groups/${contact_group_id}` : null,
	);

	if (isLoading) {
		return (
			<div className="p-8 text-center text-text-sub-600">
				Loading group details...
			</div>
		);
	}

	if (error || !group) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-12 text-center">
				<Icon name="alert-circle" className="mb-2 h-8 w-8 text-error-base" />
				<h3 className="font-semibold text-text-strong-950">Group not found</h3>
				<p className="text-sm text-text-sub-600">
					The group you are looking for does not exist or has been deleted.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-6">
				<h2 className="mb-2 font-semibold text-text-strong-950 text-xl">
					{group.name}
				</h2>
				<p className="text-sm text-text-sub-600">
					This is the detail page for the group{" "}
					<span className="font-medium">"{group.name}"</span>. In the future,
					you'll be able to see contacts belonging to this group here.
				</p>
			</div>
		</div>
	);
};
