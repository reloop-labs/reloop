export const siteName = "Reloop";
export const siteDescription = "Email preferences and link redirection";
export const defaultOgImage = "/web-app-manifest-512x512.png";

export function getSiteUrl() {
	const url = process.env.NEXT_PUBLIC_URL ?? "https://link.reloop.sh";
	return url.replace(/\/$/, "");
}
