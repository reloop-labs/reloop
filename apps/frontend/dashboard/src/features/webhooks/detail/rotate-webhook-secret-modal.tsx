import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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
	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!isRotating) onConfirm();
		},
		{ enableOnFormTags: true, enabled: isOpen && !isRotating },
	);

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				showClose={false}
				className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md overflow-hidden p-0 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-md"
			>
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
						<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="neutral"
						size="small"
						onClick={onConfirm}
						disabled={isRotating}
						className="gap-1.5 rounded-xl"
					>
						{isRotating ? (
							<>
								<Icon name="loader-2" className="h-4 w-4 animate-spin" />
								Rotating...
							</>
						) : (
							<>
								Rotate secret
								<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
							</>
						)}
					</FancyButton.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}
