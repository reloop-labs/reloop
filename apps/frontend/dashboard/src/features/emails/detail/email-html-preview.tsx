"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef } from "react";
import {
	type EmailTheme,
	processEmailHtmlForDisplay,
} from "#/features/agent-inbox/components/thread-detail/email-html";

export function EmailHtmlPreview({ html }: { html: string }) {
	const { resolvedTheme } = useTheme();
	const theme: EmailTheme = resolvedTheme === "light" ? "light" : "dark";
	const hostRef = useRef<HTMLDivElement>(null);
	const shadowRootRef = useRef<ShadowRoot | null>(null);

	const processed = useMemo(() => {
		if (!html) return null;
		return processEmailHtmlForDisplay({
			html,
			shouldLoadImages: true,
			theme,
		});
	}, [html, theme]);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;

		if (!host.shadowRoot) {
			shadowRootRef.current = host.attachShadow({ mode: "open" });
		} else {
			shadowRootRef.current = host.shadowRoot;
		}

		return () => {
			shadowRootRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!shadowRootRef.current || !processed) return;
		shadowRootRef.current.innerHTML = processed.processedHtml;
	}, [processed]);

	return <div ref={hostRef} className="w-full overflow-hidden" />;
}
