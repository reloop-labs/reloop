"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { Workflow } from "../workflow-types";
import { useWorkflows } from "./workflows-provider";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type DeleteState = "idle" | "deleting" | "success";

export function DeleteWorkflowModal({
	workflows,
	selectedWorkflows = [],
	onClearSelection,
}: {
	workflows: Workflow[];
	selectedWorkflows?: Workflow[];
	onClearSelection?: () => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const pathname = usePathname();
	const router = useRouter();
	const { deleteWorkflow } = useWorkflows();

	const isBulk = deleteId === "bulk" || deleteId === "selected";

	const targetWorkflowRef = useRef<Workflow | null>(null);
	const currentWorkflow = workflows.find((w) => w.id === deleteId);
	if (currentWorkflow) {
		targetWorkflowRef.current = currentWorkflow;
	}
	const workflowToDelete = currentWorkflow || targetWorkflowRef.current;

	const targetBulkWorkflowsRef = useRef<Workflow[]>([]);
	if (isBulk && selectedWorkflows.length > 0) {
		targetBulkWorkflowsRef.current = selectedWorkflows;
	}
	const bulkWorkflowsToDelete = isBulk
		? selectedWorkflows.length > 0
			? selectedWorkflows
			: targetBulkWorkflowsRef.current
		: [];

	const isOnDetailPage =
		pathname.includes("/automation/") &&
		!pathname.endsWith("/automation") &&
		!pathname.endsWith("/automation/");

	const displayName = isBulk
		? `delete ${bulkWorkflowsToDelete.length} automation${bulkWorkflowsToDelete.length === 1 ? "" : "s"}`
		: workflowToDelete?.name || "automation";

	const normalizedInput = confirmationText.trim().toLowerCase();
	const isConfirmed = isBulk
		? normalizedInput === displayName.toLowerCase() ||
			normalizedInput === `delete ${bulkWorkflowsToDelete.length} automation` ||
			normalizedInput === "delete"
		: confirmationText === displayName;

	const canDelete =
		isConfirmed &&
		deleteState === "idle" &&
		(isBulk ? bulkWorkflowsToDelete.length > 0 : !!workflowToDelete);

	const handleCopyName = async () => {
		try {
			await navigator.clipboard.writeText(displayName);
			setNameCopied(true);
			setTimeout(() => setNameCopied(false), 1500);
		} catch {
			// silently fail
		}
	};

	const handleDelete = async () => {
		if (!canDelete) return;

		if (isBulk) {
			try {
				setDeleteState("deleting");
				let ok = 0;
				let failed = 0;
				for (const wf of bulkWorkflowsToDelete) {
					try {
						await deleteWorkflow(wf.id);
						ok += 1;
					} catch {
						failed += 1;
					}
				}
				setDeleteState("success");

				setTimeout(() => {
					onClearSelection?.();
					void setDeleteId(null);
					if (ok > 0) {
						toast.success(`Deleted ${ok} automation${ok === 1 ? "" : "s"}`);
					}
					if (failed > 0) {
						toast.error(
							`${failed} automation${failed === 1 ? "" : "s"} failed to delete`,
						);
					}
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetBulkWorkflowsRef.current = [];
					}, 300);
				}, 300);
			} catch {
				toast.error("Failed to delete automations");
				setDeleteState("idle");
			}
			return;
		}

		if (!workflowToDelete) return;
		try {
			setDeleteState("deleting");
			const deletedName = workflowToDelete.name;
			await deleteWorkflow(workflowToDelete.id);
			setDeleteState("success");

			setTimeout(() => {
				void setDeleteId(null);
				toast.success(`Deleted "${deletedName}"`);
				if (isOnDetailPage) {
					setTimeout(() => {
						router.push("/automation");
					}, 100);
				}
				setTimeout(() => {
					setDeleteState("idle");
					setConfirmationText("");
					targetWorkflowRef.current = null;
				}, 300);
			}, 300);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete automation",
			);
			setDeleteState("idle");
		}
	};

	useHotkeys(
		["enter", "mod+enter"],
		(e) => {
			e.preventDefault();
			if (canDelete) {
				void handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	useHotkeys(
		"escape",
		() => {
			if (deleteState === "idle") {
				void setDeleteId(null);
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	const deleteStateRef = useRef(deleteState);
	useEffect(() => {
		deleteStateRef.current = deleteState;
	}, [deleteState]);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					if (deleteStateRef.current === "success") {
						onClearSelection?.();
					}
					void setDeleteId(null);
					setTimeout(() => {
						setDeleteState("idle");
						setConfirmationText("");
						targetWorkflowRef.current = null;
						targetBulkWorkflowsRef.current = [];
					}, 300);
				}
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => {
						inputRef.current?.focus();
					}, 0);
				}}
			>
				<div>
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						{isBulk
							? `Delete ${bulkWorkflowsToDelete.length || "selected"} automations`
							: "Delete automation"}
					</Modal.Title>
					<Modal.Description className="text-sm text-text-sub-600 leading-relaxed">
						{isBulk
							? `Are you sure you want to delete ${bulkWorkflowsToDelete.length > 1 ? `these ${bulkWorkflowsToDelete.length} automations` : "this automation"}? This action cannot be undone.`
							: "Are you sure you want to delete this automation? This action cannot be undone."}
					</Modal.Description>
				</div>

				<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-xs leading-relaxed dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
					<span className="font-bold text-red-800 dark:text-red-200">
						Warning:
					</span>{" "}
					Deleting this automation permanently removes all configured triggers,
					steps, and conditions.
				</div>

				{isBulk ? (
					<div className="mt-5 space-y-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<p className="font-normal text-text-sub-600 text-xs">
							Selected automations ({bulkWorkflowsToDelete.length})
						</p>
						<div className="flex flex-wrap gap-1.5 pt-1">
							{bulkWorkflowsToDelete.slice(0, 4).map((wf) => (
								<span
									key={wf.id}
									className="inline-flex items-center rounded-md bg-bg-white-0 px-2 py-1 font-medium text-text-strong-950 text-xs shadow-2xs dark:bg-bg-weak-50/40"
								>
									{wf.name}
								</span>
							))}
							{bulkWorkflowsToDelete.length > 4 ? (
								<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-bg-weak-50/30">
									+{bulkWorkflowsToDelete.length - 4} more
								</span>
							) : null}
						</div>
					</div>
				) : (
					<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
						<div>
							<p className="font-normal text-text-sub-600 text-xs">
								Automation name
							</p>
							<div className="mt-1 flex items-center">
								<span className="font-medium text-sm text-text-strong-950">
									{workflowToDelete?.name || "—"}
								</span>
							</div>
						</div>
					</div>
				)}

				<div className="mt-4 space-y-2">
					<Label.Root
						htmlFor="delete-workflow-confirmation"
						className="flex flex-wrap items-center gap-1.5"
					>
						<span>Type</span>
						<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-bg-weak-50/20">
							{displayName}
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									void handleCopyName();
								}}
								className="-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors"
								aria-label={`Copy ${displayName}`}
								title="Copy name"
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={nameCopied ? "check" : "copy"}
										initial={{ opacity: 0, scale: 0.6 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.6 }}
										transition={{ type: "spring", duration: 0.2, bounce: 0.3 }}
										className="flex items-center justify-center"
									>
										<Icon
											name={nameCopied ? "check" : "copy"}
											className={cn(
												"h-3 w-3",
												nameCopied ? "text-green-500" : "text-text-sub-600",
											)}
										/>
									</motion.span>
								</AnimatePresence>
							</button>
						</span>
						<span>to confirm</span>
					</Label.Root>
					<Input.Root size="medium">
						<Input.Wrapper>
							<Input.Input
								ref={inputRef}
								id="delete-workflow-confirmation"
								value={confirmationText}
								onChange={(e) => setConfirmationText(e.target.value)}
								placeholder={displayName}
								disabled={deleteState !== "idle"}
								autoComplete="off"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => {
							if (deleteState === "idle") {
								void setDeleteId(null);
								setDeleteState("idle");
								setConfirmationText("");
							}
						}}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="destructive"
						size="small"
						disabled={!canDelete}
						onClick={() => void handleDelete()}
						className={cn(
							"relative min-w-[134px] select-none justify-center overflow-hidden transition-all duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={deleteState}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{
									opacity: 0,
									y: -14,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: 14,
								}}
								className="relative z-10 flex items-center justify-center gap-1.5"
							>
								{deleteState === "deleting" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Deleting...</span>
									</>
								) : deleteState === "success" ? (
									<>
										<Icon
											name="check"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Deleted</span>
									</>
								) : (
									<>
										{isBulk
											? `Delete ${bulkWorkflowsToDelete.length || ""} automation${bulkWorkflowsToDelete.length === 1 ? "" : "s"}`
											: "Delete automation"}
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
