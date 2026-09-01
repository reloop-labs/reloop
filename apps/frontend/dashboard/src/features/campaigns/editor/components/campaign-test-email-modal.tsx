"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSessionQuery } from "#/features/auth/session-query";
import { testCampaignRequest } from "../../campaigns-api";
import { useCampaignEditorStore } from "../campaign-editor-store";

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
	const { data: session } = useSessionQuery();
	const { fromEmail, fromName, subject } = useCampaignEditorStore();
	const [email, setEmail] = useState("");
	const [isSending, setIsSending] = useState(false);

	// Pre-populate with current user's email when opened
	useEffect(() => {
		if (open && !email && session?.user?.email) {
			setEmail(session.user.email);
		}
	}, [open, session?.user?.email, email]);

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
				<Modal.Content className="rounded-2xl border border-stroke-soft-100/50 p-0.5 font-sans sm:max-w-[440px]">
					<div className="rounded-2xl border border-stroke-soft-100/50 bg-bg-white-0 dark:bg-bg-soft-200">
						<Modal.Header className="before:border-stroke-soft-200/50 flex items-center gap-2.5">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600 dark:bg-white/5">
								<Icon name="mail-send" className="h-4 w-4" />
							</div>
							<div className="flex-1">
								<Modal.Title className="text-label-md font-semibold text-text-strong-950">
									Send test email
								</Modal.Title>
								<Modal.Description className="text-paragraph-xs text-text-sub-600">
									Preview how your broadcast appears in real inboxes.
								</Modal.Description>
							</div>
						</Modal.Header>

						<form onSubmit={handleSendTest}>
							<Modal.Body className="space-y-3.5 py-4">
								{/* Summary preview of sender info */}
								{(fromEmail || subject) && (
									<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-2.5 text-label-xs space-y-1 dark:border-stroke-soft-100/40 dark:bg-bg-sub-300/20">
										{fromEmail && (
											<div className="flex items-center justify-between gap-2">
												<span className="text-text-sub-600">From:</span>
												<span className="font-medium text-text-strong-950 truncate max-w-[240px]">
													{fromName ? `${fromName} <${fromEmail}>` : fromEmail}
												</span>
											</div>
										)}
										{subject && (
											<div className="flex items-center justify-between gap-2">
												<span className="text-text-sub-600">Subject:</span>
												<span className="font-medium text-text-strong-950 truncate max-w-[240px]">
													{subject}
												</span>
											</div>
										)}
									</div>
								)}

								<div className="space-y-1.5">
									<Label.Root
										htmlFor="test-recipient-email"
										className="text-label-xs font-medium text-text-strong-950"
									>
										Recipient email
										<Label.Asterisk />
									</Label.Root>
									<Input.Root size="small" className="rounded-xl">
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
									<p className="text-[11px] text-text-soft-400">
										All merge tags will be populated with preview sample data.
									</p>
								</div>
							</Modal.Body>

							<Modal.Footer className="flex items-center justify-end gap-2.5 border-stroke-soft-200 border-t pt-3 dark:border-stroke-soft-100/40">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={() => onOpenChange(false)}
									disabled={isSending}
								>
									Cancel
									<KbdEsc />
								</Button.Root>
								<FancyButton.Root
									type="submit"
									variant="blue"
									size="xsmall"
									disabled={isSending || !email.trim()}
								>
									{isSending ? (
										<>
											<Spinner size={13} />
											Sending...
										</>
									) : (
										"Send test"
									)}
								</FancyButton.Root>
							</Modal.Footer>
						</form>
					</div>
				</Modal.Content>
			</Modal.Portal>
		</Modal.Root>
	);
}
