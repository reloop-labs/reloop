import type { VisibilityState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const STORAGE_KEY = "reloop:campaigns:column-visibility";

export const CAMPAIGN_VIEW_COLUMNS = [
	{ id: "campaign", label: "Campaign" },
	{ id: "status", label: "Status" },
	{ id: "audience", label: "Audience" },
	{ id: "sentAt", label: "Sent" },
] as const;

export type CampaignViewColumnId = (typeof CAMPAIGN_VIEW_COLUMNS)[number]["id"];

const DEFAULT_VISIBILITY: VisibilityState = {
	campaign: true,
	status: true,
	audience: true,
	sentAt: true,
};

function readStoredVisibility(): VisibilityState {
	if (typeof window === "undefined") return DEFAULT_VISIBILITY;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_VISIBILITY;
		const parsed = JSON.parse(raw) as VisibilityState;
		return {
			...DEFAULT_VISIBILITY,
			...parsed,
			campaign: true,
		};
	} catch {
		return DEFAULT_VISIBILITY;
	}
}

export function useCampaignColumnVisibility() {
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(DEFAULT_VISIBILITY);

	useEffect(() => {
		setColumnVisibility(readStoredVisibility());
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
	}, [columnVisibility]);

	const setColumnVisible = (id: CampaignViewColumnId, visible: boolean) => {
		if (id === "campaign" && !visible) return;
		setColumnVisibility((prev) => ({ ...prev, [id]: visible }));
	};

	return {
		columnVisibility,
		setColumnVisibility,
		setColumnVisible,
	};
}
