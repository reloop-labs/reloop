import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type EmailTheme, processEmailHtmlForDisplay } from "./email-html";

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
	/** Stable id for this message — used to reset image toggle when switching */
	messageId?: string;
}

/**
 * Renders the email body via Shadow DOM (Zero-style), with sanitization,
 * quote collapsing, theme-aware styles, and an optional image-block banner.
 * Falls back to plain text on the panel (no white card).
 */
export const MessageBody = ({
	bodyHtml,
	bodyText,
	isTranslated,
	targetLanguage,
	messageId,
}: MessageBodyProps) => {
	const { resolvedTheme } = useTheme();
	const theme: EmailTheme = resolvedTheme === "light" ? "light" : "dark";

	const [showImages, setShowImages] = useState(false);
	const [hasBlockedImages, setHasBlockedImages] = useState(false);
	const hostRef = useRef<HTMLDivElement>(null);
	const shadowRootRef = useRef<ShadowRoot | null>(null);

	// Reset image toggle when the message changes
	useEffect(() => {
		setShowImages(false);
		setHasBlockedImages(false);
	}, [messageId]);

	const processed = useMemo(() => {
		if (!bodyHtml) return null;
		return processEmailHtmlForDisplay({
			html: bodyHtml,
			shouldLoadImages: showImages,
			theme,
		});
	}, [bodyHtml, showImages, theme]);

	useEffect(() => {
		if (processed?.hasBlockedImages) {
			setHasBlockedImages(true);
		} else if (showImages) {
			setHasBlockedImages(false);
		}
	}, [processed, showImages]);

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
	}, [bodyHtml]);

	useEffect(() => {
		if (!shadowRootRef.current || !processed) return;
		shadowRootRef.current.innerHTML = processed.processedHtml;
	}, [processed]);

	const handleImageError = useCallback(
		(e: Event) => {
			const target = e.target as HTMLImageElement;
			if (target.tagName === "IMG" && !showImages) {
				setHasBlockedImages(true);
				target.style.display = "none";
			}
		},
		[showImages],
	);

	useEffect(() => {
		if (!shadowRootRef.current) return;
		const root = shadowRootRef.current;

		root.addEventListener("error", handleImageError, true);

		const handleClick = (e: Event) => {
			const target = e.target as HTMLElement;
			if (target.tagName === "A") {
				e.preventDefault();
				const href = target.getAttribute("href");
				if (
					href &&
					(href.startsWith("http://") || href.startsWith("https://"))
				) {
					window.open(href, "_blank", "noopener,noreferrer");
				} else if (href?.startsWith("mailto:")) {
					window.location.href = href;
				}
			}
		};

		root.addEventListener("click", handleClick);

		return () => {
			root.removeEventListener("error", handleImageError, true);
			root.removeEventListener("click", handleClick);
		};
	}, [processed, handleImageError]);

	if (bodyHtml) {
		return (
			<>
				{isTranslated && (
					<div className="mb-3 rounded-lg bg-yellow-50 px-3 py-2 font-medium text-[12px] text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
						Dynamic {LANGUAGE_NAMES[targetLanguage] || targetLanguage}{" "}
						Translation
					</div>
				)}
				{hasBlockedImages && !showImages && (
					<div className="mb-2 flex items-center justify-start bg-amber-600/20 px-2 py-1 text-amber-600 text-sm">
						<p>Images in this message have been blocked.</p>
						<button
							type="button"
							onClick={() => setShowImages(true)}
							className="ml-2 cursor-pointer underline"
						>
							Show images
						</button>
					</div>
				)}
				{hasBlockedImages && showImages && (
					<div className="mb-2 flex items-center justify-start bg-amber-600/20 px-2 py-1 text-amber-600 text-sm">
						<p>Images are visible for this message.</p>
						<button
							type="button"
							onClick={() => setShowImages(false)}
							className="ml-2 cursor-pointer underline"
						>
							Hide images
						</button>
					</div>
				)}
				<div
					ref={hostRef}
					className="mail-content w-full flex-1 overflow-x-auto px-0 text-mail-foreground"
				/>
			</>
		);
	}

	return (
		<div className="px-0">
			{isTranslated && (
				<div className="mb-3 rounded-lg bg-yellow-50 px-3 py-2 font-medium text-[12px] text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
					Dynamic {LANGUAGE_NAMES[targetLanguage] || targetLanguage} Translation
				</div>
			)}
			<p className="whitespace-pre-wrap text-mail-foreground text-sm leading-relaxed">
				{bodyText}
			</p>
		</div>
	);
};
