export const siteName = "Reloop";
export const siteDescription = "Email preferences and link redirection";
export const defaultOgImage = "/web-app-manifest-512x512.png";

/**
 * Public origin for this app (and for same-origin `/api/mail/*` tracking routes).
 * Custom domains CNAME here; set NEXT_PUBLIC_URL per environment.
 */
export function getSiteUrl() {
	const url = process.env.NEXT_PUBLIC_URL || "https://local.reloop.sh";
	return url.replace(/\/+$/, "");
}
