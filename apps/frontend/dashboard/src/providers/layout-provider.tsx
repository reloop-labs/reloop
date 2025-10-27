"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type LayoutMode = "sidebar" | "topbar";

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
	defaultMode = "topbar",
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

		if (
			savedLayoutMode &&
			(savedLayoutMode === "sidebar" || savedLayoutMode === "topbar")
		) {
			setLayoutModeState(savedLayoutMode);
		}

		if (savedSidebarCollapsed !== null) {
			setSidebarCollapsedState(savedSidebarCollapsed === "true");
		}
	}, []);

	const toggleLayoutMode = useCallback(() => {
		setLayoutModeState((prev) => {
			const newMode = prev === "sidebar" ? "topbar" : "sidebar";
			localStorage.setItem("layoutMode", newMode);
			return newMode;
		});
	}, []);

	const setLayoutMode = useCallback((mode: LayoutMode) => {
		setLayoutModeState(mode);
		localStorage.setItem("layoutMode", mode);
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
