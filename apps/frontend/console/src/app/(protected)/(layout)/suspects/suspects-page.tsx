"use client";

import {
	SuspectCategory,
	SuspectSeverity,
	SuspectionDrawer,
} from "@fe/console/components/suspection-drawer";
import { Metric, MetricGrid } from "@fe/console/components/ui/metric-grid";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { TablePagination } from "@fe/console/components/ui/table-pagination";
import { adminGet } from "@fe/console/lib/admin-api";
import { formatDateTime, formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import * as Input from "@reloop/ui/input";
import {
	AlertOctagon,
	AlertTriangle,
	Building2,
	ExternalLink,
	Flame,
	Info,
	Mail,
	RotateCcw,
	Search,
	ShieldAlert,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type SuspectItem = {
	type: "user" | "organization";
	id: string;
	name: string;
	identifier: string;
	email?: string | null;
	slug?: string | null;
	isSuspect: boolean;
	suspectReason: string | null;
	suspectSeverity: SuspectSeverity | null;
	suspectCategory: SuspectCategory | null;
	suspectUpdatedAt: string | null;
	createdAt: string;
	associatedCount: number;
	associatedName?: string | null;
};

type SuspectsResponse = {
	items: SuspectItem[];
	total: number;
	stats: {
		totalSuspects: number;
		usersCount: number;
		orgsCount: number;
		criticalCount: number;
		highCount: number;
	};
};

const CATEGORY_ICONS: Record<string, typeof AlertTriangle> = {
	spam: Flame,
	fraud: ShieldAlert,
	phishing: AlertOctagon,
	abuse: AlertTriangle,
	other: Info,
};

const SEVERITY_TONE: Record<
	string,
	"red" | "orange" | "yellow" | "blue" | "green" | "gray"
> = {
	critical: "red",
	high: "orange",
	medium: "orange",
	low: "blue",
};

export default function SuspectsPage() {
	// Query state
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [type, setType] = useQueryState("type", parseAsString.withDefault("all"));
	const [severity, setSeverity] = useQueryState(
		"severity",
		parseAsString.withDefault("all"),
	);
	const [category, setCategory] = useQueryState(
		"category",
		parseAsString.withDefault("all"),
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit, setLimit] = useQueryState(
		"limit",
		parseAsInteger.withDefault(50),
	);

	const [draftQ, setDraftQ] = useState(q);
	const [activeDrawerItem, setActiveDrawerItem] = useState<SuspectItem | null>(
		null,
	);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [inspectEmailItem, setInspectEmailItem] = useState<SuspectItem | null>(
		null,
	);

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const offset = Math.max(0, (page - 1) * limit);

	const { data, isLoading, mutate } = useSWR<SuspectsResponse>(
		["/suspects", q, type, severity, category, page, limit],
		() =>
			adminGet<SuspectsResponse>("/suspects", {
				q: q || undefined,
				type: type !== "all" ? type : undefined,
				severity: severity !== "all" ? severity : undefined,
				category: category !== "all" ? category : undefined,
				limit,
				offset,
			}),
	);

	const hasActiveFilters =
		Boolean(q) || type !== "all" || severity !== "all" || category !== "all";

	const resetFilters = () => {
		setQ("");
		setDraftQ("");
		setType("all");
		setSeverity("all");
		setCategory("all");
		setPage(1);
	};

	const metrics: Metric[] = useMemo(() => {
		const stats = data?.stats;
		return [
			{
				label: "Total Suspects",
				value: stats?.totalSuspects ?? 0,
				hint: "Active spam & fraud flags",
				tone: (stats?.totalSuspects ?? 0) > 0 ? "warning" : "default",
			},
			{
				label: "Suspect Users",
				value: stats?.usersCount ?? 0,
				hint: "Flagged user accounts",
				tone: (stats?.usersCount ?? 0) > 0 ? "danger" : "default",
			},
			{
				label: "Suspect Organizations",
				value: stats?.orgsCount ?? 0,
				hint: "Flagged tenant accounts",
				tone: (stats?.orgsCount ?? 0) > 0 ? "warning" : "default",
			},
			{
				label: "Critical & High Risk",
				value: (stats?.criticalCount ?? 0) + (stats?.highCount ?? 0),
				hint: `${stats?.criticalCount ?? 0} critical, ${stats?.highCount ?? 0} high`,
				tone:
					(stats?.criticalCount ?? 0) + (stats?.highCount ?? 0) > 0
						? "danger"
						: "default",
			},
		];
	}, [data?.stats]);

	return (
		<PageFrame className="space-y-6">
			{/* Page Header */}
			<PageHeading
				title="Suspect Accounts"
				description="Direct database flags for users and organizations suspected of spamming, scamming, phishing, or abuse."
				meta={
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 font-semibold text-[12px] text-red-600 dark:text-red-400">
							<ShieldAlert className="h-3.5 w-3.5" />
							{data?.stats?.totalSuspects ?? 0} Suspects in Database
						</span>
					</div>
				}
				actions={
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => mutate()}
					>
						<RotateCcw className="mr-1.5 h-3.5 w-3.5" />
						Refresh
					</Button.Root>
				}
			/>

			{/* Metric Grid */}
			<MetricGrid items={metrics} />

			{/* Filter & Search Bar */}
			<div className="space-y-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
				<div className="flex flex-wrap items-center justify-between gap-3">
					{/* Search */}
					<form
						className="relative flex-1 min-w-[240px] max-w-md"
						onSubmit={(e) => {
							e.preventDefault();
							setQ(draftQ);
							setPage(1);
						}}
					>
						<Input.Root size="small">
							<Input.Icon as={Search} />
							<Input.Input
								value={draftQ}
								onChange={(e) => setDraftQ(e.target.value)}
								placeholder="Search suspect name, email, slug, reason…"
							/>
							{draftQ ? (
								<button
									type="button"
									onClick={() => {
										setDraftQ("");
										setQ("");
										setPage(1);
									}}
									className="text-text-sub-600 hover:text-text-strong-950"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							) : null}
						</Input.Root>
					</form>

					{/* Filters */}
					<div className="flex flex-wrap items-center gap-2">
						{/* Type Filter */}
						<select
							value={type}
							onChange={(e) => {
								setType(e.target.value);
								setPage(1);
							}}
							className="h-8 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-[12px] text-text-strong-950 outline-none hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#121212] dark:hover:bg-white/[0.04]"
						>
							<option value="all">All Types</option>
							<option value="user">Users Only</option>
							<option value="organization">Organizations Only</option>
						</select>

						{/* Severity Filter */}
						<select
							value={severity}
							onChange={(e) => {
								setSeverity(e.target.value);
								setPage(1);
							}}
							className="h-8 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-[12px] text-text-strong-950 outline-none hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#121212] dark:hover:bg-white/[0.04]"
						>
							<option value="all">All Severities</option>
							<option value="critical">Critical</option>
							<option value="high">High</option>
							<option value="medium">Medium</option>
							<option value="low">Low</option>
						</select>

						{/* Category Filter */}
						<select
							value={category}
							onChange={(e) => {
								setCategory(e.target.value);
								setPage(1);
							}}
							className="h-8 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 text-[12px] text-text-strong-950 outline-none hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-[#121212] dark:hover:bg-white/[0.04]"
						>
							<option value="all">All Categories</option>
							<option value="spam">Spamming</option>
							<option value="fraud">Scam / Fraud</option>
							<option value="phishing">Phishing</option>
							<option value="abuse">System Abuse</option>
							<option value="other">Other</option>
						</select>

						{hasActiveFilters ? (
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={resetFilters}
							>
								<X className="mr-1 h-3.5 w-3.5" />
								Reset
							</Button.Root>
						) : null}
					</div>
				</div>
			</div>

			{/* Data Table */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<DataTable
					headers={[
						"Target Entity",
						"Category",
						"Severity",
						"Reason / Notes",
						"Scope",
						"Flagged",
						"Actions",
					]}
					colSpan={7}
					loading={isLoading}
					empty={!isLoading && !data?.items.length}
					emptyTitle={
						hasActiveFilters
							? "No suspects match filter"
							: "No suspected accounts in database"
					}
				>
					{data?.items.map((item) => {
						const IconComp = item.suspectCategory
							? (CATEGORY_ICONS[item.suspectCategory] ?? AlertTriangle)
							: AlertTriangle;
						const tone = item.suspectSeverity
							? (SEVERITY_TONE[item.suspectSeverity] ?? "red")
							: "red";

						const resolvedEmail =
							item.email || (item.type === "user" ? item.identifier : null);

						return (
							<tr
								key={`${item.type}-${item.id}`}
								className="border-stroke-soft-100 border-t transition-colors hover:bg-bg-weak-50/80 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.02]"
							>
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs",
												item.type === "user"
													? "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
													: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
											)}
										>
											{item.type === "user" ? (
												<User className="h-4 w-4" />
											) : (
												<Building2 className="h-4 w-4" />
											)}
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<Link
													href={
														item.type === "user"
															? `/users/${item.id}`
															: `/organizations/${item.id}`
													}
													className="truncate font-semibold text-[13px] text-text-strong-950 hover:underline"
												>
													{item.name || (item.type === "user" ? "Unnamed User" : "Unnamed Org")}
												</Link>
												<span className="rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 text-[10px] text-text-sub-600 uppercase tracking-wider dark:border-white/10 dark:bg-white/[0.04]">
													{item.type}
												</span>
											</div>
											{resolvedEmail ? (
												<div className="flex items-center gap-1.5 text-text-sub-600 mt-0.5">
													<Mail className="h-3 w-3 text-text-soft-400 shrink-0" />
													<span className="truncate font-mono text-[11px] text-text-strong-950 dark:text-gray-200">
														{resolvedEmail}
													</span>
													{item.slug ? (
														<span className="text-[10px] text-text-soft-400 font-mono shrink-0">
															({item.slug})
														</span>
													) : null}
												</div>
											) : (
												<p className="truncate font-mono text-[11px] text-text-sub-600 mt-0.5">
													{item.identifier}
												</p>
											)}
										</div>
									</div>
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center gap-1.5">
										<IconComp className="h-4 w-4 text-orange-500 shrink-0" />
										<span className="font-medium text-[12px] text-text-strong-950 capitalize">
											{item.suspectCategory || "Spam"}
										</span>
									</div>
								</td>
								<td className="px-4 py-3">
									<StatusPill
										status={item.suspectSeverity || "high"}
										tone={tone}
									/>
								</td>
								<td className="px-4 py-3">
									<div className="max-w-xs">
										<p className="line-clamp-2 text-[12px] text-text-strong-950 leading-snug">
											{item.suspectReason || "(No reason specified)"}
										</p>
									</div>
								</td>
								<td className="px-4 py-3">
									<span className="text-[12px] text-text-sub-600">
										{item.type === "user"
											? `${item.associatedCount} org(s)`
											: `${item.associatedCount} member(s)`}
									</span>
								</td>
								<td className="px-4 py-3">
									<span
										className="text-[12px] text-text-sub-600"
										title={
											item.suspectUpdatedAt
												? formatDateTime(item.suspectUpdatedAt)
												: formatDateTime(item.createdAt)
										}
									>
										{item.suspectUpdatedAt
											? formatRelativeTime(item.suspectUpdatedAt)
											: formatRelativeTime(item.createdAt)}
									</span>
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center gap-2">
										<Button.Root
											variant="neutral"
											mode="stroke"
											size="small"
											onClick={() => setInspectEmailItem(item)}
											title="Inspect recent outbound emails"
										>
											<Mail className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
											Emails
										</Button.Root>
										<Button.Root
											variant="neutral"
											mode="stroke"
											size="small"
											onClick={() => {
												setActiveDrawerItem(item);
												setDrawerOpen(true);
											}}
										>
											<ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
											Suspection
										</Button.Root>
										<Button.Root
											asChild
											variant="neutral"
											mode="ghost"
											size="small"
											title="Open full hub"
										>
											<Link
												href={
													item.type === "user"
														? `/users/${item.id}`
														: `/organizations/${item.id}`
												}
											>
												<ExternalLink className="h-3.5 w-3.5" />
											</Link>
										</Button.Root>
									</div>
								</td>
							</tr>
						);
					})}
				</DataTable>
			</div>

			{/* Pagination */}
			{data?.total ? (
				<TablePagination
					total={data.total}
					page={page}
					limit={limit}
					onPageChange={setPage}
					onLimitChange={setLimit}
				/>
			) : null}

			{/* Slide-over Drawer for Suspection Editing */}
			{activeDrawerItem ? (
				<SuspectionDrawer
					open={drawerOpen}
					onOpenChange={setDrawerOpen}
					entityType={activeDrawerItem.type}
					entityId={activeDrawerItem.id}
					entityName={activeDrawerItem.name}
					entityIdentifier={activeDrawerItem.identifier}
					entityEmail={activeDrawerItem.email}
					entitySlug={activeDrawerItem.slug}
					initialIsSuspect={activeDrawerItem.isSuspect}
					initialReason={activeDrawerItem.suspectReason}
					initialSeverity={activeDrawerItem.suspectSeverity}
					initialCategory={activeDrawerItem.suspectCategory}
					associatedCount={activeDrawerItem.associatedCount}
					onSuccess={() => {
						mutate();
					}}
				/>
			) : null}

			{/* Slide-over Drawer for Inspecting Outbound Emails */}
			<SuspectEmailsDrawer
				open={Boolean(inspectEmailItem)}
				onOpenChange={(open) => {
					if (!open) setInspectEmailItem(null);
				}}
				item={inspectEmailItem}
			/>
		</PageFrame>
	);
}

