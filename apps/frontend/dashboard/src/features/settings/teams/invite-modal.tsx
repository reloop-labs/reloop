import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { isInvitationActionable } from "#/utils/invitations";

type Role = "member" | "admin";

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
		description: "Manage emails, domains, and webhooks.",
		dotColor: "bg-neutral-600",
	},
	{
		value: "admin",
		label: "Admin",
		description: "Invite users, update payment, and delete the team.",
		dotColor: "bg-feature-base",
	},
];

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

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
	const queryClient = useQueryClient();
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id;
	const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
	const loading = status === "sending";
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [selectedRole, setSelectedRole] = useState<Role>("member");
	const inputRef = useRef<HTMLInputElement>(null);

	const { data: membersData } = useQuery({
		queryKey: queryKeys.organization.members(orgId ?? ""),
		queryFn: async () => {
			const result = await authClient.organization.listMembers({
				query: { organizationId: orgId ?? "" },
			});
			return (
				(result.data as { members: { user: { email: string } }[] }) ?? {
					members: [],
				}
			);
		},
		enabled: !!orgId && open,
	});

	const { data: invitesData } = useQuery({
		queryKey: queryKeys.organization.invitations(orgId ?? ""),
		queryFn: async () => {
			const result = await authClient.organization.listInvitations({
				query: { organizationId: orgId ?? "" },
			});
			return (
				(result.data as {
					email: string;
					status: string;
					expiresAt: Date | string;
				}[]) ?? []
			);
		},
		enabled: !!orgId && open,
	});

	const existingEmails = new Set([
		...(membersData?.members?.map((m: { user: { email: string } }) =>
			m.user.email.toLowerCase(),
		) ?? []),
		// Only block on still-valid pending invites — expired ones can be re-sent.
		...(invitesData
			?.filter((i: { status: string; expiresAt: Date | string }) =>
				isInvitationActionable(i),
			)
			.map((i: { email: string }) => i.email.toLowerCase()) ?? []),
	]);

	const resetForm = () => {
		setEmail("");
		setEmailError(null);
		setSelectedRole("member");
		setStatus("idle");
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			resetForm();
		}
		onOpenChange(isOpen);
	};

	const validateEmail = (value: string): string | null => {
		const trimmed = value.trim().toLowerCase();
		if (!trimmed) return "Email is required";
		if (!isValidEmail(trimmed)) return "Please enter a valid email address";
		if (existingEmails.has(trimmed)) {
			return "This user is already a member or has a pending invite";
		}
		return null;
	};

	const handleSubmit = async () => {
		const trimmed = email.trim().toLowerCase();
		const error = validateEmail(trimmed);
		if (error) {
			setEmailError(error);
			return;
		}
		if (!orgId) return;

		setStatus("sending");
		try {
			const result = await authClient.organization.inviteMember({
				email: trimmed,
				role: selectedRole,
				organizationId: orgId,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to send invitation");
				setStatus("idle");
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: queryKeys.organization.invitations(orgId),
			});
			setStatus("success");
			setTimeout(() => {
				handleOpenChange(false);
			}, 1500);
		} catch {
			toast.error("Failed to send invitation");
			setStatus("idle");
		}
	};

	const canSubmit = status === "idle" && email.trim().length > 0 && !emailError;

	useHotkeys(
		"mod+enter",
		(event) => {
			event.preventDefault();
			event.stopPropagation();
			if (canSubmit) {
				void handleSubmit();
			}
		},
		{
			enableOnFormTags: true,
			enabled: open,
			preventDefault: true,
		},
		[canSubmit, open, email, selectedRole, orgId],
	);

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<div className="p-6">
					<div className="relative pr-6">
						<Modal.Title className="font-semibold text-lg text-text-strong-950">
							Invite team member
						</Modal.Title>
						<Modal.Description className="text-text-sub-600 text-xs">
							An invitation will be sent via email
						</Modal.Description>
					</div>

					<div className="mt-5 space-y-4">
						<div className="space-y-1.5">
							<span className="font-medium text-label-sm text-text-strong-950">
								Email address
							</span>
							<Input.Root
								size="medium"
								className="w-full"
								hasError={!!emailError}
							>
								<Input.Wrapper>
									<Input.Input
										ref={inputRef}
										type="email"
										placeholder="name@company.com"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setEmailError(null);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												if (canSubmit) void handleSubmit();
											}
										}}
										disabled={loading}
										autoComplete="off"
										spellCheck={false}
										autoCorrect="off"
										data-1p-ignore
									/>
								</Input.Wrapper>
							</Input.Root>
							<AnimatePresence>
								{emailError && (
									<motion.p
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="overflow-hidden text-error-base text-paragraph-xs"
									>
										{emailError}
									</motion.p>
								)}
							</AnimatePresence>
						</div>

						<div className="space-y-2">
							<p className="font-medium text-label-sm text-text-strong-950">
								Select role
							</p>
							<div className="grid grid-cols-2 gap-2.5">
								{ROLE_CONFIG.map(({ value, label, description, dotColor }) => {
									const isSelected = selectedRole === value;
									const styles = getRoleCardStyles(value);
									return (
										<button
											key={value}
											type="button"
											onClick={() => setSelectedRole(value)}
											disabled={loading}
											className={cn(
												"relative flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all active:scale-[0.98]",
												isSelected
													? styles.card
													: "border-stroke-soft-100 bg-bg-white-0 hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/50",
												loading && "pointer-events-none opacity-70",
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
															"font-semibold text-label-xs",
															isSelected
																? styles.label
																: "text-text-strong-950",
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
													"text-balance font-medium text-[11px] leading-relaxed",
													isSelected ? styles.desc : "text-text-sub-600",
												)}
											>
												{description}
											</p>
										</button>
									);
								})}
							</div>
						</div>

						<p className="flex items-center gap-1.5 pt-0.5 text-[11px] text-text-sub-600">
							<Icon name="info-outline" className="h-3.5 w-3.5 flex-shrink-0" />
							Roles can be changed anytime after the member joins
						</p>
					</div>

					<div className="mt-6 flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={() => handleOpenChange(false)}
							disabled={loading}
							className={cn(
								"transition-opacity duration-200",
								loading && "pointer-events-none opacity-50",
							)}
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant={status === "success" ? "success" : "blue"}
							size="small"
							className={cn(
								"min-w-[130px] justify-center overflow-hidden transition-all duration-200",
								status === "sending" && "pointer-events-none opacity-90",
							)}
							onClick={() => void handleSubmit()}
							disabled={!canSubmit}
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
									{status === "sending" ? (
										<>
											<Spinner size={14} color="currentColor" />
											<span>Sending...</span>
										</>
									) : status === "success" ? (
										<>
											<Icon
												name="check"
												className="h-4 w-4 shrink-0 text-white"
											/>
											<span>Sent!</span>
										</>
									) : (
										<>
											<FancyButton.Icon
												as={Icon}
												name="send-2"
												className="mr-1 h-4 w-4 rotate-45"
											/>
											<span>Send invite</span>
											<span className="inline-flex items-center gap-0.5 opacity-80">
												<Icon
													name="command"
													className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
												/>
												<Icon
													name="enter"
													className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
												/>
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
}
