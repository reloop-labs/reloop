export const siteName = "Reloop";

export const contactEmail = "reloop.sh@gmail.com";

/** Reloop hosted product signup */
export const hostedSignupHref = "/dashboard/signup";

export const siteDescription =
	"Open-source email infrastructure for developers: transactional email API, SMTP relay, campaigns, webhooks, and agent inboxes. Reloop Cloud or self-hosted.";

export const defaultOgImage = "/web-app-manifest-512x512.png";

export const socialImage = {
	url: "/opengraph-image",
	width: 1200,
	height: 630,
	alt: "Reloop, open-source email infrastructure for developers",
};

export const socialProfiles = {
	github: "https://github.com/reloop-labs/reloop",
	discord: "https://discord.gg/ZBYwWKY96U",
	x: "https://x.com/reloop_labs",
	linkedin: "https://www.linkedin.com/company/reloop-labs",
} as const;

/** Production marketing origin used in canonicals, sitemaps, and JSON-LD. */
export const productionSiteUrl = "https://reloop.sh";

function isLocalDevHost(url: string): boolean {
	try {
		const host = new URL(url).hostname.toLowerCase();
		return (
			host === "localhost" ||
			host === "127.0.0.1" ||
			host === "0.0.0.0" ||
			host.endsWith(".local") ||
			host.startsWith("local.") ||
			host.includes("local.reloop")
		);
	} catch {
		return false;
	}
}

/**
 * Public site origin for SEO (canonical, Open Graph, sitemap, JSON-LD).
 * Local/dev hosts never leak into absolute URLs — always use production.
 */
export function getSiteUrl() {
	// Explicit production override when set (e.g. preview deployments)
	const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
	if (publicUrl && !isLocalDevHost(publicUrl)) {
		return publicUrl;
	}

	const url = (process.env.NEXT_PUBLIC_URL ?? productionSiteUrl).replace(
		/\/$/,
		"",
	);

	// Dev: NEXT_PUBLIC_URL is often https://local.reloop.sh — keep browsing local,
	// but never publish that host in metadata/sitemaps.
	if (isLocalDevHost(url)) {
		return productionSiteUrl;
	}

	return url;
}
