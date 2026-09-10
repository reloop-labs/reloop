import { useCurrentEditor, useEditorState } from "@tiptap/react";
import {
	findStyleInputValue,
	getGlobalStylesArray,
} from "#/features/templates/editor/utils/apply-pasted-email-theme";

export function useEmailContainerWidth(): number {
	const { editor } = useCurrentEditor();
	const width = useEditorState({
		editor,
		selector: ({ editor: currentEditor }) => {
			if (!currentEditor) return 600;
			const styles = getGlobalStylesArray(currentEditor);
			const w = findStyleInputValue(styles, "container", "width");
			const parsed = typeof w === "number" ? w : Number.parseInt(String(w), 10);
			return Number.isFinite(parsed) && parsed > 0 ? parsed : 600;
		},
	});
	return width ?? 600;
}
