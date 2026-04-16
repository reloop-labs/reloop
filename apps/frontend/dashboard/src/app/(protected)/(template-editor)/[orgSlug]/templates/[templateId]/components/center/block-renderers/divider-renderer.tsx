"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import type { DividerProps } from "../../../editor/block-types";

interface DividerRendererProps {
	block: TemplateBlock;
}

export const DividerRenderer = ({ block }: DividerRendererProps) => {
	const props = block.props as unknown as DividerProps;

	return (
		<div style={{ padding: "8px 16px" }}>
			<hr
				style={{
					border: "none",
					borderTop: `${props.thickness}px ${props.style} ${props.color}`,
					width: props.width,
					margin: "0 auto",
				}}
			/>
		</div>
	);
};
