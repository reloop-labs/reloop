import type { ApiKeyData } from "../types";
import { EditApiKeyForm } from "./edit-api-key-form";

interface EditApiKeyRowPanelProps {
	apiKey: ApiKeyData;
	onClose: () => void;
	onSuccess?: (updatedName: string) => void;
}

export function EditApiKeyRowPanel({
	apiKey,
	onClose,
	onSuccess,
}: EditApiKeyRowPanelProps) {
	return (
		<div
			className="border-stroke-soft-100 border-t bg-bg-weak-50/40 px-4 py-4 dark:bg-bg-weak-50/20"
			onClick={(e) => e.stopPropagation()}
		>
			<EditApiKeyForm
				apiKey={apiKey}
				variant="inline"
				onCancel={onClose}
				onSuccess={(updatedName) => {
					onSuccess?.(updatedName);
					onClose();
				}}
			/>
		</div>
	);
}
