/** Public docs base for domain / DNS help. */
export const DNS_DOCS_BASE = "https://reloop.sh/docs/guides";

/** Hub listing every provider-specific DNS guide. */
export const DNS_SETUP_HUB_URL = `${DNS_DOCS_BASE}/dns-setup`;

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
	/** Guides slug without prefix, e.g. `dns-cloudflare`. */
	docsSlug: string | null;
};

function guideUrl(slug: string): string {
	return `${DNS_DOCS_BASE}/${slug}`;
}

function provider(
	partial: Omit<InferredDnsProvider, "docsUrl"> & {
		docsSlug: string | null;
	},
): InferredDnsProvider {
	return {
		...partial,
		docsUrl: partial.docsSlug
			? guideUrl(partial.docsSlug)
			: DNS_SETUP_HUB_URL,
	};
}

/**
 * Match nameservers to a known registrar / DNS host.
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
			docsSlug: "dns-cloudflare",
		});
	}
	if (normalized.some((server) => server.includes("awsdns-"))) {
		return provider({
			label: "AWS Route 53",
			iconKey: "siAmazonwebservices",
			url: "https://console.aws.amazon.com/route53",
			docsSlug: "dns-route53",
		});
	}
	if (normalized.some((server) => server.includes("vercel-dns.com"))) {
		return provider({
			label: "Vercel",
			iconKey: "siVercel",
			url: "https://vercel.com/dashboard/domains",
			docsSlug: "dns-vercel",
		});
	}
	if (normalized.some((server) => server.includes("digitalocean.com"))) {
		return provider({
			label: "DigitalOcean",
			iconKey: "siDigitalocean",
			url: "https://cloud.digitalocean.com/networking/domains",
			docsSlug: null,
		});
	}
	if (normalized.some((server) => server.includes("domaincontrol.com"))) {
		return provider({
			label: "GoDaddy",
			iconKey: "siGodaddy",
			url: "https://dcc.godaddy.com/dns",
			docsSlug: "dns-godaddy",
		});
	}
	if (normalized.some((server) => server.includes("registrar-servers.com"))) {
		return provider({
			label: "Namecheap",
			iconKey: "siNamecheap",
			url: "https://ap.www.namecheap.com/domains/list",
			docsSlug: "dns-namecheap",
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
		// Prefer Squarespace guide — Google Domains was migrated there
		if (
			normalized.some(
				(server) =>
					server.includes("squarespace.com") || server.includes("sqsp.net"),
			)
		) {
			return provider({
				label: "Squarespace",
				iconKey: "siSquarespace",
				url: "https://account.squarespace.com/domains",
				docsSlug: "dns-squarespace",
			});
		}
		return provider({
			label: "Google Domains",
			iconKey: "siGoogle",
			url: "https://domains.google.com",
			docsSlug: "dns-squarespace",
		});
	}
	// Google Cloud DNS
	if (normalized.some((server) => server.endsWith(".dns.goog"))) {
		return provider({
			label: "Google Cloud DNS",
			iconKey: "siGooglecloud",
			url: "https://console.cloud.google.com/net-services/dns",
			docsSlug: null,
		});
	}
	// Azure
	if (
		normalized.some(
			(server) =>
				server.includes("azure-dns.com") ||
				server.includes("azure-dns.net") ||
				server.includes("azure-dns.org") ||
				server.includes("azure-dns.info"),
		)
	) {
		return provider({
			label: "Azure DNS",
			iconKey: "siMicrosoftazure",
			url: "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FdnsZones",
			docsSlug: null,
		});
	}
	// Netlify
	if (normalized.some((server) => server.includes("netlify.com"))) {
		return provider({
			label: "Netlify",
			iconKey: "siNetlify",
			url: "https://app.netlify.com/domains",
			docsSlug: null,
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
			docsSlug: "dns-hetzner",
		});
	}
	// OVH
	if (
		normalized.some(
			(server) => server.includes("ovh.net") || server.includes("ovh.com"),
		)
	) {
		return provider({
			label: "OVH",
			iconKey: "siOvh",
			url: "https://www.ovh.com/manager",
			docsSlug: null,
		});
	}
	// Linode / Akamai
	if (normalized.some((server) => server.includes("linode.com"))) {
		return provider({
			label: "Linode",
			iconKey: "siLinode",
			url: "https://cloud.linode.com/domains",
			docsSlug: null,
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
			docsSlug: "dns-hostinger",
		});
	}
	// Bluehost
	if (normalized.some((server) => server.includes("bluehost.com"))) {
		return provider({
			label: "Bluehost",
			iconKey: null,
			url: "https://my.bluehost.com/cgi/dm",
			docsSlug: null,
		});
	}
	// Hover
	if (normalized.some((server) => server.includes("hover.com"))) {
		return provider({
			label: "Hover",
			iconKey: null,
			url: "https://www.hover.com/control_panel",
			docsSlug: null,
		});
	}
	// Gandi
	if (normalized.some((server) => server.includes("gandi.net"))) {
		return provider({
			label: "Gandi",
			iconKey: null,
			url: "https://admin.gandi.net/domain",
			docsSlug: "dns-gandi",
		});
	}
	// Name.com
	if (normalized.some((server) => server.includes("name.com"))) {
		return provider({
			label: "Name.com",
			iconKey: null,
			url: "https://www.name.com/account/domain",
			docsSlug: null,
		});
	}
	// Porkbun
	if (normalized.some((server) => server.includes("porkbun.com"))) {
		return provider({
			label: "Porkbun",
			iconKey: null,
			url: "https://porkbun.com/account/domains",
			docsSlug: "dns-porkbun",
		});
	}
	// DynaDot
	if (normalized.some((server) => server.includes("dynadot.com"))) {
		return provider({
			label: "Dynadot",
			iconKey: null,
			url: "https://www.dynadot.com/account/domain/name/server.html",
			docsSlug: null,
		});
	}
	// Vultr
	if (normalized.some((server) => server.includes("vultr.com"))) {
		return provider({
			label: "Vultr",
			iconKey: "siVultr",
			url: "https://my.vultr.com/dns",
			docsSlug: null,
		});
	}
	// DNSimple
	if (normalized.some((server) => server.includes("dnsimple.com"))) {
		return provider({
			label: "DNSimple",
			iconKey: null,
			url: "https://dnsimple.com/dashboard",
			docsSlug: null,
		});
	}
	// NS1 / IBM
	if (normalized.some((server) => server.includes("nsone.net"))) {
		return provider({
			label: "NS1",
			iconKey: null,
			url: "https://my.nsone.net",
			docsSlug: null,
		});
	}
	// Dyn / Oracle
	if (normalized.some((server) => server.includes("dynect.net"))) {
		return provider({
			label: "Dyn (Oracle)",
			iconKey: "siOracle",
			url: "https://portal.dynect.net",
			docsSlug: null,
		});
	}
	// Ionos (1&1)
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
			docsSlug: "dns-ionos",
		});
	}
	// Alibaba Cloud
	if (
		normalized.some(
			(server) =>
				server.includes("alidns.com") || server.includes("hichina.com"),
		)
	) {
		return provider({
			label: "Alibaba Cloud",
			iconKey: "siAlibabacloud",
			url: "https://dns.console.aliyun.com",
			docsSlug: null,
		});
	}
	// Tencent Cloud / DNSPod
	if (
		normalized.some(
			(server) =>
				server.includes("dnspod.net") || server.includes("tencentdns.com"),
		)
	) {
		return provider({
			label: "Tencent Cloud",
			iconKey: "siTencentqq",
			url: "https://console.dnspod.cn",
			docsSlug: null,
		});
	}
	// Huawei Cloud
	if (
		normalized.some(
			(server) =>
				server.includes("huaweicloud-dns.com") ||
				server.includes("huaweicloud-dns.cn"),
		)
	) {
		return provider({
			label: "Huawei Cloud",
			iconKey: "siHuawei",
			url: "https://console.huaweicloud.com/dns",
			docsSlug: null,
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
			docsSlug: "dns-strato",
		});
	}
	// Fasthosts
	if (normalized.some((server) => server.includes("fasthosts.co.uk"))) {
		return provider({
			label: "Fasthosts",
			iconKey: null,
			url: "https://www.fasthosts.co.uk/panel",
			docsSlug: null,
		});
	}
	// Wix
	if (normalized.some((server) => server.includes("wixdns.net"))) {
		return provider({
			label: "Wix",
			iconKey: "siWix",
			url: "https://www.wix.com/my-account/domains",
			docsSlug: null,
		});
	}
	// Shopify
	if (normalized.some((server) => server.includes("shopify.com"))) {
		return provider({
			label: "Shopify",
			iconKey: "siShopify",
			url: "https://admin.shopify.com/settings/domains",
			docsSlug: null,
		});
	}
	// Render
	if (normalized.some((server) => server.includes("render.com"))) {
		return provider({
			label: "Render",
			iconKey: "siRender",
			url: "https://dashboard.render.com",
			docsSlug: null,
		});
	}
	// Railway
	if (normalized.some((server) => server.includes("railway.app"))) {
		return provider({
			label: "Railway",
			iconKey: "siRailway",
			url: "https://railway.app/dashboard",
			docsSlug: null,
		});
	}
	// Fly.io
	if (normalized.some((server) => server.includes("fly.io"))) {
		return provider({
			label: "Fly.io",
			iconKey: null,
			url: "https://fly.io/dashboard",
			docsSlug: null,
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
			docsSlug: "dns-dreamhost",
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
