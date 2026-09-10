"use client";

import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useState } from "react";

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
		addLog(
			"✅ [2/3] Deliverability checks passed (DMARC/SPF/DKIM: OK)",
			1500,
			2,
		);
		addLog(
			"📨 [3/3] Webhook fired: email.delivered (P99 delay: 1.4s)",
			1800,
			2,
		);

		setTimeout(() => {
			setStatus("success");
		}, 2000);
	};

	return (
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Terminal Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3 dark:border-white/5 dark:bg-slate-900">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-text-sub-600 text-xs dark:text-white/40">
						transactional_debugger.sh
					</span>
				</div>
				<span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-600 dark:text-blue-400">
					Latency API
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-5 p-5 text-sm text-text-strong-950 dark:text-white/90">
				{/* Top Controls */}
				<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/60 p-3 dark:border-white/5 dark:bg-slate-900/60">
					<div>
						<div className="font-mono text-text-sub-600 text-xs dark:text-white/40">
							ENDPOINT
						</div>
						<div className="mt-0.5 font-mono text-text-sub-600 text-xs dark:text-white/70">
							https://api.reloop.sh/v1/emails
						</div>
					</div>
					<button
						onClick={triggerSend}
						disabled={status === "sending"}
						className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium text-xs transition-all ${
							status === "sending"
								? "cursor-not-allowed bg-stroke-soft-200 text-text-sub-600 dark:bg-slate-800 dark:text-white/40"
								: "cursor-pointer bg-blue-600 text-white shadow-blue-500/10 shadow-lg hover:bg-blue-500 active:scale-95"
						}`}
					>
						{status === "sending" ? (
							<>
								<div className="h-3 w-3 animate-spin rounded-full border-2 border-stroke-soft-200 border-t-text-strong-950 dark:border-white/20 dark:border-t-white" />
								Sending...
							</>
						) : (
							<span>⚡ Run API Request</span>
						)}
					</button>
				</div>

				{/* Visual Flow Timeline */}
				<div className="relative flex items-center justify-between overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 px-6 py-4 dark:border-white/5 dark:bg-slate-900/30">
					{/* Flow Connector Line */}
					<div className="-translate-y-1/2 absolute top-1/2 right-[15%] left-[15%] z-0 h-0.5 bg-stroke-soft-200 dark:bg-slate-800">
						{status === "sending" && (
							<motion.div
								className="h-full origin-left bg-blue-500"
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{ duration: 1.8, ease: "linear" }}
							/>
						)}
						{status === "success" && (
							<div className="h-full w-full bg-blue-500" />
						)}
					</div>

					{/* Step 1: App Trigger */}
					<div className="relative z-10 flex flex-col items-center gap-2">
						<div
							className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
								activeStep >= 0
									? "border-blue-500 bg-blue-50 text-blue-600 shadow-blue-500/20 shadow-lg dark:bg-blue-950 dark:text-blue-400"
									: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-slate-900 dark:text-white/40"
							}`}
						>
							<Icon name="laptop" className="h-4 w-4" />
						</div>
						<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/60">
							App Send
						</span>
					</div>

					{/* Step 2: Reloop Engine */}
					<div className="relative z-10 flex flex-col items-center gap-2">
						<div
							className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
								activeStep >= 1
									? "border-blue-500 bg-blue-50 text-blue-600 shadow-blue-500/20 shadow-lg dark:bg-blue-950 dark:text-blue-400"
									: activeStep === 0
										? "animate-pulse border-blue-500/50 bg-bg-weak-50 text-blue-600/70 dark:bg-slate-900 dark:text-blue-400/60"
										: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-slate-900 dark:text-white/40"
							}`}
						>
							<Icon name="Server" className="h-4 w-4" />
						</div>
						<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/60">
							Reloop MTU
						</span>
					</div>

					{/* Step 3: Webhook Delivered */}
					<div className="relative z-10 flex flex-col items-center gap-2">
						<div
							className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
								status === "success"
									? "border-green-500 bg-green-50 text-green-600 shadow-green-500/20 shadow-lg dark:bg-green-950 dark:text-green-400"
									: activeStep === 2
										? "animate-pulse border-blue-500/50 bg-bg-weak-50 text-blue-600/70 dark:bg-slate-900 dark:text-blue-400/60"
										: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-slate-900 dark:text-white/40"
							}`}
						>
							<Icon name="CheckCircle" className="h-4 w-4" />
						</div>
						<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/60">
							Delivered
						</span>
					</div>
				</div>

				{/* Terminal output */}
				<div className="flex min-h-[160px] flex-1 flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 font-mono text-xs dark:border-white/5 dark:bg-slate-950">
					<div className="flex max-h-[140px] flex-col gap-1.5 overflow-y-auto text-text-sub-600 dark:text-white/50">
						{logs.length === 0 && (
							<span className="text-text-soft-400 italic dark:text-white/25">
								Click 'Run API Request' to inspect SMTP and webhook delivery
								lifecycle.
							</span>
						)}
						{logs.map((log, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -5 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.15 }}
								className={
									log.startsWith("⚡")
										? "text-blue-600 dark:text-blue-400"
										: log.startsWith("📨") || log.startsWith("✅")
											? "text-emerald-600 dark:text-emerald-400"
											: "text-text-sub-600 dark:text-white/60"
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
							className="mt-3 flex items-center justify-between rounded border-stroke-soft-200 border-t bg-emerald-500/5 px-2 py-1 pt-3 font-mono text-[11px] text-emerald-600 dark:border-white/5 dark:text-emerald-400"
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
