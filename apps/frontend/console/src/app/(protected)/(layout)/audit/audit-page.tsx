"use client";

import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { SectionCard } from "@fe/console/components/ui/section-card";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet } from "@fe/console/lib/admin-api";
import {
	formatDateTime,
	formatRelativeTime,
	truncateId,
} from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";

type AuditItem = {
	id: string;
	actorUserId: string;
	actorEmail: string | null;
	actorName: string | null;
	action: string;
	resourceType: string;
	resourceId: string | null;
	organizationId: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
};

type AuditResponse = { items: AuditItem[]; total: number };

export default function AuditPage() {
	const [q, setQ] = useState("");
	const [resourceType, setResourceType] = useState("");

	const { data, isLoading } = useSWR<AuditResponse>("/audit", () =>
		adminGet<AuditResponse>("/audit", { limit: 150 }),
	);

	const filtered = useMemo(() => {
		const items = data?.items ?? [];
		const needle = q.trim().toLowerCase();
		return items.filter((item) => {
			if (resourceType && item.resourceType !== resourceType) return false;
			if (!needle) return true;
			const hay = [
				item.action,
				item.actorEmail,
				item.actorName,
				item.resourceType,
				item.resourceId,
				item.organizationId,
				item.metadata ? JSON.stringify(item.metadata) : "",
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return hay.includes(needle);
		});
	}, [data?.items, q, resourceType]);

	const resourceTypes = useMemo(() => {
		const set = new Set((data?.items ?? []).map((i) => i.resourceType));
		return Array.from(set).sort();
	}, [data?.items]);

	return (
		<PageFrame>
			<PageHeading
				title="Audit log"
				description="Every privileged console action — who did what, on which resource, and why when a reason was provided."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{data?.total ?? 0} total
					</span>
				}
				actions={
					<div className="flex flex-wrap gap-2">
						<Input.Root className="w-56">
							<Input.Wrapper>
								<Input.Input
									placeholder="Filter actor, action, id…"
									value={q}
									onChange={(e) => setQ(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						<select
							className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
							value={resourceType}
							onChange={(e) => setResourceType(e.target.value)}
						>
							<option value="">All resources</option>
							{resourceTypes.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>
				}
			/>

			<SectionCard
				title={`${filtered.length} events`}
				description={
					q || resourceType
						? "Filtered client-side from the latest load"
						: "Most recent platform admin actions"
				}
			>
				<DataTable
					headers={["When", "Actor", "Action", "Resource", "Org", "Details"]}
					colSpan={6}
					loading={isLoading}
					empty={!isLoading && filtered.length === 0}
				>
					{filtered.map((item) => (
						<tr
							key={item.id}
							className="border-stroke-soft-100 border-t align-top dark:border-stroke-soft-100/40"
						>
							<td className="whitespace-nowrap px-4 py-3 text-text-sub-600">
								<div className="font-medium text-[12px] text-text-strong-950">
									{formatRelativeTime(item.createdAt)}
								</div>
								<div className="text-[11px] text-text-soft-400">
									{formatDateTime(item.createdAt)}
								</div>
							</td>
							<td className="px-4 py-3">
								<p className="font-medium text-[13px]">
									{item.actorName || truncateId(item.actorUserId, 12)}
								</p>
								<p className="text-[12px] text-text-sub-600">
									{item.actorEmail || "—"}
								</p>
							</td>
							<td className="px-4 py-3">
								<code className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[11px] dark:bg-white/[0.06]">
									{item.action}
								</code>
							</td>
							<td className="px-4 py-3">
								<div className="flex flex-wrap items-center gap-1.5">
									<StatusPill status={item.resourceType} tone="blue" />
								</div>
								<p className="mt-1 font-mono text-[11px] text-text-sub-600">
									{item.resourceId ? truncateId(item.resourceId, 16) : "—"}
								</p>
							</td>
							<td className="px-4 py-3">
								{item.organizationId ? (
									<Button.Root
										asChild
										size="xsmall"
										variant="neutral"
										mode="ghost"
									>
										<Link href={`/organizations/${item.organizationId}`}>
											Open hub
										</Link>
									</Button.Root>
								) : (
									<span className="text-text-soft-400">—</span>
								)}
							</td>
							<td className="max-w-[240px] px-4 py-3 text-[12px] text-text-sub-600">
								{item.metadata ? (
									<pre className="max-h-20 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed">
										{JSON.stringify(item.metadata, null, 0)}
									</pre>
								) : (
									"—"
								)}
							</td>
						</tr>
					))}
				</DataTable>
			</SectionCard>
		</PageFrame>
	);
}
