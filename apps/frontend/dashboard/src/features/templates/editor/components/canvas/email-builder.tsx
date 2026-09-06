import { BubbleMenu } from "@react-email/editor/ui";
import { Icon } from "@reloop/ui/icon";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { EditorContent, useCurrentEditor } from "@tiptap/react";
import { useEffect } from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { applyImportedEmailCss } from "#/features/templates/editor/utils/apply-imported-email-css";
import { convertFilledLinksToButtonsInJson } from "#/features/templates/editor/utils/convert-filled-links-to-buttons";
import {
	emailButtonBubbleTrigger,
} from "#/features/templates/editor/utils/email-slash-command-plugin";
import {
	alignImageOnlyCellsInJson,
	alignImageOnlyRowsInJson,
} from "#/features/templates/editor/utils/promote-table-spacing";
import { PluginKey } from "@tiptap/pm/state";
import { EmailTextBubbleMenu } from "./email-text-bubble-menu";

import "@react-email/editor/themes/default.css";
import "./email-canvas.css";

const emailButtonBubblePluginKey = new PluginKey("emailButtonBubbleMenu");

const DRAG_NESTED_OPTIONS = {
	edgeDetection: { threshold: -16, edges: ["left" as const] },
};

const DRAG_POSITION_CONFIG = {
	placement: "left" as const,
	strategy: "fixed" as const,
};

function normalizeStoredEditorContent(editor: any) {
	if (!editor) return;
	const json = editor.getJSON();
	const changed =
		alignImageOnlyRowsInJson(json) ||
		alignImageOnlyCellsInJson(json) ||
		convertFilledLinksToButtonsInJson(json);
	if (changed) {
		editor.commands.setContent(json, { emitUpdate: false } as any);
	}
}

export function FullEmailBuilder() {
	const { editor } = useCurrentEditor();
	const importedEmailCss = useEditorStore((s) => s.importedEmailCss);

	useEffect(() => {
		applyImportedEmailCss(importedEmailCss);
	}, [importedEmailCss]);

	useEffect(() => {
		if (!editor) return;
		// Fix already-stored Yjs content that was flattened left before the global fix.
		normalizeStoredEditorContent(editor);
		const handler = () => normalizeStoredEditorContent(editor);
		editor.on("update", handler);
		return () => {
			editor.off("update", handler);
		};
	}, [editor]);

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
			<EmailTextBubbleMenu />
			<BubbleMenu
				pluginKey={emailButtonBubblePluginKey}
				trigger={emailButtonBubbleTrigger}
				placement="top"
			>
				<BubbleMenu.ButtonToolbar>
					<BubbleMenu.ButtonEditLink />
					<BubbleMenu.ButtonUnlink />
				</BubbleMenu.ButtonToolbar>
				<BubbleMenu.ButtonForm />
			</BubbleMenu>
			<BubbleMenu.ImageDefault />
		</div>
	);
}
