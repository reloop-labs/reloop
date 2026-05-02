import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";

const extensions = [
	StarterKit,
	EmailTheming,
	Placeholder.configure({
		placeholder: "Press '/' for commands...",
		showOnlyWhenEditable: true,
		includeChildren: true,
	}),
];

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
