"use client";

import * as Slider from "@reloop/ui/slider";
import Link from "next/link";
import { useMemo, useState } from "react";

const formatDays = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

export function WarmupPlanner() {
	const [ageDays, setAgeDays] = useState(2);
	const [desiredDaily, setDesiredDaily] = useState(1000);

	const result = useMemo(() => {
		// Warmup caps as per reloop caps: 0-1:20, 2-3:50, 4-7:100, 8-14:250, 15-30:500, 30+: dynamic (assume 5000)
		const caps = [
			{ until: 1, cap: 20 },
			{ until: 3, cap: 50 },
			{ until: 7, cap: 100 },
			{ until: 14, cap: 250 },
			{ until: 30, cap: 500 },
		];
		let currentCap = caps.find((c) => ageDays <= c.until)?.cap ?? 5000;
		if (ageDays > 30) currentCap = 5000;
		const canSendNow = Math.min(desiredDaily, currentCap);
		const daysToFull = (() => {
			if (desiredDaily <= currentCap) return 0;
			// Find when cap will reach desired
			for (const c of caps) {
				if (desiredDaily <= c.cap) return Math.max(0, c.until - ageDays);
			}
			return Math.max(0, 31 - ageDays);
		})();
		const risk = ageDays <= 7 ? "High — wait" : ageDays <= 30 ? "Medium — ramp slowly" : "Low — age OK";
		return { currentCap, canSendNow, daysToFull, risk };
	}, [ageDays, desiredDaily]);

	const scrollToChecker = () => {
		document.getElementById("checker")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section id="warmup-planner" aria-labelledby="warmup-planner-heading" className="w-full">
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">Warmup planner</p>
				<h2 id="warmup-planner-heading" className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white">
					Plan your first sends by domain age.
				</h2>
				<p className="mt-2 max-w-2xl text-[14px] text-stone-500 leading-relaxed dark:text-white/60">
					See what you can safely send today and how long until you can hit your desired volume — same 20→500 caps we enforce for all plans.
				</p>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b lg:grid-cols-2 dark:border-white/10">
				{/* Left: inputs */}
				<div className="flex flex-col gap-8 border-stroke-soft-100 border-b px-4 py-6 sm:px-6 sm:py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-10 dark:border-white/10">
					<div>
						<div className="flex items-center justify-between">
							<label className="font-medium text-[14px] text-text-strong-950 dark:text-white">Domain age</label>
							<span className="font-mono font-semibold text-[15px] text-text-strong-950 tabular-nums dark:text-white">{ageDays} days</span>
						</div>
						<Slider.Root min={0} max={60} step={1} value={[ageDays]} onValueChange={(v) => setAgeDays(v[0] ?? ageDays)} className="mt-4">
							<Slider.Thumb aria-label="Domain age" />
						</Slider.Root>
						<p className="mt-2 text-[12.5px] text-text-sub-600 dark:text-white/50">{ageDays <= 7 ? "Too new — high risk" : ageDays <= 30 ? "Cold — throttled" : "Warming/established"}</p>
					</div>

					<div>
						<div className="flex items-center justify-between">
							<label className="font-medium text-[14px] text-text-strong-950 dark:text-white">Desired daily sends</label>
							<span className="font-mono font-semibold text-[15px] text-text-strong-950 tabular-nums dark:text-white">{desiredDaily.toLocaleString()}</span>
						</div>
						<Slider.Root min={20} max={5000} step={10} value={[desiredDaily]} onValueChange={(v) => setDesiredDaily(v[0] ?? desiredDaily)} className="mt-4">
							<Slider.Thumb aria-label="Desired daily sends" />
						</Slider.Root>
						<p className="mt-2 text-[12.5px] text-text-sub-600 dark:text-white/50">How many emails you’d like to send per day.</p>
					</div>
				</div>

				{/* Right: results */}
				<div className="flex flex-col justify-center gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
					<div>
						<p className="font-medium text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">Safe to send today</p>
						<p className="mt-2 font-semibold text-[2.5rem] text-text-strong-950 tabular-nums leading-none tracking-tight sm:text-[3rem] dark:text-white">
							{result.canSendNow.toLocaleString()}
							<span className="ml-2 align-middle font-normal text-[14px] text-text-sub-600 dark:text-white/50">/ {result.currentCap.toLocaleString()} cap</span>
						</p>
						<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Risk: <span className={result.risk.startsWith("High") ? "font-medium text-rose-600 dark:text-rose-400" : result.risk.startsWith("Medium") ? "font-medium text-amber-600 dark:text-amber-400" : "font-medium text-emerald-600 dark:text-emerald-400"}>{result.risk}</span>
							{result.daysToFull > 0 ? ` — ${result.daysToFull} day${result.daysToFull === 1 ? "" : "s"} until ${desiredDaily.toLocaleString()}/day is safe.` : " — you can send your desired volume today."}
						</p>
					</div>

					<div className="relative overflow-hidden rounded-2xl border border-white/20 bg-[#246BF5] p-5 sm:p-6 dark:border-white/10 dark:bg-[#000]">
						<div aria-hidden="true" className="pointer-events-none absolute inset-[6px] rounded-[12px] border border-white/25 dark:border-white/10" />
						<div className="relative z-10">
							<p className="font-medium text-[16px] text-white leading-snug tracking-tight">Warm up the right way.</p>
							<p className="mt-1.5 text-[13px] text-white/85 leading-relaxed dark:text-white/60">Reloop enforces these caps for all plans to protect new domains. Check your actual domain above for its RDAP age.</p>
							<button type="button" onClick={scrollToChecker} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-2.5 font-medium text-[#0f172a] text-[14px] transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98] dark:bg-white dark:text-black">
								Check my domain now
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
