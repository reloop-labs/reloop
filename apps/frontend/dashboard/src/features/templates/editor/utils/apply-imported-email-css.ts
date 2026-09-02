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
	if (!trimmed) {
		el?.remove();
		return;
	}

	if (!el) {
		el = document.createElement("style");
		el.id = STYLE_ID;
		document.head.appendChild(el);
	}

	el.textContent = `${trimmed}\n.ProseMirror .node-container{height:auto!important;}`;
}

export function clearImportedEmailCss(): void {
	if (typeof document === "undefined") return;
	document.getElementById(STYLE_ID)?.remove();
}
