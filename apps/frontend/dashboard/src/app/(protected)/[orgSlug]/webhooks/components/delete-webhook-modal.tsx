"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
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
	const [deletedWebhookName, setDeletedWebhookName] =
		useQueryState("deleted_webhook");
	const [lastDeletedWebhookName, setLastDeletedWebhookName] = useState<
		string | null
	>(deletedWebhookName);

	useEffect(() => {
		if (deletedWebhookName) {
			setLastDeletedWebhookName(deletedWebhookName);
		}
	}, [deletedWebhookName]);

	const [confirmationName, setConfirmationName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isValidationPhraseCopied, setIsValidationPhraseCopied] =
		useState(false);
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
			setDeletedWebhookName(validationPhrase);
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
		setDeletedWebhookName(null);
		setConfirmationName("");
	};

	const showSuccess =
		!!deletedWebhookName || (!!lastDeletedWebhookName && !deleteId);
	const displayWebhookName = deletedWebhookName || lastDeletedWebhookName;

	return (
		<Modal.Root
			open={!!deleteId || !!deletedWebhookName}
			onOpenChange={(open) => !open && handleCancel()}
		>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md overflow-hidden p-0 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-md">
				{showSuccess ? (
					<div className="flex flex-col items-center justify-center p-8 text-center sm:p-10">
						<div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-base text-text-white-0 dark:bg-success-base/20 dark:text-success-base">
							<Icon name="check" className="h-7 w-7" />
						</div>
						<h2 className="mb-3 font-medium text-text-strong-950 text-title-h5">
							Webhook deleted
						</h2>
						<p className="mb-8 text-sm text-text-sub-600 leading-relaxed sm:max-w-[320px]">
							<span className="font-medium text-text-strong-950">
								{displayWebhookName}
							</span>{" "}
							and all its delivery history have been permanently removed.
						</p>
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="medium"
							onClick={handleCancel}
							className="w-full"
						>
							Back to webhooks
						</Button.Root>
					</div>
				) : (
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
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-error-base/10">
								<Icon name="trash" className="h-4 w-4 text-error-base" />
							</div>

							<h2 className="font-medium text-text-strong-950 text-title-h5">
								Delete webhook?
							</h2>
							<p className="mb-6 text-sm text-text-sub-600 leading-relaxed">
								This will permanently delete the endpoint and all its delivery
								history. This action cannot be undone.
							</p>

							{/* Webhook Card */}
							<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-base/10 text-error-base">
									<Icon name="webhook" className="h-5 w-5" />
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
									<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 text-xs dark:bg-bg-strong-200">
										{validationPhrase}
										<button
											type="button"
											onClick={async () => {
												try {
													await navigator.clipboard.writeText(validationPhrase);
													setIsValidationPhraseCopied(true);
													setTimeout(
														() => setIsValidationPhraseCopied(false),
														2000,
													);
												} catch {
													toast.error("Failed to copy webhook name");
												}
											}}
											className="text-text-sub-600 transition-colors hover:text-text-strong-950"
										>
											<Icon
												name={isValidationPhraseCopied ? "check" : "copy"}
												className={`h-3 w-3 ${isValidationPhraseCopied ? "text-success-base" : ""}`}
											/>
										</button>
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

						<div className="flex flex-col-reverse justify-end gap-3 px-6 pb-6 sm:flex-row sm:items-center">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={handleCancel}
								disabled={isDeleting}
							>
								Cancel
								<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
							</Button.Root>
							<Button.Root
								type="submit"
								variant="error"
								size="xsmall"
								disabled={confirmationName !== validationPhrase || isDeleting}
							>
								{isDeleting ? (
									<>
										<Icon name="loader-2" className="h-4 w-4 animate-spin" />
										Deleting...
									</>
								) : (
									"Delete webhook"
								)}
							</Button.Root>
						</div>
					</form>
				)}
			</Modal.Content>
		</Modal.Root>
	);
};
