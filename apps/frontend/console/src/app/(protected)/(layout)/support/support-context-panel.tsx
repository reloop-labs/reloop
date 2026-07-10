"use client";

import { ConfirmActionDialog } from "@fe/console/components/confirm-action-dialog";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import type { SupportConversation } from "@fe/console/lib/support-types";
import { authClient } from "@reloop/auth/client";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import * as Avatar from "@reloop/ui/avatar";
import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import { Ban, Clock3, ExternalLink } from "lucide-react";
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

function formatJoined(value: string | Date | null | undefined) {
	if (!value) return null;
	try {
		return new Date(value).toLocaleDateString(undefined, {
			day: "numeric",
			month: "short",
		});
	} catch {
		return null;
	}
}

function formatDate(value: string | Date | null | undefined) {
	if (!value) return "—";
	try {
		return new Date(value).toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return String(value);
	}
}

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

function DetailRow({
	label,
	value,
	mono,
}: {
	label: string;
	value: React.ReactNode;
	mono?: boolean;
}) {
	return (
		<div className="flex items-start justify-between gap-3 py-1.5">
			<span className="shrink-0 text-[12px] text-text-sub-600">{label}</span>
			<span
				className={cn(
					"min-w-0 text-right text-[12px] text-text-strong-950",
					mono && "break-all font-mono text-[11px]",
				)}
			>
				{value ?? "—"}
			</span>
		</div>
	);
}

function Section({
	title,
	action,
	children,
}: {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="border-stroke-soft-100 border-b px-4 py-4 last:border-b-0">
			<div className="mb-2.5 flex items-center justify-between gap-2">
				<h3 className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wide">
					{title}
				</h3>
				{action}
			</div>
			{children}
		</section>
	);
}

async function fetchAdminUser(userId: string): Promise<AdminUser | null> {
	const { data, error } = await authClient.admin.getUser({
		query: { id: userId },
	});
	if (error || !data) return null;
	return data as AdminUser;
}

