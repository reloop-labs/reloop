"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@reloop/ui/icon";

export default function MarketingWidget() {
	const [hasHero, setHasHero] = useState(true);
	const [hasPromo, setHasPromo] = useState(false);
	const [hasCTA, setHasCTA] = useState(true);

	// Calculated mock statistics based on content options
	const openRate = 22 + (hasHero ? 4.5 : 0) + (hasPromo ? 3 : 0);
	const clickRate = 2.4 + (hasCTA ? 1.8 : 0) + (hasPromo ? 2.5 : 0);

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans">
			{/* Designer Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">campaign_builder_v2.email</span>
				</div>
				<span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
					Builder Mode
				</span>
			</div>

			<div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Editor & Stats Control */}
				<div className="flex flex-col gap-4 justify-between">
					<div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
						<h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Email Elements</h3>
						
						{/* Toggles */}
						<div className="flex flex-col gap-2">
							<button
								onClick={() => setHasHero(!hasHero)}
								className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
									hasHero
										? "bg-rose-950/20 border-rose-500/30 text-rose-300"
										: "bg-slate-900/60 border-white/5 text-white/40"
								}`}
							>
								<div className="flex items-center gap-2">
									<Icon name="Image" className="w-4 h-4" />
									<span className="text-xs font-medium">Hero Image Block</span>
								</div>
								<div className={`w-6 h-4 rounded-full p-0.5 transition-colors ${hasHero ? "bg-rose-500" : "bg-slate-800"}`}>
									<div className={`w-3 h-3 rounded-full bg-white transition-transform ${hasHero ? "translate-x-2" : "translate-x-0"}`} />
								</div>
							</button>

							<button
								onClick={() => setHasPromo(!hasPromo)}
								className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
									hasPromo
										? "bg-rose-950/20 border-rose-500/30 text-rose-300"
										: "bg-slate-900/60 border-white/5 text-white/40"
								}`}
							>
								<div className="flex items-center gap-2">
									<Icon name="Tag" className="w-4 h-4" />
									<span className="text-xs font-medium">20% Off Promo Code</span>
								</div>
								<div className={`w-6 h-4 rounded-full p-0.5 transition-colors ${hasPromo ? "bg-rose-500" : "bg-slate-800"}`}>
									<div className={`w-3 h-3 rounded-full bg-white transition-transform ${hasPromo ? "translate-x-2" : "translate-x-0"}`} />
								</div>
							</button>

							<button
								onClick={() => setHasCTA(!hasCTA)}
								className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
									hasCTA
										? "bg-rose-950/20 border-rose-500/30 text-rose-300"
										: "bg-slate-900/60 border-white/5 text-white/40"
								}`}
							>
								<div className="flex items-center gap-2">
									<Icon name="ExternalLink" className="w-4 h-4" />
									<span className="text-xs font-medium">Primary CTA Button</span>
								</div>
								<div className={`w-6 h-4 rounded-full p-0.5 transition-colors ${hasCTA ? "bg-rose-500" : "bg-slate-800"}`}>
									<div className={`w-3 h-3 rounded-full bg-white transition-transform ${hasCTA ? "translate-x-2" : "translate-x-0"}`} />
								</div>
							</button>
						</div>
					</div>

					{/* Campaign Analytics Simulation */}
					<div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
						<h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Estimated Impact</h3>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
								<div className="text-[10px] text-white/40 font-mono">AVG. OPEN RATE</div>
								<div className="text-lg font-bold text-white mt-1 font-mono">{openRate.toFixed(1)}%</div>
								<div className="text-[9px] text-emerald-400 font-mono mt-0.5">🚀 +{(openRate - 22).toFixed(1)}% optimization</div>
							</div>
							<div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
								<div className="text-[10px] text-white/40 font-mono">CLICK RATE (CTR)</div>
								<div className="text-lg font-bold text-white mt-1 font-mono">{clickRate.toFixed(1)}%</div>
								<div className="text-[9px] text-emerald-400 font-mono mt-0.5">📈 +{(clickRate - 2.4).toFixed(1)}% conversions</div>
							</div>
						</div>
					</div>
				</div>

				{/* Visual Email Canvas Preview */}
				<div className="bg-slate-900 border border-white/5 rounded-xl p-3 flex flex-col min-h-[220px] select-none">
					<div className="border border-white/5 bg-slate-950 rounded-lg p-3 flex-1 flex flex-col gap-3 text-left overflow-hidden">
						{/* Email Header */}
						<div className="border-b border-white/5 pb-2">
							<div className="text-[9px] text-white/40 font-mono">To: active_subscribers_list</div>
							<div className="text-[11px] text-white/80 font-bold mt-1">✨ March Reloop Updates!</div>
						</div>

						{/* Live Preview Elements */}
						<div className="flex-1 flex flex-col gap-2 overflow-y-auto">
							{/* Brand logo */}
							<div className="w-16 h-3 bg-white/20 rounded mx-auto my-1" />

							{/* Hero image block */}
							{hasHero && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="relative aspect-[3/1] bg-gradient-to-tr from-rose-600/35 to-violet-600/35 rounded-md flex items-center justify-center border border-rose-500/20 overflow-hidden"
								>
									<span className="text-[9px] font-mono text-white/60 font-semibold tracking-wider">MARCH PRODUCT LAUNCH</span>
								</motion.div>
							)}

							{/* Title text */}
							<div className="space-y-1 mt-1">
								<div className="w-2/3 h-2 bg-white/40 rounded" />
								<div className="w-full h-1.5 bg-white/20 rounded" />
								<div className="w-5/6 h-1.5 bg-white/20 rounded" />
							</div>

							{/* Coupon block */}
							{hasPromo && (
								<motion.div
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-rose-500/10 border border-dashed border-rose-500/30 rounded p-2 text-center"
								>
									<span className="text-[8px] text-rose-400 font-mono font-bold tracking-widest">USE CODE: RELOOP20</span>
								</motion.div>
							)}

							{/* CTA Button */}
							{hasCTA && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="w-full bg-rose-600 hover:bg-rose-500 py-1.5 rounded text-center text-[9px] font-bold text-white mt-1 shadow-lg shadow-rose-600/10"
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
