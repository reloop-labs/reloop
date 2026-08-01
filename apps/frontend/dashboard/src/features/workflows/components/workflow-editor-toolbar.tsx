"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import type { Workflow, WorkflowStatus } from "../workflow-types";
import { validateWorkflow } from "../workflow-validation";

interface WorkflowEditorToolbarProps {
	workflow: Workflow;
	name: string;
	onNameChange: (name: string) => void;
	onStatusChange: (status: WorkflowStatus) => Promise<void> | void;
	onSave: () => Promise<void> | void;
}

export const WorkflowEditorToolbar = ({
	workflow,
	name,
	onNameChange,
	onStatusChange,
	onSave,
}: WorkflowEditorToolbarProps) => {
	const router = useRouter();
	const validation = validateWorkflow(workflow);
	const isActive = workflow.status === "active";
	const [busy, setBusy] = useState(false);

	const handleToggleActive = async (checked: boolean) => {
		if (busy) return;
		if (checked) {
			if (!validation.isValid) {
				toast.error(validation.warnings[0] ?? "Complete the workflow first");
				return;
			}
			setBusy(true);
			try {
				await onStatusChange("active");
				toast.success("Workflow activated");
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Failed to activate");
			} finally {
				setBusy(false);
			}
		} else {
			setBusy(true);
			try {
				await onStatusChange("paused");
				toast.success("Workflow paused");
			} catch (e) {
				toast.error(e instanceof Error ? e.message : "Failed to pause");
			} finally {
				setBusy(false);
			}
		}
	};

	const handleSave = async () => {
		if (busy) return;
		setBusy(true);
		try {
			await onSave();
			toast.success("Workflow saved");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to save");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="flex shrink-0 flex-col border-stroke-soft-100 border-b dark:border-stroke-soft-100/50">
			<div className="flex items-center gap-3 px-4 py-3">
				<AnimatedBackButton onClick={() => router.push("/workflows")} />
				<input
					type="text"
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
					className="min-w-0 flex-1 border-none bg-transparent font-medium text-lg text-text-strong-950 outline-none focus:ring-0"
					aria-label="Workflow name"
				/>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<span className="text-text-sub-600 text-xs">
							{isActive
								? "Active"
								: workflow.status === "paused"
									? "Paused"
									: "Draft"}
						</span>
						<Switch.Root
							checked={isActive}
							onCheckedChange={(v) => void handleToggleActive(v)}
							disabled={busy || (!validation.isValid && !isActive)}
						/>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => void handleSave()}
						disabled={busy}
					>
						Save
					</Button.Root>
				</div>
			</div>
			{validation.warnings.length > 0 && (
				<div
					className={cn(
						"flex items-start gap-2 border-stroke-soft-100 border-t px-4 py-2 text-xs dark:border-stroke-soft-100/50",
						validation.isValid
							? "bg-success-light/10 text-success-base"
							: "bg-warning-light/10 text-warning-base",
					)}
				>
					<Icon name="info-outline" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
					<ul className="list-inside list-disc">
						{validation.warnings.map((w) => (
							<li key={w}>{w}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
