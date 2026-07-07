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
		<div className="flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-left font-sans shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-white/5 border-b bg-slate-900 px-4 py-3">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-white/40 text-xs">
						stripe_webhook_listener.ledger
					</span>
				</div>
				<span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
					Stripe API Hook
				</span>
			</div>

			<div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2">
				{/* Left Side: Webhook event simulator */}
				<div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4">
					<h3 className="font-bold text-white/40 text-xs uppercase tracking-wider">
						Simulate billing event
					</h3>

					<div className="flex flex-col gap-2.5">
						<button
							onClick={() => fireStripeWebhook("invoice.payment_succeeded")}
							disabled={status === "listening"}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${
								activeWebhook === "invoice.payment_succeeded"
									? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
									: "border-white/5 bg-slate-950 text-white/55 hover:border-white/15"
							}`}
						>
							<div className="flex items-center gap-2">
								<Icon name="Activity" className="h-3.5 w-3.5" />
								<span>invoice.payment_succeeded</span>
							</div>
							<span className="font-mono text-[9px] text-emerald-400">
								Trigger
							</span>
						</button>

						<button
							onClick={() => fireStripeWebhook("customer.subscription.created")}
							disabled={status === "listening"}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${
								activeWebhook === "customer.subscription.created"
									? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
									: "border-white/5 bg-slate-950 text-white/55 hover:border-white/15"
							}`}
						>
							<div className="flex items-center gap-2">
								<Icon name="Activity" className="h-3.5 w-3.5" />
								<span>subscription.created</span>
							</div>
							<span className="font-mono text-[9px] text-emerald-400">
								Trigger
							</span>
						</button>
					</div>

					{status === "listening" && (
						<div className="mt-2 flex items-center gap-2 rounded border border-white/5 bg-slate-950 p-2.5 font-mono text-white/50 text-xs">
							<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
							<span>Reloop parsing webhook & generating invoice PDF...</span>
						</div>
					)}
				</div>

				{/* Right Side: Ledger / compiled receipt email */}
				<div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900 p-3">
					<div className="flex flex-1 flex-col gap-3.5 overflow-hidden rounded-lg border border-white/5 bg-slate-950 p-3.5 text-left">
						{status === "compiled" ? (
							<div className="space-y-3.5 overflow-y-auto text-white/80 text-xs leading-relaxed">
								<div className="flex items-center justify-between border-white/5 border-b pb-2">
									<span className="font-bold text-white">Payment Receipt</span>
									<span className="font-mono text-[9px] text-white/40">
										Invoice #INV-2901
									</span>
								</div>

								<div>
									<p className="text-[10px] text-white/40">CUSTOMER</p>
									<p className="font-semibold text-white">
										billing-admin@acme.com
									</p>
								</div>

								<div className="space-y-1 border-white/5 border-t border-b py-2">
									<div className="flex justify-between text-[11px]">
										<span>Reloop Developer Plan (1 month)</span>
										<span className="font-mono text-white/70">$29.00</span>
									</div>
									<div className="flex justify-between text-[10px] text-white/40">
										<span>Tax (0%):</span>
										<span className="font-mono">$0.00</span>
									</div>
								</div>

								<div className="flex items-center justify-between font-bold text-white text-xs">
									<span>Paid Total:</span>
									<span className="font-mono text-emerald-400">$29.00</span>
								</div>

								<div className="flex items-center justify-between rounded border border-white/5 bg-slate-900/60 p-2 text-[10px] text-white/60">
									<span className="flex items-center gap-1">
										<Icon
											name="FileText"
											className="h-3 w-3 text-emerald-400"
										/>
										<span>invoice_pdf_2901.pdf</span>
									</span>
									<span className="cursor-pointer font-mono text-[9px] text-emerald-400 hover:underline">
										Download
									</span>
								</div>
							</div>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center text-white/35 text-xs italic">
								<Icon name="Inbox" className="h-8 w-8 text-white/10" />
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
