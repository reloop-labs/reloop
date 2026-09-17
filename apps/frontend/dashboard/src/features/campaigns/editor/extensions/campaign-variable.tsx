import { EmailNode } from "@react-email/editor/core";
import { Icon } from "@reloop/ui/icon";
import { mergeAttributes, nodeInputRule, nodePasteRule } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type React from "react";
import { useAllPropertiesQuery } from "#/features/contacts/hooks/use-contacts-query";
import {
	findContactPropertyForVariable,
	isSystemCampaignVariable,
	normalizeCampaignVariableName,
	stripContactPrefix,
} from "../lib/campaign-variables";

export function CampaignVariableNodeView({
	node,
	editor,
	getPos,
}: {
	node: any;
	editor: any;
	getPos: any;
}) {
	const name = node.attrs?.name || "";
	const { data: propertiesData } = useAllPropertiesQuery();

	const properties = propertiesData?.properties ?? [];
	// Campaign variables are read-only references to contact properties.
	// Everything resolves via `contact.*` at send time.
	const cleanName = stripContactPrefix(name);

	const matchedProp = findContactPropertyForVariable(properties, name);

	const isStandardProp = ["email", "firstname", "lastname"].includes(
		normalizeCampaignVariableName(cleanName).toLowerCase(),
	);

	// System variables (e.g. unsubscribe_url) resolve at send time.
	const isSystemVar = isSystemCampaignVariable(name);

	const hasDefaultValue =
		isStandardProp ||
		isSystemVar ||
		(!!matchedProp &&
			matchedProp.defaultValue !== undefined &&
			matchedProp.defaultValue !== null &&
			matchedProp.defaultValue !== "");

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
			className="mx-0.5 inline-flex cursor-pointer select-all items-center gap-1 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 px-1 py-px pl-2 font-semibold"
			style={{
				fontSize: "inherit",
			}}
		>
			<span className="align-middle">{`{{{${name}}}}`}</span>
			{!hasDefaultValue && (
				<span
					title="There is no default value for this property, please provide a fallback value."
					className="mr-0.5 inline-block shrink-0 align-middle text-error-base"
				>
					<Icon name="alert-triangle" className="h-3.5 w-3.5 text-error-base" />
				</span>
			)}
		</NodeViewWrapper>
	);
}

export const CampaignVariable = EmailNode.create({
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
		return ReactNodeViewRenderer(CampaignVariableNodeView);
	},

	addInputRules() {
		return [
			nodeInputRule({
				find: /\{\{\{([a-zA-Z0-9_.]+)\}\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					const name = match[1] ?? "";
					if (isSystemCampaignVariable(name)) return false;
					return { name };
				},
			}),
			nodeInputRule({
				find: /\{\{([a-zA-Z0-9_.]+)\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					const name = match[1] ?? "";
					if (isSystemCampaignVariable(name)) return false;
					return { name };
				},
			}),
		];
	},

	addPasteRules() {
		return [
			nodePasteRule({
				find: /\{\{\{([a-zA-Z0-9_.]+)\}\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					const name = match[1] ?? "";
					if (isSystemCampaignVariable(name)) return false;
					return { name };
				},
			}),
			nodePasteRule({
				find: /\{\{([a-zA-Z0-9_.]+)\}\}/g,
				type: this.type,
				getAttributes: (match) => {
					const name = match[1] ?? "";
					if (isSystemCampaignVariable(name)) return false;
					return { name };
				},
			}),
		];
	},
});

export default CampaignVariable;
