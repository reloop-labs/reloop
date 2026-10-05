import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

function Term({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link
			href={href}
			className="underline decoration-stroke-soft-100 decoration-wavy underline-offset-[4px] transition-colors hover:text-text-strong-950 hover:decoration-text-sub-600 dark:decoration-white/20 dark:hover:text-white dark:hover:decoration-white/50"
		>
			{children}
		</Link>
	);
}

function Card({
	icon,
	title,
	children,
}: {
	icon: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white p-6 lg:p-8 dark:bg-black">
			<div className="space-y-3">
				<Icon
					name={icon}
					className="size-4 text-text-sub-600 dark:text-white/40"
				/>
				<h3 className="mt-3 font-medium text-foreground">{title}</h3>
				<p className="line-clamp-2 text-muted-foreground text-sm">{children}</p>
			</div>
		</div>
	);
}

export function DataVisualization() {
	return (
		<section
			aria-labelledby="data-visualization-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div className="border-stroke-soft-100 border-t bg-white py-16 lg:py-24 dark:border-white/10 dark:bg-black">
					<div className="mx-auto max-w-2xl space-y-6 px-6 text-center">
						<h2
							id="data-visualization-heading"
							className="text-balance font-semibold text-4xl text-foreground lg:text-5xl"
						>
							Everything you need to reach the inbox
						</h2>
						<p className="text-balance text-lg text-muted-foreground">
							Authentication, reputation, and monitoring — built in, so your
							emails land where they belong.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-px border-stroke-soft-100 border-t bg-stroke-soft-100 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10 dark:bg-white/10">
					<Card icon="slash" title="Proactive blocklist tracking">
						Catch <Term href="/glossary/blocklist">DNSBL</Term> and{" "}
						<Term href="/glossary/rbl">RBL</Term> listings before they hurt
						delivery.
					</Card>
					<Card icon="server" title="Managed dedicated IPs">
						A <Term href="/glossary/dedicated-ip">dedicated IP</Term> that
						warms with your sending volume.
					</Card>
					<Card icon="bounce" title="Smart bounce handling">
						Distinguish <Term href="/glossary/hard-bounce">hard</Term> from{" "}
						<Term href="/glossary/soft-bounce">soft bounces</Term> and
						auto-retry with backoff.
					</Card>
					<Card icon="shield-check" title="Phishing protection">
						Detect <Term href="/tools/lookalike-watch">lookalike</Term>{" "}
						domains and block impersonation attacks.
					</Card>
					<Card icon="lock" title="Strict TLS delivery">
						Enforce <Term href="/glossary/starttls">STARTTLS</Term> on every
						hop so messages stay encrypted in flight.
					</Card>
					<Card icon="list" title="Dynamic suppression list">
						Never mail bounces, complaints, or unsubs.
					</Card>
					<Card icon="activity" title="IP and domain monitoring">
						Watch <Term href="/glossary/dns">DNS</Term> and{" "}
						<Term href="/glossary/ip-reputation">IP reputation</Term>. Get
						told when they drift.
					</Card>
					<Card icon="fingerprint" title="Prevent spoofing">
						<Term href="/glossary/dmarc">DMARC</Term> stops impersonation
						before it hits the inbox.
					</Card>
					<Card icon="zap" title="Automated IP warmup">
						Volume ramps that protect your{" "}
						<Term href="/glossary/email-warmup">warmup</Term>.
					</Card>
				</div>
			</div>
		</section>
	);
}
