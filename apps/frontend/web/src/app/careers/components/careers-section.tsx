import * as Button from "@reloop/ui/button";
import { contactEmail, socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";
import { GitHubContributionGraph } from "./github-contribution-graph";

const careersMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("I'd like to build with Reloop")}`;

const cultureParagraphs = [
	"We're not hiring for a résumé. We're hiring for taste—the instinct that something is off before anyone else says it, and the conviction to fix it anyway. That's rarer than any credential.",
	"Taste means you know the difference between work that's done and work that's good. You notice the pixel that's two points too heavy. You rewrite the sentence that technically says the right thing but feels wrong. You don't stop at functional.",
	"This place will cost you something. You'll sit with problems longer than is comfortable. You'll throw out things you spent days on. But what comes out the other side is work you'd actually put your name on.",
];

function BlueprintGrid({ id }: { id: string }) {
	const patternId = `contact-grid-${id}`;
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

function ContactDiagram() {
	return (
		<div className="relative flex h-full min-h-[280px] w-full items-center justify-center overflow-hidden border-stroke-soft-200/80 bg-[#fafafa] p-8 sm:min-h-[340px] lg:min-h-[380px] dark:border-white/10 dark:bg-white/[0.02]">
			<BlueprintGrid id="contact-diagram" />
			<svg
				viewBox="0 0 24 24"
				className="relative z-10 size-28 text-text-strong-950/85 sm:size-36 lg:size-44 dark:text-white/90"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M22 10V6.5L12 11.5V15L22 10Z"
					fill="currentColor"
					fillOpacity={0.12}
				/>
				<path
					d="M22 17.5V14L12 19V22.5L22 17.5Z"
					fill="currentColor"
					fillOpacity={0.12}
				/>
				<path d="M12 19V22.3213" stroke="currentColor" strokeWidth="1.2" />
				<path
					d="M2 14L11.3292 18.6646C11.7515 18.8757 12.2485 18.8757 12.6708 18.6646L22 14"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<path
					d="M6 12L2.55279 13.7236C2.214 13.893 2 14.2393 2 14.618V16.882C2 17.2607 2.214 17.607 2.55279 17.7764L11.3292 22.1646C11.7515 22.3757 12.2485 22.3757 12.6708 22.1646L21.4472 17.7764C21.786 17.607 22 17.2607 22 16.882V14.618C22 14.2393 21.786 13.893 21.4472 13.7236L18 12"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<path
					d="M12 11.5V14.8229"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<path
					d="M2 6.5L11.3292 11.1646C11.7515 11.3757 12.2485 11.3757 12.6708 11.1646L22 6.5"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<path
					d="M11.3292 14.6646L2.55279 10.2764C2.214 10.107 2 9.76074 2 9.38197V7.11803C2 6.73926 2.214 6.393 2.55279 6.22361L11.3292 1.83541C11.7515 1.62426 12.2485 1.62426 12.6708 1.83541L21.4472 6.22361C21.786 6.393 22 6.73926 22 7.11803V9.38197C22 9.76074 21.786 10.107 21.4472 10.2764L12.6708 14.6646C12.2485 14.8757 11.7515 14.8757 11.3292 14.6646Z"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
			</svg>
		</div>
	);
}

export function CareersHero() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-b bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 pt-32 pb-16 sm:px-10 md:max-w-7xl lg:px-12 dark:border-white/10">
				{/* Header Section similar to Blog detail page */}
				<header className="text-left">
					<div className="flex w-full max-w-3xl flex-col gap-4">
						<div className="flex flex-wrap items-center gap-2 font-medium font-mono text-primary-base text-xs/[150%] uppercase tracking-[0.6px]">
							<span>Careers</span>
						</div>
						<h1 className="font-semibold text-3xl text-text-strong-950 leading-[110%] tracking-[-0.8px] sm:text-[40px] lg:text-[48px] dark:text-white">
							People who care about taste.
						</h1>
					</div>

					{/* Culture paragraphs */}
					<div className="mt-8 max-w-3xl space-y-6">
						{cultureParagraphs.map((paragraph) => (
							<p
								key={paragraph}
								className="text-[15px] text-text-sub-600 leading-[1.8] sm:text-[17px] dark:text-white/60"
							>
								{paragraph}
							</p>
						))}
					</div>
				</header>

				{/* GitHub Green Contribution Graph */}
				<div className="mt-12 max-w-4xl">
					<GitHubContributionGraph />
				</div>
			</div>
		</section>
	);
}

export function CareersCulture() {
	return <CareersHero />;
}

export function CareersContact() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* 2-Column Box */}
				<div className="grid grid-cols-1 md:grid-cols-2">
					{/* Left Column: Heading, Subtext, Card Box with Introduce yourself, and GitHub link */}
					<div className="flex flex-col justify-between border-stroke-soft-200 p-8 sm:p-10 md:border-r lg:p-14 dark:border-white/10">
						<div>
							<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
								Get in touch
							</p>
							<h2 className="mt-3 font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl lg:text-[2.2rem] dark:text-white">
								Think you&apos;d fit here?
							</h2>
							<p className="mt-3.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/60">
								Reloop is open-source email infrastructure for developers. If
								that&apos;s the work you want to do, send us a note—your GitHub,
								portfolio, or what you&apos;d help build.
							</p>
						</div>

						<div className="mt-8">
							<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-6 text-center sm:p-7 dark:border-white/[0.08] dark:bg-white/[0.03]">
								<p className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/50">
									We read every message. Skip the cover letter template. Tell us
									what you&apos;d work on and why it matters to you.
								</p>
								<div className="mt-5 flex justify-center">
									<a
										href={careersMailto}
										className={`${Button.buttonVariants({
											variant: "neutral",
											mode: "filled",
										}).root()} inline-flex h-10! rounded-full! px-6! font-medium text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
									>
										Introduce yourself
									</a>
								</div>
							</div>

							<p className="mt-5 text-[13px] text-text-sub-600 text-center sm:text-left dark:text-white/45">
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

					{/* Right Column: Isometric Nodes Blueprint Grid Diagram */}
					<div className="flex min-h-[300px] items-center justify-center border-stroke-soft-200 border-t md:min-h-full md:border-t-0 dark:border-white/10">
						<ContactDiagram />
					</div>
				</div>
			</div>
		</section>
	);
}
