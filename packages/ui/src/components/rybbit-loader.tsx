"use client";

import Script from "next/script";

declare global {
	interface Window {
		rybbit?: {
			event: (eventName: string, eventData?: Record<string, unknown>) => void;
			pageview: () => void;
		};
	}
}

export function RybbitLoader({
	scriptSrc = "/api/analytics/script.js",
}: {
	scriptSrc?: string;
} = {}) {
	if (process.env.NODE_ENV === "development") {
		return null;
	}

	return (
		<Script
			id="rybbit-sdk"
			src={scriptSrc}
			data-site-id="9af96c42b437"
			strategy="lazyOnload"
		/>
	);
}
