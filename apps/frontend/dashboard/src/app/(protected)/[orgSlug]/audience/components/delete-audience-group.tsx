"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { AudienceGroup } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface DeleteAudienceGroupModalProps {
	audienceGroups: AudienceGroup[];
}

export const DeleteAudienceGroupModal = ({
	audienceGroups,
}: DeleteAudienceGroupModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isDeleting, setIsDeleting] = useState(false);
	const [confirmationText, setConfirmationText] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const { mutate } = useSWRConfig();
	const { activeOrganization } = useUserOrganization();
	const pathname = usePathname();
	const router = useRouter();

	const groupToDelete = audienceGroups.find((group) => group.id === deleteId);

	const isOnDetailPage =
		pathname?.includes("/audience/") &&
		!pathname?.includes("/audience/add") &&
		pathname !== `/${activeOrganization?.slug}/audience`;

	useEffect(() => {
		if (isCopied) {
			const timer = setTimeout(() => {
				setIsCopied(false);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [isCopied]);

	const handleDelete = async () => {
		if (!groupToDelete) return;

		setIsDeleting(true);
		try {
			await axios.delete(`/api/audience/v1/groups/delete/${groupToDelete.id}`, {
				headers: { credentials: "include" },
			});
			await mutate("/api/audience/v1/groups/list");

			toast.success(`${groupToDelete.name} deleted successfully`);

			setDeleteId(null);
			setConfirmationText("");

			if (isOnDetailPage && activeOrganization) {
				setTimeout(() => {
					router.push(`/${activeOrganization.slug}/audience`);
				}, 100);
			}
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete audience group"
				: "Failed to delete audience group";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancel = () => {
		setDeleteId(null);
		setConfirmationText("");
	};

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => !open && setDeleteId(null)}
		>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (confirmationText === groupToDelete?.name && !isDeleting) {
							handleDelete();
						}
					}}
				>
					<Modal.Body>
						<h2 className="mb-2 font-semibold text-xl">
							Delete Audience Group
						</h2>
						<p className="text-gray-600 text-sm">
							Are you sure you want to delete this audience group?
						</p>
						<p className="mb-4 font-medium text-red-600 text-sm">
							This can not be undone.
						</p>

						<div className="mb-4">
							<p className="mb-2 text-sm">
								Type{" "}
								<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-2 py-1 font-mono text-xs">
									{groupToDelete?.name}
									<button
										type="button"
										onClick={async () => {
											try {
												await navigator.clipboard.writeText(
													groupToDelete?.name || "",
												);
												setIsCopied(true);
											} catch {
												toast.error("Failed to copy group name");
											}
										}}
										className="ml-1 text-gray-500 hover:text-gray-700"
									>
										<Icon
											name={isCopied ? "check" : "copy"}
											className={`h-3 w-3 ${isCopied ? "text-green-600" : ""}`}
										/>
									</button>
								</span>{" "}
								to confirm.
							</p>
							<Input.Root>
								<Input.Wrapper size="xsmall">
									<Input.Input
										type="text"
										value={confirmationText}
										onChange={(e) => setConfirmationText(e.target.value)}
										placeholder="Enter group name"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
							<div className="border-gray-200 border-b bg-gray-50 px-4 py-3">
								<h3 className="font-medium text-gray-900 text-sm">
									{groupToDelete?.name}
								</h3>
							</div>
							<div className="divide-y divide-gray-200">
								<div className="flex items-center justify-between px-4 py-2">
									<div className="flex items-center gap-2">
										<Icon name="users" className="h-4 w-4 text-blue-600" />
										<span className="font-medium text-gray-700 text-sm">
											Total Audience
										</span>
									</div>
									<div className="text-right">
										<div className="font-semibold text-gray-900 text-lg">
											{groupToDelete?.audienceCount || 0}
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between px-4 py-2">
									<div className="flex items-center gap-2">
										<Icon
											name="check-circle"
											className="h-4 w-4 text-green-600"
										/>
										<span className="font-medium text-gray-700 text-sm">
											Subscribed
										</span>
									</div>
									<div className="text-right">
										<div className="font-semibold text-green-600 text-lg">
											{groupToDelete?.subscribedCount || 0}
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between px-4 py-2">
									<div className="flex items-center gap-2">
										<Icon
											name="minus-circle"
											className="h-4 w-4 text-red-600"
										/>
										<span className="font-medium text-gray-700 text-sm">
											Unsubscribed
										</span>
									</div>
									<div className="text-right">
										<div className="font-semibold text-lg text-red-600">
											{groupToDelete?.unsubscribedCount || 0}
										</div>
									</div>
								</div>
							</div>
						</div>
					</Modal.Body>

					<Modal.Footer className="flex items-center justify-end gap-3">
						<Button.Root
							type="submit"
							variant="error"
							size="small"
							disabled={isDeleting || confirmationText !== groupToDelete?.name}
						>
							{isDeleting ? (
								<>
									<Icon name="loader" className="h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									Delete Group
									<Icon name="undo" className="h-3 w-3 scale-y-[-1]" />
								</>
							)}
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							size="small"
							mode="stroke"
							onClick={handleCancel}
							disabled={isDeleting}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
