"use client";

import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
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
import { DeleteWorkflowModal } from "./delete-workflow-modal";
import { EnrollContactModal } from "./enroll-contact-modal";
import { useWorkflows } from "./workflows-provider";

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
				<span
					className={cn(
						"ml-2 shrink-0 select-none rounded-full px-2.5 py-1 font-medium text-[11px] leading-none ring-1 ring-inset",
						status === "active"
							? "bg-success-lighter text-success-base ring-success-base/25 dark:bg-success-base/10 dark:ring-success-base/30"
							: "bg-bg-weak-50 text-text-sub-600 ring-stroke-soft-100 dark:bg-bg-soft-200 dark:ring-stroke-soft-100/40",
					)}
				>
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
	const router = useRouter();
	const { createWorkflow, updateWorkflow } = useWorkflows();
	const [, setDeleteId] = useQueryState("delete");
	const [busy, setBusy] = useState(false);
	const [testOpen, setTestOpen] = useState(false);
	const [stopOpen, setStopOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const [duplicating, setDuplicating] = useState(false);
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

	const handleStop = async () => {
		if (busy || !isActive) return;
		setStopOpen(false);
		setBusy(true);
		try {
			await onStatusChange("paused");
			toast.success("Automation stopped");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to stop");
		} finally {
			setBusy(false);
		}
	};

	const handleDuplicate = async () => {
		if (duplicating) return;
		setMoreOpen(false);
		setDuplicating(true);
		try {
			const created = await createWorkflow({
				name: `${workflow.name} (Copy)`,
				description: workflow.description ?? undefined,
			});
			if (workflow.nodes?.length || workflow.edges?.length) {
				await updateWorkflow(created.id, {
					nodes: workflow.nodes,
					edges: workflow.edges,
				});
			}
			toast.success(`Duplicated "${workflow.name}"`);
			router.push(`/automation/${created.id}`);
		} catch {
			toast.error("Failed to duplicate automation");
		} finally {
			setDuplicating(false);
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
				<Dropdown.Root open={moreOpen} onOpenChange={setMoreOpen}>
					<Dropdown.Trigger asChild>
						<FancyButton.Root
							variant="basic"
							size="xsmall"
							aria-label="More actions"
							className="w-8 px-0"
						>
							<Icon name="more-horizontal" className="h-4 w-4" />
						</FancyButton.Root>
					</Dropdown.Trigger>
					<Dropdown.Content
						align="end"
						sideOffset={6}
						className="w-48 p-1.5"
					>
						<Dropdown.Item
							onSelect={() => {
								setMoreOpen(false);
								setTestOpen(true);
							}}
							className="cursor-pointer"
						>
							<Icon name="play" className="size-3.5 text-text-sub-600" />
							<span className="flex-1 font-medium text-xs">Test automation</span>
						</Dropdown.Item>
						<Dropdown.Item
							onSelect={() => void handleDuplicate()}
							className="cursor-pointer"
						>
							<Icon name="copy" className="size-3.5 text-text-sub-600" />
							<span className="flex-1 font-medium text-xs">Duplicate</span>
						</Dropdown.Item>
						<Dropdown.Separator className="mx-2 my-1 h-px bg-stroke-soft-200 dark:bg-white/10" />
						<Dropdown.Item
							onSelect={() => {
								setMoreOpen(false);
								void setDeleteId(workflow.id);
							}}
							className="cursor-pointer text-error-base data-[highlighted]:text-error-base"
						>
							<Icon name="trash" className="size-3.5" />
							<span className="flex-1 font-medium text-xs">Delete</span>
						</Dropdown.Item>
					</Dropdown.Content>
				</Dropdown.Root>
				{isActive ? (
					<Dropdown.Root open={stopOpen} onOpenChange={setStopOpen}>
						<Dropdown.Trigger asChild>
							<FancyButton.Root
								variant="basic"
								size="xsmall"
								disabled={busy}
							>
								{busy ? "Stopping…" : "Stop"}
								<Icon name="chevron-down" className="h-3.5 w-3.5" />
							</FancyButton.Root>
						</Dropdown.Trigger>
						<Dropdown.Content
							align="end"
							sideOffset={6}
							className="w-64 overflow-hidden rounded-2xl p-1.5"
						>
							<Dropdown.Item
								onSelect={() => void handleStop()}
								className="cursor-pointer rounded-xl px-3 py-2.5 outline-none hover:bg-bg-weak-50 dark:hover:bg-white/5"
							>
								<div className="flex flex-col">
									<p className="font-medium text-[13px] text-text-strong-950">
										Stop new automations
									</p>
									<p className="mt-0.5 text-xs leading-relaxed text-text-sub-600">
										Automations that are currently running will continue.
									</p>
								</div>
							</Dropdown.Item>
							<Dropdown.Item
								onSelect={() => void handleStop()}
								className="cursor-pointer rounded-xl px-3 py-2.5 outline-none hover:bg-bg-weak-50 dark:hover:bg-white/5"
							>
								<div className="flex flex-col">
									<p className="font-medium text-[13px] text-text-strong-950">
										Stop now
									</p>
									<p className="mt-0.5 text-xs leading-relaxed text-text-sub-600">
										All automations will stop immediately
									</p>
								</div>
							</Dropdown.Item>
						</Dropdown.Content>
					</Dropdown.Root>
				) : (
					<FancyButton.Root
						variant="blue"
						size="xsmall"
						onClick={() => void handleStart()}
						disabled={busy || !validation.isValid}
						className="dark:text-black dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.4),0_0_0_1px_#ffffff] dark:[--zero-blue:#ffffff] dark:[--zero-blue-hover:#e6edf3]"
					>
						{busy ? "Starting…" : "Start"}
					</FancyButton.Root>
				)}
			</div>
			<EnrollContactModal
				automationId={workflow.id}
				triggerEvent={triggerEvent}
				canEnroll={isActive}
				open={testOpen}
				onOpenChange={setTestOpen}
			/>
			<DeleteWorkflowModal workflows={[workflow]} />
		</div>
	);
};
