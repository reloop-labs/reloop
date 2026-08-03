import { useEffect } from "react";
import { useUIStore } from "#/store/use-ui-store";

const STORAGE_KEY = "isSidebarCollapsed";

/**
 * Shared sidebar collapse state (Zustand). Hydrates from localStorage once
 * so the page-header toggle and main sidebar stay in sync.
 */
export function useSidebarCollapse() {
	const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);
	const setCollapsed = useUIStore((s) => s.setIsSidebarCollapsed);
	const toggle = useUIStore((s) => s.toggleSidebarCollapse);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved !== null) {
				setCollapsed(saved === "true");
			}
		} catch {
			// ignore
		}
	}, [setCollapsed]);

	return {
		isCollapsed,
		setCollapsed,
		toggle,
	};
}
