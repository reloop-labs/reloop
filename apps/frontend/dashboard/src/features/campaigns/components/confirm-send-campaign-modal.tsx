"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";

interface ConfirmSendCampaignModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignName: string;
	audienceLabel: string;
	isSending: boolean;
	onConfirm: () => void;
}

/**
 * Confirmation step for sending a draft campaign from its detail page.
 * Sending is irreversible, so the header button and the `S` hotkey must
 * never broadcast directly.
 */
export function ConfirmSendCampaignModal({
	open,
	onOpenChange,
	campaignName,
	audienceLabel,
	isSending,
	onConfirm,
}: ConfirmSendCampaignModalProps) {
	return (
		<Modal.Root
			open={open}
			onOpenChange={(next) => {
				if (!isSending) onOpenChange(next);
			}}
		>
			<Modal.Content className="sm:max-w-[400px]" showClose={false}>
				<div className="p-5">
					<Modal.Title className="mb-2 text-label-md text-text-strong-950">
						Send campaign
					</Modal.Title>
					<Modal.Description className="text-paragraph-sm text-text-sub-600">
						Send{" "}
						<span className="font-medium text-text-strong-950">
							{campaignName}
						</span>{" "}
						to {audienceLabel}? This can't be undone once delivery begins.
					</Modal.Description>
				</div>

				<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
					<FancyButton.Root
						type="button"
						variant="basic"
						size="xsmall"
						onClick={() => onOpenChange(false)}
						disabled={isSending}
					>
						Cancel
						<KbdEsc />
					</FancyButton.Root>
					<FancyButton.Root
						type="button"
						variant="neutral"
						size="xsmall"
						className="min-w-[120px] justify-center font-medium"
						onClick={onConfirm}
						disabled={isSending}
						autoFocus
					>
						{isSending ? (
							<span className="flex items-center gap-1.5">
								<Spinner size={14} color="currentColor" />
								Sending...
							</span>
						) : (
							"Send now"
						)}
					</FancyButton.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}
