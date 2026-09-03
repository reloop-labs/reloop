"use client";

import {
	autoUpdate,
	flip,
	offset,
	shift,
	useFloating,
} from "@floating-ui/react";
import type { SlashCommandItem } from "@react-email/editor/ui";
import { useCurrentEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { editorSlashCommands, groupByCategory } from "../../lib/slash-commands";
import {
	createSlashCommandPlugin,
	SLASH_COMMAND_PLUGIN_KEY,
} from "../../utils/email-slash-command-plugin";

type MenuState = {
	active: boolean;
	query: string;
	items: SlashCommandItem[];
	clientRect: (() => DOMRect | null) | null;
};

const INITIAL: MenuState = {
	active: false,
	query: "",
	items: [],
	clientRect: null,
};

export function EmailSlashCommand() {
	const { editor } = useCurrentEditor();
	const [state, setState] = useState<MenuState>(INITIAL);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const commandRef = useRef<((item: SlashCommandItem) => void) | null>(null);
	const itemsRef = useRef<SlashCommandItem[]>([]);
	const selectedIndexRef = useRef(0);
	itemsRef.current = state.items;
	selectedIndexRef.current = selectedIndex;

	const { refs, floatingStyles } = useFloating({
		open: state.active,
		strategy: "fixed",
		placement: "bottom-start",
		middleware: [offset(8), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	useEffect(() => {
		if (!state.clientRect) return;
		const clientRect = state.clientRect;
		refs.setReference({
			getBoundingClientRect: () => clientRect() ?? new DOMRect(),
		});
	}, [state.clientRect, refs]);

	useEffect(() => {
		setSelectedIndex(0);
	}, [state.query, state.active]);

	const onKeyDown = useCallback(({ event }: { event: KeyboardEvent }) => {
		if (event.key === "Escape") {
			setState(INITIAL);
			return true;
		}
		const items = itemsRef.current;
		if (items.length === 0) return false;
		if (event.key === "ArrowUp") {
			setSelectedIndex((i) => (i + items.length - 1) % items.length);
			return true;
		}
		if (event.key === "ArrowDown") {
			setSelectedIndex((i) => (i + 1) % items.length);
			return true;
		}
		if (event.key === "Enter") {
			const item = items[selectedIndexRef.current];
			if (item && commandRef.current) commandRef.current(item);
			return true;
		}
		return false;
	}, []);

	useEffect(() => {
		if (!editor) return undefined;

		const plugin = createSlashCommandPlugin({
			editor,
			pluginKey: SLASH_COMMAND_PLUGIN_KEY,
			items: editorSlashCommands,
			onStart: (props) => {
				commandRef.current = props.command;
				setState({
					active: true,
					query: props.query,
					items: props.items,
					clientRect: props.clientRect,
				});
			},
			onUpdate: (props) => {
				commandRef.current = props.command;
				setState({
					active: true,
					query: props.query,
					items: props.items,
					clientRect: props.clientRect,
				});
			},
			onKeyDown,
			onExit: () => {
				setState(INITIAL);
				commandRef.current = null;
			},
		});

		if (SLASH_COMMAND_PLUGIN_KEY.getState(editor.state) != null) {
			editor.unregisterPlugin(SLASH_COMMAND_PLUGIN_KEY);
		}
		editor.registerPlugin(plugin, (next, plugins) => [next, ...plugins]);

		return () => {
			if (SLASH_COMMAND_PLUGIN_KEY.getState(editor.state) != null) {
				editor.unregisterPlugin(SLASH_COMMAND_PLUGIN_KEY);
			}
		};
	}, [editor, onKeyDown]);

	if (!editor || !state.active) return null;

	const groups = state.query.trim()
		? [{ category: "", items: state.items }]
		: groupByCategory(state.items);

	let flatIndex = 0;

	return createPortal(
		<div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 9999 }}>
			<div data-re-slash-command="">
				<div data-re-slash-command-scroll="">
					{state.items.length === 0 ? (
						<div data-re-slash-command-empty="">No results</div>
					) : (
						groups.map((group) => (
							<div key={group.category || "all"}>
								{group.category ? (
									<div data-re-slash-command-category="">{group.category}</div>
								) : null}
								{group.items.map((item) => {
									const current = flatIndex++;
									const selected = current === selectedIndex;
									return (
										<button
											key={item.title}
											type="button"
											data-re-slash-command-item=""
											data-selected={selected || undefined}
											onClick={() => commandRef.current?.(item)}
										>
											{item.icon}
											<span>{item.title}</span>
										</button>
									);
								})}
							</div>
						))
					)}
				</div>
			</div>
		</div>,
		document.body,
	);
}
