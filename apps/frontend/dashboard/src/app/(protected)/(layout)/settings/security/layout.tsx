import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export function generateMetadata(): Metadata {
	return {
		title: "Security · Reloop",
		description:
			"Manage your account security, connected accounts, and active sessions.",
		openGraph: {
			title: "Security · Reloop",
			description:
				"Manage your account security, connected accounts, and active sessions.",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: "Security · Reloop",
			description:
				"Manage your account security, connected accounts, and active sessions.",
		},
	};
}

export default function SecurityLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
