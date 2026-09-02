import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import * as Textarea from "@reloop/ui/textarea";
import { useState } from "react";

interface PublishModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (description: string) => Promise<void>;
	isPublishing: boolean;
	latestPublished?: any;
	currentHtml?: string;
	currentSubject?: string;
}

export function PublishTemplateModal({
	isOpen,
	onClose,
	onConfirm,
	isPublishing,
}: PublishModalProps) {
	const [description, setDescription] = useState("");

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className="sm:max-w-[480px] rounded-2xl border border-stroke-soft-100 p-0.5 font-sans transition-all duration-300 dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					<Modal.Header className="before:border-stroke-soft-100 dark:before:border-stroke-soft-100/40">
						<div className="flex items-center justify-center">
							<Icon name="info-outline" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Publish Template Version</Modal.Title>
						</div>
					</Modal.Header>

					<Modal.Body className="flex-1 space-y-4 overflow-y-auto">
						<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
							This will create a new major production version and set it as the
							active version for transactional sends.
						</p>

						<div className="space-y-1.5">
							<span className="mb-1.5 block font-semibold text-text-strong-950 text-xs">
								Release Description / Changelog
							</span>
							<Textarea.Root
								simple
								placeholder="Describe what changed in this version (e.g. fixed layout issues, added welcome banner)..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="h-24 text-xs"
							/>
						</div>
					</Modal.Body>

					<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100 dark:border-stroke-soft-100/40">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onClose}
							disabled={isPublishing}
						>
							Cancel
							<KbdEsc />
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="xsmall"
							onClick={() => onConfirm(description)}
							disabled={isPublishing}
						>
							{isPublishing ? "Publishing..." : "Confirm & Publish"}
						</FancyButton.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
