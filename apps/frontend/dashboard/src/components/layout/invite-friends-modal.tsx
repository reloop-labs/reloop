"use client";

import {
	createSignupInvite,
	fetchMySignupInvites,
	revokeSignupInvite,
	type PeerSignupInvite,
} from "@fe/dashboard/lib/peer-signup-invite";
import * as Button from "@reloop/ui/button";
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

function statusLabel(status: PeerSignupInvite["status"]) {
	switch (status) {
		case "pending":
			return "Pending";
		case "used":
			return "Joined";
		case "revoked":
			return "Revoked";
	}
}

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
	const limit = data?.limit ?? 5;

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<div className="flex flex-col border-stroke-soft-100 border-b dark:border-stroke-soft-100/40">
					<div className="flex items-start justify-between px-5 pt-5 pb-4">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-2.5">
								<Icon
									name="gift"
									className="h-4 w-4 text-text-strong-950"
								/>
								<Modal.Title asChild>
									<h2 className="font-semibold text-label-md text-text-strong-950">
										Invite friends
									</h2>
								</Modal.Title>
							</div>
							<Modal.Description asChild>
								<p className="text-paragraph-xs text-text-sub-600">
									Send up to {limit} invites. Friends need an invite to create a
									Reloop account
									{remaining !== null ? (
										<>
											{" "}
											· {remaining} left
										</>
									) : null}
									.
								</p>
							</Modal.Description>
						</div>
						<button
							type="button"
							onClick={handleClose}
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-transparent text-text-sub-600 transition-all hover:bg-bg-weak-50 active:scale-[0.95] dark:border-stroke-soft-100/60 dark:hover:bg-white/5"
						>
							<Icon name="cross" className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
				<Modal.Body className="flex flex-col gap-5">
					<form onSubmit={handleSend} className="flex flex-col gap-3">
						<div className="space-y-1.5">
							<Label.Root htmlFor="friend-invite-email">Email</Label.Root>
							<Input.Root>
								<Input.Wrapper>
									<Input.Input
										id="friend-invite-email"
										type="email"
										placeholder="friend@company.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={sending || remaining === 0}
										autoComplete="email"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<Button.Root
							type="submit"
							variant="primary"
							size="small"
							disabled={!email.trim() || sending || remaining === 0}
							className="w-full"
						>
							{sending ? <Spinner size={16} /> : "Send invite"}
						</Button.Root>
					</form>

					<div className="space-y-2">
						<p className="font-medium text-label-sm text-text-sub-600">
							Your invites
						</p>
						{isLoading ? (
							<div className="flex items-center justify-center py-6">
								<Spinner size={20} />
							</div>
						) : !data?.items.length ? (
							<p className="rounded-xl border border-dashed border-stroke-soft-100 px-3 py-6 text-center text-paragraph-sm text-text-sub-600 dark:border-stroke-soft-100/40">
								No invites yet. Send one above.
							</p>
						) : (
							<ul className="max-h-56 space-y-1.5 overflow-y-auto">
								{data.items.map((invite) => (
									<li
										key={invite.id}
										className="flex items-center gap-2 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/40 px-2.5 py-2 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/10"
									>
										<div className="min-w-0 flex-1">
											<p className="truncate text-label-sm text-text-strong-950">
												{invite.email}
											</p>
											<p className="text-paragraph-xs text-text-sub-600">
												{statusLabel(invite.status)} ·{" "}
												{formatDate(invite.createdAt)}
											</p>
										</div>
										{invite.status === "pending" ? (
											<>
												<button
													type="button"
													onClick={() => handleCopy(invite.inviteLink)}
													className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
													title="Copy invite link"
												>
													<Icon name="copy" className="size-3.5" />
												</button>
												<button
													type="button"
													onClick={() => handleRevoke(invite.id)}
													disabled={revokingId === invite.id}
													className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:hover:bg-white/5"
													title="Revoke invite"
												>
													{revokingId === invite.id ? (
														<Spinner size={14} />
													) : (
														<Icon name="trash" className="size-3.5" />
													)}
												</button>
											</>
										) : null}
									</li>
								))}
							</ul>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer className="justify-end py-3.5">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={handleClose}
					>
						Done
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
