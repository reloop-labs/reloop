import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";

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
				<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x px-6 pt-28 pb-16 sm:px-10 sm:pt-32 sm:pb-20 md:max-w-7xl lg:px-12 dark:border-white/10">
					{/* Essay sits left within the bordered column */}
					<div className="w-full max-w-2xl">
						{/* Title sizing matches changelog */}
						<h1 className="font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
							Why Open Source
						</h1>

						{/* Short scroll-stopper before the sections */}
						<p className="mt-5 max-w-xl text-[15px] text-text-sub-600 leading-snug sm:text-[16px] dark:text-white/55">
							Closed email tools sell trust. We sell a repo you can open.
						</p>

						<div className="mt-10 space-y-12 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
							{/* 1 */}
							<section className="space-y-4">
								<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									<span className="mr-2 text-text-sub-600 tabular-nums dark:text-white/45">
										1.
									</span>
									Trust
								</h2>
								<p>
									You don&apos;t trust Stripe because of their homepage. You
									trust them because every payment can be traced.
								</p>
								<p>Email should work the same way.</p>
								<p>
									Today, most email providers ask you to trust a dashboard you
									can&apos;t verify. If an email disappears, you&apos;re left
									opening a support ticket.
								</p>
								<p>We think trust should be inspectable.</p>
								<p>
									With Reloop, the logic isn&apos;t hidden behind a marketing
									page. The retries, queues, webhooks, and bounce handling are
									all in the open.
								</p>
								<p className="font-medium text-text-strong-950 dark:text-white">
									You don&apos;t have to trust us. You can verify us.
								</p>
							</section>

							{/* 2 */}
							<section className="space-y-4">
								<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									<span className="mr-2 text-text-sub-600 tabular-nums dark:text-white/45">
										2.
									</span>
									Closed doesn't mean smarter.
								</h2>
								<p>
									Every provider claims they have a &quot;proprietary sending
									engine.&quot;
								</p>
								<p>The funny part?</p>
								<p>
									Most of them are built on the same open-source components
									everyone else uses.
								</p>
								<p>The difference isn&apos;t magic.</p>
								<p>It&apos;s packaging.</p>
								<p>
									We&apos;d rather show you exactly how our system works than
									ask you to believe ours is somehow smarter.
								</p>
								<p className="font-medium text-text-strong-950 dark:text-white">
									Open beats mysterious.
								</p>
							</section>

							{/* 3 */}
							<section className="space-y-4">
								<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									<span className="mr-2 text-text-sub-600 tabular-nums dark:text-white/45">
										3.
									</span>
									Open Source Isn&apos;t Enough
								</h2>
								<p>Most open-source email projects stop at the repository.</p>
								<p>You still have to wire everything together yourself.</p>
								<ul className="list-disc space-y-2 pl-5 marker:text-text-sub-600 dark:marker:text-white/40">
									<li>DNS.</li>
									<li>Queues.</li>
									<li>Monitoring.</li>
									<li>Retries.</li>
									<li>Deployments.</li>
								</ul>
								<p>The software is free.</p>
								<p>Your time isn&apos;t.</p>
								<p className="font-medium text-text-strong-950 dark:text-white">
									Reloop turns an open-source project into a product you can
									actually deploy.
								</p>
							</section>

							<div className="pt-1">
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
