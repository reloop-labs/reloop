import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import type { Editor } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { ComposeSlashCommand } from "./slash-command-extension";

export function useComposeEditor({
	content = "",
	placeholder = "Start writing... Type '/' for commands",
	editable = true,
	onUpdate,
	onModEnter,
}: {
	content?: string;
	placeholder?: string;
	editable?: boolean;
	onUpdate?: (html: string, text: string) => void;
	onModEnter?: () => void;
}): Editor | null {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3] },
			}),
			Underline,
			Placeholder.configure({ placeholder }),
			ComposeSlashCommand,
		],
		content: content || "",
		editable,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"prose prose-sm dark:prose-invert max-w-none min-h-[200px] w-full outline-none text-sm leading-relaxed text-black dark:text-white/90 [&_p]:my-1",
			},
			handleKeyDown: (_view, event) => {
				if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
					event.preventDefault();
					onModEnter?.();
					return true;
				}
				return false;
			},
		},
		onUpdate: ({ editor: ed }) => {
			onUpdate?.(ed.getHTML(), ed.getText());
		},
	});

	useEffect(() => {
		if (!editor) return;
		editor.setEditable(editable);
	}, [editor, editable]);

	return editor;
}
