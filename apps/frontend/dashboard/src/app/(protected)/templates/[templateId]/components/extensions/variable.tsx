import { EmailNode } from "@react-email/editor/core";
import { mergeAttributes, nodeInputRule, nodePasteRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((r) => r.json());

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
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;

	const { data: templateData } = useSWR(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);

	const variables = templateData?.variables ?? [];
	const matchedVar = variables.find((v: any) => {
		if (typeof v === "string") {
			return v.replace(/^\{\{|\}\}$/g, "").trim() === name;
		}
		return v?.name === name;
	});

	const hasDefaultValue =
		matchedVar &&
		matchedVar.defaultValue !== undefined &&
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
			className="variable-badge mx-0.5 inline-flex cursor-pointer select-all items-center gap-1 align-baseline font-semibold"
			style={{
				fontWeight: 600,
				display: "inline-flex",
				margin: "0 1px",
				color: "inherit",
				background: "transparent",
				border: "none",
				padding: "0",
				fontSize: "inherit",
				verticalAlign: "middle",
			}}
		>
			<span className="align-middle">{`{{{${name}}}}`}</span>
			{!hasDefaultValue && (
				<span
					title="There is no default value for this variable, please provide a default value."
					className="mr-0.5 inline-block shrink-0 align-middle"
				>
					<AlertTriangle
						size={14}
						className="text-red-500"
						style={{ color: "#ef4444" }}
					/>
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
