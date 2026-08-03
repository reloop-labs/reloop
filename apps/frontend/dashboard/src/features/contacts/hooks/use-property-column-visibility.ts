import type { VisibilityState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const STORAGE_KEY = "reloop:properties:column-visibility";

export const PROPERTY_VIEW_COLUMNS = [
	{ id: "name", label: "Name" },
	{ id: "type", label: "Type" },
	{ id: "default", label: "Default" },
	{ id: "updatedAt", label: "Updated At" },
	{ id: "createdAt", label: "Created At" },
] as const;

export type PropertyViewColumnId = (typeof PROPERTY_VIEW_COLUMNS)[number]["id"];

const DEFAULT_VISIBILITY: VisibilityState = {
	name: true,
	type: true,
	default: true,
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

export function usePropertyColumnVisibility() {
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(DEFAULT_VISIBILITY);

	useEffect(() => {
		setColumnVisibility(readStoredVisibility());
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
	}, [columnVisibility]);

	const setColumnVisible = (id: PropertyViewColumnId, visible: boolean) => {
		if (id === "name" && !visible) return;
		setColumnVisibility((prev) => ({ ...prev, [id]: visible }));
	};

	return {
		columnVisibility,
		setColumnVisibility,
		setColumnVisible,
	};
}
