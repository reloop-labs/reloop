import type { VisibilityState } from "@tanstack/react-table";
import type { CSSProperties } from "react";

// Columns share the width in proportion (domain a little more for long
// names); the minimums keep them readable on narrow screens.
const COLUMN_TRACKS: Record<string, string> = {
	domain: "minmax(180px,1.6fr)",
	status: "minmax(130px,1fr)",
	sending: "minmax(100px,1fr)",
	receiving: "minmax(100px,1fr)",
	createdAt: "minmax(120px,1fr)",
};

export function getDomainTableGridStyle(
	visibility: VisibilityState = {},
): CSSProperties {
	const tracks = ["32px"];
	for (const [id, track] of Object.entries(COLUMN_TRACKS)) {
		if (visibility[id] !== false) tracks.push(track);
	}
	tracks.push("32px");
	return { gridTemplateColumns: tracks.join(" ") };
}
