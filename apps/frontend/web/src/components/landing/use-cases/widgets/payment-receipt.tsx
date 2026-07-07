"use client";

import { useState } from "react";
import { Icon } from "@reloop/ui/icon";

export default function PaymentReceiptWidget() {
	const [status, setStatus] = useState<"idle" | "listening" | "compiled">("idle");
	const [activeWebhook, setActiveWebhook] = useState<string>("");

	const fireStripeWebhook = (event: string) => {
		setActiveWebhook(event);
		setStatus("listening");

		setTimeout(() => {
			setStatus("compiled");
		}, 1600);
	};

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left justify-between">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">stripe_webhook_listener.ledger</span>
				</div>
				<span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
					Stripe API Hook
				</span>
			</div>

			<div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Left Side: Webhook event simulator */}
				<div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
					<h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Simulate billing event</h3>
					
					<div className="flex flex-col gap-2.5">
						<button
							onClick={() => fireStripeWebhook("invoice.payment_succeeded")}
							disabled={status === "listening"}
							className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
								activeWebhook === "invoice.payment_succeeded"
									? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
									: "bg-slate-950 border-white/5 text-white/55 hover:border-white/15"
							}`}
						>
							<div className="flex items-center gap-2">
								<Icon name="Activity" className="w-3.5 h-3.5" />
								<span>invoice.payment_succeeded</span>
							</div>
							<span className="text-[9px] font-mono text-emerald-400">Trigger</span>
						</button>

						<button
							onClick={() => fireStripeWebhook("customer.subscription.created")}
							disabled={status === "listening"}
							className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
								activeWebhook === "customer.subscription.created"
									? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
									: "bg-slate-950 border-white/5 text-white/55 hover:border-white/15"
							}`}
						>
							<div className="flex items-center gap-2">
								<Icon name="Activity" className="w-3.5 h-3.5" />
								<span>subscription.created</span>
							</div>
							<span className="text-[9px] font-mono text-emerald-400">Trigger</span>
						</button>
					</div>

					{status === "listening" && (
						<div className="flex items-center gap-2 text-xs text-white/50 font-mono mt-2 bg-slate-950 p-2.5 rounded border border-white/5">
							<div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
							<span>Reloop parsing webhook & generating invoice PDF...</span>
						</div>
					)}
				</div>

				{/* Right Side: Ledger / compiled receipt email */}
				<div className="bg-slate-900 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
					<div className="border border-white/5 bg-slate-950 rounded-lg p-3.5 flex-1 text-left flex flex-col gap-3.5 overflow-hidden">
						{status === "compiled" ? (
							<div className="space-y-3.5 text-xs text-white/80 leading-relaxed overflow-y-auto">
								<div className="flex justify-between items-center border-b border-white/5 pb-2">
									<span className="font-bold text-white">Payment Receipt</span>
									<span className="text-[9px] text-white/40 font-mono">Invoice #INV-2901</span>
								</div>

								<div>
									<p className="text-[10px] text-white/40">CUSTOMER</p>
									<p className="font-semibold text-white">billing-admin@acme.com</p>
								</div>

								<div className="border-t border-b border-white/5 py-2 space-y-1">
									<div className="flex justify-between text-[11px]">
										<span>Reloop Developer Plan (1 month)</span>
										<span className="font-mono text-white/70">$29.00</span>
									</div>
									<div className="flex justify-between text-[10px] text-white/40">
										<span>Tax (0%):</span>
										<span className="font-mono">$0.00</span>
									</div>
								</div>

								<div className="flex justify-between items-center text-xs font-bold text-white">
									<span>Paid Total:</span>
									<span className="text-emerald-400 font-mono">$29.00</span>
								</div>

								<div className="bg-slate-900/60 p-2 rounded border border-white/5 flex items-center justify-between text-[10px] text-white/60">
									<span className="flex items-center gap-1">
										<Icon name="FileText" className="w-3 h-3 text-emerald-400" />
										<span>invoice_pdf_2901.pdf</span>
									</span>
									<span className="text-emerald-400 font-mono text-[9px] hover:underline cursor-pointer">Download</span>
								</div>
							</div>
						) : (
							<div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-white/35 italic gap-1.5">
								<Icon name="Inbox" className="w-8 h-8 text-white/10" />
								<span>Select a billing event trigger on the left to watch webhook compilation flow.</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
