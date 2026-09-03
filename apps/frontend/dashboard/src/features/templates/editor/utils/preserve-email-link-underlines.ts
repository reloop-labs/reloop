export const EMAIL_DECORATION_ATTR = "data-email-decoration";

/**
 * React Email's Link.renderHTML prepends the theme's
 * `text-decoration: underline` onto every `a.node-link`. Canvas CSS must not
 * answer that with a blanket `none !important` — that hides Dither CTAs
 * once TipTap unwraps `<u>`.
 *
 * Stamp the source intent on the anchor. Underline wins when the HTML has
 * `<u>` or `text-decoration: underline` (Dither also sets
 * `text-decoration-line: none` on the same node). Explicit `none` and
 * image links stay un-underlined (Arcane "Start Exploring" / Unsubscribe).
 */
export function preserveEmailLinkUnderlines(root: Element): void {
	for (const a of Array.from(root.getElementsByTagName("a"))) {
		const el = a as HTMLAnchorElement;
		const wrappedInU = Boolean(el.querySelector("u"));
		const hasImg = Boolean(el.querySelector("img"));
		const decoration =
			`${el.style.textDecoration} ${el.style.textDecorationLine}`.toLowerCase();
		const wantsUnderline =
			!hasImg && (wrappedInU || decoration.includes("underline"));

		el.style.removeProperty("text-decoration-line");

		if (wantsUnderline) {
			el.style.setProperty("text-decoration", "underline");
			el.setAttribute(EMAIL_DECORATION_ATTR, "underline");
			continue;
		}

		if (hasImg || decoration.includes("none")) {
			el.style.setProperty("text-decoration", "none");
			el.setAttribute(EMAIL_DECORATION_ATTR, "none");
		}
	}
}
