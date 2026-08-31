"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { testCampaignRequest } from "../../campaigns-api";

interface CampaignTestEmailModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignId: string;
}

export function CampaignTestEmailModal({
	open,
	onOpenChange,
	campaignId,
}: CampaignTestEmailModalProps) {
	const [email, setEmail] = useState("");
	const [isSending, setIsSending] = useState(false);

	const handleSendTest = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim();
		if (!trimmed || !trimmed.includes("@")) {
			toast.error("Please enter a valid recipient email address.");
			return;
		}

		setIsSending(true);
		try {
			await testCampaignRequest(campaignId, trimmed);
			toast.success(`Test email sent to ${trimmed}`);
			onOpenChange(false);
			setEmail("");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to send test email";
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
					<form onSubmit={handleSendTest}>
						<Modal.Header>
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-stroke-soft-100/40">
									<Icon name="play" className="h-4 w-4 text-[#1868DF]" />
								</div>
								<div>
									<Modal.Title>Send Test Email</Modal.Title>
									<Modal.Description className="text-text-sub-600 text-xs">
										Preview how your broadcast appears in real inboxes.
									</Modal.Description>
								</div>
							</div>
						</Modal.Header>

						<Modal.Body className="space-y-3 py-4">
							<div className="space-y-1.5">
								<Label.Root htmlFor="test-recipient-email" className="text-xs">
									Recipient Email
								</Label.Root>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											id="test-recipient-email"
											type="email"
											placeholder="you@company.com"
											value={email}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setEmail(e.target.value)
											}
											autoFocus
											required
										/>
									</Input.Wrapper>
								</Input.Root>
								<p className="text-[11px] text-text-sub-600">
									All merge tags will be populated with preview sample data.
								</p>
							</div>
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
								type="submit"
								variant="neutral"
								size="small"
								disabled={isSending || !email.trim()}
								className="gap-1.5"
							>
								{isSending ? (
									<Spinner className="h-3.5 w-3.5" />
								) : (
									<Icon name="mail-send" className="h-3.5 w-3.5" />
								)}
								Send Test
							</Button.Root>
						</Modal.Footer>
					</form>
				</Modal.Content>
			</Modal.Portal>
		</Modal.Root>
	);
}
