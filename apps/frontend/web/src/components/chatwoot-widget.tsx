"use client";

import { authClient } from "@reloop/auth/client";
import {
	CHATWOOT_BASE_URL,
	CHATWOOT_WEBSITE_TOKEN,
	ChatwootLoader,
} from "@reloop/ui/chatwoot-loader";
import { useEffect } from "react";

/** Identifies the logged-in Reloop user in Chatwoot on the marketing site. */
export function ChatwootUserSync() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	const baseUrl = CHATWOOT_BASE_URL.replace(/\/+$/, "");
	const websiteToken = CHATWOOT_WEBSITE_TOKEN.trim();
	const isConfigured = Boolean(baseUrl && websiteToken);

	useEffect(() => {
		if (!isConfigured) return;

		if (!user?.email) {
			window.$chatwoot?.reset();
			return;
		}

		const identify = () => {
			if (!window.$chatwoot?.setUser) return;

			const identifier = user.id?.toString() || user.email;

			window.$chatwoot.setUser(identifier, {
				email: user.email,
				name: user.name ?? undefined,
				custom_attributes: {
					activeOrganizationId: user.activeOrganizationId ?? undefined,
				},
			});
		};

		identify();
		window.addEventListener("chatwoot:ready", identify);

		return () => {
			window.removeEventListener("chatwoot:ready", identify);
		};
	}, [isConfigured, user]);

	return null;
}

export { ChatwootLoader };
