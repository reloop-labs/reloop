"use client";

import { useEffect } from "react";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { ChatwootLoader } from "@reloop/ui/chatwoot-loader";

/** Identifies the logged-in Reloop user in Chatwoot (requires UserOrganizationProvider). */
export function ChatwootUserSync() {
	const { user, activeOrganization } = useUserOrganization();

	const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL?.replace(/\/+$/, "");
	const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim();
	const isConfigured = Boolean(baseUrl && websiteToken);

	useEffect(() => {
		if (!isConfigured || !user?.email) return;
		if (!window.$chatwoot?.setUser) return;

		const identifier =
			(user as { id?: string | null }).id?.toString() || user.email;

		window.$chatwoot.setUser(identifier, {
			email: user.email,
			name: (user as { name?: string | null }).name ?? undefined,
			custom_attributes: {
				activeOrganizationId:
					(activeOrganization as { id?: string | null })?.id ?? undefined,
				activeOrganizationSlug:
					(activeOrganization as { slug?: string | null })?.slug ?? undefined,
				activeOrganizationName:
					(activeOrganization as { name?: string | null })?.name ?? undefined,
			},
		});
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
