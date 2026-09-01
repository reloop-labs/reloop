import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { X } from "lucide-react";

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
				className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-stroke-soft-100/50 bg-bg-white-0 p-0.5 shadow-regular-md sm:max-w-[420px] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
				showClose={false}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{/* Header */}
					<div className="relative flex items-center gap-3.5 py-4 pr-14 pl-5 before:absolute before:inset-x-0 before:bottom-0 before:border-stroke-soft-200/50 before:border-b dark:before:border-stroke-soft-100/40">
						<div className="flex items-center justify-center">
							<Icon name="trash" className="h-4 w-4 text-error-base" />
						</div>
						<div className="flex-1">
							<Modal.Title className="font-medium text-label-sm text-text-strong-950 dark:text-white">
								Delete {"{{{"} {variableName} {"}}}"}
							</Modal.Title>
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="absolute top-4 right-4 z-20 flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] dark:border-stroke-soft-100/40 dark:bg-transparent dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>

					{/* Body */}
					<div className="space-y-2 p-5">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed dark:text-white/70">
							Are you sure you want to delete the variable <br />
							<code className="rounded bg-bg-soft-200 px-1.5 py-0.5 font-mono text-error-base text-xs dark:bg-bg-soft-200">
								{"{{{"} {variableName} {"}}}"}
							</code>
							? This action cannot be undone.
						</p>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-3 border-stroke-soft-100/50 border-t px-5 py-4 dark:border-stroke-soft-100/40">
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
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
