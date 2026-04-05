import type { Metadata } from "next";

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
