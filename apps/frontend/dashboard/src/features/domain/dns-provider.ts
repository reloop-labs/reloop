/** Public docs base for domain / DNS help. */
export const DNS_DOCS_BASE = "https://reloop.sh/docs/guides/connect-domain/providers";

/** Hub listing every provider-specific DNS guide. */
export const DNS_SETUP_HUB_URL = DNS_DOCS_BASE;

/** Product overview for domains (not provider-specific). */
export const DOMAIN_LEARN_DOCS_URL = "https://reloop.sh/docs/learn/domain";

export type InferredDnsProvider = {
	label: string;
	iconKey: string | null;
	/** Deep link into the provider's DNS console, when known. */
	url: string | null;
	/**
	 * Reloop guides page for this provider, when one exists.
	 * Falls back to the DNS setup hub for unknown providers.
	 */
	docsUrl: string;
	/** Provider guide slug under /docs/guides/connect-domain/providers, e.g. `cloudflare`. */
	docsSlug: string | null;
	/**
	 * True when this DNS host has onboarded Reloop's Domain Connect
	 * template (`reloop.sh` / `email-setup`). Currently: Cloudflare,
	 * Vercel, Domain Chief, NameSilo. Click still re-checks via live
	 * discovery as a safety net.
	 * @see https://www.domainconnect.org/dns-providers/
	 */
	supportsAutoConnect: boolean;
};

function guideUrl(slug: string): string {
	return `${DNS_DOCS_BASE}/${slug}`;
}

function provider(
	partial: Omit<InferredDnsProvider, "docsUrl" | "supportsAutoConnect"> & {
		docsSlug: string | null;
		supportsAutoConnect?: boolean;
	},
): InferredDnsProvider {
	return {
		...partial,
		docsUrl: partial.docsSlug
			? guideUrl(partial.docsSlug)
			: DNS_SETUP_HUB_URL,
		supportsAutoConnect: partial.supportsAutoConnect ?? false,
	};
}

/**
 * Match nameservers to a known registrar / DNS host.
 * Includes popular hosts Reloop documents plus Domain Connect providers
 * (@see https://www.domainconnect.org/dns-providers/).
 * Used for auto-connect banners, provider chips, and docs deep-links.
 */
