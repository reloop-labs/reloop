function parseRgb(
	cssColor: string,
): { r: number; g: number; b: number } | null {
	if (typeof document === "undefined") return null;
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
			const next = readableTextColor(canvasBackground, current);
			if (next && next !== current) {
				el.style.color = next;
			}
		}
		node = walker.nextNode();
	}
}
