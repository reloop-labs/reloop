import type { Editor } from "@tiptap/core";
import { EMAIL_FONT_COLOR_MARK } from "./email-starter-kit";

export type InspectorTextStyleProp =
	| "color"
	| "fontSize"
	| "lineHeight"
	| "letterSpacing";

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
}

export function formatInspectorStyleForCss(
	prop: InspectorTextStyleProp,
	value: string | number,
): string {
	if (prop === "color") return String(value);
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

/** Paints the selected run. Returns false when there is no range. */
export function applySelectionFontColor(editor: Editor, color: string): boolean {
	if (editor.state.selection.empty) return false;
	return editor
		.chain()
		.focus()
		.setMark(EMAIL_FONT_COLOR_MARK, { color })
		.run();
}
