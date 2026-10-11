const STYLE_ID = "reloop-imported-email-css";

/** `@import url(...)` or `@import "..."`; Google Fonts URLs contain `;`. */
const CSS_IMPORT =
	/@import\s+(?:url\(\s*(['"]?)[^'")]*\1\s*\)|(['"])[^'"]*\2)[^;]*;/g;

/**
 * Browsers ignore `@import` after any other rule. Theme parsing prepends
 * base and body rules ahead of the email's font imports, which silently
 * dropped web fonts (Google Fonts links) from the canvas.
 */
export function hoistCssImports(css: string): string {
	const imports = css.match(CSS_IMPORT);
	if (!imports) return css;
	const rest = css.replace(CSS_IMPORT, "").trim();
	return `${[...new Set(imports)].join("\n")}\n${rest}`;
}

/**
 * EmailTheming's `setGlobalContent("css")` wraps the string in one selector,
 * which breaks `@import`, `@media`, and rewritten `body` rules. Inject the
 * extracted stylesheet as a real `<style>` tag instead.
 */
export function applyImportedEmailCss(css: string): void {
	if (typeof document === "undefined") return;

	let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
	const trimmed = hoistCssImports(css.trim());

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
	color-scheme: light;
	color: #000000;
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
}
.tiptap.ProseMirror a:has(img),
.ProseMirror a:has(img) {
	text-decoration: none !important;
}
.tiptap.ProseMirror a[data-email-decoration="none"],
.ProseMirror a[data-email-decoration="none"] {
	text-decoration: none !important;
}
.tiptap.ProseMirror a[data-email-decoration="underline"],
.ProseMirror a[data-email-decoration="underline"] {
	text-decoration: underline !important;
}`;
}

export function clearImportedEmailCss(): void {
	if (typeof document === "undefined") return;
	document.getElementById(STYLE_ID)?.remove();
}
