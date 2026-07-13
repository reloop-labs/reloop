"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export type AssignableRole = "admin" | "member";

const ROLE_CONFIG: {
	value: AssignableRole;
	label: string;
	description: string;
	dotColor: string;
}[] = [
	{
		value: "admin",
		label: "Admin",
		description: "Invite users, update payment, and delete the team.",
		dotColor: "bg-feature-base",
	},
	{
		value: "member",
		label: "Member",
		description: "Manage emails, domains, and webhooks.",
		dotColor: "bg-neutral-600",
	},
];

const getRoleBadgeStyles = (role: AssignableRole) => {
	switch (role) {
		case "admin":
			return "border border-feature-light bg-feature-lighter text-feature-base";
		default:
			return "border border-neutral-alpha-10 bg-neutral-alpha-10 text-text-sub-600";
	}
};

const getRoleCardStyles = (role: AssignableRole) => {
	switch (role) {
		case "admin":
			return {
				card: "border-feature-base bg-feature-lighter/40 ring-1 ring-feature-base",
				label: "text-feature-base",
				desc: "text-feature-base/70",
				check: "bg-feature-base",
			};
		default:
			return {
				card: "border-stroke-base bg-bg-weak-50 ring-1 ring-stroke-base",
				label: "text-text-strong-950",
				desc: "text-text-sub-600",
				check: "bg-neutral-600",
			};
	}
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

	const displayName = memberName || memberEmail.split("@")[0] || memberEmail;
	const hasChanges = selectedRole !== initialRole;

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen && isUpdating) return;
		onOpenChange(isOpen);
	};

	const handleSave = () => {
		if (!hasChanges || isUpdating) return;
		onConfirm(selectedRole);
	};

	useHotkeys(
		"mod+enter",
		(event) => {
			event.preventDefault();
			event.stopPropagation();
			handleSave();
		},
		{
			enableOnFormTags: true,
			enabled: open && hasChanges && !isUpdating,
			preventDefault: true,
		},
		[open, hasChanges, isUpdating, selectedRole],
	);

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				{/* Header — matches invite modal */}
				<div className="flex items-start justify-between border-stroke-soft-100 border-b px-5 pt-5 pb-4 dark:border-stroke-soft-100/40">
					<div>
						<Modal.Title className="font-semibold text-label-md text-text-strong-950">
							Change role
						</Modal.Title>
						<Modal.Description className="-mt-0.5 text-paragraph-sm text-text-sub-600">
							Update this member&apos;s access level
						</Modal.Description>
					</div>
					<button
						type="button"
						onClick={() => handleOpenChange(false)}
						disabled={isUpdating}
						className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-all hover:bg-bg-weak-50 active:scale-[0.95] disabled:opacity-50"
					>
						<Icon name="cross" className="h-3.5 w-3.5" />
					</button>
				</div>

				<div className="space-y-2 px-5 pt-3 pb-3">
					{/* Member row — same card style as pending invites */}
					<div className="space-y-1.5">
						<span className="font-medium text-label-sm text-text-strong-950">
							Member
						</span>
						<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
							<div className="flex items-center gap-3 px-3 py-2">
								<div
									className={cn(
										"flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
										getAvatarGradient(memberEmail || "user"),
									)}
								>
									{getAvatarInitial(memberName || null, memberEmail)}
								</div>
								<div className="min-w-0 flex-1">
									<span className="block truncate font-medium text-paragraph-sm text-text-strong-950">
										{displayName}
									</span>
									{memberEmail && (
										<span className="block truncate text-[11px] text-text-sub-600">
											{memberEmail}
										</span>
									)}
								</div>
								{/* Current role chip (same badge style as invite row) */}
								<span
									className={cn(
										"inline-flex rounded-full border px-2 py-0.5 font-medium text-[10px] capitalize",
										getRoleBadgeStyles(initialRole),
									)}
								>
									{initialRole}
								</span>
							</div>
						</div>
					</div>

					{/* Role cards — identical to invite modal */}
					<p className="pt-3 font-medium text-label-sm text-text-strong-950">
						Select role
					</p>
					<div className="grid grid-cols-2 gap-2">
						{ROLE_CONFIG.map(({ value, label, description, dotColor }) => {
							const isSelected = selectedRole === value;
							const styles = getRoleCardStyles(value);
							return (
								<button
									key={value}
									type="button"
									disabled={isUpdating}
									onClick={() => setSelectedRole(value)}
									className={cn(
										"relative flex flex-col items-start gap-0.5 rounded-xl border px-3 pt-1.5 pb-2 text-left transition-all active:scale-[0.98]",
										isSelected
											? styles.card
											: "border-stroke-soft-100 bg-bg-white-0 hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/50",
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
													isSelected ? styles.label : "text-text-strong-950",
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
											isSelected ? styles.desc : "text-text-sub-600",
										)}
									>
										{description}
									</p>
								</button>
							);
						})}
					</div>
					<p className="ml-1 flex items-center gap-1.5 pt-2 text-[11px] text-text-sub-600">
						<Icon name="info-outline" className="h-3.5 w-3.5 flex-shrink-0" />
						Role changes take effect immediately
					</p>
				</div>

				{/* Footer — matches invite modal */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
					<p className="text-paragraph-xs text-text-sub-600">
						{hasChanges
							? `Will update to ${selectedRole}`
							: "No changes yet"}
					</p>
					<div className="flex items-center gap-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => handleOpenChange(false)}
							disabled={isUpdating}
						>
							Cancel
							<KbdEsc />
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							size="xsmall"
							onClick={handleSave}
							disabled={isUpdating || !hasChanges}
						>
							{isUpdating ? (
								<>
									<Spinner size={12} color="currentColor" />
									Updating...
								</>
							) : (
								<>
									<Icon name="user-role" className="-mr-1 h-3.5 w-3.5" />
									Update role
									<span className="inline-flex items-center gap-0.5">
										<KbdCommand />
										<KbdEnter />
									</span>
								</>
							)}
						</Button.Root>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
