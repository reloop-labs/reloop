export type InferredDnsProvider = {
	label: string;
	iconKey: string | null;
	url: string | null;
};

/** Match nameservers to a known registrar / DNS host for the auto-connect banner. */
export function inferDnsProvider(
	nameservers: string[] | null | undefined,
): InferredDnsProvider | null {
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

	let fallbackLabel = normalized[0] || "Unknown";
	try {
		const parts = fallbackLabel.split(".");
		if (parts.length >= 2) {
			let name = parts[parts.length - 2];
			if (name === "co" || name === "com" || name === "org" || name === "net") {
				name = parts[parts.length - 3] || parts[parts.length - 2];
			}
			if (name) {
				fallbackLabel = name.charAt(0).toUpperCase() + name.slice(1);
			}
		}
	} catch {
		// ignore parse errors
	}

	return {
		label: fallbackLabel,
		iconKey: null,
		url: null,
	};
}
