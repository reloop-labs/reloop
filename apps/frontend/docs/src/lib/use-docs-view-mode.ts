import { useCallback, useEffect, useState } from "react";

export type DocsViewMode = "desktop" | "code";

const STORAGE_KEY = "reloop-docs-view-mode";
const CHANGE_EVENT = "reloop-docs-view-mode-change";

const DESKTOP_VALUES = new Set(["desktop", "dashboard"]);
const CODE_VALUES = new Set(["code"]);

export function isDocsViewModeTabs(values: string[]): boolean {
	const hasDesktop = values.some((v) => DESKTOP_VALUES.has(v));
	const hasCode = values.some((v) => CODE_VALUES.has(v));
	return hasDesktop && hasCode;
}

export function valueToDocsViewMode(value: string): DocsViewMode | null {
	if (DESKTOP_VALUES.has(value)) return "desktop";
	if (CODE_VALUES.has(value)) return "code";
	return null;
}

export function resolveDocsViewModeValue(
	values: string[],
	mode: DocsViewMode,
	fallback: string,
): string {
	const aliases = mode === "desktop" ? DESKTOP_VALUES : CODE_VALUES;
	const match = values.find((v) => aliases.has(v));
	return match ?? fallback;
}

function readStoredMode(fallback: DocsViewMode = "desktop"): DocsViewMode {
	if (typeof window === "undefined") return fallback;
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === "desktop" || saved === "code") return saved;
	} catch {}
	return fallback;
}

export function useDocsViewMode(): [
	DocsViewMode,
	(mode: DocsViewMode) => void,
] {
	const [mode, setMode] = useState<DocsViewMode>(() => {
		return readStoredMode("desktop");
	});

	useEffect(() => {
		const sync = () => {
			setMode(readStoredMode("desktop"));
		};
		window.addEventListener(CHANGE_EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(CHANGE_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);

	const setViewMode = useCallback((next: DocsViewMode) => {
		setMode(next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
			window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
		} catch {}
	}, []);

	return [mode, setViewMode];
}
