"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
	interface Window {
		chatwootSDK?: {
			run: (config: { websiteToken: string; baseUrl: string }) => void;
		};
		$chatwoot?: {
			setUser: (
				identifier: string,
				user: {
					email?: string;
					name?: string;
					avatar_url?: string;
					custom_attributes?: Record<string, unknown>;
				},
			) => void;
			reset: () => void;
		};
	}
}

function useChatwootConfig() {
	const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL?.replace(
		/\/+$/,
		"",
	);
	const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim();

	return {
		baseUrl,
		websiteToken,
		isConfigured: Boolean(baseUrl && websiteToken),
	};
}

export function ChatwootLoader() {
	const { baseUrl, websiteToken, isConfigured } = useChatwootConfig();
	const didInit = useRef(false);

	useEffect(() => {
		if (process.env.NODE_ENV !== "development" || isConfigured) return;
		console.warn(
			"[Chatwoot] Widget disabled: set NEXT_PUBLIC_CHATWOOT_BASE_URL and NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN, then restart the dev server.",
		);
	}, [isConfigured]);

	if (!isConfigured || !baseUrl || !websiteToken) return null;

	return (
		<Script
			id="chatwoot-sdk"
			src={`${baseUrl}/packs/js/sdk.js`}
			strategy="afterInteractive"
			onLoad={() => {
				if (didInit.current) return;
				didInit.current = true;
				window.chatwootSDK?.run({ websiteToken, baseUrl });
			}}
		/>
	);
}
