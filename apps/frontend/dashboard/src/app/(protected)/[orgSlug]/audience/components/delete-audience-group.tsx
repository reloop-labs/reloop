"use client";
import type { AudienceGroup } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface DeleteAudienceGroupModalProps {
	audienceGroups: AudienceGroup[];
}

export const DeleteAudienceGroupModal = ({
	audienceGroups,
}: DeleteAudienceGroupModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const { mutate } = useSWRConfig();
	const { changeStatus, status } = useLoading();

	const groupToDelete = audienceGroups.find((group) => group.id === deleteId);

	const handleDelete = async () => {
		if (!deleteId) return;

		try {
			changeStatus("loading");
			await axios.delete(`/api/audience/v1/audience-groups/${deleteId}`, {
				headers: { credentials: "include" },
			});

			await mutate("/api/audience/v1/audience-groups");
			toast.success("Audience group deleted successfully");
			setDeleteId(null);
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete audience group"
				: "Failed to delete audience group";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		setDeleteId(null);
	};

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open: boolean) => !open && setDeleteId(null)}
		>
			<Modal.Content className="max-w-md">
				<Modal.Header
					iconName="alert-triangle"
					title="Delete Audience Group"
					description={`Are you sure you want to delete "${groupToDelete?.name}"? This action cannot be undone and will remove all audiences in this group.`}
				/>

				<div className="my-4 rounded-lg bg-red-50 p-3">
					<div className="flex items-start gap-2">
						<Icon name="info" className="mt-0.5 h-4 w-4 text-red-600" />
						<div className="text-red-800 text-sm">
							<p className="font-medium">This will permanently delete:</p>
							<ul className="mt-1 list-disc pl-4">
								<li>The audience group "{groupToDelete?.name}"</li>
								<li>
									All {groupToDelete?.audienceCount || 0} audiences in this
									group
								</li>
								<li>All associated metadata and history</li>
							</ul>
						</div>
					</div>
				</div>

				<Modal.Footer className="flex gap-2">
					<Button.Root
						variant="neutral"
						mode="stroke"
						onClick={handleCancel}
						disabled={status === "loading"}
					>
						Cancel
					</Button.Root>
					<Button.Root
						variant="error"
						onClick={handleDelete}
						disabled={status === "loading"}
					>
						{status === "loading" ? (
							<>
								<Icon name="loader" className="h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<Icon name="trash" className="h-4 w-4" />
								Delete Group
							</>
						)}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
