/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML for code highlighting */
"use client";

import { cn } from "@reloop/ui/cn";
import { useEffect, useRef, useState } from "react";
import { codeToHtml } from "shiki";
import { reloopShikiTheme } from "../themes/reloop-shiki-theme";

interface Props {
	code: string;
	lang?: string;
	theme?: string;
	className?: string;
	hideLineNumbers?: boolean;
	noScroll?: boolean;
	defaultHtml?: string;
}

export const CodeBlock = ({
	code,
	lang = "javascript",
	theme: themeOverride,
	className,
	hideLineNumbers = false,
	noScroll = false,
	defaultHtml,
}: Props) => {
	const [html, setHtml] = useState<string>(defaultHtml || "");
	const [mounted, setMounted] = useState(false);
	const isFirstRun = useRef(true);

	// Handle mounting to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Default to the Reloop CSS-variables theme so highlighting follows design tokens.
	// Pass `theme` to opt into a bundled Shiki theme instead.
	const shikiTheme = themeOverride ?? reloopShikiTheme;
	const usesReloopTheme = !themeOverride;

	useEffect(() => {
		// Don't run on the server or before mount
		if (!mounted) return;

		// Skip the very first run if we already have server-rendered HTML
		if (isFirstRun.current && defaultHtml) {
			isFirstRun.current = false;
			return;
		}
		isFirstRun.current = false;

		// Track whether this effect invocation is still current
		let active = true;

		codeToHtml(code, {
			lang,
			theme: shikiTheme,
			transformers: [
				{
					pre(node) {
						this.addClassToHast(
							node,
							cn(
								"py-4",
								!noScroll && "overflow-x-auto",
								noScroll && "whitespace-pre-wrap break-all",
								!hideLineNumbers && "line-numbers",
							),
						);
					},
					line(node) {
						this.addClassToHast(node, "line");
					},
				},
			],
		})
			.then((result) => {
				if (active) setHtml(result);
			})
			.catch(() => {
				// Silently ignore – fallback will remain visible
			});

		return () => {
			active = false;
		};
	}, [mounted, code, lang, shikiTheme, hideLineNumbers, noScroll, defaultHtml]);

	// ── Shared wrapper classes ──────────────────────────────────────────
	const wrapperClassName = cn(
		usesReloopTheme && "reloop-code-block",
		"[&>pre]:!bg-transparent text-sm leading-6 [&>pre]:p-4",
		className,
	);

	// ── Render ──────────────────────────────────────────────────────────
	// Show the highlighted HTML if available, otherwise show a plain-text
	// fallback so the code is always visible (no flash of empty space).

	return (
		<>
			<style>{`
				.reloop-code-block {
					--shiki-background: transparent;
					--shiki-foreground: var(--color-text-strong-950, #171717);
					--shiki-token-keyword: var(--color-text-strong-950, #171717);
					--shiki-token-string: var(--color-primary-base, #d97757);
					--shiki-token-string-expression: var(--color-primary-base, #d97757);
					--shiki-token-comment: var(--color-text-soft-400, #a3a3a3);
					--shiki-token-function: var(--color-text-strong-950, #171717);
					--shiki-token-constant: var(--color-text-sub-600, #5c5c5c);
					--shiki-token-parameter: var(--color-text-sub-600, #5c5c5c);
					--shiki-token-punctuation: var(--color-text-soft-400, #a3a3a3);
					--shiki-token-link: var(--color-primary-base, #d97757);
				}

				.line-numbers {
					counter-reset: line;
				}
				.line-numbers .line {
					position: relative;
					padding-left: 3.25rem;
				}
				.line-numbers .line::before {
					content: counter(line);
					counter-increment: line;
					position: absolute;
					left: 0;
					width: 2.5rem;
					text-align: right;
					padding-right: 0.75rem;
					font-size: 0.75rem;
					color: var(--color-text-soft-400);
					user-select: none;
					border-right: 1px solid var(--color-border-soft-200);
				}
			`}</style>

			{html ? (
				<div
					dangerouslySetInnerHTML={{ __html: html }}
					className={wrapperClassName}
				/>
			) : (
				<div className={wrapperClassName}>
					<pre
						className={cn(
							"!bg-transparent p-4",
							!noScroll && "overflow-x-auto",
							noScroll && "whitespace-pre-wrap break-all",
						)}
					>
						<code>{code}</code>
					</pre>
				</div>
			)}
		</>
	);
};
