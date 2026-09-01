"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { sendCampaignRequest } from "../../campaigns-api";
import { useCampaignEditorStore } from "../campaign-editor-store";

interface CampaignSendModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignId: string;
	onSent?: () => void;
}

export function CampaignSendModal({
	open,
	onOpenChange,
	campaignId,
	onSent,
}: CampaignSendModalProps) {
	const router = useRouter();
	const { name, subject, audienceTargetName, fromName, fromEmail } =
		useCampaignEditorStore();
	const [isSending, setIsSending] = useState(false);

	const handleSend = async () => {
		setIsSending(true);
		try {
			await sendCampaignRequest(campaignId);
			toast.success(`Campaign "${name}" has been broadcasted!`);
			onOpenChange(false);
			onSent?.();
			router.push(`/campaigns/${campaignId}`);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to broadcast campaign";
			toast.error(message);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Portal>
				<Modal.Overlay />
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-stroke-soft-100/40">
								<Icon name="mail-send" className="h-4 w-4 text-[#1868DF]" />
							</div>
							<div>
								<Modal.Title>Broadcast Campaign Now?</Modal.Title>
								<Modal.Description className="text-text-sub-600 text-xs">
									Your email will be sent immediately to all targeted recipients.
								</Modal.Description>
							</div>
						</div>
					</Modal.Header>

					<Modal.Body className="space-y-3 py-4">
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3 text-xs space-y-2 dark:border-stroke-soft-100/40">
							<div className="flex justify-between">
								<span className="text-text-sub-600">Campaign Name:</span>
								<span className="font-medium text-text-strong-950">{name}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-sub-600">Subject Line:</span>
								<span className="font-medium text-text-strong-950 truncate max-w-[200px]">
									{subject || "(No subject)"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-sub-600">From:</span>
								<span className="font-medium text-text-strong-950">
									{fromName} &lt;{fromEmail}&gt;
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-sub-600">Audience:</span>
								<span className="font-semibold text-[#1868DF] dark:text-blue-400">
									{audienceTargetName}
								</span>
							</div>
						</div>
						<p className="text-[11px] text-text-sub-600">
							This action cannot be undone once delivery begins.
						</p>
					</Modal.Body>

					<Modal.Footer className="flex items-center justify-end gap-2 border-stroke-soft-200 border-t pt-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => onOpenChange(false)}
							disabled={isSending}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							size="small"
							onClick={handleSend}
							disabled={isSending}
							className="gap-1.5 bg-[#1868DF] text-white hover:bg-[#1557bf]"
						>
							{isSending ? (
								<Spinner className="h-3.5 w-3.5" />
							) : (
								<Icon name="mail-send" className="h-3.5 w-3.5" />
							)}
							Send Now
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Portal>
		</Modal.Root>
	);
}
