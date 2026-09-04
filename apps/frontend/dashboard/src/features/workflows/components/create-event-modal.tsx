"use client";

import { FieldError, useFieldError } from "@reloop/ui/field-error";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import {
	type CustomEvent,
	createCustomEvent,
} from "../hooks/use-custom-events-api";
import {
	AutomationModalFrame,
	type AutomationModalStatus,
} from "./automation-modal-frame";

const EMPTY_NAME_ERROR = "Please enter an event name.";

interface CreateEventModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated?: (event: CustomEvent) => void;
}

export function CreateEventModal({
	open,
	onOpenChange,
	onCreated,
}: CreateEventModalProps) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [key, setKey] = useState("");
	const [propName, setPropName] = useState("");
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
			const created = await createCustomEvent({
				name: trimmed,
				key: key.trim() || undefined,
				properties: propName.trim()
					? [{ name: propName.trim(), propertyType: "string" }]
					: undefined,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.events(),
			});
			setStatus("success");
			setTimeout(() => {
				onCreated?.(created);
				onOpenChange(false);
				setName("");
				setKey("");
				setPropName("");
				nameField.clear();
				setStatus("idle");
			}, 450);
		} catch (err) {
			setStatus("idle");
			const message =
				err instanceof Error ? err.message : "Failed to create event";
			nameField.show(message);
			toast.error(message);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle") void handleSubmit();
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status, name, key, propName],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && status === "idle") handleClose();
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status],
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setName("");
				setKey("");
				setPropName("");
				clearNameError();
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearNameError]);

	return (
		<AutomationModalFrame
			open={open}
			title="Create trigger"
			icon="zap"
			status={status}
			onSubmit={() => void handleSubmit()}
			onClose={handleClose}
			submitLabel="Create trigger"
			busyLabel="Creating..."
			successLabel="Created"
		>
			<div className="space-y-4 px-6 pb-7">
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="evt-name"
						className="font-medium text-text-strong-950 text-xs"
					>
						Name
						<Label.Asterisk />
					</Label.Root>
					<FieldError
						field={nameField}
						hint="Shown on the trigger step. Use something you will recognize."
					>
						<Input.Root size="medium" hasError={nameField.hasError}>
							<Input.Wrapper>
								<Input.Input
									id="evt-name"
									{...nameField.controlProps}
									placeholder="e.g. User signed up"
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
						htmlFor="evt-key"
						className="font-medium text-text-strong-950 text-xs"
					>
						Key
						<Label.Sub className="ml-1 text-xs">(optional)</Label.Sub>
					</Label.Root>
					<Input.Root size="medium">
						<Input.Wrapper>
							<Input.Input
								id="evt-key"
								placeholder="user.signed_up"
								value={key}
								onChange={(e) => setKey(e.target.value)}
								disabled={status !== "idle"}
							/>
						</Input.Wrapper>
					</Input.Root>
					<p className="text-[11px] text-text-sub-600">
						Defaults from the name if you leave this blank.
					</p>
				</div>
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="evt-prop"
						className="font-medium text-text-strong-950 text-xs"
					>
						First property
						<Label.Sub className="ml-1 text-xs">(optional)</Label.Sub>
					</Label.Root>
					<Input.Root size="medium">
						<Input.Wrapper>
							<Input.Input
								id="evt-prop"
								placeholder="plan"
								value={propName}
								onChange={(e) => setPropName(e.target.value)}
								disabled={status !== "idle"}
							/>
						</Input.Wrapper>
					</Input.Root>
					<p className="text-[11px] text-text-sub-600">
						You can add more properties later.
					</p>
				</div>
			</div>
		</AutomationModalFrame>
	);
}
