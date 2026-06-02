"use client";

import { Icon } from "@reloop/ui/icon";

const highlights = [
	{
		title: "Self-host anywhere",
		description:
			"Run Reloop on your own infrastructure. Docker Compose, single binary, or Kubernetes — your data never leaves your network.",
	},
	{
		title: "No vendor lock-in",
		description:
			"Bring your own LLM provider, swap email backends, extend the API. You own the stack, top to bottom.",
	},
	{
		title: "Transparent by default",
		description:
			"Every line of code is auditable. See exactly how your emails are routed, how tasks are managed, and where your data flows.",
	},
	{
		title: "Community-driven",
		description:
			"Built with the community, not just for it. Contribute integrations, features, and backends that benefit everyone.",
	},
];

const githubUrl = "https://github.com/reloop-labs/reloop";

const OpenSource = () => {
	return (
		<section id="open-source">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
					{/* Left column — heading + CTA */}
					<div className="lg:w-[480px] lg:shrink-0">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Open source
						</p>
						<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
							Open source
							<br />
							for all.
						</h2>
						<p className="mt-6 max-w-[420px] text-[#0a0d12]/60 text-[15px] leading-7 sm:text-[16px] dark:text-white/60">
							Reloop is fully open source. Inspect every line, self-host on your
							own terms, and shape the future of email infrastructure.
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-3">
							<a
								href={githubUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[#0a0d12] px-5 py-3 font-semibold text-[14px] text-white transition-colors hover:bg-[#0a0d12]/88 dark:bg-white dark:text-black dark:hover:bg-white/88"
							>
								<Icon name="social-github" className="size-4" />
								Star on GitHub
							</a>
						</div>
					</div>

					{/* Right column — highlight grid */}
					<div className="flex-1">
						<div className="grid overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-soft-50 sm:grid-cols-2 dark:border-white/10 dark:bg-transparent">
							{highlights.map((item) => (
								<div
									key={item.title}
									className="border-stroke-soft-200 border-t border-l-0 bg-white p-8 transition-colors duration-300 first:border-t-0 hover:bg-black/[0.01] sm:border-t sm:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0"
								>
									<h3 className="font-semibold text-[17px] text-text-strong-950 leading-snug sm:text-[18px] dark:text-white">
										{item.title}
									</h3>
									<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/50">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default OpenSource;
