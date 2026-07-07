"use client";

import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SystemMonitoringWidget() {
	const [isSpiking, setIsSpiking] = useState(false);
	const [logs, setLogs] = useState<string[]>([
		"ℹ️ [08:00:00] Server check: healthy",
		"ℹ️ [08:05:00] Database latency: 12ms (OK)",
		"ℹ️ [08:10:00] Memory allocation: 42% (OK)",
	]);

	const triggerIncident = () => {
		if (isSpiking) return;
		setIsSpiking(true);

		const addLog = (msg: string, delay: number) => {
			setTimeout(() => {
				setLogs((prev) => [...prev, msg]);
			}, delay);
		};

		addLog(
			"⚠️ [08:14:32] WARNING: API request latency spikes above 2000ms",
			300,
		);
		addLog("🚨 [08:14:35] CRITICAL: CPU usage threshold exceeded 95%", 600);
		addLog(
			"📧 [08:14:36] Reloop SMTP: Dispatching [CRITICAL] server alert",
			900,
		);
		addLog(
			"📬 Reloop SMTP: Dispatch success to oncall@company.com (12ms)",
			1200,
		);
		addLog("🔌 Reloop Webhook: Triggering PagerDuty service bridge", 1500);
		addLog("✅ [08:14:38] PagerDuty Incident #81729 created", 1800);
	};

	const resetIncident = () => {
		setIsSpiking(false);
		setLogs([
			"ℹ️ [08:00:00] Server check: healthy",
			"ℹ️ [08:05:00] Database latency: 12ms (OK)",
			"ℹ️ [08:10:00] Memory allocation: 42% (OK)",
		]);
	};

	return (
		<div
			className={`flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border font-sans shadow-2xl transition-all duration-300 ${
				isSpiking
					? "border-red-500/30 bg-red-950/20"
					: "border-white/10 bg-slate-950"
			}`}
		>
			{/* Header */}
			<div
				className={`flex items-center justify-between border-white/5 border-b px-4 py-3 transition-colors ${
					isSpiking ? "bg-red-950/50" : "bg-slate-900"
				}`}
			>
				<div className="flex items-center gap-1.5">
					{isSpiking ? (
						<span className="h-2.5 w-2.5 animate-ping rounded-full bg-red-500" />
					) : (
						<span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
					)}
					<span className="ml-2 font-mono text-white/40 text-xs">
						sys_monitor_watchdog.sh
					</span>
				</div>
				<span
					className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
						isSpiking
							? "border-red-500/20 bg-red-500/10 text-red-400"
							: "border-white/10 bg-slate-500/10 text-slate-400"
					}`}
				>
					{isSpiking ? "ALERTING STATE" : "MONITORING ACTIVE"}
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-5 p-5 text-left text-sm">
				{/* Top Status Cards */}
				<div className="grid grid-cols-3 gap-3 text-white">
					<div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3">
						<span className="font-mono text-[10px] text-white/40">
							NODE HEALTH
						</span>
						<span
							className={`mt-1 font-bold font-mono text-xs ${isSpiking ? "text-red-400" : "text-emerald-400"}`}
						>
							{isSpiking ? "⚠️ UNHEALTHY" : "🟢 HEALTHY"}
						</span>
					</div>
					<div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3">
						<span className="font-mono text-[10px] text-white/40">
							CPU LOAD
						</span>
						<span
							className={`mt-1 font-bold font-mono text-xs ${isSpiking ? "text-red-400" : "text-slate-300"}`}
						>
							{isSpiking ? "🔥 98.4%" : "12.6%"}
						</span>
					</div>
					<div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3">
						<span className="font-mono text-[10px] text-white/40">
							P99 LATENCY
						</span>
						<span
							className={`mt-1 font-bold font-mono text-xs ${isSpiking ? "text-red-400" : "text-slate-300"}`}
						>
							{isSpiking ? "⚡ 2410ms" : "14ms"}
						</span>
					</div>
				</div>

				{/* Incident Control Section */}
				<div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-3.5">
					<div>
						<div className="font-mono text-white/40 text-xs">
							INCIDENT DISPATCHER
						</div>
						<div className="mt-0.5 font-mono text-[11px] text-white/60">
							Send alerts automatically on CPU Spike
						</div>
					</div>
					<div className="flex gap-2">
						{isSpiking ? (
							<button
								onClick={resetIncident}
								className="cursor-pointer rounded-lg bg-slate-800 px-3.5 py-1.5 font-medium text-white text-xs transition-colors hover:bg-slate-700"
							>
								Resolve
							</button>
						) : (
							<button
								onClick={triggerIncident}
								className="cursor-pointer rounded-lg bg-red-600 px-3.5 py-1.5 font-medium text-white text-xs shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 active:scale-95"
							>
								Simulate Spike
							</button>
						)}
					</div>
				</div>

				{/* Logger Outputs */}
				<div className="flex min-h-[140px] flex-1 flex-col justify-between rounded-xl border border-white/5 bg-slate-950 p-3.5 text-left font-mono text-[11px]">
					<div className="flex max-h-[120px] flex-col gap-1.5 overflow-y-auto text-white/60">
						{logs.map((log, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -5 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.1 }}
								className={
									log.includes("🚨") || log.includes("⚠️")
										? "font-semibold text-red-400"
										: log.includes("📧") || log.includes("📬")
											? "text-slate-300"
											: log.includes("✅")
												? "text-emerald-400"
												: "text-white/45"
								}
							>
								{log}
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
