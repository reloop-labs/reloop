export const siteName = "Reloop Links";

/** Canonical production host for the links app. */
export const siteUrl = "https://link.reloop.sh";

export const siteDescription =
	"Manage your email subscription preferences.";

export const defaultOgImage = "/web-app-manifest-512x512.png";

export const socialProfiles = {
	main: "https://reloop.sh",
	docs: "https://reloop.sh/docs",
	github: "https://github.com/reloop-labs/reloop",
	discord: "https://discord.gg/bHnkBcp7xR",
	x: "https://x.com/reloophq",
} as const;

/**
 * Public origin for this app (and for same-origin `/api/mail/*` tracking routes).
 * Production: https://link.reloop.sh — custom domains CNAME here.
 */
export function getSiteUrl() {
	const url = process.env.NEXT_PUBLIC_URL || siteUrl;
	return url.replace(/\/+$/, "");
}
