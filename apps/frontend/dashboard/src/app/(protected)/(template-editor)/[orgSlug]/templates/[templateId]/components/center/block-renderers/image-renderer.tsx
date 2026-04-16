"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ImageProps } from "../../../editor/block-types";

interface ImageRendererProps {
	block: TemplateBlock;
}

export const ImageRenderer = ({ block }: ImageRendererProps) => {
	const props = block.props as unknown as ImageProps;

	if (!props.src) {
		// Empty state — image placeholder
		return (
			<div
				style={{ textAlign: props.align, padding: "8px 16px" }}
			>
				<div
					className={cn(
						"flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stroke-soft-200",
						"bg-bg-weak-50/50 py-10 transition-colors",
						"hover:border-primary-base/40 hover:bg-primary-base/5",
					)}
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-white-0 shadow-sm">
						<Icon
							name="image-1"
							className="h-5 w-5 text-text-soft-400"
						/>
					</div>
					<p className="text-xs text-text-soft-400">
						Add an image URL in the properties panel
					</p>
				</div>
			</div>
		);
	}

	return (
		<div style={{ textAlign: props.align, padding: "8px 16px" }}>
			<img
				src={props.src}
				alt={props.alt}
				style={{
					width: props.width,
					height: props.height,
					maxWidth: "100%",
					display: "inline-block",
				}}
			/>
		</div>
	);
};
