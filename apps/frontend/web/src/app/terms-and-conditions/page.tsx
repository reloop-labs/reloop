import PageLayout from "@reloop/web/components/page-layout";
import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/terms-and-conditions`;

export const metadata: Metadata = {
	title: "Terms of Service | Reloop",
	description:
		"Terms governing use of reloop.sh and the open-source Reloop email infrastructure software from Reloop Labs.",
	keywords: [
		"Reloop terms of service",
		"email platform terms",
		"terms and conditions",
		"open source email terms",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Terms of Service | Reloop",
		description:
			"Terms governing use of reloop.sh and the open-source Reloop email infrastructure software from Reloop Labs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Terms of Service | Reloop",
		description:
			"Terms governing use of reloop.sh and the open-source Reloop email infrastructure.",
	},
};

const LAST_UPDATED = "June 2, 2026";

const TermsPage = () => {
	return (
		<PageLayout
			title="Terms of Service"
			subtitle={`Last updated: ${LAST_UPDATED}`}
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
						hosted services; see our{" "}
						<Link href="/license">license terms</Link>.
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
						<Link href="/privacy">Privacy Policy</Link>. You are
						responsible for lawful use, recipient consent, and acceptable
						sending practices.
					</p>
					<p>
						When you self-host Reloop, you are solely responsible for your
						deployment, configuration, security, backups, compliance with email
						and privacy laws, and all content sent or received through your
						instance. Reloop Labs does not operate or monitor your self-hosted
						instance unless you explicitly engage us for support. See our{" "}
						<Link href="/docs/self-host">self-hosting guide</Link> for
						deployment documentation.
					</p>
				</section>

				<section>
					<h2>5. Acceptable use of the software</h2>
					<p>You agree not to use Reloop to:</p>
					<ul>
						<li>Send unsolicited or unlawful email (spam).</li>
						<li>Phish, distribute malware, or engage in fraud.</li>
						<li>Violate applicable export, sanctions, or anti-abuse laws.</li>
						<li>Infringe intellectual property or privacy rights of others.</li>
					</ul>
					<p>
						Reloop Labs may investigate and take action—including reporting to
						authorities or restricting community access—if we become aware of
						uses that violate these Terms or applicable law, even when such use
						occurs on infrastructure not operated by us.
					</p>
				</section>

				<section>
					<h2>6. Intellectual property</h2>
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
					<h2>7. Disclaimers</h2>
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
					<h2>8. Limitation of liability</h2>
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
					<h2>9. Third-party services and links</h2>
					<p>
						The website may link to third-party sites and services (for example,
						GitHub, Discord, and documentation hosts). Reloop Labs is not
						responsible for third-party content, policies, or practices.
					</p>
				</section>

				<section>
					<h2>10. Changes to these terms</h2>
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
					<h2>11. Governing law</h2>
					<p>
						These Terms are governed by the laws applicable to Reloop Labs,
						without regard to conflict-of-law principles, except where mandatory
						local consumer protections apply.
					</p>
				</section>

				<section>
					<h2>12. Contact</h2>
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
