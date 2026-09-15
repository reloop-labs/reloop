"use client";

import { EmailDetailDrawer } from "@fe/console/components/email-detail-drawer";
import { AttachmentChips } from "@fe/console/components/ui/attachment-chips";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { TablePagination } from "@fe/console/components/ui/table-pagination";
import { adminGet } from "@fe/console/lib/admin-api";
import { formatRecipients, formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import useSWR from "swr";

type EmailItem = {
	id: string;
	organizationId: string;
	fromEmail: string;
	toEmails: string[] | unknown;
	subject: string;
	status: string;
	createdAt: string;
	sentAt: string | null;
	attachments?: Array<{
		id: string;
		filename: string;
		contentType: string;
		size: number;
		storagePath?: string;
	}>;
};

type EmailsResponse = { items: EmailItem[]; total: number };

export default function EmailsPage() {
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
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit, setLimit] = useQueryState(
		"limit",
		parseAsInteger.withDefault(50),
	);
	const [draftQ, setDraftQ] = useState(q);

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const offset = Math.max(0, (page - 1) * limit);

	const { data, isLoading } = useSWR<EmailsResponse>(
		["/emails", q, status, organizationId, page, limit],
		() =>
			adminGet<EmailsResponse>("/emails", {
				q: q || undefined,
				status: status || undefined,
				organizationId: organizationId || undefined,
				limit,
				offset,
			}),
	);

	useEffect(() => {
		if (data?.total !== undefined && data.total > 0) {
			const totalPages = Math.ceil(data.total / limit);
			if (page > totalPages) {
				setPage(totalPages);
			}
		}
	}, [data?.total, limit, page, setPage]);

	return (
		<PageFrame>
			<PageHeading
				title="Emails"
				description="Every email sent across the platform. Received inbound mail is under Received."
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
							setPage(1);
							setQ(draftQ.trim() || null);
						}}
					>
						<Input.Root className="w-56">
							<Input.Wrapper>
								<Input.Input
									placeholder="Search from / subject / to"
									value={draftQ}
									onChange={(e) => setDraftQ(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						<select
							className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
							value={status}
							onChange={(e) => {
								setPage(1);
								setStatus(e.target.value || null);
							}}
						>
							<option value="">All statuses</option>
							<option value="bounced">Bounced</option>
							<option value="failed">Failed</option>
							<option value="spam">Spam</option>
							<option value="sent">Sent</option>
							<option value="delivered">Delivered</option>
							<option value="pending">Pending</option>
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
									onClick={() => {
										setPage(1);
										setOrganizationId(null);
									}}
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
						"Attachments",
						"Status",
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
								<AttachmentChips
									attachments={email.attachments}
									onAttachmentClick={() => setSelectedEmailId(email.id)}
								/>
							</td>
							<td className="px-4 py-3">
								<StatusPill status={email.status} />
							</td>
							<td className="px-4 py-3">
								<Button.Root
									asChild
									size="xsmall"
									variant="neutral"
									mode="ghost"
								>
									<Link href={`/organizations/${email.organizationId}`}>
										Open hub
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
				<TablePagination
					total={data?.total ?? 0}
					page={page}
					limit={limit}
					onPageChange={(p) => setPage(p)}
					onLimitChange={(l) => {
						setLimit(l);
						setPage(1);
					}}
					isLoading={isLoading}
					itemName="emails"
				/>
			</div>

			<EmailDetailDrawer
				emailId={selectedEmailId || null}
				open={Boolean(selectedEmailId)}
				onOpenChange={(open) =>
					setSelectedEmailId(open ? selectedEmailId : null)
				}
			/>
		</PageFrame>
	);
}
