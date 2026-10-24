import { useQueryState } from "nuqs";
import { useCallback } from "react";

const ADD_VARIABLE_MODAL = "add-variable";

/** URL-backed open state for the "Create variable" modal so a reload reopens it. */
export function useAddVariableModal() {
	const [modal, setModal] = useQueryState("modal", { history: "replace" });

	const setOpen = useCallback(
		(open: boolean) => {
			void setModal(open ? ADD_VARIABLE_MODAL : null);
		},
		[setModal],
	);

	return [modal === ADD_VARIABLE_MODAL, setOpen] as const;
}
