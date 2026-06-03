"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Workflow, WorkflowStatus } from "../workflow-types";
import { validateWorkflow } from "../workflow-validation";

interface WorkflowEditorToolbarProps {
	workflow: Workflow;
	name: string;
	onNameChange: (name: string) => void;
	onStatusChange: (status: WorkflowStatus) => void;
	onSave: () => void;
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

	const handleToggleActive = (checked: boolean) => {
		if (checked) {
			if (!validation.isValid) {
				toast.error(validation.warnings[0] ?? "Complete the workflow first");
				return;
			}
			onStatusChange("active");
			toast.success("Workflow activated (mock)");
		} else {
			onStatusChange("paused");
			toast.success("Workflow paused");
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
							onCheckedChange={handleToggleActive}
							disabled={!validation.isValid && !isActive}
						/>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onSave}
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
