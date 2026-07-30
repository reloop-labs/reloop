import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl, siteDescription, siteName } from "@reloop/links/lib/site";
import { ThemeProvider } from "@reloop/links/providers/theme-provider";
import { IconsSprite } from "@reloop/ui/icons-sprite";
import { RybbitLoader } from "@reloop/ui/rybbit-loader";
import localFont from "next/font/local";
import { Suspense } from "react";

const openRunde = localFont({
	src: [
		{
			path: "../../public/font/openRunde/OpenRunde-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/font/openRunde/OpenRunde-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/font/openRunde/OpenRunde-Semibold.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../public/font/openRunde/OpenRunde-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-open-runde",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(getSiteUrl()),
	title: {
		default: siteName,
		template: `%s | ${siteName}`,
	},
	description: siteDescription,
	// Social cards: opengraph-image.tsx + twitter-image.tsx (poster, matches landing).
	openGraph: {
		type: "website",
		siteName,
		url: getSiteUrl(),
		title: siteName,
		description: siteDescription,
	},
	twitter: {
		card: "summary_large_image",
		title: siteName,
		description: siteDescription,
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
			className={`${openRunde.variable} overscroll-y-none scroll-auto`}
		>
			<body
				className="min-h-full overscroll-y-none bg-bg-white-0 text-text-strong-950 antialiased"
				style={{ fontFamily: "var(--font-open-runde)" }}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					// Keep .light / .dark on <html> so --retro-* tokens resolve correctly
					themes={["light", "dark"]}
					disableTransitionOnChange
				>
					{/* Suspense boundary required with cacheComponents for dynamic
					    params / uncached fetches (preferences, redirect tokens). */}
					<Suspense fallback={null}>{children}</Suspense>
					<IconsSprite />
					<RybbitLoader />
				</ThemeProvider>
			</body>
		</html>
	);
}
