import { EmailNode } from "@react-email/editor/core";
import { mergeAttributes, nodeInputRule, nodePasteRule } from "@tiptap/core";
import React from "react";

export const Variable = EmailNode.create({
	name: "variable",
	group: "inline",
	inline: true,
	selectable: true,
	atom: true,

	addAttributes() {
		return {
			name: {
				default: "",
			},
		};
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
				class:
					"variable-badge bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800/40 rounded px-1.5 py-0.5 font-semibold text-xs inline-block mx-0.5 cursor-default select-all",
				style:
					"padding: 2px 6px; background-color: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; border-radius: 4px; font-weight: 600; font-size: 12px; display: inline-block; margin: 0 2px;",
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
