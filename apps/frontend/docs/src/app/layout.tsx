import "./global.css";
import { PostHogProvider } from "@reloop/analytics";
import { ThemeProvider } from "@reloop/fe-docs/components/theme-provider";
import { WebMcpTools } from "@reloop/fe-docs/components/webmcp-tools";
import { cn } from "@reloop/fe-docs/lib/cn";
import { docsWebMcpTools } from "@reloop/fe-docs/lib/webmcp/docs-tools";
import { IconsSprite } from "@reloop/ui/icons-sprite";
import {
	WebMcpOriginTrial,
	WebMcpRegistration,
} from "@reloop/webmcp/registration";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={cn(
				"touch-manipulation scroll-smooth antialiased",
				inter.className,
				inter.variable,
			)}
			suppressHydrationWarning
		>
			<head>
				<WebMcpOriginTrial />
				<WebMcpRegistration tools={docsWebMcpTools} />
			</head>
			<body
				className="flex min-h-screen flex-col overflow-x-hidden bg-bg-white-0 text-fd-foreground dark:bg-black"
				suppressHydrationWarning
			>
				<PostHogProvider>
					<ThemeProvider>{children}</ThemeProvider>
					<IconsSprite />
					<WebMcpTools />
				</PostHogProvider>
			</body>
		</html>
	);
}
