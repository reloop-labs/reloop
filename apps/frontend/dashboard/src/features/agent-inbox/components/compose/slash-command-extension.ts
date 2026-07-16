import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
	type SuggestionKeyDownProps,
	type SuggestionProps,
} from "@tiptap/suggestion";
import {
	filterSlashCommands,
	type SlashCommandItem,
} from "./slash-command-items";
import {
	SlashCommandMenu,
	type SlashCommandMenuHandle,
} from "./slash-command-menu";

const slashCommandPluginKey = new PluginKey("composeSlashCommand");

function updateMenuPosition(
	element: HTMLElement,
	clientRect?: (() => DOMRect | null) | null,
) {
	const rect = typeof clientRect === "function" ? clientRect() : null;
	if (!rect) return;

	element.style.position = "fixed";
	element.style.zIndex = "100";
	element.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;

	const below = rect.bottom + 8;
	const menuHeight = 330;
	if (below + menuHeight > window.innerHeight && rect.top > menuHeight) {
		element.style.top = `${rect.top - 8}px`;
		element.style.transform = "translateY(-100%)";
	} else {
		element.style.top = `${below}px`;
		element.style.transform = "";
	}
}

export const ComposeSlashCommand = Extension.create({
	name: "composeSlashCommand",

	addProseMirrorPlugins() {
		return [
			Suggestion<SlashCommandItem>({
				editor: this.editor,
				char: "/",
				pluginKey: slashCommandPluginKey,
				allowSpaces: false,
				startOfLine: false,
				// null = allow `/` after any character (Novel-style), not only after space
				allowedPrefixes: null,
				items: ({ query }) => filterSlashCommands(query),
				command: ({ editor, range, props }) => {
					props.command({ editor, range });
				},
				render: () => {
					let component: ReactRenderer<SlashCommandMenuHandle> | null = null;

					return {
						onStart: (props: SuggestionProps<SlashCommandItem>) => {
							component = new ReactRenderer(SlashCommandMenu, {
								props: {
									items: props.items,
									query: props.query,
									command: (item: SlashCommandItem) => {
										props.command(item);
									},
								},
								editor: props.editor,
							});

							if (component.element instanceof HTMLElement) {
								document.body.appendChild(component.element);
								updateMenuPosition(component.element, props.clientRect);
							}
						},

						onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
							component?.updateProps({
								items: props.items,
								query: props.query,
								command: (item: SlashCommandItem) => {
									props.command(item);
								},
							});
							if (component?.element instanceof HTMLElement) {
								updateMenuPosition(component.element, props.clientRect);
							}
						},

						onKeyDown: (props: SuggestionKeyDownProps) => {
							if (props.event.key === "Escape") {
								component?.element.remove();
								component?.destroy();
								component = null;
								return true;
							}
							return component?.ref?.onKeyDown(props) ?? false;
						},

						onExit: () => {
							if (component) {
								component.element.remove();
								component.destroy();
								component = null;
							}
						},
					};
				},
			}),
		];
	},
});
