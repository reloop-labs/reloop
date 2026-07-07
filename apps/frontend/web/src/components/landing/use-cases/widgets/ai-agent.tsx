"use client";

import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function AiAgentWidget() {
	const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
		"pending",
	);
	const [draftBody, setDraftBody] = useState(
		"Hi Alex,\n\nI apologize for the double charge on your last invoice. I have investigated this and processed a refund of $49.00 back to your original payment method. You should see it in 3-5 business days.\n\nBest,\nReloop Billing Copilot",
	);

	return (
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-left font-sans shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-white/5 border-b bg-slate-900 px-4 py-3">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-indigo-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-white/40 text-xs">
						agent_inbox_monitor.ai
					</span>
				</div>
				<span className="animate-pulse rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] text-indigo-400">
					AI Copilot Active
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-4 p-4">
				{/* Step 1: Customer Inbound Message */}
				<div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-mono text-[10px] text-white/40">
							FROM: alex.smith@acme.com
						</span>
						<span className="rounded-full bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] text-rose-400">
							Billing Issue
						</span>
					</div>
					<p className="font-sans text-white/80 text-xs leading-relaxed">
						"Hey, my invoice #1024 was charged twice today. Can you check and
						process a refund? Thanks."
					</p>
				</div>

				{/* Agent Classification Analytics */}
				<div className="grid grid-cols-2 gap-3">
					<div className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/20 p-2">
						<span className="font-mono text-[10px] text-white/40">
							SENTIMENT
						</span>
						<span className="font-bold font-mono text-orange-400 text-xs">
							⚠️ Annoyed (88%)
						</span>
					</div>
					<div className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/20 p-2">
						<span className="font-mono text-[10px] text-white/40">INTENT</span>
						<span className="font-bold font-mono text-indigo-400 text-xs">
							💸 refund_request
						</span>
					</div>
				</div>

				{/* Draft Response Area */}
				<div className="flex min-h-[160px] flex-1 flex-col justify-between rounded-xl border border-white/5 bg-slate-950 p-3">
					<div className="flex flex-1 flex-col gap-2">
						<div className="mb-1.5 flex items-center justify-between border-white/5 border-b pb-1.5 font-mono text-[10px] text-white/40">
							<span>AGENT AUTO-DRAFT RESPONSE:</span>
							<span className="font-bold text-indigo-400">Confidence: 94%</span>
						</div>

						{status === "pending" ? (
							<textarea
								value={draftBody}
								onChange={(e) => setDraftBody(e.target.value)}
								className="min-h-[100px] flex-1 resize-none border-0 bg-transparent font-mono text-white/70 text-xs leading-relaxed focus:outline-none"
							/>
						) : status === "approved" ? (
							<div className="flex flex-1 flex-col items-center justify-center gap-2 font-mono text-emerald-400/90 text-xs italic">
								<Icon name="CheckCircle" className="h-8 w-8 text-emerald-500" />
								<span>
									Draft approved & sent successfully! Webhook notification
									fired.
								</span>
							</div>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-2 font-mono text-rose-400/90 text-xs italic">
								<Icon name="XCircle" className="h-8 w-8 text-rose-500" />
								<span>
									Draft rejected. Thread handed over to human support agent.
								</span>
							</div>
						)}
					</div>

					{status === "pending" && (
						<div className="mt-2 flex gap-2 border-white/5 border-t pt-2">
							<button
								onClick={() => setStatus("approved")}
								className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-indigo-600 py-2 font-semibold text-white text-xs transition-colors hover:bg-indigo-500"
							>
								<Icon name="Check" className="h-3.5 w-3.5" />
								<span>Approve & Send</span>
							</button>
							<button
								onClick={() => setStatus("rejected")}
								className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-semibold text-white/70 text-xs transition-colors hover:bg-slate-800"
							>
								<Icon name="Trash2" className="h-3.5 w-3.5" />
								<span>Escalate</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
