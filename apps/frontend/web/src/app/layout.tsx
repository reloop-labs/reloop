import type { Metadata } from "next";
import "./globals.css";
import { IconsSprite } from "@reloop/ui/components/icon";
import { Footer } from "@web/components/footer";
import { Header } from "@web/components/header";
import { ThemeProvider } from "next-themes";

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
		<html lang="en" suppressHydrationWarning>
			<body className={"bg-bg-white-0 text-text-strong-950 antialiased"}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Header />
					{children}
					<div className="mt-10">
						<Footer />
					</div>
					<IconsSprite />
				</ThemeProvider>
			</body>
		</html>
	);
}
