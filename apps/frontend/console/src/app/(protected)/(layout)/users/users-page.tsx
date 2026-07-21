"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import { authClient } from "@reloop/auth/client";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
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

export default function UsersPage() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [total, setTotal] = useState(0);
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [draftQ, setDraftQ] = useState(q);
	const [loading, setLoading] = useState(true);
	const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
	const [promoteTarget, setPromoteTarget] = useState<AdminUser | null>(null);
	const [impersonateTarget, setImpersonateTarget] = useState<AdminUser | null>(
		null,
	);

	const loadUsers = async (search = q) => {
		setLoading(true);
		try {
			const { data, error } = await authClient.admin.listUsers({
				query: {
					limit: 50,
					offset: 0,
					searchValue: search || undefined,
					searchField: "email",
					searchOperator: "contains",
				},
			});
			if (error) {
				toast.error(error.message || "Failed to list users");
				return;
			}
			setUsers((data?.users as AdminUser[]) ?? []);
			setTotal(data?.total ?? 0);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setDraftQ(q);
		loadUsers(q);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q]);

	return (
		<PageFrame>
			<PageHeading
				title="Users"
				description="Every person on the platform. Open a hub for memberships, API keys, support, ban, and impersonation."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{total} total
					</span>
				}
				actions={
					<form
						className="flex gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							setQ(draftQ.trim() || null);
						}}
					>
						<Input.Root className="w-64">
							<Input.Wrapper>
								<Input.Input
									placeholder="Search by email"
									value={draftQ}
									onChange={(e) => setDraftQ(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						<Button.Root type="submit" variant="neutral" mode="stroke">
							Search
						</Button.Root>
					</form>
				}
			/>

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
					headers={["User", "Role", "Status", "Actions"]}
					colSpan={4}
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
									{user.name}
								</Link>
								<p className="text-[12px] text-text-sub-600">{user.email}</p>
							</td>
							<td className="px-4 py-3">
								<StatusPill status={user.role || "user"} />
							</td>
							<td className="px-4 py-3">
								<StatusPill status={user.banned ? "banned" : "active"} />
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
													role: "user",
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
			</div>
		</PageFrame>
	);
}
