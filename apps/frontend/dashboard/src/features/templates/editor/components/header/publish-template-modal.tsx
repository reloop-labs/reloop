import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import * as Textarea from "@reloop/ui/textarea";
import { useState } from "react";
import { DiffViewer } from "../panels/history/diff-viewer";

interface PublishModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (description: string) => Promise<void>;
	isPublishing: boolean;
	latestPublished: any;
	currentHtml: string;
	currentSubject: string;
}

export function PublishTemplateModal({
	isOpen,
	onClose,
	onConfirm,
	isPublishing,
	latestPublished,
	currentHtml,
	currentSubject,
}: PublishModalProps) {
	const [description, setDescription] = useState("");
	const [showDiff, setShowDiff] = useState(false);

	return (
		<Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Modal.Content
				className={cn(
					"rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans transition-all duration-300",
					showDiff ? "h-[85vh] max-w-[80vw]" : "sm:max-w-[480px]",
				)}
				showClose={true}
			>
				<div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
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

						{/* Collapsible Visual Diff */}
						<div className="overflow-hidden rounded-xl border border-stroke-soft-200 dark:border-stroke-soft-100/40">
							<button
								type="button"
								onClick={() => setShowDiff((prev) => !prev)}
								className="flex w-full items-center justify-between bg-bg-weak-50 px-4 py-2.5 transition-colors hover:bg-bg-soft-200"
							>
								<div className="flex items-center gap-2">
									<Icon
										name="refresh-cw"
										className="size-4 text-text-sub-600"
									/>
									<span className="font-semibold text-label-xs text-text-strong-950">
										Review changes before publishing
									</span>
								</div>
								<Icon
									name={showDiff ? "chevron-up" : "chevron-down"}
									className="size-4 text-text-sub-600"
								/>
							</button>

							{showDiff && (
								<div className="h-[48vh] border-stroke-soft-100 border-t dark:border-stroke-soft-100/40">
									<DiffViewer
										oldHtml={latestPublished?.renderedHtml || ""}
										newHtml={currentHtml}
										oldSubject={latestPublished?.subject || ""}
										newSubject={currentSubject}
										viewportWidth="100%"
									/>
								</div>
							)}
						</div>
					</Modal.Body>

					<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
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
