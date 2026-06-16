import type { SimpleIcon } from "simple-icons";

export function BrandIcon({
	icon,
	className = "size-8",
}: {
	icon: Pick<SimpleIcon, "hex" | "path">;
	className?: string;
}) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden>
			<path d={icon.path} fill={`#${icon.hex}`} />
		</svg>
	);
}
