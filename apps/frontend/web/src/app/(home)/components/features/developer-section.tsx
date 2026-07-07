import { cn } from "@reloop/ui/cn";
import CodeSnippet from "../code-snippet";
import { PipelinesVisual } from "./visuals";

function AnalyticsMockup() {
	return (
		<div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-left shadow-2xl">
			<div className="flex items-center justify-between border-white/5 border-b pb-2">
				<span className="font-semibold text-[10px] text-white/80 uppercase tracking-wider">
					Real-Time Delivery Analytics
				</span>
				<div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5">
					<div className="size-1 animate-pulse rounded-full bg-emerald-500" />
					<span className="font-bold text-[8px] text-emerald-500">
						MTA ONLINE
					</span>
				</div>
			</div>

			<div className="my-2.5 grid grid-cols-3 gap-2">
				{[
					{
						label: "Delivered",
						val: "99.85%",
						change: "+0.02%",
						color: "text-emerald-500",
					},
					{
						label: "Bounces",
						val: "0.15%",
						change: "-0.04%",
						color: "text-amber-500",
					},
					{
						label: "Avg Latency",
						val: "142ms",
						change: "-12ms",
						color: "text-blue-500",
					},
				].map((stat) => (
					<div
						key={stat.label}
						className="rounded border border-white/5 bg-white/[0.02] p-2"
					>
						<span className="block text-[9px] text-white/40">{stat.label}</span>
						<span className="mt-1 block font-semibold text-white text-xs">
							{stat.val}
						</span>
						<span
							className={cn("mt-0.5 block font-medium text-[8px]", stat.color)}
						>
							{stat.change}
						</span>
					</div>
				))}
			</div>

			{/* Mini graph representation */}
			<div className="flex h-10 flex-1 items-end gap-1 border-white/5 border-b px-2 pb-1">
				{[30, 45, 35, 60, 50, 75, 45, 90, 80, 95, 70, 75, 80, 85].map(
					(h, i) => (
						<div
							key={i}
							className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/10 to-emerald-500/30"
							style={{ height: `${h}%` }}
						/>
					),
				)}
			</div>

			<div className="mt-2 flex items-center justify-between font-mono text-[8px] text-white/30">
				<span>Log: send_event to user@gmail.com</span>
				<span className="text-emerald-500">DELIVERED (12ms)</span>
			</div>
		</div>
	);
}

