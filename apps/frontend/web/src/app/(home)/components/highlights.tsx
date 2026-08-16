import {
	type FeatureHighlight,
	FeatureHighlightsGrid,
} from "@reloop/web/components/landing/feature-highlights";
import Link from "next/link";

function Term({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="underline decoration-stroke-soft-200 underline-offset-[3px] transition-colors hover:text-text-strong-950 hover:decoration-text-sub-600 dark:decoration-white/20 dark:hover:text-white dark:hover:decoration-white/50"
		>
			{children}
		</Link>
	);
}

const deliverabilityHighlights: FeatureHighlight[] = [
	{
		id: "blocklist-tracking",
		icon: "slash",
		title: "Proactive blocklist tracking",
		description: (
			<>
				Know first if your domain hits a{" "}
				<Term href="/glossary/blocklist">DNSBL</Term> or{" "}
				<Term href="/glossary/rbl">RBL</Term>. Reloop surfaces listings before
				they become a delivery incident.
			</>
		),
	},
	{
		id: "time-to-inbox",
		icon: "inbox",
		title: "Faster time to inbox",
		description: (
			<>
				Send from the region closest to the recipient. Fewer hops, less latency,
				better <Term href="/glossary/inbox-placement">inbox placement</Term>.
			</>
		),
	},
	{
		id: "bimi",
		icon: "verified",
		title: "Build confidence with BIMI",
		description: (
			<>
				Show your logo next to authenticated mail with{" "}
				<Term href="/glossary/bimi">BIMI</Term>. Get DMARC to enforcement first
				— the logo only works on top of it.
			</>
		),
	},
	{
		id: "dedicated-ips",
		icon: "server",
		title: "Managed dedicated IPs",
		description: (
			<>
				A <Term href="/glossary/dedicated-ip">dedicated IP</Term> that warms
				with your volume — or bring your own. No waiting around to send.
			</>
		),
	},
	{
		id: "suppression",
		icon: "list",
		title: "Dynamic suppression list",
		description: (
			<>
				Stop mailing people who bounced, complained, or unsubscribed. The{" "}
				<Term href="/glossary/suppression-list">suppression list</Term> is
				checked on every send path.
			</>
		),
	},
	{
		id: "monitoring",
		icon: "activity",
		title: "IP and domain monitoring",
		description: (
			<>
				Watch <Term href="/glossary/dns">DNS</Term> and{" "}
				<Term href="/glossary/ip-reputation">IP reputation</Term>. Get told when
				a record drifts or a change could hurt delivery.
			</>
		),
	},
	{
		id: "verify-dns",
		icon: "key",
		title: "Verify DNS records",
		description: (
			<>
				Prove you are a legitimate sender. Guided{" "}
				<Term href="/glossary/dkim">DKIM</Term> and{" "}
				<Term href="/glossary/spf">SPF</Term> setup when you add a domain.
			</>
		),
	},
	{
		id: "infrastructure",
		icon: "shield",
		title: "Battle-tested infrastructure",
		description: (
			<>
				Shared and dedicated pools used by senders who already have to land.
				Distributed workloads across{" "}
				<Term href="/glossary/shared-ip">IP pools</Term>.
			</>
		),
	},
	{
		id: "dmarc",
		icon: "fingerprint",
		title: "Prevent spoofing with DMARC",
		description: (
			<>
				Tell inbox providers what to do with mail that isn&apos;t yours.{" "}
				<Term href="/glossary/dmarc">DMARC</Term> policies stop impersonation
				before it hits the inbox.
			</>
		),
	},
];

export default function Highlights() {
	return (
		<section
			id="highlights"
			aria-labelledby="highlights-heading"
			className="w-full border-stroke-soft-200 border-t dark:border-white/10"
		>
			<div className="px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Deliverability
				</p>
				<h2
					id="highlights-heading"
					className="mt-4 max-w-3xl font-serif text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3rem] lg:text-[3.4rem] dark:text-white"
				>
					Built to land in the inbox.
				</h2>
			</div>

			<div className="border-stroke-soft-200 border-t dark:border-white/10">
				<FeatureHighlightsGrid
					items={deliverabilityHighlights}
					columns={3}
					stacked
				/>
			</div>
		</section>
	);
}
