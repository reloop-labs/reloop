import type { JSONContent } from "@tiptap/react";

const PLAIN_NODE_TYPES = new Set(["doc", "paragraph", "text", "hardBreak"]);

/**
 * True when the compose body is only unformatted paragraphs and line breaks.
 * Such messages are sent as text/plain only: no HTML part, no tracking,
 * and they read like a normal personal email in every client.
 */
export function isPlainTextDocument(node: JSONContent): boolean {
	if (!node.type || !PLAIN_NODE_TYPES.has(node.type)) return false;
	if (node.marks && node.marks.length > 0) return false;
	const attrs = node.attrs ?? {};
	if (attrs.alignment && attrs.alignment !== "left") return false;
	if (attrs.style || attrs.class) return false;
	return (node.content ?? []).every(isPlainTextDocument);
}

/**
 * Plain-text body for a document that passed isPlainTextDocument:
 * paragraphs separated by a blank line, hard breaks as newlines.
 * Not run through an HTML-to-text renderer, so lines are never re-wrapped.
 */
export function plainTextFromDocument(doc: JSONContent): string {
	const paragraphs = (doc.content ?? []).map((paragraph) =>
		(paragraph.content ?? [])
			.map((node) => (node.type === "hardBreak" ? "\n" : (node.text ?? "")))
			.join(""),
	);
	return paragraphs
		.join("\n\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
