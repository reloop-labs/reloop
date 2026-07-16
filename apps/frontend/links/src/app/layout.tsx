import type { Metadata } from "next";
import "./globals.css";
import {
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
} from "@reloop/links/lib/site";
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
	openGraph: {
		type: "website",
		siteName,
		images: [{ url: defaultOgImage, width: 512, height: 512, alt: siteName }],
	},
	twitter: {
		card: "summary_large_image",
		images: [defaultOgImage],
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
				className="min-h-full overscroll-y-none bg-bg-white-0 antialiased"
				style={{ fontFamily: "var(--font-open-runde)" }}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
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
