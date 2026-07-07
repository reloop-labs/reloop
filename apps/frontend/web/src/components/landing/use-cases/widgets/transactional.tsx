"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@reloop/ui/icon";

export default function TransactionalWidget() {
	const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
	const [logs, setLogs] = useState<string[]>([]);
	const [activeStep, setActiveStep] = useState<number>(-1);

	const triggerSend = () => {
		if (status === "sending") return;
		setStatus("sending");
		setLogs([]);
		setActiveStep(0);

		const addLog = (msg: string, delay: number, stepIndex: number) => {
			setTimeout(() => {
				setLogs((prev) => [...prev, msg]);
				setActiveStep(stepIndex);
			}, delay);
		};

		addLog("⚡ [1/3] POST /v1/emails.send initialized...", 200, 0);
		addLog("🔑 SDK API key authentication succeeded", 500, 0);
		addLog("📬 Resolving recipient: user@company.com", 900, 1);
		addLog("🚀 SMTP/HTTP payload dispatched to Reloop Edge", 1200, 1);
		addLog("✅ [2/3] Deliverability checks passed (DMARC/SPF/DKIM: OK)", 1500, 2);
		addLog("📨 [3/3] Webhook fired: email.delivered (P99 delay: 1.4s)", 1800, 2);

		setTimeout(() => {
			setStatus("success");
		}, 2000);
	};

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans">
			{/* Terminal Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">transactional_debugger.sh</span>
				</div>
				<span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
					Latency API
				</span>
			</div>

			<div className="flex-1 p-5 flex flex-col gap-5 text-sm text-white/90">
				{/* Top Controls */}
				<div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-white/5">
					<div>
						<div className="text-xs text-white/40 font-mono">ENDPOINT</div>
						<div className="font-mono text-xs text-white/70 mt-0.5">https://api.reloop.dev/v1/emails</div>
					</div>
					<button
						onClick={triggerSend}
						disabled={status === "sending"}
						className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 ${
							status === "sending"
								? "bg-slate-800 text-white/40 cursor-not-allowed"
								: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer"
						}`}
					>
						{status === "sending" ? (
							<>
								<div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
								Sending...
							</>
						) : (
							<>
								<span>⚡ Run API Request</span>
							</>
						)}
					</button>
				</div>

				{/* Visual Flow Timeline */}
				<div className="relative flex items-center justify-between px-6 py-4 bg-slate-900/30 rounded-xl border border-white/5 overflow-hidden">
					{/* Flow Connector Line */}
					<div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-slate-800 -translate-y-1/2 z-0">
						{status === "sending" && (
							<motion.div
								className="h-full bg-blue-500 origin-left"
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{ duration: 1.8, ease: "linear" }}
							/>
						)}
						{status === "success" && <div className="w-full h-full bg-blue-500" />}
					</div>

					{/* Step 1: App Trigger */}
					<div className="flex flex-col items-center gap-2 z-10 relative">
						<div
							className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
								activeStep >= 0
									? "bg-blue-950 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20"
									: "bg-slate-900 border-white/10 text-white/40"
							}`}
						>
							<Icon name="Laptop" className="w-4 h-4" />
						</div>
						<span className="text-[10px] font-mono text-white/60">App Send</span>
					</div>

					{/* Step 2: Reloop Engine */}
					<div className="flex flex-col items-center gap-2 z-10 relative">
						<div
							className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
								activeStep >= 1
									? "bg-blue-950 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20"
									: activeStep === 0
									? "bg-slate-900 border-blue-500/50 text-blue-400/60 animate-pulse"
									: "bg-slate-900 border-white/10 text-white/40"
							}`}
						>
							<Icon name="Server" className="w-4 h-4" />
						</div>
						<span className="text-[10px] font-mono text-white/60">Reloop MTU</span>
					</div>

					{/* Step 3: Webhook Delivered */}
					<div className="flex flex-col items-center gap-2 z-10 relative">
						<div
							className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
								status === "success"
									? "bg-green-950 border-green-500 text-green-400 shadow-lg shadow-green-500/20"
									: activeStep === 2
									? "bg-slate-900 border-blue-500/50 text-blue-400/60 animate-pulse"
									: "bg-slate-900 border-white/10 text-white/40"
							}`}
						>
							<Icon name="CheckCircle" className="w-4 h-4" />
						</div>
						<span className="text-[10px] font-mono text-white/60">Delivered</span>
					</div>
				</div>

				{/* Terminal output */}
				<div className="flex-1 min-h-[160px] bg-slate-950 border border-white/5 rounded-xl p-4 font-mono text-xs flex flex-col justify-between">
					<div className="flex flex-col gap-1.5 overflow-y-auto max-h-[140px] text-white/50">
						{logs.length === 0 && (
							<span className="text-white/25 italic">Click 'Run API Request' to inspect SMTP and webhook delivery lifecycle.</span>
						)}
						{logs.map((log, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -5 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.15 }}
								className={
									log.startsWith("⚡")
										? "text-blue-400"
										: log.startsWith("📨") || log.startsWith("✅")
										? "text-emerald-400"
										: "text-white/60"
								}
							>
								{log}
							</motion.div>
						))}
					</div>

					{status === "success" && (
						<motion.div
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-emerald-400 font-mono bg-emerald-500/5 px-2 py-1 rounded"
						>
							<span>🚀 delivery.confirmed</span>
							<span>latency: 1.4s</span>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
}
