import type { VisibilityState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const STORAGE_KEY = "reloop:contacts:column-visibility";

export const CONTACT_VIEW_COLUMNS = [
	{ id: "email", label: "Email" },
	{ id: "name", label: "Name" },
	{ id: "status", label: "Status" },
	{ id: "updatedAt", label: "Updated At" },
	{ id: "createdAt", label: "Created At" },
] as const;

export type ContactViewColumnId = (typeof CONTACT_VIEW_COLUMNS)[number]["id"];

const DEFAULT_VISIBILITY: VisibilityState = {
	email: true,
	name: true,
	status: true,
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
			// Email stays visible so the table always has a primary column.
			email: true,
		};
	} catch {
		return DEFAULT_VISIBILITY;
	}
}

export function useContactColumnVisibility() {
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(DEFAULT_VISIBILITY);

	useEffect(() => {
		setColumnVisibility(readStoredVisibility());
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
	}, [columnVisibility]);

	const setColumnVisible = (id: ContactViewColumnId, visible: boolean) => {
		if (id === "email" && !visible) return;
		setColumnVisibility((prev) => ({ ...prev, [id]: visible }));
	};

	return {
		columnVisibility,
		setColumnVisibility,
		setColumnVisible,
	};
}
