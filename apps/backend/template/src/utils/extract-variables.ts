import type { TemplateBlock } from "@reloop/db/schema";

const VARIABLE_REGEX = /\{\{\{([^{}]+)\}\}\}/g;

/**
 * Extract all unique {{{variable}}} placeholders from a TipTap JSON content tree.
 *
 * Walks the content recursively, inspecting:
 *   - Text node content strings
 *   - Node attribute values (strings only — e.g. link hrefs, button labels)
 *
 * @param content - Array of TipTap/email-editor block nodes
 * @returns De-duplicated, sorted array of full placeholder strings, e.g. ["{{{company.name}}}", "{{{user.firstName}}}"]
 */
export function extractVariablesFromContent(
	content: TemplateBlock[] | Record<string, unknown>[],
): string[] {
	const found = new Set<string>();

	function extractFromString(value: string) {
		let match: RegExpExecArray | null;
		VARIABLE_REGEX.lastIndex = 0;
		// biome-ignore lint/suspicious/noAssignInExpressions: intentional regex loop
		while ((match = VARIABLE_REGEX.exec(value)) !== null) {
			found.add(match[0]); // e.g. "{{user.firstName}}"
		}
	}

	function walkNode(node: Record<string, unknown>) {
		// Inspect text content
		if (typeof node.text === "string") {
			extractFromString(node.text);
		}

		// Inspect all string attribute values (href, src, alt, label, etc.)
		const attrs = node.attrs ?? node.props;
		if (attrs && typeof attrs === "object") {
			for (const val of Object.values(attrs as Record<string, unknown>)) {
				if (typeof val === "string") {
					extractFromString(val);
				}
			}
		}

		// Recurse into content array
		if (Array.isArray(node.content)) {
			for (const child of node.content) {
				walkNode(child as Record<string, unknown>);
			}
		}

		// Recurse into children array (email-editor block format)
		if (Array.isArray(node.children)) {
			for (const child of node.children) {
				walkNode(child as Record<string, unknown>);
			}
		}

		// Recurse into marks (inline marks like links carry href)
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
