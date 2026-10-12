import { getSiteUrl } from "@reloop/web/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = getSiteUrl();

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// /home is noindex; it must stay crawlable so Google can see that.
			disallow: ["/preferences/", "/redirect/", "/twitter"],
		},
		sitemap: [
			`${siteUrl}/sitemap.xml`,
			`${siteUrl}/glossary/sitemap.xml`,
			`${siteUrl}/docs/sitemap.xml`,
		],
	};
}
