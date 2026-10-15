/**
 * html-to-text.ts
 *
 * Builds the text/plain alternative for HTML-only sends, using the same
 * `html-to-text` converter and selectors as React Email's `render(…, {
 * plainText: true })` so API sends and template sends produce identical text.
 */

import { convert, type SelectorDefinition } from "html-to-text";

const PLAIN_TEXT_SELECTORS: SelectorDefinition[] = [
	{ selector: "img", format: "skip" },
	{ selector: "[data-skip-in-text=true]", format: "skip" },
	{ selector: "a", options: { linkBrackets: false } },
];

export function htmlToText(html: string): string {
	return convert(html, { selectors: PLAIN_TEXT_SELECTORS }).trim();
}
