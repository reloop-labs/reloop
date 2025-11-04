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
}

export const DeleteApiKeyModal = ({ apiKeys }: DeleteApiKeyModalProps) => {
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
			setDeleteId(null);
			setConfirmationName("");
			mutate("/api/api-key/v1/?limit=100");
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
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (confirmationName === displayName && !isDeleting) {
							handleDelete();
						}
					}}
				>
					<Modal.Body>
						<h2 className="mb-2 font-semibold text-gray-900 text-xl">
							Delete API Key
						</h2>
						<p className="text-gray-600 text-sm">
							Are you sure you want to delete this API key?
						</p>
						<p className="mb-4 font-medium text-red-600 text-sm">
							This can not be undone.
						</p>

						<div className="mb-4">
							<p className="mb-2 text-gray-700 text-sm">
								Type{" "}
								<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-md bg-gray-100 px-2 py-1 font-mono text-gray-800 text-xs">
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
										className="ml-1 text-gray-500 hover:text-gray-700"
									>
										<Icon
											name={isNameCopied ? "check" : "copy"}
											className={`h-3 w-3 ${isNameCopied ? "text-green-600" : ""}`}
										/>
									</button>
								</span>{" "}
								to confirm.
							</p>
							<Input.Root>
								<Input.Wrapper size="xsmall">
									<Input.Input
										type="text"
										value={confirmationName}
										onChange={(e) => setConfirmationName(e.target.value)}
										placeholder="Enter API key name"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</Modal.Body>
					<Modal.Footer className="flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							disabled={isDeleting}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							type="submit"
							variant="error"
							size="small"
							disabled={confirmationName !== displayName || isDeleting}
						>
							{isDeleting ? (
								<>
									<Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									Delete API Key
									<Icon name="undo" className="h-3 w-3 scale-y-[-1]" />
								</>
							)}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
