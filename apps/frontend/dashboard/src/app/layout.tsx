import type { Metadata } from "next";
import "../styles.css";
import { Providers } from "./providers";

// TODO: Remove this opt-out after the dashboard supports Cache Components.
export const instant = false;

export const metadata: Metadata = {
	title: {
		default: "Reloop Dashboard",
		template: "%s | Reloop Dashboard",
	},
	description:
		"Manage your email infrastructure, sending domains, API keys, and transactional emails with the Reloop Developer Dashboard.",
	manifest: "/dashboard/manifest.json",
	icons: {
		icon: [
			{ url: "/dashboard/favicon.ico" },
			{ url: "/dashboard/icon.svg", type: "image/svg+xml" },
		],
		apple: "/dashboard/apple-icon.png",
	},
	openGraph: {
		title: "Reloop Dashboard",
		description:
			"Manage your email infrastructure, sending domains, API keys, and transactional emails with the Reloop Developer Dashboard.",
		type: "website",
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop Dashboard",
		description:
			"Manage your email infrastructure, sending domains, API keys, and transactional emails with the Reloop Developer Dashboard.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-bg-white-0 font-sans text-text-strong-950 antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
