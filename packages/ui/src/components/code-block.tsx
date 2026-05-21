/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML for code highlighting */
"use client";

import { cn } from "@reloop/ui/cn";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { codeToHtml } from "shiki";

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
	const { resolvedTheme, systemTheme, theme: currentTheme } = useTheme();
	const [html, setHtml] = useState<string>(defaultHtml || "");
	const [mounted, setMounted] = useState(false);
	const isFirstRun = useRef(true);

	// Handle mounting to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Determine the effective theme (user preference or system)
	// Use resolvedTheme which handles system theme resolution
	const effectiveTheme = resolvedTheme || systemTheme || currentTheme;

	// Map design system theme to Shiki theme
	// Using themes that match the slate/gray color palette:
	// - Dark: "one-dark-pro" (matches slate-950 dark blue-gray background)
	// - Light: "github-light" (clean, minimal, matches white/gray palette)
	const shikiTheme =
		themeOverride ||
		(effectiveTheme === "dark" ? "one-dark-pro" : "github-light");

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
		"[&>pre]:!bg-transparent text-sm leading-6 [&>pre]:p-4",
		className,
	);

	// ── Render ──────────────────────────────────────────────────────────
	// Show the highlighted HTML if available, otherwise show a plain-text
	// fallback so the code is always visible (no flash of empty space).

	return (
		<>
			<style>{`
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
