"use client";

import { InlineActionPanel } from "@fe/console/components/inline-action-panel";
import {
	DataTable,
	PageFrame,
	PageHeading,
} from "@fe/console/components/ui/page-frame";
import { StatusPill } from "@fe/console/components/ui/status-pill";
import {
	adminErrorMessage,
	adminGet,
	adminPost,
} from "@fe/console/lib/admin-api";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type WarmupView = {
	status: string;
	day: number;
	dailyCap: number | null;
	sentToday: number;
};

type SendingIpItem = {
	id: string;
	address: string;
	hostname: string;
	kind: "shared" | "dedicated";
	status: string;
	notes: string | null;
	createdAt: string;
	assignment: {
		id: string;
		organizationId: string;
		organizationName: string | null;
		isPrimary: boolean;
		assignedAt: string;
		warmup: WarmupView | null;
	} | null;
};

type SendingIpsResponse = { items: SendingIpItem[]; total: number };

type SearchResponse = {
	organizations: Array<{
		id: string;
		name: string;
		slug: string;
		status: string;
	}>;
};

function warmupLabel(warmup: WarmupView | null): string {
	if (!warmup) return "—";
	if (warmup.status === "completed") return "Warmed";
	if (warmup.status === "paused") return "Paused";
	if (warmup.status === "pending") return "Scheduled";
	if (warmup.status === "active") return `Day ${warmup.day} of 42`;
	return warmup.status;
}

