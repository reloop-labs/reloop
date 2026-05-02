import { StarterKit } from "@react-email/editor/extensions";
import { EmailTheming } from "@react-email/editor/plugins";
import { EditorContext, useEditor } from "@tiptap/react";
import type { PropsWithChildren } from "react";

const extensions = [StarterKit, EmailTheming];

export function EditorProvider({ children }: PropsWithChildren) {
	const editor = useEditor({
		extensions,
		immediatelyRender: false,
	});

	if (!editor) return null;

	return (
		<EditorContext.Provider value={{ editor }}>
			{children}
		</EditorContext.Provider>
	);
}
