"use client";

import * as Slider from "@reloop/ui/slider";
import { useMemo, useState } from "react";

const formatInt = (n: number) =>
	new Intl.NumberFormat("en-US").format(Math.round(n));
const formatMoney = (n: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: n < 100 ? 0 : 0,
	}).format(Math.round(n));

export function WasteCalculator() {
	const [signups, setSignups] = useState(5000);
	const [disposableRate, setDisposableRate] = useState(8);
	const [costPerBad, setCostPerBad] = useState(0.6);

	const result = useMemo(() => {
		const bad = (signups * disposableRate) / 100;
		const monthly = bad * costPerBad;
		return { bad, monthly, yearly: monthly * 12 };
	}, [signups, disposableRate, costPerBad]);

	const scrollToChecker = () => {
		document.getElementById("checker")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section
			id="savings-calculator"
			aria-labelledby="savings-calculator-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					Savings calculator
				</p>
				<h2
					id="savings-calculator-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Calculate what throwaways cost you.
				</h2>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b lg:grid-cols-2 dark:border-white/10">
				{/* Left: inputs */}
				<div className="flex flex-col gap-8 border-stroke-soft-100 border-b px-4 py-6 sm:px-6 sm:py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-10 dark:border-white/10">
					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="calc-signups"
								className="font-medium text-[14px] text-text-strong-950 dark:text-white"
							>
								Monthly signups
							</label>
							<span className="font-mono font-semibold text-[15px] text-text-strong-950 tabular-nums dark:text-white">
								{formatInt(signups)}
							</span>
						</div>
						<Slider.Root
							min={100}
							max={100000}
							step={100}
							value={[signups]}
							onValueChange={(v) => setSignups(v[0] ?? signups)}
							aria-label="Monthly signups"
							className="mt-4"
						>
							<Slider.Thumb aria-label="Monthly signups" id="calc-signups" />
						</Slider.Root>
					</div>

					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="calc-rate"
								className="font-medium text-[14px] text-text-strong-950 dark:text-white"
							>
								Disposable rate
							</label>
							<span className="font-mono font-semibold text-[15px] text-text-strong-950 tabular-nums dark:text-white">
								{disposableRate}%
							</span>
						</div>
						<Slider.Root
							min={1}
							max={30}
							step={1}
							value={[disposableRate]}
							onValueChange={(v) => setDisposableRate(v[0] ?? disposableRate)}
							aria-label="Disposable rate"
							className="mt-4"
						>
							<Slider.Thumb aria-label="Disposable rate" id="calc-rate" />
						</Slider.Root>
					</div>

					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="calc-cost"
								className="font-medium text-[14px] text-text-strong-950 dark:text-white"
							>
								Cost per bad signup
							</label>
							<span className="font-mono font-semibold text-[15px] text-text-strong-950 tabular-nums dark:text-white">
								${costPerBad.toFixed(2)}
							</span>
						</div>
						<Slider.Root
							min={0.1}
							max={5}
							step={0.1}
							value={[costPerBad]}
							onValueChange={(v) => setCostPerBad(v[0] ?? costPerBad)}
							aria-label="Cost per bad signup"
							className="mt-4"
						>
							<Slider.Thumb aria-label="Cost per bad signup" id="calc-cost" />
						</Slider.Root>
						<p className="mt-2 text-[12.5px] text-text-sub-600 dark:text-white/50">
							Trial credits, sends, and support time per throwaway account.
						</p>
					</div>
				</div>

				{/* Right: results */}
				<div className="flex flex-col justify-center gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
					<div>
						<p className="font-medium text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							Estimated waste
						</p>
						<p className="mt-2 font-semibold text-[2.5rem] text-text-strong-950 tabular-nums leading-none tracking-tight sm:text-[3rem] dark:text-white">
							{formatMoney(result.yearly)}
							<span className="ml-2 align-middle font-normal text-[14px] text-text-sub-600 dark:text-white/50">
								/ yr
							</span>
							<span className="ml-2 align-middle font-normal text-[14px] text-text-sub-600 tabular-nums dark:text-white/50">
								({formatMoney(result.monthly)} / mo)
							</span>
						</p>
					</div>

					<div className="relative overflow-hidden rounded-2xl bg-[#256bf5] p-5 sm:p-6">
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-[6px] rounded-[12px] border border-white/25"
						/>
						<div className="relative z-10">
							<p className="font-medium text-[16px] text-white leading-snug tracking-tight">
								Send with Reloop at SES-style pricing.
							</p>
							<p className="mt-1.5 text-[13px] text-white/85 leading-relaxed">
								3,000 free emails/mo, then $0.50/1k. No
								contact-sales phase — self-serve, and flag
								throwaways free.
							</p>
							<button
								type="button"
								onClick={scrollToChecker}
								className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-white px-6 py-2.5 font-medium text-[14px] text-[#0f172a] transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98]"
							>
								Check an address free
							</button>
							<p className="mt-2.5 text-center text-[12px] text-white/70">
								No signup. Estimate only, actual rate varies by audience.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
