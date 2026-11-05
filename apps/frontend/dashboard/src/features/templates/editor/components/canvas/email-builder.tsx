import { BubbleMenu } from "@react-email/editor/ui";
import { Icon } from "@reloop/ui/icon";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { NodeSelection, PluginKey } from "@tiptap/pm/state";
import {
	type Editor,
	EditorContent,
	useCurrentEditor,
	useEditorState,
} from "@tiptap/react";
import { useEffect } from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { useEmailContainerWidth } from "#/features/templates/editor/hooks/use-email-container-width";
import { applyImportedEmailCss } from "#/features/templates/editor/utils/apply-imported-email-css";
import { convertFilledLinksToButtonsInJson } from "#/features/templates/editor/utils/convert-filled-links-to-buttons";
import { emailButtonBubbleTrigger } from "#/features/templates/editor/utils/email-slash-command-plugin";
import { getGlobalStyleValue } from "#/features/templates/editor/utils/global-style-value";
import {
	alignImageOnlyCellsInJson,
	alignImageOnlyRowsInJson,
} from "#/features/templates/editor/utils/promote-table-spacing";
import { ensureCanvasWebFonts } from "#/features/templates/editor/utils/web-fonts";
import { EmailImageSelectionOverlay } from "./email-image-selection-overlay";
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

/**
 * A selected button's node DOM is its full-width alignment wrapper, so the
 * toolbar centered over the whole row instead of the button. Anchor it to
 * the element that actually draws the button.
 */
function getSelectedButtonRect(editor: Editor | null): DOMRect | null {
	if (!editor) return null;
	const { selection } = editor.state;
	let pos: number | null = null;
	if (
		selection instanceof NodeSelection &&
		selection.node.type.name === "button"
	) {
		pos = selection.from;
	} else {
		const { $from } = selection;
		for (let depth = $from.depth; depth > 0; depth--) {
			if ($from.node(depth).type.name === "button") {
				pos = $from.before(depth);
				break;
			}
		}
	}
	if (pos === null) return null;
	const dom = editor.view.nodeDOM(pos);
	if (!(dom instanceof HTMLElement)) return null;
	const target =
		dom.querySelector<HTMLElement>("a, [data-id='react-email-button']") ?? dom;
	return target.getBoundingClientRect();
}

/**
 * react-email's BubbleMenu forwards unknown props to TipTap's BubbleMenu,
 * which supports `getReferencedVirtualElement`, but its prop type omits it.
 */
function buttonBubbleAnchor(editor: Editor | null): Record<string, unknown> {
	return {
		getReferencedVirtualElement: () => {
			const rect = getSelectedButtonRect(editor);
			return rect ? { getBoundingClientRect: () => rect } : null;
		},
	};
}

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
	const containerWidth = useEmailContainerWidth();
	const containerAlign =
		useEditorState({
			editor,
			selector: ({ editor: ed }) =>
				String(getGlobalStyleValue(ed, "container", "align") ?? "center"),
		}) ?? "center";

	useEffect(() => {
		applyImportedEmailCss(importedEmailCss);
	}, [importedEmailCss]);

	useEffect(() => {
		ensureCanvasWebFonts();
	}, []);

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
		<div
			className="relative min-h-full w-full"
			data-email-align={containerAlign}
			style={
				{
					"--email-container-width": `${containerWidth}px`,
				} as React.CSSProperties
			}
		>
			<DragHandle
				editor={editor}
				nested={DRAG_NESTED_OPTIONS}
				computePositionConfig={DRAG_POSITION_CONFIG}
			>
				<div
					className="mr-1 cursor-pointer rounded-sm bg-bg-soft-200 py-0.5 text-text-sub-600 hover:bg-bg-sub-300"
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
				{...buttonBubbleAnchor(editor)}
			>
				<BubbleMenu.ButtonToolbar>
					<BubbleMenu.ButtonEditLink />
					<BubbleMenu.ButtonUnlink />
				</BubbleMenu.ButtonToolbar>
				<BubbleMenu.ButtonForm />
			</BubbleMenu>
			<EmailImageSelectionOverlay />
		</div>
	);
}
