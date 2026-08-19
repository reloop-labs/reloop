import { Icon } from "@reloop/ui/icon";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { EditorContent, useCurrentEditor } from "@tiptap/react";

import "@react-email/editor/themes/default.css";

// Stable module-level constants — defined outside the component so their
// object references never change between renders, preventing the infinite
// update loop that occurs when DragHandle's internal effect compares props.
const DRAG_NESTED_OPTIONS = {
	edgeDetection: { threshold: -16, edges: ["left" as const] },
};

const DRAG_POSITION_CONFIG = {
	placement: "left" as const,
	strategy: "fixed" as const,
};

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();

	if (!editor) return null;

	return (
		<div className="relative">
			<DragHandle
				editor={editor}
				nested={DRAG_NESTED_OPTIONS}
				computePositionConfig={DRAG_POSITION_CONFIG}
			>
				<div
					className="mr-1 cursor-pointer rounded-sm bg-bg-soft-200 py-0.5 text-text-sub-600"
					title="Drag to reorder"
				>
					<Icon name="more-vertical" className="h-3.5 w-3.5" />
				</div>
			</DragHandle>
			<EditorContent editor={editor} />
		</div>
	);
}
