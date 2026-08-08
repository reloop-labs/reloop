import type { Metadata } from "next";
import "./globals.css";
import { IconsSprite } from "@reloop/ui/icons-sprite";
import { RybbitLoader } from "@reloop/ui/rybbit-loader";
import { AgentDirective } from "@reloop/web/components/agent-directive";
import { Footer } from "@reloop/web/components/footer";
import { Header } from "@reloop/web/components/header";
import {
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
} from "@reloop/web/lib/site";
import { ThemeProvider } from "@reloop/web/providers/theme-provider";
import localFont from "next/font/local";
import Script from "next/script";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
	keywords: [
		"email infrastructure",
		"open source email",
		"self-hosted email",
		"email API",
		"transactional email",
		"email campaigns",
		"SMTP relay",
		"Reloop",
		"sendgrid alternative",
		"resend alternative",
	],
	alternates: { canonical: getSiteUrl() },
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
			<head>
				<Script
					id="manifest-loader"
					strategy="afterInteractive"
				>{`var l=document.createElement('link');l.rel='manifest';l.href='/manifest.json';document.head.appendChild(l)`}</Script>
			</head>
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
					{/*
					  Main before header in DOM for earlier content-start in agent HTML→text
					  conversion; CSS order keeps header on top visually.
					*/}
					<div className="flex min-h-full flex-col">
						<main className="relative order-2 flex-1">
							<AgentDirective />
							{children}
						</main>
						<div className="order-1">
							<Header />
						</div>
						<div className="order-3">
							<Footer />
						</div>
					</div>
					<IconsSprite />
					<RybbitLoader />
				</ThemeProvider>
			</body>
		</html>
	);
}
