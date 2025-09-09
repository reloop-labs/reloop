import "@dev/app/global.css";
import { cn } from "@dev/lib/cn";
import { IconsSprite } from "@ui/components/icon";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

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
