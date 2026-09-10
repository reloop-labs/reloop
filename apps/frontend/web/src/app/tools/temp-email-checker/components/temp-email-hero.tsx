import { Icon } from "@reloop/ui/icon";
import { CheckerPanel } from "../checker-panel";
import { TempEmailHeroBlast } from "./temp-email-hero-blast";

export function TempEmailHero() {
	return (
		<div className="relative w-full overflow-hidden">
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				{/* Hero Header */}
				<header className="relative z-10 flex w-full flex-col items-center overflow-hidden bg-transparent px-6 pt-28 pb-8 text-center sm:px-8 sm:pt-32 sm:pb-10 lg:px-12 lg:pt-36 lg:pb-12">
					<div
						aria-hidden="true"
						className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)] [mask-image:linear-gradient(to_right,black_0%,black_28%,transparent_42%,transparent_58%,black_72%,black_100%)]"
					>
						<TempEmailHeroBlast />
					</div>
					<div className="relative z-10 flex w-auto max-w-full flex-col items-center">
						<div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
							<span
								aria-hidden
								className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px]"
							>
								<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
									<Icon name="shield-cross" className="size-[11px]" />
								</span>
							</span>
							<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
								Temporary Email Checker
							</span>
						</div>

						<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
							Temp Email Checker
						</h1>

						<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
							Check syntax, known disposable providers, role prefixes, and MX
							records. We do not probe the mailbox.
						</p>
					</div>
				</header>

				{/* Interactive Checker Panel */}
				<section className="relative z-10 w-full px-5 pb-16 sm:px-6 sm:pb-20 md:px-8 lg:pb-24">
					<div className="mx-auto w-full max-w-xl">
						<CheckerPanel />
					</div>
				</section>
			</div>
		</div>
	);
}
