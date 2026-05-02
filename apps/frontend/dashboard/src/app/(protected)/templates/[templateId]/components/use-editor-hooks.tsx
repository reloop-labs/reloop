import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import { useEditor } from "@tiptap/react";

const extensions = [StarterKit, EmailTheming];

export const useEditorHook = () => {
	const editor = useEditor(
		{
			extensions,
			immediatelyRender: false,
		},
		[],
	);

	return editor;
};
