/**
 * Bright-engine highlighter (`@code-hike/lighter`) for shared code surfaces.
 */
"use client";

import { highlight, type LanguageAlias, type Token } from "@code-hike/lighter";
import { cn } from "@reloop/ui/cn";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { toBrightLang } from "../utils/to-bright-lang";

interface Props {
	code: string;
	lang?: string;
	className?: string;
	hideLineNumbers?: boolean;
	lineNumbers?: boolean;
	noScroll?: boolean;
	maxHeight?: string;
	codeExtraPadding?: boolean;
	/** @deprecated Ignored — Bright uses github-light / github-dark themes. */
	theme?: string;
	/** @deprecated Ignored — Bright highlights client-side. */
	defaultHtml?: string;
}

type HighlightResult = {
	lines: Token[][];
};

function themeForColorScheme(scheme: "light" | "dark") {
	return scheme === "dark" ? "github-dark" : "github-light";
}

function plainLines(code: string): Token[][] {
	const parts = code.split("\n");
	return parts.map((line) => [
		{ content: line.length === 0 ? "\n" : line, style: {} } as Token,
	]);
}

const promiseCache = new Map<string, Promise<HighlightResult>>();
const resultCache = new Map<string, HighlightResult>();

function cacheKey(code: string, lang: string, scheme: "light" | "dark") {
	return `${themeForColorScheme(scheme)}::${lang}::${code}`;
}

function getHighlightPromise(
	code: string,
	lang: string,
	scheme: "light" | "dark",
): Promise<HighlightResult> {
	const key = cacheKey(code, lang, scheme);
	const existing = promiseCache.get(key);
	if (existing) return existing;

	const theme = themeForColorScheme(scheme);
	const promise = highlight(code, lang as LanguageAlias, theme)
		.then((result) => {
			const next = { lines: result.lines as unknown as Token[][] };
			resultCache.set(key, next);
			return next;
		})
		.catch((error) => {
			console.error("[CodeBlock] highlight failed", { lang, theme, error });
			const next = { lines: plainLines(code) };
			resultCache.set(key, next);
			return next;
		});

	promiseCache.set(key, promise);
	if (promiseCache.size > 50) {
		const first = promiseCache.keys().next().value;
		if (first) {
			promiseCache.delete(first);
			resultCache.delete(first);
		}
	}
	return promise;
}

function readDomScheme(): "light" | "dark" {
	if (typeof document === "undefined") return "light";
	const root = document.documentElement;
	if (root.classList.contains("dark")) return "dark";
	if (root.classList.contains("light")) return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function useColorScheme(): "light" | "dark" {
	const { resolvedTheme } = useTheme();
	const [scheme, setScheme] = useState<"light" | "dark">(readDomScheme);

	useEffect(() => {
		if (resolvedTheme === "dark" || resolvedTheme === "light") {
			setScheme(resolvedTheme);
			return;
		}
		const apply = () => setScheme(readDomScheme());
		apply();
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, [resolvedTheme]);

	return scheme;
}

export const CodeBlock = ({
	code,
	lang = "javascript",
	className,
	hideLineNumbers = false,
	lineNumbers: lineNumbersProp,
	noScroll = false,
	maxHeight,
	codeExtraPadding = false,
}: Props) => {
	const scheme = useColorScheme();
	const showLineNumbers = lineNumbersProp ?? !hideLineNumbers;
	const brightLang = toBrightLang(lang);
	const key = cacheKey(code, brightLang, scheme);

	const fallback = useMemo(() => ({ lines: plainLines(code) }), [code]);
	const [result, setResult] = useState<HighlightResult>(
		() => resultCache.get(key) ?? fallback,
	);

	useEffect(() => {
		const cached = resultCache.get(key);
		setResult(cached ?? fallback);
	}, [key, fallback]);

	useEffect(() => {
		let active = true;
		void getHighlightPromise(code, brightLang, scheme).then((next) => {
			if (active) setResult(next);
		});
		return () => {
			active = false;
		};
	}, [code, brightLang, scheme]);

	const prePadding = codeExtraPadding ? "pt-4 pb-4" : "pt-1 pb-1.5";
	const lines = result.lines;

	return (
		<div
			className={cn(
				"reloop-bright-code text-[12.5px] leading-5 sm:text-[13px] sm:leading-[1.3125rem]",
				className,
			)}
			data-color-scheme={scheme}
			style={
				maxHeight
					? ({ "--code-max-height": maxHeight } as React.CSSProperties)
					: undefined
			}
		>
			<style>{`
				.reloop-bright-code {
					background: transparent;
					color: var(--color-text-strong-950, #171717);
				}
				.reloop-bright-code .bright-pre {
					margin: 0;
					background: transparent !important;
					font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
						"Liberation Mono", "Courier New", monospace;
				}
				.reloop-bright-code .bright-line-number {
					width: 1.5rem;
					min-width: 1.5rem;
					padding-right: 0.375rem;
					text-align: right;
					font-size: 10.5px;
					line-height: inherit;
					color: var(--color-text-soft-400, #a3a3a3);
					user-select: none;
					border-right: 1px solid color-mix(in srgb, var(--color-stroke-soft-100, #e5e5e5) 80%, transparent);
				}
				.reloop-bright-code[data-color-scheme="dark"] .bright-line-number {
					border-right-color: color-mix(in srgb, var(--color-stroke-soft-100, #333) 40%, transparent);
				}
				.reloop-bright-code .bright-pre-scroll {
					scrollbar-width: none;
					-ms-overflow-style: none;
				}
				.reloop-bright-code .bright-pre-scroll::-webkit-scrollbar {
					display: none;
				}
			`}</style>
			<pre
				className={cn(
					"bright-pre m-0 px-2 font-mono",
					prePadding,
					!noScroll && "overflow-x-auto",
					noScroll && "whitespace-pre-wrap break-all",
					maxHeight &&
						"bright-pre-scroll max-h-[var(--code-max-height)] overflow-y-auto",
				)}
			>
				<code className="table w-full border-collapse">
					{lines.map((lineTokens, lineIndex) => (
						<div key={`line-${lineIndex}`} className="bright-line table-row">
							{showLineNumbers && (
								<span className="bright-line-number table-cell align-top">
									{lineIndex + 1}
								</span>
							)}
							<span className="table-cell whitespace-pre pl-2">
								{lineTokens.length === 0
									? "\n"
									: lineTokens.map((token, tokenIndex) => (
											<span
												key={`${tokenIndex}-${token.content.slice(0, 12)}`}
												style={token.style}
											>
												{token.content}
											</span>
										))}
							</span>
						</div>
					))}
				</code>
			</pre>
		</div>
	);
};
