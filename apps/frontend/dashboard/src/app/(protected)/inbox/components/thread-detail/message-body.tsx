"use client";

import { Icon } from "@reloop/ui/icon";
import { useEffect, useRef, useState } from "react";

const LANGUAGE_NAMES: Record<string, string> = {
	es: "Spanish",
	fr: "French",
	de: "German",
	it: "Italian",
	ja: "Japanese",
	zh: "Chinese",
	pt: "Portuguese",
	ru: "Russian",
	ar: "Arabic",
	hi: "Hindi",
};

interface MessageBodyProps {
	bodyHtml: string | undefined;
	bodyText: string | undefined;
	isTranslated: boolean;
	targetLanguage: string;
}

/**
 * Renders the email body — either as a sandboxed iframe (HTML) or as plain text.
 * Auto-sizes the iframe to its content height via postMessage from an inline
 * ResizeObserver.
 */
export const MessageBody = ({
	bodyHtml,
	bodyText,
	isTranslated,
	targetLanguage,
}: MessageBodyProps) => {
	const [iframeHeight, setIframeHeight] = useState(350);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const handleIframeLoad = () => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (doc?.body) {
				const h = doc.documentElement.scrollHeight || doc.body.scrollHeight;
				setIframeHeight(Math.max(h, 120));
			}
		} catch {
			// sandboxed — rely on postMessage instead
		}
	};

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (
				e.data?.type === "iframe-height" &&
				typeof e.data.height === "number" &&
				iframeRef.current &&
				e.source === iframeRef.current.contentWindow
			) {
				setIframeHeight(Math.max(e.data.height, 120));
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, []);

	const translationBanner = isTranslated
		? `<div style="background:#fef08a;color:#854d0e;padding:8px 12px;margin-bottom:12px;border-radius:6px;font-size:12px;font-weight:500;font-family:sans-serif;">Dynamic ${LANGUAGE_NAMES[targetLanguage] || targetLanguage} Translation</div>`
		: "";

	if (bodyHtml) {
		return (
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100/50">
				<iframe
					ref={iframeRef}
					onLoad={handleIframeLoad}
					srcDoc={`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { box-sizing: border-box; }
html, body { overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #1c1917;
  margin: 0;
  padding: 16px;
  background-color: #ffffff;
}
img { max-width: 100%; height: auto; }
</style>
</head>
<body>
${translationBanner}
${bodyHtml}
<script>
(function() {
  function sendHeight() {
    var h = document.documentElement.scrollHeight || document.body.scrollHeight;
    window.parent.postMessage({ type: 'iframe-height', height: h }, '*');
  }
  window.addEventListener('load', sendHeight);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(sendHeight).observe(document.body);
  }
})();
</script>
</body>
</html>`}
					sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts"
					style={{ height: iframeHeight }}
					className="w-full border-0 bg-white transition-[height] duration-150"
					title="Email HTML body"
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{isTranslated && (
				<div className="rounded-lg bg-yellow-50 px-3 py-2 font-medium text-[12px] text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200">
					Dynamic {LANGUAGE_NAMES[targetLanguage] || targetLanguage} Translation
				</div>
			)}
			<p className="whitespace-pre-wrap text-sm text-text-strong-950 leading-relaxed dark:text-neutral-350">
				{bodyText}
			</p>
		</div>
	);
};
