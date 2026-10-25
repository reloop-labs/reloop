import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { TAB_GRADIENTS } from "../../../(home)/components/platform-tabs-data";
import { CopyHostButton } from "./copy-host-button";
import { SmtpSession } from "./smtp-session";

export function SmtpHero() {
	return (
		<header className="relative w-full bg-transparent">
			<div className="relative mx-auto mt-14 w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl min-[1280px]:mt-[72px] dark:border-white/10">
				<div
					aria-hidden
					className="h-10 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
				<div className="flex flex-col items-start px-4 pt-0 pb-16 text-left sm:px-8 sm:pb-20 lg:px-12">
					<h1 className="max-w-4xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
						An SMTP relay your existing app already speaks.
					</h1>

					<p className="mt-4 max-w-[42rem] text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] dark:text-white/60">
						Change four settings and your mailer, CMS, or auth provider sends
						through Reloop, with delivery logs, webhooks, and bounce handling
						included. No SDK, no rewrite.
					</p>

					<div className="mt-7 flex flex-wrap items-center justify-start gap-3 sm:mt-9 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
						>
							<a href={hostedSignupHref}>Get SMTP credentials</a>
						</FancyButton.Root>
						<CopyHostButton />
					</div>
					<p className="mt-3.5 text-[12.5px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
						Free plan: 6,000 emails a month. No credit card.
					</p>
				</div>

				<div className="border-stroke-soft-100 border-t dark:border-white/10">
					<div className="relative w-full overflow-hidden bg-bg-white-0 dark:bg-black">
						<div
							aria-hidden
							className={`absolute inset-0 bg-gradient-to-t ${TAB_GRADIENTS.email}`}
						/>
						<div className="relative w-full px-4 py-6 sm:p-10 lg:p-14">
							<SmtpSession />
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
