"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type React from "react";
import { useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siCurl, siGo, siNodedotjs, siPython } from "simple-icons";
import {
	apiEndpoint,
	apiNotes,
	apiResponseSample,
	apiSnippets,
} from "./content";
import {
	Band,
	Cell,
	CellCopy,
	CellGrid,
	CellLabel,
	hairline,
	WindowDots,
} from "./grid";
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
				<div className="px-5 py-16 sm:px-6 sm:py-20 md:px-8">
					<p className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						<span className="text-text-soft-400 dark:text-white/20">
							{"//"}
						</span>
						<Icon name="terminal" className="size-3.5 text-primary-base" />
						Developer first
						<span className="text-text-soft-400 dark:text-white/20">
							{"\\\\"}
						</span>
					</p>
					<h2 className="max-w-3xl font-semibold text-[2rem] text-text-strong-950 leading-[1.08] tracking-[-1px] sm:text-[2.6rem] dark:text-white">
						Run the same check{" "}
						<span className="text-primary-base">from your code</span>
					</h2>
					<p className="mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/50">
						This page is a thin wrapper over one public endpoint. Point your
						signup flow at it and reject burner addresses before the account is
						created.
					</p>
					<p className="mt-6 inline-flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-stroke-soft-200 px-4 py-2 font-mono text-[12px] dark:border-white/12">
						<span className="shrink-0 font-semibold text-primary-base">
							POST
						</span>
						<span className="whitespace-nowrap text-text-sub-600 dark:text-white/50">
							{apiEndpoint}
						</span>
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

				<CellGrid columns={2}>
					{apiNotes.map((note) => (
						<Cell key={note.title}>
							<CellLabel icon={note.icon} label={note.tag} />
							<CellCopy title={note.title} description={note.description} />
						</Cell>
					))}
				</CellGrid>
			</Band>
		</>
	);
}
