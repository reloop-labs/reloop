import type { Metadata } from "next";
import "./globals.css";
import { IconsSprite } from "@reloop/ui/icon";
import { ThemeProvider } from "@reloop/web/providers/theme-provider";
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
	title: "Reloop",
	description:
		"An open-source & self-hostable SendGrid / Mailchimp / Resend / Loops alternative.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={openRunde.variable}>
			<body
				className="bg-black text-white antialiased"
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
				</ThemeProvider>
			</body>
		</html>
	);
}
