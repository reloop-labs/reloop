import type { Metadata } from "next";
import "./globals.css";
import SWRProvider from "@fe/console/providers/swr.config";
import { ThemeProvider } from "@fe/console/providers/theme-provider";
import { IconsSprite } from "@reloop/ui/icons-sprite";
import { Toaster } from "@reloop/ui/toast";
import * as Tooltip from "@reloop/ui/tooltip";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

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
});

export const metadata: Metadata = {
	title: "Reloop Console",
	description: "Reloop Platform Console",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${openRunde.variable} bg-bg-white-0 font-sans text-text-strong-950 antialiased`}
			>
				<NuqsAdapter>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<SWRProvider>
							<Tooltip.Provider>
								<Suspense>{children}</Suspense>
							</Tooltip.Provider>
							<IconsSprite />
							<Toaster />
						</SWRProvider>
					</ThemeProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
}
