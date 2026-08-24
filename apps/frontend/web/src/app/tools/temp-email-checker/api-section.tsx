"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type React from "react";
import { useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siCurl, siGo, siNodedotjs, siPython } from "simple-icons";
import {
	apiResponseSample,
	apiSnippets,
} from "./content";
import { Band, hairline, WindowDots } from "./grid";
import { LanguagePills, type PillTab } from "./language-pills";

const PANEL_ID = "check-api-panel";

const TAB_ICONS: Record<string, SimpleIcon> = {
	curl: siCurl,
	node: siNodedotjs,
	python: siPython,
	go: siGo,
};

const PILL_TABS: PillTab[] = apiSnippets.map((snippet) => ({
	id: snippet.id,
	label: snippet.label,
	icon: TAB_ICONS[snippet.id] ?? siCurl,
}));

/**
 * Comments only count at the start of a line — otherwise the `//` in an https
 * URL greys out the rest of the command.
 */
const STRING_OR_COMMENT =
	/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(^[ \t]*(?:#|\/\/).*)/gm;

function highlightCode(code: string): React.ReactNode[] {
	const out: React.ReactNode[] = [];
	let last = 0;
	let key = 0;

	for (const match of code.matchAll(STRING_OR_COMMENT)) {
		const start = match.index ?? 0;
		if (start > last) out.push(code.slice(last, start));

		const [text, str, comment] = match;
		out.push(
			<span
				key={`t${key++}`}
				className={
					str
						? "text-primary-base"
						: comment
							? "text-text-soft-400 dark:text-white/30"
							: undefined
				}
			>
				{text}
			</span>,
		);
		last = start + text.length;
	}

	if (last < code.length) out.push(code.slice(last));
	return out;
}

const JSON_TOKEN =
	/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

function highlightJson(code: string): React.ReactNode[] {
	const out: React.ReactNode[] = [];
	let last = 0;
	let key = 0;

	for (const match of code.matchAll(JSON_TOKEN)) {
		const start = match.index ?? 0;
		if (start > last) out.push(code.slice(last, start));

		const [text, str, colon, literal] = match;
		const isKey = Boolean(str && colon);

		out.push(
			<span
				key={`j${key++}`}
				className={cn(
					isKey && "text-text-strong-950 dark:text-white",
					!isKey && str && "text-primary-base",
					literal && "text-text-sub-600 dark:text-white/55",
				)}
			>
				{text}
			</span>,
		);
		last = start + text.length;
	}

	if (last < code.length) out.push(code.slice(last));
	return out;
}

function CopyButton({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {
			// Clipboard blocked — the snippet is selectable, so this is not fatal.
		}
	};

	return (
		<button
			type="button"
			onClick={copy}
			className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 px-3.5 py-1.5 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.1em] transition-colors hover:border-text-strong-950/25 hover:text-text-strong-950 dark:border-white/12 dark:text-white/45 dark:hover:border-white/30 dark:hover:text-white"
		>
			<Icon name={copied ? "check" : "copy"} className="size-3.5" />
			{copied ? "Copied" : "Copy"}
		</button>
	);
}

export function ApiSection() {
	const [activeId, setActiveId] = useState(apiSnippets[0].id);
	const active = apiSnippets.find((s) => s.id === activeId) ?? apiSnippets[0];

	return (
		<>
			<Band>
				<div className="px-5 py-8 sm:px-6 sm:py-10 md:px-8">
					<p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						<span className="text-text-soft-400 dark:text-white/20">
							{"//"}
						</span>
						<Icon name="terminal" className="size-3.5 text-primary-base" />
						Developer First
						<span className="text-text-soft-400 dark:text-white/20">
							{"\\\\"}
						</span>
					</p>
					<h2 className="max-w-2xl font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-[32px] dark:text-white">
						Run the check{" "}
						<span className="text-primary-base">from your code</span>
					</h2>
					<p className="mt-2.5 max-w-lg text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/50">
						Point your signup flow directly at the public endpoint to reject
						burner addresses in real time.
					</p>
				</div>
			</Band>

			<Band>
				<div
					className={cn(
						"flex items-center justify-between gap-3 border-b pr-4 sm:pr-5",
						hairline,
					)}
				>
					<LanguagePills
						tabs={PILL_TABS}
						activeId={activeId}
						onChange={setActiveId}
						ariaLabel="Code language"
						idPrefix="check-api"
						controls={PANEL_ID}
						className="min-w-0 flex-1 px-4 py-3 sm:px-5 md:px-6"
					/>
					<CopyButton value={active.code} />
				</div>

				<div
					id={PANEL_ID}
					role="tabpanel"
					aria-labelledby={`check-api-tab-${active.id}`}
					className="grid lg:grid-cols-2"
				>
					<div className="overflow-x-auto px-5 py-6 sm:px-6 md:px-8">
						<pre className="font-mono text-[12.5px] text-text-strong-950 leading-[1.75] sm:text-[13px] dark:text-white/80">
							<code>{highlightCode(active.code)}</code>
						</pre>
					</div>

					<div
						className={cn(
							"border-t bg-bg-weak-50 lg:border-t-0 lg:border-l dark:bg-white/[0.02]",
							hairline,
						)}
					>
						<div
							className={cn(
								"flex items-center gap-3 border-b px-5 py-3 sm:px-6",
								hairline,
							)}
						>
							<WindowDots />
							<span className="ml-auto font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/30">
								[ 200 · json ]
							</span>
						</div>
						<div className="overflow-x-auto px-5 py-6 sm:px-6">
							<pre className="font-mono text-[12.5px] text-text-sub-600 leading-[1.75] sm:text-[13px] dark:text-white/45">
								<code>{highlightJson(apiResponseSample)}</code>
							</pre>
						</div>
					</div>
				</div>
			</Band>
		</>
	);
}
