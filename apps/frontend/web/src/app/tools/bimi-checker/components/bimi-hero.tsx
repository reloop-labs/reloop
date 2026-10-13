import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { CheckerPanel } from "../checker-panel";
import { toolDescription } from "../content";

export function BimiHero() {
	return (
		<div className="relative w-full overflow-hidden">
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<header className="relative flex w-full flex-col items-start bg-transparent px-4 pt-[184px] pb-16 text-left sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
					<div className="relative z-10 flex w-full max-w-full flex-col items-start py-6">
						<Link
							href="/tools"
							className="mb-5 flex items-center gap-2 sm:mb-6"
						>
							<span
								aria-hidden
								className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#30363d]"
							>
								<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white dark:text-black">
									<Icon name="verified" className="size-[11px]" />
								</span>
							</span>
							<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight underline decoration-dotted underline-offset-4 dark:text-white">
								Free Tools
							</span>
						</Link>

						<h1 className="max-w-3xl text-balance text-left font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
							Free{" "}
							<span className="bg-gradient-to-b from-primary-base to-primary-base bg-clip-text text-transparent">
								BIMI
							</span>{" "}
							Checker
						</h1>

						<p className="mt-5 max-w-[46rem] text-balance text-left text-[13px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-base dark:text-white/60">
							{toolDescription}
						</p>

						<div
							id="checker"
							className="mt-8 w-full scroll-mt-24 text-left sm:mt-10"
						>
							<CheckerPanel />
						</div>
					</div>
				</header>
			</div>
		</div>
	);
}
