import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";

interface RotateWebhookSecretModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isRotating: boolean;
}

export function RotateWebhookSecretModal({
	isOpen,
	onClose,
	onConfirm,
	isRotating,
}: RotateWebhookSecretModalProps) {
	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md overflow-hidden p-0 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-md">
				<Modal.Body className="p-6">
					<div className="flex items-start gap-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
							<Icon name="rotate-cw" className="h-5 w-5" />
						</div>
						<div className="space-y-1.5">
							<Modal.Title className="font-semibold text-lg text-text-strong-950 leading-6">
								Rotate webhook secret
							</Modal.Title>
							<p className="text-sm text-text-sub-600 leading-relaxed">
								Are you sure you want to rotate the signing secret? Current
								integrations will fail verification until they use the new
								secret.
							</p>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex items-center justify-end gap-3 border-stroke-soft-100 border-t bg-bg-weak-50/50 px-6 py-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						onClick={onClose}
						disabled={isRotating}
						className="gap-1.5 rounded-xl"
					>
						Cancel
						<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
							Esc
						</span>
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						onClick={onConfirm}
						disabled={isRotating}
						className="gap-2 rounded-xl"
					>
						{isRotating ? (
							<>
								<Icon name="loader-2" className="h-4 w-4 animate-spin" />
								Rotating...
							</>
						) : (
							<>
								Rotate secret
								<Icon name="rotate-cw" className="h-4 w-4" />
							</>
						)}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}
