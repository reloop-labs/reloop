import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export function generateMetadata(): Metadata {
	return {
		title: "Team · Reloop",
		description:
			"Manage workspace members, set access levels, and invite new users.",
		openGraph: {
			title: "Team · Reloop",
			description:
				"Manage workspace members, set access levels, and invite new users.",
			type: "website",
		},
	};
}

export default function TeamLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
