"use client";

import { BubbleMenu } from "@react-email/editor/ui";
import { EditorContent, useCurrentEditor } from "@tiptap/react";
import { useEffect } from "react";
import { applyImportedEmailCss } from "./apply-imported-email-css";
import {
	EMAIL_BUBBLE_HIDE_NODES,
	emailButtonBubbleTrigger,
	emailTextBubbleTrigger,
} from "./bubble-trigger";
import { useEmailHtmlEditorStore } from "./store";

import "@react-email/editor/themes/default.css";
import "./email-canvas.css";

export function EmailHtmlCanvas() {
	const { editor } = useCurrentEditor();
	const importedEmailCss = useEmailHtmlEditorStore((s) => s.importedEmailCss);

	useEffect(() => {
		applyImportedEmailCss(importedEmailCss);
	}, [importedEmailCss]);

	if (!editor) return null;

	return (
		<div className="relative min-h-full w-full">
			<EditorContent
				editor={editor}
				className="min-h-full w-full [&>.ProseMirror]:min-h-full [&>.ProseMirror]:w-full"
			/>
			<BubbleMenu
				hideWhenActiveNodes={[...EMAIL_BUBBLE_HIDE_NODES]}
				trigger={emailTextBubbleTrigger}
			/>
			<BubbleMenu trigger={emailButtonBubbleTrigger} placement="top">
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
