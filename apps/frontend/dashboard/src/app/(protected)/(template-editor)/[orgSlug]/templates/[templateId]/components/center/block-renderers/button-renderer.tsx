"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import type { ButtonProps } from "../../../editor/block-types";

interface ButtonRendererProps {
	block: TemplateBlock;
}

export const ButtonRenderer = ({ block }: ButtonRendererProps) => {
	const props = block.props as unknown as ButtonProps;

	return (
		<div
			style={{
				textAlign: props.align,
				padding: "8px 16px",
			}}
		>
			<button
				type="button"
				style={{
					backgroundColor: props.bgColor,
					color: props.textColor,
					borderRadius: `${props.borderRadius}px`,
					padding: `${props.paddingY}px ${props.paddingX}px`,
					fontFamily: props.fontFamily,
					fontSize: `${props.fontSize}px`,
					fontWeight: props.fontWeight,
					border: "none",
					cursor: "pointer",
					width: props.fullWidth ? "100%" : "auto",
					display: "inline-block",
					textDecoration: "none",
				}}
			>
				{props.text}
			</button>
		</div>
	);
};
