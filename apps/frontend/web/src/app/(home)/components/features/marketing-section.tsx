import { cn } from "@reloop/ui/cn";
import { TeamVisual } from "./visuals";

function AITemplateMockup() {
	return (
		<div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-left shadow-2xl">
			<div className="flex items-center justify-between border-white/5 border-b pb-2">
				<span className="font-semibold text-[10px] text-white/80 uppercase tracking-wider">
					AI Template Generation
				</span>
				<span className="font-medium font-mono text-[9px] text-purple-400">
					LLM-v4.1
				</span>
			</div>

			<div className="my-3 flex flex-1 flex-col justify-center gap-2">
				{/* Input block */}
				<div className="rounded border border-white/5 bg-white/[0.02] p-2">
					<div className="font-bold text-[8px] text-white/30 uppercase tracking-wider">
						Template Prompt
					</div>
					<div className="mt-1 font-mono text-[10px] text-white/80">
						"Write a discount newsletter offer for developers who built over 5
						apps"
					</div>
				</div>

				{/* Stream block */}
				<div className="rounded border border-purple-500/15 bg-purple-500/5 p-2 font-mono text-[9px] text-purple-300 leading-normal">
					<span className="text-white/40">// Generated Subject Line</span>
					<div className="mt-0.5 font-semibold text-white">
						🚀 Power up your apps: 30% off Reloop Enterprise!
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between rounded border border-white/5 bg-white/[0.02] p-2 text-[9px] text-white/40">
				<span>Select variable inputs:</span>
				<div className="flex gap-1.5">
					<span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] text-white/60">
						name
					</span>
					<span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] text-white/60">
						app_count
					</span>
				</div>
			</div>
		</div>
	);
}

export default function MarketingSection() {
	return (
		<section
			id="marketing"
			className="border-[#0a0d12]/5 border-t border-b bg-white py-20 transition-colors duration-300 lg:py-24 dark:border-white/5 dark:bg-black"
		>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mb-20">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Marketing & Product Team
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Generate email templates using AI
					</h2>
					<p className="mt-5 max-w-[640px] text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[18px] dark:text-white/60">
						Use AI to generate beautiful and responsive email templates with
						ease. Save time and effort while maintaining high quality.
					</p>
				</div>

				{/* Grid Content / Subsections */}
				<div className="space-y-28 lg:space-y-36">
					{/* Subsection 1: AI Templates & Campaigns */}
					<div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
						{/* Content side */}
						<div className="flex flex-col justify-center lg:col-span-5">
							<h3 className="font-semibold text-[#0a0d12] text-[1.8rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.2rem] dark:text-white">
								AI Templates & Broadcasts
							</h3>
							<p className="mt-4 text-[#0a0d12]/60 text-[14px] leading-relaxed sm:text-[15px] dark:text-white/60">
								Generate rich newsletters, product announcements, and
								transactional templates using prompt engineering and dynamic
								variable tags.
							</p>

							<div className="mt-8 grid gap-4 sm:grid-cols-1">
								{[
									{
										title: "AI-Powered Templates",
										description:
											"Describe the campaign goal and let our AI compile optimized, responsive layout structures.",
									},
									{
										title: "Dynamic variable tags",
										description:
											"Safely inject names, purchase stats, and user accounts inside generated templates.",
									},
									{
										title: "Campaign Broadcasts",
										description:
											"Broadcast campaign alerts to your entire mailing list with robust signature verification.",
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
								<AITemplateMockup />
							</div>
						</div>
					</div>

					{/* Subsection 2: Live Collaboration */}
					<div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
						{/* Content side (ordered last for reverse layout on desktop) */}
						<div className="flex flex-col justify-center lg:order-last lg:col-span-5">
							<h3 className="font-semibold text-[#0a0d12] text-[1.8rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.2rem] dark:text-white">
								Live Editor & Team Collaboration
							</h3>
							<p className="mt-4 text-[#0a0d12]/60 text-[14px] leading-relaxed sm:text-[15px] dark:text-white/60">
								Stop editing markup in isolation. Reloop's real-time workspace
								allows designers, copywriters, and developers to build together.
							</p>

							<div className="mt-8 grid gap-4 sm:grid-cols-1">
								{[
									{
										title: "Live Visual Previews",
										description:
											"See your changes instantly across dozens of desktop and mobile devices while you build.",
									},
									{
										title: "Collaborate Without Friction",
										description:
											"Bring designers and developers together in one workspace with shared styles and built-in feedback.",
									},
									{
										title: "Zero-Risk Deployments",
										description:
											"Every change is versioned, so you can roll back instantly or review full diffs before going live.",
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
								<TeamVisual />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
