import { JAVA_ICON } from "@reloop/ui/icons/java";
import {
	siCss,
	siDocker,
	siGnubash,
	siGo,
	siHtml5,
	siJavascript,
	siJson,
	siMarkdown,
	siNodedotjs,
	siPhp,
	siPython,
	siReact,
	siRuby,
	siRust,
	siSvelte,
	siTypescript,
	siYaml,
} from "simple-icons";

export type LanguageIcon = {
	path: string;
	hex: string;
	title?: string;
};

/**
 * Map code fence / Bright language aliases → brand icons for code block headers.
 */
const LANGUAGE_ICONS: Record<string, LanguageIcon> = {
	typescript: siTypescript,
	ts: siTypescript,
	tsx: siReact,
	javascript: siJavascript,
	js: siJavascript,
	jsx: siReact,
	react: siReact,
	node: siNodedotjs,
	nodejs: siNodedotjs,
	bash: siGnubash,
	shell: siGnubash,
	sh: siGnubash,
	zsh: siGnubash,
	python: siPython,
	py: siPython,
	go: siGo,
	golang: siGo,
	php: siPhp,
	ruby: siRuby,
	rb: siRuby,
	// Brand hex is #000000 — override so the gear stays visible on dark UI
	rust: { path: siRust.path, hex: "e24d2b", title: siRust.title },
	java: JAVA_ICON,
	html: siHtml5,
	css: siCss,
	json: siJson,
	yaml: siYaml,
	yml: siYaml,
	md: siMarkdown,
	markdown: siMarkdown,
	svelte: siSvelte,
	dockerfile: siDocker,
	docker: siDocker,
	env: siGnubash,
	text: siGnubash,
	txt: siGnubash,
};

/** Resolve a brand icon for a code language (typescript, bash, tsx, …). */
export function getLanguageIcon(lang?: string): LanguageIcon | undefined {
	if (!lang) return undefined;
	const key = lang.toLowerCase().trim();
	const icon = LANGUAGE_ICONS[key];
	if (!icon) return undefined;

	// simple-icons pure black is invisible on dark chrome — lift a few brands.
	if (icon.hex.toLowerCase() === "000000") {
		return { ...icon, hex: "a1a1aa" };
	}
	return icon;
}

/**
 * Pull a file path from the first line when authors write:
 *   // lib/reloop.ts
 *   # scripts/run.sh
 *   -- query.sql
 * Returns the path and the remaining source (comment line removed).
 */
export function extractPathFromCode(code: string): {
	path?: string;
	code: string;
} {
	const trimmed = code.replace(/^\uFEFF/, "");
	const lines = trimmed.split("\n");
	if (lines.length === 0) return { code: trimmed };

	const first = lines[0]?.trim() ?? "";
	// // path, # path, -- path  (single-token path with an extension)
	const match = first.match(
		/^(?:\/\/|#|--)\s+((?:[\w.@-]+\/)*[\w.@-]+\.[A-Za-z0-9]+)\s*$/,
	);
	if (!match?.[1]) {
		return { code: trimmed };
	}

	const path = match[1];
	const rest = lines.slice(1);
	// Drop a single blank line after the path comment so the body starts clean.
	if (rest[0]?.trim() === "") {
		rest.shift();
	}
	return { path, code: rest.join("\n") };
}
