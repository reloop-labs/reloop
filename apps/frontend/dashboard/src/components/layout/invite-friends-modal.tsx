"use client";

import {
	createSignupInvite,
	fetchMySignupInvites,
	revokeSignupInvite,
} from "@fe/dashboard/lib/peer-signup-invite";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface InviteFriendsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
// Delete statusLabel helper because we render custom badges inline

export const InviteFriendsModal = ({
	open,
	onOpenChange,
}: InviteFriendsModalProps) => {
	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [revokingId, setRevokingId] = useState<string | null>(null);

	const { data, isLoading, mutate } = useSWR(
		open ? "peer-signup-invites" : null,
		fetchMySignupInvites,
	);

	const handleClose = () => {
		onOpenChange(false);
		setEmail("");
	};

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;

		setSending(true);
		try {
			await createSignupInvite(trimmed);
			toast.success(`Invite sent to ${trimmed}`);
			setEmail("");
			mutate();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to send invite");
		} finally {
			setSending(false);
		}
	};

	const handleCopy = async (link: string) => {
		try {
			await navigator.clipboard.writeText(link);
			toast.success("Invite link copied");
		} catch {
			toast.error("Failed to copy link");
		}
	};

	const handleRevoke = async (inviteId: string) => {
		setRevokingId(inviteId);
		try {
			await revokeSignupInvite(inviteId);
			toast.success("Invite revoked");
			mutate();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to revoke invite",
			);
		} finally {
			setRevokingId(null);
		}
	};

	const remaining = data?.remaining ?? null;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="relative overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				{/* Top Accent Light Bar */}
				<div className="-translate-x-1/2 absolute top-0 left-1/2 h-[1.5px] w-48 bg-gradient-to-r from-transparent via-primary-base/40 to-transparent" />

				{/* Close Button */}
				<button
					type="button"
					onClick={handleClose}
					className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 shadow-sm transition-all hover:bg-bg-weak-50 active:scale-[0.95] dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5 dark:hover:bg-white/10"
				>
					<Icon name="cross" className="h-4 w-4" />
				</button>

				{/* Header Section */}
				<div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
					<div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-base/10 to-faded-base/10 shadow-inner ring-1 ring-primary-base/20 dark:from-primary-base/20 dark:to-faded-base/20 dark:ring-primary-base/30">
						<div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-tr from-primary-base/5 to-faded-base/5 blur-md" />
						<Icon name="user-plus" className="h-7 w-7 text-primary-base" />
					</div>
					<Modal.Title asChild>
						<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
							Invite friends
						</h2>
					</Modal.Title>
					<Modal.Description asChild>
						<p className="mt-1 max-w-[340px] text-paragraph-sm text-text-sub-600 leading-relaxed">
							Friends need an invite to create a Reloop account.
						</p>
					</Modal.Description>

					{/* Remaining Invites Badge */}
					{remaining !== null && (
						<div className="mt-3.5">
							<span
								className={cn(
									"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold text-xs shadow-sm ring-1 ring-inset",
									remaining > 0
										? "bg-success-lighter/40 text-success-base ring-success-base/20 dark:bg-success-base/10 dark:text-success-base dark:ring-success-base/20"
										: "bg-faded-lighter text-text-sub-600 ring-stroke-soft-200 dark:bg-white/5 dark:text-text-sub-600 dark:ring-white/10",
								)}
							>
								<span
									className={cn(
										"size-1.5 rounded-full",
										remaining > 0
											? "animate-pulse bg-success-base"
											: "bg-text-sub-600",
									)}
								/>
								{remaining} {remaining === 1 ? "invite" : "invites"} remaining
							</span>
						</div>
					)}
				</div>

				<Modal.Body className="flex flex-col gap-6 px-6 pt-2 pb-6">
					{/* Invite Input Form */}
					<form onSubmit={handleSend} className="flex flex-col gap-2">
						<Label.Root
							htmlFor="friend-invite-email"
							className="font-semibold text-label-xs text-text-strong-950 uppercase tracking-wider"
						>
							Invite by email
						</Label.Root>
						<div className="flex gap-2">
							<div className="flex-1">
								<Input.Root size="medium">
									<Input.Wrapper>
										<Input.Icon
											as={() => (
												<Icon
													name="mail"
													className="size-4 text-text-sub-600"
												/>
											)}
										/>
										<Input.Input
											id="friend-invite-email"
											type="email"
											placeholder="friend@company.com"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											disabled={sending || remaining === 0}
											autoComplete="email"
											className="h-10"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<Button.Root
								type="submit"
								variant="primary"
								size="medium"
								disabled={!email.trim() || sending || remaining === 0}
								className="h-10 px-5 shadow-button-primary"
							>
								{sending ? <Spinner size={16} /> : "Send invite"}
							</Button.Root>
						</div>
					</form>

					{/* Invites List */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<p className="font-semibold text-label-xs text-text-strong-950 uppercase tracking-wider">
								Your invites
							</p>
							{data?.items && data.items.length > 0 && (
								<span className="font-medium text-[11px] text-text-sub-600">
									{data.items.length} total
								</span>
							)}
						</div>

						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<Spinner size={20} />
							</div>
						) : !data?.items.length ? (
							<p className="rounded-xl border border-stroke-soft-100 border-dashed px-3 py-8 text-center text-paragraph-sm text-text-sub-600 dark:border-stroke-soft-100/40">
								No invites yet. Send one above.
							</p>
						) : (
							<ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
								{data.items.map((invite) => (
									<li
										key={invite.id}
										className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/20 px-3 py-2.5 shadow-sm transition-all hover:bg-bg-weak-50/40 dark:border-stroke-soft-100/20 dark:bg-bg-weak-50/5 dark:hover:bg-bg-weak-50/10"
									>
										{/* Letter Avatar */}
										<div
											className={cn(
												"flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm text-white shadow-sm ring-1 ring-black/10",
												getAvatarGradient(invite.email),
											)}
										>
											{getAvatarInitial(null, invite.email)}
										</div>

										{/* Invitee Info */}
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-label-sm text-text-strong-950">
												{invite.email}
											</p>
											<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
												Invited on {formatDate(invite.createdAt)}
											</p>
										</div>

										{/* Status & Actions */}
										<div className="flex items-center gap-2">
											{invite.status === "used" && (
												<span className="inline-flex items-center gap-1 rounded-full bg-success-lighter/50 px-2 py-0.5 font-semibold text-[10px] text-success-base dark:bg-success-base/10">
													<span className="size-1 animate-pulse rounded-full bg-success-base" />
													Joined
												</span>
											)}
											{invite.status === "pending" && (
												<span className="inline-flex items-center gap-1 rounded-full bg-warning-lighter/50 px-2 py-0.5 font-semibold text-[10px] text-warning-base dark:bg-warning-base/10">
													<span className="size-1 animate-pulse rounded-full bg-warning-base" />
													Pending
												</span>
											)}
											{invite.status === "revoked" && (
												<span className="inline-flex items-center gap-1 rounded-full bg-faded-light/40 px-2 py-0.5 font-semibold text-[10px] text-text-sub-600 dark:bg-white/5">
													Revoked
												</span>
											)}

											{invite.status === "pending" && (
												<div className="flex items-center gap-1 border-stroke-soft-100 border-l pl-2 dark:border-stroke-soft-100/40">
													<button
														type="button"
														onClick={() => handleCopy(invite.inviteLink)}
														className="flex size-7 shrink-0 items-center justify-center rounded-md border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 shadow-sm transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-95 dark:border-stroke-soft-100/40 dark:bg-white/5 dark:hover:bg-white/10"
														title="Copy invite link"
													>
														<Icon name="copy" className="size-3.5" />
													</button>
													<button
														type="button"
														onClick={() => handleRevoke(invite.id)}
														disabled={revokingId === invite.id}
														className="flex size-7 shrink-0 items-center justify-center rounded-md border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 shadow-sm transition-all hover:bg-bg-weak-50 hover:text-error-base active:scale-95 dark:border-stroke-soft-100/40 dark:bg-white/5 dark:hover:bg-white/10"
														title="Revoke invite"
													>
														{revokingId === invite.id ? (
															<Spinner size={12} />
														) : (
															<Icon name="trash" className="size-3.5" />
														)}
													</button>
												</div>
											)}
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</Modal.Body>

				{/* Footer Section */}
				<Modal.Footer className="justify-end border-none px-6 pt-2 pb-5">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="medium"
						onClick={handleClose}
						className="px-6"
					>
						Done
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
