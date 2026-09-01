"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import { formatRelativeTime } from "#/utils/format-relative-time";
import {
	type AutomationEnrollment,
	enrollContact,
	listEnrollments,
} from "../hooks/use-automations-api";

interface EnrollContactModalProps {
	automationId: string;
	triggerEvent: string | null | undefined;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const statusClass: Record<AutomationEnrollment["status"], string> = {
	active: "border-success-base bg-success-light/20 text-success-base",
	completed: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	cancelled: "border-warning-base bg-warning-light/20 text-warning-base",
	failed: "border-error-base bg-error-light/20 text-error-base",
};

export const EnrollContactModal = ({
	automationId,
	triggerEvent,
	open,
	onOpenChange,
}: EnrollContactModalProps) => {
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

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
		onSuccess: (result) => {
			toast.success(
				result.contactCreated
					? "Contact created and enrolled"
					: "Contact enrolled",
			);
			setEmail("");
			setFirstName("");
			setLastName("");
			void queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.enrollments(automationId),
			});
		},
		onError: (e) => {
			toast.error(e instanceof Error ? e.message : "Failed to enroll");
		},
	});

	const handleClose = (next: boolean) => {
		if (!next) {
			setEmail("");
			setFirstName("");
			setLastName("");
		}
		onOpenChange(next);
	};

	const enrollments = enrollmentsQuery.data?.enrollments ?? [];
	const canSubmit = email.trim().includes("@") && !enrollMutation.isPending;

	return (
		<Modal.Root open={open} onOpenChange={handleClose}>
			<Modal.Content className="max-w-lg">
				<Modal.Header>
					<Modal.Title>Enroll a contact</Modal.Title>
					<Modal.Description>
						Start this drip for someone now. Your product can do the same by
						tracking{" "}
						<code className="font-mono text-text-strong-950">
							{triggerEvent || "the trigger event"}
						</code>{" "}
						with their email.
					</Modal.Description>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-5">
					<form
						className="flex flex-col gap-3"
						onSubmit={(e) => {
							e.preventDefault();
							if (canSubmit) enrollMutation.mutate();
						}}
					>
						<div className="space-y-1.5">
							<Label.Root htmlFor="enroll-email">Email</Label.Root>
							<Input.Root>
								<Input.Wrapper>
									<Input.Input
										id="enroll-email"
										type="email"
										placeholder="ada@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										autoComplete="off"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label.Root htmlFor="enroll-first">
									First name{" "}
									<span className="font-normal text-text-sub-600">
										(optional)
									</span>
								</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											id="enroll-first"
											placeholder="Ada"
											value={firstName}
											onChange={(e) => setFirstName(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="space-y-1.5">
								<Label.Root htmlFor="enroll-last">
									Last name{" "}
									<span className="font-normal text-text-sub-600">
										(optional)
									</span>
								</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											id="enroll-last"
											placeholder="Lovelace"
											value={lastName}
											onChange={(e) => setLastName(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>
						<div className="flex justify-end">
							<Button.Root
								type="submit"
								variant="neutral"
								size="small"
								disabled={!canSubmit}
							>
								{enrollMutation.isPending ? "Enrolling…" : "Enroll"}
							</Button.Root>
						</div>
					</form>

					<div>
						<p className="mb-2 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							Recent enrollments
							{typeof enrollmentsQuery.data?.total === "number"
								? ` · ${enrollmentsQuery.data.total}`
								: ""}
						</p>
						{enrollmentsQuery.isLoading ? (
							<div className="h-16 animate-pulse rounded-lg bg-bg-weak-50" />
						) : enrollments.length === 0 ? (
							<p className="text-sm text-text-soft-400">
								No one is in this workflow yet.
							</p>
						) : (
							<ul className="max-h-56 space-y-1 overflow-y-auto">
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
										<span
											className={cn(
												"shrink-0 rounded-full border px-2 py-0.5 font-medium text-[11px] capitalize",
												statusClass[row.status],
											)}
										>
											{row.status}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer className="flex justify-end">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => handleClose(false)}
					>
						Close
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
