import { cn } from "@reloop/ui/cn";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ALL_TOOLS, getBorderClass } from "../../components/tools-grid";

export function SimilarTools() {
	return (
		<section
			id="similar-tools"
			aria-labelledby="similar-tools-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					All tools
				</p>
				<h2
					id="similar-tools-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Explore all free email &amp; developer tools.
				</h2>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{ALL_TOOLS.map((tool, index) => {
					const IconComponent = tool.icon;
					const borderClass = getBorderClass(index, ALL_TOOLS.length);

					return (
						<Link
							key={tool.title}
							href={tool.path}
							className={cn(
								"group flex flex-col justify-between border-stroke-soft-100 px-4 py-6 transition-colors hover:bg-bg-weak-50 sm:px-6 sm:py-7 lg:px-7 lg:py-8 dark:border-white/10 dark:hover:bg-white/[0.04]",
								borderClass,
							)}
						>
							<div>
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-neutral-100 text-neutral-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-400">
									<IconComponent className="h-5 w-5 stroke-[1.75]" />
								</div>

								<div className="mt-5 flex items-start gap-2.5">
									<span
										className="mt-1 h-3.5 w-[2px] shrink-0 rounded-full bg-primary-base"
										aria-hidden="true"
									/>
									<h3 className="font-semibold text-[15px] text-text-strong-950 leading-snug tracking-tight transition-colors group-hover:text-primary-base sm:text-[15.5px] dark:text-white dark:group-hover:text-white">
										{tool.title}
									</h3>
								</div>

								<p className="mt-2.5 line-clamp-2 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
									{tool.description}
								</p>
							</div>

							<div className="mt-5 flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:text-white/55 dark:group-hover:text-white">
								<span>Try now</span>
								<ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
