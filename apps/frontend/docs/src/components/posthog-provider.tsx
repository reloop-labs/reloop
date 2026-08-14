"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		if (
			typeof window === "undefined" ||
			window.location.hostname !== "reloop.sh"
		) {
			return;
		}

		posthog.init("phc_yupmDjjcfcjsFXbwgrzpwfb5zUYrWvneXDqhTdZjeuoE", {
			api_host: "https://r.reloop.sh",
			ui_host: "https://us.i.posthog.com",
			defaults: "2026-05-30",
		});
	}, []);

	return <PHProvider client={posthog}>{children}</PHProvider>;
}
