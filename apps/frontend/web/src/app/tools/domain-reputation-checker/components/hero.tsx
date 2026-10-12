import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { CheckerPanel } from "../checker-panel";
import { toolDescription } from "../content";

export function ReputationHero() {
	return (
		<div className="relative w-full overflow-hidden">
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<header className="relative flex w-full flex-col items-center px-4 pt-40 pb-16 text-center sm:px-8 sm:pt-48 sm:pb-20 lg:px-12">
					<Link
						href="/tools"
						className="mb-5 flex items-center justify-center gap-2 sm:mb-6"
					>
						<span
							aria-hidden
							className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#30363d]"
						>
							<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-black">
								<Icon name="shield-check" className="size-[11px]" />
							</span>
						</span>
						<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight underline decoration-dotted underline-offset-4 dark:text-white">
							Free Tools
						</span>
					</Link>

					<h1 className="max-w-3xl text-balance font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
						Free Domain Reputation Checker
					</h1>

					<p className="mt-5 max-w-[42rem] text-balance text-[14px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-base dark:text-white/60">
						{toolDescription}
					</p>

					<div
						id="checker"
						className="mt-10 w-full max-w-4xl scroll-mt-24 sm:mt-12"
					>
						<CheckerPanel />
					</div>
				</header>
			</div>
		</div>
	);
}
