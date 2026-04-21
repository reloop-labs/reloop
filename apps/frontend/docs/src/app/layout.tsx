import "../app/global.css";
import { IconsSprite } from "@reloop/ui/icon";

import localFont from "next/font/local";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

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
			<body className="flex min-h-screen flex-col">
				{children}
				<IconsSprite />
			</body>
		</html>
	);
}
