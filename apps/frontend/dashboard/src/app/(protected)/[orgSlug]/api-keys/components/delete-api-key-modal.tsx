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

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	remaining: number | null;
	expiresAt: string | null;
	createdAt: string;
}

interface DeleteApiKeyModalProps {
	apiKeys: ApiKeyData[];
	onDeleteSuccess?: () => void;
}

export const DeleteApiKeyModal = ({ apiKeys, onDeleteSuccess }: DeleteApiKeyModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationName, setConfirmationName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isNameCopied, setIsNameCopied] = useState(false);
	const { activeOrganization } = useUserOrganization();
	const { mutate } = useSWRConfig();

	const apiKeyToDelete = apiKeys.find((apiKey) => apiKey.id === deleteId);

	const handleDelete = async () => {
		if (!apiKeyToDelete || !activeOrganization) return;

		const displayName =
			apiKeyToDelete.name ||
			apiKeyToDelete.start ||
			apiKeyToDelete.prefix ||
			"Unnamed";
		if (confirmationName !== displayName) {
			toast.error("Please enter the correct API key name to confirm deletion");
			return;
		}

		try {
			setIsDeleting(true);
			await axios.delete(`/api/api-key/v1/${apiKeyToDelete.id}`, {
				headers: { credentials: "include" },
			});

			toast.success("API key deleted successfully");
			await setDeleteId(null);
			setConfirmationName("");
			await mutate("/api/api-key/v1/?limit=100");

			// Call the success callback if provided (e.g., to navigate back to list)
			onDeleteSuccess?.();
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete API key"
				: "Failed to delete API key";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancel = () => {
		setDeleteId(null);
		setConfirmationName("");
	};

	const displayName =
		apiKeyToDelete?.name ||
		apiKeyToDelete?.start ||
		apiKeyToDelete?.prefix ||
		"Unnamed";

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => !open && setDeleteId(null)}
		>
			<Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
				<div className="border border-stroke-soft-100/50 rounded-2xl">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (confirmationName === displayName && !isDeleting) {
								handleDelete();
							}
						}}
					>
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex-1">
								<Modal.Title>Delete API Key</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-4">
							<div>
								<p className="text-text-sub-600 text-sm">
									Are you sure you want to delete this API key?
								</p>
								<p className="text-error-base text-sm font-medium">
									This action cannot be undone.
								</p>
							</div>

							<div className="space-y-2">
								<p className="text-text-strong-950 text-sm">
									Type{" "}
									<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-md bg-bg-weak-50 border border-stroke-soft-200 px-2 py-1 font-mono text-text-strong-950 text-xs">
										{displayName}
										<button
											type="button"
											onClick={async () => {
												try {
													await navigator.clipboard.writeText(displayName);
													setIsNameCopied(true);
													setTimeout(() => setIsNameCopied(false), 2000);
												} catch {
													toast.error("Failed to copy API key name");
												}
											}}
											className="text-text-sub-600 hover:text-text-strong-950 transition-colors"
										>
											<Icon
												name={isNameCopied ? "check" : "copy"}
												className={`h-3 w-3 ${isNameCopied ? "text-success-base" : ""}`}
											/>
										</button>
									</span>{" "}
									to confirm.
								</p>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											type="text"
											className="px-2"
											value={confirmationName}
											onChange={(e) => setConfirmationName(e.target.value)}
											placeholder="Enter API key name"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</Modal.Body>
						<Modal.Footer className="justify-end gap-2 border-stroke-soft-100/50 mt-4">
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
								disabled={confirmationName !== displayName || isDeleting}
							>
								{isDeleting ? (
									<>
										<Icon name="loader-2" className="h-4 w-4 animate-spin" />
										Deleting...
									</>
								) : (
									"Delete API Key"
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
