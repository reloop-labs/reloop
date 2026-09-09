"use client";

import { InboundDetailDrawer } from "@fe/console/components/inbound-detail-drawer";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet } from "@fe/console/lib/admin-api";
import { formatRecipients, formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import useSWR from "swr";

type InboundItem = {
	id: string;
	organizationId: string;
	organizationName: string | null;
	mailboxEmail: string | null;
	fromEmail: string;
	toEmails: string[] | unknown;
	subject: string | null;
	status: string;
	isSpam: boolean;
	spamScore: number | null;
	createdAt: string;
};

type InboundResponse = { items: InboundItem[]; total: number };

export default function InboundPage() {
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [organizationId, setOrganizationId] = useQueryState(
		"organizationId",
		parseAsString.withDefault(""),
	);
	const [selectedEmailId, setSelectedEmailId] = useQueryState(
		"emailId",
		parseAsString.withDefault(""),
	);
	const [draftQ, setDraftQ] = useState(q);

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const { data, isLoading } = useSWR<InboundResponse>(
		["/inbound", q, status, organizationId],
		() =>
			adminGet<InboundResponse>("/inbound", {
				q: q || undefined,
				status: status || undefined,
				organizationId: organizationId || undefined,
				limit: 50,
			}),
	);

	return (
		<PageFrame>
			<PageHeading
				title="Received"
				description="Every inbound email accepted across the platform. Filter by org, mailbox, or spam status."
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
									placeholder="Search from / subject / mailbox"
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
							<option value="received">Received</option>
							<option value="delivered">Delivered</option>
							<option value="spam">Spam</option>
							<option value="rejected">Rejected</option>
							<option value="failed">Failed</option>
							<option value="processing">Processing</option>
						</select>
						{organizationId ? (
							<>
								<Button.Root asChild variant="neutral" mode="stroke">
									<Link href={`/organizations/${organizationId}`}>Org hub</Link>
								</Button.Root>
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									onClick={() => setOrganizationId(null)}
								>
									Clear org
								</Button.Root>
							</>
						) : null}
						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

			{organizationId ? (
				<p className="rounded-xl bg-bg-weak-50 px-3 py-2 text-[12px] text-text-sub-600 dark:bg-white/[0.04]">
					Filtered to organization{" "}
					<code className="font-mono text-[11px]">{organizationId}</code>
				</p>
			) : null}

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<DataTable
					headers={[
						"When",
						"From",
						"To",
						"Subject",
						"Status",
						"Mailbox",
						"Org",
						"",
					]}
					colSpan={8}
					loading={isLoading}
					empty={!isLoading && !data?.items.length}
				>
					{data?.items.map((email) => (
						<tr
							key={email.id}
							className="group border-stroke-soft-100 border-t transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.02]"
						>
							<td className="whitespace-nowrap px-4 py-3 text-text-sub-600">
								{formatRelativeTime(email.createdAt)}
							</td>
							<td className="px-4 py-3 font-medium">{email.fromEmail}</td>
							<td className="max-w-[160px] truncate px-4 py-3 text-text-sub-600">
								{formatRecipients(email.toEmails)}
							</td>
							<td className="max-w-[240px] truncate px-4 py-3">
								<button
									type="button"
									onClick={() => setSelectedEmailId(email.id)}
									className="truncate text-left font-medium text-text-strong-950 transition-colors hover:text-primary-base hover:underline"
								>
									{email.subject || "(no subject)"}
								</button>
							</td>
							<td className="px-4 py-3">
								<div className="flex items-center gap-1.5">
									<StatusPill status={email.status} />
									{email.isSpam && email.status !== "spam" ? (
										<StatusPill status="spam" />
									) : null}
								</div>
							</td>
							<td className="max-w-[160px] truncate px-4 py-3 text-text-sub-600">
								{email.mailboxEmail || "—"}
							</td>
							<td className="px-4 py-3">
								<Button.Root
									asChild
									size="xsmall"
									variant="neutral"
									mode="ghost"
								>
									<Link href={`/organizations/${email.organizationId}`}>
										{email.organizationName || "Open hub"}
									</Link>
								</Button.Root>
							</td>
							<td className="px-4 py-3 text-right">
								<Button.Root
									type="button"
									size="xsmall"
									variant="neutral"
									mode="stroke"
									onClick={() => setSelectedEmailId(email.id)}
									className="gap-1"
								>
									<Icon name="eye" className="h-3 w-3" />
									Details
								</Button.Root>
							</td>
						</tr>
					))}
				</DataTable>
			</div>

			<InboundDetailDrawer
				emailId={selectedEmailId || null}
				open={Boolean(selectedEmailId)}
				onOpenChange={(open) =>
					setSelectedEmailId(open ? selectedEmailId : null)
				}
			/>
		</PageFrame>
	);
}
