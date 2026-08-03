import type { VisibilityState } from "@tanstack/react-table";
import type { CSSProperties } from "react";

const COLUMN_TRACKS: Record<string, string> = {
	email: "minmax(0,1fr)",
	name: "140px",
	status: "130px",
	updatedAt: "110px",
	createdAt: "110px",
};

/** Default grid when all data columns are visible (+ select + actions). */
export const CONTACT_TABLE_GRID =
	"grid-cols-[32px_minmax(0,1fr)_140px_130px_110px_110px_32px]";

export function getContactTableGridStyle(
	visibility: VisibilityState = {},
): CSSProperties {
	const tracks = ["32px"];
	for (const [id, track] of Object.entries(COLUMN_TRACKS)) {
		if (visibility[id] !== false) tracks.push(track);
	}
	tracks.push("32px");
	return { gridTemplateColumns: tracks.join(" ") };
}
