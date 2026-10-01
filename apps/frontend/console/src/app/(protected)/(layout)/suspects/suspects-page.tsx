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
import * as Input from "@reloop/ui/input";
import {
	AlertOctagon,
	AlertTriangle,
	Building2,
	ExternalLink,
	Flame,
	Info,
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
													{item.name}
												</Link>
												<span className="rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 text-[10px] text-text-sub-600 uppercase tracking-wider dark:border-white/10 dark:bg-white/[0.04]">
													{item.type}
												</span>
											</div>
											<p className="truncate font-mono text-[11px] text-text-sub-600">
												{item.identifier}
											</p>
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
		</PageFrame>
	);
}
