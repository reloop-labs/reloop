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
import { adminGet } from "@fe/console/lib/admin-api";
import {
	formatDateTime,
	formatNumber,
	formatRelativeTime,
	truncateId,
} from "@fe/console/lib/format";
import { authClient } from "@reloop/auth/client";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import * as Button from "@reloop/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type UserDetail = {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: string;
	banned: boolean;
	banReason: string | null;
	banExpires: string | null;
	emailVerified: boolean;
	activeOrganizationId: string | null;
	createdAt: string;
	updatedAt: string;
	organizations: Array<{
		memberId: string;
		role: string;
		joinedAt: string;
		id: string;
		name: string;
		slug: string;
		status: string;
		billingEmail: string | null;
		domainCount: number;
		creditsRemaining: number | null;
		creditsUsed: number | null;
		monthlyCredits: number | null;
	}>;
	apiKeys: Array<{
		id: string;
		name: string | null;
		prefix: string | null;
		start: string | null;
		enabled: boolean;
		organizationId: string;
		organizationName: string;
		requestCount: number;
		lastRequest: string | null;
		expiresAt: string | null;
		createdAt: string;
	}>;
	supportConversations: Array<{
		id: string;
		status: "open" | "closed";
		organizationId: string | null;
		lastMessageAt: string;
		lastMessagePreview: string | null;
		createdAt: string;
	}>;
};

