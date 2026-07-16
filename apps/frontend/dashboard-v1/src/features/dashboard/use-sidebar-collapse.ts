import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "isSidebarCollapsed";

export function useSidebarCollapse() {
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved !== null) {
				setIsCollapsed(saved === "true");
			}
		} catch {
			// ignore
		}
	}, []);

	const setCollapsed = useCallback((next: boolean) => {
		setIsCollapsed(next);
		try {
			localStorage.setItem(STORAGE_KEY, String(next));
		} catch {
			// ignore
		}
	}, []);

	const toggle = useCallback(() => {
		setCollapsed(!isCollapsed);
	}, [isCollapsed, setCollapsed]);

	return {
		isCollapsed,
		setCollapsed,
		toggle,
	};
}
