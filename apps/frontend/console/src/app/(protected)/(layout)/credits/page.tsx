"use client";

import { ConfirmActionDialog } from "@fe/console/components/confirm-action-dialog";
import { adminGet, adminPost } from "@fe/console/lib/admin-api";
import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type CreditsDetail = {
	balance: {
		organizationId: string;
		organizationName: string;
		creditsUsed: number;
		creditsRemaining: number;
		monthlyCredits: number;
		status: string;
		currentPeriodStart: string;
		currentPeriodEnd: string;
	} | null;
	ledger: Array<{
		id: string;
		entryType: string;
		delta: number;
		balanceAfter: number;
		reason: string | null;
		createdAt: string;
	}>;
};

export default function CreditsPage() {
	const [organizationId, setOrganizationId] = useQueryState(
		"organizationId",
		parseAsString.withDefault(""),
	);
	const [inputOrgId, setInputOrgId] = useState(organizationId);
	const [topupOpen, setTopupOpen] = useState(false);
	const [amount, setAmount] = useState("1000");
	const [reason, setReason] = useState("");

	const { data, isLoading, mutate } = useSWR<CreditsDetail>(
		organizationId ? `/credits/${organizationId}` : null,
		() => adminGet<CreditsDetail>(`/credits/${organizationId}`),
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h4">
					Credits
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Inspect balances and apply manual top-ups.
				</p>
			</div>

			<form
				className="flex flex-wrap gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					setOrganizationId(inputOrgId.trim());
				}}
			>
				<Input.Root className="w-80">
					<Input.Wrapper>
						<Input.Input
							placeholder="Organization ID"
							value={inputOrgId}
							onChange={(e) => setInputOrgId(e.target.value)}
						/>
					</Input.Wrapper>
				</Input.Root>
				<Button.Root type="submit" variant="neutral" mode="stroke">
					Load
				</Button.Root>
				{organizationId ? (
					<Button.Root
						type="button"
						variant="primary"
						onClick={() => setTopupOpen(true)}
					>
						Top up
					</Button.Root>
				) : null}
			</form>

			{!organizationId ? (
				<p className="text-paragraph-sm text-text-sub-600">
					Enter an organization ID to view credits, or open an organization and
					use “View ledger”.
				</p>
			) : isLoading ? (
				<p className="text-paragraph-sm text-text-sub-600">Loading...</p>
			) : (
				<>
					{data?.balance ? (
						<div className="grid gap-3 rounded-2xl border border-stroke-soft-100 p-4 sm:grid-cols-4">
							<div>
								<p className="text-[12px] text-text-sub-600">Organization</p>
								<p className="font-medium">{data.balance.organizationName}</p>
							</div>
							<div>
								<p className="text-[12px] text-text-sub-600">Remaining</p>
								<p className="font-semibold text-title-h5">
									{data.balance.creditsRemaining.toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-text-sub-600">Used</p>
								<p className="font-semibold text-title-h5">
									{data.balance.creditsUsed.toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-[12px] text-text-sub-600">Monthly</p>
								<p className="font-semibold text-title-h5">
									{data.balance.monthlyCredits.toLocaleString()}
								</p>
							</div>
						</div>
					) : (
						<p className="text-paragraph-sm text-text-sub-600">
							No credits record for this organization.
						</p>
					)}

					<div className="overflow-hidden rounded-2xl border border-stroke-soft-100">
						<table className="w-full text-left text-paragraph-sm">
							<thead className="bg-bg-weak-50 text-[12px] text-text-sub-600 uppercase">
								<tr>
									<th className="px-4 py-3 font-medium">When</th>
									<th className="px-4 py-3 font-medium">Type</th>
									<th className="px-4 py-3 font-medium">Delta</th>
									<th className="px-4 py-3 font-medium">Balance</th>
									<th className="px-4 py-3 font-medium">Reason</th>
								</tr>
							</thead>
							<tbody>
								{(data?.ledger ?? []).length === 0 ? (
									<tr>
										<td className="px-4 py-6 text-text-sub-600" colSpan={5}>
											No ledger entries
										</td>
									</tr>
								) : (
									data?.ledger.map((entry) => (
										<tr
											key={entry.id}
											className="border-stroke-soft-100 border-t"
										>
											<td className="px-4 py-3 text-text-sub-600">
												{new Date(entry.createdAt).toLocaleString()}
											</td>
											<td className="px-4 py-3">{entry.entryType}</td>
											<td className="px-4 py-3">
												{entry.delta > 0 ? `+${entry.delta}` : entry.delta}
											</td>
											<td className="px-4 py-3">{entry.balanceAfter}</td>
											<td className="px-4 py-3 text-text-sub-600">
												{entry.reason || "—"}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{topupOpen ? (
				<div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4">
					<div className="w-full max-w-md space-y-3 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 shadow-regular-md">
						<p className="font-medium text-label-sm">Top-up amount & reason</p>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									type="number"
									min={1}
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="Amount"
								/>
							</Input.Wrapper>
						</Input.Root>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Reason (optional)"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>
			) : null}

			<ConfirmActionDialog
				open={topupOpen}
				onOpenChange={setTopupOpen}
				title="Confirm credit top-up"
				description={`Add credits to organization ${organizationId}. This is audit-logged.`}
				confirmLabel="Top up"
				onConfirm={async () => {
					const parsed = Number(amount);
					if (!Number.isFinite(parsed) || parsed <= 0) {
						toast.error("Enter a positive amount");
						throw new Error("invalid");
					}
					await adminPost("/credits/topup", {
						organizationId,
						amount: parsed,
						reason: reason || "Manual top-up from admin",
					});
					toast.success(`Added ${parsed} credits`);
					mutate();
				}}
			/>
		</div>
	);
}
