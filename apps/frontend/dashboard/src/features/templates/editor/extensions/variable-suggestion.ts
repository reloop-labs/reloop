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
							const el = component.element as HTMLElement;
							el.style.position = "fixed";
							el.style.zIndex = "9999";
							// Flip above the cursor when the menu would run off the
							// bottom of the window, and keep it inside horizontally.
							const gap = 8;
							const height = el.offsetHeight;
							const width = el.offsetWidth;
							const below = rect.bottom + gap;
							const fitsBelow = below + height <= window.innerHeight - gap;
							const above = rect.top - gap - height;
							el.style.top = `${fitsBelow || above < gap ? below : above}px`;
							el.style.left = `${Math.max(
								gap,
								Math.min(rect.left, window.innerWidth - width - gap),
							)}px`;
						}
					};

					return {
						onStart: (props) => {
							component = new ReactRenderer(VariablesDropdown, {
								props,
								editor: props.editor as any,
							});

							document.body.appendChild(component.element);
							updatePosition(props);
							// Measure again once React has rendered the items.
							requestAnimationFrame(() => updatePosition(props));
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
