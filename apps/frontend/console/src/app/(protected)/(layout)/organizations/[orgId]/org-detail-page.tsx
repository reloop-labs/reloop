"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import { AttachmentChips } from "@fe/console/components/ui/attachment-chips";
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
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { OrgSendingIps } from "./org-sending-ips";

const PLAN_LABEL: Record<string, string> = {
	free: "Free",
	individual: "Pro",
	startup: "Growth",
	enterprise: "Enterprise",
};
function planLabel(planId?: string | null): string {
	return PLAN_LABEL[planId ?? "free"] ?? planId ?? "Free";
}

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
		mailboxes: number;
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
	plan: {
		planId: string;
		monthlyEmails: number;
		dailyEmailLimit: number | null;
		overageEnabled: boolean;
		maxAgentInboxes: number;
		maxWebhooks: number;
		maxCustomDomains: number;
		maxAttachmentBytes: number;
		dataRetentionDays: number;
		dedicatedIpCount: number;
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
		registrarCreatedAt: string | null;
		ageDays: number;
		dailyCap: number | null;
		sentToday: number;
		remaining: number | null;
		source: string;
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
	mailboxes: Array<{
		id: string;
		email: string;
		displayName: string | null;
		status: string;
		domain: string | null;
		createdAt: string;
	}>;
	recentEmails: Array<{
		id: string;
		fromEmail: string;
		toEmails: unknown;
		subject: string;
		status: string;
		createdAt: string;
		sentAt: string | null;
		attachments?: Array<{
			id: string;
			filename: string;
			contentType: string;
			size: number;
		}>;
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
	{ id: "dedicated-ips", label: "Dedicated IPs" },
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
	const router = useRouter();
	const [tab, setTab] = useState<TabId>("overview");
	const [suspendOpen, setSuspendOpen] = useState(false);
	const [topupOpen, setTopupOpen] = useState(false);
	const [topupAmount, setTopupAmount] = useState("1000");
	const [topupReason, setTopupReason] = useState("");
	const [convertOpen, setConvertOpen] = useState(false);
	const [convertMode, setConvertMode] = useState<"comped" | "paid">("comped");
	const [convertReason, setConvertReason] = useState("");

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
				<p className="text-paragraph-sm text-text-sub-600">
					Loading organization…
				</p>
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
						<StatusPill
							status={planLabel(data.plan?.planId)}
							tone={
								data.plan?.planId === "individual" ||
								data.plan?.planId === "startup" ||
								data.plan?.planId === "enterprise"
									? "green"
									: "gray"
							}
						/>
						<span className="font-mono text-[12px] text-text-sub-600">
							{data.slug}
						</span>
					</>
				}
				description={
					<div className="flex flex-wrap gap-x-4 gap-y-1">
						<span>Created {formatDateTime(data.createdAt)}</span>
						{data.billingEmail ? (
							<span>Billing {data.billingEmail}</span>
						) : null}
						{data.externalCustomerId ? (
							<span className="font-mono">
								Customer {truncateId(data.externalCustomerId, 14)}
							</span>
						) : null}
					</div>
				}
				actions={
					<>
						{(() => {
							const isPro =
								data.plan?.planId === "individual" ||
								data.plan?.planId === "startup" ||
								data.plan?.planId === "enterprise";
							return isPro ? (
								<StatusPill status={planLabel(data.plan?.planId)} tone="green" />
							) : (
								<Button.Root
									variant="neutral"
									mode="filled"
									size="small"
									onClick={() => setConvertOpen(true)}
								>
									Convert to Pro
								</Button.Root>
							);
						})()}
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
							<Link href={`/inbound?organizationId=${data.id}`}>Received</Link>
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

			{convertOpen ? (
				<InlineActionPanel
					title={`Convert ${data.name} to Pro?`}
					description="Grants Pro (individual) – 50k emails/month, no daily limit, 5 inboxes/webhooks. Audit-logged. Use Comped for free grants or Paid when payment handled externally."
					confirmLabel={
						convertMode === "paid" ? "Convert to Pro (paid)" : "Convert to Pro (comped)"
					}
					onCancel={() => setConvertOpen(false)}
					onConfirm={async () => {
						await adminPost(`/organizations/${data.id}/convert-plan`, {
							targetPlanId: "individual",
							mode: convertMode,
							reason: convertReason || undefined,
						});
						toast.success(
							`Converted to Pro (${convertMode}) – 50k emails/month`,
						);
						setConvertOpen(false);
						mutate();
					}}
				>
					<div className="grid gap-3">
						<div className="flex gap-2">
							<Button.Root
								variant="neutral"
								mode={convertMode === "comped" ? "filled" : "stroke"}
								size="small"
								onClick={() => setConvertMode("comped")}
							>
								Comped (free)
							</Button.Root>
							<Button.Root
								variant="neutral"
								mode={convertMode === "paid" ? "filled" : "stroke"}
								size="small"
								onClick={() => setConvertMode("paid")}
							>
								Paid (external)
							</Button.Root>
						</div>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									value={convertReason}
									onChange={(e) => setConvertReason(e.target.value)}
									placeholder="Reason (optional) – e.g. sales comp, migration"
								/>
							</Input.Wrapper>
						</Input.Root>
						<p className="text-[12px] text-text-sub-600">
							Current: {planLabel(data.plan?.planId)} → Pro.{" "}
							{data.plan?.planId && data.plan.planId !== "free"
								? "Already Pro or higher – conversion blocked."
								: `New quota: 50,000/month; credits will be topped to ${Math.max(0, 50000 - (data.credits?.creditsUsed ?? 0)).toLocaleString()} remaining.`}
						</p>
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
				<>
					{(() => {
						const warming = data.domains.filter((d) => d.dailyCap !== null);
						if (warming.length === 0) return null;
						const atCap = warming.filter((d) => d.dailyCap !== null && d.sentToday >= d.dailyCap);
						const nextCapFor = (age: number) => {
							if (age <= 1) return { cap: 50, in: `${2 - age} day(s)` };
							if (age <= 3) return { cap: 100, in: `${4 - age} day(s)` };
							if (age <= 7) return { cap: 250, in: `${8 - age} day(s)` };
							if (age <= 14) return { cap: 500, in: `${15 - age} day(s)` };
							if (age <= 30) return { cap: null, label: "Dynamic" as const, in: `${31 - age} day(s)` };
							return null;
						};
						return (
							<div
								className={`rounded-xl border px-4 py-3.5 ${atCap.length ? "border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"}`}
							>
								<p className={`text-[12px] font-semibold ${atCap.length ? "text-orange-700 dark:text-orange-300" : "text-amber-700 dark:text-amber-300"}`}>
									{atCap.length
										? `${atCap.length} domain${atCap.length > 1 ? "s" : ""} at daily limit — new sends are paused until UTC midnight`
										: `${warming.length} domain${warming.length > 1 ? "s are" : " is"} warming up — daily sends are throttled for the first 30 days`}
								</p>
								<p className="mt-1 text-[11px] leading-relaxed text-text-sub-600 dark:text-white/60">
									Applies to <span className="font-medium text-text-strong-950 dark:text-white">all plans (Free / Pro / Growth / Enterprise)</span> to protect reputation and block scam bulk sends from cheap, newly bought domains. Caps rise automatically as the domain ages — no manual action.
								</p>
								<div className="mt-3 space-y-2.5">
									{warming.map((d) => {
										const pct = d.dailyCap ? Math.min(100, (d.sentToday / d.dailyCap) * 100) : 0;
										const remaining = d.dailyCap === null ? null : Math.max(0, d.dailyCap - d.sentToday);
										const next = nextCapFor(d.ageDays);
										const isAt = d.dailyCap !== null && d.sentToday >= d.dailyCap;
										return (
											<div key={d.id} className="rounded-lg border border-stroke-soft-100 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
												<div className="flex flex-wrap items-baseline justify-between gap-2">
													<span className="font-mono text-[12px] font-medium text-text-strong-950 dark:text-white">{d.domain}</span>
													<span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${isAt ? "bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 dark:text-orange-300" : "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300"}`}>
														{d.ageDays}d old · {d.dailyCap !== null ? `${d.sentToday}/${d.dailyCap} today` : "Dynamic"}
													</span>
												</div>
												<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/10">
													<div className={`h-full rounded-full ${isAt ? "bg-orange-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
												</div>
												<div className="mt-1.5 flex flex-wrap justify-between gap-2 text-[11px] leading-relaxed">
													<span className={isAt ? "font-medium text-orange-700 dark:text-orange-300" : "text-text-sub-600 dark:text-white/60"}>
														{isAt ? `At cap — 0 left today` : `${remaining} left today`}
														{d.dailyCap !== null && d.ageDays <= 1 ? " · send only to highly engaged / verified contacts" : ""}
													</span>
													{next && (
														<span className="text-text-sub-600 dark:text-white/50">
															Next: {next.cap ?? next.label} in {next.in} {d.dailyCap !== null && next.cap ? `(${d.dailyCap}→${next.cap})` : ""}
														</span>
													)}
												</div>
											</div>
										);
									})}
								</div>
								<div className="mt-3 rounded-lg bg-white/60 px-3 py-2.5 text-[11px] leading-relaxed text-text-sub-600 dark:bg-black/20 dark:text-white/60">
									<p className="font-medium text-text-strong-950 dark:text-white">How caps work</p>
									<p className="mt-1">
										<span className="font-mono">0–1d: 20</span> (highly engaged only) → <span className="font-mono">2–3d: 50</span> → <span className="font-mono">4–7d: 100</span> → <span className="font-mono">8–14d: 250</span> → <span className="font-mono">15–30d: 500</span> → <span className="font-mono">30d+: Dynamic</span> (reputation-based; Free still max 100/day). Caps are per-domain per UTC day — resets at 00:00 UTC. If you hit the cap you’ll get <span className="font-mono">429 New domain daily limit reached</span>.
									</p>
								</div>
							</div>
						);
					})()}
					<div className="grid gap-4 lg:grid-cols-2">
						<SectionCard title="Organization profile">
						<div className="divide-y divide-stroke-soft-100 px-4 py-1 dark:divide-stroke-soft-100/40">
							{[
								["Name", data.name],
								["Slug", data.slug],
								["Status", data.status],
								[
									"Plan",
									data.plan
										? `${planLabel(data.plan.planId)} · ${data.plan.monthlyEmails.toLocaleString()}/mo`
										: "Free · 3,000/mo",
								],
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
						title="Plan usage"
						description={
							data.plan
								? `${planLabel(data.plan.planId)} · ${data.plan.monthlyEmails.toLocaleString()}/mo`
								: "Free · 3,000/mo"
						}
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
							<div>
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
								<div className="divide-y divide-stroke-soft-100 border-t border-stroke-soft-100 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40">
									{[
										{
											label: "Custom domains",
											used: data.domains.length,
											limit: data.plan?.maxCustomDomains ?? 3,
										},
										{
											label: "Webhooks",
											used: data.webhooks.length,
											limit: data.plan?.maxWebhooks ?? 1,
										},
										{
											label: "Agent inboxes",
											used: data.counts.mailboxes,
											limit: data.plan?.maxAgentInboxes ?? 1,
										},
									].map((row) => {
										const remaining = Math.max(0, row.limit - row.used);
										const pct = row.limit > 0 ? Math.min(100, (row.used / row.limit) * 100) : 0;
										const isAt = row.used >= row.limit;
										return (
											<div key={row.label} className="flex items-center gap-3 px-4 py-3">
												<div className="min-w-0 flex-1">
													<div className="flex items-baseline justify-between gap-2">
														<p className="text-[12px] font-medium text-text-strong-950">{row.label}</p>
														<p className="text-[12px] tabular-nums text-text-sub-600">
															{row.used} / {row.limit} <span className={isAt ? "text-orange-600" : ""}>· {remaining} remaining</span>
														</p>
													</div>
													<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/[0.06]">
														<div
															className={`h-full rounded-full ${isAt ? "bg-orange-500" : "bg-text-strong-950 dark:bg-white"}`}
															style={{ width: `${pct}%` }}
														/>
													</div>
												</div>
											</div>
										);
									})}
									{/* Used inbox details */}
									{data.counts.mailboxes > 0 && data.mailboxes.length > 0 ? (
										<div className="border-t border-stroke-soft-100 bg-bg-weak-50/30 px-4 py-3 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
											<p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-sub-600">
												Used inboxes — {data.mailboxes.length} {data.mailboxes.length === 1 ? "inbox" : "inboxes"}
											</p>
											<div className="space-y-2">
												{data.mailboxes.map((mb) => (
													<div
														key={mb.id}
														className="flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-100 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]"
													>
														<div className="min-w-0 flex-1">
															<p className="truncate font-medium text-[12px] text-text-strong-950">{mb.email}</p>
															<p className="truncate text-[11px] text-text-sub-600">
																{mb.displayName ? `${mb.displayName} · ` : ""}
																{mb.domain || "—"} · {formatDateTime(mb.createdAt)}
															</p>
														</div>
														<StatusPill status={mb.status} />
													</div>
												))}
											</div>
										</div>
									) : data.counts.mailboxes === 0 ? (
										<div className="border-t border-stroke-soft-100 px-4 py-3 text-[12px] text-text-sub-600 dark:border-stroke-soft-100/40">
											No agent inboxes yet — {data.plan ? `${data.plan.maxAgentInboxes} available` : "1 available"} on {planLabel(data.plan?.planId)}
										</div>
									) : null}
									<div className="flex items-center justify-between gap-3 px-4 py-3 text-[12px]">
										<span className="text-text-sub-600">Attachment limit</span>
										<span className="font-medium tabular-nums text-text-strong-950">
											{data.plan ? `${(data.plan.maxAttachmentBytes / (1024 * 1024)).toFixed(0)} MB` : "1 MB"}
										</span>
									</div>
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
								<div
									key={e.id}
									className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<Link
												href={`/emails/${e.id}`}
												className="truncate font-medium text-[13px] text-text-strong-950 transition-colors hover:text-primary-base hover:underline"
											>
												{e.subject || "(no subject)"}
											</Link>
											<StatusPill status={e.status} />
										</div>
										<p className="mt-0.5 truncate text-[12px] text-text-sub-600">
											{e.fromEmail} · {formatRelativeTime(e.createdAt)}
										</p>
									</div>
									<Button.Root
										asChild
										size="xsmall"
										variant="neutral"
										mode="stroke"
										className="shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<Link href={`/emails/${e.id}`}>
											<Icon name="eye" className="h-3 w-3" />
											Open
										</Link>
									</Button.Root>
								</div>
							))}
							{data.recentEmails.length === 0 ? (
								<EmptyState title="No emails yet" />
							) : null}
						</div>
					</SectionCard>
				</div>
				</>
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
									<Button.Root
										asChild
										size="xsmall"
										variant="neutral"
										mode="ghost"
									>
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
					description="Sending domains attached to this org — age cap applies to all plans"
				>
					<DataTable
						headers={["Domain", "Status", "Age", "Daily cap", "Sent today", "Verified", "Created"]}
						colSpan={7}
						empty={data.domains.length === 0}
					>
						{data.domains.map((d) => {
							const isWarming = d.dailyCap !== null;
							const isAtCap = d.dailyCap !== null && d.sentToday >= d.dailyCap;
							return (
								<tr
									key={d.id}
									className={`border-stroke-soft-100 border-t dark:border-stroke-soft-100/40 ${isAtCap ? "bg-orange-50/50 dark:bg-orange-500/5" : ""}`}
								>
									<td className="px-4 py-3 font-medium">
										<div>{d.domain}</div>
										{isWarming ? (
											<span className="text-[11px] text-orange-600 dark:text-orange-400">Warming up</span>
										) : (
											<span className="text-[11px] text-emerald-600 dark:text-emerald-400">Warm</span>
										)}
									</td>
									<td className="px-4 py-3">
										<StatusPill status={d.status} />
									</td>
									<td className="px-4 py-3 tabular-nums text-text-strong-950">
										{d.ageDays}d
										<span className="ml-1 text-[11px] text-text-sub-600" title={d.registrarCreatedAt ? `Registrar: ${new Date(d.registrarCreatedAt).toLocaleDateString()} via ${d.source}` : `Added: ${new Date(d.createdAt).toLocaleDateString()}`}>
											({d.source === "rdap" && d.registrarCreatedAt ? `reg ${new Date(d.registrarCreatedAt).toLocaleDateString()}` : d.ageDays <= 1 ? "today" : `${d.ageDays}d ago`})
										</span>
									</td>
									<td className="px-4 py-3 tabular-nums">
										{d.dailyCap === null ? (
											<span className="text-text-sub-600">Dynamic</span>
										) : (
											<span className={isAtCap ? "font-semibold text-orange-600" : ""}>{d.dailyCap}</span>
										)}
									</td>
									<td className="px-4 py-3 tabular-nums">
										{d.dailyCap === null ? (
											<span className="text-text-sub-600">{d.sentToday} sent</span>
										) : (
											<span className={isAtCap ? "font-semibold text-orange-600" : ""}>
												{d.sentToday} / {d.dailyCap}
												<span className="ml-1 text-[11px] text-text-sub-600">· {d.remaining} left</span>
											</span>
										)}
									</td>
									<td className="px-4 py-3 text-text-sub-600">
										{d.systemVerified ? "Yes" : "No"}
									</td>
									<td className="px-4 py-3 text-text-sub-600">
										{formatRelativeTime(d.createdAt)}
									</td>
								</tr>
							);
						})}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "dedicated-ips" ? (
				<OrgSendingIps organizationId={data.id} organizationName={data.name} />
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
									<Link href={`/users/${k.userId}`} className="hover:underline">
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
						headers={[
							"Name",
							"Status",
							"Subject",
							"From",
							"Version",
							"Updated",
						]}
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
						headers={["When", "From", "To", "Subject", "Attachments", "Status"]}
						colSpan={6}
						empty={data.recentEmails.length === 0}
					>
						{data.recentEmails.map((e) => (
							<tr
								key={e.id}
								className="group cursor-pointer border-stroke-soft-100 border-t transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.02]"
								onClick={() => router.push(`/emails/${e.id}`)}
							>
								<td className="whitespace-nowrap px-4 py-3 text-text-sub-600">
									{formatRelativeTime(e.createdAt)}
								</td>
								<td className="px-4 py-3 font-medium">{e.fromEmail}</td>
								<td className="max-w-[160px] truncate px-4 py-3 text-text-sub-600">
									{formatRecipients(e.toEmails)}
								</td>
								<td className="max-w-[220px] truncate px-4 py-3">
									<Link
										href={`/emails/${e.id}`}
										onClick={(ev) => ev.stopPropagation()}
										className="truncate font-medium text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-primary-base"
									>
										{e.subject || "(no subject)"}
									</Link>
								</td>
								<td className="px-4 py-3">
									<AttachmentChips attachments={e.attachments} />
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
						<Link
							href="/audit"
							className="text-[12px] text-primary-base hover:underline"
						>
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
