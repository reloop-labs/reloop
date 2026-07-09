"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

type InboxSidebarContextValue = {
	collapsed: boolean;
	toggleSidebar: () => void;
	openCompose: () => void;
	registerOpenCompose: (fn: () => void) => void;
};

const InboxSidebarContext = createContext<InboxSidebarContextValue | null>(
	null,
);

export const InboxSidebarProvider = ({ children }: { children: ReactNode }) => {
	const [collapsed, setCollapsed] = useState(false);
	const [openComposeFn, setOpenComposeFn] = useState<(() => void) | null>(null);

	const toggleSidebar = useCallback(() => {
		setCollapsed((prev) => !prev);
	}, []);

	const registerOpenCompose = useCallback((fn: () => void) => {
		setOpenComposeFn(() => fn);
	}, []);

	const openCompose = useCallback(() => {
		openComposeFn?.();
	}, [openComposeFn]);

	const value = useMemo(
		() => ({
			collapsed,
			toggleSidebar,
			openCompose,
			registerOpenCompose,
		}),
		[collapsed, toggleSidebar, openCompose, registerOpenCompose],
	);

	return (
		<InboxSidebarContext.Provider value={value}>
			{children}
		</InboxSidebarContext.Provider>
	);
};

export const useInboxSidebar = () => {
	const ctx = useContext(InboxSidebarContext);
	if (!ctx) {
		throw new Error("useInboxSidebar must be used within InboxSidebarProvider");
	}
	return ctx;
};
