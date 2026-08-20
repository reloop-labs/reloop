import { create } from "zustand";

interface UIState {
	isSidebarCollapsed: boolean;
	setIsSidebarCollapsed: (value: boolean) => void;
	toggleSidebarCollapse: () => void;
	isEditorSidebarPinned: boolean;
	setIsEditorSidebarPinned: (value: boolean) => void;
	toggleEditorSidebarPinned: () => void;
	isAiPanelOpen: boolean;
	setIsAiPanelOpen: (value: boolean) => void;
	toggleAiPanel: () => void;
	aiPanelActiveTab: "ai" | "support";
	setAiPanelActiveTab: (tab: "ai" | "support") => void;
	/** A message queued to be auto-sent when the support chat opens. */
	pendingSupportMessage: string | null;
	setPendingSupportMessage: (value: string | null) => void;
	/**
	 * When true, in-context keyboard shortcut hints (e.g. R on refresh)
	 * are revealed. Toggled by long-pressing Space.
	 */
	isShortcutsRevealed: boolean;
	setShortcutsRevealed: (value: boolean) => void;
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
	isEditorSidebarPinned: false,
	setIsEditorSidebarPinned: (value) => set({ isEditorSidebarPinned: value }),
	toggleEditorSidebarPinned: () =>
		set((state) => ({ isEditorSidebarPinned: !state.isEditorSidebarPinned })),
	isAiPanelOpen: false,
	setIsAiPanelOpen: (value) => set({ isAiPanelOpen: value }),
	toggleAiPanel: () =>
		set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
	// Default to support while Ask AI is disabled (no API yet).
	aiPanelActiveTab: "support",
	setAiPanelActiveTab: (tab) => set({ aiPanelActiveTab: tab }),
	pendingSupportMessage: null,
	setPendingSupportMessage: (value) => set({ pendingSupportMessage: value }),
	isShortcutsRevealed: false,
	setShortcutsRevealed: (value) => set({ isShortcutsRevealed: value }),
}));
