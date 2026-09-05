export const EMAIL_DECORATION_ATTR = "data-email-decoration";

function isEmptyFill(value: string): boolean {
	const fill = value.replace(/\s/g, "").toLowerCase();
	return (
		!fill ||
		fill === "transparent" ||
		fill === "rgba(0,0,0,0)" ||
		fill === "none" ||
		fill === "inherit" ||
		fill === "initial"
	);
}

function hasPaintedBackground(el: HTMLElement): boolean {
	const color = el.style.backgroundColor || el.getAttribute("bgcolor") || "";
	if (!isEmptyFill(color)) return true;
	const withoutImages = el.style.background
		.replace(/url\([^)]*\)/gi, "")
		.trim();
	return !isEmptyFill(withoutImages);
}

function hasFillUtilityClass(el: HTMLElement): boolean {
	const cls = el.getAttribute("class") ?? "";
	return /(?:^|\s)bg-(?!transparent|none|clip-|origin-|position-|repeat-|size-|blend-|gradient-|auto|fixed|local|scroll)/.test(
		cls,
	);
}

function hasPaddingUtilityClass(el: HTMLElement): boolean {
	const cls = el.getAttribute("class") ?? "";
	return /(?:^|\s)(?:p|px|py|pt|pr|pb|pl)-(?!0(?:\s|$))/.test(cls);
}

/** True when inline CSS already paints a CTA fill (link mark or node style). */
export function cssHasPaintedBackground(cssText: string): boolean {
	if (typeof document === "undefined" || !cssText.trim()) return false;
	const scratch = document.createElement("div");
	scratch.style.cssText = cssText;
	return hasPaintedBackground(scratch);
}

/** Painted fill from inline CSS, for the inspector swatch. */
export function cssPaintedBackgroundValue(cssText: string): string {
	if (typeof document === "undefined" || !cssText.trim()) return "";
	const scratch = document.createElement("div");
	scratch.style.cssText = cssText;
	return scratch.style.backgroundColor || "";
}

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

		if (hasImg || decoration.includes("none") || hasPaintedBackground(el)) {
			el.style.setProperty("text-decoration", "none");
			el.setAttribute(EMAIL_DECORATION_ATTR, "none");
		}
	}
}

function hasButtonPadding(el: HTMLElement): boolean {
	const pad = el.style.padding.trim();
	if (pad && pad !== "0" && pad !== "0px") return true;
	const sides = [
		el.style.paddingTop,
		el.style.paddingRight,
		el.style.paddingBottom,
		el.style.paddingLeft,
	].filter((value) => value && value !== "0" && value !== "0px");
	return sides.length >= 2;
}

/**
 * TipTap's button node only matches `a[data-id="react-email-button"]`.
 * React Email `<Button>` often ships as a padded, filled `<a>` without that
 * marker, so paste becomes a paragraph + link and inspect shows Text.
 * Stamp filled CTAs so click → Button → Background color.
 */
export function stampFilledLinksAsEmailButtons(root: Element): void {
	for (const a of Array.from(root.getElementsByTagName("a"))) {
		const el = a as HTMLAnchorElement;
		if (el.getAttribute("data-id") === "react-email-button") continue;
		if (!el.getAttribute("href")) continue;
		if (el.querySelector("img")) continue;
		if (!hasPaintedBackground(el) && !hasFillUtilityClass(el)) continue;
		if (!hasButtonPadding(el) && !hasPaddingUtilityClass(el)) continue;
		el.setAttribute("data-id", "react-email-button");
	}
}
