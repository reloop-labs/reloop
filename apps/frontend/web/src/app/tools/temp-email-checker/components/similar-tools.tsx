import { cn } from "@reloop/ui/cn";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "../../components/section-heading";
import { ALL_TOOLS } from "../../components/tools-grid";
import { toolPath } from "../content";

/** Free tools other than this one; the API docs and suggestion link aren't tools. */
const OTHER_TOOLS = ALL_TOOLS.filter(
	(tool) => tool.path.startsWith("/tools/") && tool.path !== toolPath,
);

export function SimilarTools() {
	return (
		<section
			id="similar-tools"
			aria-labelledby="similar-tools-heading"
			className="w-full"
		>
			<SectionHeading
				id="similar-tools-heading"
				eyebrow="All tools"
				icon="grid"
				title={["Explore all free email", "& developer tools"]}
				description="More free utilities for checking deliverability, DNS records, and email authentication before you hit send."
			/>

			{/* Every cell gets a bottom and right hairline; clipping 1px on those edges hides the outer ones, and the wrapper border closes the grid full-width even when the last row is partial. */}
			<div className="overflow-hidden border-stroke-soft-100 border-b dark:border-white/10">
				<ul className="-mr-px -mb-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{OTHER_TOOLS.map((tool) => {
						const IconComponent = tool.icon;
						return (
							<li
								key={tool.path}
								className="border-stroke-soft-100 border-r border-b dark:border-white/10"
							>
								<Link
									href={tool.path}
									className={cn(
										"group flex h-full items-start gap-3.5 px-4 py-6 sm:px-6 lg:px-8",
										"transition-colors duration-200 ease-out hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-sub-300 focus-visible:ring-inset",
										"motion-reduce:transition-none",
									)}
								>
									<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:group-hover:text-white">
										<IconComponent className="size-[18px] stroke-[1.75]" />
									</span>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<h3 className="truncate font-medium text-[14.5px] text-text-strong-950 tracking-tight dark:text-white">
												{tool.title}
											</h3>
											<ArrowUpRight
												aria-hidden
												className="-translate-x-1 size-4 shrink-0 text-text-sub-600 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none dark:text-white/60"
											/>
										</div>
										<p className="mt-1 line-clamp-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
											{tool.description}
										</p>
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}
