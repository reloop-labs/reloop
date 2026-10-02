import { FaqSection } from "@reloop/web/components/faq-section";
import { getComparePage } from "@reloop/web/lib/compare-content";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import { ComparePageJsonLd } from "../components/compare-json-ld";
import { CompareMigrate } from "../components/compare-migrate";
import { CompareOtherLinks } from "../components/compare-other-links";
import { CompareSection } from "../components/compare-section";
import { ComparisonMatrix } from "../components/comparison-matrix";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { resendComparisonCategories } from "./comparison-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/resend";
const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Resend: Open-Source Email API with Self-Hosting (2026)",
	description:
		"Compare Reloop vs Resend in 2026: open-source Resend alternative with self-hosting, $10/50k pricing vs $20/50k, own MTA, agent inbox, and migration guide.",
	keywords: [
		"Reloop vs Resend",
		"Resend alternative",
		"Resend alternatives 2026",
		"open source Resend alternative",
		"self-hosted Resend alternative",
		"Resend vs Reloop pricing",
		"best Resend alternative",
		"self-hosted email API",
		"KumoMTA email",
	],
	openGraph: {
		title: "Reloop vs Resend: Open-Source Email API with Self-Hosting (2026)",
		description:
			"Compare Reloop vs Resend in 2026: open-source Resend alternative with self-hosting, $10/50k pricing vs $20/50k, own MTA, agent inbox, and migration guide.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Resend: Open-Source Email API with Self-Hosting (2026)",
		description:
			"Compare Reloop vs Resend in 2026: open-source Resend alternative with self-hosting, $10/50k pricing vs $20/50k, own MTA, agent inbox, and migration guide.",
	},
	alternates: { canonical: pageUrl },
};

