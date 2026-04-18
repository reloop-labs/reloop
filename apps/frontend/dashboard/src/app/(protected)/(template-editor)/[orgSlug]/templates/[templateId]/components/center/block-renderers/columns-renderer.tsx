"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import type { ColumnsProps } from "../../../editor/block-types";
import { BlockRenderer } from "../block-renderer";

interface ColumnsRendererProps {
	block: TemplateBlock;
}

export const ColumnsRenderer = ({ block }: ColumnsRendererProps) => {
	const props = block.props as unknown as ColumnsProps;

	return (
		<div
			style={{
				display: "flex",
				gap: `${props.gap}px`,
				padding: "8px 16px",
			}}
		>
			{(block.children || []).map((child, i) => (
				<div
					key={child.id}
					style={{
						width: `${props.widths[i] || 100 / props.columns}%`,
						minHeight: "60px",
					}}
				>
					{child.children && child.children.length > 0 ? (
						child.children.map((grandchild, j) => (
							<BlockRenderer
								key={grandchild.id}
								block={grandchild}
								index={j}
								totalSiblings={child.children!.length}
							/>
						))
					) : (
						<div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-stroke-soft-200/50 py-4">
							<p className="text-[10px] text-text-soft-400">
								Column {i + 1}
							</p>
						</div>
					)}
				</div>
			))}
		</div>
	);
};
