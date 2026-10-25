import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { TAB_GRADIENTS } from "../../../(home)/components/platform-tabs-data";
import { toolPath } from "../../../tools/email-html-editor/content";
import { AgentDemo } from "./agent-demo";

export function TemplatesHero() {
	return (
		<header className="relative w-full bg-transparent">
			<div className="relative mx-auto mt-14 w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl min-[1280px]:mt-[72px] dark:border-white/10">
				<div
					aria-hidden
					className="h-10 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
				<div className="flex flex-col items-start px-4 pt-0 pb-16 text-left sm:px-8 sm:pb-20 lg:px-12">
					<span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-medium text-[13px] text-text-strong-950 shadow-xs dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
						<Icon name="sparkling" className="size-3.5" aria-hidden />
						Template agent
					</span>

					<h1 className="max-w-4xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
						Build any email with AI in minutes.
					</h1>

					<p className="mt-4 max-w-[42rem] text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] dark:text-white/60">
						Tell the AI agent what you need and add a screenshot you like. It
						designs the whole email for you. Change anything, then send it.
					</p>

					<div className="mt-7 flex flex-wrap items-center justify-start gap-3 sm:mt-9 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
						>
							<a href={hostedSignupHref}>Start for free</a>
						</FancyButton.Root>
						<FancyButton.Root
							asChild
							variant="basic"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
						>
							<a href={toolPath}>
								<Icon name="layout" className="size-4 shrink-0" />
								<span>Try the editor</span>
							</a>
						</FancyButton.Root>
					</div>
					<p className="mt-3.5 text-[12.5px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
						No HTML, no design tools. Free plan: 6,000 emails a month.
					</p>
				</div>

				<div className="border-stroke-soft-100 border-t dark:border-white/10">
					<div className="relative w-full overflow-hidden bg-bg-white-0 dark:bg-black">
						<div
							aria-hidden
							className={`absolute inset-0 bg-gradient-to-t ${TAB_GRADIENTS.templates}`}
						/>
						<div className="relative w-full px-4 pt-6 pb-6 sm:px-10 sm:pt-10 sm:pb-10">
							<AgentDemo />
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
