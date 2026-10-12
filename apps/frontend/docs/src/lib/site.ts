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
 * Local/dev hosts never leak into absolute URLs; always use production.
 * Mirrors getSiteUrl() in apps/frontend/web/src/lib/site.ts.
 */
export function getSiteUrl() {
	// Explicit production override when set (e.g. preview deployments)
	const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
	if (publicUrl && !isLocalDevHost(publicUrl)) {
		return publicUrl;
	}

	const url = (process.env.NEXT_PUBLIC_URL || productionSiteUrl).replace(
		/\/$/,
		"",
	);

	// Dev: NEXT_PUBLIC_URL is often https://local.reloop.sh; keep browsing local,
	// but never publish that host in metadata/sitemaps.
	if (isLocalDevHost(url)) {
		return productionSiteUrl;
	}

	return url;
}
