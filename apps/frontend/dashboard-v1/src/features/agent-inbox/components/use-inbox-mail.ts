import { atom, useAtom } from "jotai";

export type InboxMailConfig = {
	selected: string | null;
	bulkSelected: string[];
	replyComposerOpen: boolean;
	forwardComposerOpen: boolean;
	showImages: boolean;
};

const configAtom = atom<InboxMailConfig>({
	selected: null,
	bulkSelected: [],
	replyComposerOpen: false,
	forwardComposerOpen: false,
	showImages: false,
});

export function useInboxMail() {
	return useAtom(configAtom);
}

export const clearBulkSelectionAtom = atom(null, (get, set) => {
	const current = get(configAtom);
	set(configAtom, { ...current, bulkSelected: [] });
});
