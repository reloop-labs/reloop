import * as Button from "@reloop/ui/button";
import { contactEmail, socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";
import { CareersValues } from "./careers-values";

const careersMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("I'd like to build with Reloop")}`;

const cultureParagraphs = [
	"We're not hiring for a résumé. We're hiring for taste—the instinct that something is off before anyone else says it, and the conviction to fix it anyway. That's rarer than any credential.",
	"Taste means you know the difference between work that's done and work that's good. You notice the pixel that's two points too heavy. You rewrite the sentence that technically says the right thing but feels wrong. You don't stop at functional.",
	"This place will cost you something. You'll sit with problems longer than is comfortable. You'll throw out things you spent days on. But what comes out the other side is work you'd actually put your name on.",
];

export function CareersSection() {
	return (
		<div className="w-full">
			{/* Our culture section */}
			<div className="mx-auto max-w-2xl text-left">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Our culture
				</p>
				<h2 className="mt-4 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] lg:text-[3rem] dark:text-white">
					People who care about taste.
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

			{/* Our values section */}
			<div className="mx-auto mt-24 max-w-5xl sm:mt-32">
				<CareersValues />
			</div>

			{/* Get in touch section */}
			<div className="mx-auto mt-24 max-w-2xl text-center sm:mt-32">
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
