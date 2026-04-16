"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import type { HeadingProps } from "../../../editor/block-types";
import { useEditorStore } from "../../../editor/use-editor-store";
import { useRef } from "react";

interface HeadingRendererProps {
	block: TemplateBlock;
}

export const HeadingRenderer = ({ block }: HeadingRendererProps) => {
	const props = block.props as unknown as HeadingProps;
	const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
	const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
	const isSelected = selectedBlockId === block.id;
	const ref = useRef<HTMLDivElement>(null);

	const fontSize = props.fontSize || 32;

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
				fontSize: `${fontSize}px`,
				fontWeight: props.fontWeight || 700,
				textAlign: props.align,
				lineHeight: 1.3,
				padding: "8px 16px",
				outline: "none",
			}}
		>
			{props.text}
		</div>
	);
};