const ResendComparisonPage = () => {
	const resendBrand = competitorBrands.find((b) => b.name === "Resend");
	const compare = getComparePage("resend");

	return (
		<>
			<ComparePageJsonLd slug="resend" />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Resend"]}
				description="The open-source Resend alternative for 2026: same developer ergonomics with self-hosting, lower send-based pricing, its own MTA, and an agent inbox. By Reloop Labs — the team behind Reloop."
				updatedAt="September 17, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={{
					label: "Migrate from Resend",
					href: "/compare/resend#migrate",
				}}
			>
				{/* Editorial overview: targets "Resend alternative" + verdict intent */}
				<CompareSection maxWidth="2xl">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/40">
						Overview · 2026
					</p>
					<h2 className="mt-3 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
						The short version: hosted DX layer vs email infrastructure you own
					</h2>
					<div className="mt-5 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
						<p>
							Resend is a polished, hosted-only developer API for transactional
							email. Its public sending path runs over Amazon SES, and inbound
							is webhook-oriented. If you want a clean API with no
							infrastructure to think about — and your volume fits its tiers —
							Resend is a legitimate choice.
						</p>
						<p>
							Reloop is email infrastructure: REST API, SMTP relay, campaigns,
							templates, webhooks, a human inbox, and an agent inbox in one
							Apache 2.0 codebase running its own MTA stack (KumoMTA, Rspamd).
							Use Reloop Cloud hosted, or self-host on your own Kubernetes or
							Docker infrastructure with no Reloop license fee. You keep source
							access, IP control, and a self-host exit ramp — which is why teams
							evaluating a{" "}
							<Link
								href="/alternatives/resend"
								className="font-semibold text-primary-base"
							>
								Resend alternative
							</Link>{" "}
							shortlist Reloop first.
						</p>
						<div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5 sm:p-6">
							<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
								Verdict: choose Reloop if you want ownership or scale on
								send-based pricing; stay on Resend if you want hosted-only
								simplicity.
							</p>
							<p className="mt-2 text-[14px] leading-relaxed">
								At 50,000 emails/month Reloop Pro is $10 vs Resend $20; at
								100,000/month Reloop Growth is $20 vs roughly $90 on Resend,
								with overage at $0.50 vs $0.90 per 1,000. Add self-hosting, an
								agent inbox, and an MTA you control, and Reloop is the better
								default for teams that outgrow a DX wrapper. Stay on Resend if
								Audiences plus a hosted-only workflow already fits and you have
								no need for source access or inbound agent workflows. Pricing as
								of September 17, 2026 — verify on{" "}
								<a
									href="https://resend.com/pricing"
									target="_blank"
									rel="noreferrer nofollow"
									className="underline underline-offset-2"
								>
									resend.com/pricing
								</a>{" "}
								and{" "}
								<Link href="/pricing" className="underline underline-offset-2">
									reloop.sh/pricing
								</Link>
								.
							</p>
						</div>
					</div>
				</CompareSection>

				{/* Feature matrix */}
				<CompareSection maxWidth="full" flushX>
					<div className="mb-10 text-center">
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
							Reloop &nbsp;&nbsp;vs&nbsp;&nbsp;&nbsp;{resendBrand?.name}
						</h2>
						<p className="mx-auto mt-3 max-w-xl font-medium text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
							Reloop is an open-source alternative to{" "}
							{resendBrand?.name || "Resend"} that runs its own MTA.
							<br /> Sending, receiving, AI templates, and agent inboxes in one
							codebase, hosted or self-hosted.
						</p>
					</div>
					<ComparisonMatrix
						competitorName="Resend"
						categories={resendComparisonCategories}
					/>
					<p className="mt-6 text-center text-[13px] text-text-sub-600 dark:text-white/40">
						Seen something inaccurate?{" "}
						<Link href="/contact" className="font-semibold text-primary-base">
							Tell us
						</Link>
						. We correct comparison pages when the facts change.
					</p>
				</CompareSection>

				{/* Migration: Dub-style 3-step cards */}
				<CompareSection maxWidth="2xl">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/40">
						Pricing deep-dive · as of September 17, 2026
					</p>
					<h2 className="mt-3 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
						Pricing: where the gap opens up past 50k emails
					</h2>
					<div className="mt-5 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
						<p>
							Both start at 3,000 free emails/month with a 100/day cap — a
							genuine tie for side projects. The divergence starts at the first
							paid tier: Reloop Pro bundles 50,000 emails for $10/month while
							Resend charges $20 for the same 50,000. At 100,000 emails/month
							Reloop Growth stays at $20; Resend scales to roughly $90.
						</p>
						<p>
							Overage tells the same story: $0.50 per 1,000 on Reloop vs $0.90
							on Resend Pro. A team sending 200,000 emails/month pays for
							100,000 emails of overage — about $50 on Reloop vs $90 on Resend —
							before base-plan differences. And unlike Resend, Reloop has a
							self-host path: deploy the Apache 2.0 codebase on your
							infrastructure for unlimited sends with no Reloop license fee (you
							still pay servers and IPs).
						</p>
						<p>
							Caveat in Resend&apos;s favor: if you send under ~10,000
							emails/month and never touch inbound, campaigns, or agent
							workflows, the absolute dollar gap is small and Resend&apos;s
							hosted simplicity may outweigh it. Compare your trailing-90-day
							volume on the{" "}
							<Link href="/pricing" className="font-semibold text-primary-base">
								full pricing page
							</Link>{" "}
							before deciding.
						</p>
					</div>
				</CompareSection>

				{/* Migration: Dub-style 3-step cards */}
				<CompareSection maxWidth="full">
					{resendBrand ? (
						<CompareMigrate
							competitorName="Resend"
							competitorIcon={resendBrand.icon}
							primaryHref="/dashboard/signup"
							guideHref="/docs"
						/>
					) : null}
					<p className="mx-auto mt-10 max-w-2xl px-4 text-center text-[14px] text-text-sub-600 dark:text-white/50">
						Details in the{" "}
						<Link href="/docs" className="font-semibold text-primary-base">
							API docs
						</Link>{" "}
						and{" "}
						<Link
							href="/features/smtp"
							className="font-semibold text-primary-base"
						>
							SMTP guide
						</Link>
						. Reloop is not a drop-in Resend proxy, so plan a small client
						adapter.
					</p>
				</CompareSection>

				<FaqSection
					id="compare-resend-faq"
					title="Reloop vs Resend FAQ"
					items={compare?.faqs ?? []}
					compact
					flush
				/>

				<CompareSection maxWidth="2xl">
					<div id="methodology" className="scroll-mt-28">
						<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/40">
							Methodology · trust
						</p>
						<h2 className="mt-3 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl dark:text-white">
							How we compared — and who wrote this
						</h2>
						<div className="mt-5 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							<p>
								This page is written and maintained by Reloop Labs, the team
								behind Reloop — so treat it as our perspective, not a neutral
								third party. Feature claims come from public docs (Resend docs,
								Resend pricing, and the Reloop codebase), not from load tests or
								private benchmarks. We do not publish third-party latency or
								deliverability benchmarks here.
							</p>
							<p>
								Pricing reflects public list prices last checked September 17,
								2026 and can change — verify on{" "}
								<a
									href="https://resend.com/pricing"
									target="_blank"
									rel="noreferrer nofollow"
									className="underline underline-offset-2"
								>
									resend.com/pricing
								</a>{" "}
								and{" "}
								<Link href="/pricing" className="underline underline-offset-2">
									reloop.sh/pricing
								</Link>
								. Competitor strengths are stated where they hold (hosted
								simplicity, Audiences workflow); gaps are marked “—” rather than
								guessed. Seen something inaccurate?{" "}
								<Link
									href="/contact"
									className="font-semibold text-primary-base"
								>
									Tell us
								</Link>{" "}
								— we correct comparison pages when the facts change.
							</p>
							<p>
								Related reading:{" "}
								<Link
									href="/alternatives/resend"
									className="font-semibold text-primary-base"
								>
									best Resend alternative
								</Link>
								,{" "}
								<Link
									href="/features/smtp"
									className="font-semibold text-primary-base"
								>
									SMTP relay
								</Link>
								,{" "}
								<Link
									href="/features/transaction-emails"
									className="font-semibold text-primary-base"
								>
									transactional email
								</Link>
								, and{" "}
								<Link href="/docs" className="font-semibold text-primary-base">
									API docs
								</Link>
								.
							</p>
						</div>
					</div>
				</CompareSection>

				<CompareSection maxWidth="full" noDivider>
					<CompareOtherLinks currentHref={pagePath} />
				</CompareSection>
			</ComparisonPageShell>
		</>
	);
};

export default ResendComparisonPage;
