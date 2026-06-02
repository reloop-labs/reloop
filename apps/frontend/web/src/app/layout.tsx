import type { Metadata } from "next";
import "./globals.css";
import { ChatwootLoader } from "@reloop/ui/chatwoot-loader";
import { IconsSprite } from "@reloop/ui/icon";
import { ThemeProvider } from "@reloop/web/providers/theme-provider";
import {
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
} from "@reloop/web/lib/site";
import localFont from "next/font/local";

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
		<html lang="en" suppressHydrationWarning className={openRunde.variable}>
			<body
				className="bg-bg-white-0 antialiased"
				style={{ fontFamily: "var(--font-open-runde)" }}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<IconsSprite />
					<ChatwootLoader />
				</ThemeProvider>
			</body>
		</html>
	);
}
