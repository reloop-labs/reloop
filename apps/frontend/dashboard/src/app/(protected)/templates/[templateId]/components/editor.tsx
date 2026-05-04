"use client";
import { EditorContent } from "@tiptap/react";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { GripVertical } from "lucide-react";

import "@react-email/editor/themes/default.css";
import { useCurrentEditor } from "@tiptap/react";

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();

	return (
		<>
			<EditorContent editor={editor} />
			{editor && (
				<DragHandle editor={editor}>
					<div className="flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted/50 p-1 rounded-md text-muted-foreground transition-colors">
						<GripVertical className="h-4 w-4" />
					</div>
				</DragHandle>
			)}
		</>
	);
}
