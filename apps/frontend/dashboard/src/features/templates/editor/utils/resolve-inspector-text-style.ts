import type { Editor } from "@tiptap/core";
import { EMAIL_FONT_COLOR_MARK } from "./email-starter-kit";

export type InspectorTextStyleProp =
	| "color"
	| "fontSize"
	| "lineHeight"
	| "letterSpacing"
	| "fontFamily"
	| "fontWeight";

/** Inline `style` on the active link mark — Dither CTAs store typography here. */
export function getActiveLinkCss(editor: Editor | null | undefined): string {
	if (!editor?.isActive("link")) return "";
	const fromAttrs = String(editor.getAttributes("link")?.style ?? "");
	if (fromAttrs) return fromAttrs;
	const { from } = editor.state.selection;
	const mark = editor.state.doc
		.resolve(from)
		.marks()
		.find((m) => m.type.name === "link");
	return String(mark?.attrs?.style ?? "");
}

function kebabToCamel(prop: string): string {
	return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function inlineCssToRecord(cssText: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const part of cssText.split(";")) {
		const colon = part.indexOf(":");
		if (colon < 0) continue;
		const key = kebabToCamel(part.slice(0, colon).trim());
		const value = part.slice(colon + 1).trim();
		if (key && value) out[key] = value;
	}
	return out;
}

function rgbToHex(value: string): string {
	const match = value.trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
	if (!match) return value;
	const hex = [match[1], match[2], match[3]]
		.map((n) => Number(n).toString(16).padStart(2, "0"))
		.join("");
	return `#${hex}`;
}

