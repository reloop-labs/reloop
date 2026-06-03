"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { ChatwootLoader } from "@reloop/ui/chatwoot-loader";
import { useEffect } from "react";

/** Identifies the logged-in Reloop user in Chatwoot (requires UserOrganizationProvider). */
export function ChatwootUserSync() {
	const { user, activeOrganization } = useUserOrganization();

	const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL?.replace(
		/\/+$/,
		"",
	);
	const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim();
	const isConfigured = Boolean(baseUrl && websiteToken);

	useEffect(() => {
		if (!isConfigured) return;

		// Reset Chatwoot session when user logs out
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
					activeOrganizationId: activeOrganization?.id ?? undefined,
					activeOrganizationSlug: activeOrganization?.slug ?? undefined,
					activeOrganizationName: activeOrganization?.name ?? undefined,
				},
			});
		};

		// Try immediately in case the SDK is already ready
		identify();

		// Also listen for the SDK ready event in case it loads later
		window.addEventListener("chatwoot:ready", identify);

		return () => {
			window.removeEventListener("chatwoot:ready", identify);
		};
	}, [isConfigured, user, activeOrganization]);

	return null;
}

export { ChatwootLoader };

/** @deprecated Use ChatwootLoader + ChatwootUserSync instead */
export function ChatwootWidget() {
	return (
		<>
			<ChatwootLoader />
			<ChatwootUserSync />
		</>
	);
}
