export const getStatusBadgeStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case "active":
			return "border border-success-base text-success-base bg-success-light/20";
		case "suspended":
		case "failed":
			return "border border-error-base text-error-base bg-error-light/20";
		case "verifying":
			return "border border-warning-base text-warning-base bg-warning-light/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};

export const inferDnsProvider = (nameservers: string[] | null | undefined) => {
	if (!nameservers?.length) return null;

	const normalized = nameservers.map((server) => server.toLowerCase());

	if (normalized.some((server) => server.includes("cloudflare.com"))) {
		return {
			label: "Cloudflare",
			iconKey: "siCloudflare",
			url: "https://dash.cloudflare.com",
		};
	}
	if (normalized.some((server) => server.includes("awsdns-"))) {
		return {
			label: "AWS Route 53",
			iconKey: "siAmazonwebservices",
			url: "https://console.aws.amazon.com/route53",
		};
	}
	if (normalized.some((server) => server.includes("vercel-dns.com"))) {
		return {
			label: "Vercel",
			iconKey: "siVercel",
			url: "https://vercel.com/dashboard/domains",
		};
	}
	if (normalized.some((server) => server.includes("digitalocean.com"))) {
		return {
			label: "DigitalOcean",
			iconKey: "siDigitalocean",
			url: "https://cloud.digitalocean.com/networking/domains",
		};
	}
	if (normalized.some((server) => server.includes("domaincontrol.com"))) {
		return {
			label: "GoDaddy",
			iconKey: "siGodaddy",
			url: "https://dcc.godaddy.com/dns",
		};
	}
	if (normalized.some((server) => server.includes("registrar-servers.com"))) {
		return {
			label: "Namecheap",
			iconKey: "siNamecheap",
			url: "https://ap.www.namecheap.com/domains/list",
		};
	}
	// Google
	if (
		normalized.some(
			(server) =>
				server.includes("googledomains.com") || server.includes("google.com"),
		)
	) {
		return {
			label: "Google Domains",
			iconKey: "siGoogle",
			url: "https://domains.google.com",
		};
	}
	// Google Cloud DNS
	if (
		normalized.some(
			(server) =>
				server.includes("googledomains.com") || server.endsWith(".dns.goog"),
		)
	) {
		return {
			label: "Google Cloud DNS",
			iconKey: "siGooglecloud",
			url: "https://console.cloud.google.com/net-services/dns",
		};
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
		return {
			label: "Azure DNS",
			iconKey: "siMicrosoftazure",
			url: "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FdnsZones",
		};
	}
	// Netlify
	if (normalized.some((server) => server.includes("netlify.com"))) {
		return {
			label: "Netlify",
			iconKey: "siNetlify",
			url: "https://app.netlify.com/domains",
		};
	}
	// Hetzner
	if (
		normalized.some(
			(server) =>
				server.includes("hetzner.com") || server.includes("hetzner.de"),
		)
	) {
		return {
			label: "Hetzner",
			iconKey: "siHetzner",
			url: "https://dns.hetzner.com",
		};
	}
	// OVH
	if (
		normalized.some(
			(server) => server.includes("ovh.net") || server.includes("ovh.com"),
		)
	) {
		return {
			label: "OVH",
			iconKey: "siOvh",
			url: "https://www.ovh.com/manager",
		};
	}
	// Linode / Akamai
	if (normalized.some((server) => server.includes("linode.com"))) {
		return {
			label: "Linode",
			iconKey: "siLinode",
			url: "https://cloud.linode.com/domains",
		};
	}
	// Hostinger
	if (
		normalized.some(
			(server) =>
				server.includes("hostinger.") || server.includes("dns-parking.com"),
		)
	) {
		return {
			label: "Hostinger",
			iconKey: null,
			url: "https://hpanel.hostinger.com/domains",
		};
	}
	// Bluehost
	if (normalized.some((server) => server.includes("bluehost.com"))) {
		return {
			label: "Bluehost",
			iconKey: null,
			url: "https://my.bluehost.com/cgi/dm",
		};
	}
	// Squarespace (formerly Google Domains)
	if (
		normalized.some(
			(server) =>
				server.includes("squarespace.com") || server.includes("sqsp.net"),
		)
	) {
		return {
			label: "Squarespace",
			iconKey: "siSquarespace",
			url: "https://account.squarespace.com/domains",
		};
	}
	// Hover
	if (normalized.some((server) => server.includes("hover.com"))) {
		return {
			label: "Hover",
			iconKey: null,
			url: "https://www.hover.com/control_panel",
		};
	}
	// Gandi
	if (normalized.some((server) => server.includes("gandi.net"))) {
		return {
			label: "Gandi",
			iconKey: null,
			url: "https://admin.gandi.net/domain",
		};
	}
	// Name.com
	if (normalized.some((server) => server.includes("name.com"))) {
		return {
			label: "Name.com",
			iconKey: null,
			url: "https://www.name.com/account/domain",
		};
	}
	// Porkbun
	if (normalized.some((server) => server.includes("porkbun.com"))) {
		return {
			label: "Porkbun",
			iconKey: null,
			url: "https://porkbun.com/account/domainsSpe498702",
		};
	}
	// DynaDot
	if (normalized.some((server) => server.includes("dynadot.com"))) {
		return {
			label: "Dynadot",
			iconKey: null,
			url: "https://www.dynadot.com/account/domain/name/server.html",
		};
	}
	// Vultr
	if (normalized.some((server) => server.includes("vultr.com"))) {
		return {
			label: "Vultr",
			iconKey: "siVultr",
			url: "https://my.vultr.com/dns",
		};
	}
	// DNSimple
	if (normalized.some((server) => server.includes("dnsimple.com"))) {
		return {
			label: "DNSimple",
			iconKey: null,
			url: "https://dnsimple.com/dashboard",
		};
	}
	// NS1 / IBM
	if (normalized.some((server) => server.includes("nsone.net"))) {
		return { label: "NS1", iconKey: null, url: "https://my.nsone.net" };
	}
	// Dyn / Oracle
	if (normalized.some((server) => server.includes("dynect.net"))) {
		return {
			label: "Dyn (Oracle)",
			iconKey: "siOracle",
			url: "https://portal.dynect.net",
		};
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
		return {
			label: "IONOS",
			iconKey: null,
			url: "https://my.ionos.com/domains",
		};
	}
	// Alibaba Cloud
	if (
		normalized.some(
			(server) =>
				server.includes("alidns.com") || server.includes("hichina.com"),
		)
	) {
		return {
			label: "Alibaba Cloud",
			iconKey: "siAlibabacloud",
			url: "https://dns.console.aliyun.com",
		};
	}
	// Tencent Cloud / DNSPod
	if (
		normalized.some(
			(server) =>
				server.includes("dnspod.net") || server.includes("tencentdns.com"),
		)
	) {
		return {
			label: "Tencent Cloud",
			iconKey: "siTencentqq",
			url: "https://console.dnspod.cn",
		};
	}
	// Huawei Cloud
	if (
		normalized.some(
			(server) =>
				server.includes("huaweicloud-dns.com") ||
				server.includes("huaweicloud-dns.cn"),
		)
	) {
		return {
			label: "Huawei Cloud",
			iconKey: "siHuawei",
			url: "https://console.huaweicloud.com/dns",
		};
	}
	// Strato
	if (
		normalized.some(
			(server) =>
				server.includes("strato.de") || server.includes("strato-hosting.eu"),
		)
	) {
		return {
			label: "Strato",
			iconKey: null,
			url: "https://www.strato.de/apps/CustomerService",
		};
	}
	// Fasthosts
	if (normalized.some((server) => server.includes("fasthosts.co.uk"))) {
		return {
			label: "Fasthosts",
			iconKey: null,
			url: "https://www.fasthosts.co.uk/panel",
		};
	}
	// Wix
	if (normalized.some((server) => server.includes("wixdns.net"))) {
		return {
			label: "Wix",
			iconKey: "siWix",
			url: "https://www.wix.com/my-account/domains",
		};
	}
	// Shopify
	if (normalized.some((server) => server.includes("shopify.com"))) {
		return {
			label: "Shopify",
			iconKey: "siShopify",
			url: "https://admin.shopify.com/settings/domains",
		};
	}
	// Render
	if (normalized.some((server) => server.includes("render.com"))) {
		return {
			label: "Render",
			iconKey: "siRender",
			url: "https://dashboard.render.com",
		};
	}
	// Railway
	if (normalized.some((server) => server.includes("railway.app"))) {
		return {
			label: "Railway",
			iconKey: "siRailway",
			url: "https://railway.app/dashboard",
		};
	}
	// Fly.io
	if (normalized.some((server) => server.includes("fly.io"))) {
		return { label: "Fly.io", iconKey: null, url: "https://fly.io/dashboard" };
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

	return {
		label: fallbackLabel,
		iconKey: null as string | null,
		url: null as string | null,
	};
};
