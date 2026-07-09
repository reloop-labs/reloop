"use client";

import { ConfirmActionDialog } from "@fe/console/components/confirm-action-dialog";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
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

export default function OrganizationDetailPage() {
	const params = useParams<{ orgId: string }>();
	const orgId = params.orgId;
	const [suspendOpen, setSuspendOpen] = useState(false);
	const [topupAmount, setTopupAmount] = useState("1000");
	const [topupReason, setTopupReason] = useState("");
	const [topupOpen, setTopupOpen] = useState(false);

	const { data, isLoading, mutate } = useSWR<OrgDetail>(
		orgId ? `/organizations/${orgId}` : null,
		() => adminGet<OrgDetail>(`/organizations/${orgId}`),
	);

	if (isLoading || !data) {
		return <p className="text-paragraph-sm text-text-sub-600">Loading...</p>;
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="text-[12px] text-text-sub-600">
						<Link href="/organizations" className="hover:underline">
							Organizations
						</Link>{" "}
						/ {data.slug}
					</p>
					<h1 className="mt-1 font-semibold text-text-strong-950 text-title-h4">
						{data.name}
					</h1>
					<div className="mt-2 flex items-center gap-2">
						<Badge.Root
							variant="light"
							color={
								data.status === "active"
									? "green"
									: data.status === "suspended"
										? "red"
										: "gray"
							}
						>
							{data.status}
						</Badge.Root>
						{data.billingEmail ? (
							<span className="text-paragraph-sm text-text-sub-600">
								{data.billingEmail}
							</span>
						) : null}
					</div>
				</div>
				<div className="flex gap-2">
					<Button.Root
						variant="neutral"
						mode="stroke"
						onClick={() => setTopupOpen(true)}
					>
						Top up credits
					</Button.Root>
					{data.status === "suspended" ? (
						<Button.Root
							variant="neutral"
							mode="stroke"
							onClick={async () => {
								await adminPatch(`/organizations/${data.id}/status`, {
									status: "active",
									reason: "Reactivated by admin",
								});
								toast.success("Reactivated");
								mutate();
							}}
						>
							Reactivate
						</Button.Root>
					) : (
						<Button.Root
							variant="error"
							mode="stroke"
							onClick={() => setSuspendOpen(true)}
						>
							Suspend
						</Button.Root>
					)}
				</div>
			</div>

			<section className="rounded-2xl border border-stroke-soft-100 p-4">
				<h2 className="font-medium text-label-md text-text-strong-950">
					Credits
				</h2>
				{data.credits ? (
					<div className="mt-3 grid gap-3 sm:grid-cols-3">
						<div>
							<p className="text-[12px] text-text-sub-600">Remaining</p>
							<p className="font-semibold text-title-h5">
								{data.credits.creditsRemaining.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-[12px] text-text-sub-600">Used</p>
							<p className="font-semibold text-title-h5">
								{data.credits.creditsUsed.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-[12px] text-text-sub-600">Monthly</p>
							<p className="font-semibold text-title-h5">
								{data.credits.monthlyCredits.toLocaleString()}
							</p>
						</div>
					</div>
				) : (
					<p className="mt-2 text-paragraph-sm text-text-sub-600">
						No credits provisioned yet.
					</p>
				)}
				<div className="mt-3">
					<Link
						href={`/credits?organizationId=${data.id}`}
						className="text-label-sm text-primary-base hover:underline"
					>
						View ledger →
					</Link>
				</div>
			</section>

			<section className="rounded-2xl border border-stroke-soft-100 p-4">
				<h2 className="font-medium text-label-md text-text-strong-950">
					Members ({data.members.length})
				</h2>
				<div className="mt-3 space-y-2">
					{data.members.map((m) => (
						<div
							key={m.id}
							className="flex items-center justify-between rounded-xl bg-bg-weak-50 px-3 py-2"
						>
							<div>
								<p className="font-medium text-label-sm">{m.userName}</p>
								<p className="text-[12px] text-text-sub-600">{m.userEmail}</p>
							</div>
							<Badge.Root variant="light" color="gray">
								{m.role}
							</Badge.Root>
						</div>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-stroke-soft-100 p-4">
				<h2 className="font-medium text-label-md text-text-strong-950">
					Domains ({data.domains.length})
				</h2>
				<div className="mt-3 space-y-2">
					{data.domains.length === 0 ? (
						<p className="text-paragraph-sm text-text-sub-600">No domains</p>
					) : (
						data.domains.map((d) => (
							<div
								key={d.id}
								className="flex items-center justify-between rounded-xl bg-bg-weak-50 px-3 py-2"
							>
								<p className="font-medium text-label-sm">{d.domain}</p>
								<Badge.Root
									variant="light"
									color={d.status === "active" ? "green" : "gray"}
								>
									{d.status}
								</Badge.Root>
							</div>
						))
					)}
				</div>
			</section>

			<ConfirmActionDialog
				open={suspendOpen}
				onOpenChange={setSuspendOpen}
				title="Suspend organization"
				description={`Suspend ${data.name}?`}
				confirmLabel="Suspend"
				destructive
				onConfirm={async () => {
					await adminPatch(`/organizations/${data.id}/status`, {
						status: "suspended",
						reason: "Suspended by platform admin",
					});
					toast.success("Organization suspended");
					mutate();
				}}
			/>

			<ConfirmActionDialog
				open={topupOpen}
				onOpenChange={setTopupOpen}
				title="Top up credits"
				description="Add credits to this organization. This action is audit-logged."
				confirmLabel="Top up"
				onConfirm={async () => {
					const amount = Number(topupAmount);
					if (!Number.isFinite(amount) || amount <= 0) {
						toast.error("Enter a positive amount");
						throw new Error("invalid amount");
					}
					await adminPost("/credits/topup", {
						organizationId: data.id,
						amount,
						reason: topupReason || "Manual top-up from admin",
					});
					toast.success(`Added ${amount} credits`);
					mutate();
				}}
			/>

			{topupOpen ? (
				<div className="fixed right-6 bottom-6 z-[60] w-72 space-y-2 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 shadow-regular-md">
					<p className="font-medium text-label-sm">Top-up details</p>
					<Input.Root>
						<Input.Wrapper>
							<Input.Input
								type="number"
								min={1}
								value={topupAmount}
								onChange={(e) => setTopupAmount(e.target.value)}
								placeholder="Amount"
							/>
						</Input.Wrapper>
					</Input.Root>
					<Input.Root>
						<Input.Wrapper>
							<Input.Input
								value={topupReason}
								onChange={(e) => setTopupReason(e.target.value)}
								placeholder="Reason (optional)"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
			) : null}
		</div>
	);
}
