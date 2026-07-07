import { getSiteUrl } from "@reloop/web/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = getSiteUrl();

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/preferences/", "/redirect/"],
		},
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
