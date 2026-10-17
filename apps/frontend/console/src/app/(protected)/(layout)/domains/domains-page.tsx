"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import { formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type DomainItem = {
	id: string;
	domain: string;
	status: string;
	organizationId: string;
	organizationName: string;
	systemVerified: boolean;
	sendingBlockedAt: string | null;
	sendingBlockedMessage: string | null;
	sendingBlockedSource: string | null;
	createdAt: string;
};

type DomainsResponse = { items: DomainItem[]; total: number };

export default function DomainsPage() {
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [draftQ, setDraftQ] = useState(q);
	const [suspendTarget, setSuspendTarget] = useState<DomainItem | null>(null);
	const [verifyingId, setVerifyingId] = useState<string | null>(null);
	const [blockTarget, setBlockTarget] = useState<DomainItem | null>(null);
	const [blockMessage, setBlockMessage] = useState("");

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const { data, isLoading, mutate } = useSWR<DomainsResponse>(
		["/domains", q, status],
		() =>
			adminGet<DomainsResponse>("/domains", {
				q: q || undefined,
				status: status || undefined,
				limit: 50,
			}),
	);

	return (
		<PageFrame>
			<PageHeading
				title="Domains"
				description="Platform-wide domain investigation. Day-to-day domain work belongs on the organization hub."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{data?.total ?? 0} matching
						{status ? ` · ${status}` : ""}
					</span>
				}
				actions={
					<form
						className="flex flex-wrap gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							setQ(draftQ.trim() || null);
						}}
					>
						<Input.Root className="w-56">
							<Input.Wrapper>
								<Input.Input
									placeholder="Search domain"
									value={draftQ}
									onChange={(e) => setDraftQ(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						<select
							className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
							value={status}
							onChange={(e) => setStatus(e.target.value || null)}
						>
							<option value="">All statuses</option>
							<option value="active">Active</option>
							<option value="pending">Pending</option>
							<option value="verifying">Verifying</option>
							<option value="failed">Failed</option>
							<option value="suspended">Suspended</option>
						</select>
						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

			{suspendTarget ? (
				<InlineActionPanel
					title={`Suspend ${suspendTarget.domain}?`}
					description="Sending from this domain will be blocked until reactivated."
					confirmLabel="Suspend domain"
					destructive
					onCancel={() => setSuspendTarget(null)}
					onConfirm={async () => {
						try {
							await adminPatch(`/domains/${suspendTarget.id}/status`, {
								status: "suspended",
								reason: "Suspended by platform admin",
							});
							toast.success("Domain suspended");
							setSuspendTarget(null);
							mutate();
						} catch {
							toast.error("Failed to suspend domain");
						}
					}}
				/>
			) : null}

			{blockTarget ? (
				<InlineActionPanel
					title={`Block sending from ${blockTarget.domain}?`}
					description="Every send from this domain (API, SMTP, campaigns, automations) is rejected with your message until you unblock it. DNS re-verification does not lift the block."
					confirmLabel="Block sending"
					destructive
					onCancel={() => {
						setBlockTarget(null);
						setBlockMessage("");
					}}
					onConfirm={async () => {
						const message = blockMessage.trim();
						if (!message) {
							toast.error("Add a message for the customer");
							return;
						}
						try {
							await adminPost(`/domains/${blockTarget.id}/block`, { message });
							toast.success(`Sending blocked for ${blockTarget.domain}`);
							setBlockTarget(null);
							setBlockMessage("");
							mutate();
						} catch {
							toast.error("Failed to block domain");
						}
					}}
				>
					<textarea
						rows={3}
						maxLength={500}
						value={blockMessage}
						onChange={(e) => setBlockMessage(e.target.value)}
						placeholder="Shown to the customer, e.g. Sending is paused while we review a phishing report. Contact support to appeal."
						className="block w-full resize-none rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-[13px] text-text-strong-950 outline-none transition placeholder:text-text-soft-400 focus:border-text-strong-950 focus:ring-1 focus:ring-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-white/[0.02] dark:focus:border-white"
					/>
					<p className="text-[11px] text-text-soft-400 tabular-nums">
						{blockMessage.length}/500
					</p>
				</InlineActionPanel>
			) : null}

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<DataTable
					headers={[
						"Domain",
						"Organization",
						"Status",
						"Verified",
						"Created",
						"Actions",
					]}
					colSpan={6}
					loading={isLoading}
					empty={!isLoading && !data?.items.length}
				>
					{data?.items.map((d) => (
						<tr
							key={d.id}
							className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
						>
							<td className="px-4 py-3">
								<p className="font-medium">{d.domain}</p>
								{d.sendingBlockedAt ? (
									<p
										className="mt-0.5 max-w-xs truncate text-[12px] text-red-700 dark:text-red-400"
										title={d.sendingBlockedMessage ?? undefined}
									>
										{d.sendingBlockedSource === "spamhaus"
											? "Blocked by Spamhaus DBL"
											: "Sending blocked"}{" "}
										· {d.sendingBlockedMessage}
									</p>
								) : null}
							</td>
							<td className="px-4 py-3">
								<Link
									href={`/organizations/${d.organizationId}`}
									className="hover:underline"
								>
									{d.organizationName}
								</Link>
							</td>
							<td className="px-4 py-3">
								<StatusPill status={d.status} />
							</td>
							<td className="px-4 py-3 text-text-sub-600">
								{d.systemVerified ? "Yes" : "No"}
							</td>
							<td className="px-4 py-3 text-text-sub-600">
								{formatRelativeTime(d.createdAt)}
							</td>
							<td className="px-4 py-3">
								<div className="flex flex-wrap gap-1.5">
									<Button.Root
										asChild
										size="xsmall"
										variant="neutral"
										mode="stroke"
									>
										<Link href={`/organizations/${d.organizationId}`}>
											Org hub
										</Link>
									</Button.Root>
									<Button.Root
										size="xsmall"
										variant="neutral"
										mode="ghost"
										disabled={verifyingId === d.id}
										onClick={async () => {
											try {
												setVerifyingId(d.id);
												await adminPost(`/domains/${d.id}/verify`);
												toast.success(`Reverification started for ${d.domain}`);
												mutate();
											} catch {
												toast.error("Failed to start reverification");
											} finally {
												setVerifyingId(null);
											}
										}}
									>
										{verifyingId === d.id ? "Verifying..." : "Reverify"}
									</Button.Root>
									{d.sendingBlockedAt ? (
										<Button.Root
											size="xsmall"
											variant="neutral"
											mode="ghost"
											onClick={async () => {
												try {
													await adminPost(`/domains/${d.id}/unblock`);
													toast.success(`Sending unblocked for ${d.domain}`);
													mutate();
												} catch {
													toast.error("Failed to unblock domain");
												}
											}}
										>
											Unblock sending
										</Button.Root>
									) : (
										<Button.Root
											size="xsmall"
											variant="error"
											mode="ghost"
											onClick={() => {
												setBlockMessage("");
												setBlockTarget(d);
											}}
										>
											Block sending
										</Button.Root>
									)}
									{d.status === "suspended" ? (
										<Button.Root
											size="xsmall"
											variant="neutral"
											mode="ghost"
											onClick={async () => {
												try {
													await adminPatch(`/domains/${d.id}/status`, {
														status: "active",
														reason: "Reactivated by admin",
													});
													toast.success("Domain reactivated");
													mutate();
												} catch {
													toast.error("Failed to reactivate domain");
												}
											}}
										>
											Reactivate
										</Button.Root>
									) : (
										<Button.Root
											size="xsmall"
											variant="error"
											mode="ghost"
											onClick={() => setSuspendTarget(d)}
										>
											Suspend
										</Button.Root>
									)}
								</div>
							</td>
						</tr>
					))}
				</DataTable>
			</div>
		</PageFrame>
	);
}
