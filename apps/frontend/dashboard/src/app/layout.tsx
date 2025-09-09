import type { Metadata } from "next";
import "./globals.css";
import SWRProvider from "@dashboard/providers/swr.config";
import { IconsSprite } from "@reloop/ui/icon";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});
export const metadata: Metadata = {
	title: "Reloop Dashboard",
	description: "Reloop Dashboard",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} bg-bg-white-0 text-text-strong-950 antialiased`}
			>
				<NuqsAdapter>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<SWRProvider>
							{children}
							<IconsSprite />
						</SWRProvider>
					</ThemeProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
}
