"use client";

import { PixelBlast } from "@reloop/web/components/pixel-blast";
import { useTheme } from "next-themes";

export function TempEmailHeroBlast() {
	const { resolvedTheme } = useTheme();

	return (
		<PixelBlast
			variant="square"
			pixelSize={2}
			color={resolvedTheme === "dark" ? "#52a8ff" : "#006ffe"}
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
