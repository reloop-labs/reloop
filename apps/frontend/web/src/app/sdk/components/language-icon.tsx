import type { SimpleIcon } from "simple-icons";

export type CustomBrandIcon = {
	/** Multi-path colored mark (not a simple-icons glyph). */
	kind: "custom";
	title: string;
	slug: string;
	/** Fallback brand color when a monochrome tint is needed. */
	hex: string;
	viewBox: string;
	paths: Array<{
		d: string;
		fill: string;
		fillRule?: "evenodd" | "nonzero";
		clipRule?: "evenodd" | "nonzero";
	}>;
};

export type BrandIcon = SimpleIcon | CustomBrandIcon;

export function isCustomBrandIcon(icon: BrandIcon): icon is CustomBrandIcon {
	return "kind" in icon && icon.kind === "custom";
}

/**
 * Returns true if a brand hex color is black or too dark to be visible on dark backgrounds.
 */
export function isDarkBrandColor(hex: string): boolean {
	const clean = hex.replace("#", "").toLowerCase();
	if (
		clean === "000000" ||
		clean === "000" ||
		clean === "092e20" ||
		clean === "333333"
	) {
		return true;
	}
	if (clean.length === 6) {
		const r = Number.parseInt(clean.slice(0, 2), 16);
		const g = Number.parseInt(clean.slice(2, 4), 16);
		const b = Number.parseInt(clean.slice(4, 6), 16);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance < 0.25;
	}
	return false;
}

/**
 * Returns inline color style object if the color is bright enough in both modes,
 * or undefined for dark/black brands so Tailwind text-text-strong-950 dark:text-white takes effect.
 */
export function getBrandColorStyle(hex: string): { color: string } | undefined {
	if (isDarkBrandColor(hex)) {
		return undefined;
	}
	return { color: `#${hex}` };
}

export function LanguageIcon({
	icon,
	className = "size-6",
}: {
	icon: BrandIcon;
	className?: string;
}) {
	if (isCustomBrandIcon(icon)) {
		return (
			<svg
				viewBox={icon.viewBox}
				className={className}
				fill="none"
				aria-hidden
				xmlns="http://www.w3.org/2000/svg"
			>
				{icon.paths.map((p) => (
					<path
						key={`${p.fill}-${p.d.slice(0, 24)}`}
						d={p.d}
						fill={p.fill}
						fillRule={p.fillRule}
						clipRule={p.clipRule}
					/>
				))}
			</svg>
		);
	}

	return (
		<svg
			viewBox="0 0 24 24"
			className={`fill-current ${className}`}
			aria-hidden
		>
			<path d={icon.path} />
		</svg>
	);
}
