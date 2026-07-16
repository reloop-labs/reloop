/**
 * Bright-engine highlighter (`@code-hike/lighter`) styled to match dashboard
 * `@reloop/ui/code-block`:
 * - transparent code surface (inner white / zinc-950 card provides bg)
 * - design-token-ish token colors via github-light / github-dark by color scheme
 * - line numbers with soft gutter border like the Shiki line-numbers CSS
 */
import { highlight, type LanguageAlias, type Token } from "@code-hike/lighter";
import { cn } from "@reloop/ui/cn";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toBrightLang } from "./snippets";

type BrightCodeProps = {
	code: string;
	lang?: string;
	lineNumbers?: boolean;
	className?: string;
	noScroll?: boolean;
	maxHeight?: string;
	codeExtraPadding?: boolean;
};

type HighlightResult = {
	lines: Token[][];
};

function themeForColorScheme(scheme: "light" | "dark") {
	return scheme === "dark" ? "github-dark" : "github-light";
}

const promiseCache = new Map<string, Promise<HighlightResult>>();

function getHighlightPromise(
	code: string,
	lang: string,
	scheme: "light" | "dark",
): Promise<HighlightResult> {
	const theme = themeForColorScheme(scheme);
	const key = `${theme}::${lang}::${code}`;
	const existing = promiseCache.get(key);
	if (existing) return existing;

	const promise = highlight(code, lang as LanguageAlias, theme).then(
		(result) => ({
			lines: result.lines as unknown as Token[][],
		}),
	);
	promiseCache.set(key, promise);
	if (promiseCache.size > 50) {
		const first = promiseCache.keys().next().value;
		if (first) promiseCache.delete(first);
	}
	return promise;
}

function useColorScheme(): "light" | "dark" {
	const { resolvedTheme } = useTheme();
	const [scheme, setScheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		if (resolvedTheme === "dark" || resolvedTheme === "light") {
			setScheme(resolvedTheme);
			return;
		}
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const apply = () => setScheme(mq.matches ? "dark" : "light");
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, [resolvedTheme]);

	return scheme;
}

export function BrightCode({
	code,
	lang = "ts",
	lineNumbers = true,
	className,
	noScroll,
	maxHeight,
	codeExtraPadding = false,
}: BrightCodeProps) {
	const scheme = useColorScheme();
	const brightLang = toBrightLang(lang);
	const [result, setResult] = useState<HighlightResult | null>(null);

	useEffect(() => {
		let active = true;
		setResult(null);
		void getHighlightPromise(code, brightLang, scheme).then((next) => {
			if (active) setResult(next);
		});
		return () => {
			active = false;
		};
	}, [code, brightLang, scheme]);

	const prePadding = codeExtraPadding ? "pt-4 pb-4" : "pt-1 pb-1.5";

	return (
		<div
			className={cn(
				"bright-code reloop-bright-code text-[12.5px] leading-5 sm:text-[13px] sm:leading-[1.3125rem]",
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
					padding-right: 0.375rem;
					text-align: right;
					font-size: 10.5px;
					line-height: inherit;
					color: var(--color-text-soft-400, #a3a3a3);
					user-select: none;
				}
				/* Hide scrollbar but keep scroll (AI prompt max-height, etc.) */
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
				{!result ? (
					<code className="whitespace-pre text-text-sub-600">{code}</code>
				) : (
					<code className="table w-full border-collapse">
						{result.lines.map((lineTokens, lineIndex) => (
							<div
								key={`line-${lineIndex}-${lineTokens
									.map((t) => t.content)
									.join("")
									.slice(0, 24)}`}
								className="bright-line table-row"
							>
								{lineNumbers && (
									<span className="bright-line-number table-cell align-top">
										{lineIndex + 1}
									</span>
								)}
								<span className="table-cell whitespace-pre pl-2">
									{lineTokens.length === 0
										? "\n"
										: lineTokens.map((token, tokenIndex) => (
												<span
													key={`${token.content}-${tokenIndex}`}
													style={token.style}
												>
													{token.content}
												</span>
											))}
								</span>
							</div>
						))}
					</code>
				)}
			</pre>
		</div>
	);
}
