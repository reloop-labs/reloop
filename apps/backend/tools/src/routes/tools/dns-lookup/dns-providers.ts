export interface DnsProviderInfo {
	id: string;
	name: string;
	website: string;
	category: "managed_dns" | "cloud" | "registrar" | "cdn" | "hosting";
	description: string;
}

const PROVIDER_PATTERNS: Array<{
	id: string;
	name: string;
	website: string;
	category: DnsProviderInfo["category"];
	description: string;
	patterns: RegExp[];
}> = [
	{
		id: "cloudflare",
		name: "Cloudflare",
		website: "https://www.cloudflare.com",
		category: "cdn",
		description: "Global cloud network and authoritative DNS provider with built-in proxy and DDoS protection.",
		patterns: [/cloudflare\.com$/i, /cloudflare\.net$/i],
	},
	{
		id: "aws-route53",
		name: "AWS Route 53",
		website: "https://aws.amazon.com/route53/",
		category: "cloud",
		description: "Amazon Web Services scalable authoritative cloud Domain Name System (DNS) web service.",
		patterns: [/awsdns-\d+\.(?:com|net|org|co\.uk)$/i, /route53/i],
	},
	{
		id: "google-cloud-dns",
		name: "Google Cloud DNS",
		website: "https://cloud.google.com/dns",
		category: "cloud",
		description: "Scalable, reliable, and managed authoritative Domain Name System (DNS) service running on Google’s infrastructure.",
		patterns: [/googledomains\.com$/i, /google\.com$/i, /dns\.google$/i],
	},
	{
		id: "azure-dns",
		name: "Microsoft Azure DNS",
		website: "https://azure.microsoft.com/services/dns/",
		category: "cloud",
		description: "Host your DNS domains in Microsoft Azure for name resolution using Azure infrastructure.",
		patterns: [/azure-dns\.(?:com|net|org|info)$/i],
	},
	{
		id: "godaddy",
		name: "GoDaddy",
		website: "https://www.godaddy.com",
		category: "registrar",
		description: "Domain registrar and hosting company providing standard and premium DNS services.",
		patterns: [/domaincontrol\.com$/i, /godaddy\.com$/i],
	},
	{
		id: "namecheap",
		name: "Namecheap",
		website: "https://www.namecheap.com",
		category: "registrar",
		description: "Domain name registrar and web hosting company providing FreeDNS and BasicDNS.",
		patterns: [/registrar-servers\.com$/i, /namecheaphosting\.com$/i],
	},
	{
		id: "vercel",
		name: "Vercel DNS",
		website: "https://vercel.com",
		category: "managed_dns",
		description: "Global edge network DNS managed automatically by Vercel for frontend deployments.",
		patterns: [/vercel-dns\.com$/i, /zeit\.world$/i],
	},
	{
		id: "netlify",
		name: "Netlify DNS",
		website: "https://www.netlify.com",
		category: "managed_dns",
		description: "Premium managed DNS service powered by NS1 for Netlify hosting and applications.",
		patterns: [/netlify\.com$/i],
	},
	{
		id: "digitalocean",
		name: "DigitalOcean",
		website: "https://www.digitalocean.com",
		category: "cloud",
		description: "Cloud infrastructure provider offering free Anycast DNS management for droplets and domains.",
		patterns: [/digitalocean\.com$/i],
	},
	{
		id: "hetzner",
		name: "Hetzner",
		website: "https://www.hetzner.com",
		category: "hosting",
		description: "European cloud and dedicated server host with Anycast DNS console management.",
		patterns: [/hetzner\.(?:com|de)$/i, /your-server\.de$/i],
	},
	{
		id: "ovh",
		name: "OVHcloud",
		website: "https://www.ovhcloud.com",
		category: "cloud",
		description: "Global cloud and hosting provider offering Anycast DNS and domain management.",
		patterns: [/ovh\.net$/i, /ovhcloud\.com$/i],
	},
	{
		id: "hostinger",
		name: "Hostinger",
		website: "https://www.hostinger.com",
		category: "hosting",
		description: "Web hosting and domain registration platform with custom DNS management.",
		patterns: [/dns-parking\.com$/i, /hostinger\.com$/i, /hostinger\.in$/i],
	},
	{
		id: "squarespace",
		name: "Squarespace Domains",
		website: "https://www.squarespace.com",
		category: "registrar",
		description: "Domain registrar and website builder (formerly Google Domains registrar migration).",
		patterns: [/squarespacedns\.com$/i],
	},
	{
		id: "dnsimple",
		name: "DNSimple",
		website: "https://dnsimple.com",
		category: "managed_dns",
		description: "Dedicated developer-friendly DNS management and domain automation platform.",
		patterns: [/dnsimple\.com$/i],
	},
	{
		id: "ns1",
		name: "NS1 (IBM)",
		website: "https://ns1.com",
		category: "managed_dns",
		description: "Next-generation intelligent DNS and traffic steering platform.",
		patterns: [/nsone\.net$/i, /ns1\.com$/i],
	},
	{
		id: "porkbun",
		name: "Porkbun",
		website: "https://porkbun.com",
		category: "registrar",
		description: "Independent domain registrar with free DNS management and URL forwarding.",
		patterns: [/porkbun\.com$/i],
	},
];

export function detectDnsProvider(nameservers: string[]): DnsProviderInfo | null {
	if (!nameservers || nameservers.length === 0) return null;

	for (const ns of nameservers) {
		const cleanNs = ns.toLowerCase().trim().replace(/\.$/, "");
		for (const provider of PROVIDER_PATTERNS) {
			if (provider.patterns.some((p) => p.test(cleanNs))) {
				return {
					id: provider.id,
					name: provider.name,
					website: provider.website,
					category: provider.category,
					description: provider.description,
				};
			}
		}
	}

	return null;
}
