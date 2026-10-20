"use client";

import { adminErrorMessage, adminPost } from "@fe/console/lib/admin-api";
import * as Button from "@reloop/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type NotifyOwnerResponse = {
	ownerEmail: string;
	conversationId: string;
	supportMessageSent: boolean;
	emailQueued: boolean;
};

/**
 * One click: emails the org owner that this dedicated IP is now theirs and
 * posts the same notice in their support chat.
 */
export function NotifyIpOwnerButton({ sendingIpId }: { sendingIpId: string }) {
	const [isSending, setIsSending] = useState(false);

	const notify = async () => {
		setIsSending(true);
		try {
			const result = await adminPost<NotifyOwnerResponse>(
				`/sending-ips/${sendingIpId}/notify-owner`,
			);
			if (result.emailQueued) {
				toast.success(
					`Owner notified: email and support message sent to ${result.ownerEmail}`,
				);
			} else {
				toast.warning(
					`Support message sent to ${result.ownerEmail}, but the email couldn't be queued`,
				);
			}
		} catch (error) {
			toast.error(adminErrorMessage(error));
		} finally {
			setIsSending(false);
		}
	};

	return (
		<Button.Root
			size="xsmall"
			variant="neutral"
			mode="stroke"
			disabled={isSending}
			onClick={() => void notify()}
		>
			{isSending ? "Notifying…" : "Notify owner"}
		</Button.Root>
	);
}