type EmailPreviewItem = {
	id: string;
	organizationId: string;
	fromEmail: string;
	toEmails: string[] | unknown;
	subject: string;
	status: string;
	createdAt: string;
	sentAt: string | null;
};

type EmailsPreviewResponse = {
	items: EmailPreviewItem[];
	total: number;
};

function SuspectEmailsDrawer({
	open,
	onOpenChange,
	item,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: SuspectItem | null;
}) {
	const shouldFetch = open && Boolean(item);
	const { data, isLoading } = useSWR<EmailsPreviewResponse>(
		shouldFetch
			? ["/emails/suspect-preview", item?.type, item?.id]
			: null,
		() =>
			adminGet<EmailsPreviewResponse>("/emails", {
				organizationId: item?.type === "organization" ? item.id : undefined,
				userId: item?.type === "user" ? item.id : undefined,
				limit: 20,
				offset: 0,
			}),
	);

	if (!item) return null;

	const resolvedEmail =
		item.email || (item.type === "user" ? item.identifier : null);
	const hubUrl =
		item.type === "organization"
			? `/emails?organizationId=${item.id}`
			: `/emails?userId=${item.id}`;

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content className="w-full max-w-2xl border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#121212]">
				<Drawer.Header className="flex items-center justify-between border-stroke-soft-100 border-b px-6 py-4.5 dark:border-stroke-soft-100/40">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
							<Mail className="h-5 w-5" />
						</div>
						<div className="min-w-0">
							<Drawer.Title className="truncate font-semibold text-[16px] text-text-strong-950">
								Outbound Emails · {item.name}
							</Drawer.Title>
							<p className="truncate text-[12px] text-text-sub-600">
								Inspect recent email activity to identify spam or scam abuse
							</p>
						</div>
					</div>
				</Drawer.Header>

				<Drawer.Body className="space-y-4 overflow-y-auto px-6 py-5">
					{/* Target Entity Card */}
					<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/60 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<span className="font-semibold text-[14px] text-text-strong-950">
										{item.name}
									</span>
									<span className="rounded border border-stroke-soft-200 bg-bg-white-0 px-1.5 py-0.5 text-[10px] text-text-sub-600 uppercase tracking-wider dark:border-white/10 dark:bg-white/[0.04]">
										{item.type}
									</span>
								</div>
								<div className="mt-1 flex items-center gap-1.5 text-text-sub-600">
									<Mail className="h-3.5 w-3.5 text-text-soft-400 shrink-0" />
									<span className="font-mono text-[12px] text-text-strong-950 dark:text-gray-200">
										{resolvedEmail || "No direct email linked"}
									</span>
									{item.slug ? (
										<span className="text-[11px] text-text-soft-400 font-mono">
											(slug: {item.slug})
										</span>
									) : null}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 font-semibold text-[11px] text-orange-600 capitalize dark:text-orange-400">
									Flagged for {item.suspectCategory || "spam"}
								</span>
							</div>
						</div>
					</div>

					{/* Outbound Email Logs */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold text-[12px] text-text-strong-950 uppercase tracking-wider">
								Recent Sends ({data?.total ?? (isLoading ? "…" : 0)})
							</h4>
							<a
								href={hubUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-[12px] text-text-sub-600 hover:text-text-strong-950 underline"
							>
								Open in Emails Hub
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>

						{isLoading ? (
							<div className="space-y-2 py-4">
								{[...Array(4)].map((_, i) => (
									<div
										key={i}
										className="h-16 animate-pulse rounded-xl border border-stroke-soft-100 bg-bg-weak-50/40 p-3"
									/>
								))}
							</div>
						) : !data?.items?.length ? (
							<div className="rounded-xl border border-dashed border-stroke-soft-200 py-10 text-center dark:border-white/10">
								<Mail className="mx-auto h-8 w-8 text-text-soft-400" />
								<p className="mt-2 font-medium text-[13px] text-text-strong-950">
									No outbound emails recorded
								</p>
								<p className="mt-1 text-[12px] text-text-sub-600">
									This account has not sent any emails through the platform yet.
								</p>
							</div>
						) : (
							<div className="divide-y divide-stroke-soft-100 rounded-xl border border-stroke-soft-100 overflow-hidden dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40">
								{data.items.map((email) => {
									const recipients = Array.isArray(email.toEmails)
										? email.toEmails.join(", ")
										: String(email.toEmails || "");
									return (
										<div
											key={email.id}
											className="flex items-start justify-between gap-3 p-3 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
										>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<p className="truncate font-semibold text-[13px] text-text-strong-950">
														{email.subject || "(No subject)"}
													</p>
													<span
														className={cn(
															"rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
															email.status === "delivered" || email.status === "sent"
																? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
																: email.status === "failed" || email.status === "bounced" || email.status === "spam"
																	? "bg-red-500/10 text-red-600 dark:text-red-400"
																	: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
														)}
													>
														{email.status}
													</span>
												</div>
												<p className="mt-1 truncate text-[11px] text-text-sub-600">
													<span className="text-text-soft-400">To:</span>{" "}
													<span className="font-mono text-text-strong-950 dark:text-gray-300">
														{recipients}
													</span>
													{" · "}
													<span className="text-text-soft-400">From:</span>{" "}
													<span className="font-mono">{email.fromEmail}</span>
												</p>
											</div>
											<div className="shrink-0 text-right">
												<p className="text-[11px] text-text-sub-600">
													{formatRelativeTime(email.createdAt)}
												</p>
												<Link
													href={`/emails/${email.id}`}
													className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline dark:text-blue-400"
												>
													View Email
													<ExternalLink className="h-2.5 w-2.5" />
												</Link>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</Drawer.Body>

				<Drawer.Footer className="border-stroke-soft-100 border-t px-6 py-3.5 dark:border-stroke-soft-100/40">
					<div className="flex items-center justify-between w-full">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button.Root>
						<Button.Root asChild variant="neutral" mode="stroke" size="small">
							<a href={hubUrl} target="_blank" rel="noreferrer">
								<Mail className="mr-1.5 h-3.5 w-3.5" />
								Open All {data?.total ?? ""} Sends in Hub
								<ExternalLink className="ml-1 h-3 w-3" />
							</a>
						</Button.Root>
					</div>
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer.Root>
	);
}
