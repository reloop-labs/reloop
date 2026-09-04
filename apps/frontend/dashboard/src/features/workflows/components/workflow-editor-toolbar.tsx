"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatedSidebarToggleIcon } from "#/features/dashboard/sidebar/animated-sidebar-toggle-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";
import { useSidebarCollapse } from "#/features/dashboard/sidebar/use-sidebar-collapse";
import {
	isTriggerNode,
	type Workflow,
	type WorkflowStatus,
} from "../workflow-types";
import { validateWorkflow } from "../workflow-validation";
import { EnrollContactModal } from "./enroll-contact-modal";
import { WorkflowStatusBadge } from "./workflow-status-badge";

interface WorkflowEditorToolbarProps {
	workflow: Workflow;
	name: string;
	onNameChange: (name: string) => void;
	onStatusChange: (status: WorkflowStatus) => Promise<void> | void;
	onSave: () => Promise<void> | void;
}

function SidebarToggleButton() {
	const { isCollapsed, toggle } = useSidebarCollapse();
	const {
		isAnimating,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
	} = usePlayAnimationOnHover(500);

	return (
		<button
			type="button"
			onClick={toggle}
			title="Toggle Sidebar (⌘B)"
			data-animating={isAnimating || undefined}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onAnimationStart={onAnimationStart}
			onAnimationEnd={onAnimationEnd}
			className={cn(
				"group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors",
				"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5",
			)}
		>
			<AnimatedSidebarToggleIcon
				className={cn("h-4 w-4", isCollapsed && "rotate-180")}
			/>
		</button>
	);
}

export const WorkflowEditorToolbar = ({
	workflow,
	name,
	onNameChange,
	onStatusChange,
	onSave,
}: WorkflowEditorToolbarProps) => {
	const validation = validateWorkflow(workflow);
	const isActive = workflow.status === "active";
	const [busy, setBusy] = useState(false);
	const [enrollOpen, setEnrollOpen] = useState(false);
	const triggerNode = workflow.nodes.find(isTriggerNode);
	const triggerEvent =
		workflow.triggerEvent ||
		(typeof triggerNode?.data.eventKey === "string"
			? triggerNode.data.eventKey
			: null);

	const handleToggleActive = async (checked: boolean) => {
		if (busy) return;
		if (checked && !validation.isValid) {
			toast.error(validation.warnings[0] ?? "Complete the workflow first");
			return;
		}

		setBusy(true);
		try {
			await onSave();
			await onStatusChange(checked ? "active" : "paused");
			toast.success(checked ? "Automation activated" : "Automation paused");
		} catch (e) {
			toast.error(
				e instanceof Error
					? e.message
					: checked
						? "Failed to activate"
						: "Failed to pause",
			);
		} finally {
			setBusy(false);
		}
	};

	const handleSave = async () => {
		if (busy) return;
		setBusy(true);
		try {
			await onSave();
			toast.success("Automation saved");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to save");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="flex shrink-0 flex-col border-stroke-soft-200 border-b bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black">
			<div className="relative flex items-center justify-between px-4 py-2.5">
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<SidebarToggleButton />
					<div className="hidden items-center gap-1.5 sm:flex">
						<Icon name="workflow" className="size-4 text-text-sub-600" />
						<Link
							href="/automation"
							className="font-medium text-label-sm text-text-sub-600 hover:text-text-strong-950"
						>
							Automation
						</Link>
					</div>
					<span className="hidden text-text-disabled-300 text-xs sm:inline">
						/
					</span>
					<input
						type="text"
						value={name}
						onChange={(e) => onNameChange(e.target.value)}
						placeholder="Automation name"
						className="min-w-0 max-w-[280px] rounded-md bg-transparent px-1.5 py-1 font-semibold text-label-sm text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 hover:bg-bg-weak-50 focus:bg-bg-weak-50 focus:ring-0"
						aria-label="Automation name"
					/>
				</div>

				<div className="flex items-center gap-2.5">
					<WorkflowStatusBadge status={workflow.status} />
					<div className="flex items-center gap-2">
						<span className="hidden text-text-sub-600 text-xs sm:inline">
							{isActive ? "On" : "Off"}
						</span>
						<Switch.Root
							checked={isActive}
							onCheckedChange={(v) => void handleToggleActive(v)}
							disabled={busy || (!validation.isValid && !isActive)}
							aria-label={isActive ? "Pause automation" : "Activate automation"}
						/>
					</div>
					<button
						type="button"
						onClick={() => setEnrollOpen(true)}
						disabled={busy}
						className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-medium text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-50"
					>
						<Icon name="send" className="h-3.5 w-3.5" />
						Enroll
					</button>
					<FancyButton.Root
						variant="blue"
						size="xsmall"
						onClick={() => void handleSave()}
						disabled={busy}
					>
						{busy ? "Saving…" : "Save"}
					</FancyButton.Root>
				</div>
			</div>
			<EnrollContactModal
				automationId={workflow.id}
				triggerEvent={triggerEvent}
				canEnroll={isActive}
				open={enrollOpen}
				onOpenChange={setEnrollOpen}
			/>
			{validation.warnings.length > 0 && (
				<div
					className={cn(
						"flex items-start gap-2 border-stroke-soft-100 border-t px-4 py-2 text-xs dark:border-stroke-soft-100/50",
						validation.isValid
							? "bg-success-lighter/60 text-success-base"
							: "bg-warning-lighter/70 text-warning-base",
					)}
				>
					<Icon name="info-outline" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
					<p className="leading-relaxed">{validation.warnings.join(" · ")}</p>
				</div>
			)}
		</div>
	);
};
