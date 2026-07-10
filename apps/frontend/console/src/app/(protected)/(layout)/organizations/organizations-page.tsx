"use client";

import { ConfirmActionDialog } from "@fe/console/components/confirm-action-dialog";
import { adminGet, adminPatch } from "@fe/console/lib/admin-api";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type OrgItem = {
	id: string;
	name: string;
	slug: string;
	status: string;
	memberCount: number;
	domainCount: number;
	creditsRemaining: number | null;
	createdAt: string;
};

type OrgsResponse = { items: OrgItem[]; total: number };

export default function OrganizationsPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [suspendTarget, setSuspendTarget] = useState<OrgItem | null>(null);

	const { data, isLoading, mutate } = useSWR<OrgsResponse>(
		["/organizations", search],
		() =>
			adminGet<OrgsResponse>("/organizations", {
				q: search || undefined,
				limit: 50,
			}),
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h4">
						Organizations
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						{data?.total ?? 0} organizations
					</p>
				</div>
				<form
					className="flex gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						setSearch(q);
					}}
				>
					<Input.Root className="w-64">
						<Input.Wrapper>
							<Input.Input
								placeholder="Search name or slug"
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
							<th className="px-4 py-3 font-medium">Organization</th>
							<th className="px-4 py-3 font-medium">Status</th>
							<th className="px-4 py-3 font-medium">Members</th>
							<th className="px-4 py-3 font-medium">Domains</th>
							<th className="px-4 py-3 font-medium">Credits</th>
							<th className="px-4 py-3 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={6}>
									Loading...
								</td>
							</tr>
						) : !data?.items.length ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={6}>
									No organizations found
								</td>
							</tr>
						) : (
							data.items.map((org) => (
								<tr key={org.id} className="border-stroke-soft-100 border-t">
									<td className="px-4 py-3">
										<Link
											href={`/organizations/${org.id}`}
											className="font-medium text-text-strong-950 hover:underline"
										>
											{org.name}
										</Link>
										<p className="text-text-sub-600">{org.slug}</p>
									</td>
									<td className="px-4 py-3">
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
									</td>
									<td className="px-4 py-3">{org.memberCount}</td>
									<td className="px-4 py-3">{org.domainCount}</td>
									<td className="px-4 py-3">
										{org.creditsRemaining?.toLocaleString() ?? "—"}
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-2">
											<Button.Root
												asChild
												size="xsmall"
												variant="neutral"
												mode="stroke"
											>
												<Link href={`/organizations/${org.id}`}>View</Link>
											</Button.Root>
											{org.status === "suspended" ? (
												<Button.Root
													size="xsmall"
													variant="neutral"
													mode="stroke"
													onClick={async () => {
														try {
															await adminPatch(
																`/organizations/${org.id}/status`,
																{
																	status: "active",
																	reason: "Reactivated by admin",
																},
															);
															toast.success("Organization reactivated");
															mutate();
														} catch {
															toast.error("Failed to reactivate organization");
														}
													}}
												>
													Reactivate
												</Button.Root>
											) : (
												<Button.Root
													size="xsmall"
													variant="error"
													mode="stroke"
													onClick={() => setSuspendTarget(org)}
												>
													Suspend
												</Button.Root>
											)}
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<ConfirmActionDialog
				open={!!suspendTarget}
				onOpenChange={(open) => !open && setSuspendTarget(null)}
				title="Suspend organization"
				description={`Suspend ${suspendTarget?.name}? Members will lose access until reactivated.`}
				confirmLabel="Suspend"
				destructive
				onConfirm={async () => {
					if (!suspendTarget) return;
					try {
						await adminPatch(`/organizations/${suspendTarget.id}/status`, {
							status: "suspended",
							reason: "Suspended by platform admin",
						});
						toast.success("Organization suspended");
						mutate();
					} catch {
						toast.error("Failed to suspend organization");
					}
				}}
			/>
		</div>
	);
}
