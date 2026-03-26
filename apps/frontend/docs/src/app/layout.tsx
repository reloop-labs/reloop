import "../app/global.css";
import { IconsSprite } from "@reloop/ui/icon";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={cn("touch-manipulation scroll-smooth antialiased")}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col">
				<RootProvider>{children}</RootProvider>
				<IconsSprite />
			</body>
		</html>
	);
}
