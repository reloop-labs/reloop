"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

const BillingPage = () => {
	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Billing & Subscription
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Manage your subscription plan, payment methods, and invoices.
					</p>
				</div>

				{/* Plan Overview */}
				<div className="rounded-xl border border-stroke-soft-200 bg-white p-6 shadow-sm">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="font-medium text-label-sm text-text-sub-600">
								Current Plan
							</p>
							<p className="font-semibold text-2xl text-text-strong-950">
								Pro Plan
							</p>
						</div>
						<Button.Root variant="neutral" size="xsmall">
							Upgrade Plan
						</Button.Root>
					</div>

					<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">
								Next billing date
							</p>
							<p className="font-medium text-label-sm text-text-strong-950">
								June 7, 2026
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">
								Billing interval
							</p>
							<p className="font-medium text-label-sm text-text-strong-950">
								Monthly
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-paragraph-xs text-text-sub-600">Amount</p>
							<p className="font-medium text-label-sm text-text-strong-950">
								$29.00
							</p>
						</div>
					</div>
				</div>

				{/* Billing History */}
				<div className="mt-10">
					<p className="font-medium text-label-sm text-text-strong-950">
						Billing History
					</p>
					<div className="mt-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-white">
						<table className="w-full text-left text-sm">
							<thead className="border-stroke-soft-200 border-b bg-neutral-alpha-5">
								<tr>
									<th className="px-4 py-3 font-medium text-text-sub-600">
										Date
									</th>
									<th className="px-4 py-3 font-medium text-text-sub-600">
										Amount
									</th>
									<th className="px-4 py-3 font-medium text-text-sub-600">
										Status
									</th>
									<th className="px-4 py-3 text-right font-medium text-text-sub-600">
										Invoice
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-stroke-soft-200">
								{[
									{ date: "May 7, 2026", amount: "$29.00", status: "Paid" },
									{ date: "Apr 7, 2026", amount: "$29.00", status: "Paid" },
									{ date: "Mar 7, 2026", amount: "$29.00", status: "Paid" },
								].map((invoice) => (
									<tr
										key={invoice.date}
										className="transition-colors hover:bg-neutral-alpha-5/5"
									>
										<td className="px-4 py-3 text-text-strong-950">
											{invoice.date}
										</td>
										<td className="px-4 py-3 text-text-strong-950">
											{invoice.amount}
										</td>
										<td className="px-4 py-3">
											<span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 font-medium text-[10px] text-green-700">
												{invoice.status}
											</span>
										</td>
										<td className="px-4 py-3 text-right">
											<Button.Root variant="neutral" mode="ghost" size="xsmall">
												<Icon name="file-text" className="h-4 w-4" />
											</Button.Root>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BillingPage;
