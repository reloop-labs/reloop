import type { Editor } from "@tiptap/core";
import { type EditorState, NodeSelection } from "@tiptap/pm/state";

export const EMAIL_BUBBLE_HIDE_NODES = ["button", "image"] as const;
const EMAIL_TEXT_BUBBLE_BLOCK_NODES = ["image"] as const;

export function emailTextBubbleShouldShow(options: {
	isActive: (name: string) => boolean;
	selectionSize: number;
	selectedNodeName?: string;
	ancestorNodeNames?: string[];
}): boolean {
	if (
		options.selectedNodeName &&
		EMAIL_BUBBLE_HIDE_NODES.includes(
			options.selectedNodeName as (typeof EMAIL_BUBBLE_HIDE_NODES)[number],
		)
	) {
		return false;
	}
	for (const name of EMAIL_TEXT_BUBBLE_BLOCK_NODES) {
		if (options.isActive(name)) return false;
		if (options.ancestorNodeNames?.includes(name)) return false;
	}
	if (options.isActive("link")) return true;
	return options.selectionSize > 0;
}

/** Link pencil only when the whole button is selected, not its label. */
export function emailButtonBubbleTrigger(params: {
	editor: Editor;
	state: EditorState;
}): boolean {
	const { selection } = params.state;
	return (
		selection instanceof NodeSelection && selection.node.type.name === "button"
	);
}

export function emailTextBubbleTrigger(params: {
	editor: Editor;
	state: EditorState;
}): boolean {
	const { editor, state } = params;
	const dom = editor.view?.dom;
	if (!dom?.isConnected) return false;
	const box = dom.getBoundingClientRect();
	if (box.width === 0 && box.height === 0) return false;

	const { selection } = state;
	const selectedNodeName =
		selection instanceof NodeSelection ? selection.node.type.name : undefined;
	const ancestorNodeNames: string[] = [];
	const { $from } = selection;
	for (let depth = $from.depth; depth > 0; depth--) {
		ancestorNodeNames.push($from.node(depth).type.name);
	}
	return emailTextBubbleShouldShow({
		isActive: (name) => editor.isActive(name),
		selectionSize: editor.view.state.selection.content().size,
		selectedNodeName,
		ancestorNodeNames,
	});
}
