"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import { EntityTabs } from "@fe/console/components/ui/entity-tabs";
import { MetricGrid } from "@fe/console/components/ui/metric-grid";
import {
	Breadcrumb,
	DataTable,
	EmptyState,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { SectionCard } from "@fe/console/components/ui/section-card";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import {
	formatDateTime,
	formatNumber,
	formatRecipients,
	formatRelativeTime,
	truncateId,
} from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type OrgDetail = {
	id: string;
	name: string;
	slug: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	billingEmail: string | null;
	billingName: string | null;
	logo: string | null;
	externalCustomerId: string | null;
	counts: {
		members: number;
		domains: number;
		apiKeys: number;
		templates: number;
		webhooks: number;
		emails: number;
		supportThreads: number;
	};
	emailStats: {
		today: { sent: number; failed: number; bounced: number; delivered: number };
		week: { sent: number; failed: number; bounced: number; delivered: number };
	};
	credits: {
		creditsUsed: number;
		creditsRemaining: number;
		monthlyCredits: number;
		status: string;
		currentPeriodStart: string;
		currentPeriodEnd: string;
	} | null;
	members: Array<{
		id: string;
		role: string;
		userId: string;
		userName: string;
		userEmail: string;
		userImage: string | null;
		userBanned: boolean;
		userRole: string;
		createdAt: string;
	}>;
	domains: Array<{
		id: string;
		domain: string;
		status: string;
		systemVerified: boolean;
		createdAt: string;
	}>;
	apiKeys: Array<{
		id: string;
		name: string | null;
		prefix: string | null;
		start: string | null;
		enabled: boolean;
		userId: string;
		userEmail: string;
		requestCount: number;
		lastRequest: string | null;
		expiresAt: string | null;
		createdAt: string;
	}>;
	templates: Array<{
		id: string;
		name: string;
		status: string;
		subject: string | null;
		fromEmail: string | null;
		currentVersion: number;
		updatedAt: string;
		createdAt: string;
	}>;
	webhooks: Array<{
		id: string;
		name: string;
		url: string;
		status: string;
		createdAt: string;
		updatedAt: string;
	}>;
	recentEmails: Array<{
		id: string;
		fromEmail: string;
		toEmails: unknown;
		subject: string;
		status: string;
		createdAt: string;
		sentAt: string | null;
	}>;
	supportConversations: Array<{
		id: string;
		userId: string;
		status: "open" | "closed";
		lastMessageAt: string;
		lastMessagePreview: string | null;
		createdAt: string;
		userName: string | null;
		userEmail: string | null;
	}>;
	recentAudit: Array<{
		id: string;
		actorUserId: string;
		actorEmail: string | null;
		actorName: string | null;
		action: string;
		resourceType: string;
		resourceId: string | null;
		metadata: unknown;
		createdAt: string;
	}>;
};

const TABS = [
	{ id: "overview", label: "Overview" },
	{ id: "members", label: "Members" },
	{ id: "domains", label: "Domains" },
	{ id: "api-keys", label: "API keys" },
	{ id: "templates", label: "Templates" },
	{ id: "emails", label: "Emails" },
	{ id: "webhooks", label: "Webhooks" },
	{ id: "support", label: "Support" },
	{ id: "audit", label: "Audit" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function OrganizationDetailPage() {
	const params = useParams<{ orgId: string }>();
	const orgId = params.orgId;
	const [tab, setTab] = useState<TabId>("overview");
	const [suspendOpen, setSuspendOpen] = useState(false);
	const [topupOpen, setTopupOpen] = useState(false);
	const [topupAmount, setTopupAmount] = useState("1000");
	const [topupReason, setTopupReason] = useState("");

	const { data, isLoading, error, mutate } = useSWR<OrgDetail>(
		orgId ? `/organizations/${orgId}` : null,
		() => adminGet<OrgDetail>(`/organizations/${orgId}`),
	);

	const tabs = useMemo(() => {
		if (!data) return TABS.map((t) => ({ ...t }));
		const counts: Record<string, number> = {
			members: data.counts.members,
			domains: data.counts.domains,
			"api-keys": data.counts.apiKeys,
			templates: data.counts.templates,
			emails: data.counts.emails,
			webhooks: data.counts.webhooks,
			support: data.counts.supportThreads,
			audit: data.recentAudit.length,
		};
		return TABS.map((t) => ({
			id: t.id,
			label: t.label,
			count: counts[t.id],
		}));
	}, [data]);

	if (isLoading) {
		return (
			<PageFrame>
				<p className="text-paragraph-sm text-text-sub-600">Loading organization…</p>
			</PageFrame>
		);
	}

	if (error || !data) {
		return (
			<PageFrame>
				<p className="text-error-base text-paragraph-sm">
					Couldn’t load this organization.
				</p>
				<Button.Root asChild variant="neutral" mode="stroke" size="small">
					<Link href="/organizations">Back to organizations</Link>
				</Button.Root>
			</PageFrame>
		);
	}

	return (
		<PageFrame className="space-y-5">
			<PageHeading
				eyebrow={
					<Breadcrumb
						items={[
							{ label: "Organizations", href: "/organizations" },
							{ label: data.slug },
						]}
					/>
				}
				title={data.name}
				meta={
					<>
						<StatusPill status={data.status} />
						<span className="font-mono text-[12px] text-text-sub-600">
							{data.slug}
						</span>
					</>
				}
				description={
					<div className="flex flex-wrap gap-x-4 gap-y-1">
						<span>Created {formatDateTime(data.createdAt)}</span>
						{data.billingEmail ? <span>Billing {data.billingEmail}</span> : null}
						{data.externalCustomerId ? (
							<span className="font-mono">
								Customer {truncateId(data.externalCustomerId, 14)}
							</span>
						) : null}
					</div>
				}
				actions={
					<>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => setTopupOpen(true)}
						>
							Top up credits
						</Button.Root>
						<Button.Root asChild variant="neutral" mode="stroke" size="small">
							<Link href={`/emails?organizationId=${data.id}`}>All emails</Link>
						</Button.Root>
						<Button.Root asChild variant="neutral" mode="stroke" size="small">
							<Link href={`/credits?organizationId=${data.id}`}>Ledger</Link>
						</Button.Root>
						{data.status === "suspended" ? (
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={async () => {
									await adminPatch(`/organizations/${data.id}/status`, {
										status: "active",
										reason: "Reactivated by admin",
									});
									toast.success("Organization reactivated");
									mutate();
								}}
							>
								Reactivate
							</Button.Root>
						) : (
							<Button.Root
								variant="error"
								mode="stroke"
								size="small"
								onClick={() => setSuspendOpen(true)}
							>
								Suspend
							</Button.Root>
						)}
					</>
				}
			/>

			{suspendOpen ? (
				<InlineActionPanel
					title={`Suspend ${data.name}?`}
					description="Members will lose access until reactivated. This action is audit-logged."
					confirmLabel="Suspend organization"
					destructive
					onCancel={() => setSuspendOpen(false)}
					onConfirm={async () => {
						await adminPatch(`/organizations/${data.id}/status`, {
							status: "suspended",
							reason: "Suspended by platform admin",
						});
						toast.success("Organization suspended");
						setSuspendOpen(false);
						mutate();
					}}
				/>
			) : null}

			{topupOpen ? (
				<InlineActionPanel
					title="Top up credits"
					description="Add credits to this organization. This action is audit-logged."
					confirmLabel="Top up"
					onCancel={() => setTopupOpen(false)}
					onConfirm={async () => {
						const amount = Number(topupAmount);
						if (!Number.isFinite(amount) || amount <= 0) {
							toast.error("Enter a positive amount");
							throw new Error("invalid amount");
						}
						await adminPost("/credits/topup", {
							organizationId: data.id,
							amount,
							reason: topupReason || "Manual top-up from admin",
						});
						toast.success(`Added ${amount} credits`);
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
									value={topupAmount}
									onChange={(e) => setTopupAmount(e.target.value)}
									placeholder="Amount"
								/>
							</Input.Wrapper>
						</Input.Root>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									value={topupReason}
									onChange={(e) => setTopupReason(e.target.value)}
									placeholder="Reason (optional)"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</InlineActionPanel>
			) : null}

			<MetricGrid
				items={[
					{
						label: "Credits left",
						value: formatNumber(data.credits?.creditsRemaining),
						hint: data.credits
							? `${formatNumber(data.credits.creditsUsed)} used · ${formatNumber(data.credits.monthlyCredits)} monthly`
							: "Not provisioned",
						href: `/credits?organizationId=${data.id}`,
					},
					{
						label: "Members",
						value: data.counts.members,
						hint: "Click Members tab",
					},
					{
						label: "Domains",
						value: data.counts.domains,
						hint: `${data.domains.filter((d) => d.status === "active").length} active`,
						tone: data.domains.some((d) => d.status === "failed")
							? "danger"
							: "default",
					},
					{
						label: "Emails today",
						value:
							data.emailStats.today.sent +
							data.emailStats.today.delivered +
							data.emailStats.today.failed +
							data.emailStats.today.bounced,
						hint: `${data.emailStats.today.failed} failed · ${data.emailStats.today.bounced} bounced`,
						tone:
							data.emailStats.today.failed > 0 ||
							data.emailStats.today.bounced > 0
								? "warning"
								: "default",
					},
					{
						label: "API keys",
						value: data.counts.apiKeys,
						hint: `${data.apiKeys.filter((k) => k.enabled).length} enabled`,
					},
					{
						label: "Templates",
						value: data.counts.templates,
					},
					{
						label: "Webhooks",
						value: data.counts.webhooks,
					},
					{
						label: "Support threads",
						value: data.counts.supportThreads,
						href: "/support",
					},
				]}
			/>

			<EntityTabs
				tabs={tabs}
				active={tab}
				onChange={(id) => setTab(id as TabId)}
			/>

			{tab === "overview" ? (
				<div className="grid gap-4 lg:grid-cols-2">
					<SectionCard title="Organization profile">
						<div className="divide-y divide-stroke-soft-100 px-4 py-1 dark:divide-stroke-soft-100/40">
							{[
								["Name", data.name],
								["Slug", data.slug],
								["Status", data.status],
								["Billing email", data.billingEmail || "—"],
								["Billing name", data.billingName || "—"],
								["External customer", data.externalCustomerId || "—"],
								["Org ID", data.id],
								["Created", formatDateTime(data.createdAt)],
								["Updated", formatDateTime(data.updatedAt)],
							].map(([label, value]) => (
								<div
									key={label as string}
									className="flex items-start justify-between gap-4 py-2.5"
								>
									<span className="text-[12px] text-text-sub-600">{label}</span>
									<span className="max-w-[60%] break-all text-right font-medium text-[12px] text-text-strong-950">
										{value}
									</span>
								</div>
							))}
						</div>
					</SectionCard>

					<SectionCard
						title="Credits"
						action={
							<button
								type="button"
								className="text-[12px] text-primary-base hover:underline"
								onClick={() => setTopupOpen(true)}
							>
								Top up
							</button>
						}
					>
						{data.credits ? (
							<div className="grid grid-cols-3 gap-3 p-4">
								<div>
									<p className="text-[11px] text-text-sub-600">Remaining</p>
									<p className="mt-1 font-semibold text-[20px] tabular-nums">
										{formatNumber(data.credits.creditsRemaining)}
									</p>
								</div>
								<div>
									<p className="text-[11px] text-text-sub-600">Used</p>
									<p className="mt-1 font-semibold text-[20px] tabular-nums">
										{formatNumber(data.credits.creditsUsed)}
									</p>
								</div>
								<div>
									<p className="text-[11px] text-text-sub-600">Monthly</p>
									<p className="mt-1 font-semibold text-[20px] tabular-nums">
										{formatNumber(data.credits.monthlyCredits)}
									</p>
								</div>
								<div className="col-span-3 text-[12px] text-text-sub-600">
									Period {formatDateTime(data.credits.currentPeriodStart)} →{" "}
									{formatDateTime(data.credits.currentPeriodEnd)} · status{" "}
									{data.credits.status}
								</div>
							</div>
						) : (
							<EmptyState title="No credits provisioned" />
						)}
					</SectionCard>

					<SectionCard
						title="Delivery (7 days)"
						className="lg:col-span-2"
						description="Volume by status for the last week"
					>
						<div className="grid gap-3 p-4 sm:grid-cols-4">
							{(
								[
									["Sent", data.emailStats.week.sent],
									["Delivered", data.emailStats.week.delivered],
									["Failed", data.emailStats.week.failed],
									["Bounced", data.emailStats.week.bounced],
								] as const
							).map(([label, value]) => (
								<div
									key={label}
									className="rounded-xl bg-bg-weak-50 px-3 py-3 dark:bg-white/[0.04]"
								>
									<p className="text-[11px] text-text-sub-600">{label}</p>
									<p className="mt-1 font-semibold text-[18px] tabular-nums">
										{formatNumber(value)}
									</p>
								</div>
							))}
						</div>
					</SectionCard>

					<SectionCard
						title="Recent members"
						action={
							<button
								type="button"
								className="text-[12px] text-primary-base hover:underline"
								onClick={() => setTab("members")}
							>
								View all
							</button>
						}
					>
						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
							{data.members.slice(0, 5).map((m) => (
								<Link
									key={m.id}
									href={`/users/${m.userId}`}
									className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
								>
									<div className="min-w-0">
										<p className="truncate font-medium text-[13px]">
											{m.userName}
										</p>
										<p className="truncate text-[12px] text-text-sub-600">
											{m.userEmail}
										</p>
									</div>
									<StatusPill status={m.role} />
								</Link>
							))}
							{data.members.length === 0 ? (
								<EmptyState title="No members" />
							) : null}
						</div>
					</SectionCard>

					<SectionCard
						title="Recent emails"
						action={
							<button
								type="button"
								className="text-[12px] text-primary-base hover:underline"
								onClick={() => setTab("emails")}
							>
								View all
							</button>
						}
					>
						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
							{data.recentEmails.slice(0, 6).map((e) => (
								<div key={e.id} className="px-4 py-3">
									<div className="flex items-center justify-between gap-2">
										<p className="truncate font-medium text-[13px]">
											{e.subject || "(no subject)"}
										</p>
										<StatusPill status={e.status} />
									</div>
									<p className="mt-0.5 truncate text-[12px] text-text-sub-600">
										{e.fromEmail} · {formatRelativeTime(e.createdAt)}
									</p>
								</div>
							))}
							{data.recentEmails.length === 0 ? (
								<EmptyState title="No emails yet" />
							) : null}
						</div>
					</SectionCard>
				</div>
			) : null}

			{tab === "members" ? (
				<SectionCard
					title={`Members (${data.members.length})`}
					description="Everyone with access to this organization"
				>
					<DataTable
						headers={["User", "Org role", "Platform", "Status", "Joined", ""]}
						colSpan={6}
						empty={data.members.length === 0}
					>
						{data.members.map((m) => (
							<tr
								key={m.id}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="px-4 py-3">
									<Link
										href={`/users/${m.userId}`}
										className="font-medium hover:underline"
									>
										{m.userName}
									</Link>
									<p className="text-[12px] text-text-sub-600">{m.userEmail}</p>
								</td>
								<td className="px-4 py-3">
									<StatusPill status={m.role} />
								</td>
								<td className="px-4 py-3">
									<StatusPill status={m.userRole} />
								</td>
								<td className="px-4 py-3">
									<StatusPill status={m.userBanned ? "banned" : "active"} />
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatRelativeTime(m.createdAt)}
								</td>
								<td className="px-4 py-3 text-right">
									<Button.Root asChild size="xsmall" variant="neutral" mode="ghost">
										<Link href={`/users/${m.userId}`}>Open hub</Link>
									</Button.Root>
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "domains" ? (
				<SectionCard
					title={`Domains (${data.domains.length})`}
					description="Sending domains attached to this org"
				>
					<DataTable
						headers={["Domain", "Status", "Verified", "Created"]}
						colSpan={4}
						empty={data.domains.length === 0}
					>
						{data.domains.map((d) => (
							<tr
								key={d.id}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="px-4 py-3 font-medium">{d.domain}</td>
								<td className="px-4 py-3">
									<StatusPill status={d.status} />
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{d.systemVerified ? "Yes" : "No"}
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatRelativeTime(d.createdAt)}
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "api-keys" ? (
				<SectionCard
					title={`API keys (${data.apiKeys.length})`}
					description="Keys used for programmatic send access (secret values never shown)"
				>
					<DataTable
						headers={[
							"Name",
							"Prefix",
							"Owner",
							"Enabled",
							"Requests",
							"Last used",
							"Created",
						]}
						colSpan={7}
						empty={data.apiKeys.length === 0}
					>
						{data.apiKeys.map((k) => (
							<tr
								key={k.id}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="px-4 py-3 font-medium">{k.name || "—"}</td>
								<td className="px-4 py-3 font-mono text-[12px] text-text-sub-600">
									{k.prefix || k.start || truncateId(k.id, 12)}
								</td>
								<td className="px-4 py-3">
									<Link
										href={`/users/${k.userId}`}
										className="hover:underline"
									>
										{k.userEmail}
									</Link>
								</td>
								<td className="px-4 py-3">
									<StatusPill status={k.enabled ? "enabled" : "disabled"} />
								</td>
								<td className="px-4 py-3 tabular-nums">
									{formatNumber(k.requestCount)}
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatRelativeTime(k.lastRequest)}
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatRelativeTime(k.createdAt)}
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "templates" ? (
				<SectionCard
					title={`Templates (${data.templates.length})`}
					description="Email templates in this organization"
				>
					<DataTable
						headers={["Name", "Status", "Subject", "From", "Version", "Updated"]}
						colSpan={6}
						empty={data.templates.length === 0}
					>
						{data.templates.map((t) => (
							<tr
								key={t.id}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="px-4 py-3 font-medium">{t.name}</td>
								<td className="px-4 py-3">
									<StatusPill status={t.status} />
								</td>
								<td className="max-w-[220px] truncate px-4 py-3 text-text-sub-600">
									{t.subject || "—"}
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{t.fromEmail || "—"}
								</td>
								<td className="px-4 py-3 tabular-nums">v{t.currentVersion}</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatRelativeTime(t.updatedAt)}
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "emails" ? (
				<SectionCard
					title="Recent emails"
					description="Latest 40 messages for this organization"
					action={
						<Link
							href={`/emails?organizationId=${data.id}`}
							className="text-[12px] text-primary-base hover:underline"
						>
							Open emails explorer →
						</Link>
					}
				>
					<DataTable
						headers={["When", "From", "To", "Subject", "Status"]}
						colSpan={5}
						empty={data.recentEmails.length === 0}
					>
						{data.recentEmails.map((e) => (
							<tr
								key={e.id}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="whitespace-nowrap px-4 py-3 text-text-sub-600">
									{formatRelativeTime(e.createdAt)}
								</td>
								<td className="px-4 py-3">{e.fromEmail}</td>
								<td className="max-w-[160px] truncate px-4 py-3 text-text-sub-600">
									{formatRecipients(e.toEmails)}
								</td>
								<td className="max-w-[220px] truncate px-4 py-3">
									{e.subject}
								</td>
								<td className="px-4 py-3">
									<StatusPill status={e.status} />
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "webhooks" ? (
				<SectionCard
					title={`Webhooks (${data.webhooks.length})`}
					description="Delivery event endpoints"
				>
					<DataTable
						headers={["Name", "URL", "Status", "Updated"]}
						colSpan={4}
						empty={data.webhooks.length === 0}
					>
						{data.webhooks.map((w) => (
							<tr
								key={w.id}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="px-4 py-3 font-medium">{w.name}</td>
								<td className="max-w-[320px] truncate px-4 py-3 font-mono text-[12px] text-text-sub-600">
									{w.url}
								</td>
								<td className="px-4 py-3">
									<StatusPill status={w.status} />
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatRelativeTime(w.updatedAt)}
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "support" ? (
				<SectionCard
					title={`Support (${data.supportConversations.length})`}
					description="Threads linked to this organization"
				>
					{data.supportConversations.length === 0 ? (
						<EmptyState title="No support threads for this org" />
					) : (
						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
							{data.supportConversations.map((t) => (
								<Link
									key={t.id}
									href={`/support?c=${t.id}`}
									className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
								>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<StatusPill status={t.status} />
											<span className="text-[12px] text-text-sub-600">
												{t.userEmail || t.userName || t.userId}
											</span>
											<span className="text-[12px] text-text-soft-400">
												{formatRelativeTime(t.lastMessageAt)}
											</span>
										</div>
										<p className="mt-1 truncate text-[13px] text-text-strong-950">
											{t.lastMessagePreview || "No preview"}
										</p>
									</div>
									<span className="shrink-0 text-[12px] text-text-sub-600">
										Open →
									</span>
								</Link>
							))}
						</div>
					)}
				</SectionCard>
			) : null}

			{tab === "audit" ? (
				<SectionCard
					title="Admin audit for this org"
					description="Privileged actions that touched this organization"
					action={
						<Link href="/audit" className="text-[12px] text-primary-base hover:underline">
							Full audit log →
						</Link>
					}
				>
					<DataTable
						headers={["When", "Actor", "Action", "Resource"]}
						colSpan={4}
						empty={data.recentAudit.length === 0}
					>
						{data.recentAudit.map((row) => (
							<tr
								key={row.id}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="whitespace-nowrap px-4 py-3 text-text-sub-600">
									{formatRelativeTime(row.createdAt)}
								</td>
								<td className="px-4 py-3">
									{row.actorEmail || row.actorName || row.actorUserId}
								</td>
								<td className="px-4 py-3 font-medium">{row.action}</td>
								<td className="px-4 py-3 text-text-sub-600">
									{row.resourceType}
									{row.resourceId ? ` · ${truncateId(row.resourceId)}` : ""}
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}
		</PageFrame>
	);
}
