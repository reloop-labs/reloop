"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@reloop/ui/cn";
import * as Tooltip from "@reloop/ui/tooltip";
import { type RowPreset, ROW_PRESETS } from "../../editor/block-types";
import { useEditorStore } from "../../editor/use-editor-store";

interface RowTileProps {
	preset: RowPreset;
}

const RowTile = ({ preset }: RowTileProps) => {
	const addBlock = useEditorStore((s) => s.addBlock);

	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `sidebar-row-${preset.label}`,
		data: {
			type: "sidebar-block",
			blockType: "columns",
		},
	});

	const handleClick = () => {
		addBlock("columns");
		// After adding, update with the preset's widths
		const state = useEditorStore.getState();
		const lastBlock = state.blocks[state.blocks.length - 1];
		if (lastBlock) {
			state.updateBlockProps(lastBlock.id, {
				columns: preset.columns,
				widths: preset.widths,
			});
		}
	};

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<button
					ref={setNodeRef}
					type="button"
					onClick={handleClick}
					className={cn(
						"flex w-full items-center gap-1.5 rounded-xl border border-transparent p-3",
						"cursor-grab transition-all duration-200 ease-out",
						"hover:border-stroke-soft-200 hover:bg-bg-weak-50 hover:shadow-sm",
						"active:cursor-grabbing active:scale-[0.98]",
						isDragging && "opacity-50",
					)}
					{...listeners}
					{...attributes}
				>
					{/* Visual row preview */}
					<div className="flex flex-1 gap-1">
						{preset.widths.map((width, i) => (
							<div
								key={`${preset.label}-${i}`}
								className="h-8 rounded bg-bg-strong-950/10 transition-colors"
								style={{ width: `${width}%` }}
							/>
						))}
					</div>
				</button>
			</Tooltip.Trigger>
			<Tooltip.Content
				side="bottom"
				size="xsmall"
				variant="light"
				className="text-xs"
			>
				{preset.label}
			</Tooltip.Content>
		</Tooltip.Root>
	);
};

export const RowTileGrid = () => {
	return (
		<div className="flex flex-col gap-1">
			{ROW_PRESETS.map((preset) => (
				<RowTile key={preset.label} preset={preset} />
			))}
		</div>
	);
};
