import PageLayout from "@reloop/web/components/page-layout";
import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/terms-and-conditions`;

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Terms governing use of reloop.sh and the open-source Reloop email infrastructure software from Reloop Labs, including acceptable use, reputation protection, and refunds.",
	keywords: [
		"Reloop terms of service",
		"email platform terms",
		"terms and conditions",
		"open source email terms",
		"acceptable use policy",
		"refund policy",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Terms of Service | Reloop",
		description:
			"Terms governing use of reloop.sh and the open-source Reloop email infrastructure software from Reloop Labs, including acceptable use, reputation protection, and refunds.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Terms of Service | Reloop",
		description:
			"Terms governing use of reloop.sh, including acceptable use, reputation protection, and refunds.",
	},
};

const LAST_UPDATED = "September 19, 2026";

const TermsPage = () => {
	return (
		<PageLayout
			title="Terms of Service"
			subtitle={`LAST UPDATED: ${LAST_UPDATED}`}
			description="Terms governing use of reloop.sh and the open-source Reloop email infrastructure software from Reloop Labs, including acceptable use, reputation protection, and refunds."
			tocPosition="right"
		>
			<div>
				<p>
					These Terms of Service (&ldquo;Terms&rdquo;) govern your access to{" "}
					<strong>reloop.sh</strong> and your use of the open-source Reloop
					software provided by <strong>Reloop Labs</strong>{" "}
					(&ldquo;Reloop&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
					&ldquo;our&rdquo;). By using our website or the software, you agree to
					these Terms. If you do not agree, do not use our website or the
					software.
				</p>

				<section>
					<h2>1. About Reloop</h2>
					<p>
						Reloop is email infrastructure for sending, receiving, and managing
						email—the same class of service as proprietary platforms. Reloop
						Labs offers Reloop as a hosted service and maintains the open-source
						project, website, documentation, and community channels.
					</p>
					<p>
						You can use Reloop in two ways: sign up for our hosted email
						service, or self-host the open-source platform on your own
						infrastructure. Third parties may not resell or offer competing
						hosted services; see our <Link href="/license">license terms</Link>.
					</p>
				</section>

				<section>
					<h2>2. Software license</h2>
					<p>
						The Reloop source code is licensed under the{" "}
						<strong>Apache License, Version 2.0</strong>, with additional use
						restrictions defined by Reloop Labs. The full license is available
						on our <Link href="/license">License</Link> page and in the
						repository.
					</p>
					<p>In summary, you may:</p>
					<ul>
						<li>
							Use, copy, modify, and distribute Reloop for personal projects.
						</li>
						<li>
							Deploy Reloop inside your organization for internal email
							infrastructure.
						</li>
					</ul>
					<p>You may not:</p>
					<ul>
						<li>
							Sell, sublicense, or commercially redistribute the software.
						</li>
						<li>
							Offer Reloop—or a modified version—as a commercial hosted service
							(SaaS, PaaS, or similar).
						</li>
						<li>
							Use Reloop in a product or service whose primary purpose is to
							compete with Reloop Labs.
						</li>
					</ul>
					<p>
						Your use of the software is also governed by the Apache 2.0 license
						text and any applicable open-source notices in the repository.
					</p>
				</section>

				<section>
					<h2>3. Website use</h2>
					<p>
						You may use reloop.sh for lawful purposes in accordance with these
						Terms. You agree not to:
					</p>
					<ul>
						<li>
							Attempt to gain unauthorized access to our systems or interfere
							with the operation of the website.
						</li>
						<li>
							Use the website to distribute malware, spam, or unlawful content.
						</li>
						<li>
							Scrape, crawl, or harvest data from the website in a way that
							impairs its performance or violates applicable law.
						</li>
						<li>Misrepresent your affiliation with Reloop Labs.</li>
					</ul>
				</section>

				<section>
					<h2>4. Hosted service and self-hosting</h2>
					<p>
						When you use Reloop as a hosted service, Reloop Labs operates the
						platform and processes data as described in our{" "}
						<Link href="/privacy">Privacy Policy</Link>. You are responsible for
						lawful use, recipient consent, and acceptable sending practices.
					</p>
					<p>
						When you self-host Reloop, you are solely responsible for your
						deployment, configuration, security, backups, compliance with email
						and privacy laws, and all content sent or received through your
						instance. Reloop Labs does not operate or monitor your self-hosted
						instance unless you explicitly engage us for support. See our{" "}
						<Link href="/self-host">self-hosting guide</Link> for deployment
						documentation.
					</p>
				</section>

				<section>
					<h2>5. Acceptable use</h2>
					<p>
						You agree not to use Reloop—whether hosted or self-hosted—to engage
						in, facilitate, or attempt any of the following:
					</p>
					<ul>
						<li>
							Send unsolicited, bulk, or unlawful email (spam), or send to
							purchased, scraped, or otherwise non-consented lists.
						</li>
						<li>
							Phish, spoof, impersonate brands or individuals, distribute
							malware, or engage in fraud, scams, or social-engineering attacks.
						</li>
						<li>
							Send messages that lure recipients with fake security alerts,
							CVE-style claims, crypto or wallet theft narratives, seed-phrase
							or private-key requests, or similar deception.
						</li>
						<li>
							Route mail through carrier SMS or MMS email-to-text gateways (for
							example addresses on domains such as mms.mb.telus.com,
							txt.att.net, vtext.com, or tmomail.net) to deliver unsolicited
							messages to phones.
						</li>
						<li>
							Violate applicable export, sanctions, anti-abuse, or anti-spam
							laws.
						</li>
						<li>
							Infringe intellectual property, privacy, or publicity rights of
							others.
						</li>
						<li>
							Bypass, probe, or defeat sending limits, credit reservation,
							authentication, abuse filters, or other technical controls.
						</li>
					</ul>
				</section>

				<section>
					<h2>6. Shared infrastructure and reputation</h2>
					<p>
						On the hosted service, many customers share Reloop Labs&rsquo;
						sending infrastructure, including IP addresses and related
						reputation with mailbox providers. You agree not to take actions
						that harm Reloop&rsquo;s reputation, deliverability, or the ability
						of other customers to send mail. Harmful actions include, without
						limitation:
					</p>
					<ul>
						<li>
							High bounce rates, spam complaints, or blocklist listings caused
							by your sending.
						</li>
						<li>
							Phishing, scam, malware, or gateway abuse campaigns that cause
							providers to distrust Reloop infrastructure.
						</li>
						<li>
							Using Reloop to send content that mailbox providers reasonably
							treat as abusive or fraudulent.
						</li>
						<li>
							Any pattern of use that, in Reloop Labs&rsquo; reasonable
							judgment, endangers shared IP or domain reputation.
						</li>
					</ul>
					<p>
						You are responsible for list hygiene, consent, authentication on
						your domains, and compliance with recipient expectations. Reloop
						Labs may throttle, quarantine, or refuse traffic that threatens
						shared reputation.
					</p>
				</section>

				<section>
					<h2>7. Abuse classifications and enforcement</h2>
					<p>
						Reloop Labs may automatically or manually classify outbound activity
						on the hosted service. Classifications may include:
					</p>
					<ul>
						<li>
							<strong>High severity</strong> — activity that legitimate
							customers do not engage in, such as SMS/MMS gateway abuse or
							stacked phishing or scam lures. High-severity sends may be blocked
							immediately.
						</li>
						<li>
							<strong>Medium severity</strong> — activity that warrants operator
							review (for example suspicious content plus a link, or unusually
							large recipient sets). Medium-severity sends may still be
							delivered while we investigate.
						</li>
						<li>
							<strong>None</strong> — ordinary transactional or consented mail
							subject only to your plan limits.
						</li>
					</ul>
					<p>
						Reloop Labs may investigate and take action if we become aware of
						uses that violate these Terms or applicable law, including on
						self-hosted instances when we learn of such use. Actions may
						include, without limitation:
					</p>
					<ul>
						<li>Blocking individual messages or campaigns.</li>
						<li>
							Throttling, suspending, or terminating accounts, API keys, or
							domains.
						</li>
						<li>
							Removing content, disabling sending, or reclaiming shared
							resources.
						</li>
						<li>
							Reporting activity to mailbox providers, registrars, payment
							processors, or law enforcement.
						</li>
					</ul>
					<p>
						We may act with or without prior notice when we reasonably believe
						delay would increase harm to Reloop, other customers, or the public.
						Enforcement decisions are final except where mandatory law requires
						otherwise.
					</p>
				</section>

				<section>
					<h2>8. Billing, cancellation, and refunds</h2>
					<p>
						Paid hosted plans are billed according to the plan you select at
						checkout or in the dashboard. Unused sending credits and plan
						allowances do not roll over unless we expressly say otherwise for
						that plan.
					</p>
					<p>
						You may cancel a paid subscription at any time. Cancellation takes
						effect at the end of the then-current billing period unless we
						terminate earlier for cause. You retain access through the end of
						the paid period when you cancel in good standing.
					</p>
					<p>
						<strong>Refunds.</strong> Except where required by mandatory
						consumer law, refunds are handled as follows:
					</p>
					<ul>
						<li>
							<strong>Seven-day satisfaction window.</strong> If you are a
							legitimate paying subscriber and you are not satisfied with the
							hosted service, you may request a refund within{" "}
							<strong>seven (7) days</strong> of the payment date by contacting{" "}
							<a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Your
							request must include a clear, specific, and valid reason (for
							example, the product does not meet a documented feature you
							reasonably expected, or a billing error). Vague dissatisfaction
							without explanation is not a valid reason.
						</li>
						<li>
							Reloop Labs will review eligible requests in good faith. Approval
							is at our reasonable discretion after we verify that the account
							is in good standing, the request is timely, and the reason is
							valid. Approved refunds are typically returned to the original
							payment method.
						</li>
						<li>
							<strong>
								No refund outside the window or without a valid reason.
							</strong>{" "}
							Requests made more than seven (7) days after payment, or without a
							proper and valid reason, will not be refunded—whether the account
							belongs to a legitimate customer or not.
						</li>
						<li>
							<strong>No refund for abuse or fraud.</strong> No refunds,
							credits, or chargebacks are available if we suspend or terminate
							your account for violating these Terms—including acceptable use,
							fraud, phishing, spam, SMS/MMS gateway abuse, or conduct that
							harms Reloop&rsquo;s sender reputation—regardless of when the
							payment was made.
						</li>
						<li>
							Unused sending credits, partial billing periods after the
							seven-day window, and mid-cycle downgrades are otherwise
							non-refundable.
						</li>
						<li>
							Initiating a chargeback or payment dispute instead of contacting
							us under this section—or after an abuse-related suspension or
							termination—is a further breach of these Terms. We may contest the
							dispute and seek recovery of fees, costs, and related damages.
						</li>
					</ul>
				</section>

				<section>
					<h2>9. Intellectual property</h2>
					<p>
						The Reloop name, logo, and website content are owned by Reloop Labs
						or its licensors, except where open-source license terms apply to
						software source code. Contributions to the project may be subject to
						contribution guidelines and license terms published in the
						repository.
					</p>
					<p>
						Feedback you provide may be used by Reloop Labs to improve the
						project without obligation to you, unless otherwise agreed in
						writing.
					</p>
				</section>

				<section>
					<h2>10. Disclaimers</h2>
					<p>
						The website and software are provided{" "}
						<strong>&ldquo;as is&rdquo;</strong> and{" "}
						<strong>&ldquo;as available&rdquo;</strong>, without warranties of
						any kind, whether express or implied, including merchantability,
						fitness for a particular purpose, and non-infringement. Reloop Labs
						does not warrant that the software or website will be uninterrupted,
						error-free, or meet your requirements.
					</p>
				</section>

				<section>
					<h2>11. Limitation of liability</h2>
					<p>
						To the fullest extent permitted by law, Reloop Labs and its
						contributors will not be liable for any indirect, incidental,
						special, consequential, or punitive damages, or for loss of profits,
						data, goodwill, or business interruption, arising from your use of
						the website or software—even if we have been advised of the
						possibility of such damages.
					</p>
					<p>
						Our total liability for any claim relating to the website or
						software will not exceed one hundred U.S. dollars (USD $100), except
						where liability cannot be excluded under applicable law.
					</p>
				</section>

				<section>
					<h2>12. Third-party services and links</h2>
					<p>
						The website may link to third-party sites and services (for example,
						GitHub, Discord, and documentation hosts). Reloop Labs is not
						responsible for third-party content, policies, or practices.
					</p>
				</section>

				<section>
					<h2>13. Changes to these terms</h2>
					<p>
						We may update these Terms from time to time. The updated version
						will be posted on this page with a revised &ldquo;Last
						updated&rdquo; date. Continued use of the website after changes
						become effective constitutes acceptance of the revised Terms.
						Material changes to software licensing are reflected in the{" "}
						<Link href="/license">License</Link> page and repository.
					</p>
				</section>

				<section>
					<h2>14. Governing law</h2>
					<p>
						These Terms are governed by the laws applicable to Reloop Labs,
						without regard to conflict-of-law principles, except where mandatory
						local consumer protections apply.
					</p>
				</section>

				<section>
					<h2>15. Contact</h2>
					<p>
						Questions about these Terms may be sent to{" "}
						<a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
					</p>
				</section>
			</div>
		</PageLayout>
	);
};

export default TermsPage;