export default function SendingIpsPage() {
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [kind, setKind] = useQueryState("kind", parseAsString.withDefault(""));
	const [status, setStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [draftQ, setDraftQ] = useState(q);
	const [registerOpen, setRegisterOpen] = useState(false);
	const [address, setAddress] = useState("");
	const [hostname, setHostname] = useState("");
	const [registerKind, setRegisterKind] = useState<"dedicated" | "shared">(
		"dedicated",
	);
	const [notes, setNotes] = useState("");
	const [assignTarget, setAssignTarget] = useState<SendingIpItem | null>(null);
	const [unassignTarget, setUnassignTarget] = useState<SendingIpItem | null>(
		null,
	);
	const [orgSearch, setOrgSearch] = useState("");
	const [selectedOrg, setSelectedOrg] = useState<{
		id: string;
		name: string;
	} | null>(null);

	useEffect(() => {
		setDraftQ(q);
	}, [q]);

	const { data, isLoading, mutate } = useSWR<SendingIpsResponse>(
		["/sending-ips", q, kind, status],
		() =>
			adminGet<SendingIpsResponse>("/sending-ips", {
				q: q || undefined,
				kind: kind || undefined,
				status: status || undefined,
				limit: 200,
			}),
	);

	const { data: searchData } = useSWR(
		orgSearch.trim().length >= 1 ? ["sending-ip-org-search", orgSearch] : null,
		() =>
			adminGet<SearchResponse>("/search", {
				q: orgSearch.trim(),
				limit: 8,
			}),
	);

	return (
		<PageFrame>
			<PageHeading
				title="Sending IPs"
				description="Register platform IPs, then assign dedicated addresses to a paid organization. Warmup starts on assign."
				meta={
					<span className="rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 tabular-nums dark:bg-white/[0.06]">
						{data?.total ?? 0} in inventory
					</span>
				}
				actions={
					<>
						<form
							className="flex flex-wrap gap-2"
							onSubmit={(e) => {
								e.preventDefault();
								setQ(draftQ.trim() || null);
							}}
						>
							<Input.Root className="w-48">
								<Input.Wrapper>
									<Input.Input
										placeholder="Address or hostname"
										value={draftQ}
										onChange={(e) => setDraftQ(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
							<select
								className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
								value={kind}
								onChange={(e) => setKind(e.target.value || null)}
							>
								<option value="">All kinds</option>
								<option value="dedicated">Dedicated</option>
								<option value="shared">Shared</option>
							</select>
							<select
								className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
								value={status}
								onChange={(e) => setStatus(e.target.value || null)}
							>
								<option value="">All statuses</option>
								<option value="active">Active</option>
								<option value="disabled">Disabled</option>
								<option value="retired">Retired</option>
							</select>
							<Button.Root type="submit" variant="neutral" mode="stroke">
								Search
							</Button.Root>
						</form>
						<Button.Root
							variant="primary"
							size="small"
							onClick={() => setRegisterOpen(true)}
						>
							Register IP
						</Button.Root>
					</>
				}
			/>

			{registerOpen ? (
				<InlineActionPanel
					title="Register a sending IP"
					description="Dedicated IPs can be assigned to one organization. Shared IPs stay in the pool."
					confirmLabel="Register"
					onCancel={() => setRegisterOpen(false)}
					onConfirm={async () => {
						try {
							await adminPost("/sending-ips", {
								address: address.trim(),
								hostname: hostname.trim(),
								kind: registerKind,
								notes: notes.trim() || null,
							});
							toast.success(`Registered ${address.trim()}`);
							setRegisterOpen(false);
							setAddress("");
							setHostname("");
							setNotes("");
							mutate();
						} catch (error) {
							toast.error(adminErrorMessage(error));
							throw error;
						}
					}}
				>
					<div className="grid gap-2 sm:grid-cols-2">
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder="203.0.113.10"
								/>
							</Input.Wrapper>
						</Input.Root>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									value={hostname}
									onChange={(e) => setHostname(e.target.value)}
									placeholder="mta1.reloop.sh"
								/>
							</Input.Wrapper>
						</Input.Root>
						<select
							className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-[13px] dark:bg-transparent"
							value={registerKind}
							onChange={(e) =>
								setRegisterKind(e.target.value as "dedicated" | "shared")
							}
						>
							<option value="dedicated">Dedicated</option>
							<option value="shared">Shared pool</option>
						</select>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Notes (optional)"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</InlineActionPanel>
			) : null}

			{assignTarget ? (
				<InlineActionPanel
					title={`Assign ${assignTarget.address}`}
					description="The organization must have dedicated IP entitlement (Startup/Enterprise, or a plan grant). Warmup starts immediately."
					confirmLabel="Assign and start warmup"
					onCancel={() => {
						setAssignTarget(null);
						setSelectedOrg(null);
						setOrgSearch("");
					}}
					onConfirm={async () => {
						if (!selectedOrg) {
							toast.error("Pick an organization");
							throw new Error("no org");
						}
						try {
							await adminPost(`/sending-ips/${assignTarget.id}/assign`, {
								organizationId: selectedOrg.id,
								startWarmup: true,
							});
							toast.success(`Assigned to ${selectedOrg.name}`);
							setAssignTarget(null);
							setSelectedOrg(null);
							setOrgSearch("");
							mutate();
						} catch (error) {
							toast.error(adminErrorMessage(error));
							throw error;
						}
					}}
				>
					<div className="space-y-2">
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									placeholder="Search organization name or slug"
									value={selectedOrg ? selectedOrg.name : orgSearch}
									onChange={(e) => {
										setSelectedOrg(null);
										setOrgSearch(e.target.value);
									}}
								/>
							</Input.Wrapper>
						</Input.Root>
						{!selectedOrg &&
						orgSearch.trim() &&
						(searchData?.organizations.length ?? 0) > 0 ? (
							<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
								{(searchData?.organizations ?? []).map((org) => (
									<button
										key={org.id}
										type="button"
										onClick={() => {
											setSelectedOrg({ id: org.id, name: org.name });
											setOrgSearch("");
										}}
										className="flex w-full items-center justify-between gap-3 border-stroke-soft-100 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.03]"
									>
										<div className="min-w-0">
											<p className="truncate font-medium text-[13px]">
												{org.name}
											</p>
											<p className="truncate text-[12px] text-text-sub-600">
												{org.slug}
											</p>
										</div>
										<StatusPill status={org.status} />
									</button>
								))}
							</div>
						) : null}
					</div>
				</InlineActionPanel>
			) : null}

			{unassignTarget ? (
				<InlineActionPanel
					title={`Unassign ${unassignTarget.address}?`}
					description={
						unassignTarget.assignment?.organizationName
							? `This releases the IP from ${unassignTarget.assignment.organizationName} and aborts warmup.`
							: "This releases the IP and aborts warmup."
					}
					confirmLabel="Unassign"
					destructive
					onCancel={() => setUnassignTarget(null)}
					onConfirm={async () => {
						try {
							await adminPost(`/sending-ips/${unassignTarget.id}/unassign`);
							toast.success("IP unassigned");
							setUnassignTarget(null);
							mutate();
						} catch (error) {
							toast.error(adminErrorMessage(error));
							throw error;
						}
					}}
				/>
			) : null}

			<DataTable
				headers={[
					"Address",
					"Hostname",
					"Kind",
					"Status",
					"Organization",
					"Warmup",
					"",
				]}
				colSpan={7}
				loading={isLoading}
				empty={!isLoading && !data?.items.length}
			>
				{data?.items.map((ip) => (
					<tr
						key={ip.id}
						className="border-stroke-soft-100 border-t dark:border-stroke-soft-100/40"
					>
						<td className="px-4 py-3 font-medium font-mono text-[13px]">
							{ip.address}
						</td>
						<td className="px-4 py-3 text-text-sub-600">{ip.hostname}</td>
						<td className="px-4 py-3">
							<StatusPill status={ip.kind} />
						</td>
						<td className="px-4 py-3">
							<StatusPill status={ip.status} />
						</td>
						<td className="px-4 py-3">
							{ip.assignment ? (
								<Link
									href={`/organizations/${ip.assignment.organizationId}`}
									className="hover:underline"
								>
									{ip.assignment.organizationName ||
										ip.assignment.organizationId}
								</Link>
							) : (
								<span className="text-text-soft-400">Unassigned</span>
							)}
						</td>
						<td className="px-4 py-3 text-text-sub-600">
							{ip.assignment?.warmup ? (
								<StatusPill
									status={warmupLabel(ip.assignment.warmup)}
									tone={
										ip.assignment.warmup.status === "completed"
											? "green"
											: ip.assignment.warmup.status === "paused"
												? "gray"
												: "blue"
									}
								/>
							) : (
								"—"
							)}
						</td>
						<td className="px-4 py-3 text-right">
							{ip.kind === "dedicated" && ip.status === "active" ? (
								ip.assignment ? (
									<Button.Root
										size="xsmall"
										variant="neutral"
										mode="stroke"
										onClick={() => setUnassignTarget(ip)}
									>
										Unassign
									</Button.Root>
								) : (
									<Button.Root
										size="xsmall"
										variant="primary"
										onClick={() => setAssignTarget(ip)}
									>
										Assign
									</Button.Root>
								)
							) : null}
						</td>
					</tr>
				))}
			</DataTable>
		</PageFrame>
	);
}
