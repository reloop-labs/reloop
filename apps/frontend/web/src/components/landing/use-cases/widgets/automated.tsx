"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export default function AutomatedWidget() {
	const [activeNode, setActiveNode] = useState<number>(-1);
	const [isRunning, setIsRunning] = useState(false);
	const [branchDecided, setBranchDecided] = useState<"yes" | "no" | null>(null);

	const runSimulation = () => {
		if (isRunning) return;
		setIsRunning(true);
		setActiveNode(0);
		setBranchDecided(null);

		const scheduleNode = (
			nodeIndex: number,
			delay: number,
			cb?: () => void,
		) => {
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
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 text-left font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Designer Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3 dark:border-white/5 dark:bg-slate-900">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-violet-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-text-sub-600 text-xs dark:text-white/40">
						welcome_series_drip.workflow
					</span>
				</div>
				<span className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-600 dark:text-violet-400">
					Drip Engine
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-6 p-5">
				{/* Header & Control Button */}
				<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/60 p-3 dark:border-white/5 dark:bg-slate-900/40">
					<div>
						<div className="font-mono text-text-sub-600 text-xs dark:text-white/40">
							TRIGGER EVENT
						</div>
						<div className="mt-0.5 font-mono font-semibold text-text-sub-600 text-xs dark:text-white/70">
							user.registered
						</div>
					</div>
					<button
						onClick={runSimulation}
						disabled={isRunning}
						className={`cursor-pointer rounded-lg px-4 py-2 font-medium text-xs transition-all ${
							isRunning
								? "cursor-not-allowed bg-stroke-soft-200 text-text-sub-600 dark:bg-slate-800 dark:text-white/40"
								: "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 active:scale-95"
						}`}
					>
						{isRunning ? "Simulating Workflow..." : "⚡ Simulate Workflow"}
					</button>
				</div>

				{/* SVG Flow canvas */}
				<div className="relative flex min-h-[220px] flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50/40 p-4 dark:border-white/5 dark:bg-slate-900/20">
					{/* SVG Connector Paths */}
					<svg
						className="pointer-events-none absolute inset-0 h-full w-full"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Workflow Connectors</title>
						{/* Path Node 0 -> Node 1 */}
						<line
							x1="50%"
							y1="12%"
							x2="50%"
							y2="28%"
							stroke="#334155"
							strokeWidth="2"
						/>
						{/* Path Node 1 -> Node 2 */}
						<line
							x1="50%"
							y1="36%"
							x2="50%"
							y2="50%"
							stroke="#334155"
							strokeWidth="2"
						/>
						{/* Path Node 2 -> Node 3 */}
						<line
							x1="50%"
							y1="58%"
							x2="50%"
							y2="70%"
							stroke="#334155"
							strokeWidth="2"
						/>
						{/* Path Node 3 -> Branch Node 4 (Yes) */}
						<path
							d="M 50% 78% Q 30% 78% 30% 86%"
							fill="none"
							stroke={branchDecided === "yes" ? "#8b5cf6" : "#334155"}
							strokeWidth="2"
						/>
						{/* Path Node 3 -> Branch Node 5 (No) */}
						<path
							d="M 50% 78% Q 70% 78% 70% 86%"
							fill="none"
							stroke={branchDecided === "no" ? "#ef4444" : "#334155"}
							strokeWidth="2"
						/>
					</svg>

					{/* Flow nodes stack */}
					<div className="z-10 flex w-full flex-col items-center gap-8">
						{/* Node 0: Trigger */}
						<div
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
								activeNode === 0
									? "border-violet-500 bg-violet-50 text-violet-600 ring-2 ring-violet-500/20 dark:bg-violet-950 dark:text-violet-300"
									: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/5 dark:bg-slate-900 dark:text-white/50"
							}`}
						>
							<Icon name="Activity" className="h-3.5 w-3.5" />
							<span>user.registered</span>
						</div>

						{/* Node 1: Delay */}
						<div
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
								activeNode === 1
									? "border-violet-500 bg-violet-50 text-violet-600 ring-2 ring-violet-500/20 dark:bg-violet-950 dark:text-violet-300"
									: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/5 dark:bg-slate-900 dark:text-white/50"
							}`}
						>
							<Icon name="Clock" className="h-3.5 w-3.5" />
							<span>Wait 1 Day</span>
						</div>

						{/* Node 2: Send Email */}
						<div
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
								activeNode === 2
									? "border-violet-500 bg-violet-50 text-violet-600 ring-2 ring-violet-500/20 dark:bg-violet-950 dark:text-violet-300"
									: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/5 dark:bg-slate-900 dark:text-white/50"
							}`}
						>
							<Icon name="Mail" className="h-3.5 w-3.5" />
							<span>Send "Welcome to Reloop" Email</span>
						</div>

						{/* Node 3: Condition Check */}
						<div
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
								activeNode >= 3
									? "border-violet-500 bg-violet-50 text-violet-600 ring-2 ring-violet-500/20 dark:bg-violet-950 dark:text-violet-300"
									: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/5 dark:bg-slate-900 dark:text-white/50"
							}`}
						>
							<Icon name="GitFork" className="h-3.5 w-3.5" />
							<span>Condition: Link Clicked?</span>
						</div>

						{/* Branches */}
						<div className="-mt-3 flex w-[90%] justify-between">
							{/* Yes Node */}
							<div
								className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 font-mono text-[11px] transition-all ${
									activeNode === 5
										? "border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-300"
										: "border-stroke-soft-200 bg-bg-weak-50/60 text-text-soft-400 dark:border-white/5 dark:bg-slate-900/60 dark:text-white/30"
								}`}
							>
								<Icon
									name="Percent"
									className="h-3 w-3 text-emerald-600 dark:text-emerald-400"
								/>
								<span>Yes: Send 20% Off coupon</span>
							</div>

							{/* No Node */}
							<div
								className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 font-mono text-[11px] transition-all ${
									activeNode === 6
										? "border-rose-500 bg-rose-50 text-rose-600 ring-2 ring-rose-500/20 dark:bg-rose-950 dark:text-rose-300"
										: "border-stroke-soft-200 bg-bg-weak-50/60 text-text-soft-400 dark:border-white/5 dark:bg-slate-900/60 dark:text-white/30"
								}`}
							>
								<Icon
									name="Tag"
									className="h-3 w-3 text-rose-600 dark:text-rose-400"
								/>
								<span>No: Tag "Unengaged"</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
