"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { socialProfiles } from "@reloop/web/lib/site";
import { OpenSourceIsntCheap } from "./open-source-isnt-cheap";

const sections = [
	{
		index: "1.",
		title: "Trust",
		lines: [
			"You don't trust Stripe because of their homepage. You trust them because every payment can be traced.",
			"Email should work the same way.",
		],
		strong: "Don't trust our dashboard. Verify our code.",
	},
	{
		index: "2.",
		title: "Closed doesn't mean smarter.",
		lines: [
			'Every provider claims a "proprietary engine." Most run the same open-source parts everyone else does.',
			"The difference isn't magic. It's marketing.",
		],
		strong: "Open beats mysterious.",
	},
	{
		index: "3.",
		title: "Open source isn't enough",
		lines: [
			"Free software. Not free time.",
			"DNS, queues, retries, monitoring — the repo doesn't do that. You do.",
		],
		strong: "Reloop ships the part open source leaves out: done.",
	},
];

export function OpenSourceSection() {
	return (
		<section className="border-stroke-soft-100 border-y dark:border-white/10">
			<div className="mx-auto w-full max-w-3xl border-stroke-soft-100 border-x dark:border-white/10">
				{sections.map((section) => (
					<div
						key={section.title}
						className="border-stroke-soft-100 border-b px-5 py-7 sm:px-8 dark:border-white/[0.07]"
					>
						<h2 className="font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
							<span className="mr-2 text-text-sub-600 tabular-nums dark:text-white/40">
								{section.index}
							</span>
							{section.title}
						</h2>
						<div className="mt-2.5 space-y-2.5 text-[14px] text-text-strong-950 leading-[1.7] sm:text-[15px] dark:text-white/70">
							{section.lines.map((line) => (
								<p key={line}>{line}</p>
							))}
							<p className="font-medium text-text-strong-950 dark:text-white">
								{section.strong}
							</p>
						</div>
					</div>
				))}

				<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-8 dark:border-white/[0.07]">
					<FancyButton.Root
						asChild
						variant="primary"
						size="medium"
						className="h-11! w-full! rounded-full! px-6! sm:w-auto!"
					>
						<a
							href={socialProfiles.github}
							target="_blank"
							rel="noopener noreferrer"
						>
							<FancyButton.Icon
								as={Icon}
								name="social-github"
								className="size-4"
							/>
							<span className="font-medium text-[14px]">View on GitHub</span>
						</a>
					</FancyButton.Root>
				</div>

				<div className="px-5 py-7 sm:px-8">
					<OpenSourceIsntCheap />
				</div>
			</div>
		</section>
	);
}
