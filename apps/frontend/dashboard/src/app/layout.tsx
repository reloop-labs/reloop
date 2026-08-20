import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../styles.css";
import { Providers } from "./providers";

// TODO: Remove this opt-out after the dashboard supports Cache Components.
export const instant = false;

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const geistSans = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
	display: "swap",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
	display: "swap",
});

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
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
		>
			<body
				className="bg-bg-white-0 font-sans text-text-strong-950 antialiased"
				style={{
					fontFamily:
						"var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
				}}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
