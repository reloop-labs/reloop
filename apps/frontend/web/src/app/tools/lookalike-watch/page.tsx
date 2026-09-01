import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { createPageMetadata } from "@reloop/web/lib/metadata";
import { getSiteUrl } from "@reloop/web/lib/site";
import { Band, SectionIntro } from "../blocklist-checker/grid";
import { ApiSection } from "./api-section";
import { CheckerPanel } from "./checker-panel";
import {
	defenseSteps,
	faqGroups,
	faqs,
	metaDescription,
	toolDescription,
	toolKeywords,
	toolPath,
	toolTitle,
	trickCards,
} from "./content";
import { FaqGrid } from "./faq-grid";

export const instant = false;

export const metadata = createPageMetadata({
	title: toolTitle,
	description: metaDescription,
	path: toolPath,
	keywords: toolKeywords,
	ogImage: false,
});

export default function LookalikeWatchPage() {
	const siteUrl = getSiteUrl();

	return (
		<>
			<JsonLd
				data={[
					{
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: `${toolTitle} | Reloop`,
						url: `${siteUrl}${toolPath}`,
						description: metaDescription,
						applicationCategory: "SecurityApplication",
						operatingSystem: "Any",
						offers: {
							"@type": "Offer",
							price: "0",
							priceCurrency: "USD",
						},
						featureList: [
							"Lookalike domain permutation generator (TLD swaps, hyphens, typos, homoglyphs)",
							"Mail-ready capability scanner (MX records & SPF publishing)",
							"Attack vector educational simulation",
							"Actionable 5-step brand defense framework",
							"Public JSON REST API with 10-language SDK integration",
						],
						publisher: {
							"@type": "Organization",
							name: "Reloop",
							url: siteUrl,
						},
					},
					{
						"@context": "https://schema.org",
						"@type": "FAQPage",
						mainEntity: faqs.map((faq) => ({
							"@type": "Question",
							name: faq.question,
							acceptedAnswer: {
								"@type": "Answer",
								text: faq.answer,
							},
						})),
					},
					{
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{
								"@type": "ListItem",
								position: 1,
								name: "Tools",
								item: `${siteUrl}/tools`,
							},
							{
								"@type": "ListItem",
								position: 2,
								name: toolTitle,
								item: `${siteUrl}${toolPath}`,
							},
						],
					},
				]}
			/>

			{/* Hero / Interactive Tool Section */}
			<Band className="relative overflow-hidden pt-16">
				<div className="relative px-5 pt-14 pb-16 sm:px-6 sm:pt-16 md:px-8 lg:pb-20">
					<div className="mx-auto max-w-3xl text-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:border-white/12 dark:bg-black dark:text-white/45">
							<span className="size-1.5 rounded-full bg-rose-500" />
							Phishing Twin &amp; Mail-Ready Scanner
						</span>

						<h1 className="mt-6 font-semibold text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-[-1.4px] sm:text-[3.4rem] dark:text-white">
							Lookalike Domain Watch
						</h1>

						<p className="mx-auto mt-5 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
							{toolDescription}
						</p>
					</div>

					<div className="mt-10">
						<CheckerPanel />
					</div>
				</div>
			</Band>

			{/* Teaching Band 1: The Attack People Actually Hit */}
			<Band id="the-attack">
				<SectionIntro
					lead="The attack people actually hit in the real world."
					description="Phishers rarely spoof exact domains once DMARC is locked. Instead, they register lookalikes that your staff and customers mistake for you."
				/>

				<div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-12 md:px-8">
					{/* Worked Example Card */}
					<div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-6 dark:border-rose-500/30 dark:bg-rose-500/[0.06]">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="space-y-2">
								<span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider">
									Worked Example
								</span>
								<h3 className="font-semibold text-[18px] text-text-strong-950 dark:text-white">
									From: <code className="font-mono text-[16px] text-rose-600 dark:text-rose-400">support@acme-login.com</code>
								</h3>
								<p className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/70">
									Recipient receives an urgent email with your logo asking to &ldquo;Verify payroll credentials.&rdquo; The user glances at the word &ldquo;acme&rdquo; and clicks. Even with <code className="font-mono text-[12px]">p=reject</code> on <code className="font-mono text-[12px]">acme.com</code>, this email lands in the inbox because <code className="font-mono text-[12px]">acme-login.com</code> is a completely separate registered domain.
								</p>
							</div>

							<div className="shrink-0 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 font-mono text-[11.5px] space-y-1 dark:border-white/10 dark:bg-black">
								<div className="text-emerald-600 dark:text-emerald-400">✓ DMARC on acme.com: PASS</div>
								<div className="text-rose-500">✗ Blocked by acme.com DMARC? NO</div>
								<div className="text-text-sub-600 dark:text-white/40">• Registered owner: Attacker</div>
							</div>
						</div>
					</div>

					{/* Trick Table Cards */}
					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{trickCards.map((trick) => (
							<div
								key={trick.type}
								className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]"
							>
								<div>
									<span className="font-mono text-[10.5px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
										{trick.type}
									</span>
									<p className="mt-1 font-mono font-medium text-[13px] text-text-strong-950 dark:text-white">
										{trick.example}
									</p>
									<p className="mt-2 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
										{trick.explanation}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</Band>

			{/* Teaching Band 2: Why This Check Matters */}
			<Band id="why-it-matters">
				<SectionIntro
					lead="Why checking for lookalike twins matters."
					description="Mailboxes do not flag lookalike domains automatically unless they are reported. An active twin with MX or SPF records is an active attack risk."
				/>

				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 dark:divide-white/10 dark:border-white/10">
					<div className="flex min-h-[14rem] flex-col justify-between p-6 sm:p-7 lg:p-8">
						<Icon name="eye-off" className="size-5 text-text-sub-600 dark:text-white/40" />
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								Staff do not read full hostnames
							</p>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
								Recipients scan names quickly on mobile screens. A message from support@acme-sso.com looks genuine enough to fool busy employees into sharing passwords.
							</p>
						</div>
					</div>

					<div className="flex min-h-[14rem] flex-col justify-between p-6 sm:p-7 lg:p-8">
						<Icon name="lock" className="size-5 text-text-sub-600 dark:text-white/40" />
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								DMARC enforcement shifts the attack
							</p>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
								Once you publish p=reject on your real domain, attackers stop raw spoofing and switch directly to registering lookalike domains with active mail servers.
							</p>
						</div>
					</div>

					<div className="flex min-h-[14rem] flex-col justify-between p-6 sm:p-7 lg:p-8">
						<Icon name="mail" className="size-5 text-text-sub-600 dark:text-white/40" />
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								MX/SPF twins can send mail
							</p>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
								A parked lookalike domain with no DNS records is benign. A lookalike with MX exchanges or SPF includes is configured to send convincing email.
							</p>
						</div>
					</div>
				</div>
			</Band>

			{/* Teaching Band 3: How We Know Without Attacking Anyone */}
			<Band id="how-we-know">
				<SectionIntro
					lead="How we know without attacking anyone."
					description="We do not scrape private registrar databases, send test emails, or abuse third-party networks."
				/>

				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 dark:divide-white/10 dark:border-white/10">
					<div className="flex min-h-[14rem] flex-col justify-between p-6 sm:p-7 lg:p-8">
						<Icon name="list" className="size-5 text-text-sub-600 dark:text-white/40" />
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								Bounded Permutation Engine
							</p>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
								We generate a deterministic set of ~65 candidate variations across popular alternative TLDs, common typos, prefix hyphens, and IDN homoglyphs.
							</p>
						</div>
					</div>

					<div className="flex min-h-[14rem] flex-col justify-between p-6 sm:p-7 lg:p-8">
						<Icon name="globe" className="size-5 text-text-sub-600 dark:text-white/40" />
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								Read-Only Public DNS Queries
							</p>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
								We query standard NS, A, MX, and TXT (SPF) records from authoritative root nameservers. No probing, hacking, or web crawling.
							</p>
						</div>
					</div>

					<div className="flex min-h-[14rem] flex-col justify-between p-6 sm:p-7 lg:p-8">
						<Icon name="shield-check" className="size-5 text-text-sub-600 dark:text-white/40" />
						<div>
							<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								Mail-Capable Verification
							</p>
							<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
								A candidate is classified as mail-ready if it publishes valid MX mail exchangers or SPF authorization strings in public DNS.
							</p>
						</div>
					</div>
				</div>
			</Band>

			{/* Teaching Band 4: What We Are Not Claiming */}
			<Band id="what-we-are-not-claiming">
				<SectionIntro
					lead="What we are not claiming."
					description="Honest security visibility. Understanding the boundaries of a public lookalike scan."
				/>

				<div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12 md:px-8">
					<div className="divide-y divide-stroke-soft-200 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xs dark:divide-white/10 dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="py-3 flex items-start gap-3">
							<Icon name="info-outline" className="size-4.5 text-text-sub-600 shrink-0 mt-0.5 dark:text-white/40" />
							<div>
								<h4 className="font-semibold text-[14px] text-text-strong-950 dark:text-white">Not every possible phish on the internet</h4>
								<p className="mt-0.5 text-[13px] text-text-sub-600 dark:text-white/60">Permutations are infinite. A clean scan means no common variations were found, not that nobody can ever register a new one.</p>
							</div>
						</div>

						<div className="py-3 flex items-start gap-3">
							<Icon name="info-outline" className="size-4.5 text-text-sub-600 shrink-0 mt-0.5 dark:text-white/40" />
							<div>
								<h4 className="font-semibold text-[14px] text-text-strong-950 dark:text-white">Registered does not mean they emailed your customers today</h4>
								<p className="mt-0.5 text-[13px] text-text-sub-600 dark:text-white/60">A registered lookalike might be held by a domain squatter or competitor. It indicates sending capability, not proof of active fraud.</p>
							</div>
						</div>

						<div className="py-3 flex items-start gap-3">
							<Icon name="info-outline" className="size-4.5 text-text-sub-600 shrink-0 mt-0.5 dark:text-white/40" />
							<div>
								<h4 className="font-semibold text-[14px] text-text-strong-950 dark:text-white">Not a takedown or Google Safe Browsing report</h4>
								<p className="mt-0.5 text-[13px] text-text-sub-600 dark:text-white/60">This tool provides diagnostic visibility. Domain takedowns require filing registrar abuse complaints or ICANN UDRP disputes.</p>
							</div>
						</div>
					</div>
				</div>
			</Band>

			{/* Teaching Band 5: What You Can Actually Do */}
			<Band id="what-you-can-do">
				<SectionIntro
					lead="What you can actually do."
					description="You cannot prevent the world from registering domain names. Here is the realistic, ordered playbook for brand protection."
				/>

				<div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12 md:px-8">
					<div className="space-y-4">
						{defenseSteps.map((step) => (
							<div
								key={step.step}
								className="flex items-start gap-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]"
							>
								<div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 font-mono font-semibold text-[12px] text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white">
									{step.step}
								</div>

								<div className="flex-1">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
										<h4 className="font-semibold text-[14.5px] text-text-strong-950 dark:text-white">
											{step.title}
										</h4>
										{step.actionHref && (
											<a
												href={step.actionHref}
												className="font-mono text-[11.5px] text-blue-600 hover:underline dark:text-blue-400"
											>
												{step.actionLabel || "Learn More"} →
											</a>
										)}
									</div>
									<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
										{step.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</Band>

			{/* Section: Programmatic API Integration */}
			<Band id="api">
				<SectionIntro
					lead="Automate lookalike domain checks via API."
					description="Integrate automated lookalike candidate scanning into your security monitoring dashboards or customer onboarding pipelines."
				/>

				<ApiSection />
			</Band>

			{/* Section: FAQs */}
			<Band id="faq">
				<SectionIntro
					lead="Frequently asked questions."
					description="Everything you need to know about lookalike domains, typosquatting, MX records, and email brand protection."
				/>

				<FaqGrid groups={faqGroups} />
			</Band>

			{/* Bottom CTA */}
			<Band className="border-b-0">
				<BlogCta />
			</Band>
		</>
	);
}
