export const siteName = "Reloop";

export const contactEmail = "reloop.sh@gmail.com";

/** Reloop hosted product signup */
export const hostedSignupHref = "/dashboard/signup";

export const siteDescription =
	"High-performance, open-source email infrastructure—the same service as proprietary platforms. Use Reloop hosted or deploy it yourself.";

export const defaultOgImage = "/web-app-manifest-512x512.png";

export const socialProfiles = {
	github: "https://github.com/reloop-labs/reloop",
	discord: "https://discord.gg/bHnkBcp7xR",
	x: "https://x.com/reloophq",
} as const;

export function getSiteUrl() {
	const url = process.env.NEXT_PUBLIC_URL ?? "https://reloop.sh";
	return url.replace(/\/$/, "");
}
