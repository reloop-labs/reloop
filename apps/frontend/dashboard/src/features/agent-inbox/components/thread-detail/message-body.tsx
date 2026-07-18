import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type EmailTheme, processEmailHtmlForDisplay } from "./email-html";

function ImagePrivacyBanner({
	showing,
	onToggle,
}: {
	showing: boolean;
	onToggle: () => void;
}) {
	return (
		<div
			className={cn(
				"mb-3 flex items-center gap-2.5 rounded-xl px-3 py-2",
				"border border-mail-border/40 bg-[var(--inbox-muted-bg)]",
				"animate-in fade-in-0 slide-in-from-top-1 duration-200",
			)}
		>
			<span
				className={cn(
					"inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
					showing
						? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
						: "bg-[var(--inbox-control)] text-mail-muted",
				)}
			>
				<Icon
					name={showing ? "image-upload" : "shield"}
					className="h-3.5 w-3.5"
				/>
			</span>
			<div className="min-w-0 flex-1">
				<p className="font-medium text-[12px] text-mail-foreground leading-snug">
					{showing ? "Images are visible" : "Images blocked for privacy"}
				</p>
				<p className="mt-0.5 text-[11px] text-mail-muted leading-snug">
					{showing
						? "Remote images in this message can load now."
						: "Remote images stay hidden until you choose to load them."}
				</p>
			</div>
			<button
				type="button"
				onClick={onToggle}
				className={cn(
					"inline-flex h-7 shrink-0 items-center rounded-lg px-2.5",
					"font-medium text-[12px] transition-[transform,background-color,color] duration-150 ease-out",
					"active:scale-[0.97]",
					showing
						? "bg-[var(--inbox-control)] text-mail-muted hover:bg-[var(--inbox-control-hover)] hover:text-mail-foreground"
						: "bg-mail-primary text-panel-light hover:opacity-90 dark:text-black",
				)}
			>
				{showing ? "Hide" : "Show images"}
			</button>
		</div>
	);
}

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
				{hasBlockedImages && (
					<ImagePrivacyBanner
						showing={showImages}
						onToggle={() => setShowImages((v) => !v)}
					/>
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
