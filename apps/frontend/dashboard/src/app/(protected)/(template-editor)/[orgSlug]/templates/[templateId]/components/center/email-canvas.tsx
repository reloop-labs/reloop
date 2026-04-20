"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useEditorStore } from "../../editor/use-editor-store";
import { EmailEditor } from "@reloop/ui/email-editor";

// The canvas now directly mounts the EmailEditor engine.
export const EmailCanvas = () => {
	const viewMode = useEditorStore((s) => s.viewMode);
	const globalSettings = useEditorStore((s) => s.globalSettings);
	const selectBlock = useEditorStore((s) => s.selectBlock);
	const setViewMode = useEditorStore((s) => s.setViewMode);
	const setEditor = useEditorStore((s) => s.setEditor);
	const setTiptapSelection = useEditorStore((s) => s.setTiptapSelection);
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
						<Icon name="smartphone" className="h-3.5 w-3.5" />
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
						isOver && "shadow-lg ring-2 ring-dashed ring-primary-base/40",
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
					<div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
						<EmailEditor 
							onEditorReady={setEditor} 
							onSelectionChange={setTiptapSelection}
							className={cn(isOver && "opacity-80")} 
						/>
					</div>
				</motion.div>
			</div>
		</div>
	);
};


