import PageLayout from "@reloop/web/components/page-layout";
import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/dpa`;

export const metadata: Metadata = {
	title: "Data Processing Addendum",
	description:
		"Data Processing Addendum for Reloop Cloud: how Reloop Labs processes customer personal data as a processor under the GDPR, including security, sub-processors, and international transfers.",
	keywords: [
		"Reloop DPA",
		"data processing addendum",
		"GDPR processor",
		"email platform DPA",
		"sub-processors",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Data Processing Addendum | Reloop",
		description:
			"How Reloop Labs processes customer personal data as a processor under the GDPR.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Data Processing Addendum | Reloop",
		description:
			"How Reloop Labs processes customer personal data as a processor under the GDPR.",
	},
};

const LAST_UPDATED = "September 26, 2026";

const DpaPage = () => {
	return (
		<PageLayout
			title="Data Processing Addendum"
			subtitle={`Last updated ${LAST_UPDATED}`}
			description="How Reloop Labs processes customer personal data on Reloop Cloud as a data processor under the GDPR."
		>
			<div>
				<p>
					This Data Processing Addendum (&ldquo;DPA&rdquo;) forms part of the{" "}
					<Link href="/terms-and-conditions">Terms of Service</Link> between{" "}
					<strong>Reloop Labs</strong> (&ldquo;Reloop&rdquo;, &ldquo;we&rdquo;,
					&ldquo;us&rdquo;, or &ldquo;our&rdquo;) and the customer using{" "}
					<strong>Reloop Cloud</strong> (the &ldquo;Customer&rdquo;,
					&ldquo;you&rdquo;, or &ldquo;your&rdquo;). It applies whenever Reloop
					processes personal data on your behalf in providing the hosted
					service. Our <Link href="/privacy">Privacy Policy</Link> describes how
					we handle data as a controller on reloop.sh.
				</p>

				<section>
					<h2>1. Definitions</h2>
					<ul>
						<li>
							<strong>&ldquo;Data Protection Laws&rdquo;</strong> means the EU
							General Data Protection Regulation (2016/679)
							(&ldquo;GDPR&rdquo;), the UK GDPR as retained in UK law, and any
							other applicable data-protection or privacy laws.
						</li>
						<li>
							<strong>&ldquo;Customer Personal Data&rdquo;</strong> means
							personal data that Reloop processes on behalf of the Customer in
							providing Reloop Cloud, including account data, contact and
							recipient data, message content and metadata, and delivery and
							engagement events.
						</li>
						<li>
							<strong>&ldquo;Controller&rdquo;</strong>,{" "}
							<strong>&ldquo;Processor&rdquo;</strong>,{" "}
							<strong>&ldquo;Data Subject&rdquo;</strong>,{" "}
							<strong>&ldquo;Processing&rdquo;</strong>, and{" "}
							<strong>&ldquo;Personal Data Breach&rdquo;</strong> have the
							meanings given in the GDPR.
						</li>
						<li>
							<strong>&ldquo;Sub-processor&rdquo;</strong> means a third party
							engaged by Reloop to process Customer Personal Data. Reloop Cloud
							runs on infrastructure operated by Reloop Labs itself; the systems
							involved are listed on our{" "}
							<Link href="/dpa/subprocessors">Subprocessors</Link> page.
						</li>
					</ul>
				</section>

				<section>
					<h2>2. Roles and scope</h2>
					<p>
						For Customer Personal Data processed in providing Reloop Cloud, the
						Customer acts as Controller (or as Processor where it processes data
						on behalf of its own customers) and Reloop Labs acts as Processor
						(or sub-processor, as applicable). This DPA does not apply to data
						Reloop processes as a Controller as described in our{" "}
						<Link href="/privacy">Privacy Policy</Link>, nor to self-hosted
						deployments, where the Customer is solely responsible for
						processing.
					</p>
				</section>

				<section>
					<h2>3. Details of processing</h2>
					<ul>
						<li>
							<strong>Subject matter:</strong> provision of hosted email
							infrastructure—sending, receiving, and managing email, including
							transactional messages, campaigns, automations, analytics, and
							related support.
						</li>
						<li>
							<strong>Duration:</strong> for the term of the Customer&rsquo;s
							use of Reloop Cloud, plus applicable deletion windows described in
							section 10.
						</li>
						<li>
							<strong>Nature and purpose:</strong> transmitting, storing, and
							analyzing email and associated data as instructed by the Customer
							through its use of the service, API calls, and configuration.
						</li>
						<li>
							<strong>Types of personal data:</strong> account identifiers
							(name, email address, company), recipient addresses and contact
							attributes, message content including attachments, delivery and
							engagement events (sends, deliveries, bounces, complaints, opens,
							clicks, unsubscribes), authentication records (SPF, DKIM, DMARC,
							BIMI), and support correspondence.
						</li>
						<li>
							<strong>Categories of data subjects:</strong> the Customer&rsquo;s
							personnel and end users, email recipients, and individuals whose
							data appears in messages or contact lists uploaded by the
							Customer.
						</li>
					</ul>
				</section>

				<section>
					<h2>4. Customer obligations</h2>
					<p>
						The Customer is responsible for establishing a lawful basis for
						processing (including recipient consent for marketing mail),
						providing required notices to Data Subjects, respecting objection,
						opt-out, and erasure requests, and using the service in compliance
						with Data Protection Laws and our{" "}
						<Link href="/terms-and-conditions">Terms of Service</Link>,
						including acceptable use and sending practices.
					</p>
				</section>

				<section>
					<h2>5. Processor obligations</h2>
					<p>Reloop Labs will:</p>
					<ul>
						<li>
							Process Customer Personal Data only on the Customer&rsquo;s
							documented instructions—given through use of the service, support
							requests, or this DPA—unless required otherwise by applicable law,
							in which case we will inform the Customer where permitted.
						</li>
						<li>
							Ensure personnel authorized to process Customer Personal Data are
							subject to confidentiality obligations.
						</li>
						<li>
							Maintain appropriate technical and organizational measures
							described in section 7.
						</li>
						<li>
							Assist the Customer, as described in sections 8 and 9, in meeting
							its obligations relating to Data Subject rights, breach
							notification, and impact assessments.
						</li>
						<li>
							Delete or return Customer Personal Data as described in section
							10.
						</li>
					</ul>
				</section>

				<section>
					<h2>6. Sub-processors</h2>
					<p>
						Reloop Cloud operates on infrastructure and systems run by Reloop
						Labs. The current list of systems that may process Customer Personal
						Data is published on our{" "}
						<Link href="/dpa/subprocessors">Subprocessors</Link> page. We will
						update that page before engaging any new third-party sub-processor
						that processes Customer Personal Data, and the Customer may object
						on reasonable data-protection grounds by contacting{" "}
						<a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Where we
						engage sub-processors, we impose data-protection obligations no less
						protective than those in this DPA and remain liable for their
						compliance.
					</p>
				</section>

				<section>
					<h2>7. Security measures</h2>
					<p>
						We maintain technical and organizational measures appropriate to the
						risk, including encryption of data in transit (TLS) and at rest
						where applicable, network segmentation between service components,
						authentication and least-privilege access controls, audit logging of
						administrative access, backups and recovery procedures, and abuse,
						spam, and phishing detection on shared sending infrastructure.
					</p>
				</section>

				<section>
					<h2>8. Personal Data Breaches</h2>
					<p>
						Upon becoming aware of a Personal Data Breach affecting Customer
						Personal Data, we will notify the Customer without undue delay and
						provide information reasonably available to us to assist the
						Customer in meeting its notification obligations, including the
						nature of the breach, categories and approximate numbers of Data
						Subjects and records concerned, likely consequences, and measures
						taken or proposed.
					</p>
				</section>

				<section>
					<h2>9. Data Subject rights and assistance</h2>
					<p>
						We provide self-service capabilities (contact management,
						suppression lists, export, and deletion) to help the Customer
						respond to Data Subject requests. Where a request is directed to
						Reloop but relates to Customer Personal Data, we will forward it to
						the Customer where identifiable and assist by appropriate technical
						measures. We will also reasonably assist with data-protection impact
						assessments and prior consultations relating to the hosted service.
					</p>
				</section>

				<section>
					<h2>10. Deletion and return</h2>
					<p>
						During active use, the Customer may export and delete Customer
						Personal Data through the dashboard and API. Upon termination of the
						hosted service, we will, at the Customer&rsquo;s choice, return or
						delete Customer Personal Data within ninety (90) days, except where
						retention is required by applicable law. Backups are deleted on
						their regular rotation cycle thereafter.
					</p>
				</section>

				<section>
					<h2>11. International transfers</h2>
					<p>
						Where Customer Personal Data is transferred outside the European
						Economic Area, the United Kingdom, or another jurisdiction requiring
						an adequacy mechanism, the parties rely on the EU Standard
						Contractual Clauses (as applicable, including the UK Addendum) which
						are incorporated into this DPA by reference, with the Customer as
						data exporter and Reloop Labs as data importer.
					</p>
				</section>

				<section>
					<h2>12. Audit</h2>
					<p>
						Upon reasonable written request and no more than once per
						twelve-month period (except following a Personal Data Breach), the
						Customer may audit Reloop&rsquo;s compliance with this DPA through a
						mutually agreed independent auditor, subject to confidentiality and
						minimal disruption to the service and other customers.
					</p>
				</section>

				<section>
					<h2>13. Liability and precedence</h2>
					<p>
						Liability under this DPA is subject to the limitations in the{" "}
						<Link href="/terms-and-conditions">Terms of Service</Link>. In the
						event of conflict between this DPA and the Terms or the{" "}
						<Link href="/privacy">Privacy Policy</Link> with respect to
						processing of Customer Personal Data, this DPA prevails.
					</p>
				</section>

				<section>
					<h2>14. Changes and contact</h2>
					<p>
						We may update this DPA to reflect changes in the service or
						applicable law; material changes will be posted on this page with a
						revised &ldquo;Last updated&rdquo; date. Questions about this DPA or
						requests under it may be sent to{" "}
						<a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
					</p>
				</section>
			</div>
		</PageLayout>
	);
};

export default DpaPage;
