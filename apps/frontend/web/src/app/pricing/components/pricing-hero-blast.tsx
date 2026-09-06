"use client";

import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { useTheme } from "next-themes";

/**
 * Theme-aware PixelBlast for the pricing hero.
 * Light mode keeps the brand blue; dark mode switches to GitHub gray
 * to match the monochrome dark theme. PixelBlast applies `color`
 * changes to its `uColor` uniform without re-creating the WebGL
 * session, so toggling the theme transitions smoothly.
 */
export function PricingHeroBlast() {
	const { resolvedTheme } = useTheme();

	return (
		<PixelBlast
			variant="square"
			pixelSize={2}
			color={resolvedTheme === "dark" ? "#6e7781" : "#3B82F6"}
			patternScale={4}
			patternDensity={0.45}
			enableRipples={false}
			rippleSpeed={0.05}
			rippleThickness={0.09}
			rippleIntensityScale={2.5}
			speed={0.2}
			transparent
			edgeFade={0.65}
		/>
	);
}
