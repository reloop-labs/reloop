"use client";

import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { useTheme } from "next-themes";

/**
 * Theme-aware PixelBlast for the tools index hero.
 * Matches pricing: light mode uses brand blue, dark mode switches to
 * GitHub gray (#6e7781) for the monochrome dark theme.
 */
export function ToolsHeroBlast() {
	const { resolvedTheme } = useTheme();

	return (
		<PixelBlast
			variant="square"
			pixelSize={2}
			color={resolvedTheme === "dark" ? "#6e7781" : "#2563eb"}
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
