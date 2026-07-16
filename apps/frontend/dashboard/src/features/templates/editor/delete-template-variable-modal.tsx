import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";

interface DeleteTemplateVariableModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	variableName: string;
	isSubmitting?: boolean;
}

export const DeleteTemplateVariableModal = ({
	isOpen,
	onClose,
	onConfirm,
	variableName,
	isSubmitting = false,
}: DeleteTemplateVariableModalProps) => {
	const handleConfirm = async () => {
		await onConfirm();
		onClose();
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans sm:max-w-[400px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="trash" className="h-4 w-4 text-error-base" />
						</div>
						<div className="flex-1">
							<Modal.Title className="font-medium">
								Delete {"{{{"} {variableName} {"}}}"}
							</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-2">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							Are you sure you want to delete the variable <br />
							<code className="rounded bg-bg-soft-200 px-1.5 py-0.5 font-mono text-error-base text-xs dark:bg-zinc-800">
								{"{{{"} {variableName} {"}}}"}
							</code>
							? This action cannot be undone.
						</p>
					</Modal.Body>
					<Modal.Footer className="flex items-center justify-end gap-3 border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Cancel
							<KbdEsc />
						</Button.Root>
						<Button.Root
							type="button"
							variant="error"
							mode="filled"
							size="xsmall"
							onClick={handleConfirm}
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Spinner size={14} color="currentColor" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