export function inferDnsProvider(
	nameservers: string[] | null | undefined,
): InferredDnsProvider | null {
	if (!nameservers?.length) return null;

	const normalized = nameservers.map((server) => server.toLowerCase());

	if (normalized.some((server) => server.includes("cloudflare.com"))) {
		return provider({
			label: "Cloudflare",
			iconKey: "siCloudflare",
			url: "https://dash.cloudflare.com",
			docsSlug: "cloudflare",
			supportsAutoConnect: true,
		});
	}
	if (normalized.some((server) => server.includes("awsdns-"))) {
		return provider({
			label: "AWS Route 53",
			iconKey: "siAmazonwebservices",
			url: "https://console.aws.amazon.com/route53",
			docsSlug: "route53",
		});
	}
	if (normalized.some((server) => server.includes("vercel-dns.com"))) {
		return provider({
			label: "Vercel",
			iconKey: "siVercel",
			url: "https://vercel.com/dashboard/domains",
			docsSlug: "vercel",
			supportsAutoConnect: true,
		});
	}
	// Domain Chief (Chief Tools) — Domain Connect
	if (normalized.some((server) => server.includes("domainchief."))) {
		return provider({
			label: "Domain Chief",
			iconKey: null,
			url: "https://domain.chief.app",
			docsSlug: "domain-chief",
			supportsAutoConnect: true,
		});
	}
	// NameSilo (dnsowl) + NameSilo hosting (hostsilo) — Domain Connect
	if (
		normalized.some(
			(server) =>
				server.includes("dnsowl.com") || server.includes("hostsilo.com"),
		)
	) {
		return provider({
			label: "NameSilo",
			iconKey: null,
			url: "https://www.namesilo.com/account_domain.php",
			docsSlug: "namesilo",
			supportsAutoConnect: true,
		});
	}
	if (normalized.some((server) => server.includes("domaincontrol.com"))) {
		return provider({
			label: "GoDaddy",
			iconKey: "siGodaddy",
			url: "https://dcc.godaddy.com/dns",
			docsSlug: "godaddy",
		});
	}
	if (normalized.some((server) => server.includes("registrar-servers.com"))) {
		return provider({
			label: "Namecheap",
			iconKey: "siNamecheap",
			url: "https://ap.www.namecheap.com/domains/list",
			docsSlug: "namecheap",
		});
	}
	// Google Domains (legacy) / Squarespace-managed Google transfers often still use googledomains NS
	if (
		normalized.some(
			(server) =>
				server.includes("googledomains.com") ||
				server.includes("squarespace.com") ||
				server.includes("sqsp.net"),
		)
	) {
		return provider({
			label: "Squarespace",
			iconKey: "siSquarespace",
			url: "https://account.squarespace.com/domains",
			docsSlug: "squarespace",
		});
	}
	// Hetzner
	if (
		normalized.some(
			(server) =>
				server.includes("hetzner.com") || server.includes("hetzner.de"),
		)
	) {
		return provider({
			label: "Hetzner",
			iconKey: "siHetzner",
			url: "https://dns.hetzner.com",
			docsSlug: "hetzner",
		});
	}
	// Hostinger
	if (
		normalized.some(
			(server) =>
				server.includes("hostinger.") || server.includes("dns-parking.com"),
		)
	) {
		return provider({
			label: "Hostinger",
			iconKey: null,
			url: "https://hpanel.hostinger.com/domains",
			docsSlug: "hostinger",
		});
	}
	// Gandi
	if (normalized.some((server) => server.includes("gandi.net"))) {
		return provider({
			label: "Gandi",
			iconKey: null,
			url: "https://admin.gandi.net/domain",
			docsSlug: "gandi",
		});
	}
	// Porkbun
	if (normalized.some((server) => server.includes("porkbun.com"))) {
		return provider({
			label: "Porkbun",
			iconKey: null,
			url: "https://porkbun.com/account/domains",
			docsSlug: "porkbun",
		});
	}
	// Ionos (1&1) — Domain Connect
	if (
		normalized.some(
			(server) =>
				server.includes("ui-dns.com") ||
				server.includes("ui-dns.de") ||
				server.includes("ui-dns.org") ||
				server.includes("ui-dns.biz"),
		)
	) {
		return provider({
			label: "IONOS",
			iconKey: null,
			url: "https://my.ionos.com/domains",
			docsSlug: "ionos",
		});
	}
	// Strato
	if (
		normalized.some(
			(server) =>
				server.includes("strato.de") || server.includes("strato-hosting.eu"),
		)
	) {
		return provider({
			label: "Strato",
			iconKey: null,
			url: "https://www.strato.de/apps/CustomerService",
			docsSlug: "strato",
		});
	}
	// DreamHost
	if (
		normalized.some(
			(server) =>
				server.includes("dreamhost.com") || server.includes("dreamhosters.com"),
		)
	) {
		return provider({
			label: "DreamHost",
			iconKey: null,
			url: "https://panel.dreamhost.com",
			docsSlug: "dreamhost",
		});
	}
	// Glauca Digital / HexDNS — Domain Connect
	if (
		normalized.some(
			(server) =>
				server.includes("as207960.net") || server.includes("glauca.digital"),
		)
	) {
		return provider({
			label: "Glauca Digital",
			iconKey: null,
			url: "https://domains.glauca.digital",
			docsSlug: "glauca-digital",
		});
	}
	// WordPress.com — Domain Connect
	if (
		normalized.some(
			(server) =>
				server.includes("wordpress.com") || server.includes(".wp.com"),
		)
	) {
		return provider({
			label: "WordPress.com",
			iconKey: "siWordpress",
			url: "https://wordpress.com/domains/manage",
			docsSlug: "wordpress-com",
		});
	}
	// Plesk — Domain Connect (hosted panels often use custom NS)
	if (normalized.some((server) => server.includes("plesk"))) {
		return provider({
			label: "Plesk",
			iconKey: null,
			url: null,
			docsSlug: "plesk",
		});
	}

	// Fallback: extract domain name from the first nameserver (e.g., ns.udag.org -> Udag)
	let fallbackLabel = normalized[0] || "Unknown";
	try {
		const parts = fallbackLabel.split(".");
		if (parts.length >= 2) {
			let name = parts[parts.length - 2];
			// basic attempt to skip tlds like co.uk
			if (name === "co" || name === "com" || name === "org" || name === "net") {
				name = parts[parts.length - 3] || parts[parts.length - 2];
			}
			if (name) {
				fallbackLabel = name.charAt(0).toUpperCase() + name.slice(1);
			}
		}
	} catch {
		// Ignore any parsing errors
	}

	return provider({
		label: fallbackLabel,
		iconKey: null,
		url: null,
		docsSlug: null,
	});
}
