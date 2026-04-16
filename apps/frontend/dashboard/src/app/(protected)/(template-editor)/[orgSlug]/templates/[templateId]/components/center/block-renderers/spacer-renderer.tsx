"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import { cn } from "@reloop/ui/cn";
import type { SpacerProps } from "../../../editor/block-types";

interface SpacerRendererProps {
	block: TemplateBlock;
}

export const SpacerRenderer = ({ block }: SpacerRendererProps) => {
	const props = block.props as unknown as SpacerProps;

	return (
		<div
			className="relative"
			style={{
				height: `${props.height}px`,
			}}
		>
			{/* Visual indicator showing the spacer height */}
			<div
				className={cn(
					"absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center",
					"opacity-0 transition-opacity group-hover/block:opacity-100",
				)}
			>
				<span className="rounded bg-bg-weak-50 px-2 py-0.5 font-mono text-[10px] text-text-soft-400">
					{props.height}px
				</span>
			</div>
		</div>
	);
};
