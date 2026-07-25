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
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { isInvitationActionable } from "#/utils/invitations";

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

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
	const queryClient = useQueryClient();
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id;
	const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
	const loading = status === "sending";
	const [inputValue, setInputValue] = useState("");
	const [inputFocused, setInputFocused] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>([]);
	const [selectedRole, setSelectedRole] = useState<Role>("member");
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch existing members & invites to prevent duplicates
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

		setPendingEmails((prev) => [
			...prev,
			{ email: trimmed, role: selectedRole },
		]);
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
		if (!orgId) return;

		setStatus("sending");
		try {
			const results = await Promise.allSettled(
				pendingEmails.map(({ email, role }) =>
					authClient.organization.inviteMember({
						email,
						role,
						organizationId: orgId,
					}),
				),
			);

			const successCount = results.filter(
				(r) => r.status === "fulfilled",
			).length;
			const failCount = results.filter((r) => r.status === "rejected").length;

			if (successCount > 0) {
				await queryClient.invalidateQueries({
					queryKey: queryKeys.organization.invitations(orgId),
				});
				setStatus("success");
				setTimeout(() => {
					handleOpenChange(false);
					setStatus("idle");
				}, 1500);
			} else {
				setStatus("idle");
			}
			if (failCount > 0) {
				toast.error(
					`${failCount} invitation${failCount > 1 ? "s" : ""} failed`,
				);
			}
		} catch {
			toast.error("Failed to invite team members");
			setStatus("idle");
		}
	};

	useHotkeys(
		"mod+enter",
		(event) => {
			event.preventDefault();
			event.stopPropagation();
			if (!loading && pendingEmails.length > 0) {
				handleSubmit();
			}
		},
		{
			enableOnFormTags: true,
			enabled: open,
			preventDefault: true,
		},
		[loading, pendingEmails, handleSubmit, open],
	);

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						{/* Header */}
						<div className="relative pr-6">
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Invite team members
							</Modal.Title>
							<Modal.Description className="mt-1 text-paragraph-sm text-text-sub-600">
								Invitations will be sent via email
							</Modal.Description>
						</div>

						{/* Body */}
						<div className="mt-5 space-y-4">
							{/* Email Input */}
							<div className="space-y-1.5">
								<div className="flex items-center gap-2">
									<span className="font-medium text-label-sm text-text-strong-950">
										Email addresses
									</span>
								</div>
								<div className="flex gap-2">
									<Input.Root
										size="medium"
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
												autoComplete="off"
												spellCheck={false}
												autoCorrect="off"
												data-1p-ignore
											/>
											{inputFocused && inputValue.trim() && (
												<div className="flex items-center gap-1 rounded-md border border-stroke-sub-300 bg-bg-white-0 px-1.5 py-[2px] text-[10px] text-text-sub-600">
													<span>⏎</span>
													<span>Enter</span>
												</div>
											)}
										</Input.Wrapper>
									</Input.Root>
									<FancyButton.Root
										type="button"
										variant="basic"
										size="medium"
										className="font-medium"
										onClick={handleAddEmail}
										disabled={loading || !inputValue.trim()}
									>
										<FancyButton.Icon as={Icon} name="plus" />
										Add
									</FancyButton.Root>
								</div>
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

							<AnimatePresence initial={false}>
								{pendingEmails.length > 0 && (
									<motion.div
										key="pending-invites-section"
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{
											type: "spring",
											bounce: 0,
											duration: 0.3,
										}}
										className="space-y-2 overflow-hidden"
									>
										<div className="flex items-center gap-2">
											<span className="font-medium text-label-sm text-text-strong-950">
												Pending invites
											</span>
											<span className="flex h-4 min-w-[20px] items-center justify-center rounded-full border border-stroke-soft-100 bg-neutral-alpha-10 px-1.5 font-medium text-[11px] text-text-sub-600 dark:border-stroke-soft-100/40">
												{pendingEmails.length}
											</span>
										</div>
										<div className="divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/50">
											<AnimatePresence initial={false} mode="popLayout">
												{pendingEmails.map(({ email, role }) => (
													<motion.div
														key={email}
														layout
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: "auto" }}
														exit={{ opacity: 0, height: 0 }}
														transition={{
															type: "spring",
															bounce: 0,
															duration: 0.3,
														}}
														className="flex items-center gap-2 px-3.5 py-2"
													>
														{/* Avatar */}
														<div
															className={cn(
																"flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-medium text-[11px] text-white uppercase tracking-wide shadow-xs",
																getAvatarGradient(email),
															)}
														>
															{getAvatarInitial(null, email)}
														</div>

														{/* Email */}
														<span className="flex-1 truncate font-medium text-paragraph-sm text-text-strong-950">
															{email}
														</span>

														{/* Role Selection */}
														<div className="flex items-center gap-1">
															{(["member", "admin"] as Role[]).map((r) => (
																<button
																	key={r}
																	type="button"
																	onClick={() => handleRoleChange(email, r)}
																	className={cn(
																		"inline-flex rounded-full border px-2.5 py-0.5 font-medium text-[11px] capitalize transition-all active:scale-[0.97]",
																		role === r
																			? getRoleBadgeStyles(r)
																			: "border-transparent text-text-soft-400 hover:text-text-sub-600",
																	)}
																>
																	{r}
																</button>
															))}
														</div>

														{/* Remove */}
														<FancyButton.Root
															onClick={() => handleRemovePending(email)}
															disabled={loading}
															size="xsmall"
															variant="ghost"
															className="h-6 w-6 rounded-md p-0"
														>
															<FancyButton.Icon as={Icon} name="cross" />
														</FancyButton.Root>
													</motion.div>
												))}
											</AnimatePresence>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<div className="space-y-2">
								<p className="font-medium text-label-sm text-text-strong-950">
									Select role
								</p>
								<div className="grid grid-cols-2 gap-2.5">
									{ROLE_CONFIG.map(
										({ value, label, description, dotColor }) => {
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
														"relative flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all active:scale-[0.98]",
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
										},
									)}
								</div>
							</div>

							<p className="flex items-center gap-1.5 pt-0.5 text-[11px] text-text-sub-600">
								<Icon
									name="info-outline"
									className="h-3.5 w-3.5 flex-shrink-0"
								/>
								Roles can be changed anytime after the member joins
							</p>
						</div>

						{/* Footer */}
						<div className="mt-6 flex items-center justify-between gap-3">
							<p className="text-paragraph-xs text-text-sub-600">
								{pendingEmails.length > 0
									? `${pendingEmails.length} invitation${pendingEmails.length > 1 ? "s" : ""} queued`
									: "No invitations queued"}
							</p>
							<div className="flex items-center gap-3">
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
									onClick={handleSubmit}
									disabled={status !== "idle" || pendingEmails.length === 0}
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
													<FancyButton.Icon as={Icon} name="send-2" />
													<span>Send invites</span>
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
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
