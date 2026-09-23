import { cn } from "@reloop/ui/cn";
import { signals } from "../content";

export function WhatItChecks() {
	return (
		<section
			id="what-it-checks"
			aria-labelledby="what-it-checks-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					What it checks
				</p>
				<h2
					id="what-it-checks-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					What this lookup actually checks.
				</h2>
				<p className="max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					BIMI is a DNS assertion plus a logo file. Supporting inboxes still
					require DMARC at enforcement.
				</p>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
				{signals.map((signal, index) => {
					const isLastRow =
						index >=
						signals.length -
							(signals.length % 3 === 0 ? 3 : signals.length % 3);
					const borderClass = cn(
						!isLastRow && "border-b",
						index % 3 !== 2 && "lg:border-r",
						index % 2 === 0 && "sm:border-r lg:border-r",
					);
					return (
						<div
							key={signal.title}
							className={cn(
								"flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10",
								borderClass,
							)}
						>
							<div className="flex items-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base"
									aria-hidden="true"
								/>
								<p className="font-medium text-[12px] text-primary-base uppercase">
									{signal.tag}
								</p>
							</div>
							<h3 className="mt-3 font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
								{signal.title}
							</h3>
							<p className="mt-3 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
								{signal.description}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
