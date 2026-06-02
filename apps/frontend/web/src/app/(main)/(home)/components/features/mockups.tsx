import { cn } from "@reloop/ui/cn";

export function AgentInboxMockup() {
	return (
		<div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl p-5 flex flex-col justify-between text-left">
			<div className="flex items-center justify-between border-white/5 border-b pb-2.5">
				<div className="flex items-center gap-2">
					<div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
					<span className="font-semibold text-[10px] text-white/80 uppercase tracking-wider">
						Autonomous Agent Inbox
					</span>
				</div>
				<span className="text-[9px] text-white/30 font-mono">active_thread: #2983a</span>
			</div>

			<div className="flex-1 my-3 grid grid-cols-12 gap-3 min-h-0">
				{/* Left sidebar: incoming logs */}
				<div className="col-span-4 border-r border-white/5 pr-2 space-y-1.5 overflow-hidden">
					<span className="font-bold text-[9px] text-white/30 uppercase tracking-wider block">
						Queue
					</span>
					{[
						{ label: "Refund #1092", state: "PARSED", active: true },
						{ label: "Password Reset", state: "RESOLVED" },
						{ label: "Subscription Cancel", state: "REVIEW" },
					].map((item) => (
						<div
							key={item.label}
							className={cn(
								"p-1.5 rounded text-[9px] font-mono border transition-colors",
								item.active
									? "bg-white/10 border-white/10 text-white"
									: "bg-white/[0.01] border-transparent text-white/40",
							)}
						>
							<div className="font-semibold truncate">{item.label}</div>
							<div className="text-[8px] text-emerald-400 mt-0.5">{item.state}</div>
						</div>
					))}
				</div>

				{/* Right main area: parsed JSON output */}
				<div className="col-span-8 flex flex-col justify-between">
					<div className="rounded bg-black/40 border border-white/5 p-2 font-mono text-[9px] text-emerald-400/90 overflow-hidden leading-normal">
						<span className="text-white/40">// Ingested Email Payload</span>
						<pre className="mt-1">
							{`{
  "sender": "user@example.com",
  "intent": "REFUND_REQUEST",
  "entities": {
    "invoice": "#1092",
    "amount": "$49.00",
    "reason": "double charge"
  }
}`}
						</pre>
					</div>

					<div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded p-1.5 text-[9px] text-emerald-400 font-mono mt-2">
						<span>🤖 Suggestion: Process auto-refund</span>
						<button className="bg-emerald-500 text-black font-semibold px-2 py-0.5 rounded text-[8px] hover:bg-emerald-400">
							Dispatch
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function AnalyticsMockup() {
	return (
		<div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl p-4 flex flex-col justify-between text-left">
			<div className="flex items-center justify-between border-white/5 border-b pb-2">
				<span className="font-semibold text-[10px] text-white/80 uppercase tracking-wider">
					Real-Time Delivery Analytics
				</span>
				<div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5">
					<div className="size-1 animate-pulse rounded-full bg-emerald-500" />
					<span className="font-bold text-[8px] text-emerald-500">MTA ONLINE</span>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2 my-2.5">
				{[
					{ label: "Delivered", val: "99.85%", change: "+0.02%", color: "text-emerald-500" },
					{ label: "Bounces", val: "0.15%", change: "-0.04%", color: "text-amber-500" },
					{ label: "Avg Latency", val: "142ms", change: "-12ms", color: "text-blue-500" },
				].map((stat) => (
					<div key={stat.label} className="rounded bg-white/[0.02] border border-white/5 p-2">
						<span className="text-[9px] text-white/40 block">{stat.label}</span>
						<span className="text-xs font-semibold text-white mt-1 block">{stat.val}</span>
						<span className={cn("text-[8px] block mt-0.5 font-medium", stat.color)}>
							{stat.change}
						</span>
					</div>
				))}
			</div>

			{/* Mini graph representation */}
			<div className="flex-1 flex items-end gap-1 px-2 h-10 border-b border-white/5 pb-1">
				{[30, 45, 35, 60, 50, 75, 45, 90, 80, 95, 70, 75, 80, 85].map((h, i) => (
					<div
						key={i}
						className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/10 to-emerald-500/30"
						style={{ height: `${h}%` }}
					/>
				))}
			</div>

			<div className="mt-2 flex items-center justify-between text-[8px] text-white/30 font-mono">
				<span>Log: send_event to user@gmail.com</span>
				<span className="text-emerald-500">DELIVERED (12ms)</span>
			</div>
		</div>
	);
}

export function AITemplateMockup() {
	return (
		<div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl p-4 flex flex-col justify-between text-left">
			<div className="flex items-center justify-between border-white/5 border-b pb-2">
				<span className="font-semibold text-[10px] text-white/80 uppercase tracking-wider">
					AI Template Generation
				</span>
				<span className="text-[9px] text-purple-400 font-mono font-medium">LLM-v4.1</span>
			</div>

			<div className="flex-1 my-3 flex flex-col gap-2 justify-center">
				{/* Input block */}
				<div className="rounded bg-white/[0.02] border border-white/5 p-2">
					<div className="text-[8px] text-white/30 uppercase font-bold tracking-wider">
						Template Prompt
					</div>
					<div className="text-[10px] text-white/80 mt-1 font-mono">
						"Write a discount newsletter offer for developers who built over 5 apps"
					</div>
				</div>

				{/* Stream block */}
				<div className="rounded bg-purple-500/5 border border-purple-500/15 p-2 font-mono text-[9px] text-purple-300 leading-normal">
					<span className="text-white/40">// Generated Subject Line</span>
					<div className="text-white font-semibold mt-0.5">
						🚀 Power up your apps: 30% off Reloop Enterprise!
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded p-2 text-[9px] text-white/40">
				<span>Select variable inputs:</span>
				<div className="flex gap-1.5">
					<span className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] text-white/60">
						name
					</span>
					<span className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] text-white/60">
						app_count
					</span>
				</div>
			</div>
		</div>
	);
}
