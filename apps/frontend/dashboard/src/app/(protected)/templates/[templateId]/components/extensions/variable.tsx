import { EmailNode } from "@react-email/editor/core";
import { mergeAttributes, nodeInputRule, nodePasteRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import React from "react";

export const Variable = EmailNode.create({
	name: "variable",
	group: "inline",
	inline: true,
	selectable: true,
	atom: true,
	marks: "",

	addAttributes() {
		return {
			name: {
				default: "",
			},
		};
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("variableClick"),
				props: {
					handleClick(view, pos, event) {
						const target = event.target as HTMLElement;
						const badge = target.closest("span[data-variable]");
						if (badge) {
							const { useEditorStore } = require("../use-editor-store");
							useEditorStore.getState().setViewMode("variables");
							return true;
						}
						return false;
					},
				},
			}),
		];
	},

	parseHTML() {
		return [
			{
				tag: "span[data-variable]",
				getAttrs: (element) => ({
					name: (element as HTMLElement).getAttribute("data-variable") || "",
				}),
			},
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		const name = node.attrs?.name || "";
		return [
			"span",
			mergeAttributes(HTMLAttributes, {
				"data-variable": name,
				class: "variable-badge font-semibold cursor-default select-all inline-block",
				style: "font-weight: 600 !important; display: inline-block !important; margin: 0 1px !important; color: inherit !important; background: transparent !important; border: none !important; padding: 0 !important; font-size: inherit !important;",
			}),
			`{{{${name}}}}`,
		];
	},

	renderToReactEmail({ node }) {
		const name = node.attrs?.name || "";
		return <span>{`{{{${name}}}}`}</span>;
	},

	addInputRules() {
		return [
			nodeInputRule({
				find: /\{\{\{([a-zA-Z0-9_]+)\}\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					return { name: match[1] };
				},
			}),
			nodeInputRule({
				find: /\{\{([a-zA-Z0-9_]+)\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					return { name: match[1] };
				},
			}),
		];
	},

	addPasteRules() {
		return [
			nodePasteRule({
				find: /\{\{\{([a-zA-Z0-9_]+)\}\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					return { name: match[1] };
				},
			}),
			nodePasteRule({
				find: /\{\{([a-zA-Z0-9_]+)\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					return { name: match[1] };
				},
			}),
		];
	},
});
