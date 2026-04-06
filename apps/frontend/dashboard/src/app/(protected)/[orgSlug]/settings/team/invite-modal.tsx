"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

type Role = "member" | "admin";

interface PendingEmail {
	email: string;
	role: Role;
}

interface InviteModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ROLE_CONFIG: {
	value: Role;
	label: string;
	description: string;
	dotColor: string;
}[] = [
	{
		value: "member",
		label: "Member",
		description: "Can create, view & delete own content",
		dotColor: "bg-neutral-600",
	},
	{
		value: "admin",
		label: "Admin",
		description: "Can manage members and settings and everything",
		dotColor: "bg-feature-base",
	},
];

const getRoleBadgeStyles = (role: Role) => {
	switch (role) {
		case "admin":
			return "border border-feature-light bg-feature-lighter text-feature-base";
		default:
			return "border border-neutral-alpha-10 bg-neutral-alpha-10 text-text-sub-600";
	}
};

const getRoleCardStyles = (role: Role) => {
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

const isValidEmail = (email: string) =>
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const InviteModal = ({ open, onOpenChange }: InviteModalProps) => {
	const [loading, setLoading] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [inputFocused, setInputFocused] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>([]);
	const [selectedRole, setSelectedRole] = useState<Role>("member");
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutate } = useSWRConfig();
	const { data: session } = authClient.useSession();

	// Fetch existing members & invites to prevent duplicates
	const { data: membersData } = useSWR(
		session?.user.activeOrganizationId
			? `organization-member-${session.user.activeOrganizationId}`
			: null,
		async () => {
			const result = await authClient.organization.listMembers({
				query: { organizationId: session?.user.activeOrganizationId ?? "" },
			});
			return result.data ?? { members: [] };
		},
	);

	const { data: invitesData } = useSWR(
		session?.user.activeOrganizationId
			? `invitations-${session.user.activeOrganizationId}`
			: null,
		async () => {
			const result = await authClient.organization.listInvitations({
				query: { organizationId: session?.user.activeOrganizationId ?? "" },
			});
			return result.data ?? [];
		},
	);

	const existingEmails = new Set([
		...(membersData?.members?.map((m: { user: { email: string } }) =>
			m.user.email.toLowerCase(),
		) ?? []),
		...(invitesData
			?.filter((i: { status: string }) => i.status.toLowerCase() === "pending")
			.map((i: { email: string }) => i.email.toLowerCase()) ?? []),
	]);

	const handleAddEmail = () => {
		const trimmed = inputValue.trim().toLowerCase();
		setEmailError(null);

		if (!trimmed) return;

		if (!isValidEmail(trimmed)) {
			setEmailError("Please enter a valid email address");
			return;
		}
		if (pendingEmails.some((e) => e.email === trimmed)) {
			setEmailError("This email is already in the list");
			return;
		}
		if (existingEmails.has(trimmed)) {
			setEmailError("This user is already a member or has a pending invite");
			return;
		}

		setPendingEmails((prev) => [...prev, { email: trimmed, role: "member" }]);
		setInputValue("");
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			handleAddEmail();
		}
	};

	const handleRemovePending = (email: string) => {
		setPendingEmails((prev) => prev.filter((e) => e.email !== email));
	};

	const handleRoleChange = (email: string, role: Role) => {
		setPendingEmails((prev) =>
			prev.map((e) => (e.email === email ? { ...e, role } : e)),
		);
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setPendingEmails([]);
			setInputValue("");
			setEmailError(null);
			setSelectedRole("member");
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async () => {
		if (pendingEmails.length === 0) {
			toast.error("Please add at least one email address");
			return;
		}
		if (!session?.user.activeOrganizationId) return;

		setLoading(true);
		try {
			const results = await Promise.allSettled(
				pendingEmails.map(({ email, role }) =>
					authClient.organization.inviteMember({
						email,
						role,
						organizationId: session.user.activeOrganizationId ?? undefined,
					}),
				),
			);

			const successCount = results.filter(
				(r) => r.status === "fulfilled",
			).length;
			const failCount = results.filter((r) => r.status === "rejected").length;

			if (successCount > 0) {
				toast.success(
					`${successCount} invitation${successCount > 1 ? "s" : ""} sent successfully!`,
				);
				mutate(
					(key) => typeof key === "string" && key.startsWith("invitations-"),
				);
				handleOpenChange(false);
			}
			if (failCount > 0) {
				toast.error(
					`${failCount} invitation${failCount > 1 ? "s" : ""} failed`,
				);
			}
		} catch {
			toast.error("Failed to invite team members");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				{/* Header */}
				<div className="flex items-start justify-between border-stroke-soft-100 border-b px-5 pt-5 pb-4 dark:border-stroke-soft-100/40">
					<div>
						<h2 className="font-semibold text-label-md text-text-strong-950">
							Invite team members
						</h2>
						<p className="-mt-0.5 text-paragraph-sm text-text-sub-600">
							Invitations will be sent via email
						</p>
					</div>
					<button
						type="button"
						onClick={() => handleOpenChange(false)}
						className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50"
					>
						<Icon name="cross" className="h-3.5 w-3.5" />
					</button>
				</div>

				<div className="space-y-2 px-5 pt-3 pb-3">
					{/* Email Input */}
					<div className="space-y-1.5">
						<div className="flex items-center gap-2">
							<span className="font-medium text-label-sm text-text-strong-950">
								Email addresses
							</span>
						</div>
						<div className="flex gap-2">
							<Input.Root
								size="xsmall"
								className="flex-1"
								hasError={!!emailError}
							>
								<Input.Wrapper>
									<Input.Input
										ref={inputRef}
										type="email"
										placeholder="name@company.com"
										value={inputValue}
										onChange={(e) => {
											setInputValue(e.target.value);
											setEmailError(null);
										}}
										onKeyDown={handleKeyDown}
										onFocus={() => setInputFocused(true)}
										disabled={loading}
									/>
									{inputFocused && inputValue.trim() && (
										<div className="flex items-center gap-1 rounded-md border border-stroke-sub-300 bg-bg-white-0 px-1 py-[1px] text-[10px] text-text-sub-600">
											<span>⏎</span>
											<span>Enter</span>
										</div>
									)}
								</Input.Wrapper>
							</Input.Root>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								className="rounded-[10px]"
								onClick={handleAddEmail}
								disabled={loading || !inputValue.trim()}
							>
								<Icon name="plus" className="-mr-1 h-3.5 w-3.5" />
								Add
							</Button.Root>
						</div>
						{emailError && (
							<p className="text-error-base text-paragraph-xs">{emailError}</p>
						)}
					</div>
					{pendingEmails.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<span className="font-medium text-label-sm text-text-strong-950">
									Pending invites
								</span>
								<span className="flex h-4 min-w-[20px] items-center justify-center rounded-full border border-stroke-soft-100 bg-neutral-alpha-10 px-1.5 font-medium text-[11px] text-text-sub-600 dark:border-stroke-soft-100/40">
									{pendingEmails.length}
								</span>
							</div>
							<div className="divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
								{pendingEmails.map(({ email, role }) => (
									<div
										key={email}
										className="flex items-center gap-3 px-3 py-2.5"
									>
										{/* Avatar */}
										<div
											className={cn(
												"flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
												getAvatarGradient(email),
											)}
										>
											{getAvatarInitial(null, email)}
										</div>

										{/* Email */}
										<span className="flex-1 truncate font-medium text-paragraph-sm text-text-strong-950">
											{email}
										</span>

										{/* Role badge toggle */}
										<div className="flex items-center gap-1.5">
											{(["member", "admin"] as Role[]).map((r) => (
												<button
													key={r}
													type="button"
													onClick={() => handleRoleChange(email, r)}
													className={cn(
														"inline-flex rounded-full border px-2.5 py-0.5 font-medium text-[11px] capitalize transition-colors",
														role === r
															? getRoleBadgeStyles(r)
															: "border-transparent text-text-soft-400 hover:text-text-sub-600",
													)}
												>
													{r.charAt(0).toUpperCase() + r.slice(1)}
												</button>
											))}
										</div>

										{/* Remove */}
										<button
											type="button"
											onClick={() => handleRemovePending(email)}
											disabled={loading}
											className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-sub-600"
										>
											<Icon name="cross" className="h-3 w-3" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}
					<div className="space-y-2">
						<span className="font-medium text-label-sm text-text-strong-950">
							Assign role
						</span>
						<div className="grid grid-cols-2 gap-2 pt-2">
							{ROLE_CONFIG.map(({ value, label, description, dotColor }) => {
								const isSelected = selectedRole === value;
								const styles = getRoleCardStyles(value);
								return (
									<button
										key={value}
										type="button"
										onClick={() => {
											setSelectedRole(value);
											// Apply selected role to all pending emails
											setPendingEmails((prev) =>
												prev.map((e) => ({ ...e, role: value })),
											);
										}}
										className={cn(
											"relative flex flex-col items-start gap-1 rounded-xl border px-3.5 pt-2 pb-3.5 text-left transition-all",
											isSelected
												? styles.card
												: "border-stroke-soft-100 bg-bg-white-0 hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/50",
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
													<Icon
														name="check"
														className="h-2.5 w-2.5 text-white"
													/>
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
							Roles can be changed anytime after the member joins
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
					<p className="text-paragraph-xs text-text-sub-600">
						{pendingEmails.length > 0
							? `${pendingEmails.length} invitation${pendingEmails.length > 1 ? "s" : ""} will be sent`
							: "No invitations queued"}
					</p>
					<div className="flex items-center gap-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => handleOpenChange(false)}
							disabled={loading}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							size="xsmall"
							onClick={handleSubmit}
							disabled={loading || pendingEmails.length === 0}
						>
							{loading ? (
								<>
									<Spinner size={12} color="currentColor" />
									Sending...
								</>
							) : (
								<>
									<Icon name="send-2" className="-mr-1 h-3.5 w-3.5" />
									Send invites
									<span className="inline-flex items-center gap-0.5">
										<Icon
											name="command"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
										<Icon
											name="enter"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
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
