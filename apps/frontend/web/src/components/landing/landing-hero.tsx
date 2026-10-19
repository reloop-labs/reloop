import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import { RotatingAlternative } from "./rotating-alternative";

export function LandingHero() {
	return (
		<section
			id="features"
			aria-labelledby="landing-heading"
			className="overflow-hidden bg-white text-zinc-950 dark:bg-black dark:text-zinc-50"
		>
			<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-100 border-x px-6 pt-36 pb-20 text-center sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28 dark:border-white/10">
				<div className="relative z-[2] mx-auto max-w-3xl">
					<p className="mb-4 text-muted-foreground text-sm sm:mb-6">
						An alternative to <RotatingAlternative />
					</p>
					<h1
						id="landing-heading"
						className="text-balance font-semibold text-6xl leading-none tracking-[-0.035em] max-[767px]:text-5xl"
					>
						Email for developers
						<br />
						who ship with AI.
					</h1>
					<p className="mx-auto mt-5 mb-9 max-w-2xl text-balance text-lg text-zinc-600 leading-7 dark:text-zinc-400">
						Send transactional emails, run campaigns, and give AI agents their
						own inboxes all with Reloop.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-lg px-4 font-medium text-sm max-[479px]:min-h-11 sm:h-11 sm:rounded-xl sm:px-6 sm:text-[15.5px] dark:bg-white dark:text-black dark:hover:bg-white/90"
						>
							<a href={hostedSignupHref}>Get Started</a>
						</FancyButton.Root>
						<FancyButton.Root
							asChild
							variant="basic"
							size="medium"
							className="hidden h-11 rounded-xl px-6 font-medium text-[15.5px] sm:inline-flex"
						>
							<Link href="/self-host">Self-host Reloop</Link>
						</FancyButton.Root>
					</div>
					<span className="mt-3 block text-sm text-zinc-600 leading-5 dark:text-zinc-400">
						3,000 emails for free<span aria-hidden="true"> · </span>
						No credit card required.
					</span>
				</div>
			</div>
		</section>
	);
}
