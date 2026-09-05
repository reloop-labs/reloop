import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { EssayDoodles } from "./components/essay-doodles";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/about`;
const pageTitle = "About Reloop | Open Source Email Infrastructure";
const pageDescription =
	"Reloop is open-source, self-hostable email infrastructure for developers and agents. Same software whether you self-host or use Reloop Cloud.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"About Reloop",
		"open source email",
		"email infrastructure",
		"self-hosted email",
		"Reloop Labs",
		"transparent email infrastructure",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const AboutPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "AboutPage",
		mainEntity: {
			"@type": "Organization",
			"@id": `${siteUrl}/#organization`,
			name: "Reloop Labs",
			url: siteUrl,
			logo: `${siteUrl}/web-app-manifest-512x512.png`,
			description:
				"Open-source, self-hostable email infrastructure with a hosted service at reloop.sh.",
			founders: [
				{
					"@type": "Person",
					name: "Pranav Patel",
					sameAs: "https://github.com/pranavp10",
				},
				{
					"@type": "Person",
					name: "Twinkal P",
					sameAs: "https://github.com/twinkalp10",
				},
			],
			sameAs: [socialProfiles.github, socialProfiles.discord, socialProfiles.x],
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />

			<div className="relative w-full bg-bg-white-0 text-text-sub-600 dark:bg-black dark:text-neutral-300">
				<div className="relative mx-auto w-full max-w-5xl overflow-x-clip border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
					<EssayDoodles />

					<article className="relative mx-auto w-full max-w-[680px] px-6 pt-28 pb-24 sm:pt-36">
						<h1 className="font-semibold text-[40px] text-text-strong-950 leading-none tracking-tight sm:text-[44px] dark:text-white">
							why reloop?
						</h1>

						<div className="mt-10 space-y-7 text-[16.5px] leading-[1.75]">
							<p className="text-text-strong-950 dark:text-neutral-200">
								Self-hosting email has a scary reputation.
								<br />
								IP reputation. Warm-up schedules. Blocklists.
								<br />
								Everyone says the same thing: don&apos;t do it yourself.
							</p>

							<p className="pt-4 text-text-strong-950 dark:text-neutral-200">
								Proprietary grids treat deliverability like a secret.
								<br />
								Cold IP? Warm it for 6 weeks. Good luck.
								<br />
								Shared IP? Hope your neighbors behave.
								<br />
								Ask why you hit spam? That&apos;s proprietary.
							</p>

							<div className="space-y-1.5">
								<p>
									<span className="bg-primary-base box-decoration-clone px-1 py-0.5 text-white leading-[1.9]">
										But inbox placement doesn&apos;t come from secrets.
									</span>
								</p>
								<p>
									<span className="bg-primary-base box-decoration-clone px-1 py-0.5 text-white leading-[1.9]">
										It comes from a system that warms, watches, and backs off
										for you.
									</span>
								</p>
								<p className="pt-1 text-text-strong-950 dark:text-neutral-200">
									From asking{" "}
									<strong className="font-bold text-text-strong-950 dark:text-white">
										what if ?
									</strong>
								</p>
								<p className="text-text-strong-950 dark:text-neutral-200">
									What if warm-up was automatic? What if reputation was visible?
								</p>
							</div>

							{/* selected-frame card */}
							<div className="pt-4 pb-6">
								<div className="relative rotate-[1.2deg] border border-primary-base/90 bg-bg-white-0 p-6 sm:p-7 dark:bg-[#0a0a0a]">
									<span
										aria-hidden
										className="-top-1 -left-1 absolute size-2 border border-primary-base bg-white"
									/>
									<span
										aria-hidden
										className="-top-1 -right-1 absolute size-2 border border-primary-base bg-white"
									/>
									<span
										aria-hidden
										className="-bottom-1 -left-1 absolute size-2 border border-primary-base bg-white"
									/>
									<span
										aria-hidden
										className="-right-1 -bottom-1 absolute size-2 border border-primary-base bg-white"
									/>
									<p className="text-[16px] text-text-strong-950 leading-[1.75] dark:text-neutral-200">
										That&apos;s the Reloop Engine. Automated IP warmup with
										volume ramps. Smart retries with backoff. Suppression lists
										that actually suppress. DKIM rotation, SPF/DMARC alignment,
										blocklist and reputation monitoring — in the open. Same
										engine self-hosted or on reloop.sh. Nothing to babysit. The
										system does it.
									</p>
									<span className="-bottom-[26px] -translate-x-1/2 absolute left-1/2 rounded-[4px] bg-primary-base px-2 py-[3px] font-mono text-[11px] text-white leading-none">
										warmup × retries × reputation
									</span>
								</div>
							</div>

							<p className="text-text-strong-950 dark:text-neutral-200">
								We&apos;re not building another black-box grid.
								<br />
								We&apos;re building the email system we&apos;d bet a company on.
							</p>

							<p className="text-text-strong-950 dark:text-neutral-200">
								A place where warm-up isn&apos;t a spreadsheet —
								<br />
								it&apos;s the pipeline.
								<br />
								Where IP reputation isn&apos;t a score someone sells you —
								<br />
								it&apos;s signals you can see.
								<br />
								Where self-host doesn&apos;t mean alone.
							</p>

							<p className="text-text-strong-950 dark:text-neutral-200">
								So go ahead.
								<br />
								Skip the warm-up spreadsheet.
								<br />
								Send the first 3,000 free.
								<br />
								Read the code.
							</p>

							<div className="pt-6 text-[16px]">
								<p>
									<a
										href="https://github.com/pranavp10"
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-sub-600 underline decoration-stroke-soft-200 underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-neutral-500 dark:decoration-neutral-600 dark:hover:text-neutral-200"
									>
										Pranav
									</a>
									<span className="mx-2 text-text-sub-600 dark:text-neutral-500">
										&
									</span>
									<a
										href="https://github.com/twinkalp10"
										target="_blank"
										rel="noopener noreferrer"
										className="text-text-sub-600 underline decoration-stroke-soft-200 underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-neutral-500 dark:decoration-neutral-600 dark:hover:text-neutral-200"
									>
										Twinkal
									</a>
								</p>
								<p className="mt-1 text-text-sub-600 dark:text-neutral-500">
									Co-Founders of Reloop
								</p>
							</div>
						</div>
					</article>
				</div>
			</div>
		</>
	);
};

export default AboutPage;
