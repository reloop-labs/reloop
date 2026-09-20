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
				with your sending volume.
			</>
		),
	},
	{
		id: "smart-retries",
		icon: "bounce",
		title: "Smart bounce handling",
		description: (
			<>
				Distinguish <Term href="/glossary/hard-bounce">hard</Term> from{" "}
				<Term href="/glossary/soft-bounce">soft bounces</Term> and auto-retry
				with backoff.
			</>
		),
	},
	{
		id: "phishing-protection",
		icon: "shield-check",
		title: "Phishing protection",
		description: (
			<>
				Detect <Term href="/tools/lookalike-watch">lookalike</Term> domains and
				block impersonation attacks.
			</>
		),
	},
	{
		id: "tls-enforcement",
		icon: "lock",
		title: "Strict TLS delivery",
		description: (
			<>
				Enforce <Term href="/glossary/starttls">STARTTLS</Term> on every hop so
				messages stay encrypted in flight.
			</>
		),
	},
	{
		id: "suppression",
		icon: "list",
		title: "Dynamic suppression list",
		description: <>Never mail bounces, complaints, or unsubs.</>,
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
		id: "dmarc",
		icon: "fingerprint",
		title: "Prevent spoofing",
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
			className="w-full border-stroke-soft-200 border-b dark:border-white/10"
		>
			<div className="border-stroke-soft-200 border-b px-5 py-8 sm:px-7 lg:px-9 lg:py-10 dark:border-white/10">
				<p className="font-medium text-[12px] text-primary-base uppercase">
					Deliverability
				</p>
				<h2
					id="highlights-heading"
					className="mt-3 font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Built to land in the inbox.
				</h2>
			</div>
			<FeatureHighlightsGrid items={deliverabilityHighlights} columns={5} />
		</section>
	);
}
