"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import type { BlockDefinition } from "../../editor/block-types";
import { useEditorStore } from "../../editor/use-editor-store";

interface BlockTileProps {
	definition: BlockDefinition;
}

export const BlockTile = ({ definition }: BlockTileProps) => {
	const addBlock = useEditorStore((s) => s.addBlock);

	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `sidebar-${definition.type}`,
		data: {
			type: "sidebar-block",
			blockType: definition.type,
		},
	});

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<button
					ref={setNodeRef}
					type="button"
					onClick={() => addBlock(definition.type)}
					className={cn(
						"group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-transparent p-3",
						"cursor-grab transition-all duration-200 ease-out",
						"hover:border-stroke-soft-200 hover:bg-bg-weak-50 hover:shadow-sm",
						"active:cursor-grabbing active:scale-[0.97]",
						isDragging && "opacity-50",
					)}
					{...listeners}
					{...attributes}
				>
					<div
						className={cn(
							"flex h-9 w-9 items-center justify-center rounded-lg",
							"bg-bg-weak-50 text-text-sub-600",
							"transition-all duration-200",
							"group-hover:bg-bg-white-0 group-hover:text-text-strong-950 group-hover:shadow-sm",
						)}
					>
						<Icon name={definition.icon} className="h-4.5 w-4.5" />
					</div>
					<span className="text-[11px] font-medium text-text-sub-600 transition-colors group-hover:text-text-strong-950">
						{definition.label}
					</span>
				</button>
			</Tooltip.Trigger>
			<Tooltip.Content
				side="bottom"
				size="xsmall"
				variant="light"
				className="text-xs"
			>
				{definition.description}
			</Tooltip.Content>
		</Tooltip.Root>
	);
};
