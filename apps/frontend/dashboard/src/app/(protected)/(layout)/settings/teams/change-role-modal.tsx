"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";

export type AssignableRole = "admin" | "member";

const ROLE_OPTIONS: {
	value: AssignableRole;
	label: string;
	description: string;
	dotColor: string;
}[] = [
	{
		value: "admin",
		label: "Admin",
		description: "Invite users, manage billing, and update the workspace.",
		dotColor: "bg-feature-base",
	},
	{
		value: "member",
		label: "Member",
		description: "Manage emails, domains, and webhooks.",
		dotColor: "bg-neutral-600",
	},
];

const getRoleCardStyles = (role: AssignableRole, selected: boolean) => {
	if (!selected) {
		return {
			card: "border-stroke-soft-100 bg-bg-white-0 hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/50",
			label: "text-text-strong-950",
			desc: "text-text-sub-600",
			check: "",
		};
	}
	if (role === "admin") {
		return {
			card: "border-feature-base bg-feature-lighter/40 ring-1 ring-feature-base",
			label: "text-feature-base",
			desc: "text-feature-base/70",
			check: "bg-feature-base",
		};
	}
	return {
		card: "border-stroke-base bg-bg-weak-50 ring-1 ring-stroke-base",
		label: "text-text-strong-950",
		desc: "text-text-sub-600",
		check: "bg-neutral-600",
	};
};

interface ChangeRoleModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (role: AssignableRole) => void;
	isUpdating: boolean;
	memberName: string;
	memberEmail: string;
	currentRole: string;
}

export const ChangeRoleModal = ({
	open,
	onOpenChange,
	onConfirm,
	isUpdating,
	memberName,
	memberEmail,
	currentRole,
}: ChangeRoleModalProps) => {
	const initialRole: AssignableRole =
		currentRole.toLowerCase() === "admin" ? "admin" : "member";
	const [selectedRole, setSelectedRole] =
		useState<AssignableRole>(initialRole);

	useEffect(() => {
		if (open) {
			setSelectedRole(
				currentRole.toLowerCase() === "admin" ? "admin" : "member",
			);
		}
	}, [open, currentRole]);

	const displayName = memberName || memberEmail;
	const hasChanges = selectedRole !== initialRole;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[420px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<div className="space-y-4 p-5">
					<div>
						<Modal.Title className="text-label-md text-text-strong-950">
							Change role
						</Modal.Title>
						<p className="mt-1 text-paragraph-sm text-text-sub-600">
							Update access for{" "}
							<span className="font-medium text-text-strong-950">
								{displayName}
							</span>
							.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-2">
						{ROLE_OPTIONS.map(({ value, label, description, dotColor }) => {
							const isSelected = selectedRole === value;
							const styles = getRoleCardStyles(value, isSelected);
							return (
								<button
									key={value}
									type="button"
									disabled={isUpdating}
									onClick={() => setSelectedRole(value)}
									className={cn(
										"relative flex flex-col items-start gap-0.5 rounded-xl border px-3 pt-1.5 pb-2 text-left transition-all active:scale-[0.98]",
										styles.card,
										isUpdating && "cursor-not-allowed opacity-60",
									)}
								>
									<div className="flex w-full items-center justify-between">
										<div className="flex items-center gap-1.5">
											<span
												className={cn(
													"h-2 w-2 flex-shrink-0 rounded-full",
													dotColor,
												)}
											/>
											<span
												className={cn(
													"font-medium text-label-xs",
													styles.label,
												)}
											>
												{label}
											</span>
										</div>
										{isSelected && (
											<span
												className={cn(
													"flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
													styles.check,
												)}
											>
												<Icon name="check" className="h-2.5 w-2.5 text-white" />
											</span>
										)}
									</div>
									<p
										className={cn(
											"text-balance font-medium text-[11px]",
											styles.desc,
										)}
									>
										{description}
									</p>
								</button>
							);
						})}
					</div>
				</div>

				<Modal.Footer className="flex items-center justify-end gap-3 border-stroke-soft-100/50">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => onOpenChange(false)}
						disabled={isUpdating}
					>
						Cancel
						<KbdEsc />
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						size="xsmall"
						onClick={() => onConfirm(selectedRole)}
						disabled={isUpdating || !hasChanges}
					>
						{isUpdating ? (
							<>
								<Spinner size={14} color="currentColor" />
								Updating...
							</>
						) : (
							"Save role"
						)}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
