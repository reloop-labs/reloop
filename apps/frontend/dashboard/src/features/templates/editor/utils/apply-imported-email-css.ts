const STYLE_ID = "reloop-imported-email-css";

/**
 * EmailTheming's `setGlobalContent("css")` wraps the string in one selector,
 * which breaks `@import`, `@media`, and rewritten `body` rules. Inject the
 * extracted stylesheet as a real `<style>` tag instead.
 */
export function applyImportedEmailCss(css: string): void {
	if (typeof document === "undefined") return;

	let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
	const trimmed = css.trim();

	if (!el) {
		el = document.createElement("style");
		el.id = STYLE_ID;
		document.head.appendChild(el);
	}

	el.textContent = `${trimmed}
.tiptap.ProseMirror, .ProseMirror {
	min-height: 100% !important;
	width: 100% !important;
	outline: none !important;
}
.tiptap.ProseMirror .node-container,
.ProseMirror .node-container,
div[data-type="container"] {
	height: auto !important;
	min-height: 0 !important;
	max-height: none !important;
	overflow: visible !important;
	margin-left: auto !important;
	margin-right: auto !important;
	box-sizing: border-box !important;
}`;
}

export function clearImportedEmailCss(): void {
	if (typeof document === "undefined") return;
	document.getElementById(STYLE_ID)?.remove();
}
