import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { OpenSourceIsntCheap } from "./components/open-source-isnt-cheap";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/why-open-source";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const pageTitle = "Why Open Source | Reloop";
const pageDescription =
	"Don't take our word for it. Reloop is open-source email infrastructure you can verify in code: no black-box claims page, single-click deploy, real product UI and DX.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"open source email infrastructure",
		"Apache 2.0 email platform",
		"self-hosted email server",
		"transparent email routing",
		"open source deliverability",
		"self-hostable email",
		"open source sendgrid alternative",
		"Reloop open source",
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

const WhyOpenSourcePage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		"@id": `${pageUrl}#article`,
		url: pageUrl,
		headline: pageTitle,
		description: pageDescription,
		publisher: {
			"@type": "Organization",
			"@id": `${siteUrl}/#organization`,
			name: "Reloop Labs",
			url: siteUrl,
		},
		isPartOf: {
			"@type": "WebSite",
			"@id": `${siteUrl}/#website`,
			name: "Reloop",
			url: siteUrl,
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />

			<div className="relative w-full bg-bg-white-0 text-text-sub-600 dark:bg-black dark:text-neutral-300">
				<div className="relative mx-auto w-full max-w-5xl overflow-x-clip border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
					<article className="relative mx-auto w-full max-w-[680px] px-6 pt-28 pb-24 sm:pt-36">
						<h1 className="font-semibold text-[40px] text-text-strong-950 leading-none tracking-tight sm:text-[44px] dark:text-white">
							Why Open Source
						</h1>

						<p className="mt-4 text-[16.5px] text-text-sub-600 leading-[1.75] dark:text-neutral-400">
							Closed email tools sell trust. We sell a repo you can open.
						</p>

						<div className="mt-10 space-y-10 text-[16.5px] leading-[1.75]">
							{/* 1 */}
							<section className="space-y-2.5">
								<h2 className="font-semibold text-text-strong-950 text-[17px] tracking-tight dark:text-white">
									<span className="mr-2 text-text-sub-600 tabular-nums dark:text-neutral-500">
										1.
									</span>
									Trust
								</h2>
								<p className="text-text-strong-950 dark:text-neutral-200">
									You don&apos;t trust Stripe because of their homepage. You
									trust them because every payment can be traced.
								</p>
								<p className="text-text-strong-950 dark:text-neutral-200">
									Email should work the same way.
								</p>
								<p className="font-medium text-text-strong-950 dark:text-white">
									Don&apos;t trust our dashboard. Verify our code.
								</p>
							</section>

							{/* 2 */}
							<section className="space-y-2.5">
								<h2 className="font-semibold text-text-strong-950 text-[17px] tracking-tight dark:text-white">
									<span className="mr-2 text-text-sub-600 tabular-nums dark:text-neutral-500">
										2.
									</span>
									Closed doesn&apos;t mean smarter.
								</h2>
								<p className="text-text-strong-950 dark:text-neutral-200">
									Every provider claims a &quot;proprietary engine.&quot; Most
									run the same open-source parts everyone else does.
								</p>
								<p className="text-text-strong-950 dark:text-neutral-200">
									The difference isn&apos;t magic. It&apos;s marketing.
								</p>
								<p className="font-medium text-text-strong-950 dark:text-white">
									Open beats mysterious.
								</p>
							</section>

							{/* 3 */}
							<section className="space-y-2.5">
								<h2 className="font-semibold text-text-strong-950 text-[17px] tracking-tight dark:text-white">
									<span className="mr-2 text-text-sub-600 tabular-nums dark:text-neutral-500">
										3.
									</span>
									Open source isn&apos;t enough
								</h2>
								<p className="text-text-strong-950 dark:text-neutral-200">
									Free software. Not free time.
								</p>
								<p className="text-text-strong-950 dark:text-neutral-200">
									DNS, queues, retries, monitoring &mdash; the repo
									doesn&apos;t do that. You do.
								</p>
								<p className="font-medium text-text-strong-950 dark:text-white">
									Reloop ships the part open source leaves out: done.
								</p>
							</section>

							<div className="pt-2">
								<FancyButton.Root
									asChild
									variant="neutral"
									size="medium"
									className="rounded-full! px-5!"
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
										<span>View on GitHub</span>
									</a>
								</FancyButton.Root>
							</div>

							<div className="pt-4">
								<OpenSourceIsntCheap />
							</div>
						</div>
					</article>
				</div>
			</div>
		</>
	);
};

export default WhyOpenSourcePage;
