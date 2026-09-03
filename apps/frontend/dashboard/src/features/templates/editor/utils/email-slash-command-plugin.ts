import type { SlashCommandItem } from "@react-email/editor/ui";
import type { Editor } from "@tiptap/core";
import { type EditorState, NodeSelection, PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";

export const SLASH_COMMAND_PLUGIN_KEY = new PluginKey("email-slash-command");

export function createSlashCommandPlugin({
	editor,
	pluginKey = SLASH_COMMAND_PLUGIN_KEY,
	items,
	onStart,
	onUpdate,
	onKeyDown,
	onExit,
}: {
	editor: Editor;
	pluginKey?: PluginKey;
	items: SlashCommandItem[];
	onStart?: (props: {
		query: string;
		items: SlashCommandItem[];
		clientRect: (() => DOMRect | null) | null;
		command: (item: SlashCommandItem) => void;
	}) => void;
	onUpdate?: (props: {
		query: string;
		items: SlashCommandItem[];
		clientRect: (() => DOMRect | null) | null;
		command: (item: SlashCommandItem) => void;
	}) => void;
	onKeyDown?: (props: { event: KeyboardEvent }) => boolean;
	onExit?: () => void;
}) {
	return Suggestion({
		pluginKey,
		editor,
		char: "/",
		allowedPrefixes: null,
		startOfLine: false,
		allow: ({ editor: e }) => !e.isActive("codeBlock"),
		items: ({ query }) => {
			const q = query.toLowerCase();
			if (!q) return items;
			return items.filter((item) => {
				const haystack = [
					item.title,
					item.description ?? "",
					...(item.searchTerms ?? []),
				]
					.join(" ")
					.toLowerCase();
				return haystack.includes(q);
			});
		},
		command: ({ editor: e, range, props }) => {
			props.command({ editor: e, range });
		},
		render: () => ({
			onStart: (props) => {
				onStart?.({
					query: props.query,
					items: props.items,
					clientRect: props.clientRect ?? null,
					command: props.command,
				});
			},
			onUpdate: (props) => {
				onUpdate?.({
					query: props.query,
					items: props.items,
					clientRect: props.clientRect ?? null,
					command: props.command,
				});
			},
			onKeyDown: ({ event }) => onKeyDown?.({ event }) ?? false,
			onExit: () => onExit?.(),
		}),
	});
}

export const EMAIL_BUBBLE_HIDE_NODES = ["button", "image", "variable"] as const;

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
	for (const name of EMAIL_BUBBLE_HIDE_NODES) {
		if (options.isActive(name)) return false;
		if (options.ancestorNodeNames?.includes(name)) return false;
	}
	if (options.isActive("link")) return true;
	return options.selectionSize > 0;
}

/** Full formatting bubble on links, not the 3-icon edit/open/unlink strip. */
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
