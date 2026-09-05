function parseRgb(
	cssColor: string,
): { r: number; g: number; b: number } | null {
	if (!cssColor) return null;
	const clean = cssColor.trim().toLowerCase();
	if (clean === "black" || clean === "transparent") return { r: 0, g: 0, b: 0 };
	if (clean === "white") return { r: 255, g: 255, b: 255 };
	if (clean.startsWith("#")) {
		const hex = clean.slice(1);
		if (hex.length === 3) {
			const r = Number.parseInt(hex[0]! + hex[0]!, 16);
			const g = Number.parseInt(hex[1]! + hex[1]!, 16);
			const b = Number.parseInt(hex[2]! + hex[2]!, 16);
			if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
				return { r, g, b };
			}
		} else if (hex.length === 6) {
			const r = Number.parseInt(hex.slice(0, 2), 16);
			const g = Number.parseInt(hex.slice(2, 4), 16);
			const b = Number.parseInt(hex.slice(4, 6), 16);
			if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
				return { r, g, b };
			}
		}
	}
	const directMatch = clean.match(
		/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
	);
	if (directMatch) {
		return {
			r: Number(directMatch[1]),
			g: Number(directMatch[2]),
			b: Number(directMatch[3]),
		};
	}
	if (typeof document === "undefined") return null;
	try {
		const scratch = document.createElement("div");
		scratch.style.color = cssColor;
		const resolved = scratch.style.color;
		const match = resolved.match(
			/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
		);
		if (!match) return null;
		return {
			r: Number(match[1]),
			g: Number(match[2]),
			b: Number(match[3]),
		};
	} catch {
		return null;
	}
}

function luminance(cssColor: string): number | null {
	const rgb = parseRgb(cssColor);
	if (!rgb) return null;
	return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

function isNearBlack(cssColor: string): boolean {
	const L = luminance(cssColor);
	return L !== null && L < 0.08;
}

export function isDarkColor(cssColor: string): boolean {
	const L = luminance(cssColor);
	return L !== null && L < 0.45;
}

const MUTED_ON_DARK = "rgb(196, 196, 196)";

/**
 * Theme default text is `#000000`. Dark-on-dark (including muted greys like
 * `rgb(74,74,74)`) is unreadable on charcoal email canvases.
 */
export function readableTextColor(
	background: string | undefined,
	extracted: string | undefined,
): string | undefined {
	const bg = background?.trim() || undefined;
	const text = extracted?.trim() || undefined;

	if (bg && isDarkColor(bg)) {
		if (!text || isNearBlack(text)) return "#ffffff";
		if (isDarkColor(text)) return MUTED_ON_DARK;
		return text;
	}

	if (text && !isNearBlack(text)) return text;
	if (text) return text;
	return undefined;
}

function isTransparentOrEmpty(cssColor: string): boolean {
	const v = cssColor.replace(/\s/g, "").toLowerCase();
	return !v || v === "transparent" || v === "rgba(0,0,0,0)";
}

/** The surface the text actually sits on — button fill, then ancestors, then canvas. */
function nearestBackground(el: HTMLElement, fallback: string): string {
	let current: HTMLElement | null = el;
	while (current) {
		const bg =
			current.style.backgroundColor || current.getAttribute("bgcolor") || "";
		if (bg && !isTransparentOrEmpty(bg)) return bg;
		current = current.parentElement;
	}
	return fallback;
}

function normalizeBgKey(cssColor: string): string {
	const rgb = parseRgb(cssColor);
	if (!rgb) return cssColor.replace(/\s/g, "").toLowerCase();
	return `${rgb.r},${rgb.g},${rgb.b}`;
}

/**
 * Yellow hero + navy banner + pastel cards cannot share one canvas color.
 * A global `#ffffff` then paints every card label white.
 */
export function emailHasMixedBackgrounds(root: Element): boolean {
	const colors = new Set<string>();
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = walker.currentNode;
	while (node) {
		const el = node as HTMLElement;
		const bg = el.style?.backgroundColor || el.getAttribute("bgcolor") || "";
		if (bg && !isTransparentOrEmpty(bg)) {
			colors.add(normalizeBgKey(bg));
			if (colors.size >= 2) return true;
		}
		node = walker.nextNode();
	}
	return false;
}

/** Lift inline colors that would disappear on a dark email canvas. */
export function rewriteLowContrastInlineText(
	root: Element,
	canvasBackground: string,
): void {
	if (!canvasBackground.trim() || !isDarkColor(canvasBackground)) return;

	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
	let node: Node | null = walker.currentNode;
	while (node) {
		const el = node as HTMLElement;
		const current = el.style?.color;
		if (current) {
			const next = readableTextColor(
				nearestBackground(el, canvasBackground),
				current,
			);
			if (next && next !== current) {
				el.style.color = next;
			}
		}
		node = walker.nextNode();
	}
}
