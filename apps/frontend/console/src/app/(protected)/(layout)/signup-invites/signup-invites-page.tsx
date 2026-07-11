"use client";

import { ConfirmActionDialog } from "@fe/console/components/confirm-action-dialog";
import { adminGet, adminPost } from "@fe/console/lib/admin-api";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type SignupInviteItem = {
	id: string;
	code: string;
	email: string;
	status: string;
	expiresAt: string;
	invitedByUserId: string;
	invitedByEmail: string | null;
	invitedByName: string | null;
	usedByUserId: string | null;
	inviteLink: string;
	createdAt: string;
};

type SignupInvitesResponse = {
	items: SignupInviteItem[];
	total: number;
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function SignupInvitesPage() {
	const [email, setEmail] = useState("");
	const [search, setSearch] = useState("");
	const [sending, setSending] = useState(false);
	const [revokeId, setRevokeId] = useState<string | null>(null);

	const { data, isLoading, mutate } = useSWR<SignupInvitesResponse>(
		["/signup-invites", search],
		() =>
			adminGet<SignupInvitesResponse>("/signup-invites", {
				q: search || undefined,
				limit: 100,
			}),
	);

	const onSend = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;
		setSending(true);
		try {
			await adminPost("/signup-invites", { email: trimmed });
			toast.success(`Invite sent to ${trimmed}`);
			setEmail("");
			mutate();
		} catch (err) {
			const message =
				(err as { response?: { data?: { message?: string } } })?.response?.data
					?.message ||
				(err instanceof Error ? err.message : "Failed to send invite");
			toast.error(message);
		} finally {
			setSending(false);
		}
	};

	const onCopy = async (link: string) => {
		try {
			await navigator.clipboard.writeText(link);
			toast.success("Invite link copied");
		} catch {
			toast.error("Failed to copy link");
		}
	};

	const onRevoke = async () => {
		if (!revokeId) return;
		try {
			await adminPost(`/signup-invites/${revokeId}/revoke`);
			toast.success("Invite revoked");
			setRevokeId(null);
			mutate();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to revoke invite",
			);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h4">
					Signup invites
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Invite people to create a Reloop account. Recipients need a valid
					invite to sign up.
				</p>
			</div>

			<form
				onSubmit={onSend}
				className="flex flex-wrap items-end gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4"
			>
				<div className="min-w-[240px] flex-1 space-y-1.5">
					<label
						htmlFor="invite-email"
						className="font-medium text-label-sm text-text-sub-600"
					>
						Email address
					</label>
					<Input.Root>
						<Input.Wrapper>
							<Input.Input
								id="invite-email"
								type="email"
								placeholder="colleague@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<Button.Root type="submit" disabled={sending || !email.trim()}>
					{sending ? "Sending…" : "Send invite"}
				</Button.Root>
			</form>

			<div className="flex items-center gap-2">
				<Input.Root className="max-w-sm">
					<Input.Wrapper>
						<Input.Input
							placeholder="Search email or code"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</Input.Wrapper>
				</Input.Root>
				<span className="text-paragraph-sm text-text-sub-600">
					{data?.total ?? 0} total
				</span>
			</div>

			<div className="overflow-hidden rounded-xl border border-stroke-soft-100">
				<table className="w-full text-left text-sm">
					<thead className="border-stroke-soft-100 border-b bg-bg-weak-50 text-text-sub-600">
						<tr>
							<th className="px-4 py-3 font-medium">Email</th>
							<th className="px-4 py-3 font-medium">Status</th>
							<th className="px-4 py-3 font-medium">Expires</th>
							<th className="px-4 py-3 font-medium">Invited by</th>
							<th className="px-4 py-3 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading && (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-8 text-center text-text-sub-600"
								>
									Loading…
								</td>
							</tr>
						)}
						{!isLoading && (data?.items.length ?? 0) === 0 && (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-8 text-center text-text-sub-600"
								>
									No signup invites yet.
								</td>
							</tr>
						)}
						{data?.items.map((item) => (
							<tr
								key={item.id}
								className="border-stroke-soft-100 border-b last:border-0"
							>
								<td className="px-4 py-3">
									<div className="font-medium text-text-strong-950">
										{item.email}
									</div>
									<div className="font-mono text-[11px] text-text-soft-400">
										{item.code}
									</div>
								</td>
								<td className="px-4 py-3 capitalize">{item.status}</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatDate(item.expiresAt)}
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{item.invitedByName || item.invitedByEmail || "—"}
								</td>
								<td className="px-4 py-3">
									<div className="flex flex-wrap gap-2">
										<Button.Root
											type="button"
											size="xsmall"
											variant="neutral"
											mode="stroke"
											onClick={() => onCopy(item.inviteLink)}
										>
											Copy link
										</Button.Root>
										{item.status === "pending" && (
											<Button.Root
												type="button"
												size="xsmall"
												variant="neutral"
												mode="ghost"
												onClick={() => setRevokeId(item.id)}
											>
												Revoke
											</Button.Root>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<ConfirmActionDialog
				open={!!revokeId}
				onOpenChange={(open) => {
					if (!open) setRevokeId(null);
				}}
				title="Revoke signup invite?"
				description="The invite link will stop working. You can send a new invite later."
				confirmLabel="Revoke"
				onConfirm={onRevoke}
			/>
		</div>
	);
}
