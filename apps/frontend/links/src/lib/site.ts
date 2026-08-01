export const siteName = "Reloop Links";

/** Canonical production host for the links app. */
export const siteUrl = "https://link.reloop.sh";

export const siteDescription = "Manage your email subscription preferences.";

export const defaultOgImage = "/web-app-manifest-512x512.png";

export const socialProfiles = {
	main: "https://reloop.sh",
	docs: "https://reloop.sh/docs",
	github: "https://github.com/reloop-labs/reloop",
	discord: "https://discord.gg/bHnkBcp7xR",
	x: "https://x.com/reloophq",
} as const;

function isLocalDevOrigin(url: string): boolean {
	try {
		const { hostname } = new URL(url);
		return (
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "local.reloop.sh" ||
			hostname.endsWith(".local.reloop.sh")
		);
	} catch {
		return false;
	}
}

/**
 * Public origin for this app (metadataBase, tracking same-origin calls).
 *
 * Production always resolves to https://link.reloop.sh unless NEXT_PUBLIC_URL
 * is an explicit non-local production origin. Local .env values must never
 * leak into production builds (NEXT_PUBLIC_* is inlined at build time).
 */
export function getSiteUrl() {
	const fromEnv = (process.env.NEXT_PUBLIC_URL || "").replace(/\/+$/, "");
	const isProd = process.env.NODE_ENV === "production";

	if (fromEnv) {
		// Ignore local.reloop.sh / localhost if somehow present in a prod build.
		if (isProd && isLocalDevOrigin(fromEnv)) {
			return siteUrl;
		}
		return fromEnv;
	}

	return isProd ? siteUrl : "https://local.reloop.sh";
}
