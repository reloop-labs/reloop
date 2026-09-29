"use client";

import { Handle, Position } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useNodeEditor } from "../node-editor-context";
import { StepPickerMenu } from "../step-picker-menu";

/**
 * Trailing end-cap rendered after the last step: a stub line lands on the
 * invisible target handle and a plus button opens the step picker to append.
 * Display-only — never persisted (filtered out of the graph state).
 */
export const AddStepNode = () => {
	const [pickerOpen, setPickerOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { appendStep } = useNodeEditor();

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
		<div ref={ref} className="nodrag nopan relative flex w-[320px] justify-center">
			<Handle
				type="target"
				position={Position.Top}
				isConnectable={false}
				className="!h-0 !w-0 !border-0 !bg-transparent opacity-0"
			/>
			<button
				type="button"
				aria-label={pickerOpen ? "Close step picker" : "Add step here"}
				onClick={() => setPickerOpen((o) => !o)}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-full border shadow-regular-md transition-all duration-150",
					pickerOpen
						? "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-500"
						: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:bg-[#2b3038] dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-white",
				)}
			>
				<Icon
					name="plus"
					className={cn(
						"h-4 w-4 transition-transform duration-150",
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
