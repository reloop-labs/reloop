import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@reloop/analytics";
import { IconsSprite } from "@reloop/ui/icons-sprite";
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
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
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
			className={`${inter.variable} overscroll-y-none scroll-auto`}
		>
			<head>
				<Script
					id="manifest-loader"
					strategy="afterInteractive"
				>{`var l=document.createElement('link');l.rel='manifest';l.href='/manifest.json';document.head.appendChild(l)`}</Script>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-full overscroll-y-none bg-bg-white-0 antialiased`}
				style={{ fontFamily: "var(--font-inter), sans-serif" }}
			>
				<PostHogProvider>
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
					</ThemeProvider>
				</PostHogProvider>
			</body>
		</html>
	);
}
