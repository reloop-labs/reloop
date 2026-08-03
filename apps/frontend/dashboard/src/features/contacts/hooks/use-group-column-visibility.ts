import type { VisibilityState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const STORAGE_KEY = "reloop:groups:column-visibility";

export const GROUP_VIEW_COLUMNS = [
	{ id: "name", label: "Name" },
	{ id: "contacts", label: "Contacts" },
	{ id: "updatedAt", label: "Last Updated" },
	{ id: "createdAt", label: "Created At" },
] as const;

export type GroupViewColumnId = (typeof GROUP_VIEW_COLUMNS)[number]["id"];

const DEFAULT_VISIBILITY: VisibilityState = {
	name: true,
	contacts: true,
	updatedAt: true,
	createdAt: true,
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
			name: true,
		};
	} catch {
		return DEFAULT_VISIBILITY;
	}
}

export function useGroupColumnVisibility() {
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(DEFAULT_VISIBILITY);

	useEffect(() => {
		setColumnVisibility(readStoredVisibility());
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
	}, [columnVisibility]);

	const setColumnVisible = (id: GroupViewColumnId, visible: boolean) => {
		if (id === "name" && !visible) return;
		setColumnVisibility((prev) => ({ ...prev, [id]: visible }));
	};

	return {
		columnVisibility,
		setColumnVisibility,
		setColumnVisible,
	};
}
