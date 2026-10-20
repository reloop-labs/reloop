"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { Workflow, WorkflowReentry } from "../workflow-types";
import { SNAPPY_EASE } from "./editors/editor-shell";
import { useWorkflows } from "./workflows-provider";

/**
 * Saves an automation's re-entry setting. It applies to new enrollments right
 * away (no publish), so it can change on an active automation too.
 */
export function useReentry(workflow: Workflow) {
	const { updateWorkflow } = useWorkflows();
	// Value being saved, so the switches move right away.
	const [pending, setPending] = useState<WorkflowReentry | null>(null);

	const set = async (next: WorkflowReentry) => {
		if (pending !== null || next === workflow.reentry) return;
		setPending(next);
		try {
			await updateWorkflow(workflow.id, { reentry: next });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to update re-entry");
		} finally {
			setPending(null);
		}
	};

	return { value: pending ?? workflow.reentry, pending: pending !== null, set };
}

/**
 * Looks like `@reloop/ui/switch` but is plain markup: the row is the control.
 * Nesting the Radix switch (a button with ref state) inside the row's button
 * sent React into an update loop.
 */
const SwitchLook = ({
	checked,
	pending,
	disabled,
}: {
	checked: boolean;
	pending?: boolean;
	disabled?: boolean;
}) => {
	const state = checked ? "checked" : "unchecked";
	return (
		<span
			aria-hidden
			data-state={state}
			className="pointer-events-none mt-0.5 block h-5 w-8 shrink-0 p-0.5"
		>
			<span
				data-state={state}
				className={cn(
					"block h-4 w-7 rounded-full bg-bg-soft-200 p-0.5 transition duration-200 ease-out",
					!disabled && [
						"group-hover/row:bg-bg-sub-300",
						"data-[state=checked]:bg-primary-base group-hover/row:data-[state=checked]:bg-primary-darker",
					],
					disabled &&
						"bg-bg-white-0 p-[3px] ring-1 ring-stroke-soft-200 ring-inset",
				)}
			>
				<span
					data-state={state}
					className={cn(
						"relative block size-3",
						"transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
						"data-[state=checked]:translate-x-3",
						pending && "scale-95 animate-pulse opacity-75",
						!disabled && [
							"before:-translate-x-1/2 before:absolute before:inset-y-0 before:left-1/2 before:w-3 before:rounded-full before:bg-static-white",
							"data-[state=checked]:before:bg-primary-foreground",
							"before:[mask:--mask]",
							"after:-translate-x-1/2 after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:rounded-full after:shadow-switch-thumb",
							"group-active/row:scale-[.833]",
						],
						disabled && "size-2.5 rounded-full bg-bg-soft-200 shadow-none",
					)}
					style={
						{
							"--mask":
								"radial-gradient(circle farthest-side at 50% 50%, #0000 1.95px, #000 2.05px 100%) 50% 50%/100% 100% no-repeat",
						} as React.CSSProperties
					}
				/>
			</span>
		</span>
	);
};

/** One labelled switch; the whole row toggles it. */
export const SettingSwitchRow = ({
	label,
	description,
	checked,
	pending,
	disabled,
	onCheckedChange,
	className,
}: {
	label: string;
	description: string;
	checked: boolean;
	pending?: boolean;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void;
	className?: string;
}) => (
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		disabled={disabled}
		onClick={() => onCheckedChange(!checked)}
		className={cn(
			"group/row flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left outline-none transition-colors",
			"hover:bg-bg-weak-50 focus-visible:bg-bg-weak-50 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:bg-white/5 dark:hover:bg-white/5",
			className,
		)}
	>
		<span className="flex min-w-0 flex-1 flex-col">
			<span className="font-medium text-text-strong-950 text-xs">{label}</span>
			<span className="mt-0.5 text-[11px] text-text-sub-600 leading-relaxed">
				{description}
			</span>
		</span>
		<SwitchLook checked={checked} pending={pending} disabled={disabled} />
	</button>
);

/**
 * "Allow re-entry", and once it's on, whether a new trigger cancels the run in
 * progress (restart) or lets runs overlap (parallel).
 */
export const ReentrySetting = ({
	value,
	onChange,
	pending,
	disabled,
}: {
	value: WorkflowReentry;
	onChange: (value: WorkflowReentry) => void;
	pending?: boolean;
	disabled?: boolean;
}) => {
	const reduceMotion = useReducedMotion();
	const allowed = value !== "once";
	// Height and opacity share one transition so the content fades in step.
	const transition = reduceMotion
		? { duration: 0 }
		: { duration: 0.2, ease: SNAPPY_EASE };

	return (
		<div>
			<SettingSwitchRow
				label="Allow re-entry"
				description={
					allowed
						? "Contacts start it again each time the trigger fires."
						: "Each contact goes through this automation once."
				}
				checked={allowed}
				pending={pending}
				disabled={disabled}
				onCheckedChange={(on) => onChange(on ? "restart" : "once")}
			/>
			<AnimatePresence initial={false}>
				{allowed ? (
					<motion.div
						key="cancel-running"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={transition}
						className="overflow-hidden"
					>
						<SettingSwitchRow
							label="Cancel the run in progress"
							description={
								value === "restart"
									? "A new trigger stops the contact's current run and starts over."
									: "Runs overlap: each one finishes on its own."
							}
							checked={value === "restart"}
							pending={pending}
							disabled={disabled}
							onCheckedChange={(on) => onChange(on ? "restart" : "parallel")}
						/>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
};
