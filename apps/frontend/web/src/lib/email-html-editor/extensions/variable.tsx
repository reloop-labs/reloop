import { EmailNode } from "@react-email/editor/core";
import { Icon } from "@reloop/ui/icon";
import { useEditorStore } from "@reloop/web/lib/email-html-editor/hooks/use-editor-store";
import { normalizeTemplateVariableName } from "@reloop/web/lib/email-html-editor/lib/template-variables";
import { mergeAttributes, nodeInputRule, nodePasteRule } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type React from "react";

export function VariableNodeView({
	node,
	editor,
	getPos,
}: {
	node: any;
	editor: any;
	getPos: any;
}) {
	const name = node.attrs?.name || "";
	const variables = useEditorStore((s) => s.variables);
	const matchedVar = variables.find(
		(v) => normalizeTemplateVariableName(v.name) === name,
	);
	const hasDefaultValue =
		!!matchedVar &&
		matchedVar.defaultValue !== null &&
		matchedVar.defaultValue !== "";

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (typeof getPos === "function") {
			const pos = getPos();
			if (typeof pos === "number") {
				editor.commands.selectNodeAt(pos);
			}
		}
	};

	return (
		<NodeViewWrapper
			as="span"
			onClick={handleClick}
			className="-my-0.5 mx-0.5 inline-flex cursor-pointer select-all items-center gap-1 rounded-xl border border-current/25 bg-current/10 px-1 py-px pl-2 font-semibold"
			style={{
				fontSize: "inherit",
			}}
		>
			<span className="align-middle">{`{{{${name}}}}`}</span>
			{!hasDefaultValue && (
				<span
					title="There is no default value for this variable, please provide a default value."
					className="mr-0.5 inline-block shrink-0 align-middle text-error-base"
				>
					<Icon name="alert-triangle" className="h-3.5 w-3.5 text-error-base" />
				</span>
			)}
		</NodeViewWrapper>
	);
}

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
					"variable-badge font-semibold cursor-default select-all inline-block",
				style:
					"font-weight: 600 !important; display: inline-block !important; margin: 0 1px !important; color: inherit !important; background: transparent !important; border: none !important; padding: 0 !important; font-size: inherit !important;",
			}),
			`{{{${name}}}}`,
		];
	},

	renderToReactEmail({ node }) {
		const name = node.attrs?.name || "";
		return <span>{`{{{${name}}}}`}</span>;
	},

	addNodeView() {
		return ReactNodeViewRenderer(VariableNodeView);
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
export default Variable;
