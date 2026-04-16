"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useEditorStore } from "../../editor/use-editor-store";
import { BlockRenderer } from "./block-renderer";

// Sortable wrapper for each block in the canvas
const SortableBlock = ({
	block,
	index,
}: {
	block: { id: string; type: string; props: Record<string, unknown>; children?: unknown[] };
	index: number;
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: block.id,
		data: {
			type: "canvas-block",
			index,
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"relative",
				isDragging && "z-50 opacity-60",
			)}
			{...attributes}
		>
			{/* Drag handle — appears on hover */}
			<div
				className={cn(
					"absolute top-1/2 -left-6 z-30 flex -translate-y-1/2 cursor-grab items-center justify-center opacity-0 transition-opacity active:cursor-grabbing",
					"group-hover/block:opacity-100",
				)}
				{...listeners}
			>
				<div className="flex h-6 w-4 items-center justify-center rounded text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-sub-600">
					<Icon name="drag-handle" className="h-3.5 w-3.5" />
				</div>
			</div>
			<BlockRenderer block={block as any} index={index} />
		</div>
	);
};

export const EmailCanvas = () => {
	const blocks = useEditorStore((s) => s.blocks);
	const viewMode = useEditorStore((s) => s.viewMode);
	const globalSettings = useEditorStore((s) => s.globalSettings);
	const selectBlock = useEditorStore((s) => s.selectBlock);
	const setViewMode = useEditorStore((s) => s.setViewMode);
	const undo = useEditorStore((s) => s.undo);
	const redo = useEditorStore((s) => s.redo);
	const undoStack = useEditorStore((s) => s.undoStack);
	const redoStack = useEditorStore((s) => s.redoStack);

	const canvasWidth =
		viewMode === "desktop" ? globalSettings.contentWidth : 375;

	// Make the canvas a droppable zone
	const { setNodeRef, isOver } = useDroppable({
		id: "email-canvas-drop",
		data: { type: "canvas" },
	});

	return (
		<div
			className="flex flex-1 flex-col"
			onClick={() => selectBlock(null)}
			onKeyDown={() => {}}
		>
			{/* Toolbar */}
			<div className="flex items-center justify-center gap-2 border-stroke-soft-100/50 border-b px-4 py-2">
				{/* Undo/Redo */}
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							undo();
						}}
						disabled={undoStack.length === 0}
						className={cn(
							"flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
							undoStack.length > 0
								? "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
								: "cursor-not-allowed text-text-disabled-300",
						)}
					>
						<Icon name="undo" className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							redo();
						}}
						disabled={redoStack.length === 0}
						className={cn(
							"flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
							redoStack.length > 0
								? "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
								: "cursor-not-allowed text-text-disabled-300",
						)}
					>
						<Icon name="redo" className="h-3.5 w-3.5" />
					</button>
				</div>

				<div className="h-4 w-px bg-stroke-soft-200" />

				{/* Desktop/Mobile toggle */}
				<div className="flex items-center gap-0.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-0.5">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setViewMode("desktop");
						}}
						className={cn(
							"flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200",
							viewMode === "desktop"
								? "bg-bg-strong-950 text-white shadow-sm"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						<Icon name="monitor" className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setViewMode("mobile");
						}}
						className={cn(
							"flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200",
							viewMode === "mobile"
								? "bg-bg-strong-950 text-white shadow-sm"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						<Icon name="smartphone-2" className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			{/* Canvas area */}
			<div
				className="flex-1 overflow-y-auto p-8"
				style={{
					backgroundColor: globalSettings.backgroundColor,
				}}
			>
				<motion.div
					layout
					ref={setNodeRef}
					className={cn(
						"shadow-sm transition-shadow",
						globalSettings.contentAlign === "center" && "mx-auto",
						globalSettings.contentAlign === "left" && "mr-auto",
						globalSettings.contentAlign === "right" && "ml-auto",
						isOver && "ring-2 ring-primary-base/40 ring-dashed shadow-lg",
					)}
					style={{
						backgroundColor: globalSettings.contentBackgroundColor,
						maxWidth: canvasWidth,
					}}
					animate={{
						maxWidth: canvasWidth,
					}}
					transition={{
						duration: 0.4,
						ease: [0.4, 0, 0.2, 1],
					}}
				>
					{blocks.length === 0 ? (
						<EmptyCanvasState isOver={isOver} />
					) : (
						<SortableContext
							items={blocks.map((b) => b.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className="flex flex-col py-2">
								{blocks.map((block, index) => (
									<SortableBlock
										key={block.id}
										block={block}
										index={index}
									/>
								))}
							</div>
						</SortableContext>
					)}
				</motion.div>
			</div>
		</div>
	);
};

const EmptyCanvasState = ({ isOver }: { isOver: boolean }) => {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-24 transition-colors",
				isOver && "bg-primary-base/5",
			)}
		>
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1, duration: 0.4 }}
				className="flex flex-col items-center gap-4"
			>
				{/* Animated icon */}
				<div className="relative">
					<div
						className={cn(
							"flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
							isOver ? "bg-primary-base/10" : "bg-bg-weak-50",
						)}
					>
						<Icon
							name={isOver ? "plus" : "mail-1"}
							className={cn(
								"h-7 w-7",
								isOver
									? "text-primary-base"
									: "text-text-soft-400",
							)}
						/>
					</div>
					{!isOver && (
						<motion.div
							animate={{
								y: [0, -4, 0],
							}}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
							className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-primary-base/10"
						>
							<Icon
								name="plus"
								className="h-3 w-3 text-primary-base"
							/>
						</motion.div>
					)}
				</div>

				<div className="text-center">
					<p className="font-medium text-sm text-text-strong-950">
						{isOver
							? "Drop to add block"
							: "Start building your email"}
					</p>
					<p className="mt-1 max-w-[240px] text-xs text-text-soft-400">
						{isOver
							? "Release to add this block to your template"
							: "Click or drag a block from the left panel to get started"}
					</p>
				</div>
			</motion.div>
		</div>
	);
};
