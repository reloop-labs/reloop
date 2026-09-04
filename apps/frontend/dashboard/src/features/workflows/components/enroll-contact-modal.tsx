"use client";

import { FieldError, useFieldError } from "@reloop/ui/field-error";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as StatusBadge from "@reloop/ui/status-badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import { formatRelativeTime } from "#/utils/format-relative-time";
import {
	type AutomationEnrollment,
	enrollContact,
	listEnrollments,
} from "../hooks/use-automations-api";
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
}

const enrollmentBadge: Record<
	AutomationEnrollment["status"],
	"completed" | "pending" | "failed" | "disabled"
> = {
	active: "pending",
	completed: "completed",
	cancelled: "disabled",
	failed: "failed",
};

export const EnrollContactModal = ({
	automationId,
	triggerEvent,
	canEnroll = true,
	open,
	onOpenChange,
}: EnrollContactModalProps) => {
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [status, setStatus] = useState<AutomationModalStatus>("idle");
	const emailField = useFieldError();
	const clearEmailError = emailField.clear;

	const enrollmentsQuery = useQuery({
		queryKey: queryKeys.workflows.enrollments(automationId),
		queryFn: () => listEnrollments(automationId, 20),
		enabled: open,
	});

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
			await queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.enrollments(automationId),
			});
			setStatus("success");
			toast.success(
				result.contactCreated
					? "Contact created and enrolled"
					: "Contact enrolled",
			);
			setTimeout(() => {
				setEmail("");
				setFirstName("");
				setLastName("");
				setStatus("idle");
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

	const enrollments = enrollmentsQuery.data?.enrollments ?? [];

	return (
		<AutomationModalFrame
			open={open}
			title="Enroll a contact"
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

				<div>
					<p className="mb-2 font-medium text-[11px] text-text-sub-600 uppercase tracking-wide">
						Recent enrollments
						{typeof enrollmentsQuery.data?.total === "number"
							? ` · ${enrollmentsQuery.data.total}`
							: ""}
					</p>
					{enrollmentsQuery.isLoading ? (
						<div className="h-16 animate-pulse rounded-xl bg-bg-weak-50" />
					) : enrollments.length === 0 ? (
						<p className="text-sm text-text-soft-400">
							No one is in this automation yet.
						</p>
					) : (
						<ul className="max-h-48 space-y-0.5 overflow-y-auto">
							{enrollments.map((row) => (
								<li
									key={row.id}
									className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
								>
									<div className="min-w-0">
										<p className="truncate text-sm text-text-strong-950">
											{row.contactEmail ?? row.contactId}
										</p>
										<p className="text-text-sub-600 text-xs">
											{formatRelativeTime(row.enrolledAt)}
										</p>
									</div>
									<StatusBadge.Root
										variant="light"
										status={enrollmentBadge[row.status]}
										className="capitalize"
									>
										<StatusBadge.Dot />
										{row.status}
									</StatusBadge.Root>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</AutomationModalFrame>
	);
};
