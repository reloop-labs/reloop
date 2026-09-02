/**
 * Sanitize HTML for a sandboxed email preview iframe.
 *
 * Unlike the visual-editor sanitizer, this keeps email layout intact
 * (`<style>`, tables, `align`, fonts, media-query classes). It only strips
 * executable markup so `srcDoc` cannot run scripts.
 */

const EXECUTABLE_TAGS = new Set([
	"script",
	"iframe",
	"object",
	"embed",
	"applet",
	"base",
]);

const URL_ATTRS = [
	"href",
	"src",
	"action",
	"formaction",
	"xlink:href",
] as const;

function isJavascriptUrl(value: string): boolean {
	const trimmed = value.trim().toLowerCase();
	return (
		trimmed.startsWith("javascript:") ||
		trimmed.startsWith("vbscript:") ||
		trimmed.startsWith("data:text/html")
	);
}

export function sanitizePreviewHtml(rawHtml: string): string {
	if (!rawHtml.trim()) return "";

	const parser = new DOMParser();
	const doc = parser.parseFromString(rawHtml, "text/html");

	for (const tag of EXECUTABLE_TAGS) {
		for (const el of Array.from(doc.querySelectorAll(tag))) {
			el.remove();
		}
	}

	for (const el of Array.from(doc.querySelectorAll("meta"))) {
		const httpEquiv = el.getAttribute("http-equiv")?.toLowerCase();
		if (httpEquiv === "refresh") {
			el.remove();
		}
	}

	const walker = doc.createTreeWalker(
		doc.documentElement,
		NodeFilter.SHOW_ELEMENT,
	);
	const elements: Element[] = [];
	let node: Node | null = walker.currentNode;
	while (node) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			elements.push(node as Element);
		}
		node = walker.nextNode();
	}

	for (const el of elements) {
		for (const attr of Array.from(el.attributes)) {
			const name = attr.name.toLowerCase();
			if (name.startsWith("on")) {
				el.removeAttribute(attr.name);
			}
		}

		for (const attr of URL_ATTRS) {
			const value = el.getAttribute(attr);
			if (value && isJavascriptUrl(value)) {
				el.removeAttribute(attr);
			}
		}
	}

	const doctype = doc.doctype
		? `<!DOCTYPE ${doc.doctype.name}>`
		: "<!DOCTYPE html>";
	return `${doctype}${doc.documentElement.outerHTML}`;
}
