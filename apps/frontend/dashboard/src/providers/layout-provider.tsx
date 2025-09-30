"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
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

	const toggleLayoutMode = useCallback(() => {
		setLayoutModeState((prev) => (prev === "sidebar" ? "topbar" : "sidebar"));
	}, []);

	const setLayoutMode = useCallback((mode: LayoutMode) => {
		setLayoutModeState(mode);
	}, []);

	const toggleSidebarCollapse = useCallback(() => {
		setSidebarCollapsedState((prev) => !prev);
	}, []);

	const setSidebarCollapsed = useCallback((collapsed: boolean) => {
		setSidebarCollapsedState(collapsed);
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
