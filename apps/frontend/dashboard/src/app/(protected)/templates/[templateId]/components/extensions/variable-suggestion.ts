import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { VariablesDropdown } from "../variables-dropdown";

export const VariableSuggestion = Extension.create({
	name: "variableSuggestion",

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				char: "{{",
				allowSpaces: false,
				startOfLine: false,
				command: ({ editor, range, props }) => {
					// Insert the custom variable node
					editor
						.chain()
						.focus()
						.insertContentAt(range, [
							{
								type: "variable",
								attrs: { name: props.name },
							},
							{
								type: "text",
								text: " ",
							},
						])
						.run();
				},
				render: () => {
					let component: ReactRenderer<any>;
					let popup: TippyInstance[];

					return {
						onStart: (props) => {
							component = new ReactRenderer(VariablesDropdown, {
								props,
								editor: props.editor,
							});

							if (!props.clientRect) {
								return;
							}

							popup = tippy("body", {
								getReferenceClientRect: props.clientRect as any,
								appendTo: () => document.body,
								content: component.element,
								showOnCreate: true,
								interactive: true,
								trigger: "manual",
								placement: "bottom-start",
							});
						},

						onUpdate(props) {
							component.updateProps(props);

							if (!props.clientRect) {
								return;
							}

							if (popup && popup[0]) {
								popup[0].setProps({
									getReferenceClientRect: props.clientRect as any,
								});
							}
						},

						onKeyDown(props) {
							if (props.event.key === "Escape") {
								if (popup && popup[0]) {
									popup[0].hide();
								}
								return true;
							}

							return component.ref?.onKeyDown(props) ?? false;
						},

						onExit() {
							if (popup && popup[0]) {
								popup[0].destroy();
							}
							if (component) {
								component.destroy();
							}
						},
					};
				},
			}),
		];
	},
});
export default VariableSuggestion;
