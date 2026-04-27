"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
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

export const DeleteApiKeyModal = ({
	apiKeys,
	onDeleteSuccess,
}: DeleteApiKeyModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isValidationPhraseCopied, setIsValidationPhraseCopied] =
		useState(false);

	const { activeOrganization } = useUserOrganization();
	const { mutate } = useSWRConfig();
	const pathname = usePathname();
	const router = useRouter();

	const apiKeyToDelete = apiKeys.find((apiKey) => apiKey.id === deleteId);
	const displayName =
		apiKeyToDelete?.name ||
		apiKeyToDelete?.start ||
		apiKeyToDelete?.prefix ||
		"Unnamed";

	const isOnDetailPage = pathname?.includes(`/api-keys/${deleteId}`);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (confirmationText === displayName && !isDeleting) {
				handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	const handleDelete = async () => {
		if (!apiKeyToDelete || !activeOrganization) return;

		try {
			setIsDeleting(true);
			await axios.delete(`/api/api-key/v1/${apiKeyToDelete.id}`, {
				withCredentials: true,
			});

			toast.success("API key deleted successfully");
			setDeleteId(null);
			setConfirmationText("");
			await mutate(
				(key) => typeof key === "string" && key.startsWith("/api/api-key/v1/"),
			);

			onDeleteSuccess?.();

			if (isOnDetailPage) {
				setTimeout(() => {
					router.push("/api-keys");
				}, 100);
			}
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
		setConfirmationText("");
	};

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					setDeleteId(null);
					setConfirmationText("");
				}
			}}
		>
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-20 border border-stroke-soft-100/50 bg-bg-white-0">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (confirmationText === displayName && !isDeleting) {
								handleDelete();
							}
						}}
					>
						<div className="p-6">
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-error-base/10">
								<Icon name="trash" className="h-4 w-4 text-error-base" />
							</div>

							<h2 className="font-medium text-text-strong-950 text-title-h5">
								Delete API key?
							</h2>
							<p className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
								This will permanently delete the API key. Any applications or
								services using this key will no longer be able to authenticate.
								This action cannot be undone.
							</p>

							{/* API Key Card */}
							<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-base/10 text-error-base">
									<Icon name="key-new" className="h-5 w-5" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm text-text-strong-950">
										{displayName}
									</p>
									<p className="mt-0.5 truncate font-semibold text-text-sub-600 text-xs">
										{apiKeyToDelete?.start || "rl_"}...
									</p>
								</div>
							</div>

							{/* Confirmation Input */}
							<div className="mb-2">
								<p className="mb-2 text-sm text-text-sub-600">
									Type{" "}
									<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-[6px] border border-stroke-soft-100 bg-bg-weak-50/50 px-1.5 py-0.5 font-medium text-text-strong-950 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-strong-200">
										{displayName}
										<button
											type="button"
											onClick={async () => {
												try {
													if (displayName) {
														await navigator.clipboard.writeText(displayName);
														setIsValidationPhraseCopied(true);
														setTimeout(
															() => setIsValidationPhraseCopied(false),
															2000,
														);
													}
												} catch {
													toast.error("Failed to copy API key name");
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
								<Input.Root size="small" className="rounded-[10px]">
									<Input.Wrapper>
										<Input.Input
											type="text"
											value={confirmationText}
											onChange={(e) => setConfirmationText(e.target.value)}
											placeholder={displayName}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>

						<div className="flex flex-col-reverse justify-end gap-2 px-6 pb-6 sm:flex-row sm:items-center">
							<Button.Root
								variant="neutral"
								mode="stroke"
								onClick={handleCancel}
								disabled={isDeleting}
								className="gap-1.5"
							>
								Cancel
								<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
									Esc
								</span>
							</Button.Root>
							<Button.Root
								type="submit"
								variant="error"
								disabled={isDeleting || confirmationText !== displayName}
							>
								{isDeleting ? (
									"Deleting..."
								) : (
									<>
										Delete API key
										<span className="inline-flex items-center gap-0.5">
											<Icon
												name="command"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
											<Icon
												name="enter"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
										</span>
									</>
								)}
							</Button.Root>
						</div>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
