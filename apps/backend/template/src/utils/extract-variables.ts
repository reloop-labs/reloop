import type { TemplateBlock } from "@reloop/db/schema";

/** Supported: {{{name}}} (3) or {{name}} (2). Single {name} is not supported. */
const TRIPLE_BRACE_REGEX = /\{\{\{([^{}]+)\}\}\}/g;
const DOUBLE_BRACE_REGEX = /\{\{([^{}]+)\}\}/g;

/**
 * Normalize a placeholder or stored key to the bare variable name.
 *
 * Supported placeholder forms: `{{name}}` (2) and `{{{name}}}` (3).
 * Single-brace `{name}` is NOT a valid syntax — brace characters on a stored
 * key are only stripped as repair for legacy corruption.
 */
export function normalizeVariableName(raw: string): string {
	const trimmed = raw.trim();

	const triple = trimmed.match(/^\{\{\{\s*([^{}]+?)\s*\}\}\}$/);
	if (triple) return triple[1].trim();

	const double = trimmed.match(/^\{\{\s*([^{}]+?)\s*\}\}$/);
	if (double) return double[1].trim();

	// Legacy repair only — not a supported placeholder form
	if (/[{}]/.test(trimmed)) {
		return trimmed.replace(/[{}]/g, "").trim();
	}

	return trimmed;
}

/**
 * Extract unique variables from TipTap / email-editor content.
 *
 * Only `{{name}}` and `{{{name}}}` text placeholders are recognized,
 * plus TipTap `variable` nodes (`attrs.name`).
 */
export function extractVariablesFromContent(
	content: TemplateBlock[] | Record<string, unknown>[],
): string[] {
	const found = new Set<string>();

	function addName(name: string) {
		const normalized = normalizeVariableName(name);
		if (normalized) {
			found.add(`{{{${normalized}}}}`);
		}
	}

	function extractFromString(value: string) {
		let match: RegExpExecArray | null;
		TRIPLE_BRACE_REGEX.lastIndex = 0;
		// biome-ignore lint/suspicious/noAssignInExpressions: intentional regex loop
		while ((match = TRIPLE_BRACE_REGEX.exec(value)) !== null) {
			addName(match[1]);
		}
		DOUBLE_BRACE_REGEX.lastIndex = 0;
		// biome-ignore lint/suspicious/noAssignInExpressions: intentional regex loop
		while ((match = DOUBLE_BRACE_REGEX.exec(value)) !== null) {
			// Skip matches nested inside an already-handled triple-brace placeholder
			const start = match.index;
			if (value[start - 1] === "{" || value[start + match[0].length] === "}") {
				continue;
			}
			addName(match[1]);
		}
	}

	function walkNode(node: Record<string, unknown>) {
		if (node.type === "variable") {
			const attrs = node.attrs as Record<string, unknown> | undefined;
			if (typeof attrs?.name === "string" && attrs.name.trim()) {
				addName(attrs.name);
			}
		}

		if (typeof node.text === "string") {
			extractFromString(node.text);
		}

		const attrs = node.attrs ?? node.props;
		if (attrs && typeof attrs === "object") {
			for (const [key, val] of Object.entries(
				attrs as Record<string, unknown>,
			)) {
				if (node.type === "variable" && key === "name") continue;
				if (typeof val === "string") {
					extractFromString(val);
				}
			}
		}

		if (Array.isArray(node.content)) {
			for (const child of node.content) {
				walkNode(child as Record<string, unknown>);
			}
		}

		if (Array.isArray(node.children)) {
			for (const child of node.children) {
				walkNode(child as Record<string, unknown>);
			}
		}

		if (Array.isArray(node.marks)) {
			for (const mark of node.marks) {
				walkNode(mark as Record<string, unknown>);
			}
		}
	}

	for (const block of content) {
		walkNode(block as unknown as Record<string, unknown>);
	}

	return Array.from(found).sort();
}
