import { toolConfigs } from "@reloop/web/lib/landing/tools";
import Link from "next/link";

const SIMILAR_PATHS = [
	"/tools/email-validator",
	"/tools/deliverability-tester",
	"/tools/spoof-checker",
	"/tools/blocklist-checker",
	"/tools/dns-lookup",
	"/tools/domain-age",
	"/tools/who-sends",
];

export function SimilarTools() {
	const tools = SIMILAR_PATHS.map(
		(path) => toolConfigs.find((tool) => tool.path === path)!,
	).filter(Boolean);

	return (
		<section
			id="similar-tools"
			aria-labelledby="similar-tools-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] uppercase">
					<span className="text-primary-base">05.</span>{" "}
					<span className="text-text-sub-600 dark:text-white/50">
						Similar tools
					</span>
				</p>
				<h2
					id="similar-tools-heading"
					className="text-balance font-semibold text-2xl text-text-strong-950 tracking-[-0.025em] sm:text-3xl lg:text-[2rem] lg:leading-[1.15] dark:text-white"
				>
					Explore more{" "}
					<span className="text-primary-base">free tools</span>{" "}
					like Temp Email Checker
				</h2>
				<p className="mt-4 max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					Validate, inspect, and test every part of your email setup. Free,
					no signup required.
				</p>
			</div>

			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 lg:px-12 dark:border-white/10">
				<div className="flex flex-wrap gap-3">
					{tools.map((tool) => (
						<Link
							key={tool.path}
							href={tool.path}
							className="rounded-full border border-stroke-soft-100 bg-bg-white-0 px-5 py-2.5 font-medium text-[14px] text-text-strong-950 transition-colors hover:border-primary-base/50 hover:text-primary-base sm:text-[14.5px] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-primary-base/50 dark:hover:text-primary-base"
						>
							{tool.titleLines.join(" ")}
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
