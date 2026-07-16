import { create } from "zustand";

interface UIState {
	isSidebarCollapsed: boolean;
	setIsSidebarCollapsed: (value: boolean) => void;
	toggleSidebarCollapse: () => void;
	isAiPanelOpen: boolean;
	setIsAiPanelOpen: (value: boolean) => void;
	toggleAiPanel: () => void;
	isAiPanelExpanded: boolean;
	setIsAiPanelExpanded: (value: boolean) => void;
	toggleAiPanelExpand: () => void;
	aiPanelActiveTab: "ai" | "support";
	setAiPanelActiveTab: (tab: "ai" | "support") => void;
	/** A message queued to be auto-sent when the support chat opens. */
	pendingSupportMessage: string | null;
	setPendingSupportMessage: (value: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
	isSidebarCollapsed: false,
	setIsSidebarCollapsed: (value) => {
		try {
			localStorage.setItem("isSidebarCollapsed", String(value));
		} catch {}
		set({ isSidebarCollapsed: value });
	},
	toggleSidebarCollapse: () =>
		set((state) => {
			const next = !state.isSidebarCollapsed;
			try {
				localStorage.setItem("isSidebarCollapsed", String(next));
			} catch {}
			return { isSidebarCollapsed: next };
		}),
	isAiPanelOpen: false,
	setIsAiPanelOpen: (value) => set({ isAiPanelOpen: value }),
	toggleAiPanel: () =>
		set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
	isAiPanelExpanded: false,
	setIsAiPanelExpanded: (value) => set({ isAiPanelExpanded: value }),
	toggleAiPanelExpand: () =>
		set((state) => ({ isAiPanelExpanded: !state.isAiPanelExpanded })),
	aiPanelActiveTab: "ai",
	setAiPanelActiveTab: (tab) => set({ aiPanelActiveTab: tab }),
	pendingSupportMessage: null,
	setPendingSupportMessage: (value) => set({ pendingSupportMessage: value }),
}));
