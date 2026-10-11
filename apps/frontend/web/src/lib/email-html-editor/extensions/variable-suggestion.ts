import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { VariablesDropdown } from "../components/panels/variables/variables-dropdown";

export const VariableSuggestion = Extension.create({
	name: "variableSuggestion",

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor as any,
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

					const updatePosition = (props: any) => {
						if (!component?.element) return;
						const rect =
							typeof props.clientRect === "function"
								? props.clientRect()
								: props.clientRect;

						if (rect) {
							component.element.style.position = "fixed";
							component.element.style.zIndex = "9999";
							component.element.style.top = `${rect.bottom + 8}px`;
							component.element.style.left = `${rect.left}px`;
						}
					};

					return {
						onStart: (props) => {
							component = new ReactRenderer(VariablesDropdown, {
								props,
								editor: props.editor as any,
							});

							updatePosition(props);

							document.body.appendChild(component.element);
						},

						onUpdate(props) {
							component.updateProps(props);
							updatePosition(props);
						},

						onKeyDown(props) {
							if (props.event.key === "Escape") {
								if (component?.element) {
									component.element.remove();
								}
								return true;
							}

							return component.ref?.onKeyDown(props) ?? false;
						},

						onExit() {
							if (component) {
								if (component.element) {
									component.element.remove();
								}
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
