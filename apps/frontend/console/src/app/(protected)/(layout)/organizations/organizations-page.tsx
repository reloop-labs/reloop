"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet, adminPatch } from "@fe/console/lib/admin-api";
import { formatNumber, formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type OrgItem = {
	id: string;
	name: string;
	slug: string;
	status: string;
	memberCount: number;
	domainCount: number;
	creditsRemaining: number | null;
	billingEmail: string | null;
	createdAt: string;
};

type OrgsResponse = { items: OrgItem[]; total: number };

export default function OrganizationsPage() {
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [draftQ, setDraftQ] = useState(q);
	const [suspendTarget, setSuspendTarget] = useState<OrgItem | null>(null);

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const { data, isLoading, mutate } = useSWR<OrgsResponse>(
		["/organizations", q, status],
		() =>
			adminGet<OrgsResponse>("/organizations", {
				q: q || undefined,
				status: status || undefined,
				limit: 50,
			}),
	);

	return (
		<PageFrame>
			<PageHeading
				title="Organizations"
				description="Open any row for the full hub — members, domains, API keys, templates, emails, webhooks, support, and audit."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{data?.total ?? 0} total
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
									placeholder="Search name or slug"
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
							<option value="suspended">Suspended</option>
							<option value="deleted">Deleted</option>
						</select>
						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

			{suspendTarget ? (
				<InlineActionPanel
					title={`Suspend ${suspendTarget.name}?`}
					description="Members will lose access until reactivated. This action is audit-logged."
					confirmLabel="Suspend organization"
					destructive
					onCancel={() => setSuspendTarget(null)}
					onConfirm={async () => {
						try {
							await adminPatch(`/organizations/${suspendTarget.id}/status`, {
								status: "suspended",
								reason: "Suspended by platform admin",
							});
							toast.success("Organization suspended");
							setSuspendTarget(null);
							mutate();
						} catch {
							toast.error("Failed to suspend organization");
						}
					}}
				/>
			) : null}

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<DataTable
					headers={[
						"Organization",
						"Status",
						"Members",
						"Domains",
						"Credits",
						"Created",
						"Actions",
					]}
					colSpan={7}
					loading={isLoading}
					empty={!isLoading && !data?.items.length}
				>
					{data?.items.map((org) => (
						<tr
							key={org.id}
							className="border-stroke-soft-100 border-t transition-colors hover:bg-bg-weak-50/80 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.02]"
						>
							<td className="px-4 py-3">
								<Link
									href={`/organizations/${org.id}`}
									className="font-medium text-text-strong-950 hover:underline"
								>
									{org.name}
								</Link>
								<p className="text-[12px] text-text-sub-600">
									{org.slug}
									{org.billingEmail ? ` · ${org.billingEmail}` : ""}
								</p>
							</td>
							<td className="px-4 py-3">
								<StatusPill status={org.status} />
							</td>
							<td className="px-4 py-3 tabular-nums">{org.memberCount}</td>
							<td className="px-4 py-3 tabular-nums">{org.domainCount}</td>
							<td className="px-4 py-3 tabular-nums">
								{formatNumber(org.creditsRemaining)}
							</td>
							<td className="px-4 py-3 text-text-sub-600">
								{formatRelativeTime(org.createdAt)}
							</td>
							<td className="px-4 py-3">
								<div className="flex flex-wrap gap-1.5">
									<Button.Root
										asChild
										size="xsmall"
										variant="neutral"
										mode="stroke"
									>
										<Link href={`/organizations/${org.id}`}>Open hub</Link>
									</Button.Root>
									{org.status === "suspended" ? (
										<Button.Root
											size="xsmall"
											variant="neutral"
											mode="ghost"
											onClick={async () => {
												try {
													await adminPatch(`/organizations/${org.id}/status`, {
														status: "active",
														reason: "Reactivated by admin",
													});
													toast.success("Organization reactivated");
													mutate();
												} catch {
													toast.error("Failed to reactivate organization");
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
											onClick={() => setSuspendTarget(org)}
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
