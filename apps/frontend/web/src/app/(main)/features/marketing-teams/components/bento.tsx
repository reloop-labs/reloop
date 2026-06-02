"use client";

import { Icon } from "@reloop/ui/icon";

export default function Bento() {
	return (
		<section className="border-[#0a0d12]/5 border-t bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="mb-20 text-center">
					<p className="font-semibold text-[#0a0d12]/40 text-[11px] uppercase tracking-[0.16em]">
						Everything Your Team Needs
					</p>
					<h2 className="mt-4 font-semibold text-[2.6rem] leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Built for Team Collaboration
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[#0a0d12]/50 text-base">
						Stop editing campaign code in isolation. Build templates, verify SPF/DKIM
						records, and broadcast together with complete deliverability control.
					</p>
				</div>

				<div className="grid gap-px overflow-hidden rounded-2xl border border-[#0a0d12]/8 bg-[#0a0d12]/8 sm:grid-cols-2 lg:grid-cols-3">
					{/* Card 1: AI Templates */}
					<div className="col-span-1 flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:col-span-2 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="arrow-swap" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								AI-Powered Email Templates
							</h3>
							<p className="max-w-md text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Generate highly engaging layout designs, subject lines, and marketing copy
								from natural language prompts. Customize with safe dynamic tags to run personalized workflows.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
								<div className="mb-1 font-mono text-[#0a0d12]/40 text-xs">
									TEMPLATE FORMAT
								</div>
								<div className="font-mono font-semibold text-[#0a0d12] text-[13px]">
									Responsive HTML / CSS
								</div>
								<div className="mt-1 font-mono text-[#0a0d12]/30 text-[11px]">
									Auto-inlining style rules
								</div>
							</div>
							<div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
								<div className="mb-1 font-mono text-[#0a0d12]/40 text-xs">
									PERSONALIZATION
								</div>
								<div className="font-mono font-semibold text-[#0a0d12] text-[13px]">
									Dynamic Handlebars
								</div>
								<div className="mt-1 font-mono text-[#0a0d12]/30 text-[11px]">
									Inject profile metadata live
								</div>
							</div>
						</div>
					</div>

					{/* Card 2: Live Team Editor */}
					<div className="flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="graph-up" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								Live Collaborative Editor
							</h3>
							<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Work seamlessly in real-time. Designers, copywriters, and developers can refine email drafts, see responsive rendering instantly, and sign off together.
							</p>
						</div>
						<div className="mt-12 flex items-end justify-between">
							<div>
								<div className="font-bold text-3xl text-[#0a0d12] tracking-tight">
									3x Faster
								</div>
								<div className="mt-1 text-[#0a0d12]/40 text-[11px]">
									Average Design Cycles
								</div>
							</div>
							{/* Mini Sparkline */}
							<svg
								className="h-8 w-20 text-teal-500"
								viewBox="0 0 100 30"
								fill="none"
							>
								<path
									d="M0 25 L15 24 L30 18 L45 20 L60 12 L75 14 L90 3 L100 5"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>

					{/* Card 3: Broadcast Analytics */}
					<div className="flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="lock" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								Broadcast Analytics
							</h3>
							<p className="text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Scale campaigns with audience segmentation, visual performance logs, open-rate optimization suggestions, and deliverability health monitors.
							</p>
						</div>
						<div className="mt-12 flex flex-wrap gap-2">
							<span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 font-semibold text-[11px] text-teal-600">
								Open Rates Checked
							</span>
							<span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 font-semibold text-[11px] text-teal-600">
								Audience Segment Pass
							</span>
						</div>
					</div>

					{/* Card 4: Webhook Event Dispatch */}
					<div className="col-span-1 flex flex-col justify-between bg-white p-8 transition-colors hover:bg-zinc-50/50 lg:col-span-2 lg:p-10">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-[#0a0d12]/8 bg-[#0a0d12]/4">
								<Icon name="webhook" className="size-5 text-[#0a0d12]/60" />
							</div>
							<h3 className="mb-3 font-semibold text-[#0a0d12] text-[18px] leading-snug sm:text-[20px]">
								MTA Spam &amp; Reputation Alerts
							</h3>
							<p className="max-w-md text-[#0a0d12]/56 text-[14px] leading-[1.7]">
								Protect your sending domain scores. Instantly intercept broken links, invalid email addresses, and spam triggers to safeguard campaign deliverability.
							</p>
						</div>

						<div className="mt-12 space-y-1 rounded-xl bg-[#0a0a0a] p-4 font-mono text-[11px] shadow-inner">
							<div className="mb-2 flex justify-between border-white/5 border-b pb-2 text-white/30">
								<span>MTA DELIVERABILITY STATUS</span>
								<span className="text-teal-400">EXCELLENT</span>
							</div>
							<div className="flex justify-between text-teal-400">
								<span>POST https://api.yourdomain.com/webhooks/deliverability</span>
								<span className="text-emerald-400">200 OK</span>
							</div>
							<div className="text-white/40">
								&#123; "type": "campaign.sent", "delivered": 4518, "bounce_score": "0.04%" &#125;
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
