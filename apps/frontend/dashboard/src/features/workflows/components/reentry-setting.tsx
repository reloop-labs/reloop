"use client";

import { cn } from "@reloop/ui/cn";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
			"flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition-colors",
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
		<Switch.Root
			checked={checked}
			isPending={pending}
			tabIndex={-1}
			aria-hidden
			// Display only: the row is the control.
			className="pointer-events-none mt-0.5"
		/>
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
