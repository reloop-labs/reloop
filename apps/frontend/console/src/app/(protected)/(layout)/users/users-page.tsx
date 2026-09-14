"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { TablePagination } from "@fe/console/components/ui/table-pagination";
import { formatDateTime, formatRelativeTime } from "@fe/console/lib/format";
import { authClient } from "@reloop/auth/client";
import { DEFAULT_USER_ROLE, PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Input from "@reloop/ui/input";
import {
	RotateCcw,
	Search,
	Shield,
	UserCheck,
	Users as UsersIcon,
	UserX,
	X,
} from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AdminUser = {
	id: string;
	name: string;
	email: string;
	role?: string | null;
	banned?: boolean | null;
	banReason?: string | null;
	createdAt?: string | Date;
};

const SORT_OPTIONS = [
	{ label: "Newest first", value: "newest" },
	{ label: "Oldest first", value: "oldest" },
	{ label: "Email (A → Z)", value: "email_asc" },
	{ label: "Email (Z → A)", value: "email_desc" },
	{ label: "Name (A → Z)", value: "name_asc" },
	{ label: "Name (Z → A)", value: "name_desc" },
] as const;

function getSortParams(sortKey: string) {
	switch (sortKey) {
		case "oldest":
			return { sortBy: "createdAt", sortDirection: "asc" as const };
		case "email_asc":
			return { sortBy: "email", sortDirection: "asc" as const };
		case "email_desc":
			return { sortBy: "email", sortDirection: "desc" as const };
		case "name_asc":
			return { sortBy: "name", sortDirection: "asc" as const };
		case "name_desc":
			return { sortBy: "name", sortDirection: "desc" as const };
		default:
			return { sortBy: "createdAt", sortDirection: "desc" as const };
	}
}

export default function UsersPage() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [total, setTotal] = useState(0);

	// URL Query state
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [searchField, setSearchField] = useQueryState(
		"searchField",
		parseAsString.withDefault("email"),
	);
	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault("all"),
	);
	const [role, setRole] = useQueryState(
		"role",
		parseAsString.withDefault("all"),
	);
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsString.withDefault("newest"),
	);
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [limit, setLimit] = useQueryState(
		"limit",
		parseAsInteger.withDefault(50),
	);

	const [draftQ, setDraftQ] = useState(q);
	const [loading, setLoading] = useState(true);
	const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
	const [promoteTarget, setPromoteTarget] = useState<AdminUser | null>(null);
	const [impersonateTarget, setImpersonateTarget] = useState<AdminUser | null>(
		null,
	);

	const hasActiveFilters =
		Boolean(q) ||
		status !== "all" ||
		role !== "all" ||
		sort !== "newest" ||
		searchField !== "email";

	const loadUsers = async () => {
		setLoading(true);
		try {
			const sortParams = getSortParams(sort);
			const offset = Math.max(0, (page - 1) * limit);

			// Server-side filter field selection
			let filterFieldParam: string | undefined;
			let filterValueParam: unknown;

			if (role && role !== "all") {
				filterFieldParam = "role";
				filterValueParam = role;
			} else if (status && status !== "all") {
				filterFieldParam = "banned";
				filterValueParam = status === "banned";
			}

			const queryPayload: Record<string, unknown> = {
				limit,
				offset,
				sortBy: sortParams.sortBy,
				sortDirection: sortParams.sortDirection,
			};

			if (q.trim()) {
				queryPayload.searchValue = q.trim();
				queryPayload.searchField = searchField === "name" ? "name" : "email";
				queryPayload.searchOperator = "contains";
			}

			if (filterFieldParam !== undefined && filterValueParam !== undefined) {
				queryPayload.filterField = filterFieldParam;
				queryPayload.filterValue = filterValueParam;
				queryPayload.filterOperator = "eq";
			}

			const { data, error } = await authClient.admin.listUsers({
				query: queryPayload,
			});

			if (error) {
				// Resilient fallback: if server throws on boolean filter operator, fallback to unconstrained query with client filter
				if (filterFieldParam) {
					delete queryPayload.filterField;
					delete queryPayload.filterValue;
					delete queryPayload.filterOperator;
					const fallbackRes = await authClient.admin.listUsers({
						query: queryPayload,
					});
					if (!fallbackRes.error && fallbackRes.data) {
						let fallbackUsers = (fallbackRes.data.users as AdminUser[]) ?? [];
						if (role && role !== "all") {
							fallbackUsers = fallbackUsers.filter(
								(u) => (u.role || DEFAULT_USER_ROLE) === role,
							);
						}
						if (status && status !== "all") {
							fallbackUsers = fallbackUsers.filter((u) =>
								status === "banned" ? Boolean(u.banned) : !u.banned,
							);
						}
						setUsers(fallbackUsers);
						setTotal(fallbackUsers.length);
						return;
					}
				}
				toast.error(error.message || "Failed to list users");
				return;
			}

			let resultUsers = (data?.users as AdminUser[]) ?? [];

			// Multi-filter refinement: when both role and status are set, role was filtered on server, refine status here
			if (role && role !== "all" && status && status !== "all") {
				resultUsers = resultUsers.filter((u) =>
					status === "banned" ? Boolean(u.banned) : !u.banned,
				);
			}

			setUsers(resultUsers);
			setTotal(data?.total ?? resultUsers.length);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to load users";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reload on filter change
	useEffect(() => {
		loadUsers();
	}, [q, searchField, status, role, sort, page, limit]);

	useEffect(() => {
		if (total > 0) {
			const totalPages = Math.ceil(total / limit);
			if (page > totalPages) {
				setPage(totalPages);
			}
		}
	}, [total, limit, page, setPage]);

	const handleResetFilters = () => {
		setQ(null);
		setDraftQ("");
		setSearchField(null);
		setStatus(null);
		setRole(null);
		setSort(null);
		setPage(1);
	};

	const quickTabs = [
		{ id: "all", label: "All users", icon: UsersIcon },
		{ id: "active", label: "Active", icon: UserCheck },
		{ id: "banned", label: "Banned", icon: UserX },
		{ id: "super-admins", label: "Super-admins", icon: Shield },
	] as const;

	const activeQuickTab =
		status === "all" && role === "all"
			? "all"
			: status === "active" && role === "all"
				? "active"
				: status === "banned" && role === "all"
					? "banned"
					: status === "all" && role === PLATFORM_ADMIN_ROLE
						? "super-admins"
						: null;

	const handleSelectQuickTab = (
		tabId: "all" | "active" | "banned" | "super-admins",
	) => {
		setPage(1);
		if (tabId === "all") {
			setStatus("all");
			setRole("all");
		} else if (tabId === "active") {
			setStatus("active");
			setRole("all");
		} else if (tabId === "banned") {
			setStatus("banned");
			setRole("all");
		} else if (tabId === "super-admins") {
			setStatus("all");
			setRole(PLATFORM_ADMIN_ROLE);
		}
	};

	return (
		<PageFrame>
			<PageHeading
				title="Users"
				description="Every person on the platform. Open a hub for memberships, API keys, support, ban, and impersonation."
				meta={
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
							{total} {hasActiveFilters ? "matching" : "total"}
						</span>
						{status !== "all" && (
							<span className="rounded-full bg-primary-base/10 px-2 py-0.5 font-medium text-[11px] text-primary-base">
								{status}
							</span>
						)}
						{role !== "all" && (
							<span className="rounded-full bg-primary-base/10 px-2 py-0.5 font-medium text-[11px] text-primary-base">
								{role === PLATFORM_ADMIN_ROLE ? "super-admin" : "user"}
							</span>
						)}
					</div>
				}
				actions={
					<form
						className="flex flex-wrap items-center gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							setPage(1);
							setQ(draftQ.trim() || null);
						}}
					>
						<div className="flex items-center gap-1.5">
							<Input.Root className="w-56 sm:w-64">
								<Input.Wrapper>
									<Input.Icon
										as={Search}
										className="size-4 text-text-soft-400"
									/>
									<Input.Input
										placeholder={`Search by ${searchField}…`}
										value={draftQ}
										onChange={(e) => setDraftQ(e.target.value)}
									/>
									{draftQ ? (
										<button
											type="button"
											onClick={() => {
												setDraftQ("");
												setQ(null);
												setPage(1);
											}}
											className="text-text-soft-400 transition-colors hover:text-text-strong-950"
											title="Clear search"
										>
											<X className="size-3.5" />
										</button>
									) : null}
								</Input.Wrapper>
							</Input.Root>

							<select
								value={searchField}
								onChange={(e) => {
									setSearchField(e.target.value);
									setPage(1);
								}}
								className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 font-medium text-[12px] text-text-sub-600 outline-none transition-colors hover:border-stroke-sub-300 dark:border-white/10 dark:bg-transparent"
								title="Search field"
							>
								<option value="email">in Email</option>
								<option value="name">in Name</option>
							</select>
						</div>

						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

			{/* Filtration and Sorting Controls Bar */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				{/* Quick Filter Tabs */}
				<div className="flex gap-1 rounded-xl bg-bg-white-0 p-1 ring-1 ring-stroke-soft-100 dark:bg-[#0c0c0c] dark:ring-stroke-soft-100/40">
					{quickTabs.map((t) => {
						const isSelected = activeQuickTab === t.id;
						const IconComponent = t.icon;
						return (
							<button
								key={t.id}
								type="button"
								onClick={() => handleSelectQuickTab(t.id)}
								className={cn(
									"flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-[12px] transition-colors",
									isSelected
										? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
										: "text-text-sub-600 hover:text-text-strong-950 dark:hover:text-white",
								)}
							>
								<IconComponent className="size-3.5" />
								<span>{t.label}</span>
							</button>
						);
					})}
				</div>

				{/* Granular Dropdowns & Clear button */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Status Dropdown */}
					<div className="flex items-center gap-1">
						<label htmlFor="user-status-filter" className="sr-only">
							Filter by status
						</label>
						<select
							id="user-status-filter"
							value={status}
							onChange={(e) => {
								setPage(1);
								setStatus(e.target.value === "all" ? null : e.target.value);
							}}
							className="h-9 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 font-medium text-[12px] text-text-strong-950 outline-none transition-colors hover:border-stroke-sub-300 dark:border-white/10 dark:bg-transparent"
						>
							<option value="all">All statuses</option>
							<option value="active">Active</option>
							<option value="banned">Banned</option>
						</select>
					</div>

					{/* Role Dropdown */}
					<div className="flex items-center gap-1">
						<label htmlFor="user-role-filter" className="sr-only">
							Filter by role
						</label>
						<select
							id="user-role-filter"
							value={role}
							onChange={(e) => {
								setPage(1);
								setRole(e.target.value === "all" ? null : e.target.value);
							}}
							className="h-9 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 font-medium text-[12px] text-text-strong-950 outline-none transition-colors hover:border-stroke-sub-300 dark:border-white/10 dark:bg-transparent"
						>
							<option value="all">All roles</option>
							<option value={PLATFORM_ADMIN_ROLE}>Super-admin</option>
							<option value={DEFAULT_USER_ROLE}>User</option>
						</select>
					</div>

					{/* Sort Dropdown */}
					<div className="flex items-center gap-1">
						<label htmlFor="user-sort-filter" className="sr-only">
							Sort users
						</label>
						<select
							id="user-sort-filter"
							value={sort}
							onChange={(e) => {
								setPage(1);
								setSort(e.target.value === "newest" ? null : e.target.value);
							}}
							className="h-9 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 font-medium text-[12px] text-text-strong-950 outline-none transition-colors hover:border-stroke-sub-300 dark:border-white/10 dark:bg-transparent"
						>
							{SORT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									Sort: {opt.label}
								</option>
							))}
						</select>
					</div>

					{/* Clear All Filters Button */}
					{hasActiveFilters && (
						<Button.Root
							type="button"
							size="xsmall"
							variant="neutral"
							mode="ghost"
							onClick={handleResetFilters}
							className="h-9 gap-1.5 text-[12px]"
						>
							<RotateCcw className="size-3.5" />
							Clear filters
						</Button.Root>
					)}
				</div>
			</div>

			{/* Active Filters Summary Chips */}
			{hasActiveFilters && (
				<div className="flex flex-wrap items-center gap-1.5 pt-1 text-[12px]">
					<span className="font-medium text-text-sub-600">Active filters:</span>
					{q && (
						<button
							type="button"
							onClick={() => {
								setDraftQ("");
								setQ(null);
								setPage(1);
							}}
							className="inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-text-strong-950 transition-colors hover:bg-bg-weak-100 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
						>
							<span>
								{searchField === "name" ? "Name" : "Email"}: "{q}"
							</span>
							<X className="size-3 text-text-soft-400" />
						</button>
					)}
					{status !== "all" && (
						<button
							type="button"
							onClick={() => {
								setStatus(null);
								setPage(1);
							}}
							className="inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-text-strong-950 transition-colors hover:bg-bg-weak-100 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
						>
							<span>Status: {status}</span>
							<X className="size-3 text-text-soft-400" />
						</button>
					)}
					{role !== "all" && (
						<button
							type="button"
							onClick={() => {
								setRole(null);
								setPage(1);
							}}
							className="inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-text-strong-950 transition-colors hover:bg-bg-weak-100 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
						>
							<span>
								Role: {role === PLATFORM_ADMIN_ROLE ? "Super-admin" : "User"}
							</span>
							<X className="size-3 text-text-soft-400" />
						</button>
					)}
					{sort !== "newest" && (
						<button
							type="button"
							onClick={() => {
								setSort(null);
								setPage(1);
							}}
							className="inline-flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-text-strong-950 transition-colors hover:bg-bg-weak-100 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
						>
							<span>
								Sort:{" "}
								{SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort}
							</span>
							<X className="size-3 text-text-soft-400" />
						</button>
					)}
					<button
						type="button"
						onClick={handleResetFilters}
						className="text-text-sub-600 underline transition-colors hover:text-text-strong-950"
					>
						Reset all
					</button>
				</div>
			)}

			{banTarget ? (
				<InlineActionPanel
					title={`Ban ${banTarget.email}?`}
					description="They will be unable to sign in until unbanned."
					confirmLabel="Ban user"
					destructive
					onCancel={() => setBanTarget(null)}
					onConfirm={async () => {
						const { error } = await authClient.admin.banUser({
							userId: banTarget.id,
							banReason: "Banned by platform admin",
						});
						if (error) {
							toast.error(error.message || "Failed to ban user");
							return;
						}
						toast.success("User banned");
						setBanTarget(null);
						loadUsers();
					}}
				/>
			) : null}

			{promoteTarget ? (
				<InlineActionPanel
					title={`Promote ${promoteTarget.email}?`}
					description="Grants platform super-admin access across all organizations."
					confirmLabel="Make super-admin"
					onCancel={() => setPromoteTarget(null)}
					onConfirm={async () => {
						const { error } = await authClient.admin.setRole({
							userId: promoteTarget.id,
							role: PLATFORM_ADMIN_ROLE,
						});
						if (error) {
							toast.error(error.message || "Failed to promote user");
							return;
						}
						toast.success("User promoted to super-admin");
						setPromoteTarget(null);
						loadUsers();
					}}
				/>
			) : null}

			{impersonateTarget ? (
				<InlineActionPanel
					title={`Impersonate ${impersonateTarget.email}?`}
					description="You will leave the console for the customer dashboard. A banner stays visible until you stop."
					confirmLabel="Start impersonation"
					destructive
					onCancel={() => setImpersonateTarget(null)}
					onConfirm={async () => {
						const { error } = await authClient.admin.impersonateUser({
							userId: impersonateTarget.id,
						});
						if (error) {
							toast.error(error.message || "Failed to impersonate");
							return;
						}
						toast.success("Impersonation started");
						window.location.href = "/dashboard";
					}}
				/>
			) : null}

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<DataTable
					headers={["User", "Role", "Status", "Joined", "Actions"]}
					colSpan={5}
					loading={loading}
					empty={!loading && users.length === 0}
				>
					{users.map((user) => (
						<tr
							key={user.id}
							className="border-stroke-soft-100 border-t transition-colors hover:bg-bg-weak-50/80 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.02]"
						>
							<td className="px-4 py-3">
								<Link
									href={`/users/${user.id}`}
									className="font-medium text-text-strong-950 hover:underline"
								>
									{user.name || "Unnamed"}
								</Link>
								<p className="text-[12px] text-text-sub-600">{user.email}</p>
								{user.banned && user.banReason && (
									<p className="mt-0.5 text-[11px] text-red-600 dark:text-red-400">
										Ban reason: {user.banReason}
									</p>
								)}
							</td>
							<td className="px-4 py-3">
								<StatusPill status={user.role || DEFAULT_USER_ROLE} />
							</td>
							<td className="px-4 py-3">
								<StatusPill status={user.banned ? "banned" : "active"} />
							</td>
							<td className="px-4 py-3">
								<span
									className="text-[12px] text-text-sub-600 tabular-nums"
									title={formatDateTime(user.createdAt)}
								>
									{formatRelativeTime(user.createdAt)}
								</span>
							</td>
							<td className="px-4 py-3">
								<div className="flex flex-wrap gap-1.5">
									<Button.Root
										asChild
										size="xsmall"
										variant="neutral"
										mode="stroke"
									>
										<Link href={`/users/${user.id}`}>Open hub</Link>
									</Button.Root>
									{user.banned ? (
										<Button.Root
											size="xsmall"
											variant="neutral"
											mode="ghost"
											onClick={async () => {
												const { error } = await authClient.admin.unbanUser({
													userId: user.id,
												});
												if (error) {
													toast.error(error.message || "Failed to unban");
													return;
												}
												toast.success("User unbanned");
												loadUsers();
											}}
										>
											Unban
										</Button.Root>
									) : (
										<Button.Root
											size="xsmall"
											variant="error"
											mode="ghost"
											onClick={() => setBanTarget(user)}
										>
											Ban
										</Button.Root>
									)}
									{user.role !== PLATFORM_ADMIN_ROLE ? (
										<Button.Root
											size="xsmall"
											variant="neutral"
											mode="ghost"
											onClick={() => setPromoteTarget(user)}
										>
											Promote
										</Button.Root>
									) : (
										<Button.Root
											size="xsmall"
											variant="neutral"
											mode="ghost"
											onClick={async () => {
												const { error } = await authClient.admin.setRole({
													userId: user.id,
													role: DEFAULT_USER_ROLE,
												});
												if (error) {
													toast.error(error.message || "Failed to demote");
													return;
												}
												toast.success("Removed super-admin role");
												loadUsers();
											}}
										>
											Demote
										</Button.Root>
									)}
									<Button.Root
										size="xsmall"
										variant="neutral"
										mode="ghost"
										onClick={() => setImpersonateTarget(user)}
									>
										Impersonate
									</Button.Root>
								</div>
							</td>
						</tr>
					))}
				</DataTable>

				<TablePagination
					total={total}
					page={page}
					limit={limit}
					isLoading={loading}
					itemName="users"
					pageSizeOptions={[20, 50, 100]}
					onPageChange={(nextPage) => setPage(nextPage)}
					onLimitChange={(nextLimit) => {
						setLimit(nextLimit);
						setPage(1);
					}}
				/>
			</div>
		</PageFrame>
	);
}
