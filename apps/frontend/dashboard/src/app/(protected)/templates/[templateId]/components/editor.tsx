"use client";
import { EditorContent } from "@tiptap/react";

import "@react-email/editor/themes/default.css";
import { useCurrentEditor } from "@tiptap/react";

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();

	return (
		<EditorContent
			editor={editor}
			className="h-full w-full rounded-md bg-white"
		/>
	);
}
