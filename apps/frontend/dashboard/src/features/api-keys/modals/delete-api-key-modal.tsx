import * as Button from "@reloop/ui/button";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";

export function DeleteApiKeyModal({
	apiKeys,
	onDeleteSuccess,
}: {
	apiKeys: ApiKeyData[];
	onDeleteSuccess?: () => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isDeleting, setIsDeleting] = useState(false);
	const invalidate = useInvalidateApiKeys();

	const apiKeyToDelete = apiKeys.find((k) => k.id === deleteId);
	const displayName =
		apiKeyToDelete?.name ||
		apiKeyToDelete?.start ||
		apiKeyToDelete?.prefix ||
		"Unnamed key";

	const handleDelete = async () => {
		if (!apiKeyToDelete) return;
		try {
			setIsDeleting(true);
			await axios.delete(`/api/api-key/v1/${apiKeyToDelete.id}`, {
				withCredentials: true,
			});
			toast.success("API key deleted successfully");
			void setDeleteId(null);
			await invalidate();
			onDeleteSuccess?.();
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
		"enter",
		(e) => {
			e.preventDefault();
			if (apiKeyToDelete && !isDeleting) {
				void handleDelete();
			}
		},
		{ enabled: !!deleteId },
	);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) void setDeleteId(null);
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				{/* Header */}
				<div className="pr-6">
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Delete API key
					</Modal.Title>
					<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
						Are you sure you want to delete this API key? This action cannot be
						undone.
					</p>
				</div>

				{/* Key Details Card */}
				<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="font-normal text-text-sub-600 text-xs">
							API key name
						</p>
						<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
							{displayName}
						</p>
					</div>
					<div>
						<p className="font-normal text-text-sub-600 text-xs">
							API key prefix
						</p>
						<div className="mt-1 flex items-center">
							<span className="font-medium font-mono text-sm">
								{apiKeyToDelete?.start || apiKeyToDelete?.prefix || "rl_..."}
							</span>
						</div>
					</div>
				</div>

				{/* Warning Banner */}
				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Warning:
					</span>{" "}
					Deleting this API key will permanently remove it along with all its
					permissions. Any services using this API key will stop working
					immediately.
				</div>

				{/* Footer Actions */}
				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => void setDeleteId(null)}
						disabled={isDeleting}
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="button"
						variant="primary"
						size="small"
						disabled={isDeleting}
						onClick={() => void handleDelete()}
					>
						{isDeleting ? (
							<>
								<Spinner size={14} color="currentColor" />
								Deleting...
							</>
						) : (
							"Delete API key"
						)}
					</Button.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
