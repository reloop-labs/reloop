import { create } from "zustand";

interface ToggleState {
	open: boolean;
	setState: (value: boolean) => void;
}

export const useOrgStore = create<ToggleState>((set) => ({
	open: false,
	setState: (value: boolean) => set({ open: value }),
}));
