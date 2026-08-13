import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
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

			<section className="relative w-full max-w-full overflow-x-clip border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
				<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-6 pt-28 pb-16 sm:px-10 sm:pt-32 sm:pb-20 md:max-w-7xl lg:px-12 dark:border-white/10">
					{/* Two columns: essay left, note right */}
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
						{/* Left — main essay */}
						<div className="min-w-0 lg:col-span-7">
							<h1 className="font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
								Why Open Source
							</h1>

							<p className="mt-3 max-w-xl text-[14px] text-text-sub-600 leading-snug sm:text-[14.5px] dark:text-white/55">
								Closed email tools sell trust. We sell a repo you can open.
							</p>

							<div className="mt-8 space-y-8 text-[13.5px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/60">
								{/* 1 */}
								<section className="space-y-2.5">
									<h2 className="font-semibold text-[14.5px] text-text-strong-950 tracking-tight sm:text-[15px] dark:text-white">
										<span className="mr-2 text-text-sub-600 tabular-nums dark:text-white/45">
											1.
										</span>
										Trust
									</h2>
									<p>
										You don&apos;t trust Stripe because of their homepage.
										You trust them because every payment can be traced.
									</p>
									<p>
										Email should work the same way.
									</p>
									<p className="font-medium text-text-strong-950 dark:text-white">
										Don&apos;t trust our dashboard. Verify our code.
									</p>
								</section>

								{/* 2 */}
								<section className="space-y-2.5">
									<h2 className="font-semibold text-[14.5px] text-text-strong-950 tracking-tight sm:text-[15px] dark:text-white">
										<span className="mr-2 text-text-sub-600 tabular-nums dark:text-white/45">
											2.
										</span>
										Closed doesn&apos;t mean smarter.
									</h2>
									<p>
										Every provider claims a &quot;proprietary engine.&quot;
										Most run the same open-source parts everyone else does.
									</p>
									<p>
										The difference isn&apos;t magic. It&apos;s marketing.
									</p>
									<p className="font-medium text-text-strong-950 dark:text-white">
										Open beats mysterious.
									</p>
								</section>

								{/* 3 */}
								<section className="space-y-2.5">
									<h2 className="font-semibold text-[14.5px] text-text-strong-950 tracking-tight sm:text-[15px] dark:text-white">
										<span className="mr-2 text-text-sub-600 tabular-nums dark:text-white/45">
											3.
										</span>
										Open source isn&apos;t enough
									</h2>
									<p>
										Free software. Not free time.
									</p>
									<p>
										DNS, queues, retries, monitoring &mdash; the repo doesn&apos;t
										do that. You do.
									</p>
									<p className="font-medium text-text-strong-950 dark:text-white">
										Reloop ships the part open source leaves out: done.
									</p>
								</section>

								<div className="pt-0.5">
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
							</div>
						</div>

						{/* Right — compact note */}
						<div className="min-w-0 lg:col-span-5 lg:pt-2">
							<OpenSourceIsntCheap />
						</div>
					</div>
				</div>
			</section>

			{/* Full-width bottom CTA */}
			<BlogCta
				category="Open Source"
				headline="Start free, or self-host."
				sub="Reloop is Apache 2.0. Same code on your servers and on reloop.sh."
				primaryLabel="Start Building Free"
				primaryHref="/dashboard/signup"
				secondaryLabel="View on GitHub"
				secondaryHref={socialProfiles.github}
				secondaryExternal
				accentColor="indigo"
			/>
		</>
	);
};

export default WhyOpenSourcePage;
