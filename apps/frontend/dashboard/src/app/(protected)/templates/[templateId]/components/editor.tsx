"use client";
import { EditorContent } from "@tiptap/react";

import "@react-email/editor/themes/default.css";
import { useCurrentEditor } from "@tiptap/react";

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();

	return (
		<EditorContent
			editor={editor}
			className="mx-auto h-full w-full max-w-2xl rounded-md bg-white px-6"
		/>
	);
}
