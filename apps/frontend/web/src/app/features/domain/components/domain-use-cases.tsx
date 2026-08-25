import { Icon } from "@reloop/ui/icon";
import {
	type FeatureHighlight,
	FeatureHighlightsGrid,
} from "@reloop/web/components/landing/feature-highlights";

const domainUseCases: FeatureHighlight[] = [
	{
		id: "dkim-signing",
		icon: "key-new",
		title: "2048-Bit DKIM Keys",
		description:
			"Cryptographically sign every email with auto-generated RSA-2048 keys for maximum recipient trust.",
	},
	{
		id: "spf-alignment",
		icon: "shield-check",
		title: "SPF Alignment",
		description:
			"Authorize Reloop's global MTAs with strict SPF inclusion, keeping DNS lookup limits well below 10.",
	},
	{
		id: "dmarc-enforcement",
		icon: "lock",
		title: "DMARC Enforcement",
		description:
			"Safeguard your domain against spoofing with guided transitions from p=none to p=reject.",
	},
	{
		id: "custom-return-path",
		icon: "arrow-swap",
		title: "Custom Return-Path",
		description:
			"White-label your envelope MAIL FROM address to eliminate 'sent via' warnings in email clients.",
	},
	{
		id: "subdomain-isolation",
		icon: "grid",
		title: "Subdomain Isolation",
		description:
			"Isolate transactional, marketing, and notification email reputations across distinct subdomains.",
	},
	{
		id: "instant-verification",
		icon: "refresh-cw",
		title: "Instant Verification",
		description:
			"Automated resolver polling checks DNS propagation across global regions within seconds.",
	},
	{
		id: "bimi-support",
		icon: "image-upload",
		title: "BIMI & Brand Avatars",
		description:
			"Configure Brand Indicators for Message Identification (BIMI) to display your SVG logo in inboxes.",
	},
	{
		id: "zero-downtime-rotation",
		icon: "refresh-cw",
		title: "Zero-Downtime Rotation",
		description:
			"Rotate cryptographic DKIM keys seamlessly without dropping in-flight deliveries.",
	},
	{
		id: "multi-domain-tenancy",
		icon: "users",
		title: "Multi-Domain Tenancy",
		description:
			"Provision and manage custom sending domains programmatically for all of your SaaS customers.",
	},
	{
		id: "blocklist-telemetry",
		icon: "alert-triangle",
		title: "Blocklist Telemetry",
		description:
			"Continuous automated monitoring across Spamhaus, URIBL, and SURBL to protect sender reputation.",
	},
];

export function DomainUseCases() {
	return (
		<section
			id="use-cases"
			aria-labelledby="use-cases-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-200 border-b px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24 dark:border-white/10">
				<div className="mb-3.5">
					<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-emerald-50 px-2.5 py-1 font-medium text-[13px] text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
						<Icon name="shapes" className="size-3.5" />
						Domain Capabilities
					</span>
				</div>
				<h2
					id="use-cases-heading"
					className="mt-3.5 max-w-3xl text-balance font-medium text-4xl text-text-strong-950 leading-[1.05] tracking-tighter sm:text-5xl dark:text-white"
				>
					Built for flawless email authentication.
				</h2>
			</div>
			<FeatureHighlightsGrid items={domainUseCases} columns={5} />
		</section>
	);
}
