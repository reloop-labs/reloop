"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

function WorkflowNameField({
	name,
	onNameChange,
	status,
	readOnly,
}: {
	name: string;
	onNameChange: (name: string) => void;
	status: WorkflowStatus;
	readOnly: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const measureRef = useRef<HTMLSpanElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: name changes DOM width, which we need to measure
	useEffect(() => {
		if (readOnly) return;
		if (measureRef.current && inputRef.current) {
			const width = measureRef.current.offsetWidth;
			inputRef.current.style.width = `${Math.max(60, width)}px`;
		}
	}, [name, readOnly]);

	const statusLabel =
		status === "active" ? "Active" : status === "paused" ? "Paused" : "Draft";

	return (
		<div className="flex items-center">
			<div className="flex items-center gap-1.5">
				<Icon name="workflow" className="size-4 text-text-sub-600" />
				<Link
					href="/automation"
					className="font-medium text-label-sm text-text-sub-600 hover:text-text-strong-950"
				>
					Automation
				</Link>
			</div>

			<span className="ml-2.5 text-text-disabled-300 text-xs">/</span>

			<div className="group ml-1 flex items-center">
				{readOnly ? (
					<span className="px-2 py-1 font-semibold text-label-sm text-text-strong-950">
						{name || "Automation name"}
					</span>
				) : (
					<>
						<span
							ref={measureRef}
							className="invisible absolute whitespace-pre px-2 py-1 font-semibold text-label-sm"
							aria-hidden="true"
						>
							{name || "Automation name"}
						</span>
						<input
							ref={inputRef}
							type="text"
							value={name}
							onChange={(e) => onNameChange(e.target.value)}
							placeholder="Automation name"
							className="rounded-md bg-transparent px-2 py-1 font-semibold text-label-sm text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 hover:bg-bg-weak-50 focus:ring-0"
							aria-label="Automation name"
						/>
					</>
				)}
				<span className="ml-2 shrink-0 select-none rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 leading-none ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-soft-200 dark:ring-stroke-soft-100/40">
					{statusLabel}
				</span>
			</div>
		</div>
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
	const [testOpen, setTestOpen] = useState(false);
	const triggerNode = workflow.nodes.find(isTriggerNode);
	const triggerEvent =
		workflow.triggerEvent ||
		(typeof triggerNode?.data.eventKey === "string"
			? triggerNode.data.eventKey
			: null);

	const handleStart = async () => {
		if (busy || isActive) return;
		if (!validation.isValid) {
			toast.error(validation.warnings[0] ?? "Complete the workflow first");
			return;
		}

		setBusy(true);
		try {
			await onSave();
			await onStatusChange("active");
			toast.success("Automation started");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to start");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="relative flex shrink-0 items-center justify-between border-stroke-soft-200 border-b bg-bg-white-0 px-4 py-2.5 dark:border-stroke-soft-100/40 dark:bg-black">
			{/* Left: Toggle */}
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<SidebarToggleButton />
			</div>

			{/* Center: Title / Breadcrumb */}
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div className="pointer-events-auto">
					<WorkflowNameField
						name={name}
						onNameChange={onNameChange}
						status={workflow.status}
						readOnly={isActive}
					/>
				</div>
			</div>

			{/* Right: Actions */}
			<div className="flex flex-1 items-center justify-end gap-2">
				<FancyButton.Root
					variant="basic"
					size="xsmall"
					onClick={() => setTestOpen(true)}
				>
					Test automation
				</FancyButton.Root>
				<FancyButton.Root
					variant="blue"
					size="xsmall"
					onClick={() => void handleStart()}
					disabled={busy || isActive || !validation.isValid}
				>
					{isActive ? "Started" : busy ? "Starting…" : "Start"}
				</FancyButton.Root>
			</div>
			<EnrollContactModal
				automationId={workflow.id}
				triggerEvent={triggerEvent}
				canEnroll={isActive}
				open={testOpen}
				onOpenChange={setTestOpen}
			/>
		</div>
	);
};
