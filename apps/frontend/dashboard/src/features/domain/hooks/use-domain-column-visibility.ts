import type { VisibilityState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const STORAGE_KEY = "reloop:domains:column-visibility";

export const DOMAIN_VIEW_COLUMNS = [
	{ id: "domain", label: "Domain" },
	{ id: "status", label: "Status" },
	{ id: "createdAt", label: "Created At" },
] as const;

export type DomainViewColumnId = (typeof DOMAIN_VIEW_COLUMNS)[number]["id"];

const DEFAULT_VISIBILITY: VisibilityState = {
	domain: true,
	status: true,
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
			// Domain stays visible so the table always has a primary column.
			domain: true,
		};
	} catch {
		return DEFAULT_VISIBILITY;
	}
}

export function useDomainColumnVisibility() {
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(DEFAULT_VISIBILITY);

	useEffect(() => {
		setColumnVisibility(readStoredVisibility());
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
	}, [columnVisibility]);

	const setColumnVisible = (id: DomainViewColumnId, visible: boolean) => {
		if (id === "domain" && !visible) return;
		setColumnVisibility((prev) => ({ ...prev, [id]: visible }));
	};

	return {
		columnVisibility,
		setColumnVisibility,
		setColumnVisible,
	};
}
