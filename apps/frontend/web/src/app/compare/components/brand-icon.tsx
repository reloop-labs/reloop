import { cn } from "@reloop/ui/cn";
import type { SimpleIcon } from "simple-icons";

/** A simple-icons glyph, or an image logo for brands simple-icons doesn't have. */
export type BrandMark = Pick<SimpleIcon, "hex" | "path"> & {
	/** Logo file under /public, drawn instead of `path`. */
	src?: string;
	/** Black-on-transparent logos that would vanish on a dark background. */
	invertInDark?: boolean;
};

export function BrandIcon({
	icon,
	className = "size-8",
	/** Override path fill. Defaults to the brand hex. Image logos keep their own colours. */
	fill,
}: {
	icon: BrandMark;
	className?: string;
	fill?: string;
}) {
	if (icon.src) {
		return (
			<img
				src={icon.src}
				alt=""
				aria-hidden
				className={cn(
					"rounded-[22%] object-contain",
					icon.invertInDark && "dark:invert",
					className,
				)}
			/>
		);
	}
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden>
			<path d={icon.path} fill={fill ?? `#${icon.hex}`} />
		</svg>
	);
}
