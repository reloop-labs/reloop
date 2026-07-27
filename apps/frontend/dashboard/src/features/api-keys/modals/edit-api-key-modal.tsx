import * as Modal from "@reloop/ui/modal";
import { useQueryState } from "nuqs";
import { useRef } from "react";
import { EditApiKeyForm } from "../table/edit-api-key-form";
import type { ApiKeyData } from "../types";

export interface EditApiKeyModalProps {
	apiKeys: ApiKeyData[];
	onEditSuccess?: (updatedName: string) => void;
}

export function EditApiKeyModal({
	apiKeys,
	onEditSuccess,
}: EditApiKeyModalProps) {
	const [editId, setEditId] = useQueryState("edit");

	const targetApiKeyRef = useRef<ApiKeyData | null>(null);
	const currentApiKey = apiKeys.find((k) => k.id === editId);
	if (currentApiKey) {
		targetApiKeyRef.current = currentApiKey;
	}
	const apiKeyToEdit = currentApiKey || targetApiKeyRef.current;

	const handleClose = () => {
		void setEditId(null);
	};

	const open = !!editId && !!apiKeyToEdit;

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<div className="p-6">
					<div className="relative pr-10">
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Edit API key
						</Modal.Title>
					</div>

					<div className="mt-5">
						{apiKeyToEdit ? (
							<EditApiKeyForm
								apiKey={apiKeyToEdit}
								variant="modal"
								onCancel={handleClose}
								onSuccess={(updatedName) => {
									onEditSuccess?.(updatedName);
									handleClose();
								}}
							/>
						) : null}
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
