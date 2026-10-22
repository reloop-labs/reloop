"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { TablePagination } from "@fe/console/components/ui/table-pagination";
import {
	adminErrorMessage,
	adminGet,
	adminPost,
} from "@fe/console/lib/admin-api";
import { formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type SuppressionItem = {
	id: string;
	email: string;
	status: string;
	suppressionReason: "hard_bounce" | "spam_complaint" | "mailbox_full" | null;
	suppressedAt: string | null;
	updatedAt: string;
	organizationId: string;
	organizationName: string;
};

type SuppressionsResponse = { items: SuppressionItem[]; total: number };

const REASON_LABEL: Record<string, string> = {
	hard_bounce: "Hard bounce",
	spam_complaint: "Spam complaint",
	mailbox_full: "Mailbox full",
	blocked: "Blocked",
};

export default function SuppressionsPage() {
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [reason, setReason] = useQueryState(
		"reason",
		parseAsString.withDefault(""),
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit, setLimit] = useQueryState(
		"limit",
		parseAsInteger.withDefault(50),
	);
	const [draftQ, setDraftQ] = useState(q);
	const [removeTarget, setRemoveTarget] = useState<SuppressionItem | null>(
		null,
	);

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const offset = Math.max(0, (page - 1) * limit);

	const { data, isLoading, mutate } = useSWR<SuppressionsResponse>(
		["/suppressions", q, reason, page, limit],
		() =>
			adminGet<SuppressionsResponse>("/suppressions", {
				q: q || undefined,
				reason: reason || undefined,
				limit,
				offset,
			}),
	);

	return (
		<PageFrame>
			<PageHeading
				title="Suppressions"
				description="Addresses no organization can send to, after a hard bounce, full mailbox, spam complaint or manual block. Suppression is enforced platform-wide by email."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{data?.total ?? 0} suppressed
						{reason ? ` · ${REASON_LABEL[reason] ?? reason}` : ""}
					</span>
				}
				actions={
					<form
						className="flex flex-wrap gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							setQ(draftQ.trim() || null);
							setPage(1);
						}}
					>
						<Input.Root className="w-56">
							<Input.Wrapper>
								<Input.Input
									placeholder="Search email"
									value={draftQ}
									onChange={(e) => setDraftQ(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						<select
							className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
							value={reason}
							onChange={(e) => {
								setReason(e.target.value || null);
								setPage(1);
							}}
						>
							<option value="">All reasons</option>
							<option value="hard_bounce">Hard bounce</option>
							<option value="spam_complaint">Spam complaint</option>
							<option value="mailbox_full">Mailbox full</option>
							<option value="blocked">Blocked</option>
						</select>
						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

			{removeTarget ? (
				<InlineActionPanel
					title={`Remove ${removeTarget.email} from the suppression list?`}
					description="Clears the suppression for this address in every organization, so any org can send to it again. If it bounces or reports spam again it will be suppressed again."
					confirmLabel="Remove suppression"
					onCancel={() => setRemoveTarget(null)}
					onConfirm={async () => {
						try {
							const result = await adminPost<{ cleared: number }>(
								`/suppressions/${removeTarget.id}/remove`,
							);
							toast.success(
								`${removeTarget.email} removed from ${result.cleared} organization${result.cleared === 1 ? "" : "s"}`,
							);
							setRemoveTarget(null);
							mutate();
						} catch (error) {
							toast.error(adminErrorMessage(error));
						}
					}}
				/>
			) : null}

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<DataTable
					headers={["Email", "Organization", "Reason", "Suppressed", "Actions"]}
					colSpan={5}
					loading={isLoading}
					empty={!isLoading && !data?.items.length}
				>
					{data?.items.map((s) => (
						<tr
							key={s.id}
							className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
						>
							<td className="px-4 py-3 font-medium">{s.email}</td>
							<td className="px-4 py-3">
								<Link
									href={`/organizations/${s.organizationId}`}
									className="hover:underline"
								>
									{s.organizationName}
								</Link>
							</td>
							<td className="px-4 py-3">
								<StatusPill
									status={REASON_LABEL[s.suppressionReason ?? "blocked"] ?? ""}
									tone={
										s.suppressionReason === "spam_complaint" ? "red" : "orange"
									}
								/>
							</td>
							<td className="px-4 py-3 text-text-sub-600">
								{formatRelativeTime(s.suppressedAt ?? s.updatedAt)}
							</td>
							<td className="px-4 py-3">
								<Button.Root
									size="xsmall"
									variant="neutral"
									mode="ghost"
									onClick={() => setRemoveTarget(s)}
								>
									Remove
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
					itemName="suppressions"
				/>
			</div>
		</PageFrame>
	);
}
