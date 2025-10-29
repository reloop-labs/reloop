"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type LayoutMode = "sidebar";

interface LayoutContextType {
	layoutMode: LayoutMode;
	toggleLayoutMode: () => void;
	setLayoutMode: (mode: LayoutMode) => void;
	isSidebarCollapsed: boolean;
	toggleSidebarCollapse: () => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
	const context = useContext(LayoutContext);
	if (context === undefined) {
		throw new Error("useLayout must be used within a LayoutProvider");
	}
	return context;
};

export const LayoutProvider = ({
	children,
	defaultMode = "sidebar",
	defaultSidebarCollapsed = false,
}: {
	children: ReactNode;
	defaultMode?: LayoutMode;
	defaultSidebarCollapsed?: boolean;
}) => {
	const [layoutMode, setLayoutModeState] = useState<LayoutMode>(defaultMode);
	const [isSidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(
		defaultSidebarCollapsed,
	);

	// Load initial values from localStorage on mount
	useEffect(() => {
		const savedLayoutMode = localStorage.getItem("layoutMode") as LayoutMode;
		const savedSidebarCollapsed = localStorage.getItem("isSidebarCollapsed");

		if (savedLayoutMode === "sidebar") {
			setLayoutModeState(savedLayoutMode);
		} else {
			setLayoutModeState("sidebar");
			localStorage.setItem("layoutMode", "sidebar");
		}

		if (savedSidebarCollapsed !== null) {
			setSidebarCollapsedState(savedSidebarCollapsed === "true");
		}
	}, []);

	const toggleLayoutMode = useCallback(() => {
		setLayoutModeState("sidebar");
		localStorage.setItem("layoutMode", "sidebar");
	}, []);

	const setLayoutMode = useCallback((_mode: LayoutMode) => {
		setLayoutModeState("sidebar");
		localStorage.setItem("layoutMode", "sidebar");
	}, []);

	const toggleSidebarCollapse = useCallback(() => {
		setSidebarCollapsedState((prev) => {
			const newCollapsed = !prev;
			localStorage.setItem("isSidebarCollapsed", newCollapsed.toString());
			return newCollapsed;
		});
	}, []);

	const setSidebarCollapsed = useCallback((collapsed: boolean) => {
		setSidebarCollapsedState(collapsed);
		localStorage.setItem("isSidebarCollapsed", collapsed.toString());
	}, []);

	const contextValue: LayoutContextType = {
		layoutMode,
		toggleLayoutMode,
		setLayoutMode,
		isSidebarCollapsed,
		toggleSidebarCollapse,
		setSidebarCollapsed,
	};

	return (
		<LayoutContext.Provider value={contextValue}>
			{children}
		</LayoutContext.Provider>
	);
};
