"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEffect } from "react";
import { nodeTone, type WorkflowNodeTone } from "../node-tone";
import type { InsertStepKind } from "./node-editor-context";

export interface StepPickerItem {
	kind: InsertStepKind;
	tone: WorkflowNodeTone;
	title: string;
	description: string;
}

export const PICKER_SECTIONS: {
	label: string;
	items: StepPickerItem[];
}[] = [
	{
		label: "Messages",
		items: [
			{
				kind: "send_email",
				tone: "send_email",
				title: "Send email",
				description: "Send an automated email to contact",
			},
		],
	},
	{
		label: "Flow control",
		items: [
			{
				kind: "delay",
				tone: "delay",
				title: "Delay",
				description: "Wait a duration of time before continuing",
			},
			{
				kind: "condition",
				tone: "condition",
				title: "Condition",
				description: "Branch flow into Yes / No paths based on rules",
			},
		],
	},
];

interface StepPickerMenuProps {
	onPick: (kind: InsertStepKind) => void;
	onClose?: () => void;
	className?: string;
}

/**
 * Full node card rendered when the plus button converts into a step selection node.
 * Features a closable header and categorized step list without search, select pill, or shadows.
 */
export const StepPickerMenu = ({
	onPick,
	onClose,
	className,
}: StepPickerMenuProps) => {
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose?.();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [onClose]);

	return (
		<div
			className={cn(
				"relative w-[420px] rounded-[14px] border border-blue-500/40 bg-bg-weak-50/60 p-0.5 ring-2 ring-blue-500/15 transition-all duration-150 ease-out dark:border-blue-500/50 dark:bg-[#101014]",
				className,
			)}
		>
			{/* Top connector dot anchor */}
			<div
				aria-hidden="true"
				className="-top-1.5 -translate-x-1/2 absolute left-1/2 h-2.5 w-2.5 rounded-full border-2 border-bg-white-0 bg-blue-500 shadow-xs dark:border-[#141419]"
			/>

			{/* Card Header */}
			<div className="flex items-center gap-2 px-2.5 py-2">
				<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-blue-500/30 bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
					<Icon name="plus" className="h-3.5 w-3.5" />
				</span>
				<p className="min-w-0 flex-1 truncate font-medium text-[14px] text-text-strong-950">
					Add a step
				</p>
				{onClose ? (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}
						aria-label="Close step picker"
						className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
					>
						<Icon name="cross" className="h-3 w-3" />
					</button>
				) : null}
			</div>

			{/* Inset Body */}
			<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-2 dark:border-stroke-soft-100/40 dark:bg-[#141419]">
				{/* Step items list */}
				<div className="nowheel space-y-2.5">
					{PICKER_SECTIONS.map((section) => (
						<div key={section.label} className="space-y-1">
							<p className="px-1 font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								{section.label}
							</p>
							{section.items.map((item) => {
								const meta = nodeTone[item.tone];
								return (
									<button
										key={item.kind}
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onPick(item.kind);
										}}
										className="group/item flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left hover:border-stroke-soft-200 hover:bg-bg-weak-50/80 dark:hover:border-stroke-soft-100/50 dark:hover:bg-white/[0.04]"
									>
										<span
											className={cn(
												"flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border bg-transparent",
												meta.iconBorder,
											)}
										>
											<Icon
												name={meta.icon}
												className={cn("h-3.5 w-3.5", meta.iconClass)}
											/>
										</span>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-[13px] text-text-strong-950">
												{item.title}
											</p>
											<p className="truncate text-[11px] text-text-sub-600">
												{item.description}
											</p>
										</div>
										<Icon
											name="chevron-right"
											className="h-3.5 w-3.5 shrink-0 text-text-soft-400 opacity-0 transition-opacity group-hover/item:opacity-100"
										/>
									</button>
								);
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
