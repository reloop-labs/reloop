import * as Button from "@reloop/ui/button";
import { contactEmail, socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";
import { GitHubContributionGraph } from "./github-contribution-graph";

const careersMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("I'd like to build with Reloop")}`;

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
				<path d="M12 11.5V14.8229" stroke="currentColor" strokeWidth="1.2" />
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
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 pt-28 pb-14 text-left sm:px-10 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 dark:border-white/10">
				{/* Main Headline */}
				<h1 className="max-w-3xl font-semibold text-3xl text-text-strong-950 leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.6rem] dark:text-white">
					Our mission is to build the email infrastructure for the next
					generation.
				</h1>

				{/* Subheadline / Description */}
				<p className="mt-4 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
					We&apos;re redefining email infrastructure — shipping powerful,
					groundbreaking features at every turn. Join us to revolutionize
					developer communications.
				</p>

				{/* GitHub Green Contribution Graph */}
				<div className="mt-10 w-full max-w-4xl">
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
				{/* Section Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-14 sm:px-10 sm:py-16 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Think you&apos;d fit here?
					</h2>
					<p className="mt-1.5 text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Reloop is open-source email infrastructure for developers. If
						that&apos;s the work you want to do, send us a note—your GitHub,
						portfolio, or what you&apos;d help build.
					</p>
				</div>

				{/* 2-Column Box */}
				<div className="grid grid-cols-1 md:grid-cols-2">
					{/* Left Column: Get in touch, Card Box with Introduce yourself, and GitHub link */}
					<div className="flex flex-col justify-between border-stroke-soft-200 p-6 sm:p-8 md:border-r lg:p-10 dark:border-white/10">
						<div>
							<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
								We read every message. Skip the cover letter template. Tell us
								what you&apos;d work on and why it matters to you.
							</p>
							<div className="mt-4 flex">
								<a
									href={careersMailto}
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "filled",
									}).root()} inline-flex h-9! rounded-full! px-5! font-medium text-xs! sm:h-10! sm:px-6! sm:text-sm! dark:bg-white dark:text-black dark:hover:bg-white/90`}
								>
									Introduce yourself
								</a>
							</div>

							<p className="mt-6 text-text-sub-600 text-xs dark:text-white/45">
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