export function SupportContextPanel({
	conversation,
}: {
	conversation: SupportConversation;
}) {
	const [amount, setAmount] = useState("");
	const [adjustment, setAdjustment] = useState<"add" | "remove">("add");
	const [reason, setReason] = useState("");
	const [applying, setApplying] = useState(false);
	const [suspendOpen, setSuspendOpen] = useState(false);

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
	const memberRole = org?.members.find(
		(m) => m.userId === conversation.userId,
	)?.role;
	const joined = formatJoined(user?.createdAt);
	const balance = org?.credits?.creditsRemaining ?? null;

	const planLabel = useMemo(() => {
		if (!org?.credits) return "No plan";
		// Credits service currently provisions a Free-tier monthly allotment
		return "Free plan";
	}, [org?.credits]);

	const metaLine = [planLabel, joined ? `Joined ${joined}` : null]
		.filter(Boolean)
		.join(" · ");

	const applyAdjustment = async () => {
		if (!org) {
			toast.error("No organization to adjust credits for");
			return;
		}
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) {
			toast.error("Enter a positive amount");
			return;
		}
		if (adjustment === "remove") {
			toast.error("Credit removal isn’t available yet — use Add credits");
			return;
		}
		setApplying(true);
		try {
			await adminPost("/credits/topup", {
				organizationId: org.id,
				amount: value,
				reason:
					reason.trim() ||
					`Support adjustment for ${displayEmail} (${conversation.id})`,
			});
			toast.success(`Added ${value.toLocaleString()} credits`);
			setAmount("");
			setReason("");
			void mutateOrg();
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "Failed to apply adjustment",
			);
		} finally {
			setApplying(false);
		}
	};

	return (
		<aside className="flex w-[22rem] shrink-0 flex-col overflow-hidden border-stroke-soft-100 border-l bg-bg-weak-50/40">
			<div className="min-h-0 flex-1 overflow-y-auto p-3">
				{/* Top fold — account / credits card */}
				<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm">
					<div className="flex items-center gap-3 px-4 pt-4 pb-3">
						<Avatar.Root size="40" color="blue" className="shrink-0">
							{displayImage ? (
								<Avatar.Image src={displayImage} alt={displayName} />
							) : (
								<Avatar.Image asChild>
									<div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 font-semibold text-[13px] text-blue-900 uppercase">
										{avatarInitials(displayName, displayEmail)}
									</div>
								</Avatar.Image>
							)}
						</Avatar.Root>
						<div className="min-w-0">
							<p className="truncate font-semibold text-[14px] text-text-strong-950">
								{displayEmail}
							</p>
							<p className="mt-0.5 truncate text-[12px] text-text-sub-600">
								{userLoading ? "Loading…" : metaLine || "—"}
							</p>
						</div>
					</div>

					<div className="border-stroke-soft-100 border-t px-4 py-3">
						<p className="text-[12px] text-text-sub-600">Current balance</p>
						<p className="mt-0.5 font-semibold text-[20px] text-text-strong-950 tabular-nums tracking-tight">
							{orgLoading
								? "…"
								: balance === null
									? "No credits"
									: `${balance.toLocaleString()} credits`}
						</p>

						<div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
							<input
								type="number"
								min={1}
								step={1}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="Amount"
								disabled={!org}
								className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-stroke-strong-950 disabled:opacity-50"
							/>
							<select
								value={adjustment}
								onChange={(e) =>
									setAdjustment(e.target.value as "add" | "remove")
								}
								disabled={!org}
								className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-[13px] text-text-strong-950 outline-none focus:border-stroke-strong-950 disabled:opacity-50"
							>
								<option value="add">Add credits</option>
								<option value="remove">Remove credits</option>
							</select>
						</div>

						<textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Reason (shown in audit log)"
							rows={2}
							disabled={!org}
							className="mt-2 w-full resize-none rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400 focus:border-stroke-strong-950 disabled:opacity-50"
						/>

						<button
							type="button"
							onClick={() => void applyAdjustment()}
							disabled={!org || applying || !amount.trim()}
							className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{applying ? "Applying…" : "Apply adjustment"}
							<ExternalLink className="h-3.5 w-3.5 text-text-sub-600" />
						</button>
					</div>

					<div className="space-y-2 border-stroke-soft-100 border-t px-4 py-3">
						{org ? (
							<Link
								href={`/credits?organizationId=${org.id}`}
								className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50"
							>
								<Clock3 className="h-3.5 w-3.5 text-text-sub-600" />
								View usage history
							</Link>
						) : (
							<button
								type="button"
								disabled
								className="flex h-9 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 font-medium text-[13px] text-text-soft-400 opacity-50"
							>
								<Clock3 className="h-3.5 w-3.5" />
								View usage history
							</button>
						)}
						<button
							type="button"
							onClick={() => setSuspendOpen(true)}
							disabled={!org || org.status === "suspended"}
							className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Ban className="h-3.5 w-3.5 text-text-sub-600" />
							{org?.status === "suspended"
								? "Account suspended"
								: "Suspend account"}
						</button>
					</div>
				</div>

				{/* Deeper context below the fold */}
				<div className="mt-3 overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0">
					<Section title="User">
						{userLoading ? (
							<p className="text-[12px] text-text-sub-600">Loading…</p>
						) : (
							<div className="divide-y divide-stroke-soft-100">
								<DetailRow label="Name" value={displayName} />
								<DetailRow
									label="Type"
									value={isPlatformAdmin ? "Super admin" : "User"}
								/>
								<DetailRow
									label="Role"
									value={
										<Badge.Root
											variant="light"
											color={isPlatformAdmin ? "purple" : "gray"}
										>
											{role}
										</Badge.Root>
									}
								/>
								<DetailRow
									label="Status"
									value={
										<Badge.Root
											variant="light"
											color={user?.banned ? "red" : "green"}
										>
											{user?.banned ? "Banned" : "Active"}
										</Badge.Root>
									}
								/>
								{user?.banned && user.banReason ? (
									<DetailRow label="Ban reason" value={user.banReason} />
								) : null}
								<DetailRow
									label="Email verified"
									value={user?.emailVerified ? "Yes" : "No"}
								/>
								{memberRole ? (
									<DetailRow label="Org role" value={memberRole} />
								) : null}
								<DetailRow label="User ID" value={conversation.userId} mono />
							</div>
						)}
					</Section>

					<Section
						title="Organization"
						action={
							org ? (
								<Link
									href={`/organizations/${org.id}`}
									className="text-[11px] text-primary-base hover:underline"
								>
									Open →
								</Link>
							) : null
						}
					>
						{!orgId ? (
							<p className="text-[12px] text-text-sub-600">
								No organization linked to this conversation.
							</p>
						) : orgLoading ? (
							<p className="text-[12px] text-text-sub-600">Loading…</p>
						) : orgError || !org ? (
							<p className="text-[12px] text-text-sub-600">
								Couldn’t load organization.
							</p>
						) : (
							<div className="divide-y divide-stroke-soft-100">
								<DetailRow label="Name" value={org.name} />
								<DetailRow label="Slug" value={org.slug} mono />
								<DetailRow
									label="Status"
									value={
										<Badge.Root
											variant="light"
											color={
												org.status === "active"
													? "green"
													: org.status === "suspended"
														? "red"
														: "gray"
											}
										>
											{org.status}
										</Badge.Root>
									}
								/>
								<DetailRow
									label="Billing email"
									value={org.billingEmail || "—"}
								/>
								<DetailRow label="Created" value={formatDate(org.createdAt)} />
								<DetailRow label="Org ID" value={org.id} mono />
							</div>
						)}
					</Section>

					{org ? (
						<Section title={`Members (${org.members.length})`}>
							{org.members.length === 0 ? (
								<p className="text-[12px] text-text-sub-600">No members</p>
							) : (
								<div className="space-y-1.5">
									{org.members.map((m) => {
										const isCustomer = m.userId === conversation.userId;
										return (
											<div
												key={m.id}
												className={cn(
													"rounded-xl px-2.5 py-2",
													isCustomer ? "bg-blue-50" : "bg-bg-weak-50",
												)}
											>
												<div className="flex items-start justify-between gap-2">
													<div className="min-w-0">
														<p className="truncate font-medium text-[12px] text-text-strong-950">
															{m.userName}
															{isCustomer ? " · customer" : ""}
														</p>
														<p className="truncate text-[11px] text-text-sub-600">
															{m.userEmail}
														</p>
													</div>
													<Badge.Root variant="light" color="gray">
														{m.role}
													</Badge.Root>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</Section>
					) : null}

					{org ? (
						<Section title={`Domains (${org.domains.length})`}>
							{org.domains.length === 0 ? (
								<p className="text-[12px] text-text-sub-600">No domains</p>
							) : (
								<div className="space-y-1.5">
									{org.domains.map((d) => (
										<div
											key={d.id}
											className="flex items-center justify-between gap-2 rounded-xl bg-bg-weak-50 px-2.5 py-2"
										>
											<p className="min-w-0 truncate font-medium text-[12px] text-text-strong-950">
												{d.domain}
											</p>
											<Badge.Root
												variant="light"
												color={d.status === "active" ? "green" : "gray"}
											>
												{d.status}
											</Badge.Root>
										</div>
									))}
								</div>
							)}
						</Section>
					) : null}

					<Section title="Conversation">
						<div className="divide-y divide-stroke-soft-100">
							<DetailRow
								label="Status"
								value={
									<Badge.Root
										variant="light"
										color={conversation.status === "open" ? "green" : "gray"}
									>
										{conversation.status}
									</Badge.Root>
								}
							/>
							<DetailRow
								label="Started"
								value={formatDate(conversation.createdAt)}
							/>
							<DetailRow
								label="Last message"
								value={formatDate(conversation.lastMessageAt)}
							/>
							<DetailRow label="Thread ID" value={conversation.id} mono />
						</div>
					</Section>
				</div>
			</div>

			{org ? (
				<ConfirmActionDialog
					open={suspendOpen}
					onOpenChange={setSuspendOpen}
					title="Suspend account"
					description={`Suspend ${org.name}? Members will lose access until reactivated.`}
					confirmLabel="Suspend"
					destructive
					onConfirm={async () => {
						await adminPatch(`/organizations/${org.id}/status`, {
							status: "suspended",
							reason: `Suspended from support chat (${conversation.id})`,
						});
						toast.success("Organization suspended");
						void mutateOrg();
					}}
				/>
			) : null}
		</aside>
	);
}
