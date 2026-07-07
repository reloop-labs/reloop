"use client";

import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import { useState } from "react";

export default function MarketingWidget() {
	const [hasHero, setHasHero] = useState(true);
	const [hasPromo, setHasPromo] = useState(false);
	const [hasCTA, setHasCTA] = useState(true);

	// Calculated mock statistics based on content options
	const openRate = 22 + (hasHero ? 4.5 : 0) + (hasPromo ? 3 : 0);
	const clickRate = 2.4 + (hasCTA ? 1.8 : 0) + (hasPromo ? 2.5 : 0);

	return (
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 font-sans shadow-2xl">
			{/* Designer Header */}
			<div className="flex items-center justify-between border-white/5 border-b bg-slate-900 px-4 py-3">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-white/40 text-xs">
						campaign_builder_v2.email
					</span>
				</div>
				<span className="rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] text-rose-400">
					Builder Mode
				</span>
			</div>

			<div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2">
				{/* Editor & Stats Control */}
				<div className="flex flex-col justify-between gap-4">
					<div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-900/40 p-4">
						<h3 className="font-bold text-white/40 text-xs uppercase tracking-wider">
							Email Elements
						</h3>

						{/* Toggles */}
						<div className="flex flex-col gap-2">
							<button
								onClick={() => setHasHero(!hasHero)}
								className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
									hasHero
										? "border-rose-500/30 bg-rose-950/20 text-rose-300"
										: "border-white/5 bg-slate-900/60 text-white/40"
								}`}
							>
								<div className="flex items-center gap-2">
									<Icon name="Image" className="h-4 w-4" />
									<span className="font-medium text-xs">Hero Image Block</span>
								</div>
								<div
									className={`h-4 w-6 rounded-full p-0.5 transition-colors ${hasHero ? "bg-rose-500" : "bg-slate-800"}`}
								>
									<div
										className={`h-3 w-3 rounded-full bg-white transition-transform ${hasHero ? "translate-x-2" : "translate-x-0"}`}
									/>
								</div>
							</button>

							<button
								onClick={() => setHasPromo(!hasPromo)}
								className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
									hasPromo
										? "border-rose-500/30 bg-rose-950/20 text-rose-300"
										: "border-white/5 bg-slate-900/60 text-white/40"
								}`}
							>
								<div className="flex items-center gap-2">
									<Icon name="Tag" className="h-4 w-4" />
									<span className="font-medium text-xs">
										20% Off Promo Code
									</span>
								</div>
								<div
									className={`h-4 w-6 rounded-full p-0.5 transition-colors ${hasPromo ? "bg-rose-500" : "bg-slate-800"}`}
								>
									<div
										className={`h-3 w-3 rounded-full bg-white transition-transform ${hasPromo ? "translate-x-2" : "translate-x-0"}`}
									/>
								</div>
							</button>

							<button
								onClick={() => setHasCTA(!hasCTA)}
								className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
									hasCTA
										? "border-rose-500/30 bg-rose-950/20 text-rose-300"
										: "border-white/5 bg-slate-900/60 text-white/40"
								}`}
							>
								<div className="flex items-center gap-2">
									<Icon name="ExternalLink" className="h-4 w-4" />
									<span className="font-medium text-xs">
										Primary CTA Button
									</span>
								</div>
								<div
									className={`h-4 w-6 rounded-full p-0.5 transition-colors ${hasCTA ? "bg-rose-500" : "bg-slate-800"}`}
								>
									<div
										className={`h-3 w-3 rounded-full bg-white transition-transform ${hasCTA ? "translate-x-2" : "translate-x-0"}`}
									/>
								</div>
							</button>
						</div>
					</div>

					{/* Campaign Analytics Simulation */}
					<div className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
						<h3 className="mb-3 font-bold text-white/40 text-xs uppercase tracking-wider">
							Estimated Impact
						</h3>
						<div className="grid grid-cols-2 gap-3">
							<div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
								<div className="font-mono text-[10px] text-white/40">
									AVG. OPEN RATE
								</div>
								<div className="mt-1 font-bold font-mono text-lg text-white">
									{openRate.toFixed(1)}%
								</div>
								<div className="mt-0.5 font-mono text-[9px] text-emerald-400">
									🚀 +{(openRate - 22).toFixed(1)}% optimization
								</div>
							</div>
							<div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
								<div className="font-mono text-[10px] text-white/40">
									CLICK RATE (CTR)
								</div>
								<div className="mt-1 font-bold font-mono text-lg text-white">
									{clickRate.toFixed(1)}%
								</div>
								<div className="mt-0.5 font-mono text-[9px] text-emerald-400">
									📈 +{(clickRate - 2.4).toFixed(1)}% conversions
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Visual Email Canvas Preview */}
				<div className="flex min-h-[220px] select-none flex-col rounded-xl border border-white/5 bg-slate-900 p-3">
					<div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-lg border border-white/5 bg-slate-950 p-3 text-left">
						{/* Email Header */}
						<div className="border-white/5 border-b pb-2">
							<div className="font-mono text-[9px] text-white/40">
								To: active_subscribers_list
							</div>
							<div className="mt-1 font-bold text-[11px] text-white/80">
								✨ March Reloop Updates!
							</div>
						</div>

						{/* Live Preview Elements */}
						<div className="flex flex-1 flex-col gap-2 overflow-y-auto">
							{/* Brand logo */}
							<div className="mx-auto my-1 h-3 w-16 rounded bg-white/20" />

							{/* Hero image block */}
							{hasHero && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="relative flex aspect-[3/1] items-center justify-center overflow-hidden rounded-md border border-rose-500/20 bg-gradient-to-tr from-rose-600/35 to-violet-600/35"
								>
									<span className="font-mono font-semibold text-[9px] text-white/60 tracking-wider">
										MARCH PRODUCT LAUNCH
									</span>
								</motion.div>
							)}

							{/* Title text */}
							<div className="mt-1 space-y-1">
								<div className="h-2 w-2/3 rounded bg-white/40" />
								<div className="h-1.5 w-full rounded bg-white/20" />
								<div className="h-1.5 w-5/6 rounded bg-white/20" />
							</div>

							{/* Coupon block */}
							{hasPromo && (
								<motion.div
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded border border-rose-500/30 border-dashed bg-rose-500/10 p-2 text-center"
								>
									<span className="font-bold font-mono text-[8px] text-rose-400 tracking-widest">
										USE CODE: RELOOP20
									</span>
								</motion.div>
							)}

							{/* CTA Button */}
							{hasCTA && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="mt-1 w-full rounded bg-rose-600 py-1.5 text-center font-bold text-[9px] text-white shadow-lg shadow-rose-600/10 hover:bg-rose-500"
								>
									Get Started For Free
								</motion.div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
