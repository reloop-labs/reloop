"use client";

import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { EditorContent } from "@tiptap/react";

import "@react-email/editor/themes/default.css";
import { useCurrentEditor } from "@tiptap/react";
import { GripVertical } from "lucide-react";

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();

	if (!editor) return null;

	return (
		<div className="relative">
			<DragHandle
				editor={editor}
				nested={{ edgeDetection: { threshold: -16, edges: ["left"] } }}
			>
				<div className="p-2" title="Drag to reorder">
					<GripVertical size={16} />
				</div>
			</DragHandle>
			<EditorContent editor={editor} />
		</div>
	);
}
