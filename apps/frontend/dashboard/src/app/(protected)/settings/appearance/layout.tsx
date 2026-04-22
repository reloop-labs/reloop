import type { Metadata } from "next";

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
