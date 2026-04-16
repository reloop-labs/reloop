"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEditorStore } from "../../editor/use-editor-store";
import { ButtonRenderer } from "./block-renderers/button-renderer";
import { ColumnsRenderer } from "./block-renderers/columns-renderer";
import { DividerRenderer } from "./block-renderers/divider-renderer";
import { HeadingRenderer } from "./block-renderers/heading-renderer";
import { HtmlRenderer } from "./block-renderers/html-renderer";
import { ImageRenderer } from "./block-renderers/image-renderer";
import { SectionRenderer } from "./block-renderers/section-renderer";
import { SpacerRenderer } from "./block-renderers/spacer-renderer";
import { TextRenderer } from "./block-renderers/text-renderer";

interface BlockRendererProps {
	block: TemplateBlock;
	index: number;
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
	heading: "Heading",
	text: "Text",
	button: "Button",
	image: "Image",
	divider: "Divider",
	spacer: "Spacer",
	section: "Section",
	columns: "Columns",
	html: "HTML",
	container: "Column",
};

function renderBlockContent(block: TemplateBlock) {
	switch (block.type) {
		case "heading":
			return <HeadingRenderer block={block} />;
		case "text":
			return <TextRenderer block={block} />;
		case "button":
			return <ButtonRenderer block={block} />;
		case "image":
			return <ImageRenderer block={block} />;
		case "divider":
			return <DividerRenderer block={block} />;
		case "spacer":
			return <SpacerRenderer block={block} />;
		case "section":
			return <SectionRenderer block={block} />;
		case "columns":
			return <ColumnsRenderer block={block} />;
		case "html":
			return <HtmlRenderer block={block} />;
		default:
			return (
				<div className="p-4 text-center text-sm text-text-soft-400">
					Unknown block type: {block.type}
				</div>
			);
	}
}

export const BlockRenderer = ({ block, index }: BlockRendererProps) => {
	const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
	const selectBlock = useEditorStore((s) => s.selectBlock);
	const removeBlock = useEditorStore((s) => s.removeBlock);
	const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
	const moveBlock = useEditorStore((s) => s.moveBlock);
	const totalBlocks = useEditorStore((s) => s.blocks.length);

	const isSelected = selectedBlockId === block.id;
	const typeLabel = BLOCK_TYPE_LABELS[block.type] || block.type;
	const isFirst = index === 0;
	const isLast = index === totalBlocks - 1;

	return (
		<div
			className={cn(
				"group/block relative transition-all duration-150",
				// Hover state
				!isSelected && "hover:ring-1 hover:ring-stroke-soft-200",
				// Selected state
				isSelected && "ring-1 ring-text-sub-600",
			)}
			onClick={(e) => {
				e.stopPropagation();
				selectBlock(block.id);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.stopPropagation();
					selectBlock(block.id);
				}
			}}
		>
			{/* Block type label (shown on hover/selected) */}
			<div
				className={cn(
					"pointer-events-none absolute -top-5 left-0 z-20 flex items-center gap-1 rounded-t-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 shadow-sm transition-opacity duration-150",
					isSelected
						? "opacity-100"
						: "opacity-0 group-hover/block:opacity-100",
				)}
			>
				{typeLabel}
			</div>

			{/* Action buttons (shown on hover/selected) */}
			<div
				className={cn(
					"absolute -top-5 right-0 z-20 flex items-center gap-0.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 p-0.5 shadow-sm transition-opacity duration-150",
					isSelected
						? "opacity-100"
						: "opacity-0 group-hover/block:opacity-100",
				)}
			>
				{/* Move up */}
				<button
					type="button"
					disabled={isFirst}
					onClick={(e) => {
						e.stopPropagation();
						if (!isFirst) moveBlock(index, index - 1);
					}}
					className={cn(
						"flex h-5 w-5 items-center justify-center rounded transition-colors",
						isFirst
							? "cursor-not-allowed text-text-disabled-300"
							: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
					)}
				>
					<Icon name="arrow-top" className="h-3 w-3" />
				</button>
				{/* Move down */}
				<button
					type="button"
					disabled={isLast}
					onClick={(e) => {
						e.stopPropagation();
						if (!isLast) moveBlock(index, index + 1);
					}}
					className={cn(
						"flex h-5 w-5 items-center justify-center rounded transition-colors",
						isLast
							? "cursor-not-allowed text-text-disabled-300"
							: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
					)}
				>
					<Icon name="arrow-down" className="h-3 w-3" />
				</button>
				<div className="mx-0.5 h-3 w-px bg-stroke-soft-200" />
				{/* Duplicate */}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						duplicateBlock(block.id);
					}}
					className="flex h-5 w-5 items-center justify-center rounded text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
				>
					<Icon name="copy" className="h-3 w-3" />
				</button>
				{/* Delete */}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						removeBlock(block.id);
					}}
					className="flex h-5 w-5 items-center justify-center rounded text-text-sub-600 transition-colors hover:bg-red-50 hover:text-red-500"
				>
					<Icon name="trash" className="h-3 w-3" />
				</button>
			</div>

			{/* Block content */}
			{renderBlockContent(block)}
		</div>
	);
};