const TABS = [
	{ id: "overview", label: "Overview" },
	{ id: "organizations", label: "Organizations" },
	{ id: "api-keys", label: "API keys" },
	{ id: "support", label: "Support" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function UserDetailPage() {
	const params = useParams<{ userId: string }>();
	const userId = params.userId;
	const [tab, setTab] = useState<TabId>("overview");
	const [banOpen, setBanOpen] = useState(false);
	const [promoteOpen, setPromoteOpen] = useState(false);
	const [impersonateOpen, setImpersonateOpen] = useState(false);

	const { data, isLoading, error, mutate } = useSWR<UserDetail>(
		userId ? `/users/${userId}` : null,
		() => adminGet<UserDetail>(`/users/${userId}`),
	);

	const tabs = useMemo(() => {
		if (!data) return TABS.map((t) => ({ ...t }));
		return [
			{ id: "overview", label: "Overview" },
			{
				id: "organizations",
				label: "Organizations",
				count: data.organizations.length,
			},
			{ id: "api-keys", label: "API keys", count: data.apiKeys.length },
			{
				id: "support",
				label: "Support",
				count: data.supportConversations.length,
			},
		];
	}, [data]);

	if (isLoading) {
		return (
			<PageFrame>
				<p className="text-paragraph-sm text-text-sub-600">Loading user…</p>
			</PageFrame>
		);
	}

	if (error || !data) {
		return (
			<PageFrame>
				<p className="text-error-base text-paragraph-sm">
					Failed to load user. They may not exist, or the admin API is down.
				</p>
				<Button.Root asChild variant="neutral" mode="stroke" size="small">
					<Link href="/users">Back to users</Link>
				</Button.Root>
			</PageFrame>
		);
	}

	const isPlatformAdmin = data.role === PLATFORM_ADMIN_ROLE;
	const primaryOrg =
		data.organizations.find((o) => o.id === data.activeOrganizationId) ??
		data.organizations[0] ??
		null;

	return (
		<PageFrame className="space-y-5">
			<PageHeading
				eyebrow={
					<Breadcrumb
						items={[{ label: "Users", href: "/users" }, { label: data.email }]}
					/>
				}
				title={data.name}
				meta={
					<>
						<StatusPill status={data.role} />
						<StatusPill status={data.banned ? "banned" : "active"} />
						{data.emailVerified ? (
							<StatusPill status="verified" tone="green" />
						) : (
							<StatusPill status="unverified" tone="gray" />
						)}
					</>
				}
				description={
					<div className="flex flex-wrap gap-x-4 gap-y-1">
						<span>{data.email}</span>
						<span>Joined {formatDateTime(data.createdAt)}</span>
						<span className="font-mono text-[12px]">
							{truncateId(data.id, 16)}
						</span>
					</div>
				}
				actions={
					<>
						{primaryOrg ? (
							<Button.Root asChild variant="neutral" mode="stroke" size="small">
								<Link href={`/organizations/${primaryOrg.id}`}>
									Primary org hub
								</Link>
							</Button.Root>
						) : null}
						{data.banned ? (
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={async () => {
									const { error: err } = await authClient.admin.unbanUser({
										userId: data.id,
									});
									if (err) {
										toast.error(err.message || "Failed to unban");
										return;
									}
									toast.success("User unbanned");
									mutate();
								}}
							>
								Unban
							</Button.Root>
						) : (
							<Button.Root
								variant="error"
								mode="stroke"
								size="small"
								onClick={() => setBanOpen(true)}
							>
								Ban
							</Button.Root>
						)}
						{isPlatformAdmin ? (
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={async () => {
									const { error: err } = await authClient.admin.setRole({
										userId: data.id,
										role: "user",
									});
									if (err) {
										toast.error(err.message || "Failed to demote");
										return;
									}
									toast.success("Removed super-admin role");
									mutate();
								}}
							>
								Remove super-admin
							</Button.Root>
						) : (
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => setPromoteOpen(true)}
							>
								Make super-admin
							</Button.Root>
						)}
						<Button.Root
							variant="neutral"
							mode="filled"
							size="small"
							onClick={() => setImpersonateOpen(true)}
						>
							Impersonate
						</Button.Root>
					</>
				}
			/>

			{banOpen ? (
				<InlineActionPanel
					title={`Ban ${data.email}?`}
					description="They will be unable to sign in until unbanned."
					confirmLabel="Ban user"
					destructive
					onCancel={() => setBanOpen(false)}
					onConfirm={async () => {
						const { error: err } = await authClient.admin.banUser({
							userId: data.id,
							banReason: "Banned by platform admin",
						});
						if (err) {
							toast.error(err.message || "Failed to ban user");
							throw new Error(err.message);
						}
						toast.success("User banned");
						setBanOpen(false);
						mutate();
					}}
				/>
			) : null}

			{promoteOpen ? (
				<InlineActionPanel
					title={`Promote ${data.email}?`}
					description="Grants platform super-admin access across all organizations."
					confirmLabel="Make super-admin"
					onCancel={() => setPromoteOpen(false)}
					onConfirm={async () => {
						const { error: err } = await authClient.admin.setRole({
							userId: data.id,
							role: PLATFORM_ADMIN_ROLE,
						});
						if (err) {
							toast.error(err.message || "Failed to promote user");
							throw new Error(err.message);
						}
						toast.success("User promoted to super-admin");
						setPromoteOpen(false);
						mutate();
					}}
				/>
			) : null}

			{impersonateOpen ? (
				<InlineActionPanel
					title={`Impersonate ${data.email}?`}
					description="You will leave the console for the customer dashboard. A banner stays visible until you stop."
					confirmLabel="Start impersonation"
					destructive
					onCancel={() => setImpersonateOpen(false)}
					onConfirm={async () => {
						const { error: err } = await authClient.admin.impersonateUser({
							userId: data.id,
						});
						if (err) {
							toast.error(err.message || "Failed to impersonate");
							throw new Error(err.message);
						}
						toast.success("Impersonation started");
						window.location.href = "/dashboard";
					}}
				/>
			) : null}

			<MetricGrid
				items={[
					{
						label: "Organizations",
						value: data.organizations.length,
						hint: primaryOrg ? `Primary: ${primaryOrg.name}` : "No memberships",
					},
					{
						label: "API keys",
						value: data.apiKeys.length,
						hint: `${data.apiKeys.filter((k) => k.enabled).length} enabled`,
					},
					{
						label: "Support threads",
						value: data.supportConversations.length,
						hint: `${data.supportConversations.filter((t) => t.status === "open").length} open`,
						href: data.supportConversations[0]
							? `/support?c=${data.supportConversations[0].id}`
							: "/support",
					},
					{
						label: "Credits (primary)",
						value: formatNumber(primaryOrg?.creditsRemaining),
						hint: primaryOrg
							? `${formatNumber(primaryOrg.creditsUsed)} used`
							: "—",
						href: primaryOrg
							? `/credits?organizationId=${primaryOrg.id}`
							: undefined,
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
					<SectionCard title="Identity">
						<div className="divide-y divide-stroke-soft-100 px-4 py-1 dark:divide-stroke-soft-100/40">
							{[
								["Name", data.name],
								["Email", data.email],
								["User ID", data.id],
								["Platform role", data.role],
								["Status", data.banned ? "Banned" : "Active"],
								["Ban reason", data.banReason || "—"],
								["Email verified", data.emailVerified ? "Yes" : "No"],
								["Created", formatDateTime(data.createdAt)],
								["Updated", formatDateTime(data.updatedAt)],
							].map(([label, value]) => (
								<div
									key={label as string}
									className="flex items-start justify-between gap-4 py-2.5"
								>
									<span className="text-[12px] text-text-sub-600">{label}</span>
									<span className="max-w-[65%] break-all text-right font-medium text-[12px] text-text-strong-950">
										{value}
									</span>
								</div>
							))}
						</div>
					</SectionCard>

					<SectionCard
						title="Quick links"
						description="Jump straight into the jobs you do most"
					>
						<div className="grid gap-2 p-4 sm:grid-cols-2">
							{[
								primaryOrg
									? {
											label: "Org hub",
											href: `/organizations/${primaryOrg.id}`,
											hint: primaryOrg.name,
										}
									: null,
								primaryOrg
									? {
											label: "Org ledger",
											href: `/credits?organizationId=${primaryOrg.id}`,
											hint: "Credits history",
										}
									: null,
								primaryOrg
									? {
											label: "Failed emails",
											href: `/emails?organizationId=${primaryOrg.id}&status=failed`,
											hint: "Delivery issues",
										}
									: null,
								{
									label: "Support inbox",
									href: data.supportConversations[0]
										? `/support?c=${data.supportConversations[0].id}`
										: "/support",
									hint: "Customer threads",
								},
							]
								.filter(Boolean)
								.map((item) => (
									<Link
										key={item!.label}
										href={item!.href}
										className="rounded-xl border border-stroke-soft-100 px-3 py-3 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.03]"
									>
										<p className="font-medium text-[13px] text-text-strong-950">
											{item!.label}
										</p>
										<p className="mt-0.5 text-[12px] text-text-sub-600">
											{item!.hint}
										</p>
									</Link>
								))}
						</div>
					</SectionCard>

					<SectionCard
						title="Organizations preview"
						className="lg:col-span-2"
						action={
							<button
								type="button"
								className="text-[12px] text-primary-base hover:underline"
								onClick={() => setTab("organizations")}
							>
								View all
							</button>
						}
					>
						{data.organizations.length === 0 ? (
							<EmptyState title="Not a member of any organization" />
						) : (
							<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
								{data.organizations.slice(0, 4).map((org) => (
									<Link
										key={org.memberId}
										href={`/organizations/${org.id}`}
										className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
									>
										<div className="min-w-0">
											<p className="font-medium text-[13px]">{org.name}</p>
											<p className="text-[12px] text-text-sub-600">
												{org.slug} · {org.domainCount} domains ·{" "}
												{formatNumber(org.creditsRemaining)} credits
											</p>
										</div>
										<div className="flex items-center gap-2">
											<StatusPill status={org.status} />
											<StatusPill status={org.role} />
										</div>
									</Link>
								))}
							</div>
						)}
					</SectionCard>
				</div>
			) : null}

			{tab === "organizations" ? (
				<SectionCard
					title={`Organizations (${data.organizations.length})`}
					description="Full membership map — open any hub end-to-end"
				>
					<DataTable
						headers={[
							"Organization",
							"Status",
							"Role",
							"Domains",
							"Credits",
							"Joined",
							"",
						]}
						colSpan={7}
						empty={data.organizations.length === 0}
					>
						{data.organizations.map((org) => (
							<tr
								key={org.memberId}
								className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
							>
								<td className="px-4 py-3">
									<Link
										href={`/organizations/${org.id}`}
										className="font-medium hover:underline"
									>
										{org.name}
									</Link>
									<p className="text-[12px] text-text-sub-600">{org.slug}</p>
								</td>
								<td className="px-4 py-3">
									<StatusPill status={org.status} />
								</td>
								<td className="px-4 py-3">
									<StatusPill status={org.role} />
									{org.id === data.activeOrganizationId ? (
										<span className="ml-1 text-[11px] text-text-sub-600">
											active
										</span>
									) : null}
								</td>
								<td className="px-4 py-3">{org.domainCount}</td>
								<td className="px-4 py-3 tabular-nums">
									{formatNumber(org.creditsRemaining)}
								</td>
								<td className="px-4 py-3 text-text-sub-600">
									{formatRelativeTime(org.joinedAt)}
								</td>
								<td className="px-4 py-3">
									<div className="flex flex-wrap justify-end gap-1">
										<Button.Root
											asChild
											size="xsmall"
											variant="neutral"
											mode="stroke"
										>
											<Link href={`/organizations/${org.id}`}>Hub</Link>
										</Button.Root>
										<Button.Root
											asChild
											size="xsmall"
											variant="neutral"
											mode="ghost"
										>
											<Link href={`/credits?organizationId=${org.id}`}>
												Ledger
											</Link>
										</Button.Root>
										<Button.Root
											asChild
											size="xsmall"
											variant="neutral"
											mode="ghost"
										>
											<Link
												href={`/emails?organizationId=${org.id}&status=failed`}
											>
												Fails
											</Link>
										</Button.Root>
									</div>
								</td>
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "api-keys" ? (
				<SectionCard
					title={`API keys (${data.apiKeys.length})`}
					description="Keys this user created across organizations"
				>
					<DataTable
						headers={[
							"Name",
							"Prefix",
							"Organization",
							"Enabled",
							"Requests",
							"Last used",
						]}
						colSpan={6}
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
										href={`/organizations/${k.organizationId}`}
										className="hover:underline"
									>
										{k.organizationName}
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
							</tr>
						))}
					</DataTable>
				</SectionCard>
			) : null}

			{tab === "support" ? (
				<SectionCard
					title={`Support (${data.supportConversations.length})`}
					description="Every conversation this person has opened"
				>
					{data.supportConversations.length === 0 ? (
						<EmptyState title="No support conversations" />
					) : (
						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
							{data.supportConversations.map((thread) => (
								<Link
									key={thread.id}
									href={`/support?c=${thread.id}`}
									className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
								>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<StatusPill status={thread.status} />
											<span className="text-[12px] text-text-sub-600">
												{formatRelativeTime(thread.lastMessageAt)}
											</span>
											{thread.organizationId ? (
												<span className="text-[12px] text-text-soft-400">
													org {truncateId(thread.organizationId, 10)}
												</span>
											) : null}
										</div>
										<p className="mt-1 truncate text-[13px]">
											{thread.lastMessagePreview || "No preview"}
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
		</PageFrame>
	);
}
