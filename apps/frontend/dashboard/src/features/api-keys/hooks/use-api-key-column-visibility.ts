import type { VisibilityState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const STORAGE_KEY = "reloop:api-keys:column-visibility";

export const API_KEY_VIEW_COLUMNS = [
	{ id: "name", label: "Name" },
	{ id: "prefix", label: "Prefix" },
	{ id: "lastUsed", label: "Last Used" },
	{ id: "status", label: "Status" },
	{ id: "createdBy", label: "Created By" },
	{ id: "createdAt", label: "Created At" },
] as const;

export type ApiKeyViewColumnId = (typeof API_KEY_VIEW_COLUMNS)[number]["id"];

const DEFAULT_VISIBILITY: VisibilityState = {
	name: true,
	prefix: true,
	lastUsed: true,
	status: true,
	createdBy: true,
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
			// Name stays visible so the table always has a primary column.
			name: true,
		};
	} catch {
		return DEFAULT_VISIBILITY;
	}
}

export function useApiKeyColumnVisibility() {
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(DEFAULT_VISIBILITY);

	useEffect(() => {
		setColumnVisibility(readStoredVisibility());
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
	}, [columnVisibility]);

	const setColumnVisible = (id: ApiKeyViewColumnId, visible: boolean) => {
		if (id === "name" && !visible) return;
		setColumnVisibility((prev) => ({ ...prev, [id]: visible }));
	};

	return {
		columnVisibility,
		setColumnVisibility,
		setColumnVisible,
	};
}
