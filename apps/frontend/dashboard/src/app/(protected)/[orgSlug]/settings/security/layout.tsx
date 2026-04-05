import type { Metadata } from "next";

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
