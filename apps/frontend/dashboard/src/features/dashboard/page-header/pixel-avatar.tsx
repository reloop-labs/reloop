import { cn } from "@reloop/ui/cn";
import { useMemo } from "react";
import {
	encodePixelArt,
	getPixelArtGrid,
	getPixelArtPalette,
	PIXEL_GRID_SIZE,
	PIXEL_PATH_TRANSFORM,
} from "#/utils/pixel-art";

/**
 * Deterministic pixel-art avatar seeded by email, in the reference
 * artwork's dialect: deep-purple ground + light run-length strokes.
 * Scales to any container; pixels stay crisp.
 */
export function PixelAvatar({ seed }: { seed: string }) {
	const { background, foreground, d } = useMemo(() => {
		const palette = getPixelArtPalette(seed);
		const grid = getPixelArtGrid(seed);
		return { ...palette, d: encodePixelArt(grid) };
	}, [seed]);

	return (
		<svg
			viewBox={`0 0 ${PIXEL_GRID_SIZE * 5} ${PIXEL_GRID_SIZE * 5}`}
			shapeRendering="crispEdges"
			className="h-full w-full"
			aria-hidden
			preserveAspectRatio="xMidYMid slice"
		>
			<rect
				width={PIXEL_GRID_SIZE * 5}
				height={PIXEL_GRID_SIZE * 5}
				fill={background}
			/>
			<path
				fill="none"
				stroke={foreground}
				transform={PIXEL_PATH_TRANSFORM}
				d={d}
			/>
		</svg>
	);
}

/**
 * Circle-cropped pixel-art tile for inline fallbacks
 * (team rows, modals, profile picture).
 */
export function PixelAvatarTile({
	seed,
	className,
}: {
	seed: string;
	className?: string;
}) {
	return (
		<div
			aria-hidden
			className={cn("flex-shrink-0 overflow-hidden rounded-full", className)}
		>
			<PixelAvatar seed={seed} />
		</div>
	);
}
