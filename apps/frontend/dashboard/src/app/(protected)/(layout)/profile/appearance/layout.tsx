import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Appearance · Reloop",
	description:
		"Customize your dashboard appearance with theme and display preferences.",
	openGraph: {
		title: "Appearance · Reloop",
		description:
			"Customize your dashboard appearance with theme and display preferences.",
		type: "website",
	},
};

export default function AppearanceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
