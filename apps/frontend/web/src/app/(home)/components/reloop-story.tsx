"use client";

import { Minus, Plus } from "lucide-react";
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
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1102px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1099px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
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
								Your agents can write code.{" "}
								<strong className="font-medium text-zinc-950 dark:text-white">
									Now let them answer email.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								Reloop gives every agent its own inbox:{" "}
								<strong className="font-medium text-zinc-950 dark:text-white">
									send, receive, and reply through one API.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								Plug it into{"\u00a0"}
								<strong className="font-medium text-zinc-950 dark:text-white">
									Claude, Cursor, or Codex over MCP
								</strong>
								{"\u00a0"}
								and let them handle the replies, receipts, and follow-ups.
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								And it is not just inboxes. Reloop brings the{" "}
								<strong className="font-medium text-zinc-950 dark:text-white">
									whole email stack into one open-source codebase.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								Transactional email, campaigns, inbound mail, analytics, AI
								templates, deliverability tools, and agent workflows all live in
								one platform.{" "}
								<strong className="font-medium text-zinc-950 dark:text-white">
									One stack for every email your product and its agents handle.
								</strong>
							</p>

							<p className="text-xl text-zinc-600 leading-relaxed md:text-2xl dark:text-zinc-400">
								<strong className="font-medium text-zinc-950 dark:text-white">
									Our goal is to build the best open-source email infrastructure
									for developers, products, and agents.
								</strong>
							</p>
						</div>

						<button
							type="button"
							onClick={() => setExpanded((current) => !current)}
							aria-expanded={expanded}
							className="group mt-6 inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-full border border-[#ebebeb] bg-white px-4 font-medium text-sm text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 dark:border-[#292929] dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-950 dark:hover:text-white"
						>
							<span>{expanded ? "Show less" : "Read more"}</span>
							<span className="grid size-5 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition-transform group-hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:text-white">
								{expanded ? (
									<Minus aria-hidden className="size-3" strokeWidth={2} />
								) : (
									<Plus aria-hidden className="size-3" strokeWidth={2} />
								)}
							</span>
						</button>
					</div>
				</div>
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
