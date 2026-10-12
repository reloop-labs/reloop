import { create } from "zustand";

interface UIState {
	isSidebarCollapsed: boolean;
	setIsSidebarCollapsed: (value: boolean) => void;
	toggleSidebarCollapse: () => void;
	isEditorSidebarPinned: boolean;
	setIsEditorSidebarPinned: (value: boolean) => void;
	toggleEditorSidebarPinned: () => void;
	/** A message queued to be auto-sent when the Help page chat opens. */
	pendingSupportMessage: string | null;
	setPendingSupportMessage: (value: string | null) => void;
	/**
	 * When true, in-context keyboard shortcut hints (e.g. R on refresh)
	 * are revealed. Toggled by long-pressing Space.
	 */
	isShortcutsRevealed: boolean;
	setShortcutsRevealed: (value: boolean) => void;
	/** Phone/tablet overlay nav, not persisted. */
	isMobileNavOpen: boolean;
	setMobileNavOpen: (value: boolean) => void;
	toggleMobileNav: () => void;
}

const SIDEBAR_COLLAPSED_KEY = "isSidebarCollapsed";

/**
 * Read synchronously so the sidebar mounts at its saved width instead of
 * animating from expanded. Safe because the dashboard shell is client-only
 * (session is browser-only), so there is no SSR markup to mismatch.
 */
function readSidebarCollapsed(): boolean {
	try {
		return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
	} catch {
		return false;
	}
}

/** Persist and mirror onto <html> so loading chrome keeps the same width. */
function persistSidebarCollapsed(value: boolean) {
	try {
		localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value));
		if (value) {
			document.documentElement.dataset.sidebarCollapsed = "true";
		} else {
			delete document.documentElement.dataset.sidebarCollapsed;
		}
	} catch {}
}

export const useUIStore = create<UIState>((set) => ({
	isSidebarCollapsed: readSidebarCollapsed(),
	setIsSidebarCollapsed: (value) => {
		persistSidebarCollapsed(value);
		set({ isSidebarCollapsed: value });
	},
	toggleSidebarCollapse: () =>
		set((state) => {
			const next = !state.isSidebarCollapsed;
			persistSidebarCollapsed(next);
			return { isSidebarCollapsed: next };
		}),
	isEditorSidebarPinned: false,
	setIsEditorSidebarPinned: (value) => set({ isEditorSidebarPinned: value }),
	toggleEditorSidebarPinned: () =>
		set((state) => ({ isEditorSidebarPinned: !state.isEditorSidebarPinned })),
	pendingSupportMessage: null,
	setPendingSupportMessage: (value) => set({ pendingSupportMessage: value }),
	isShortcutsRevealed: false,
	setShortcutsRevealed: (value) => set({ isShortcutsRevealed: value }),
	isMobileNavOpen: false,
	setMobileNavOpen: (value) => set({ isMobileNavOpen: value }),
	toggleMobileNav: () =>
		set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
}));