export default function DeveloperSection() {
	return (
		<section id="developer">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mb-20">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Developers
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Best DX For Sending Email
					</h2>
				</div>

				{/* Grid Content / Subsections */}
				<div className="space-y-28 lg:space-y-36">
					{/* Subsection 1: SDK */}
					<div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
						{/* Content side */}
						<div className="flex flex-col justify-center lg:col-span-5">
							<h3 className="font-semibold text-[#0a0d12] text-[1.8rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.2rem] dark:text-white">
								Type-Safe Developer SDKs
							</h3>
							<p className="mt-4 text-[#0a0d12]/60 text-[14px] leading-relaxed sm:text-[15px] dark:text-white/60">
								Import our client library and start sending transactional emails
								in seconds. Reloop supports all major developer ecosystems with
								full type-safety.
							</p>

							<div className="mt-8 grid gap-4 sm:grid-cols-1">
								{[
									{
										title: "Type-Safe SDKs",
										description:
											"Fully typed libraries for Node.js, Go, Python, PHP, and Rust.",
									},
									{
										title: "Zero Configuration",
										description:
											"Get started instantly by importing our client and supplying your API key.",
									},
									{
										title: "React & Next.js Optimized",
										description:
											"First-class support for Server Components, custom templates, and light/dark modes.",
									},
								].map((card) => (
									<div key={card.title} className="group/card flex gap-4">
										<div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#0a0d12]/8 bg-white font-bold text-[10px] text-emerald-500 shadow-sm dark:border-white/8 dark:bg-white/[0.02]">
											✓
										</div>
										<div>
											<h4 className="font-semibold text-[#0a0d12] text-sm leading-snug dark:text-white">
												{card.title}
											</h4>
											<p className="mt-1 text-[#0a0d12]/50 text-[13px] leading-relaxed dark:text-white/55">
												{card.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Visual side */}
						<div className="group relative lg:col-span-7">
							<div className="-inset-4 absolute rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 opacity-30 blur-2xl transition duration-500 group-hover:opacity-50 dark:opacity-40 dark:group-hover:opacity-60" />
							<div className="relative overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-zinc-950 p-4 shadow-2xl transition-all duration-300 group-hover:border-emerald-500/30 sm:p-6 lg:p-8 dark:border-white/10 dark:group-hover:border-emerald-500/30">
								<CodeSnippet />
							</div>
						</div>
					</div>

					{/* Subsection 2: Webhooks */}
					<div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
						{/* Content side (ordered last for reverse layout on desktop) */}
						<div className="flex flex-col justify-center lg:order-last lg:col-span-5">
							<h3 className="font-semibold text-[#0a0d12] text-[1.8rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.2rem] dark:text-white">
								Event-Driven Webhook Pipelines
							</h3>
							<p className="mt-4 text-[#0a0d12]/60 text-[14px] leading-relaxed sm:text-[15px] dark:text-white/60">
								Scale your email operations without managing server queues.
								Relay notifications, track bounces, and enforce compliance
								automatically.
							</p>

							<div className="mt-8 grid gap-4 sm:grid-cols-1">
								{[
									{
										title: "Managed Authentication",
										description:
											"We handle the technical complexity of SPF, DKIM, and DMARC so your emails always reach the inbox.",
									},
									{
										title: "AI-powered Content Guard",
										description:
											"Automatically catch spam triggers, broken images, and phishing signals before sending.",
									},
									{
										title: "Programmable Flow",
										description:
											"Define complex retry logic, A/B tests, and delivery rules with a simple, YAML-based configuration.",
									},
								].map((card) => (
									<div key={card.title} className="group/card flex gap-4">
										<div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#0a0d12]/8 bg-white font-bold text-[10px] text-cyan-500 shadow-sm dark:border-white/8 dark:bg-white/[0.02]">
											✓
										</div>
										<div>
											<h4 className="font-semibold text-[#0a0d12] text-sm leading-snug dark:text-white">
												{card.title}
											</h4>
											<p className="mt-1 text-[#0a0d12]/50 text-[13px] leading-relaxed dark:text-white/55">
												{card.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Visual side */}
						<div className="group relative lg:col-span-7">
							<div className="-inset-4 absolute rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 opacity-30 blur-2xl transition duration-500 group-hover:opacity-50 dark:opacity-40 dark:group-hover:opacity-60" />
							<div className="relative overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-zinc-950 p-4 shadow-2xl transition-all duration-300 group-hover:border-cyan-500/30 sm:p-6 lg:p-8 dark:border-white/10 dark:group-hover:border-cyan-500/30">
								<PipelinesVisual />
							</div>
						</div>
					</div>

					{/* Subsection 3: Analytics */}
					<div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
						{/* Content side */}
						<div className="flex flex-col justify-center lg:col-span-5">
							<h3 className="font-semibold text-[#0a0d12] text-[1.8rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.2rem] dark:text-white">
								MTA & Delivery Analytics
							</h3>
							<p className="mt-4 text-[#0a0d12]/60 text-[14px] leading-relaxed sm:text-[15px] dark:text-white/60">
								Keep track of your email pipeline performance. Get real-time
								delivery confirmations, bounce tracking logs, latency stats, and
								detailed status updates.
							</p>

							<div className="mt-8 grid gap-4 sm:grid-cols-1">
								{[
									{
										title: "Real-Time Tracking",
										description:
											"Track send operations and receipt status logs the exact millisecond they occur.",
									},
									{
										title: "Failure Resolution",
										description:
											"Instantly debug bounce statuses, spam flags, and transient ISP delivery blocks.",
									},
									{
										title: "MTA Latency Metrics",
										description:
											"Analyze latency curves and pipeline throughput across global node regions.",
									},
								].map((card) => (
									<div key={card.title} className="group/card flex gap-4">
										<div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#0a0d12]/8 bg-white font-bold text-[10px] text-violet-500 shadow-sm dark:border-white/8 dark:bg-white/[0.02]">
											✓
										</div>
										<div>
											<h4 className="font-semibold text-[#0a0d12] text-sm leading-snug dark:text-white">
												{card.title}
											</h4>
											<p className="mt-1 text-[#0a0d12]/50 text-[13px] leading-relaxed dark:text-white/55">
												{card.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Visual side */}
						<div className="group relative lg:col-span-7">
							<div className="-inset-4 absolute rounded-3xl bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 opacity-30 blur-2xl transition duration-500 group-hover:opacity-50 dark:opacity-40 dark:group-hover:opacity-60" />
							<div className="relative overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-zinc-950 p-4 shadow-2xl transition-all duration-300 group-hover:border-violet-500/30 sm:p-6 lg:p-8 dark:border-white/10 dark:group-hover:border-violet-500/30">
								<AnalyticsMockup />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
