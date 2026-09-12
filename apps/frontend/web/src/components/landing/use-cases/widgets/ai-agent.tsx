"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export default function AiAgentWidget() {
	const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
		"pending",
	);
	const [draftBody, setDraftBody] = useState(
		"Hi Alex,\n\nI apologize for the double charge on your last invoice. I have investigated this and processed a refund of $49.00 back to your original payment method. You should see it in 3-5 business days.\n\nBest,\nReloop Billing Copilot",
	);

	return (
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 text-left font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3 dark:border-white/5 dark:bg-slate-900">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-text-sub-600 text-xs dark:text-white/40">
						agent_inbox_monitor.ai
					</span>
				</div>
				<span className="animate-pulse rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-600 dark:text-blue-400">
					AI Copilot Active
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-4 p-4">
				{/* Step 1: Customer Inbound Message */}
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/60 p-3 dark:border-white/5 dark:bg-slate-900/40">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/40">
							FROM: alex.smith@acme.com
						</span>
						<span className="rounded-full bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] text-rose-600 dark:text-rose-400">
							Billing Issue
						</span>
					</div>
					<p className="font-sans text-text-strong-950 text-xs leading-relaxed dark:text-white/80">
						&ldquo;Hey, my invoice #1024 was charged twice today. Can you check
						and process a refund? Thanks.&rdquo;
					</p>
				</div>

				{/* Agent Classification Analytics */}
				<div className="grid grid-cols-2 gap-3">
					<div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-weak-50/40 p-2 dark:border-white/5 dark:bg-slate-900/20">
						<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/40">
							SENTIMENT
						</span>
						<span className="font-bold font-mono text-orange-600 text-xs dark:text-orange-400">
							Annoyed (88%)
						</span>
					</div>
					<div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-weak-50/40 p-2 dark:border-white/5 dark:bg-slate-900/20">
						<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/40">
							INTENT
						</span>
						<span className="font-bold font-mono text-blue-600 text-xs dark:text-blue-400">
							refund_request
						</span>
					</div>
				</div>

				{/* Draft Response Area */}
				<div className="flex min-h-[160px] flex-1 flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 dark:border-white/5 dark:bg-slate-950">
					<div className="flex flex-1 flex-col gap-2">
						<div className="mb-1.5 flex items-center justify-between border-stroke-soft-200 border-b pb-1.5 font-mono text-[10px] text-text-sub-600 dark:border-white/5 dark:text-white/40">
							<span>AGENT AUTO-DRAFT RESPONSE:</span>
							<span className="font-bold text-blue-600 dark:text-blue-400">
								Confidence: 94%
							</span>
						</div>

						{status === "pending" ? (
							<textarea
								value={draftBody}
								onChange={(e) => setDraftBody(e.target.value)}
								className="min-h-[100px] flex-1 resize-none border-0 bg-transparent font-mono text-text-sub-600 text-xs leading-relaxed focus:outline-none dark:text-white/70"
							/>
						) : status === "approved" ? (
							<div className="flex flex-1 flex-col items-center justify-center gap-2 font-mono text-emerald-600 text-xs italic dark:text-emerald-400/90">
								<Icon
									name="check-circle"
									className="h-8 w-8 text-emerald-500"
								/>
								<span>
									Draft approved & sent successfully! Webhook notification
									fired.
								</span>
							</div>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-2 font-mono text-rose-600 text-xs italic dark:text-rose-400/90">
								<Icon name="cross-circle" className="h-8 w-8 text-rose-500" />
								<span>
									Draft rejected. Thread handed over to human support agent.
								</span>
							</div>
						)}
					</div>

					{status === "pending" && (
						<div className="mt-2 flex gap-2 border-stroke-soft-200 border-t pt-2 dark:border-white/5">
							<button
								type="button"
								onClick={() => setStatus("approved")}
								className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-blue-600 py-2 font-semibold text-white text-xs transition-colors hover:bg-blue-500"
							>
								<Icon name="check" className="h-3.5 w-3.5" />
								<span>Approve & Send</span>
							</button>
							<button
								type="button"
								onClick={() => setStatus("rejected")}
								className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 font-semibold text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-slate-900 dark:text-white/70 dark:hover:bg-slate-800"
							>
								<Icon name="trash-2" className="h-3.5 w-3.5" />
								<span>Escalate</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