/** Normalize any CSS color to hex for inspector display (rgb() → #hex). */
export function normalizeColorToHex(
	value: string | number | undefined,
): string {
	if (value === undefined || value === null) return "";
	const s = String(value).trim();
	if (!s) return "";
	if (s.startsWith("#")) {
		// Expand #rgb / #rgba to six digits so swatch + input stay consistent.
		const h = s.slice(1);
		if (h.length === 3 || h.length === 4) {
			return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
		}
		return s;
	}
	if (/^rgba?\(/i.test(s)) return rgbToHex(s);
	return s;
}

/** Normalize font-weight keywords so the inspector select can match them. */
export function normalizeFontWeightDisplay(
	value: string | number | undefined,
): string {
	if (value === undefined || value === null) return "";
	const s = String(value).trim().toLowerCase();
	if (!s) return "";
	if (s === "bold") return "700";
	if (s === "normal") return "400";
	return String(value).trim();
}

/**
 * Convert a raw line-height (unitless ratio, %, px, em) to the percent number
 * the inspector control displays. Unitless ratios (0–4, e.g. Dither's 1.5)
 * become percent (150); px values convert via the font size when known.
 */
export function displayLineHeightPercent(
	raw: string | number | undefined,
	fontSizePx?: number,
): number | "" {
	if (raw === undefined || raw === null) return "";
	if (typeof raw === "number") {
		if (!Number.isFinite(raw)) return "";
		if (raw > 0 && raw <= 4) return Math.round(raw * 100);
		return Math.round(raw);
	}
	const s = raw.trim();
	if (!s) return "";
	if (s.endsWith("%")) {
		const n = Number.parseFloat(s);
		return Number.isFinite(n) ? n : "";
	}
	const n = Number.parseFloat(s);
	if (!Number.isFinite(n)) return "";
	const lower = s.toLowerCase();
	if (lower.endsWith("em")) return Math.round(n * 100);
	if (lower.endsWith("rem")) {
		if (fontSizePx && fontSizePx > 0) {
			return Math.round(((n * 16) / fontSizePx) * 100);
		}
		return Math.round(n * 100);
	}
	if (lower.endsWith("px")) {
		if (fontSizePx && fontSizePx > 0) {
			return Math.round((n / fontSizePx) * 100);
		}
		return Math.round(n);
	}
	// Unitless: ratio (0–4] → percent, otherwise already percent-ish.
	if (n > 0 && n <= 4) return Math.round(n * 100);
	return Math.round(n);
}

/** Parse a raw font size to px for line-height % conversion. */
export function fontSizePxFromRaw(
	raw: string | number | undefined,
): number | undefined {
	if (raw === undefined || raw === null) return undefined;
	if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
	const px = parsePx(raw.trim());
	return px;
}

/**
 * Walk up from the current selection through ancestor nodes and return the
 * first explicit inline-style value for a camelCase prop. Lets the inspector
 * show the *effective* value (e.g. gray text inherited from a section/cell)
 * instead of an empty fallback when the block itself has no local value.
 */
export function getAncestorInlineStyleProp(
	editor: Editor | null | undefined,
	prop: string,
): string | undefined {
	if (!editor) return undefined;
	try {
		const { from } = editor.state.selection;
		const $pos = editor.state.doc.resolve(from);
		for (let depth = $pos.depth; depth > 0; depth--) {
			const node = $pos.node(depth);
			const style = (node.attrs as Record<string, unknown> | undefined)?.style;
			if (typeof style !== "string" || !style) continue;
			const v = inlineCssToRecord(style)[prop];
			if (v !== undefined && v !== "") return v;
		}
	} catch {
		return undefined;
	}
	return undefined;
}

function parsePx(value: string): number | undefined {
	const match = value.trim().match(/^(-?\d*\.?\d+)(px|em|rem)?$/i);
	if (!match?.[1]) return undefined;
	const n = Number.parseFloat(match[1]);
	const unit = (match[2] ?? "px").toLowerCase();
	if (unit === "em" || unit === "rem") return Math.round(n * 16);
	return n;
}

function parseLineHeightPercent(value: string): number | undefined {
	const trimmed = value.trim();
	if (trimmed.endsWith("%")) {
		const n = Number.parseFloat(trimmed);
		return Number.isFinite(n) ? n : undefined;
	}
	const px = parsePx(trimmed);
	if (px === undefined) return undefined;
	if (!/px|em|rem$/i.test(trimmed) && px > 0 && px <= 4) {
		return Math.round(px * 100);
	}
	return px;
}

export function valueFromInlineCss(
	cssText: string,
	prop: InspectorTextStyleProp,
): string | number | undefined {
	const css = inlineCssToRecord(cssText);
	if (prop === "color") {
		const color = css.color;
		return color ? rgbToHex(color) : undefined;
	}
	if (prop === "fontSize") {
		return css.fontSize ? parsePx(css.fontSize) : undefined;
	}
	if (prop === "letterSpacing") {
		return css.letterSpacing ? parsePx(css.letterSpacing) : undefined;
	}
	if (prop === "lineHeight") {
		return css.lineHeight ? parseLineHeightPercent(css.lineHeight) : undefined;
	}
	if (prop === "fontFamily") {
		return css.fontFamily
			? css.fontFamily.replace(/^['"]|['"]$/g, "")
			: undefined;
	}
	if (prop === "fontWeight") {
		return css.fontWeight ? css.fontWeight.trim() : undefined;
	}
}

export function formatInspectorStyleForCss(
	prop: InspectorTextStyleProp,
	value: string | number,
): string {
	if (prop === "color") return String(value);
	if (prop === "fontFamily" || prop === "fontWeight") return String(value);
	if (prop === "lineHeight") {
		const n = typeof value === "number" ? value : Number.parseFloat(value);
		if (Number.isFinite(n) && n > 4) return String(n / 100);
		return String(value);
	}
	if (typeof value === "number") return `${value}px`;
	return String(value);
}

const CSS_PROP_NAMES: Record<InspectorTextStyleProp, string> = {
	color: "color",
	fontSize: "font-size",
	lineHeight: "line-height",
	letterSpacing: "letter-spacing",
	fontFamily: "font-family",
	fontWeight: "font-weight",
};

export function setInlineCssProp(
	cssText: string,
	prop: InspectorTextStyleProp,
	value: string | number,
): string {
	return setInlineCssDeclaration(
		cssText,
		prop,
		formatInspectorStyleForCss(prop, value),
	);
}

/** Set any camelCase CSS property on an inline style string. */
export function setInlineCssDeclaration(
	cssText: string,
	camelProp: string,
	value: string,
): string {
	const css = inlineCssToRecord(cssText);
	css[camelProp] = value;
	return Object.entries(css)
		.map(([key, val]) => {
			const kebab =
				CSS_PROP_NAMES[key as InspectorTextStyleProp] ??
				key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
			return `${kebab}: ${val}`;
		})
		.join("; ");
}

/** Read a px length from an inline style string. */
export function numericPxFromCss(
	cssText: string,
	camelProp: string,
): number | "" {
	if (typeof document === "undefined" || !cssText.trim()) return "";
	const scratch = document.createElement("div");
	scratch.style.cssText = cssText;
	const kebab = camelProp.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
	const raw = scratch.style.getPropertyValue(kebab);
	const n = Number.parseFloat(raw);
	return Number.isFinite(n) ? n : "";
}

/**
 * Inspector.Text reads the parent paragraph. Dither puts font-size / color
 * on the <a> mark. When a link is selected, those inline styles win.
 */
export function resolveInspectorTextStyle(options: {
	prop: InspectorTextStyleProp;
	parentValue: string | number | undefined;
	linkCss?: string;
}): string | number | undefined {
	if (options.linkCss) {
		const fromLink = valueFromInlineCss(options.linkCss, options.prop);
		if (fromLink !== undefined && fromLink !== "") return fromLink;
	}
	return options.parentValue;
}

export function getSelectionFontColor(
	editor: Editor | null | undefined,
): string {
	if (!editor?.isActive(EMAIL_FONT_COLOR_MARK)) return "";
	return String(editor.getAttributes(EMAIL_FONT_COLOR_MARK).color ?? "");
}

/**
 * Color from any mark covering the selection (emailFontColor or any future
 * mark carrying a `color` attr). Uniform single color wins; mixed → "".
 */
export function getSelectionMarkColor(
	editor: Editor | null | undefined,
): string {
	if (!editor) return "";
	const found = new Set<string>();
	try {
		const { from, to } = editor.state.selection;
		editor.state.doc.nodesBetween(from, to, (node) => {
			for (const mark of node.marks ?? []) {
				const c = (mark.attrs as Record<string, unknown> | undefined)?.color;
				if (typeof c === "string" && c.trim()) found.add(c.trim());
			}
		});
	} catch {
		return "";
	}
	if (found.size === 1) return [...found][0] as string;
	return "";
}

/** Theme-level text color (container → body global inputs), if explicitly set. */
export function getThemeColorFallback(
	editor: Editor | null | undefined,
): string | undefined {
	if (!editor) return undefined;
	try {
		let data: Record<string, unknown> | null = null;
		editor.state.doc.descendants((node) => {
			if (node.type.name === "globalContent") {
				data = (node.attrs as Record<string, unknown> | undefined)
					?.data as Record<string, unknown>;
				return false;
			}
		});
		const styles = (data as Record<string, unknown> | null)?.styles;
		if (!Array.isArray(styles)) return undefined;
		for (const id of ["container", "body"]) {
			const group = (styles as Array<Record<string, unknown>>).find(
				(g) => g?.id === id,
			);
			const inputs = group?.inputs;
			if (!Array.isArray(inputs)) continue;
			const v = (inputs as Array<Record<string, unknown>>).find(
				(i) => i?.prop === "color",
			)?.value;
			if (typeof v === "string" && v.trim()) return v.trim();
		}
	} catch {
		return undefined;
	}
	return undefined;
}

/**
 * Last-resort ground truth: the rendered color of the selected block in the
 * canvas (covers theme CSS + imported CSS that live outside editor state).
 */
export function getComputedSelectionColor(
	editor: Editor | null | undefined,
): string {
	const view = (editor as { view?: unknown } | null | undefined)?.view as
		| {
				domAtPos?: (pos: number) => Node | null;
		  }
		| undefined;
	if (!editor || !view?.domAtPos || typeof window === "undefined") return "";
	try {
		const { from } = editor.state.selection;
		const dom = view.domAtPos(from);
		const el =
			dom instanceof HTMLElement ? dom : (dom as Node | null)?.parentElement;
		if (!el) return "";
		const block = el.closest?.(
			"p,h1,h2,h3,li,td,th,div,section,blockquote",
		) as HTMLElement | null;
		const c = window.getComputedStyle(block ?? el).color;
		return typeof c === "string" ? c : "";
	} catch {
		return "";
	}
}

/** Paints the selected run. Returns false when there is no range. */
export function applySelectionFontColor(
	editor: Editor,
	color: string,
): boolean {
	if (editor.state.selection.empty) return false;
	return editor.chain().focus().setMark(EMAIL_FONT_COLOR_MARK, { color }).run();
}

/** Resolves effective alignment by prioritizing inline CSS style over node attribute */
export function getResolvedAlignment(
	editor: Editor | null | undefined,
	fallback = "left",
): string {
	if (!editor) return fallback;
	const { selection } = editor.state;
	const { from, to } = selection;

	// 0. Check selected non-textblock nodes directly (e.g. NodeSelection on button or image)
	let foundFromNode: string | undefined;
	editor.state.doc.nodesBetween(from, to, (node) => {
		if (node.type.name === "button" || node.type.name === "image") {
			if (node.attrs?.alignment)
				foundFromNode = String(node.attrs.alignment).toLowerCase();
			else if (node.attrs?.align)
				foundFromNode = String(node.attrs.align).toLowerCase();
			else if (node.type.name === "image" && node.attrs?.style) {
				const style = String(node.attrs.style);
				if (
					/margin-left\s*:\s*auto\s*;\s*margin-right\s*:\s*auto/i.test(style)
				) {
					foundFromNode = "center";
				} else if (
					/margin-left\s*:\s*auto\s*;\s*margin-right\s*:\s*0/i.test(style)
				) {
					foundFromNode = "right";
				}
			}
		}
	});
	if (foundFromNode) return foundFromNode;

	// 1. Check style on textblock nodes in selection
	let foundFromStyle: string | undefined;
	editor.state.doc.nodesBetween(from, to, (node) => {
		if (node.isTextblock && node.attrs?.style) {
			const match = String(node.attrs.style).match(
				/text-align\s*:\s*(left|center|right|justify)/i,
			);
			if (match?.[1]) foundFromStyle = match[1].toLowerCase();
		}
	});
	if (foundFromStyle) return foundFromStyle;

	// 2. Check alignment attribute on textblock
	let foundFromAttr: string | undefined;
	editor.state.doc.nodesBetween(from, to, (node) => {
		if (node.isTextblock) {
			if (node.attrs?.alignment)
				foundFromAttr = String(node.attrs.alignment).toLowerCase();
			else if (node.attrs?.align)
				foundFromAttr = String(node.attrs.align).toLowerCase();
		}
	});
	if (foundFromAttr) return foundFromAttr;

	// 3. Check enclosing tableCell / column / table if any
	const $from = editor.state.doc.resolve(from);
	for (let depth = $from.depth; depth > 0; depth--) {
		const node = $from.node(depth);
		if (
			node.type.name === "tableCell" ||
			node.type.name === "tableHeader" ||
			node.type.name === "columnsColumn" ||
			node.type.name === "table"
		) {
			if (node.attrs?.style) {
				const match = String(node.attrs.style).match(
					/text-align\s*:\s*(left|center|right|justify)/i,
				);
				if (match?.[1]) return match[1].toLowerCase();
			}
			if (node.attrs?.alignment)
				return String(node.attrs.alignment).toLowerCase();
			if (node.attrs?.align) return String(node.attrs.align).toLowerCase();
		}
	}

	return fallback;
}

/**
 * Remove only horizontal alignment declarations from an inline style string.
 * A naive `/\balign\s*:/` also matches inside `text-align` and
 * `vertical-align` (word boundary between `-` and `a`), corrupting
 * `vertical-align: middle` into `vertical-` junk and shifting text vertically.
 * This strips `text-align` + standalone `align` only, leaving
 * `vertical-align` untouched, and cleans legacy `text-`/`vertical-` fragments.
 */
export function stripHorizontalAlignCss(style: string): string {
	return style
		.replace(/\btext-align\s*:\s*[^;]+;?/gi, "")
		.replace(/(^|;)\s*align\s*:\s*[^;]+;?/gi, "$1")
		.replace(/(?:text-|vertical-)\s*(?:;|$)/gi, "")
		.replace(/;{2,}/g, ";")
		.trim();
}

/**
 * Applies text alignment uniformly across textblock nodes in range, button/image nodes,
 * and enclosing tableCell / column, synchronizing both the TipTap attribute and inline CSS.
 */
export function applyTextAlignment(editor: Editor, alignment: string): boolean {
	return editor.commands.command(({ tr, state }) => {
		const { from, to } = state.selection;

		// 1. Update textblock nodes and block nodes (button, image, etc.) in range
		state.doc.nodesBetween(from, to, (node, pos) => {
			if (
				node.isTextblock ||
				node.type.name === "button" ||
				node.type.name === "image"
			) {
				const style = String(node.attrs.style || "");
				const clean = stripHorizontalAlignCss(style);
				let newStyle = clean;
				if (node.isTextblock) {
					newStyle = clean
						? `${clean}; text-align: ${alignment};`
						: `text-align: ${alignment};`;
				}
				if (node.type.name === "image") {
					const mClean = clean
						.replace(/margin-left\s*:\s*[^;]+;?/gi, "")
						.replace(/margin-right\s*:\s*[^;]+;?/gi, "")
						.replace(/display\s*:\s*[^;]+;?/gi, "")
						.trim();
					if (alignment === "center") {
						newStyle =
							`${mClean}; display: block; margin-left: auto; margin-right: auto;`.replace(
								/^;\s*/,
								"",
							);
					} else if (alignment === "right") {
						newStyle =
							`${mClean}; display: block; margin-left: auto; margin-right: 0;`.replace(
								/^;\s*/,
								"",
							);
					} else {
						newStyle =
							`${mClean}; display: block; margin-left: 0; margin-right: auto;`.replace(
								/^;\s*/,
								"",
							);
					}
				}
				tr.setNodeMarkup(pos, null, {
					...node.attrs,
					alignment,
					align: alignment,
					style: newStyle,
				});
			}
		});

		// 2. Also update enclosing tableCell / column if inside one
		const $from = state.doc.resolve(from);
		for (let depth = $from.depth; depth > 0; depth--) {
			const node = $from.node(depth);
			if (
				node.type.name === "tableCell" ||
				node.type.name === "tableHeader" ||
				node.type.name === "columnsColumn"
			) {
				const cellPos = $from.before(depth);
				const style = String(node.attrs.style || "");
				const clean = stripHorizontalAlignCss(style);
				const newStyle = clean
					? `${clean}; text-align: ${alignment};`
					: `text-align: ${alignment};`;
				tr.setNodeMarkup(cellPos, null, {
					...node.attrs,
					alignment,
					align: alignment,
					style: newStyle,
				});
			}
		}

		return true;
	});
}
