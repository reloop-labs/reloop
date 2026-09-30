"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, Position } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { useNodeEditor } from "../node-editor-context";
import { StepPickerMenu } from "../step-picker-menu";

/**
 * Trailing end-cap rendered after the last step: a vertical connector line
 * drops from the previous card to a circular plus button (see reference)
 * which opens the step picker to append. Display-only — never persisted.
 */
export const AddStepNode = () => {
	const [pickerOpen, setPickerOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { appendStep, readOnly } = useNodeEditor();

	if (readOnly) return null;

	useEffect(() => {
		if (!pickerOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setPickerOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [pickerOpen]);

	return (
		<div
			ref={ref}
			className="nodrag nopan relative flex w-[420px] flex-col items-center"
		>
			<Handle
				type="target"
				position={Position.Top}
				isConnectable={false}
				className="!h-0 !w-0 !border-0 !bg-transparent opacity-0"
			/>
			{/* Vertical connector from the previous card down to the plus. */}
			<div
				aria-hidden="true"
				className="h-16 w-[2px] bg-gray-400/80 dark:bg-white/25"
			/>
			<button
				type="button"
				aria-label={pickerOpen ? "Close step picker" : "Add step here"}
				onClick={() => setPickerOpen((o) => !o)}
				className={cn(
					"flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-white shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-all duration-150",
					pickerOpen
						? "bg-blue-500 hover:bg-blue-600"
						: "bg-[#3d444d] hover:bg-[#4d555e] active:scale-95",
				)}
			>
				<Icon
					name="plus"
					className={cn(
						"h-5 w-5 transition-transform duration-150",
						pickerOpen && "rotate-45",
					)}
				/>
			</button>
			{pickerOpen ? (
				<StepPickerMenu
					onPick={(kind) => {
						appendStep(kind);
						setPickerOpen(false);
					}}
				/>
			) : null}
		</div>
	);
};
