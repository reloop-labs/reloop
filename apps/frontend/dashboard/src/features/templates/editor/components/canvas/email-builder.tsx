import { Icon } from "@reloop/ui/icon";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { EditorContent, useCurrentEditor } from "@tiptap/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import "@react-email/editor/themes/default.css";
import "./email-builder.css";

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
	const canvasRef = useRef<HTMLDivElement>(null);
	const [isEmpty, setIsEmpty] = useState(true);
	const [hintPos, setHintPos] = useState<{
		top: number;
		left: number;
		height: number;
		fontSize: string;
		lineHeight: string;
	} | null>(null);

	useEffect(() => {
		if (!editor) return;
		const sync = () => {
			const empty = editor.getText().trim().length === 0;
			setIsEmpty((prev) => (prev === empty ? prev : empty));
		};
		sync();
		editor.on("update", sync);
		return () => {
			editor.off("update", sync);
		};
	}, [editor]);

	useLayoutEffect(() => {
		if (!editor || !isEmpty) {
			setHintPos(null);
			return;
		}
		const canvas = canvasRef.current;
		const paragraph = editor.view.dom.querySelector("p");
		if (!canvas || !paragraph) return;
		const canvasRect = canvas.getBoundingClientRect();
		const paragraphRect = paragraph.getBoundingClientRect();
		const paragraphStyle = window.getComputedStyle(paragraph);
		setHintPos({
			top: paragraphRect.top - canvasRect.top,
			left: paragraphRect.left - canvasRect.left,
			height: Math.max(paragraphRect.height, 20),
			fontSize: paragraphStyle.fontSize,
			lineHeight: paragraphStyle.lineHeight,
		});
	}, [editor, isEmpty]);

	if (!editor) return null;

	return (
		<div
			ref={canvasRef}
			className="email-builder-canvas relative mx-auto w-full max-w-[600px]"
		>
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
			{isEmpty && hintPos ? (
				<div
					className="pointer-events-none absolute flex items-center gap-1.5 text-text-sub-600"
					style={{
						top: hintPos.top,
						left: hintPos.left,
						height: hintPos.height,
						fontSize: hintPos.fontSize,
						lineHeight: hintPos.lineHeight,
					}}
				>
					<span>Press</span>
					<kbd className="inline-flex h-[1.25em] min-w-[1.25em] items-center justify-center rounded-[5px] border border-stroke-soft-200 bg-bg-weak-50 px-1 font-medium text-[0.85em] text-text-strong-950 dark:border-white/15 dark:bg-white/[0.06]">
						/
					</kbd>
					<span>for commands</span>
				</div>
			) : null}
		</div>
	);
}
