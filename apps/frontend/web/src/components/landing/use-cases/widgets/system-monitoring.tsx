"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@reloop/ui/icon";

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

		addLog("⚠️ [08:14:32] WARNING: API request latency spikes above 2000ms", 300);
		addLog("🚨 [08:14:35] CRITICAL: CPU usage threshold exceeded 95%", 600);
		addLog("📧 [08:14:36] Reloop SMTP: Dispatching [CRITICAL] server alert", 900);
		addLog("📬 Reloop SMTP: Dispatch success to oncall@company.com (12ms)", 1200);
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
		<div className={`flex flex-col h-full min-h-[420px] rounded-2xl border overflow-hidden shadow-2xl font-sans transition-all duration-300 ${
			isSpiking 
				? "bg-red-950/20 border-red-500/30" 
				: "bg-slate-950 border-white/10"
		}`}>
			{/* Header */}
			<div className={`flex items-center justify-between px-4 py-3 border-b border-white/5 transition-colors ${
				isSpiking ? "bg-red-950/50" : "bg-slate-900"
			}`}>
				<div className="flex items-center gap-1.5">
					{isSpiking ? (
						<span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
					) : (
						<span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
					)}
					<span className="text-xs text-white/40 font-mono ml-2">sys_monitor_watchdog.sh</span>
				</div>
				<span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
					isSpiking 
						? "text-red-400 bg-red-500/10 border-red-500/20" 
						: "text-slate-400 bg-slate-500/10 border-white/10"
				}`}>
					{isSpiking ? "ALERTING STATE" : "MONITORING ACTIVE"}
				</span>
			</div>

			<div className="flex-1 p-5 flex flex-col gap-5 text-sm text-left">
				{/* Top Status Cards */}
				<div className="grid grid-cols-3 gap-3 text-white">
					<div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
						<span className="text-[10px] text-white/40 font-mono">NODE HEALTH</span>
						<span className={`text-xs font-bold font-mono mt-1 ${isSpiking ? "text-red-400" : "text-emerald-400"}`}>
							{isSpiking ? "⚠️ UNHEALTHY" : "🟢 HEALTHY"}
						</span>
					</div>
					<div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
						<span className="text-[10px] text-white/40 font-mono">CPU LOAD</span>
						<span className={`text-xs font-bold font-mono mt-1 ${isSpiking ? "text-red-400" : "text-slate-300"}`}>
							{isSpiking ? "🔥 98.4%" : "12.6%"}
						</span>
					</div>
					<div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
						<span className="text-[10px] text-white/40 font-mono">P99 LATENCY</span>
						<span className={`text-xs font-bold font-mono mt-1 ${isSpiking ? "text-red-400" : "text-slate-300"}`}>
							{isSpiking ? "⚡ 2410ms" : "14ms"}
						</span>
					</div>
				</div>

				{/* Incident Control Section */}
				<div className="flex items-center justify-between bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
					<div>
						<div className="text-xs text-white/40 font-mono">INCIDENT DISPATCHER</div>
						<div className="text-[11px] text-white/60 font-mono mt-0.5">Send alerts automatically on CPU Spike</div>
					</div>
					<div className="flex gap-2">
						{isSpiking ? (
							<button
								onClick={resetIncident}
								className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
							>
								Resolve
							</button>
						) : (
							<button
								onClick={triggerIncident}
								className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-lg shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
							>
								Simulate Spike
							</button>
						)}
					</div>
				</div>

				{/* Logger Outputs */}
				<div className="flex-1 bg-slate-950 border border-white/5 rounded-xl p-3.5 font-mono text-[11px] flex flex-col justify-between min-h-[140px] text-left">
					<div className="flex flex-col gap-1.5 overflow-y-auto max-h-[120px] text-white/60">
						{logs.map((log, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -5 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.1 }}
								className={
									log.includes("🚨") || log.includes("⚠️")
										? "text-red-400 font-semibold"
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
