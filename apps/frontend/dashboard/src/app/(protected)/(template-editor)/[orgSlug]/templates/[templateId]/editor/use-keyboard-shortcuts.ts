"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "./use-editor-store";

export function useKeyboardShortcuts() {
	const undo = useEditorStore((s) => s.undo);
	const redo = useEditorStore((s) => s.redo);
	const removeBlock = useEditorStore((s) => s.removeBlock);
	const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
	const selectBlock = useEditorStore((s) => s.selectBlock);
	const selectedBlockId = useEditorStore((s) => s.selectedBlockId);

	// Undo: Cmd+Z
	useHotkeys(
		"meta+z",
		(e) => {
			e.preventDefault();
			undo();
		},
		{ enableOnContentEditable: false },
	);

	// Redo: Cmd+Shift+Z
	useHotkeys(
		"meta+shift+z",
		(e) => {
			e.preventDefault();
			redo();
		},
		{ enableOnContentEditable: false },
	);

	// Delete selected block: Backspace or Delete (not when editing text)
	useHotkeys(
		"backspace, delete",
		(e) => {
			// Don't delete if we're in a contentEditable or input
			const target = e.target as HTMLElement;
			if (
				target.isContentEditable ||
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA"
			) {
				return;
			}

			if (selectedBlockId) {
				e.preventDefault();
				removeBlock(selectedBlockId);
			}
		},
		[selectedBlockId],
	);

	// Duplicate: Cmd+D
	useHotkeys(
		"meta+d",
		(e) => {
			e.preventDefault();
			if (selectedBlockId) {
				duplicateBlock(selectedBlockId);
			}
		},
		[selectedBlockId],
	);

	// Deselect: Escape
	useHotkeys("escape", () => {
		selectBlock(null);
	});
}
