/**
 * Color math for rendering light-designed emails on the dark inbox panel.
 * Pure functions (no DOM) so they can be unit tested.
 */

export type Rgb = { r: number; g: number; b: number };

/** Approximate dark inbox panel color, used when an email sets no background. */
export const DARK_PANEL: Rgb = { r: 10, g: 10, b: 10 };

const NAMED: Record<string, string> = {
	black: "#000000",
	white: "#ffffff",
	gray: "#808080",
	grey: "#808080",
	silver: "#c0c0c0",
	red: "#ff0000",
	maroon: "#800000",
	green: "#008000",
	navy: "#000080",
	blue: "#0000ff",
	purple: "#800080",
	teal: "#008080",
	olive: "#808000",
	whitesmoke: "#f5f5f5",
	gainsboro: "#dcdcdc",
	lightgray: "#d3d3d3",
	lightgrey: "#d3d3d3",
	darkgray: "#a9a9a9",
	darkgrey: "#a9a9a9",
	dimgray: "#696969",
	dimgrey: "#696969",
	ghostwhite: "#f8f8ff",
	aliceblue: "#f0f8ff",
	ivory: "#fffff0",
	snow: "#fffafa",
	floralwhite: "#fffaf0",
	linen: "#faf0e6",
	beige: "#f5f5dc",
};

/** Parses hex, rgb(a), hsl(a) and common named colors. Returns null for transparent / unknown. */
export const parseColor = (input: string | null | undefined): Rgb | null => {
	if (!input) return null;
	const raw = input.trim().toLowerCase();
	const v = NAMED[raw] ?? raw;

	const hex = v.match(/^#([0-9a-f]{3,8})$/);
	if (hex) {
		let h = hex[1] ?? "";
		if (h.length === 3 || h.length === 4) {
			h = h
				.slice(0, 3)
				.split("")
				.map((c) => c + c)
				.join("");
		}
		if (h.length === 8 && Number.parseInt(h.slice(6, 8), 16) === 0) return null;
		if (h.length !== 6 && h.length !== 8) return null;
		return {
			r: Number.parseInt(h.slice(0, 2), 16),
			g: Number.parseInt(h.slice(2, 4), 16),
			b: Number.parseInt(h.slice(4, 6), 16),
		};
	}

	const fn = v.match(/^(rgba?|hsla?)\(([^)]*)\)$/);
	if (fn) {
		const kind = fn[1] ?? "";
		const parts = (fn[2] ?? "")
			.split(/[\s,/]+/)
			.filter(Boolean)
			.map((p) => p.trim());
		const [p0 = "", p1 = "", p2 = "", p3] = parts;
		if (parts.length < 3) return null;
		if (p3 !== undefined && Number.parseFloat(p3) === 0) return null;
		if (kind.startsWith("rgb")) {
			const ch = (p: string) =>
				p.endsWith("%")
					? Math.round((Number.parseFloat(p) / 100) * 255)
					: Number.parseFloat(p);
			const r = ch(p0);
			const g = ch(p1);
			const b = ch(p2);
			if ([r, g, b].some(Number.isNaN)) return null;
			return { r: clamp255(r), g: clamp255(g), b: clamp255(b) };
		}
		const h = Number.parseFloat(p0);
		const s = Number.parseFloat(p1) / 100;
		const l = Number.parseFloat(p2) / 100;
		if ([h, s, l].some(Number.isNaN)) return null;
		return hslToRgb({ h, s, l });
	}

	return null;
};

/**
 * Pulls a color out of a `background` shorthand ("#fff url(x) no-repeat").
 */
export const extractColorToken = (value: string): string | null => {
	const m = value.match(/#[0-9a-f]{3,8}\b|(?:rgba?|hsla?)\([^)]*\)/i);
	if (m) return m[0];
	for (const word of value.toLowerCase().split(/\s+/)) {
		if (NAMED[word]) return word;
	}
	return null;
};

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

const channel = (c: number) => {
	const s = c / 255;
	return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export const luminance = ({ r, g, b }: Rgb) =>
	0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

export const contrast = (a: Rgb, b: Rgb) => {
	const la = luminance(a);
	const lb = luminance(b);
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** Max - min channel, 0..1. Low chroma = near-neutral (white, grays, pale tints). */
const chroma = ({ r, g, b }: Rgb) =>
	(Math.max(r, g, b) - Math.min(r, g, b)) / 255;

type Hsl = { h: number; s: number; l: number };

const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	const d = max - min;
	if (d === 0) return { h: 0, s: 0, l };
	const s = d / (1 - Math.abs(2 * l - 1));
	let h: number;
	if (max === rn) h = ((gn - bn) / d) % 6;
	else if (max === gn) h = (bn - rn) / d + 2;
	else h = (rn - gn) / d + 4;
	return { h: (h * 60 + 360) % 360, s, l };
};

const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	const [r, g, b] =
		h < 60
			? [c, x, 0]
			: h < 120
				? [x, c, 0]
				: h < 180
					? [0, c, x]
					: h < 240
						? [0, x, c]
						: h < 300
							? [x, 0, c]
							: [c, 0, x];
	return {
		r: clamp255((r + m) * 255),
		g: clamp255((g + m) * 255),
		b: clamp255((b + m) * 255),
	};
};

export const toCss = ({ r, g, b }: Rgb) => `rgb(${r}, ${g}, ${b})`;

/**
 * Dark-mode mapping for a background the email set.
 * - near-white neutrals → null (transparent, blends into the panel)
 * - light, low-chroma tints (gray cards, pale callouts) → same hue, inverted lightness
 * - anything saturated or already dark (brand buttons, dark headers) → unchanged
 */
export const darkenBackground = (color: Rgb): Rgb | null => {
	if (luminance(color) < 0.5 || chroma(color) > 0.3) return color;
	const hsl = rgbToHsl(color);
	if (hsl.l > 0.97 && chroma(color) < 0.05) return null;
	return hslToRgb({ ...hsl, l: Math.max(0.06, 1 - hsl.l) });
};

/**
 * Dark-mode mapping for a text color, given the (already adapted) background
 * behind it. Only touches text that would be hard to read on a dark background.
 */
export const lightenText = (color: Rgb, background: Rgb): Rgb => {
	if (luminance(background) > 0.4) return color;
	if (contrast(color, background) >= 4.5) return color;
	const hsl = rgbToHsl(color);
	return hslToRgb({ ...hsl, l: Math.max(0.75, 1 - hsl.l) });
};
