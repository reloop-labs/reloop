"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import type { SectionProps } from "../../../editor/block-types";
import { BlockRenderer } from "../block-renderer";

interface SectionRendererProps {
	block: TemplateBlock;
}

export const SectionRenderer = ({ block }: SectionRendererProps) => {
	const props = block.props as unknown as SectionProps;

	return (
		<div
			style={{
				backgroundColor: props.bgColor,
				padding: `${props.padding}px`,
				borderRadius: `${props.borderRadius}px`,
			}}
		>
			{block.children && block.children.length > 0 ? (
				block.children.map((child, index) => (
					<BlockRenderer key={child.id} block={child} index={index} totalSiblings={block.children!.length} />
				))
			) : (
				<div className="flex items-center justify-center rounded-lg border-2 border-dashed border-stroke-soft-200/50 py-8">
					<p className="text-xs text-text-soft-400">
						Drop blocks here
					</p>
				</div>
			)}
		</div>
	);
};
