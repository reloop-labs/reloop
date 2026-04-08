"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface WebhookData {
	id: string;
	name: string;
	url: string;
	status: "active" | "paused" | "disabled" | "failed";
	successCount: number;
	failureCount: number;
	lastTriggeredAt: string | null;
	createdAt: string;
}

interface DeleteWebhookModalProps {
	webhook?: WebhookData | null;
	onSuccess?: () => void;
}

export const DeleteWebhookModal = ({
	webhook,
	onSuccess,
}: DeleteWebhookModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationName, setConfirmationName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const { activeOrganization } = useUserOrganization();
	const { mutate } = useSWRConfig();

	const webhookToDelete = webhook?.id === deleteId ? webhook : null;
	const validationPhrase = webhookToDelete?.name || webhookToDelete?.url || "";

	const handleDelete = async () => {
		if (!webhookToDelete || !activeOrganization) return;

		if (confirmationName !== validationPhrase) {
			toast.error("Please enter the correct webhook name to confirm deletion");
			return;
		}

		try {
			setIsDeleting(true);
			await axios.delete(`/api/webhook/v1/${webhookToDelete.id}`, {
				headers: { credentials: "include" },
			});

			toast.success("Webhook deleted successfully");
			setDeleteId(null);
			setConfirmationName("");
			mutate(
				`/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`,
			);
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete webhook"
				: "Failed to delete webhook";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancel = () => {
		setDeleteId(null);
		setConfirmationName("");
	};

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => !open && handleCancel()}
		>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md overflow-hidden p-0 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-md">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (confirmationName === validationPhrase && !isDeleting) {
							handleDelete();
						}
					}}
				>
					<div className="p-6">
						{/* Header Icon */}
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-base/10">
							<Icon name="trash" className="h-6 w-6 text-error-base" />
						</div>

						<h2 className="mb-2 font-medium text-text-strong-950 text-title-h5">
							Delete webhook?
						</h2>
						<p className="mb-6 text-sm text-text-sub-600 leading-relaxed">
							This will permanently delete the endpoint and all its delivery
							history. This action cannot be undone.
						</p>

						{/* Webhook Card */}
						<div className="mb-6 flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-base/10 text-error-base">
								<Icon name="database" className="h-5 w-5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-sm text-text-strong-950">
									{webhookToDelete?.name || webhookToDelete?.url}
								</p>
								<p className="mt-0.5 truncate font-mono text-text-sub-600 text-xs">
									{webhookToDelete?.url}
								</p>
							</div>
						</div>

						{/* Confirmation Input */}
						<div className="mb-2">
							<p className="mb-2 text-sm text-text-sub-600">
								Type{" "}
								<span className="rounded bg-bg-strong-200/50 px-1.5 py-0.5 font-mono font-semibold text-text-strong-950 text-xs dark:bg-bg-strong-200">
									{validationPhrase}
								</span>{" "}
								to confirm
							</p>
							<Input.Root size="small">
								<Input.Wrapper>
									<Input.Input
										type="text"
										value={confirmationName}
										onChange={(e) => setConfirmationName(e.target.value)}
										placeholder="Type the webhook name..."
										className="font-mono text-sm"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>

					<div className="flex flex-col-reverse gap-3 px-6 pb-6 sm:flex-row sm:justify-between">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							disabled={isDeleting}
							className="w-full sm:w-auto"
						>
							Cancel
							<Kbd.Root className="ml-2 bg-bg-weak-50 text-xs">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							type="submit"
							variant="neutral"
							mode="stroke"
							size="small"
							disabled={confirmationName !== validationPhrase || isDeleting}
							className="w-full focus:ring-error-base sm:w-auto"
						>
							{isDeleting ? (
								<>
									<Icon
										name="loader-2"
										className="mr-2 h-4 w-4 animate-spin text-text-sub-600"
									/>
									Deleting...
								</>
							) : (
								<>
									<Icon
										name="trash"
										className="mr-1.5 h-4 w-4 text-text-sub-600"
									/>
									Delete webhook
								</>
							)}
						</Button.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
