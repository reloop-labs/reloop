"use client";

import { FieldError, useFieldError } from "@reloop/ui/field-error";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import { enrollContact } from "../hooks/use-automations-api";
import {
	AutomationModalFrame,
	type AutomationModalStatus,
} from "./automation-modal-frame";

interface EnrollContactModalProps {
	automationId: string;
	triggerEvent: string | null | undefined;
	canEnroll?: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The run started: the parent shows it on the Runs tab. */
	onEnrolled?: (enrollmentId: string) => void;
}

export const EnrollContactModal = ({
	automationId,
	triggerEvent,
	canEnroll = true,
	open,
	onOpenChange,
	onEnrolled,
}: EnrollContactModalProps) => {
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [status, setStatus] = useState<AutomationModalStatus>("idle");
	const emailField = useFieldError();
	const clearEmailError = emailField.clear;

	const enrollMutation = useMutation({
		mutationFn: () =>
			enrollContact(automationId, {
				email: email.trim(),
				firstName: firstName.trim() || undefined,
				lastName: lastName.trim() || undefined,
			}),
	});

	const handleClose = () => {
		if (status !== "idle") return;
		onOpenChange(false);
	};

	const handleSubmit = async () => {
		if (status !== "idle") return;
		if (!canEnroll) {
			emailField.show("Activate the automation before enrolling contacts.");
			return;
		}
		const trimmed = email.trim();
		if (!trimmed.includes("@")) {
			emailField.show("Enter a valid email address.");
			return;
		}

		emailField.clear();
		setStatus("busy");
		try {
			const result = await enrollMutation.mutateAsync();
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [...queryKeys.workflows.all, "runs", automationId],
				}),
				queryClient.invalidateQueries({
					queryKey: [...queryKeys.workflows.all, "metrics", automationId],
				}),
			]);
			setStatus("success");
			toast.success(
				result.contactCreated
					? "Contact created and enrolled"
					: "Contact enrolled",
			);
			// Let "Enrolled" show for a moment, then close on the new run.
			setTimeout(() => {
				setStatus("idle");
				onOpenChange(false);
				onEnrolled?.(result.enrollment.id);
			}, 450);
		} catch (err) {
			setStatus("idle");
			const message = err instanceof Error ? err.message : "Failed to enroll";
			emailField.show(message);
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
		[open, status, email, firstName, lastName],
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
				setEmail("");
				setFirstName("");
				setLastName("");
				clearEmailError();
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearEmailError]);

	return (
		<AutomationModalFrame
			open={open}
			title="Test automation"
			icon="contacts"
			status={status}
			onSubmit={() => void handleSubmit()}
			onClose={handleClose}
			submitLabel="Enroll"
			busyLabel="Enrolling..."
			successLabel="Enrolled"
			submitDisabled={!canEnroll}
			contentClassName="sm:max-w-[480px]"
		>
			<div className="space-y-5 px-6 pb-6">
				{!canEnroll ? (
					<p className="rounded-xl border border-warning-base/20 bg-warning-lighter/60 px-3 py-2 text-warning-base text-xs leading-relaxed">
						Activate this automation to enroll contacts.
					</p>
				) : null}
				<p className="text-text-sub-600 text-xs leading-relaxed">
					{triggerEvent ? (
						<>
							Start this automation now. Track{" "}
							<code className="rounded-md bg-bg-weak-50 px-1 py-0.5 font-mono text-[11px] text-text-strong-950">
								{triggerEvent}
							</code>{" "}
							from your product to enroll automatically.
						</>
					) : (
						<>
							Start this automation now. Choose a trigger event first so
							enrollments know where to begin.
						</>
					)}
				</p>

				<div className="space-y-1.5">
					<Label.Root
						htmlFor="enroll-email"
						className="font-medium text-text-strong-950 text-xs"
					>
						Email
						<Label.Asterisk />
					</Label.Root>
					<FieldError field={emailField}>
						<Input.Root size="medium" hasError={emailField.hasError}>
							<Input.Wrapper>
								<Input.Input
									id="enroll-email"
									type="email"
									{...emailField.controlProps}
									placeholder="ada@example.com"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (emailField.hasError) emailField.clear();
									}}
									autoComplete="off"
									autoFocus
									disabled={status !== "idle"}
								/>
							</Input.Wrapper>
						</Input.Root>
					</FieldError>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label.Root
							htmlFor="enroll-first"
							className="font-medium text-text-strong-950 text-xs"
						>
							First name
							<Label.Sub className="ml-1 text-xs">(optional)</Label.Sub>
						</Label.Root>
						<Input.Root size="medium">
							<Input.Wrapper>
								<Input.Input
									id="enroll-first"
									placeholder="Ada"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									disabled={status !== "idle"}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					<div className="space-y-1.5">
						<Label.Root
							htmlFor="enroll-last"
							className="font-medium text-text-strong-950 text-xs"
						>
							Last name
							<Label.Sub className="ml-1 text-xs">(optional)</Label.Sub>
						</Label.Root>
						<Input.Root size="medium">
							<Input.Wrapper>
								<Input.Input
									id="enroll-last"
									placeholder="Lovelace"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									disabled={status !== "idle"}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
			</div>
		</AutomationModalFrame>
	);
};
