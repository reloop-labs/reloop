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
	"Why open source matters for email infrastructure: verify claims in code, skip black-box vendors, and run the same Apache 2.0 product on reloop.sh or self-host.";

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
					<div className="max-w-2xl">
						{/* Title sizing matches changelog */}
						<h1 className="font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
							Why Open Source
						</h1>

						<div className="mt-6 space-y-8 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
							{/* Why "trust us" isn't good enough */}
							<div className="space-y-3">
								<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									Why &quot;trust us&quot; isn&apos;t good enough
								</h2>
								<p>
									Every email API makes big claims about what&apos;s
									happening under the hood: proprietary retry logic,
									&quot;smart&quot; deliverability engines, custom-built
									infrastructure. They back it up with clean dashboards
									and confident marketing copy. But none of it is
									verifiable. You&apos;re taking their word for it.
								</p>
								<p>
									Here&apos;s the uncomfortable truth: a lot of that
									&quot;proprietary&quot; infrastructure is built on the
									same open-source foundations everyone else uses. The
									logic might be identical to what&apos;s sitting in a
									public repo somewhere. What you pay a premium for is
									the closed label, the landing page confidence, and the
									claim that their secret sauce is unique. It often
									isn&apos;t. You&apos;re charged enterprise prices for
									software you cannot inspect, while the hard parts under
									the hood may be the same open tools everyone else runs.
									Good branding isn&apos;t the same as good engineering,
									and from outside a black box you have no way to tell
									them apart.
								</p>
								<p>
									With Reloop, you don&apos;t have to take our word for
									anything. The retry logic, the bounce handling, the
									webhook signing: it&apos;s all right there in the code.
									If we say we do something a certain way, you can go
									verify it in ten minutes instead of trusting a claims
									page. That&apos;s the actual difference open source
									makes: not that we&apos;re smarter, but that you
									don&apos;t have to guess.
								</p>
							</div>

							{/* 3 — Where open source fails */}
							<div className="space-y-3">
								<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									Where open source usually fails
								</h2>
								<p>
									Most &quot;open&quot; email projects are a demo, a raw
									MTA that still needs months of glue, or a public repo
									that drifts from the hosted product. Stars are not a
									product.
								</p>
							</div>

							{/* 4 — How Reloop is different */}
							<div className="space-y-3">
								<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									How Reloop is built differently
								</h2>
								<p>
									Reloop is{" "}
									<strong className="font-semibold text-text-strong-950 dark:text-white">
										Apache 2.0
									</strong>
									. Cloud and self-host run the same monorepo: APIs,
									SMTP, webhooks, templates, analytics, and routing. Use
									reloop.sh for zero ops, or{" "}
									<code className="rounded bg-bg-weak-50 px-1 py-0.5 font-mono text-[12.5px] text-text-strong-950 dark:bg-white/10 dark:text-white">
										docker compose up
									</code>{" "}
									in your VPC. Same code. No enterprise fork. Leave
									whenever you want.
								</p>
							</div>

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
