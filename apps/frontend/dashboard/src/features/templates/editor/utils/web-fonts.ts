import { MODERN_WEB_FONTS } from "../inspector/font-family-select";

/**
 * Weights Google Fonts serves for each picker family. A weight a family
 * lacks makes css2 reject the whole request, so these are explicit.
 */
const WEIGHTS: Record<string, string> = {
	Lato: "300;400;700",
	Merriweather: "300;400;700",
	"Playfair Display": "400;500;600;700",
};
const DEFAULT_WEIGHTS = "300;400;500;600;700";

const LINK_ATTR = "data-reloop-web-fonts";

export function googleFontsHref(families: string[]): string {
	const params = families
		.map(
			(family) =>
				`family=${family.replace(/ /g, "+")}:wght@${WEIGHTS[family] ?? DEFAULT_WEIGHTS}`,
		)
		.join("&");
	return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** Picker web fonts referenced in `font-family` declarations of the HTML. */
export function findUsedWebFonts(html: string): string[] {
	const declarations = html.match(/font-family\s*:[^;"}]*/gi) ?? [];
	const used = new Set<string>();
	for (const declaration of declarations) {
		const normalized = declaration.replace(/&#x27;|&quot;|['"]/g, "");
		for (const font of MODERN_WEB_FONTS) {
			const pattern = new RegExp(`[:,]\\s*${font.family}\\s*(,|$)`, "i");
			if (pattern.test(normalized)) used.add(font.family);
		}
	}
	return [...used];
}

/**
 * Add a Google Fonts stylesheet to exported email HTML for the picker web
 * fonts it uses. Clients that support web fonts (Apple Mail, iOS) render
 * them; the rest use the fallback stack already in each declaration.
 */
export function injectWebFontLinks(html: string): string {
	if (html.includes(LINK_ATTR)) return html;
	const families = findUsedWebFonts(html);
	if (families.length === 0) return html;
	const link = `<link ${LINK_ATTR} rel="stylesheet" href="${googleFontsHref(families).replace(/&/g, "&amp;")}" />`;
	if (/<\/head>/i.test(html))
		return html.replace(/<\/head>/i, `${link}</head>`);
	return html;
}

/** Load every picker web font into the dashboard so the canvas shows them. */
export function ensureCanvasWebFonts(): void {
	if (typeof document === "undefined") return;
	if (document.head.querySelector(`link[${LINK_ATTR}]`)) return;
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = googleFontsHref(MODERN_WEB_FONTS.map((font) => font.family));
	link.setAttribute(LINK_ATTR, "");
	document.head.appendChild(link);
}
