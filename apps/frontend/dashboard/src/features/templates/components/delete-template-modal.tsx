import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";

interface DeleteTemplateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	templateName: string;
}

export const DeleteTemplateModal = ({
	isOpen,
	onClose,
	onConfirm,
	templateName,
}: DeleteTemplateModalProps) => {
	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans sm:max-w-[400px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="trash" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Delete {templateName}</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-2">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							Are you sure you want to delete this template? This action cannot
							be undone.
						</p>
					</Modal.Body>
					<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onClose}
						>
							Cancel
							<KbdEsc />
						</Button.Root>
						<Button.Root
							type="button"
							variant="error"
							mode="filled"
							size="xsmall"
							onClick={() => {
								onConfirm();
								onClose();
							}}
						>
							Delete
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
