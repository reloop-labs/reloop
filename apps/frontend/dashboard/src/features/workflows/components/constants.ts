import type { VisibilityState } from "@tanstack/react-table";
import type { CSSProperties } from "react";

export const WORKFLOW_COLUMN_TRACKS: Record<string, string> = {
	name: "minmax(0, 1.4fr)",
	trigger: "minmax(0, 1.1fr)",
	steps: "80px",
	updatedAt: "120px",
	status: "110px",
};

/** Default grid when all data columns are visible (+ select + actions). */
export const WORKFLOW_TABLE_GRID =
	"grid-cols-[32px_minmax(0,1.4fr)_minmax(0,1.1fr)_80px_120px_110px_32px]";

export function getWorkflowTableGridStyle(
	visibility: VisibilityState = {},
): CSSProperties {
	const tracks = ["32px"];
	for (const [id, track] of Object.entries(WORKFLOW_COLUMN_TRACKS)) {
		if (visibility[id] !== false) tracks.push(track);
	}
	tracks.push("32px");
	return { gridTemplateColumns: tracks.join(" ") };
}
