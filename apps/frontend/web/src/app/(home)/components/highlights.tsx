import { SectionTitle } from "@reloop/web/app/sdk/components/section-title";
import {
	type FeatureHighlight,
	FeatureHighlightsGrid,
} from "@reloop/web/components/landing/feature-highlights";
import Link from "next/link";

function Term({ href, children }: { href: string; children: React.ReactNode }) {
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
				Catch <Term href="/glossary/blocklist">DNSBL</Term> and{" "}
				<Term href="/glossary/rbl">RBL</Term> listings before they hurt
				delivery.
			</>
		),
	},
	{
		id: "time-to-inbox",
		icon: "inbox",
		title: "Faster time to inbox",
		description: (
			<>
				Send from the closest region. Fewer hops, faster{" "}
				<Term href="/glossary/inbox-placement">inbox</Term>.
			</>
		),
	},
	{
		id: "bimi",
		icon: "verified",
		title: "Build confidence with BIMI",
		description: (
			<>
				Show your logo on authenticated mail with{" "}
				<Term href="/glossary/bimi">BIMI</Term>.
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
				with you — or bring your own.
			</>
		),
	},
	{
		id: "suppression",
		icon: "list",
		title: "Dynamic suppression list",
		description: (
			<>
				Never mail bounces, complaints, or unsubs.
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
				they drift.
			</>
		),
	},
	{
		id: "verify-dns",
		icon: "key",
		title: "Verify DNS records",
		description: (
			<>
				Guided <Term href="/glossary/dkim">DKIM</Term> and{" "}
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
				Shared and dedicated <Term href="/glossary/shared-ip">IP pools</Term>{" "}
				that already have to land.
			</>
		),
	},
	{
		id: "dmarc",
		icon: "fingerprint",
		title: "Prevent spoofing with DMARC",
		description: (
			<>
				<Term href="/glossary/dmarc">DMARC</Term> stops impersonation before it
				hits the inbox.
			</>
		),
	},
	{
		id: "warmup",
		icon: "zap",
		title: "Automated IP warmup",
		description: (
			<>
				Volume ramps that protect your{" "}
				<Term href="/glossary/email-warmup">warmup</Term>.
			</>
		),
	},
];

export default function Highlights() {
	return (
		<section
			id="highlights"
			aria-labelledby="highlights-heading"
			className="w-full"
		>
			<SectionTitle
				id="highlights-heading"
				icon="shield"
				size="xl"
				title="Built to land in the inbox."
			/>
			<FeatureHighlightsGrid
				items={deliverabilityHighlights}
				columns={5}
			/>
		</section>
	);
}
