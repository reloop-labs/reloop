import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";

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
	onConfirm: (role: AssignableRole) => Promise<boolean | void> | void;
	isUpdating: boolean;
	memberName: string;
	memberEmail: string;
	currentRole: string;
}

export const ChangeRoleModal = ({
	open,
	onOpenChange,
	onConfirm,
	isUpdating: isUpdatingProp,
	memberName,
	memberEmail,
	currentRole,
}: ChangeRoleModalProps) => {
	const initialRole: AssignableRole =
		currentRole.toLowerCase() === "admin" ? "admin" : "member";
	const [selectedRole, setSelectedRole] = useState<AssignableRole>(initialRole);

	useEffect(() => {
		if (open) {
			setSelectedRole(
				currentRole.toLowerCase() === "admin" ? "admin" : "member",
			);
		}
	}, [open, currentRole]);

	const displayName = memberName || memberEmail.split("@")[0] || memberEmail;
	const hasChanges = selectedRole !== initialRole;

	const [status, setStatus] = useState<"idle" | "updating" | "success">("idle");
	const isUpdating = isUpdatingProp || status === "updating";

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen && status !== "idle") return;
		onOpenChange(isOpen);
	};

	const handleSave = async () => {
		if (!hasChanges || status !== "idle") return;
		setStatus("updating");
		try {
			const res = await onConfirm(selectedRole);
			if (res !== false) {
				setStatus("success");
				setTimeout(() => {
					onOpenChange(false);
					setStatus("idle");
				}, 1500);
			} else {
				setStatus("idle");
			}
		} catch {
			setStatus("idle");
		}
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
						{hasChanges ? `Will update to ${selectedRole}` : "No changes yet"}
					</p>
					<div className="flex items-center gap-2">
						<FancyButton.Root
							type="button"
							variant="basic"
							size="xsmall"
							onClick={() => handleOpenChange(false)}
							disabled={status !== "idle"}
						>
							Cancel
							<KbdEsc />
						</FancyButton.Root>
						<FancyButton.Root
							type="button"
							variant={status === "success" ? "success" : "blue"}
							size="xsmall"
							className={cn(
								"min-w-[140px] justify-center overflow-hidden font-medium transition-all duration-200",
								status === "updating" && "opacity-90",
							)}
							onClick={handleSave}
							disabled={status !== "idle" || !hasChanges}
						>
							<AnimatePresence mode="popLayout" initial={false}>
								<motion.span
									key={status}
									transition={{
										type: "spring",
										duration: 0.25,
										bounce: 0,
									}}
									initial={{ opacity: 0, y: -14 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 14 }}
									className="flex items-center justify-center gap-1.5 font-medium"
								>
									{status === "updating" ? (
										<>
											<Spinner size={12} color="currentColor" />
											<span>Updating...</span>
										</>
									) : status === "success" ? (
										<>
											<Icon name="check-circle" className="h-4 w-4" />
											<span>Updated!</span>
										</>
									) : (
										<>
											<FancyButton.Icon as={Icon} name="user-role" />
											<span>Update role</span>
											<span className="inline-flex items-center gap-0.5 opacity-90">
												<KbdCommand />
												<KbdEnter />
											</span>
										</>
									)}
								</motion.span>
							</AnimatePresence>
						</FancyButton.Root>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
