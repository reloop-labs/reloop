import PageLayout from "@reloop/web/components/page-layout";
import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/dpa/subprocessors`;

export const metadata: Metadata = {
	title: "Subprocessors",
	description:
		"Systems that may process customer personal data in providing Reloop Cloud. Reloop Cloud runs on infrastructure operated by Reloop Labs itself.",
	keywords: [
		"Reloop subprocessors",
		"data processors list",
		"GDPR sub-processors",
		"email infrastructure",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Subprocessors | Reloop",
		description:
			"Systems that may process customer personal data in providing Reloop Cloud.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Subprocessors | Reloop",
		description:
			"Systems that may process customer personal data in providing Reloop Cloud.",
	},
};

const LAST_UPDATED = "September 26, 2026";

const SYSTEMS: { system: string; purpose: string; data: string }[] = [
	{
		system: "PostgreSQL",
		purpose:
			"Primary application database for accounts, domains, contacts, campaigns, and delivery records.",
		data: "Account data, contact and recipient data, message metadata.",
	},
	{
		system: "Redis",
		purpose:
			"Sessions, rate limiting, caching, and short-lived pipeline state.",
		data: "Session identifiers, rate-limit counters, transient job state.",
	},
	{
		system: "NATS JetStream",
		purpose:
			"Internal message queue carrying mail-pipeline events between service components.",
		data: "Message metadata and delivery events in transit.",
	},
	{
		system: "MinIO",
		purpose: "Object storage for attachments, templates, and exports.",
		data: "Message content including attachments, templates, export files.",
	},
	{
		system: "ClickHouse",
		purpose: "Analytics store for delivery and engagement events.",
		data: "Delivery events (sends, bounces, complaints, opens, clicks).",
	},
	{
		system: "KumoMTA",
		purpose: "Outbound and inbound SMTP delivery agents.",
		data: "Message content and envelope data during transmission.",
	},
	{
		system: "Rspamd",
		purpose: "Spam, phishing, and abuse scanning of inbound mail.",
		data: "Inbound message content during scanning.",
	},
	{
		system: "Inngest",
		purpose:
			"Orchestration of background workflows such as automations and drips.",
		data: "Workflow state referencing contact and message metadata.",
	},
	{
		system: "Lago",
		purpose: "Usage metering for billing.",
		data: "Aggregated sending volumes per account.",
	},
	{
		system: "Caddy",
		purpose: "TLS-terminating edge proxy in front of the service.",
		data: "No persistent storage; connection metadata in transit only.",
	},
];

const SubprocessorsPage = () => {
	return (
		<PageLayout
			title="Subprocessors"
			subtitle={`Last updated ${LAST_UPDATED}`}
			description="Systems that may process customer personal data in providing Reloop Cloud."
		>
			<div>
				<p>
					Reloop Cloud runs on infrastructure and systems operated by{" "}
					<strong>Reloop Labs</strong> itself. As of the date above, no
					third-party vendor has standing access to Customer Personal Data as
					defined in our <Link href="/dpa">Data Processing Addendum</Link>. The
					table below lists the systems involved in providing the hosted
					service.
				</p>

				<section>
					<h2>1. Systems</h2>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-left text-[13px] leading-relaxed">
							<thead>
								<tr className="border-stroke-soft-100 border-y dark:border-white/10">
									<th className="py-2 pr-4 font-semibold text-text-strong-950 dark:text-white">
										System
									</th>
									<th className="py-2 pr-4 font-semibold text-text-strong-950 dark:text-white">
										Purpose
									</th>
									<th className="py-2 font-semibold text-text-strong-950 dark:text-white">
										Data involved
									</th>
								</tr>
							</thead>
							<tbody>
								{SYSTEMS.map((row) => (
									<tr
										key={row.system}
										className="border-stroke-soft-100 border-b text-text-sub-600 dark:border-white/10 dark:text-white/60"
									>
										<td className="whitespace-nowrap py-2 pr-4 font-medium text-text-strong-950 dark:text-white">
											{row.system}
										</td>
										<td className="py-2 pr-4">{row.purpose}</td>
										<td className="py-2">{row.data}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<h2>2. Changes and objections</h2>
					<p>
						We will update this page before engaging any new third-party
						sub-processor that processes Customer Personal Data. Customers may
						object on reasonable data-protection grounds, or ask questions about
						these systems, by contacting{" "}
						<a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
					</p>
				</section>
			</div>
		</PageLayout>
	);
};

export default SubprocessorsPage;
