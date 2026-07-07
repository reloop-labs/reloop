"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@reloop/ui/icon";

export default function AutomatedWidget() {
	const [activeNode, setActiveNode] = useState<number>(-1);
	const [isRunning, setIsRunning] = useState(false);
	const [branchDecided, setBranchDecided] = useState<"yes" | "no" | null>(null);

	const runSimulation = () => {
		if (isRunning) return;
		setIsRunning(true);
		setActiveNode(0);
		setBranchDecided(null);

		const scheduleNode = (nodeIndex: number, delay: number, cb?: () => void) => {
			setTimeout(() => {
				setActiveNode(nodeIndex);
				if (cb) cb();
			}, delay);
		};

		scheduleNode(1, 1000); // Wait 1 Day node
		scheduleNode(2, 2000); // Send Welcome Node
		scheduleNode(3, 3500); // User Engaged Decision Node
		scheduleNode(4, 5000, () => {
			// Decide branch randomly or based on mock rules
			const decision = Math.random() > 0.5 ? "yes" : "no";
			setBranchDecided(decision);
			if (decision === "yes") {
				setActiveNode(5); // Sent promo code
			} else {
				setActiveNode(6); // Add tag 'unengaged'
			}
		});

		setTimeout(() => {
			setIsRunning(false);
		}, 7000);
	};

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left">
			{/* Designer Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-violet-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">welcome_series_drip.workflow</span>
				</div>
				<span className="text-[10px] text-violet-400 font-mono bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
					Drip Engine
				</span>
			</div>

			<div className="flex-1 p-5 flex flex-col gap-6">
				{/* Header & Control Button */}
				<div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-white/5">
					<div>
						<div className="text-xs text-white/40 font-mono">TRIGGER EVENT</div>
						<div className="text-xs text-white/70 font-semibold mt-0.5 font-mono">user.registered</div>
					</div>
					<button
						onClick={runSimulation}
						disabled={isRunning}
						className={`px-4 py-2 rounded-lg font-medium text-xs transition-all cursor-pointer ${
							isRunning
								? "bg-slate-800 text-white/40 cursor-not-allowed"
								: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 active:scale-95"
						}`}
					>
						{isRunning ? "Simulating Workflow..." : "⚡ Simulate Workflow"}
					</button>
				</div>

				{/* SVG Flow canvas */}
				<div className="flex-1 min-h-[220px] bg-slate-900/20 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
					{/* SVG Connector Paths */}
					<svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
						<title>Workflow Connectors</title>
						{/* Path Node 0 -> Node 1 */}
						<line x1="50%" y1="12%" x2="50%" y2="28%" stroke="#334155" strokeWidth="2" />
						{/* Path Node 1 -> Node 2 */}
						<line x1="50%" y1="36%" x2="50%" y2="50%" stroke="#334155" strokeWidth="2" />
						{/* Path Node 2 -> Node 3 */}
						<line x1="50%" y1="58%" x2="50%" y2="70%" stroke="#334155" strokeWidth="2" />
						{/* Path Node 3 -> Branch Node 4 (Yes) */}
						<path d="M 50% 78% Q 30% 78% 30% 86%" fill="none" stroke={branchDecided === "yes" ? "#8b5cf6" : "#334155"} strokeWidth="2" />
						{/* Path Node 3 -> Branch Node 5 (No) */}
						<path d="M 50% 78% Q 70% 78% 70% 86%" fill="none" stroke={branchDecided === "no" ? "#ef4444" : "#334155"} strokeWidth="2" />
					</svg>

					{/* Flow nodes stack */}
					<div className="flex flex-col gap-8 w-full items-center z-10">
						{/* Node 0: Trigger */}
						<div
							className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
								activeNode === 0
									? "bg-violet-950 border-violet-500 text-violet-300 ring-2 ring-violet-500/20"
									: "bg-slate-900 border-white/5 text-white/50"
							}`}
						>
							<Icon name="Activity" className="w-3.5 h-3.5" />
							<span>user.registered</span>
						</div>

						{/* Node 1: Delay */}
						<div
							className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
								activeNode === 1
									? "bg-violet-950 border-violet-500 text-violet-300 ring-2 ring-violet-500/20"
									: "bg-slate-900 border-white/5 text-white/50"
							}`}
						>
							<Icon name="Clock" className="w-3.5 h-3.5" />
							<span>Wait 1 Day</span>
						</div>

						{/* Node 2: Send Email */}
						<div
							className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
								activeNode === 2
									? "bg-violet-950 border-violet-500 text-violet-300 ring-2 ring-violet-500/20"
									: "bg-slate-900 border-white/5 text-white/50"
							}`}
						>
							<Icon name="Mail" className="w-3.5 h-3.5" />
							<span>Send "Welcome to Reloop" Email</span>
						</div>

						{/* Node 3: Condition Check */}
						<div
							className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
								activeNode >= 3
									? "bg-violet-950 border-violet-500 text-violet-300 ring-2 ring-violet-500/20"
									: "bg-slate-900 border-white/5 text-white/50"
							}`}
						>
							<Icon name="GitFork" className="w-3.5 h-3.5" />
							<span>Condition: Link Clicked?</span>
						</div>

						{/* Branches */}
						<div className="flex justify-between w-[90%] -mt-3">
							{/* Yes Node */}
							<div
								className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1 ${
									activeNode === 5
										? "bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20"
										: "bg-slate-900/60 border-white/5 text-white/30"
								}`}
							>
								<Icon name="Percent" className="w-3 h-3 text-emerald-400" />
								<span>Yes: Send 20% Off coupon</span>
							</div>

							{/* No Node */}
							<div
								className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1 ${
									activeNode === 6
										? "bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/20"
										: "bg-slate-900/60 border-white/5 text-white/30"
								}`}
							>
								<Icon name="Tag" className="w-3 h-3 text-rose-400" />
								<span>No: Tag "Unengaged"</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
