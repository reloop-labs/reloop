import * as Button from "@reloop/ui/button";
import { contactEmail, socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";

const careersMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("I'd like to build with Reloop")}`;

const cultureParagraphs = [
	"We're not in a rush to hire. We're not even looking for a particular experience or skill. Starting this company was simply a selfish need to find people who raise the bar—and build a team of them. That takes time.",
	"We care obsessively about craft. Work gets questioned, broken down, rebuilt, because the bar here is higher than most places.",
	"This place will cost you something. You'll think about problems after hours. You'll redo things until they feel right.",
];

export function CareersSection() {
	return (
		<div className="mx-auto max-w-2xl">
			<div className="text-left">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Our culture
				</p>
				<h2 className="mt-4 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] lg:text-[3rem] dark:text-white">
					What it&apos;s like here.
				</h2>
				<div className="mt-8 space-y-6">
					{cultureParagraphs.map((paragraph) => (
						<p
							key={paragraph}
							className="text-[15px] text-text-sub-600 leading-[1.8] sm:text-[17px] dark:text-white/55"
						>
							{paragraph}
						</p>
					))}
				</div>
			</div>

			<div className="mt-16 text-center">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Get in touch
				</p>
				<h3 className="mt-4 font-serif text-[1.75rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2rem] dark:text-white">
					Think you&apos;d fit here?
				</h3>
				<p className="mx-auto mt-4 max-w-lg text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					Reloop is open-source email infrastructure for developers. If
					that&apos;s the work you want to do, send us a note—your GitHub,
					portfolio, or what you&apos;d help build.
				</p>

				<div className="mx-auto mt-8 max-w-lg rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 px-5 py-8 sm:px-6 sm:py-10 dark:border-white/[0.08] dark:bg-[#161616]">
					<p className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/45">
						We read every message. Skip the cover letter template. Tell us what
						you&apos;d work on and why it matters to you.
					</p>
					<a
						href={careersMailto}
						className={`${Button.buttonVariants({
							variant: "neutral",
							mode: "filled",
						}).root()} mt-6 inline-flex h-10! rounded-full! px-6! font-medium text-sm! sm:h-9! dark:bg-white dark:text-black dark:hover:bg-white/90`}
					>
						Introduce yourself
					</a>
				</div>

				<p className="mt-8 text-[13px] text-text-sub-600 sm:text-[14px] dark:text-white/45">
					Want to show your work first?{" "}
					<Link
						href={socialProfiles.github}
						target="_blank"
						rel="noopener noreferrer"
						className="text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
					>
						Contribute on GitHub
					</Link>
				</p>
			</div>
		</div>
	);
}
