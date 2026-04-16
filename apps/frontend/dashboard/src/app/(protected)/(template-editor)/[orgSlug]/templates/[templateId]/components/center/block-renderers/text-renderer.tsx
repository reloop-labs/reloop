"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import type { TextProps } from "../../../editor/block-types";
import { useEditorStore } from "../../../editor/use-editor-store";
import { useRef } from "react";

interface TextRendererProps {
	block: TemplateBlock;
}

export const TextRenderer = ({ block }: TextRendererProps) => {
	const props = block.props as unknown as TextProps;
	const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
	const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
	const isSelected = selectedBlockId === block.id;
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={ref}
			contentEditable={isSelected}
			suppressContentEditableWarning
			onBlur={(e) => {
				updateBlockProps(block.id, {
					text: e.currentTarget.textContent || "",
				});
			}}
			style={{
				color: props.color,
				fontFamily: props.fontFamily,
				fontSize: `${props.fontSize}px`,
				lineHeight: props.lineHeight,
				textAlign: props.align,
				padding: "8px 16px",
				outline: "none",
			}}
		>
			{props.text}
		</div>
	);
};
