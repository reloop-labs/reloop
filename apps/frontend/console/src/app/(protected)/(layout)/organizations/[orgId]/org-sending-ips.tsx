"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import { DataTable } from "@fe/console/components/ui/page-frame";
import { SectionCard } from "@fe/console/components/ui/section-card";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import {
	adminErrorMessage,
	adminGet,
	adminPost,
} from "@fe/console/lib/admin-api";
import { formatRelativeTime } from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type WarmupView = {
	status: string;
	day: number;
};

type SendingIpItem = {
	id: string;
	address: string;
	hostname: string;
	kind: string;
	status: string;
	assignment: {
		isPrimary: boolean;
		assignedAt: string;
		warmup: WarmupView | null;
	} | null;
};

type OrgSendingIps = {
	organizationId: string;
	dedicatedIpCount: number;
	assignedCount: number;
	items: SendingIpItem[];
};

type InventoryResponse = { items: SendingIpItem[]; total: number };

function warmupLabel(warmup: WarmupView | null): string {
	if (!warmup) return "—";
	if (warmup.status === "completed") return "Warmed";
	if (warmup.status === "paused") return "Paused";
	if (warmup.status === "pending") return "Scheduled";
	if (warmup.status === "active") return `Day ${warmup.day} of 42`;
	return warmup.status;
}

export function OrgSendingIps({
	organizationId,
	organizationName,
}: {
	organizationId: string;
	organizationName: string;
}) {
	const [assignOpen, setAssignOpen] = useState(false);
	const [unassignId, setUnassignId] = useState<string | null>(null);
	const [pickId, setPickId] = useState("");

	const { data, isLoading, mutate } = useSWR<OrgSendingIps>(
		`/organizations/${organizationId}/sending-ips`,
		() =>
			adminGet<OrgSendingIps>(`/organizations/${organizationId}/sending-ips`),
	);

	const { data: available } = useSWR<InventoryResponse>(
		assignOpen ? ["/sending-ips", "available"] : null,
		() =>
			adminGet<InventoryResponse>("/sending-ips", {
				kind: "dedicated",
				status: "active",
				assigned: false,
				limit: 200,
			}),
	);

	const availableItems = available?.items ?? [];

	return (
		<SectionCard
			title="Dedicated IPs"
			description={`Plan includes ${data?.dedicatedIpCount ?? "—"} · ${data?.assignedCount ?? 0} assigned. Register addresses on Sending IPs, then assign here.`}
			action={
				<div className="flex items-center gap-3">
					<Link
						href="/sending-ips"
						className="text-[12px] text-primary-base hover:underline"
					>
						Inventory →
					</Link>
					<Button.Root
						size="xsmall"
						variant="primary"
						onClick={() => setAssignOpen(true)}
					>
						Assign IP
					</Button.Root>
				</div>
			}
		>
			{assignOpen ? (
				<InlineActionPanel
					className="m-4"
					title={`Assign a dedicated IP to ${organizationName}`}
					description="Warmup starts on assign. The org must have remaining dedicated IP entitlement."
					confirmLabel="Assign and start warmup"
					onCancel={() => {
						setAssignOpen(false);
						setPickId("");
					}}
					onConfirm={async () => {
						if (!pickId) {
							toast.error("Pick an IP from inventory");
							throw new Error("no ip");
						}
						try {
							await adminPost(`/sending-ips/${pickId}/assign`, {
								organizationId,
								startWarmup: true,
							});
							toast.success("Dedicated IP assigned");
							setAssignOpen(false);
							setPickId("");
							mutate();
						} catch (error) {
							toast.error(adminErrorMessage(error));
							throw error;
						}
					}}
				>
					{availableItems.length === 0 ? (
						<p className="text-[12px] text-text-sub-600">
							No unassigned dedicated IPs. Register one on the Sending IPs page
							first.
						</p>
					) : (
						<select
							className="h-10 w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
							value={pickId}
							onChange={(e) => setPickId(e.target.value)}
						>
							<option value="">Select an IP…</option>
							{availableItems.map((ip) => (
								<option key={ip.id} value={ip.id}>
									{ip.address} · {ip.hostname}
								</option>
							))}
						</select>
					)}
				</InlineActionPanel>
			) : null}

			{unassignId ? (
				<InlineActionPanel
					className="m-4"
					title="Unassign this IP?"
					description="The address returns to inventory and warmup is aborted."
					confirmLabel="Unassign"
					destructive
					onCancel={() => setUnassignId(null)}
					onConfirm={async () => {
						try {
							await adminPost(`/sending-ips/${unassignId}/unassign`);
							toast.success("IP unassigned");
							setUnassignId(null);
							mutate();
						} catch (error) {
							toast.error(adminErrorMessage(error));
							throw error;
						}
					}}
				/>
			) : null}

			<DataTable
				headers={["Address", "Hostname", "Warmup", "Assigned", ""]}
				colSpan={5}
				loading={isLoading}
				empty={!isLoading && (data?.items.length ?? 0) === 0}
			>
				{data?.items.map((ip) => (
					<tr
						key={ip.id}
						className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
					>
						<td className="px-4 py-3 font-medium font-mono text-[13px]">
							{ip.address}
							{ip.assignment?.isPrimary ? (
								<span className="ml-2 text-[11px] text-text-soft-400">
									primary
								</span>
							) : null}
						</td>
						<td className="px-4 py-3 text-text-sub-600">{ip.hostname}</td>
						<td className="px-4 py-3">
							<StatusPill
								status={warmupLabel(ip.assignment?.warmup ?? null)}
								tone={
									ip.assignment?.warmup?.status === "completed"
										? "green"
										: ip.assignment?.warmup?.status === "paused"
											? "gray"
											: "blue"
								}
							/>
						</td>
						<td className="px-4 py-3 text-text-sub-600">
							{formatRelativeTime(ip.assignment?.assignedAt ?? null)}
						</td>
						<td className="px-4 py-3 text-right">
							<Button.Root
								size="xsmall"
								variant="neutral"
								mode="stroke"
								onClick={() => setUnassignId(ip.id)}
							>
								Unassign
							</Button.Root>
						</td>
					</tr>
				))}
			</DataTable>
		</SectionCard>
	);
}
