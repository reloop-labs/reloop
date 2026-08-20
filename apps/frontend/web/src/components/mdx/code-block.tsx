"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import {
	extractPathFromCode,
	getLanguageIcon,
} from "@reloop/web/components/mdx/language-icons";

/**
 * Blog / MDX code fence renderer.
 *
 * Global header rules:
 * - Left: language logo (from `lang`)
 * - If a file path is provided (or auto-detected from the first `// path` line):
 *   show that path next to the logo — never the raw language name ("typescript")
 * - If no path: show the language name next to the logo
 *
 * Path sources (first match wins):
 * 1. `path` prop
 * 2. `title` prop (alias)
 * 3. First-line comment: `// lib/reloop.ts` / `# script.py`
 */
export function CodeBlock({
	lang = "text",
	title,
	path,
	children,
}: {
	lang?: string;
	/** File path shown in the header (preferred). */
	path?: string;
	/** Alias for `path` (MDX / docs convention). */
	title?: string;
	children: string;
}) {
	const raw = String(children).trim();
	const extracted = extractPathFromCode(raw);
	const filePath = path?.trim() || title?.trim() || extracted.path;
	// Drop a leading `// path` comment from the body once it's in the header.
	const displayCode = extracted.path ? extracted.code : raw;
	const si = getLanguageIcon(lang);

	return (
		<div className="my-6">
			<CopyCodeBlock
				code={displayCode}
				lang={lang}
				// `title` drives the path label in CopyCodeBlock; language name is hidden when set
				title={filePath}
				si={si}
				label={filePath ? undefined : lang}
				hideLineNumbers={displayCode.split("\n").length < 3}
			/>
		</div>
	);
}
