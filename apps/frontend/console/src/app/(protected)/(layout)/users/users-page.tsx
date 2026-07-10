"use client";

import { ConfirmActionDialog } from "@fe/console/components/confirm-action-dialog";
import { authClient } from "@reloop/auth/client";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
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
	const [q, setQ] = useState("");
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
		loadUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h4">
						Users
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						{total} users across the platform
					</p>
				</div>
				<form
					className="flex gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						loadUsers(q);
					}}
				>
					<Input.Root className="w-64">
						<Input.Wrapper>
							<Input.Input
								placeholder="Search by email"
								value={q}
								onChange={(e) => setQ(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
					<Button.Root type="submit" variant="neutral" mode="stroke">
						Search
					</Button.Root>
				</form>
			</div>

			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100">
				<table className="w-full text-left text-paragraph-sm">
					<thead className="bg-bg-weak-50 text-[12px] text-text-sub-600 uppercase">
						<tr>
							<th className="px-4 py-3 font-medium">User</th>
							<th className="px-4 py-3 font-medium">Role</th>
							<th className="px-4 py-3 font-medium">Status</th>
							<th className="px-4 py-3 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={4}>
									Loading...
								</td>
							</tr>
						) : users.length === 0 ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={4}>
									No users found
								</td>
							</tr>
						) : (
							users.map((user) => (
								<tr key={user.id} className="border-stroke-soft-100 border-t">
									<td className="px-4 py-3">
										<p className="font-medium text-text-strong-950">
											{user.name}
										</p>
										<p className="text-text-sub-600">{user.email}</p>
									</td>
									<td className="px-4 py-3">
										<Badge.Root
											variant="light"
											color={
												user.role === PLATFORM_ADMIN_ROLE ? "blue" : "gray"
											}
										>
											{user.role || "user"}
										</Badge.Root>
									</td>
									<td className="px-4 py-3">
										<Badge.Root
											variant="light"
											color={user.banned ? "red" : "green"}
										>
											{user.banned ? "Banned" : "Active"}
										</Badge.Root>
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-2">
											{user.banned ? (
												<Button.Root
													size="xsmall"
													variant="neutral"
													mode="stroke"
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
													mode="stroke"
													onClick={() => setBanTarget(user)}
												>
													Ban
												</Button.Root>
											)}
											{user.role !== PLATFORM_ADMIN_ROLE ? (
												<Button.Root
													size="xsmall"
													variant="neutral"
													mode="stroke"
													onClick={() => setPromoteTarget(user)}
												>
													Make super-admin
												</Button.Root>
											) : (
												<Button.Root
													size="xsmall"
													variant="neutral"
													mode="stroke"
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
													Remove super-admin
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
							))
						)}
					</tbody>
				</table>
			</div>

			<ConfirmActionDialog
				open={!!banTarget}
				onOpenChange={(open) => !open && setBanTarget(null)}
				title="Ban user"
				description={`Ban ${banTarget?.email}? They will be unable to sign in.`}
				confirmLabel="Ban user"
				destructive
				onConfirm={async () => {
					if (!banTarget) return;
					const { error } = await authClient.admin.banUser({
						userId: banTarget.id,
						banReason: "Banned by platform admin",
					});
					if (error) {
						toast.error(error.message || "Failed to ban user");
						return;
					}
					toast.success("User banned");
					loadUsers();
				}}
			/>

			<ConfirmActionDialog
				open={!!promoteTarget}
				onOpenChange={(open) => !open && setPromoteTarget(null)}
				title="Promote to platform super-admin"
				description={`Grant platform super-admin access to ${promoteTarget?.email}? They will be able to manage all organizations.`}
				confirmLabel="Make super-admin"
				onConfirm={async () => {
					if (!promoteTarget) return;
					const { error } = await authClient.admin.setRole({
						userId: promoteTarget.id,
						role: PLATFORM_ADMIN_ROLE,
					});
					if (error) {
						toast.error(error.message || "Failed to promote user");
						return;
					}
					toast.success("User promoted to super-admin");
					loadUsers();
				}}
			/>

			<ConfirmActionDialog
				open={!!impersonateTarget}
				onOpenChange={(open) => !open && setImpersonateTarget(null)}
				title="Impersonate user"
				description={`Start an impersonation session as ${impersonateTarget?.email}? A banner will remain visible until you stop.`}
				confirmLabel="Impersonate"
				destructive
				onConfirm={async () => {
					if (!impersonateTarget) return;
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
		</div>
	);
}
