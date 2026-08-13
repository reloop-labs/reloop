import * as Button from "@reloop/ui/button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";

function BlueprintGrid({ id }: { id: string }) {
	const patternId = `deploy-grid-${id}`;
	return (
		<svg
			className="pointer-events-none absolute inset-0 size-full text-stroke-soft-200/70 dark:text-white/[0.06]"
			width="100%"
			height="100%"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<defs>
				<pattern
					id={patternId}
					width="20"
					height="20"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M 20 0 L 0 0 0 20"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.75"
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${patternId})`} />
		</svg>
	);
}

export function WhyOpenSourceDeployment() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Section Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-14 sm:px-10 sm:py-16 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						One engine. Two deployment paths.
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Deploy on your own infrastructure or use our managed edge cloud. Both run the exact same open-source codebase.
					</p>
				</div>

				{/* 2-Column Box */}
				<div className="grid grid-cols-1 md:grid-cols-2">
					{/* Left Column: Reloop Self-Hosted */}
					<div className="flex flex-col justify-between border-stroke-soft-200 p-6 sm:p-8 md:border-r lg:p-10 dark:border-white/10">
						<div>
							<p className="font-mono text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
								Sovereign data & VPCs
							</p>
							<h3 className="mt-2 font-semibold text-[1.25rem] text-text-strong-950 tracking-tight dark:text-white">
								Reloop Self-Hosted
							</h3>
							<p className="mt-3 text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
								Deploy with Docker Compose, Kubernetes, or bare metal. Total control over data residency, custom SMTP egress IPs, and internal VPC routing.
							</p>

							<div className="mt-6 rounded-lg bg-neutral-900 p-4 font-mono text-[12px] text-neutral-200 dark:bg-black dark:border dark:border-white/10">
								<div className="text-neutral-400"># One-command bootstrap</div>
								<div className="mt-1 text-neutral-100">git clone https://github.com/reloop-labs/reloop.git</div>
								<div className="text-neutral-100">cd reloop && docker compose up -d</div>
							</div>

							<div className="mt-6 flex items-center gap-4">
								<Link
									href="/docs/self-host"
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "stroke",
									}).root()} inline-flex h-9! rounded-full! px-5! font-medium text-xs! sm:h-10! sm:px-6! sm:text-sm!`}
								>
									Self-hosting guide
								</Link>
								<Link
									href="/docs"
									className="text-xs font-semibold text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-4 hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
								>
									Documentation
								</Link>
							</div>
						</div>
					</div>

					{/* Right Column: Reloop Hosted */}
					<div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
						<div>
							<p className="font-mono text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
								Zero DevOps overhead
							</p>
							<h3 className="mt-2 font-semibold text-[1.25rem] text-text-strong-950 tracking-tight dark:text-white">
								Reloop Hosted (reloop.sh)
							</h3>
							<p className="mt-3 text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
								Global edge API with automated SPF, DKIM, and DMARC verification, managed deliverability pools, and 3,000 free emails every month.
							</p>

							<div className="mt-6 rounded-lg bg-neutral-900 p-4 font-mono text-[12px] text-neutral-200 dark:bg-black dark:border dark:border-white/10">
								<div className="text-neutral-400">// Send transactional email via SDK</div>
								<div className="mt-1 text-neutral-100">import &#123; Reloop &#125; from &quot;reloop&quot;;</div>
								<div className="text-neutral-100">const reloop = new Reloop(&#123; apiKey: process.env.RELOOP_API_KEY &#125;);</div>
							</div>

							<div className="mt-6 flex items-center gap-4">
								<a
									href={hostedSignupHref}
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "filled",
									}).root()} inline-flex h-9! rounded-full! px-5! font-medium text-xs! sm:h-10! sm:px-6! sm:text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
								>
									Start free on reloop.sh
								</a>
								<Link
									href="/pricing"
									className="text-xs font-semibold text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-4 hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
								>
									View pricing
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
