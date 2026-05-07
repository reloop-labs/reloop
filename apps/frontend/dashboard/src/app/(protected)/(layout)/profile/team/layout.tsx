import type { Metadata } from "next";

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
