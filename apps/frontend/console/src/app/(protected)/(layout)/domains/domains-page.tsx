"use client";

import { ConfirmActionDialog } from "@fe/console/components/confirm-action-dialog";
import { adminGet, adminPatch } from "@fe/console/lib/admin-api";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type DomainItem = {
	id: string;
	domain: string;
	status: string;
	organizationId: string;
	organizationName: string;
	systemVerified: boolean;
	createdAt: string;
};

type DomainsResponse = { items: DomainItem[]; total: number };

export default function DomainsPage() {
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [suspendTarget, setSuspendTarget] = useState<DomainItem | null>(null);

	const { data, isLoading, mutate } = useSWR<DomainsResponse>(
		["/domains", search],
		() =>
			adminGet<DomainsResponse>("/domains", {
				q: search || undefined,
				limit: 50,
			}),
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h4">
						Domains
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						{data?.total ?? 0} domains across all organizations
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
								placeholder="Search domain"
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
							<th className="px-4 py-3 font-medium">Domain</th>
							<th className="px-4 py-3 font-medium">Organization</th>
							<th className="px-4 py-3 font-medium">Status</th>
							<th className="px-4 py-3 font-medium">Verified</th>
							<th className="px-4 py-3 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={5}>
									Loading...
								</td>
							</tr>
						) : !data?.items.length ? (
							<tr>
								<td className="px-4 py-6 text-text-sub-600" colSpan={5}>
									No domains found
								</td>
							</tr>
						) : (
							data.items.map((d) => (
								<tr key={d.id} className="border-stroke-soft-100 border-t">
									<td className="px-4 py-3 font-medium text-text-strong-950">
										{d.domain}
									</td>
									<td className="px-4 py-3 text-text-sub-600">
										{d.organizationName}
									</td>
									<td className="px-4 py-3">
										<Badge.Root
											variant="light"
											color={
												d.status === "active"
													? "green"
													: d.status === "suspended" || d.status === "failed"
														? "red"
														: "gray"
											}
										>
											{d.status}
										</Badge.Root>
									</td>
									<td className="px-4 py-3">
										{d.systemVerified ? "Yes" : "No"}
									</td>
									<td className="px-4 py-3">
										{d.status === "suspended" ? (
											<Button.Root
												size="xsmall"
												variant="neutral"
												mode="stroke"
												onClick={async () => {
													try {
														await adminPatch(`/domains/${d.id}/status`, {
															status: "active",
															reason: "Reactivated by admin",
														});
														toast.success("Domain reactivated");
														mutate();
													} catch {
														toast.error("Failed to reactivate domain");
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
												onClick={() => setSuspendTarget(d)}
											>
												Suspend
											</Button.Root>
										)}
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
				title="Suspend domain"
				description={`Suspend ${suspendTarget?.domain}? Sending from this domain will be blocked.`}
				confirmLabel="Suspend"
				destructive
				onConfirm={async () => {
					if (!suspendTarget) return;
					try {
						await adminPatch(`/domains/${suspendTarget.id}/status`, {
							status: "suspended",
							reason: "Suspended by platform admin",
						});
						toast.success("Domain suspended");
						mutate();
					} catch {
						toast.error("Failed to suspend domain");
					}
				}}
			/>
		</div>
	);
}
