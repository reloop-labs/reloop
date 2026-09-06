"use client";

import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { useTheme } from "next-themes";

/**
 * Theme-aware PixelBlast for the tools index hero.
 * Light mode uses emerald (#10B981); dark mode lifts it to
 * emerald-300 (#6ee7b7) for contrast on black — same pairing
 * the repo uses for emerald accents (footer-blast, license).
 */
export function ToolsHeroBlast() {
	const { resolvedTheme } = useTheme();

	return (
		<PixelBlast
			variant="square"
			pixelSize={2}
			color={resolvedTheme === "dark" ? "#6ee7b7" : "#10B981"}
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
