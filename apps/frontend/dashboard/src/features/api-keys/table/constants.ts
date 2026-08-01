import type { VisibilityState } from "@tanstack/react-table";
import type { CSSProperties } from "react";

const COLUMN_TRACKS: Record<string, string> = {
	name: "minmax(0,1fr)",
	prefix: "140px",
	lastUsed: "110px",
	status: "100px",
	createdBy: "140px",
	createdAt: "110px",
};

/** Default grid when all data columns are visible (+ select + actions). */
export const API_KEY_TABLE_GRID =
	"grid-cols-[32px_minmax(0,1fr)_140px_110px_100px_140px_110px_32px]";

export function getApiKeyTableGridStyle(
	visibility: VisibilityState = {},
): CSSProperties {
	const tracks = ["32px"];
	for (const [id, track] of Object.entries(COLUMN_TRACKS)) {
		if (visibility[id] !== false) tracks.push(track);
	}
	tracks.push("32px");
	return { gridTemplateColumns: tracks.join(" ") };
}
