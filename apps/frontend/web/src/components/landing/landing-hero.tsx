import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref, socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";
import { siGithub } from "simple-icons";

const heroSnippet = [
	{ text: 'import { Reloop } from "reloop-email";', tone: "muted" },
	{ text: "", tone: "muted" },
	{ text: "const reloop = new Reloop({ apiKey });", tone: "muted" },
	{ text: "", tone: "muted" },
	{ text: "await reloop.mail.send({", tone: "strong" },
	{ text: '  from: "hello@yourapp.com",', tone: "strong" },
	{ text: '  to: "user@example.com",', tone: "strong" },
	{ text: '  subject: "Welcome aboard",', tone: "strong" },
	{ text: '  html: "<p>Thanks!</p>",', tone: "strong" },
	{ text: "});", tone: "strong" },
] as const;

function HeroSnippet() {
	return (
		<figure className="mx-auto mt-10 w-full max-w-xl overflow-hidden rounded-xl border border-stroke-soft-100 bg-zinc-50 text-left sm:mt-12 dark:border-white/10 dark:bg-zinc-950">
			<figcaption className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 font-mono text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
				<span>send-email.ts</span>
				<span>npm i reloop-email</span>
			</figcaption>
			<pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 sm:text-sm">
				<code>
					{heroSnippet.map((line, index) => (
						<span
							key={index}
							className={
								line.tone === "strong"
									? "block text-zinc-950 dark:text-zinc-50"
									: "block text-zinc-500 dark:text-zinc-400"
							}
						>
							{line.text || " "}
						</span>
					))}
				</code>
			</pre>
		</figure>
	);
}

export function LandingHero() {
	return (
		<section
			id="features"
			aria-labelledby="landing-heading"
			className="overflow-hidden bg-white text-zinc-950 dark:bg-black dark:text-zinc-50"
		>
			<div className="relative mx-auto flex w-full max-w-5xl flex-col items-center border-stroke-soft-100 border-x px-6 pt-28 pb-16 text-center sm:px-8 sm:pt-44 sm:pb-24 md:max-w-7xl lg:px-12 lg:pt-52 lg:pb-28 dark:border-white/10">
				<div className="relative z-[2] mx-auto w-full max-w-3xl">
					<a
						href={socialProfiles.github}
						target="_blank"
						rel="noreferrer"
						className="mb-5 inline-flex items-center gap-2 rounded-full border border-stroke-soft-100 px-3 py-1 text-xs text-zinc-600 transition-colors hover:text-zinc-950 sm:mb-6 sm:text-sm dark:border-white/10 dark:text-zinc-400 dark:hover:text-white"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden
						>
							<path d={siGithub.path} />
						</svg>
						<span>
							Open source<span aria-hidden="true"> · </span>
							<span className="text-zinc-950 dark:text-white">
								250+ developers
							</span>
						</span>
					</a>
					<h1
						id="landing-heading"
						className="text-balance font-semibold text-6xl leading-none tracking-[-0.035em] max-[767px]:text-[2.75rem]"
					>
						The email API for developers who ship with AI.
					</h1>
					<p className="mx-auto mt-5 mb-8 max-w-2xl text-balance text-base text-zinc-600 leading-7 sm:mb-9 sm:text-lg dark:text-zinc-400">
						Send your first email in a few lines of code. Transactional emails,
						campaigns, and inboxes for your AI agents, all in one API.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-11 rounded-xl px-6 font-medium text-[15.5px] dark:bg-white dark:text-black dark:hover:bg-white/90"
						>
							<a href={hostedSignupHref}>Get Started</a>
						</FancyButton.Root>
						<FancyButton.Root
							asChild
							variant="basic"
							size="medium"
							className="h-11 rounded-xl px-6 font-medium text-[15.5px]"
						>
							<a href="/docs">Read the docs</a>
						</FancyButton.Root>
					</div>
					<span className="mt-3 block text-sm text-zinc-600 leading-5 dark:text-zinc-400">
						3,000 emails free<span aria-hidden="true"> · </span>
						No credit card<span aria-hidden="true"> · </span>
						<Link
							href="/self-host"
							className="underline decoration-zinc-300 underline-offset-4 hover:text-zinc-950 dark:decoration-zinc-700 dark:hover:text-white"
						>
							or self-host it
						</Link>
					</span>
					<HeroSnippet />
				</div>
			</div>
		</section>
	);
}
