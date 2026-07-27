import type { SimpleIcon } from "simple-icons";

export function BrandIcon({
	icon,
	className = "size-8",
	/** Override path fill. Defaults to the brand hex. */
	fill,
}: {
	icon: Pick<SimpleIcon, "hex" | "path">;
	className?: string;
	fill?: string;
}) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden>
			<path d={icon.path} fill={fill ?? `#${icon.hex}`} />
		</svg>
	);
}
