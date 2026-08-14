import "./global.css";
import { PostHogProvider } from "@reloop/analytics";
import { ThemeProvider } from "@reloop/fe-docs/components/theme-provider";
import { cn } from "@reloop/fe-docs/lib/cn";
import { IconsSprite } from "@reloop/ui/icons-sprite";
import localFont from "next/font/local";
import type { ReactNode } from "react";

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
	adjustFontFallback: "Arial",
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={cn(
				"touch-manipulation scroll-smooth antialiased",
				openRunde.className,
				openRunde.variable,
			)}
			suppressHydrationWarning
		>
			<body
				className="flex min-h-screen flex-col overflow-x-hidden bg-bg-weak-50 text-fd-foreground dark:bg-black"
				suppressHydrationWarning
			>
				<PostHogProvider>
					<ThemeProvider>{children}</ThemeProvider>
					<IconsSprite />
				</PostHogProvider>
			</body>
		</html>
	);
}
