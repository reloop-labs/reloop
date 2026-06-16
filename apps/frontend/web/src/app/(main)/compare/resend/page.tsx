import { FaqSection } from "@reloop/web/components/faq-section";
import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { CompareOtherLinks } from "../components/compare-other-links";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { ComparisonTable } from "../components/comparison-table";

const pagePath = "/compare/resend";
const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Resend | Email Provider Comparison",
	description:
		"A practical comparison of Reloop and Resend—developer email APIs, self-hosting, campaigns, pricing, and when teams switch.",
	openGraph: {
		title: "Reloop vs Resend",
		description:
			"Compare Reloop and Resend on open source, self-hosting, campaigns, and developer experience.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	alternates: { canonical: pageUrl },
};

const ResendComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs Resend"]}
			description="Resend set a new bar for developer email APIs. This page explains where the products overlap—and where Reloop offers a different path."
		>
			<PageSection flushTop narrow>
				<div className="mx-auto max-w-3xl space-y-6 text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
					<p>
						If you ship SaaS or internal tools, you have probably seen Resend in
						tutorials, starter kits, and framework guides. The product is
						intentionally narrow: a hosted API for sending email with a polished
						dashboard and strong docs. That focus is a strength.
					</p>
					<p>
						Reloop targets a different decision: teams that want the same
						developer ergonomics but also need{" "}
						<strong className="font-semibold text-text-strong-950 dark:text-white">
							ownership of the stack
						</strong>
						—open source, optional self-hosting, campaigns, SMTP, and agent
						workflows without adding more vendors.
					</p>
				</div>
			</PageSection>

			<PageSection>
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Where Resend fits well
						</p>
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] dark:text-white">
							Fast path to{" "}
							<span className="text-primary-base">hosted transactional.</span>
						</h2>
						<ul className="mt-6 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							<li>
								You want a hosted-only product with minimal operational surface
								area and no interest in running infrastructure.
							</li>
							<li>
								Your sends are almost entirely transactional—password resets,
								receipts, notifications—and you do not need a campaign builder.
							</li>
							<li>
								You are already deep in the React Email ecosystem and happy to
								stay on a proprietary hosted renderer.
							</li>
						</ul>
					</div>
					<div>
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
							Where Reloop is different
						</p>
						<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.4rem] dark:text-white">
							Platform +{" "}
							<span className="text-primary-base">deployment choice.</span>
						</h2>
						<ul className="mt-6 space-y-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							<li>
								Apache 2.0 source—you can read how routing, quotas, and webhooks
								are implemented instead of trusting a black box.
							</li>
							<li>
								Self-host on your network or use Reloop hosted; same product,
								your choice of where data lives.
							</li>
							<li>
								Campaigns, SMTP relay, analytics, and agent inbox live beside
								transactional sends—no second vendor for marketing or AI
								workflows.
							</li>
						</ul>
					</div>
				</div>
			</PageSection>

			<PageSection alt>
				<SectionHeading
					title="Side-by-side"
					description="Infrastructure and product capabilities—not marketing slogans."
					compact
				/>
				<ComparisonTable
					competitorName="Resend"
					features={[
						{
							label: "Open-source codebase",
							reloop: "Yes (Apache 2.0)",
							competitor: "No",
						},
						{ label: "Self-hostable", reloop: "Yes", competitor: "No" },
						{ label: "Hosted SaaS", reloop: "Yes", competitor: "Yes" },
						{ label: "Transactional REST API", reloop: "Yes", competitor: "Yes" },
						{ label: "Marketing campaigns", reloop: "Yes", competitor: "Limited" },
						{ label: "SMTP relay", reloop: "Yes", competitor: "Yes" },
						{ label: "Webhooks & delivery events", reloop: "Yes", competitor: "Yes" },
						{ label: "Agent inbox / AI workflows", reloop: "Yes", competitor: "No" },
						{
							label: "Free tier (monthly)",
							reloop: "3,000 emails",
							competitor: "3,000 emails",
						},
						{
							label: "Typical Pro entry",
							reloop: "$19 / month (50k sends)",
							competitor: "~$20 / month (50k sends)",
						},
					]}
				/>
			</PageSection>

			<PageSection narrow>
				<SectionHeading
					title="Migrating from Resend"
					description="Most teams keep their template rendering and swap the transport layer."
					compact
				/>
				<div className="mx-auto max-w-2xl space-y-4">
					<div className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<p className="font-semibold text-text-strong-950 dark:text-white">
							1. Stand up Reloop
						</p>
						<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Sign up for hosted Reloop or deploy from the open-source repo.
							Create an API key and add your sending domain.
						</p>
					</div>
					<div className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<p className="font-semibold text-text-strong-950 dark:text-white">
							2. Keep your templates
						</p>
						<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Continue rendering React Email (or any HTML generator) in your
							app. Reloop accepts the rendered HTML—no requirement to rebuild
							templates inside our editor.
						</p>
					</div>
					<div className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<p className="font-semibold text-text-strong-950 dark:text-white">
							3. Swap the client
						</p>
						<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Replace Resend SDK calls with the Reloop SDK. Payloads for
							<code className="mx-1 rounded bg-bg-soft-50 px-1.5 py-0.5 font-mono text-[13px] dark:bg-white/5">
								from
							</code>
							,
							<code className="mx-1 rounded bg-bg-soft-50 px-1.5 py-0.5 font-mono text-[13px] dark:bg-white/5">
								to
							</code>
							, subject, and HTML map cleanly.
						</p>
					</div>
					<div className="rounded-2xl border border-stroke-soft-200 px-5 py-4 dark:border-white/10">
						<p className="font-semibold text-text-strong-950 dark:text-white">
							4. Cut over webhooks
						</p>
						<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Point delivery and bounce webhooks to your existing handlers. Run
							parallel sends in staging before flipping production traffic.
						</p>
					</div>
				</div>
				<p className="mx-auto mt-8 max-w-2xl text-center text-[14px] text-text-sub-600 dark:text-white/50">
					See{" "}
					<Link href="/pricing" className="font-semibold text-primary-base">
						Reloop pricing
					</Link>{" "}
					and the{" "}
					<Link
						href="/resources/self-hosting-guide"
						className="font-semibold text-primary-base"
					>
						self-hosting guide
					</Link>{" "}
					if you are evaluating deployment options.
				</p>
			</PageSection>

			<FaqSection
				id="compare-resend-faq"
				title="Resend vs Reloop FAQ"
				items={[
					{
						question: "Is Reloop API-compatible with Resend?",
						answer:
							"No—Reloop has its own REST API and SDKs. Migration is usually a small client swap for standard send payloads, not a drop-in proxy.",
					},
					{
						question: "Can we still use React Email?",
						answer:
							"Yes. Render templates in your application and pass HTML to Reloop. Many Resend teams already do this; only the transport call changes.",
					},
					{
						question: "Who should stay on Resend?",
						answer:
							"Teams that want hosted-only transactional email with zero ops burden and no need for campaigns, self-hosting, or source access.",
					},
					{
						question: "Who should evaluate Reloop?",
						answer:
							"Teams hitting limits around vendor lock-in, data residency, marketing sends, or AI/agent email workflows—or anyone who wants to read the code.",
					},
				]}
				compact
			/>

			<PageSection narrow>
				<CompareOtherLinks currentHref={pagePath} />
			</PageSection>
		</ComparisonPageShell>
	);
};

export default ResendComparisonPage;
