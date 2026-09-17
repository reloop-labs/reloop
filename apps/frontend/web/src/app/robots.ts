import { getSiteUrl } from "@reloop/web/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = getSiteUrl();

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/preferences/", "/redirect/", "/twitter", "/home"],
		},
		sitemap: [
			`${siteUrl}/sitemap.xml`,
			`${siteUrl}/glossary/sitemap.xml`,
			`${siteUrl}/docs/sitemap.xml`,
		],
	};
}
