"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export default function PaymentReceiptWidget() {
	const [status, setStatus] = useState<"idle" | "listening" | "compiled">(
		"idle",
	);
	const [activeWebhook, setActiveWebhook] = useState<string>("");

	const fireStripeWebhook = (event: string) => {
		setActiveWebhook(event);
		setStatus("listening");

		setTimeout(() => {
			setStatus("compiled");
		}, 1600);
	};

	return (
		<div className="flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 text-left font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3 dark:border-white/5 dark:bg-slate-900">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-text-sub-600 text-xs dark:text-white/40">
						stripe_webhook_listener.ledger
					</span>
				</div>
				<span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
					Stripe API Hook
				</span>
			</div>

			<div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2">
				{/* Left Side: Webhook event simulator */}
				<div className="flex flex-col gap-4 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/60 p-4 dark:border-white/5 dark:bg-slate-900/40">
					<h3 className="font-bold text-text-sub-600 text-xs uppercase tracking-wider dark:text-white/40">
						Simulate billing event
					</h3>

					<div className="flex flex-col gap-2.5">
						<button
							onClick={() => fireStripeWebhook("invoice.payment_succeeded")}
							disabled={status === "listening"}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${
								activeWebhook === "invoice.payment_succeeded"
									? "border-emerald-500/40 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-300"
									: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-stroke-soft-200 dark:border-white/5 dark:bg-slate-950 dark:text-white/55 dark:hover:border-white/15"
							}`}
						>
							<div className="flex items-center gap-2">
								<Icon name="Activity" className="h-3.5 w-3.5" />
								<span>invoice.payment_succeeded</span>
							</div>
							<span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
								Trigger
							</span>
						</button>

						<button
							onClick={() => fireStripeWebhook("customer.subscription.created")}
							disabled={status === "listening"}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${
								activeWebhook === "customer.subscription.created"
									? "border-emerald-500/40 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-300"
									: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-stroke-soft-200 dark:border-white/5 dark:bg-slate-950 dark:text-white/55 dark:hover:border-white/15"
							}`}
						>
							<div className="flex items-center gap-2">
								<Icon name="Activity" className="h-3.5 w-3.5" />
								<span>subscription.created</span>
							</div>
							<span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
								Trigger
							</span>
						</button>
					</div>

					{status === "listening" && (
						<div className="mt-2 flex items-center gap-2 rounded border border-stroke-soft-200 bg-bg-white-0 p-2.5 font-mono text-text-sub-600 text-xs dark:border-white/5 dark:bg-slate-950 dark:text-white/50">
							<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stroke-soft-200 border-t-text-strong-950 dark:border-white/20 dark:border-t-white" />
							<span>Reloop parsing webhook & generating invoice PDF...</span>
						</div>
					)}
				</div>

				{/* Right Side: Ledger / compiled receipt email */}
				<div className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 dark:border-white/5 dark:bg-slate-900">
					<div className="flex flex-1 flex-col gap-3.5 overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3.5 text-left dark:border-white/5 dark:bg-slate-950">
						{status === "compiled" ? (
							<div className="space-y-3.5 overflow-y-auto text-text-strong-950 text-xs leading-relaxed dark:text-white/80">
								<div className="flex items-center justify-between border-stroke-soft-200 border-b pb-2 dark:border-white/5">
									<span className="font-bold text-text-strong-950 dark:text-white">
										Payment Receipt
									</span>
									<span className="font-mono text-[9px] text-text-sub-600 dark:text-white/40">
										Invoice #INV-2901
									</span>
								</div>

								<div>
									<p className="text-[10px] text-text-sub-600 dark:text-white/40">
										CUSTOMER
									</p>
									<p className="font-semibold text-text-strong-950 dark:text-white">
										billing-admin@acme.com
									</p>
								</div>

								<div className="space-y-1 border-stroke-soft-200 border-t border-b py-2 dark:border-white/5">
									<div className="flex justify-between text-[11px]">
										<span>Reloop Developer Plan (1 month)</span>
										<span className="font-mono text-text-sub-600 dark:text-white/70">
											$29.00
										</span>
									</div>
									<div className="flex justify-between text-[10px] text-text-sub-600 dark:text-white/40">
										<span>Tax (0%):</span>
										<span className="font-mono">$0.00</span>
									</div>
								</div>

								<div className="flex items-center justify-between font-bold text-text-strong-950 text-xs dark:text-white">
									<span>Paid Total:</span>
									<span className="font-mono text-emerald-600 dark:text-emerald-400">
										$29.00
									</span>
								</div>

								<div className="flex items-center justify-between rounded border border-stroke-soft-200 bg-bg-weak-50/60 p-2 text-[10px] text-text-sub-600 dark:border-white/5 dark:bg-slate-900/60 dark:text-white/60">
									<span className="flex items-center gap-1">
										<Icon
											name="FileText"
											className="h-3 w-3 text-emerald-600 dark:text-emerald-400"
										/>
										<span>invoice_pdf_2901.pdf</span>
									</span>
									<span className="cursor-pointer font-mono text-[9px] text-emerald-600 hover:underline dark:text-emerald-400">
										Download
									</span>
								</div>
							</div>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center text-text-soft-400 text-xs italic dark:text-white/35">
								<Icon
									name="Inbox"
									className="h-8 w-8 text-text-soft-400/40 dark:text-white/10"
								/>
								<span>
									Select a billing event trigger on the left to watch webhook
									compilation flow.
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
