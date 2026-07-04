import PageLayout from "@reloop/web/components/page-layout";
import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

const pageUrl = `${getSiteUrl()}/company/privacy`;

export const metadata: Metadata = {
	title: "Privacy Policy | Reloop",
	description:
		"How Reloop Labs collects and uses information on reloop.sh and in relation to the open-source Reloop email platform.",
	keywords: [
		"Reloop privacy policy",
		"email platform privacy",
		"data collection policy",
		"open source email privacy",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Privacy Policy | Reloop",
		description:
			"How Reloop Labs collects and uses information on reloop.sh and in relation to the open-source Reloop email platform.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Privacy Policy | Reloop",
		description:
			"How Reloop Labs collects and uses information on reloop.sh.",
	},
};

const LAST_UPDATED = "June 2, 2026";

const PrivacyPage = () => {
	return (
		<PageLayout
			title="Privacy Policy"
			subtitle={`Last updated: ${LAST_UPDATED}`}
		>
			<div>
				<p>
					This Privacy Policy explains how <strong>Reloop Labs</strong>{" "}
					(&ldquo;Reloop&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
					&ldquo;our&rdquo;) handles information when you visit{" "}
					<strong>reloop.sh</strong>, interact with us, or use the open-source
					Reloop email infrastructure software.
				</p>

				<section>
					<h2>
						1. Three contexts: our website, hosted service, and self-hosting
					</h2>
					<p>
						Reloop is open-source email infrastructure offered as a hosted
						service from Reloop Labs or as software you deploy yourself. There
						are three distinct contexts:
					</p>
					<ul>
						<li>
							<strong>Our website and community channels</strong> (reloop.sh,
							GitHub, Discord, and similar) are operated by Reloop Labs. This
							Policy describes what we collect in those contexts.
						</li>
						<li>
							<strong>Reloop hosted service</strong> is email infrastructure
							operated by Reloop Labs. When you use our hosted product, we
							process account, email, and usage data as described in this Policy
							to provide and secure the service.
						</li>
						<li>
							<strong>Your self-hosted Reloop instance</strong> runs on
							infrastructure you control. When you self-host, you decide what
							data is collected, stored, and processed. Reloop Labs does not
							receive your email content, contact lists, or delivery logs from
							your deployment unless you choose to share them with us (for
							example, in a support request).
						</li>
					</ul>
				</section>

				<section>
					<h2>2. Information we collect on reloop.sh</h2>
					<p>
						We collect only what is reasonably necessary to operate the site,
						respond to inquiries, and improve our open-source project.
					</p>
					<ul>
						<li>
							<strong>Contact and account information</strong>: name, email
							address, company, and any details you submit through contact
							forms, support requests, or community sign-ups.
						</li>
						<li>
							<strong>Website usage data</strong>: IP address, browser type,
							device information, pages viewed, referring URLs, timestamps, and
							similar diagnostic data collected through server logs or analytics
							tools.
						</li>
						<li>
							<strong>Cookies and similar technologies</strong>: essential
							cookies for security and session management, and optional
							analytics or preference cookies where enabled. You can control
							cookies through your browser settings.
						</li>
						<li>
							<strong>Community and repository activity</strong>: if you
							interact with us on GitHub, Discord, or X, those platforms may
							share profile and activity information with us according to their
							own policies.
						</li>
						<li>
							<strong>Communications</strong>: messages you send to us,
							feedback, bug reports, and survey responses.
						</li>
					</ul>
					<p>
						We do <strong>not</strong> sell personal information. When you use
						Reloop as a hosted service, email and account data is processed on
						Reloop Labs&apos; infrastructure to operate the product. When you
						self-host, that data stays on servers you control. The open-source
						software is available under our{" "}
						<Link href="/company/license">Apache 2.0 license</Link> with
						additional use restrictions.
					</p>
				</section>

				<section>
					<h2>3. How we use information</h2>
					<ul>
						<li>
							Operate, secure, and improve reloop.sh and related services.
						</li>
						<li>Respond to support, community, and press inquiries.</li>
						<li>
							Send transactional messages related to your requests (for example,
							replies to contact form submissions).
						</li>
						<li>
							Monitor for abuse, fraud, and security incidents on our website
							and infrastructure.
						</li>
						<li>
							Analyze aggregated or de-identified usage to improve documentation
							and the open-source project.
						</li>
						<li>Comply with legal obligations and enforce our terms.</li>
					</ul>
				</section>

				<section>
					<h2>4. Sharing and disclosures</h2>
					<p>
						We may share information with trusted service providers that help us
						run our website (for example, hosting, analytics, email delivery for
						outbound support replies, and error monitoring). These providers may
						access information only to perform services for us and are bound by
						confidentiality obligations.
					</p>
					<p>
						We may also disclose information when required by law, to protect
						Reloop Labs and our users, in connection with a merger or asset
						sale, or with your consent.
					</p>
				</section>

				<section>
					<h2>5. Self-hosted deployments and your responsibilities</h2>
					<p>
						If you deploy Reloop on your own servers, you are responsible for
						the personal data processed through your instance—including email
						content, recipient addresses, logs, and analytics. You must provide
						appropriate privacy notices to your own users and comply with
						applicable data protection laws.
					</p>
					<p>
						Reloop Labs is not the data controller or processor for data handled
						solely within your self-hosted environment unless we agree otherwise
						in writing.
					</p>
				</section>

				<section>
					<h2>6. Data retention and security</h2>
					<p>
						We retain personal information only as long as needed for the
						purposes described in this Policy, unless a longer period is
						required by law. We implement reasonable technical and
						organizational measures to protect information we hold, but no
						method of transmission or storage is completely secure.
					</p>
				</section>

				<section>
					<h2>7. Your choices and rights</h2>
					<p>
						Depending on where you live, you may have rights to access, correct,
						delete, or restrict processing of your personal data, or to object
						to certain processing. You may also opt out of non-essential
						marketing communications at any time.
					</p>
					<p>
						To exercise these rights, contact us at{" "}
						<a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We may need
						to verify your identity before fulfilling a request.
					</p>
				</section>

				<section>
					<h2>8. International transfers</h2>
					<p>
						Reloop Labs may process information in countries other than where
						you live. Where required, we use appropriate safeguards for
						cross-border transfers.
					</p>
				</section>

				<section>
					<h2>9. Changes to this policy</h2>
					<p>
						We may update this Policy from time to time. We will post the
						revised version on this page with an updated &ldquo;Last
						updated&rdquo; date. Material changes may be communicated through
						the website or by email where appropriate.
					</p>
				</section>

				<section>
					<h2>10. Contact</h2>
					<p>
						Questions about this Privacy Policy or your data may be sent to{" "}
						<a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
					</p>
				</section>
			</div>
		</PageLayout>
	);
};

export default PrivacyPage;
