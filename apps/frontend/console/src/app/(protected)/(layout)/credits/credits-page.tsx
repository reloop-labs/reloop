"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import { MetricGrid } from "@fe/console/components/ui/metric-grid";
import {
	Breadcrumb,
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { SectionCard } from "@fe/console/components/ui/section-card";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet, adminPost } from "@fe/console/lib/admin-api";
import {
	formatDateTime,
	formatNumber,
	formatRelativeTime,
} from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type CreditsDetail = {
	balance: {
		organizationId: string;
		organizationName: string;
		creditsUsed: number;
		creditsRemaining: number;
		monthlyCredits: number;
		status: string;
		currentPeriodStart: string;
		currentPeriodEnd: string;
	} | null;
	ledger: Array<{
		id: string;
		entryType: string;
		delta: number;
		balanceAfter: number;
		reason: string | null;
		createdAt: string;
	}>;
};

type SearchResponse = {
	organizations: Array<{
		id: string;
		name: string;
		slug: string;
		status: string;
	}>;
};

export default function CreditsPage() {
	const [organizationId, setOrganizationId] = useQueryState(
		"organizationId",
		parseAsString.withDefault(""),
	);
	const [searchQ, setSearchQ] = useState("");
	const [topupOpen, setTopupOpen] = useState(false);
	const [amount, setAmount] = useState("1000");
	const [reason, setReason] = useState("");

	const { data: searchData } = useSWR(
		searchQ.trim().length >= 1 ? ["credits-org-search", searchQ] : null,
		() =>
			adminGet<SearchResponse>("/search", {
				q: searchQ.trim(),
				limit: 8,
			}),
	);

	const { data, isLoading, mutate } = useSWR<CreditsDetail>(
		organizationId ? `/credits/${organizationId}` : null,
		() => adminGet<CreditsDetail>(`/credits/${organizationId}`),
	);

	useEffect(() => {
		if (organizationId) setSearchQ("");
	}, [organizationId]);

	return (
		<PageFrame>
			<PageHeading
				eyebrow={
					organizationId ? (
						<Breadcrumb
							items={[
								{ label: "Organizations", href: "/organizations" },
								{
									label: data?.balance?.organizationName || "Credits",
									href: `/organizations/${organizationId}`,
								},
								{ label: "Ledger" },
							]}
						/>
					) : (
						<span className="text-[12px] text-text-sub-600">
							Utility view · prefer org hub for daily work
						</span>
					)
				}
				title="Credits ledger"
				description="Balances and top-ups for a single organization. From day to day, open the org hub — this page is the deep-link ledger."
				actions={
					organizationId ? (
						<>
							<Button.Root asChild variant="neutral" mode="stroke" size="small">
								<Link href={`/organizations/${organizationId}`}>Org hub</Link>
							</Button.Root>
							<Button.Root
								variant="primary"
								size="small"
								onClick={() => setTopupOpen(true)}
							>
								Top up
							</Button.Root>
						</>
					) : null
				}
			/>

			{topupOpen && organizationId ? (
				<InlineActionPanel
					title="Top up credits"
					description={`Add credits to ${data?.balance?.organizationName || organizationId}. This is audit-logged.`}
					confirmLabel="Top up"
					onCancel={() => setTopupOpen(false)}
					onConfirm={async () => {
						const parsed = Number(amount);
						if (!Number.isFinite(parsed) || parsed <= 0) {
							toast.error("Enter a positive amount");
							throw new Error("invalid");
						}
						await adminPost("/credits/topup", {
							organizationId,
							amount: parsed,
							reason: reason || "Manual top-up from admin",
						});
						toast.success(`Added ${parsed} credits`);
						setTopupOpen(false);
						mutate();
					}}
				>
					<div className="grid gap-2 sm:grid-cols-2">
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									type="number"
									min={1}
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="Amount"
								/>
							</Input.Wrapper>
						</Input.Root>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Reason (optional)"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</InlineActionPanel>
			) : null}

			<SectionCard
				title="Find organization"
				description="Search by name or slug, or paste an organization ID"
			>
				<div className="space-y-3 p-4">
					<div className="flex flex-wrap gap-2">
						<Input.Root className="min-w-[240px] flex-1">
							<Input.Wrapper>
								<Input.Input
									placeholder="Search organizations…"
									value={searchQ}
									onChange={(e) => setSearchQ(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						{organizationId ? (
							<Button.Root
								variant="neutral"
								mode="stroke"
								onClick={() => setOrganizationId(null)}
							>
								Clear
							</Button.Root>
						) : null}
					</div>

					{searchQ.trim() && (searchData?.organizations.length ?? 0) > 0 ? (
						<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
							{searchData!.organizations.map((org) => (
								<button
									key={org.id}
									type="button"
									onClick={() => {
										setOrganizationId(org.id);
										setSearchQ("");
									}}
									className="flex w-full items-center justify-between gap-3 border-stroke-soft-100 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.03]"
								>
									<div className="min-w-0">
										<p className="truncate font-medium text-[13px]">{org.name}</p>
										<p className="truncate text-[12px] text-text-sub-600">
											{org.slug}
										</p>
									</div>
									<StatusPill status={org.status} />
								</button>
							))}
						</div>
					) : null}

					{searchQ.trim() && searchData && searchData.organizations.length === 0 ? (
						<p className="text-[12px] text-text-sub-600">No organizations match.</p>
					) : null}
				</div>
			</SectionCard>

			{!organizationId ? (
				<div className="rounded-2xl border border-dashed border-stroke-soft-200 px-4 py-12 text-center">
					<p className="font-medium text-[13px] text-text-strong-950">
						No organization selected
					</p>
					<p className="mx-auto mt-1 max-w-md text-[12px] text-text-sub-600">
						Search above, or open an organization hub and use{" "}
						<span className="font-medium">Ledger</span> /{" "}
						<span className="font-medium">Top up credits</span>.
					</p>
					<div className="mt-4">
						<Button.Root asChild variant="neutral" mode="stroke" size="small">
							<Link href="/organizations">Browse organizations</Link>
						</Button.Root>
					</div>
				</div>
			) : isLoading ? (
				<p className="text-[13px] text-text-sub-600">Loading ledger…</p>
			) : (
				<>
					{data?.balance ? (
						<>
							<MetricGrid
								items={[
									{
										label: "Organization",
										value: data.balance.organizationName,
										href: `/organizations/${data.balance.organizationId}`,
									},
									{
										label: "Remaining",
										value: formatNumber(data.balance.creditsRemaining),
										tone: "success",
									},
									{
										label: "Used",
										value: formatNumber(data.balance.creditsUsed),
									},
									{
										label: "Monthly allotment",
										value: formatNumber(data.balance.monthlyCredits),
										hint: `Status: ${data.balance.status}`,
									},
								]}
							/>
							<p className="text-[12px] text-text-sub-600">
								Period {formatDateTime(data.balance.currentPeriodStart)} →{" "}
								{formatDateTime(data.balance.currentPeriodEnd)}
							</p>
						</>
					) : (
						<div className="rounded-2xl border border-stroke-soft-100 px-4 py-8 text-center text-[13px] text-text-sub-600 dark:border-stroke-soft-100/40">
							No credits record for this organization yet.
						</div>
					)}

					<SectionCard
						title="Ledger"
						description="Manual top-ups and usage entries"
					>
						<DataTable
							headers={["When", "Type", "Delta", "Balance after", "Reason"]}
							colSpan={5}
							empty={(data?.ledger ?? []).length === 0}
						>
							{(data?.ledger ?? []).map((entry) => (
								<tr
									key={entry.id}
									className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
								>
									<td className="whitespace-nowrap px-4 py-3 text-text-sub-600">
										{formatRelativeTime(entry.createdAt)}
									</td>
									<td className="px-4 py-3">
										<code className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[11px] dark:bg-white/[0.06]">
											{entry.entryType}
										</code>
									</td>
									<td
										className={`px-4 py-3 font-medium tabular-nums ${
											entry.delta > 0
												? "text-emerald-600 dark:text-emerald-400"
												: entry.delta < 0
													? "text-error-base"
													: ""
										}`}
									>
										{entry.delta > 0 ? `+${entry.delta}` : entry.delta}
									</td>
									<td className="px-4 py-3 tabular-nums">
										{formatNumber(entry.balanceAfter)}
									</td>
									<td className="px-4 py-3 text-text-sub-600">
										{entry.reason || "—"}
									</td>
								</tr>
							))}
						</DataTable>
					</SectionCard>
				</>
			)}
		</PageFrame>
	);
}
