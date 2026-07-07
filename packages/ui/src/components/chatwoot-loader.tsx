"use client";

import Script from "next/script";
import { useRef } from "react";

// TODO: temporary — restore env-based config once CI build-args are wired up
export const CHATWOOT_BASE_URL = "https://chatwoot.reloop.sh";
export const CHATWOOT_WEBSITE_TOKEN = "WsUSVMPZG5goFYPcJQLQVAjD";

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
			toggle: (action?: "open" | "close") => void;
		};
		chatwootSettings?: {
			hideMessageBubble?: boolean;
		};
	}
}

export function ChatwootLoader() {
	const baseUrl = CHATWOOT_BASE_URL.replace(/\/+$/, "");
	const websiteToken = CHATWOOT_WEBSITE_TOKEN.trim();
	const didInit = useRef(false);

	if (typeof window !== "undefined") {
		window.chatwootSettings = {
			hideMessageBubble: true,
		};
	}

	return (
		<Script
			id="chatwoot-sdk"
			src={`${baseUrl}/packs/js/sdk.js`}
			strategy="lazyOnload"
			onLoad={() => {
				if (didInit.current) return;
				didInit.current = true;
				window.chatwootSDK?.run({ websiteToken, baseUrl });
			}}
		/>
	);
}
