import { create } from "zustand";

interface UIState {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapse: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (value) => {
    try {
      localStorage.setItem("isSidebarCollapsed", String(value));
    } catch { }
    set({ isSidebarCollapsed: value });
  },
  toggleSidebarCollapse: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      try {
        localStorage.setItem("isSidebarCollapsed", String(next));
      } catch { }
      return { isSidebarCollapsed: next };
    }),
}));
