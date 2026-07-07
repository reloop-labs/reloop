"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@reloop/ui/icon";

export default function AiAgentWidget() {
	const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
	const [draftBody, setDraftBody] = useState(
		"Hi Alex,\n\nI apologize for the double charge on your last invoice. I have investigated this and processed a refund of $49.00 back to your original payment method. You should see it in 3-5 business days.\n\nBest,\nReloop Billing Copilot"
	);

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-indigo-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">agent_inbox_monitor.ai</span>
				</div>
				<span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 animate-pulse">
					AI Copilot Active
				</span>
			</div>

			<div className="flex-1 p-4 flex flex-col gap-4">
				{/* Step 1: Customer Inbound Message */}
				<div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
					<div className="flex justify-between items-center mb-2">
						<span className="text-[10px] text-white/40 font-mono">FROM: alex.smith@acme.com</span>
						<span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded-full">Billing Issue</span>
					</div>
					<p className="text-xs text-white/80 leading-relaxed font-sans">
						"Hey, my invoice #1024 was charged twice today. Can you check and process a refund? Thanks."
					</p>
				</div>

				{/* Agent Classification Analytics */}
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-slate-900/20 border border-white/5 rounded-lg p-2 flex items-center justify-between">
						<span className="text-[10px] text-white/40 font-mono">SENTIMENT</span>
						<span className="text-xs text-orange-400 font-bold font-mono">⚠️ Annoyed (88%)</span>
					</div>
					<div className="bg-slate-900/20 border border-white/5 rounded-lg p-2 flex items-center justify-between">
						<span className="text-[10px] text-white/40 font-mono">INTENT</span>
						<span className="text-xs text-indigo-400 font-bold font-mono">💸 refund_request</span>
					</div>
				</div>

				{/* Draft Response Area */}
				<div className="flex-1 bg-slate-950 border border-white/5 rounded-xl p-3 flex flex-col justify-between min-h-[160px]">
					<div className="flex-1 flex flex-col gap-2">
						<div className="flex justify-between items-center text-[10px] text-white/40 font-mono border-b border-white/5 pb-1.5 mb-1.5">
							<span>AGENT AUTO-DRAFT RESPONSE:</span>
							<span className="text-indigo-400 font-bold">Confidence: 94%</span>
						</div>
						
						{status === "pending" ? (
							<textarea
								value={draftBody}
								onChange={(e) => setDraftBody(e.target.value)}
								className="flex-1 bg-transparent border-0 text-xs font-mono text-white/70 focus:outline-none resize-none min-h-[100px] leading-relaxed"
							/>
						) : status === "approved" ? (
							<div className="flex-1 text-xs font-mono text-emerald-400/90 italic flex flex-col items-center justify-center gap-2">
								<Icon name="CheckCircle" className="w-8 h-8 text-emerald-500" />
								<span>Draft approved & sent successfully! Webhook notification fired.</span>
							</div>
						) : (
							<div className="flex-1 text-xs font-mono text-rose-400/90 italic flex flex-col items-center justify-center gap-2">
								<Icon name="XCircle" className="w-8 h-8 text-rose-500" />
								<span>Draft rejected. Thread handed over to human support agent.</span>
							</div>
						)}
					</div>

					{status === "pending" && (
						<div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
							<button
								onClick={() => setStatus("approved")}
								className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
							>
								<Icon name="Check" className="w-3.5 h-3.5" />
								<span>Approve & Send</span>
							</button>
							<button
								onClick={() => setStatus("rejected")}
								className="bg-slate-900 border border-white/10 hover:bg-slate-800 text-white/70 font-semibold text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
							>
								<Icon name="Trash2" className="w-3.5 h-3.5" />
								<span>Escalate</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
