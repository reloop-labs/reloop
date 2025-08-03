import "@/app/global.css";
import { IconsSprite } from "@reloop/ui/components/icon";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

const inter = Inter({
	subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex min-h-screen flex-col">
				<RootProvider>
					<DocsLayout
						tree={source.pageTree}
						{...baseOptions}
						nav={{ ...baseOptions.nav, mode: "top" }}
					>
						{children}
					</DocsLayout>
				</RootProvider>
				<IconsSprite />
			</body>
		</html>
	);
}
