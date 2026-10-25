import PageLayout from "@reloop/web/components/page-layout";
import { contactEmail, founderEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/security`;

const pageDescription =
	"How Reloop protects your data: infrastructure we operate ourselves, encryption, hashed API keys, deletion on request, a public status page, and source code anyone can audit.";

export const metadata: Metadata = {
	title: "Security",
	description: pageDescription,
	keywords: [
		"Reloop security",
		"email API security",
		"GDPR email provider",
		"open source email security",
		"responsible disclosure",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Security | Reloop",
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Security | Reloop",
		description: pageDescription,
	},
};

const LAST_UPDATED = "October 26, 2026";

const STATUS_URL = "https://status.reloop.sh/status/live";
const REPO_URL = "https://github.com/reloop-labs/reloop";
const ADVISORY_URL = `${REPO_URL}/security/advisories/new`;

const SecurityPage = () => {
	return (
		<PageLayout
			title="Security"
			subtitle={`Last updated ${LAST_UPDATED}`}
			description="Email carries your users' data. Here is how we protect it, and how you can check every claim on this page yourself."
		>
			<div>
				<section>
					<h2>1. Verify it, don&rsquo;t trust it</h2>
					<p>
						Reloop is open source. The code running Reloop Cloud is the code in{" "}
						<a href={REPO_URL} target="_blank" rel="noreferrer">
							our public repository
						</a>
						, so you can read exactly how your data is stored, sent and deleted.
						If you ever stop trusting us, you can{" "}
						<Link href="/self-host">self-host the same software</Link> with the
						same APIs and keep running.
					</p>
				</section>

				<section>
					<h2>2. Infrastructure</h2>
					<ul>
						<li>
							Reloop Cloud runs on infrastructure and systems operated by Reloop
							Labs itself. No third-party vendor has standing access to customer
							personal data. The full list is on our{" "}
							<Link href="/dpa/subprocessors">subprocessors page</Link>.
						</li>
						<li>
							Service components are separated by network segmentation, and
							access follows least privilege.
						</li>
						<li>
							Administrative access is audit-logged, and data is backed up with
							documented recovery procedures.
						</li>
					</ul>
				</section>

				<section>
					<h2>3. Encryption</h2>
					<ul>
						<li>Data in transit is encrypted with TLS.</li>
						<li>Data is encrypted at rest where applicable.</li>
						<li>
							API keys (prefixed <code>rl_</code>) are stored only as SHA-256
							hashes. We cannot read your key after it is created, so copy it
							when it is shown.
						</li>
					</ul>
				</section>

				<section>
					<h2>4. Access control</h2>
					<ul>
						<li>
							Create a separate API key per integration, and disable, rotate or
							delete any key from the dashboard or API at any time.
						</li>
						<li>
							API requests are rate limited per key to contain leaked or
							misbehaving credentials.
						</li>
						<li>
							Every account is isolated by organization. Cross-tenant access is
							the highest-severity class in our{" "}
							<a href={`${REPO_URL}/blob/main/SECURITY.md`}>security policy</a>.
						</li>
					</ul>
				</section>

				<section>
					<h2>5. Abuse protection</h2>
					<p>
						Shared sending infrastructure is protected by abuse, spam and
						phishing detection, and inbound mail is scanned by Rspamd. This
						protects your sending reputation from other senders on the platform.
					</p>
				</section>

				<section>
					<h2>6. Your data, your control</h2>
					<ul>
						<li>
							Export or delete contacts, suppression lists and other data at any
							time through the dashboard and API.
						</li>
						<li>
							When you close your account, we return or delete your data within
							90 days, and backups are deleted on their regular rotation after
							that.
						</li>
						<li>
							Our <Link href="/dpa">Data Processing Addendum</Link> covers GDPR
							and UK GDPR, including Standard Contractual Clauses for
							international transfers.
						</li>
					</ul>
				</section>

				<section>
					<h2>7. Availability and incidents</h2>
					<ul>
						<li>
							Live uptime and incident history are public on{" "}
							<a href={STATUS_URL} target="_blank" rel="noreferrer">
								status.reloop.sh
							</a>
							.
						</li>
						<li>
							If a personal data breach affects your data, we notify you without
							undue delay, with what happened, what was affected and what we are
							doing about it.
						</li>
					</ul>
				</section>

				<section>
					<h2>8. Report a vulnerability</h2>
					<p>
						Please report vulnerabilities privately through{" "}
						<a href={ADVISORY_URL} target="_blank" rel="noreferrer">
							GitHub private vulnerability reporting
						</a>{" "}
						or by email to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>{" "}
						with the subject <code>[SECURITY]</code>. We acknowledge reports
						within 3 business days, triage within 7 days, and credit researchers
						in the advisory unless they prefer to stay anonymous.
					</p>
					<p>
						Please test against a local or self-hosted instance, not the hosted
						service. The full rules are in our{" "}
						<a href={`${REPO_URL}/blob/main/SECURITY.md`}>security policy</a>.
					</p>
				</section>

				<section>
					<h2>9. Questions</h2>
					<p>
						Need a security questionnaire filled in, or a call before you
						switch? Email <a href={`mailto:${founderEmail}`}>{founderEmail}</a>{" "}
						and a founder will reply.
					</p>
				</section>
			</div>
		</PageLayout>
	);
};

export default SecurityPage;
