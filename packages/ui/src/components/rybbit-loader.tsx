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

export function RybbitLoader() {
	if (process.env.NODE_ENV === "development") {
		return null;
	}

	return (
		<Script
			id="rybbit-sdk"
			src="/api/analytics/script.js"
			data-site-id="1fb7d359339f"
			strategy="afterInteractive"
		/>
	);
}
