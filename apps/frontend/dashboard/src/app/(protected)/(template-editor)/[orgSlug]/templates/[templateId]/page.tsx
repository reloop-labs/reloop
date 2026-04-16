"use client";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import type { BlockType } from "./editor/block-types";
import { BLOCK_DEFINITIONS } from "./editor/block-types";
import { useEditorStore } from "./editor/use-editor-store";
import { useKeyboardShortcuts } from "./editor/use-keyboard-shortcuts";
import { CenterActions } from "./components/center-actions";
import { CenterHeader } from "./components/center-header";
import { LeftSidebar } from "./components/left-sidebar";
import { RightSidebar } from "./components/right-sidebar";

const Page = () => {
	useKeyboardShortcuts();

	const addBlock = useEditorStore((s) => s.addBlock);
	const blocks = useEditorStore((s) => s.blocks);
	const moveBlock = useEditorStore((s) => s.moveBlock);

	const [activeDragType, setActiveDragType] = useState<string | null>(null);

	// Configure sensors with a small activation distance to allow clicks
	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 8,
		},
	});
	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: {
			delay: 200,
			tolerance: 5,
		},
	});
	const sensors = useSensors(mouseSensor, touchSensor);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const data = active.data.current;

		if (data?.type === "sidebar-block") {
			setActiveDragType(data.blockType);
		} else if (data?.type === "canvas-block") {
			setActiveDragType(null);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveDragType(null);

		if (!over) return;

		const activeData = active.data.current;

		// Case 1: Dropping a sidebar block onto the canvas
		if (activeData?.type === "sidebar-block") {
			const blockType = activeData.blockType as BlockType;

			// If dropped over a canvas block, insert before/after it
			if (over.data.current?.type === "canvas-block") {
				const overIndex = over.data.current.index as number;
				addBlock(blockType, overIndex);
			} else {
				// Dropped on the canvas itself — append to end
				addBlock(blockType);
			}
			return;
		}

		// Case 2: Reordering blocks within the canvas
		if (activeData?.type === "canvas-block" && active.id !== over.id) {
			const oldIndex = blocks.findIndex((b) => b.id === active.id);
			const newIndex = blocks.findIndex((b) => b.id === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				moveBlock(oldIndex, newIndex);
			}
		}
	};

	// Find the drag overlay info
	const draggedDef = activeDragType
		? BLOCK_DEFINITIONS.find((d) => d.type === activeDragType)
		: null;

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex h-screen overflow-hidden">
				<LeftSidebar />
				<main className="flex flex-1 flex-col overflow-hidden">
					<CenterHeader />
					<CenterActions />
				</main>
				<RightSidebar />
			</div>

			{/* Drag overlay — floating preview while dragging from sidebar */}
			<DragOverlay dropAnimation={null}>
				{draggedDef && (
					<div className="flex items-center gap-2 rounded-xl border border-primary-base/30 bg-white px-4 py-2.5 shadow-lg">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-base/10">
							<Icon
								name={draggedDef.icon}
								className="h-4 w-4 text-primary-base"
							/>
						</div>
						<span className="font-medium text-sm text-text-strong-950">
							{draggedDef.label}
						</span>
					</div>
				)}
			</DragOverlay>
		</DndContext>
	);
};

export default Page;
