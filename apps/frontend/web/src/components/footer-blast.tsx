"use client";

import { useTheme } from "next-themes";
import { PixelBlastLazy } from "./pixel-blast";
import type { FooterBrandAccent } from "./footer-brand";

const accentPixelColorLight: Record<FooterBrandAccent, string> = {
	default: "#3B82F6",
	emerald: "#34d399",
	ink: "#6e7781",
};

const accentPixelColorDark: Record<FooterBrandAccent, string> = {
	default: "#6e7781",
	emerald: "#6ee7b7",
	ink: "#6e7781",
};

/**
 * Theme-aware PixelBlast for the footer brand block.
 * Dark mode swaps saturated accent pixels for softer tones that sit
 * well on the dark background. PixelBlast applies `color` changes to
 * its `uColor` uniform without re-creating the WebGL session, so
 * toggling the theme transitions smoothly.
 */
export function FooterBlast({ accent }: { accent: FooterBrandAccent }) {
	const { resolvedTheme } = useTheme();
	const palette =
		resolvedTheme === "dark" ? accentPixelColorDark : accentPixelColorLight;

	return (
		<PixelBlastLazy
			variant="square"
			pixelSize={2}
			color={palette[accent]}
			patternScale={4}
			patternDensity={0.4}
			enableRipples
			rippleSpeed={0.3}
			rippleThickness={0.1}
			rippleIntensityScale={1.5}
			speed={0.2}
			transparent
			edgeFade={0.6}
		/>
	);
}
