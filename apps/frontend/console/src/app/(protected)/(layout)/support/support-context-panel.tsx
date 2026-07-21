"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import { formatNumber, formatRelativeTime } from "@fe/console/lib/format";
import type { SupportConversation } from "@fe/console/lib/support-types";
import { authClient } from "@reloop/auth/client";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import {
	Ban,
	ChevronDown,
	ChevronRight,
	Copy,
	CreditCard,
	ExternalLink,
	Globe,
	Mail,
	UserRound,
	UserRoundSearch,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type OrgDetail = {
	id: string;
	name: string;
	slug: string;
	status: string;
	createdAt: string;
	billingEmail: string | null;
	counts?: {
		members: number;
		domains: number;
		apiKeys: number;
		templates: number;
		webhooks: number;
		emails: number;
		supportThreads: number;
	};
	members: Array<{
		id: string;
		role: string;
		userId: string;
		userName: string;
		userEmail: string;
		createdAt: string;
	}>;
	domains: Array<{
		id: string;
		domain: string;
		status: string;
		createdAt: string;
	}>;
	credits: {
		creditsUsed: number;
		creditsRemaining: number;
		monthlyCredits: number;
		status: string;
		currentPeriodStart: string;
		currentPeriodEnd: string;
	} | null;
};

type AdminUser = {
	id: string;
	name: string;
	email: string;
	role?: string | null;
	banned?: boolean | null;
	banReason?: string | null;
	emailVerified?: boolean | null;
	createdAt?: string | Date;
	activeOrganizationId?: string | null;
	image?: string | null;
};

function avatarInitials(name: string | null, email: string | null) {
	const parts = (name || "").trim().split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
	}
	if (parts.length === 1 && parts[0]!.length >= 2) {
		return parts[0]!.slice(0, 2).toUpperCase();
	}
	const local = (email || "").split("@")[0] || "?";
	return local.slice(0, 2).toUpperCase();
}

async function fetchAdminUser(userId: string): Promise<AdminUser | null> {
	const { data, error } = await authClient.admin.getUser({
		query: { id: userId },
	});
	if (error || !data) return null;
	return data as AdminUser;
}

function ActionLink({
	href,
	icon: Icon,
	label,
	hint,
}: {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	hint?: string;
}) {
	return (
		<Link
			href={href}
			className="group flex items-center gap-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2.5 transition-colors hover:border-stroke-soft-200 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.04]"
		>
			<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600 dark:bg-white/[0.06]">
				<Icon className="h-3.5 w-3.5" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block font-medium text-[12px] text-text-strong-950">
					{label}
				</span>
				{hint ? (
					<span className="block truncate text-[11px] text-text-sub-600">
						{hint}
					</span>
				) : null}
			</span>
			<ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-soft-400 opacity-0 transition-opacity group-hover:opacity-100" />
		</Link>
	);
}

function Collapsible({
	title,
	defaultOpen = false,
	badge,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	badge?: React.ReactNode;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-bg-weak-50/80 dark:hover:bg-white/[0.03]"
			>
				{open ? (
					<ChevronDown className="h-3.5 w-3.5 text-text-soft-400" />
				) : (
					<ChevronRight className="h-3.5 w-3.5 text-text-soft-400" />
				)}
				<span className="flex-1 font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
					{title}
				</span>
				{badge}
			</button>
			{open ? <div className="px-4 pb-4">{children}</div> : null}
		</div>
	);
}

