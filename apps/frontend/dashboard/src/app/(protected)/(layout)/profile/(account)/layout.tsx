import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export function generateMetadata(): Metadata {
	return {
		title: "Account · Reloop",
		description:
			"Manage your personal account settings, profile, and preferences.",
		openGraph: {
			title: "Account · Reloop",
			description:
				"Manage your personal account settings, profile, and preferences.",
			type: "website",
		},
	};
}

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
