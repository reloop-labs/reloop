import { create } from "zustand";

/** Below Tailwind `md` the inspector is a bottom sheet instead of a side panel. */
export const PHONE_QUERY = "(max-width: 767px)";

interface InspectorSheetState {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
}

/** Shared so the header's Style button can open the sheet the page renders. */
export const useInspectorSheet = create<InspectorSheetState>((set) => ({
	open: false,
	setOpen: (open) => set({ open }),
	toggle: () => set((state) => ({ open: !state.open })),
}));
