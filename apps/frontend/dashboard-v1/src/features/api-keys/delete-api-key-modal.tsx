import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateApiKeys } from "./use-api-keys-query";
import type { ApiKeyData } from "./types";

export function DeleteApiKeyModal({ apiKeys }: { apiKeys: ApiKeyData[] }) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const invalidate = useInvalidateApiKeys();

	const apiKeyToDelete = apiKeys.find((k) => k.id === deleteId);
	const displayName =
		apiKeyToDelete?.name ||
		apiKeyToDelete?.start ||
		apiKeyToDelete?.prefix ||
		"Unnamed";

	const handleDelete = async () => {
		if (!apiKeyToDelete) return;
		try {
			setIsDeleting(true);
			await axios.delete(`/api/api-key/v1/${apiKeyToDelete.id}`, {
				withCredentials: true,
			});
			toast.success("API key deleted successfully");
			void setDeleteId(null);
			setConfirmationText("");
			await invalidate();
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete API key"
				: "Failed to delete API key";
			toast.error(message);
		} finally {
			setIsDeleting(false);
		}
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (confirmationText === displayName && !isDeleting) {
				void handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	useEffect(() => {
		if (!deleteId) {
			const t = setTimeout(() => setConfirmationText(""), 300);
			return () => clearTimeout(t);
		}
	}, [deleteId]);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) void setDeleteId(null);
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[420px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<div className="px-5 pt-5 pb-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-base/10 text-error-base">
						<Icon name="trash" className="h-5 w-5" />
					</div>
					<Modal.Title className="mt-3 font-semibold text-label-md text-text-strong-950">
						Delete API key
					</Modal.Title>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						This cannot be undone. Type{" "}
						<span className="font-medium text-text-strong-950">
							{displayName}
						</span>{" "}
						to confirm.
					</p>
					<div className="mt-4">
						<Input.Root size="small">
							<Input.Wrapper>
								<Input.Input
									value={confirmationText}
									onChange={(e) => setConfirmationText(e.target.value)}
									placeholder={displayName}
									autoFocus
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
				<div className="flex justify-end gap-2 border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => void setDeleteId(null)}
						disabled={isDeleting}
					>
						Cancel
					</Button.Root>
					<Button.Root
						variant="error"
						size="xsmall"
						disabled={confirmationText !== displayName || isDeleting}
						onClick={() => void handleDelete()}
					>
						{isDeleting ? (
							<>
								<Spinner size={12} color="currentColor" />
								Deleting...
							</>
						) : (
							"Delete key"
						)}
					</Button.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
