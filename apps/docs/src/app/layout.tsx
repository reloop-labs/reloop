import "@/app/global.css";
import { IconsSprite } from "@reloop/ui/components/icon";
import { RootProvider } from "fumadocs-ui/provider";
import {
	Geist_Mono as createMono,
	Geist as createSans,
} from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sans = createSans({
	subsets: ["latin"],
	variable: "--font-sans",
	weight: "variable",
});

const mono = createMono({
	subsets: ["latin"],
	variable: "--font-mono",
	weight: "variable",
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={cn(
				"touch-manipulation scroll-smooth font-sans antialiased",
				sans.variable,
				mono.variable,
			)}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col">
				<RootProvider>{children}</RootProvider>
				<IconsSprite />
			</body>
		</html>
	);
}
