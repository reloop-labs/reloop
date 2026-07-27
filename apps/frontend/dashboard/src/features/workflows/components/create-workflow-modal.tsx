"use client";

import { useRouter } from "next/navigation";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Textarea from "@reloop/ui/textarea";

import { useState } from "react";
import { useWorkflows } from "./workflows-provider";

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

	const handleClose = () => {
		onOpenChange(false);
		setName("");
		setDescription("");
	};

	const handleCreate = () => {
		const trimmed = name.trim();
		if (!trimmed) return;

		const workflow = createWorkflow({
			name: trimmed,
			description: description.trim() || undefined,
		});
		handleClose();
		router.push(`/workflows/${workflow.id}`);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Create workflow</Modal.Title>
					<Modal.Description>
						Name your automation. You will configure triggers and steps on the
						canvas next.
					</Modal.Description>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-4">
					<div className="space-y-1.5">
						<Label.Root htmlFor="workflow-name">Name</Label.Root>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									id="workflow-name"
									placeholder="e.g. Welcome on delivery"
									value={name}
									onChange={(e) => setName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreate();
									}}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					<div className="space-y-1.5">
						<Label.Root htmlFor="workflow-description">
							Description{" "}
							<span className="font-normal text-text-sub-600">(optional)</span>
						</Label.Root>
						<Textarea.Root
							id="workflow-description"
							placeholder="What does this workflow do?"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex items-center justify-end gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={handleClose}
					>
						Cancel
					</Button.Root>
					<Button.Root
						variant="neutral"
						size="small"
						onClick={handleCreate}
						disabled={!name.trim()}
					>
						Create & open editor
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
