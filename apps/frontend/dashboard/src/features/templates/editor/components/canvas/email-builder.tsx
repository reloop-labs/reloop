import { BubbleMenu } from "@react-email/editor/ui";
import { Icon } from "@reloop/ui/icon";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { EditorContent, useCurrentEditor } from "@tiptap/react";
import { useEffect } from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { applyImportedEmailCss } from "#/features/templates/editor/utils/apply-imported-email-css";
import {
	EMAIL_BUBBLE_HIDE_NODES,
	emailTextBubbleTrigger,
} from "#/features/templates/editor/utils/email-slash-command-plugin";

import "@react-email/editor/themes/default.css";
import "./email-canvas.css";

const DRAG_NESTED_OPTIONS = {
	edgeDetection: { threshold: -16, edges: ["left" as const] },
};

const DRAG_POSITION_CONFIG = {
	placement: "left" as const,
	strategy: "fixed" as const,
};

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();
	const importedEmailCss = useEditorStore((s) => s.importedEmailCss);

	useEffect(() => {
		applyImportedEmailCss(importedEmailCss);
	}, [importedEmailCss]);

	if (!editor) return null;

	return (
		<div className="relative min-h-full w-full">
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
			<EditorContent
				editor={editor}
				className="min-h-full w-full [&>.ProseMirror]:min-h-full [&>.ProseMirror]:w-full"
			/>
			<BubbleMenu
				hideWhenActiveNodes={[...EMAIL_BUBBLE_HIDE_NODES]}
				trigger={emailTextBubbleTrigger}
				appendTo={() => document.body}
			/>
			<BubbleMenu.ButtonDefault appendTo={() => document.body} />
			<BubbleMenu.ImageDefault appendTo={() => document.body} />
		</div>
	);
}
