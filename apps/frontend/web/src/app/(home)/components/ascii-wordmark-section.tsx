"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const AsciiWordmark = dynamic(
	() => import("./ascii-wordmark").then((m) => m.AsciiWordmark),
	{ ssr: false },
);

export function AsciiWordmarkSection() {
	const { resolvedTheme } = useTheme();
	const inkColor = resolvedTheme === "dark" ? "#a1a1aa" : "#52525b";

	return (
		<section
			aria-label="Reloop ASCII wordmark"
			style={{
				width: "100%",
				height: "clamp(180px, 28vw, 360px)",
				position: "relative",
				overflow: "hidden",
				background: "transparent",
			}}
		>
			<AsciiWordmark word="RELOOP" inkColor={inkColor} />
		</section>
	);
}
