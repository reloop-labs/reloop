"use client";

import { usePlatformAdmin } from "@fe/console/providers/platform-admin-provider";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { toast } from "sonner";

export function ImpersonationBanner() {
	const { isImpersonating } = usePlatformAdmin();

	if (!isImpersonating) return null;

	return (
		<div className="flex items-center justify-between gap-3 bg-warning-base px-4 py-2 text-label-sm text-static-black">
			<p>
				You are impersonating another user. Actions may affect their account.
			</p>
			<Button.Root
				size="xsmall"
				variant="neutral"
				mode="filled"
				onClick={async () => {
					const { error } = await authClient.admin.stopImpersonating();
					if (error) {
						toast.error(error.message || "Failed to stop impersonation");
						return;
					}
					toast.success("Stopped impersonation");
					window.location.href = "/console";
				}}
			>
				Stop impersonating
			</Button.Root>
		</div>
	);
}
