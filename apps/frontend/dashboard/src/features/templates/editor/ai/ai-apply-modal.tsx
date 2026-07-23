import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";

export function AiApplyModal({
	open,
	onOpenChange,
	onApply,
	onDismiss,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onApply: () => void;
	onDismiss: () => void;
}) {
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans sm:max-w-[400px]"
				showClose
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="sparkling" className="h-4 w-4 text-feature-base" />
						</div>
						<div className="flex-1">
							<Modal.Title>Apply to canvas?</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-2">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							Your template already has content. Applying will replace it with
							the AI result. You can undo immediately after.
						</p>
					</Modal.Body>
					<Modal.Footer className="mt-4 flex items-center justify-end gap-2 border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => {
								onDismiss();
								onOpenChange(false);
							}}
						>
							Keep current
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="xsmall"
							onClick={() => {
								onApply();
								onOpenChange(false);
							}}
							className="gap-1.5"
						>
							<FancyButton.Icon as={Icon} name="check" />
							Replace
						</FancyButton.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
