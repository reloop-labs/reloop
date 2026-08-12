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