export function SupportContextPanel({
	conversation,
}: {
	conversation: SupportConversation;
}) {
	const [amount, setAmount] = useState("1000");
	const [reason, setReason] = useState("");
	const [applying, setApplying] = useState(false);
	const [showTopupConfirm, setShowTopupConfirm] = useState(false);
	const [suspendOpen, setSuspendOpen] = useState(false);
	const [impersonateOpen, setImpersonateOpen] = useState(false);

	const { data: user, isLoading: userLoading } = useSWR(
		conversation.userId ? ["support-user", conversation.userId] : null,
		() => fetchAdminUser(conversation.userId),
	);

	const orgId =
		conversation.organizationId || user?.activeOrganizationId || null;

	const {
		data: org,
		isLoading: orgLoading,
		error: orgError,
		mutate: mutateOrg,
	} = useSWR<OrgDetail>(orgId ? `/organizations/${orgId}` : null, () =>
		adminGet<OrgDetail>(`/organizations/${orgId}`),
	);

	const displayName = user?.name || conversation.userName || "Unknown";
	const displayEmail = user?.email || conversation.userEmail || "—";
	const displayImage = user?.image || conversation.userImage;
	const role = user?.role || "user";
	const isPlatformAdmin = role === PLATFORM_ADMIN_ROLE;
	const balance = org?.credits?.creditsRemaining ?? null;
	const lowCredits = balance !== null && balance <= 100;

	const failedDomains = useMemo(
		() => (org?.domains ?? []).filter((d) => d.status === "failed"),
		[org?.domains],
	);

	const copyEmail = async () => {
		try {
			await navigator.clipboard.writeText(displayEmail);
			toast.success("Email copied");
		} catch {
			toast.error("Could not copy");
		}
	};

	const applyTopup = async () => {
		if (!org) {
			toast.error("No organization to top up");
			return;
		}
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) {
			toast.error("Enter a positive amount");
			return;
		}
		setApplying(true);
		try {
			await adminPost("/credits/topup", {
				organizationId: org.id,
				amount: value,
				reason:
					reason.trim() ||
					`Support top-up for ${displayEmail} (${conversation.id})`,
			});
			toast.success(`Added ${value.toLocaleString()} credits`);
			setReason("");
			setShowTopupConfirm(false);
			void mutateOrg();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to top up");
		} finally {
			setApplying(false);
		}
	};

	return (
		<aside className="flex w-[300px] shrink-0 flex-col overflow-hidden border-stroke-soft-100 border-l bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-black/20 xl:w-[320px]">
			{/* Customer identity */}
			<div className="border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-4 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
				<div className="flex items-start gap-3">
					<Avatar.Root size="40" color="blue" className="shrink-0">
						{displayImage ? (
							<Avatar.Image src={displayImage} alt={displayName} />
						) : (
							<Avatar.Image asChild>
								<div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 font-semibold text-[13px] text-blue-900 uppercase dark:bg-blue-500/20 dark:text-blue-200">
									{avatarInitials(displayName, displayEmail)}
								</div>
							</Avatar.Image>
						)}
					</Avatar.Root>
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold text-[14px] text-text-strong-950">
							{userLoading ? "Loading…" : displayName}
						</p>
						<button
							type="button"
							onClick={() => void copyEmail()}
							className="mt-0.5 flex max-w-full items-center gap-1 truncate text-[12px] text-text-sub-600 hover:text-text-strong-950"
							title="Copy email"
						>
							<span className="truncate">{displayEmail}</span>
							<Copy className="h-3 w-3 shrink-0 opacity-60" />
						</button>
						<div className="mt-2 flex flex-wrap gap-1.5">
							<StatusPill
								status={user?.banned ? "banned" : "active"}
							/>
							{isPlatformAdmin ? (
								<StatusPill status="super-admin" />
							) : (
								<StatusPill status={role} tone="gray" />
							)}
							{conversation.status === "open" ? (
								<StatusPill status="open" />
							) : (
								<StatusPill status="closed" />
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto">
				{/* Snapshot */}
				<div className="space-y-2 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
						At a glance
					</p>
					<div className="grid grid-cols-2 gap-2">
						<div
							className={cn(
								"rounded-xl border px-3 py-2.5",
								lowCredits
									? "border-orange-500/30 bg-orange-500/10"
									: "border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]",
							)}
						>
							<p className="text-[10px] text-text-sub-600 uppercase tracking-wide">
								Credits
							</p>
							<p
								className={cn(
									"mt-0.5 font-semibold text-[16px] tabular-nums",
									lowCredits
										? "text-orange-700 dark:text-orange-400"
										: "text-text-strong-950",
								)}
							>
								{orgLoading
									? "…"
									: balance === null
										? "—"
										: formatNumber(balance)}
							</p>
							{lowCredits ? (
								<p className="mt-0.5 text-[10px] font-medium text-orange-700 dark:text-orange-400">
									Low balance
								</p>
							) : null}
						</div>
						<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2.5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
							<p className="text-[10px] text-text-sub-600 uppercase tracking-wide">
								Org
							</p>
							<p className="mt-0.5 truncate font-semibold text-[13px] text-text-strong-950">
								{orgLoading ? "…" : org?.name || "None"}
							</p>
							{org ? (
								<p className="mt-0.5 truncate text-[10px] text-text-sub-600">
									{org.status} · {org.slug}
								</p>
							) : null}
						</div>
					</div>
					{failedDomains.length > 0 ? (
						<div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2">
							<p className="font-medium text-[11px] text-red-700 dark:text-red-400">
								{failedDomains.length} failed domain
								{failedDomains.length === 1 ? "" : "s"}
							</p>
							<p className="mt-0.5 truncate text-[11px] text-red-700/80 dark:text-red-400/80">
								{failedDomains.map((d) => d.domain).join(", ")}
							</p>
						</div>
					) : null}
				</div>

				{/* Act now — credits */}
				<div className="space-y-2 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
						Resolve with credits
					</p>
					{!org ? (
						<p className="text-[12px] text-text-sub-600">
							No organization linked — open the user hub to pick context.
						</p>
					) : showTopupConfirm ? (
						<InlineActionPanel
							title={`Add ${Number(amount) || 0} credits?`}
							description={`To ${org.name}. Logged in audit.`}
							confirmLabel={applying ? "Applying…" : "Confirm top-up"}
							onCancel={() => setShowTopupConfirm(false)}
							onConfirm={() => applyTopup()}
						>
							<div className="grid gap-2">
								<input
									type="number"
									min={1}
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className="h-9 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] outline-none focus:border-stroke-strong-950 dark:bg-transparent"
									placeholder="Amount"
								/>
								<input
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									className="h-9 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] outline-none focus:border-stroke-strong-950 dark:bg-transparent"
									placeholder="Reason (optional)"
								/>
							</div>
						</InlineActionPanel>
					) : (
						<div className="space-y-2">
							<div className="flex gap-2">
								<input
									type="number"
									min={1}
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className="h-9 min-w-0 flex-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] outline-none focus:border-stroke-strong-950 dark:bg-transparent"
									placeholder="Amount"
								/>
								<button
									type="button"
									onClick={() => setShowTopupConfirm(true)}
									disabled={!amount.trim()}
									className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
								>
									<CreditCard className="h-3.5 w-3.5" />
									Top up
								</button>
							</div>
							<input
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								className="h-9 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] outline-none focus:border-stroke-strong-950 dark:bg-transparent"
								placeholder="Reason for audit (optional)"
							/>
							<div className="flex flex-wrap gap-1.5">
								{[500, 1000, 5000].map((n) => (
									<button
										key={n}
										type="button"
										onClick={() => setAmount(String(n))}
										className={cn(
											"rounded-full px-2.5 py-1 font-medium text-[11px] transition-colors",
											amount === String(n)
												? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
												: "bg-bg-white-0 text-text-sub-600 ring-1 ring-stroke-soft-100 hover:text-text-strong-950 dark:bg-transparent dark:ring-stroke-soft-100/40",
										)}
									>
										+{n.toLocaleString()}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Navigate */}
				<div className="space-y-2 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
						Jump to
					</p>
					<div className="space-y-1.5">
						<ActionLink
							href={`/users/${conversation.userId}`}
							icon={UserRound}
							label="User hub"
							hint="Ban, promote, memberships"
						/>
						{org ? (
							<>
								<ActionLink
									href={`/organizations/${org.id}`}
									icon={Users}
									label="Organization hub"
									hint={org.name}
								/>
								<ActionLink
									href={`/credits?organizationId=${org.id}`}
									icon={CreditCard}
									label="Credits ledger"
									hint={`${formatNumber(balance)} remaining`}
								/>
								<ActionLink
									href={`/emails?organizationId=${org.id}&status=failed`}
									icon={Mail}
									label="Failed emails"
									hint="Delivery issues for this org"
								/>
								{failedDomains.length > 0 ? (
									<ActionLink
										href={`/organizations/${org.id}`}
										icon={Globe}
										label="Domains"
										hint={`${failedDomains.length} failed`}
									/>
								) : null}
							</>
						) : null}
					</div>
				</div>

				{/* Sensitive actions */}
				<div className="space-y-2 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
						Sensitive
					</p>
					{impersonateOpen ? (
						<InlineActionPanel
							title={`Impersonate ${displayEmail}?`}
							description="Opens the customer dashboard as this user."
							confirmLabel="Impersonate"
							destructive
							onCancel={() => setImpersonateOpen(false)}
							onConfirm={async () => {
								const { error } = await authClient.admin.impersonateUser({
									userId: conversation.userId,
								});
								if (error) {
									toast.error(error.message || "Failed to impersonate");
									throw new Error(error.message);
								}
								toast.success("Impersonation started");
								window.location.href = "/dashboard";
							}}
						/>
					) : (
						<button
							type="button"
							onClick={() => {
								setSuspendOpen(false);
								setImpersonateOpen(true);
							}}
							disabled={!!user?.banned}
							className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent"
						>
							<UserRoundSearch className="h-3.5 w-3.5 text-text-sub-600" />
							Impersonate customer
						</button>
					)}
					{suspendOpen && org ? (
						<InlineActionPanel
							title={`Suspend ${org.name}?`}
							description="All members lose access until reactivated."
							confirmLabel="Suspend org"
							destructive
							onCancel={() => setSuspendOpen(false)}
							onConfirm={async () => {
								await adminPatch(`/organizations/${org.id}/status`, {
									status: "suspended",
									reason: `Suspended from support chat (${conversation.id})`,
								});
								toast.success("Organization suspended");
								setSuspendOpen(false);
								void mutateOrg();
							}}
						/>
					) : (
						<button
							type="button"
							onClick={() => {
								setImpersonateOpen(false);
								setSuspendOpen(true);
							}}
							disabled={!org || org.status === "suspended"}
							className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent"
						>
							<Ban className="h-3.5 w-3.5 text-text-sub-600" />
							{org?.status === "suspended" ? "Org already suspended" : "Suspend org"}
						</button>
					)}
				</div>

				{/* Details */}
				<Collapsible
					title="Customer details"
					defaultOpen={false}
					badge={
						<span className="text-[10px] text-text-soft-400">
							{user?.createdAt
								? `Joined ${formatRelativeTime(String(user.createdAt))}`
								: null}
						</span>
					}
				>
					{userLoading ? (
						<p className="text-[12px] text-text-sub-600">Loading…</p>
					) : (
						<div className="space-y-2 text-[12px]">
							<div className="flex justify-between gap-2">
								<span className="text-text-sub-600">Email verified</span>
								<span className="font-medium">
									{user?.emailVerified ? "Yes" : "No"}
								</span>
							</div>
							{user?.banned && user.banReason ? (
								<div className="flex justify-between gap-2">
									<span className="text-text-sub-600">Ban reason</span>
									<span className="max-w-[55%] text-right font-medium">
										{user.banReason}
									</span>
								</div>
							) : null}
							<div className="flex justify-between gap-2">
								<span className="text-text-sub-600">User ID</span>
								<span className="max-w-[55%] break-all text-right font-mono text-[10px]">
									{conversation.userId}
								</span>
							</div>
						</div>
					)}
				</Collapsible>

				{org ? (
					<Collapsible
						title="Organization"
						defaultOpen
						badge={<StatusPill status={org.status} />}
					>
						{orgError ? (
							<p className="text-[12px] text-text-sub-600">
								Couldn’t load organization.
							</p>
						) : (
							<div className="space-y-3">
								<div className="space-y-2 text-[12px]">
									<div className="flex justify-between gap-2">
										<span className="text-text-sub-600">Name</span>
										<span className="font-medium">{org.name}</span>
									</div>
									<div className="flex justify-between gap-2">
										<span className="text-text-sub-600">Slug</span>
										<span className="font-mono text-[11px]">{org.slug}</span>
									</div>
									<div className="flex justify-between gap-2">
										<span className="text-text-sub-600">Members</span>
										<span className="font-medium">
											{org.counts?.members ?? org.members.length}
										</span>
									</div>
									<div className="flex justify-between gap-2">
										<span className="text-text-sub-600">Domains</span>
										<span className="font-medium">
											{org.counts?.domains ?? org.domains.length}
										</span>
									</div>
								</div>
								{org.domains.length > 0 ? (
									<div className="space-y-1">
										<p className="text-[11px] text-text-sub-600">Domains</p>
										{org.domains.slice(0, 5).map((d) => (
											<div
												key={d.id}
												className="flex items-center justify-between gap-2 rounded-lg bg-bg-weak-50 px-2 py-1.5 dark:bg-white/[0.04]"
											>
												<span className="truncate font-medium text-[11px]">
													{d.domain}
												</span>
												<StatusPill status={d.status} />
											</div>
										))}
									</div>
								) : null}
							</div>
						)}
					</Collapsible>
				) : null}

				<Collapsible title="Thread" defaultOpen={false}>
					<div className="space-y-2 text-[12px]">
						<div className="flex justify-between gap-2">
							<span className="text-text-sub-600">Status</span>
							<StatusPill status={conversation.status} />
						</div>
						<div className="flex justify-between gap-2">
							<span className="text-text-sub-600">Started</span>
							<span className="font-medium">
								{formatRelativeTime(conversation.createdAt)}
							</span>
						</div>
						<div className="flex justify-between gap-2">
							<span className="text-text-sub-600">Last message</span>
							<span className="font-medium">
								{formatRelativeTime(conversation.lastMessageAt)}
							</span>
						</div>
					</div>
				</Collapsible>
			</div>
		</aside>
	);
}
