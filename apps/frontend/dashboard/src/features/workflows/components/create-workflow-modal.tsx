"use client";

import { FieldError, useFieldError } from "@reloop/ui/field-error";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Textarea from "@reloop/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import type { WorkflowReentry } from "../workflow-types";
import {
	AutomationModalFrame,
	type AutomationModalStatus,
} from "./automation-modal-frame";
import { ReentrySetting } from "./reentry-setting";
import { useWorkflows } from "./workflows-provider";

const EMPTY_NAME_ERROR = "Please enter an automation name.";

interface CreateWorkflowModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const CreateWorkflowModal = ({
	open,
	onOpenChange,
}: CreateWorkflowModalProps) => {
	const router = useRouter();
	const { createWorkflow } = useWorkflows();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [reentry, setReentry] = useState<WorkflowReentry>("once");
	const [status, setStatus] = useState<AutomationModalStatus>("idle");
	const nameField = useFieldError();
	const clearNameError = nameField.clear;

	const handleClose = () => {
		if (status !== "idle") return;
		onOpenChange(false);
	};

	const handleSubmit = async () => {
		if (status !== "idle") return;
		const trimmed = name.trim();
		if (!trimmed) {
			nameField.show(EMPTY_NAME_ERROR);
			return;
		}

		nameField.clear();
		setStatus("busy");
		try {
			const workflow = await createWorkflow({
				name: trimmed,
				description: description.trim() || undefined,
				reentry,
			});
			setStatus("success");
			setTimeout(() => {
				onOpenChange(false);
				setName("");
				setDescription("");
				setReentry("once");
				nameField.clear();
				setStatus("idle");
				router.push(`/automation/${workflow.id}`);
			}, 450);
		} catch (err) {
			setStatus("idle");
			const message =
				err instanceof Error ? err.message : "Failed to create automation";
			nameField.show(message);
			toast.error(message);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			// Enter on a switch row toggles it instead of submitting.
			if ((e.target as HTMLElement | null)?.closest('[role="switch"]')) return;
			e.preventDefault();
			if (open && status === "idle") void handleSubmit();
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status, name, description, reentry],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && status === "idle") handleClose();
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: open },
		[open, status],
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setName("");
				setDescription("");
				setReentry("once");
				clearNameError();
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearNameError]);

	return (
		<AutomationModalFrame
			open={open}
			title="Create automation"
			icon="workflow"
			status={status}
			onSubmit={() => void handleSubmit()}
			onClose={handleClose}
			submitLabel="Create automation"
			busyLabel="Creating..."
			successLabel="Created"
		>
			<div className="space-y-4 px-6 pb-7">
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="automation-name"
						className="font-medium text-text-strong-950 text-xs"
					>
						Name
						<Label.Asterisk />
					</Label.Root>
					<FieldError
						field={nameField}
						hint="Used internally to find this automation in your list."
					>
						<Input.Root size="medium" hasError={nameField.hasError}>
							<Input.Wrapper>
								<Input.Input
									id="automation-name"
									{...nameField.controlProps}
									placeholder="e.g. Welcome sequence"
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										if (nameField.hasError) nameField.clear();
									}}
									autoFocus
									disabled={status !== "idle"}
								/>
							</Input.Wrapper>
						</Input.Root>
					</FieldError>
				</div>
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="automation-description"
						className="font-medium text-text-strong-950 text-xs"
					>
						Description
						<Label.Sub className="ml-1 text-xs">(optional)</Label.Sub>
					</Label.Root>
					<Textarea.Root
						id="automation-description"
						simple
						placeholder="What does this automation do?"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						disabled={status !== "idle"}
						className="min-h-[76px] resize-none text-text-strong-950 text-xs"
					/>
				</div>
				<div className="rounded-2xl border border-stroke-soft-200 p-1 dark:border-stroke-soft-100/50">
					<ReentrySetting
						value={reentry}
						onChange={setReentry}
						disabled={status !== "idle"}
					/>
				</div>
			</div>
		</AutomationModalFrame>
	);
};
