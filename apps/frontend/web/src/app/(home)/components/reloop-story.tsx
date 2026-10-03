"use client";

import * as Button from "@reloop/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function ReloopStory() {
	const [expanded, setExpanded] = useState(false);

	return (
		<section
			aria-labelledby="reloop-story-heading"
			className="w-full overflow-hidden border-[#ebebeb] border-y bg-white dark:border-[#292929] dark:bg-black"
		>
			<h2 id="reloop-story-heading" className="sr-only">
				Why we built Reloop
			</h2>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1280px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1279px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
				/>
				<div className="rounded-[4px] bg-white py-16 max-lg:px-6 lg:py-24 dark:bg-black">
					<div className="relative mx-auto max-w-2xl">
						<div
							className={
								expanded
									? "space-y-4"
									: "h-[22rem] space-y-4 overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_100%)]"
							}
						>
							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								<strong className="font-medium text-zinc-950 dark:text-white">
									You don&apos;t need to learn a tutorial to send
									an email.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								You shouldn&apos;t need to read docs, create API
								keys, configure domains, figure out DNS, and spend
								hours connecting email infrastructure{" "}
								<strong className="font-medium text-zinc-950 dark:text-white">
									just to send your first email.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								Just tell your agent what you want.
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								<strong className="font-medium text-zinc-950 dark:text-white">
									&ldquo;Set up email for my app using
									Reloop.&rdquo;
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								<strong className="font-medium text-zinc-950 dark:text-white">
									Reloop handles the rest.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								<span className="block">
									Prefer agents?{" "}
									<strong className="font-medium text-zinc-950 dark:text-white">
										We&apos;ve got you.
									</strong>
								</span>
								<span className="block">
									Prefer the UI?{" "}
									<strong className="font-medium text-zinc-950 dark:text-white">
										We&apos;ve got you.
									</strong>
								</span>
								<span className="block">
									Love great DX?{" "}
									<strong className="font-medium text-zinc-950 dark:text-white">
										We&apos;ve got you.
									</strong>
								</span>
								<span className="block">
									Love great UI/UX?{" "}
									<strong className="font-medium text-zinc-950 dark:text-white">
										We&apos;ve got you.
									</strong>
								</span>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								<strong className="font-medium text-zinc-950 dark:text-white">
									Reloop is built for the way you work.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								Still not convinced? Reloop is{" "}
								<strong className="font-medium text-zinc-950 dark:text-white">
									open source and self-hostable.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								<strong className="font-medium text-zinc-950 dark:text-white">
									Run it yourself. Own your infrastructure.
								</strong>
							</p>
						</div>

						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => setExpanded((current) => !current)}
							aria-expanded={expanded}
							className="mt-6 rounded-full"
						>
							<span>{expanded ? "Show less" : "Read more"}</span>
							<Button.Icon
								as="span"
								className="grid size-5 place-items-center rounded-full bg-zinc-100 text-zinc-500 group-hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
							>
								{expanded ? (
									<ChevronUp aria-hidden className="size-3" strokeWidth={2} />
								) : (
									<ChevronDown
										aria-hidden
										className="size-3"
										strokeWidth={2}
									/>
								)}
							</Button.Icon>
						</Button.Root>
					</div>
				</div>
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
