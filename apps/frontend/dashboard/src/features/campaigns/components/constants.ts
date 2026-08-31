import type { VisibilityState } from "@tanstack/react-table";
import type { CSSProperties } from "react";

const COLUMN_TRACKS: Record<string, string> = {
	campaign: "minmax(0,1fr)",
	status: "120px",
	audience: "160px",
	sentAt: "140px",
};

export function getCampaignTableGridStyle(
	visibility: VisibilityState = {},
): CSSProperties {
	const tracks = ["32px"];
	for (const [id, track] of Object.entries(COLUMN_TRACKS)) {
		if (visibility[id] !== false) tracks.push(track);
	}
	tracks.push("32px");
	return { gridTemplateColumns: tracks.join(" ") };
}
